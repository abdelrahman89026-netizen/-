package com.example

import android.annotation.SuppressLint
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.os.Bundle
import android.util.Base64
import android.util.Log
import android.view.ViewGroup
import android.webkit.PermissionRequest
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.systemBarsPadding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.viewinterop.AndroidView
import com.example.bridge.KhotwaAndroidBridge
import com.example.ui.theme.MyApplicationTheme
import org.json.JSONObject
import java.io.ByteArrayOutputStream

class MainActivity : ComponentActivity() {

    private val TAG = "MainActivity"
    private var webViewInstance: WebView? = null
    private var filePathCallback: ValueCallback<Array<Uri>>? = null

    // Google Play Policy compliant zero-permission Photo Picker
    private val pickVisualMediaLauncher = registerForActivityResult(
        ActivityResultContracts.PickVisualMedia()
    ) { uri: Uri? ->
        if (uri != null) {
            handleImageUri(uri)
            filePathCallback?.onReceiveValue(arrayOf(uri))
        } else {
            filePathCallback?.onReceiveValue(null)
        }
        filePathCallback = null
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Mandatory App Check Intent wiring before setContent or Firebase calls
        configureAppCheck(this, intent)

        enableEdgeToEdge()

        setContent {
            MyApplicationTheme {
                KhotwaMainScreen(
                    onPickVisualMedia = {
                        pickVisualMediaLauncher.launch(
                            PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)
                        )
                    },
                    onRegisterWebView = { wv ->
                        webViewInstance = wv
                    }
                )
            }
        }
    }

    private fun handleImageUri(uri: Uri) {
        try {
            contentResolver.openInputStream(uri)?.use { inputStream ->
                val bitmap = BitmapFactory.decodeStream(inputStream)
                if (bitmap != null) {
                    val stream = ByteArrayOutputStream()
                    // Compress to reasonable resolution for AI input
                    val scaledBitmap = if (bitmap.width > 1280 || bitmap.height > 1280) {
                        val ratio = minOf(1280f / bitmap.width, 1280f / bitmap.height)
                        Bitmap.createScaledBitmap(
                            bitmap,
                            (bitmap.width * ratio).toInt(),
                            (bitmap.height * ratio).toInt(),
                            true
                        )
                    } else {
                        bitmap
                    }
                    scaledBitmap.compress(Bitmap.CompressFormat.JPEG, 85, stream)
                    val base64 = Base64.encodeToString(stream.toByteArray(), Base64.NO_WRAP)
                    val dataUrl = "data:image/jpeg;base64,$base64"
                    val safeJson = JSONObject.quote(dataUrl)
                    webViewInstance?.evaluateJavascript(
                        "window.onNativeImagePicked && window.onNativeImagePicked($safeJson);",
                        null
                    )
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to read picked image", e)
        }
    }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun KhotwaMainScreen(
    onPickVisualMedia: () -> Unit,
    onRegisterWebView: (WebView) -> Unit
) {
    val context = LocalContext.current
    val activity = context as ComponentActivity
    val scope = rememberCoroutineScope()

    val webView = remember {
        WebView(context).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )

            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true
                allowFileAccess = true
                loadsImagesAutomatically = true
                mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                useWideViewPort = true
                loadWithOverviewMode = true
                mediaPlaybackRequiresUserGesture = false
            }

            webChromeClient = object : WebChromeClient() {
                override fun onPermissionRequest(request: PermissionRequest?) {
                    request?.grant(request.resources)
                }

                override fun onShowFileChooser(
                    webView: WebView?,
                    filePathCallback: ValueCallback<Array<Uri>>?,
                    fileChooserParams: FileChooserParams?
                ): Boolean {
                    onPickVisualMedia()
                    return true
                }
            }

            webViewClient = object : WebViewClient() {
                override fun onReceivedError(
                    view: WebView?,
                    request: WebResourceRequest?,
                    error: WebResourceError?
                ) {
                    Log.e("WebView", "Web error: ${error?.description}")
                }
            }

            val bridge = KhotwaAndroidBridge(
                activity = activity,
                webView = this,
                scope = scope,
                onPickImageRequested = onPickVisualMedia
            )
            addJavascriptInterface(bridge, "AndroidBridge")
            loadUrl("file:///android_asset/khotwa/index.html")
        }
    }

    DisposableEffect(Unit) {
        onRegisterWebView(webView)
        onDispose {
            webView.destroy()
        }
    }

    BackHandler(enabled = webView.canGoBack()) {
        webView.goBack()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .systemBarsPadding()
    ) {
        AndroidView(
            factory = { webView },
            modifier = Modifier.fillMaxSize()
        )
    }
}
