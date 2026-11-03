package com.example.bridge

import android.app.Activity
import android.content.Context
import android.graphics.BitmapFactory
import android.os.Build
import android.os.CombinedVibration
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.speech.tts.TextToSpeech
import android.util.Base64
import android.util.Log
import android.webkit.JavascriptInterface
import android.webkit.WebView
import androidx.credentials.ClearCredentialStateRequest
import androidx.credentials.CredentialManager
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import androidx.credentials.exceptions.GetCredentialCancellationException
import com.example.R
import com.example.ai.GeminiAiManager
import com.example.data.FirestoreRepository
import com.example.data.KhotwaJourneyDoc
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GetSignInWithGoogleOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential.Companion.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL
import com.google.firebase.Firebase
import com.google.firebase.auth.GoogleAuthProvider
import com.google.firebase.auth.auth
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.util.Locale

class KhotwaAndroidBridge(
    private val activity: Activity,
    private val webView: WebView,
    private val scope: CoroutineScope,
    private val onPickImageRequested: () -> Unit
) {
    private val TAG = "KhotwaAndroidBridge"
    private val credentialManager = CredentialManager.create(activity)
    private val firestoreRepo = FirestoreRepository(activity)
    private val aiManager = GeminiAiManager()

    private var textToSpeech: TextToSpeech? = null

    init {
        textToSpeech = TextToSpeech(activity) { status ->
            if (status == TextToSpeech.SUCCESS) {
                val localeAr = Locale("ar")
                textToSpeech?.language = localeAr
            }
        }
    }

    private fun runJs(code: String) {
        activity.runOnUiThread {
            webView.evaluateJavascript(code, null)
        }
    }

    @JavascriptInterface
    fun getUserInfo(): String {
        val user = Firebase.auth.currentUser
        val json = JSONObject()
        if (user != null) {
            json.put("isSignedIn", true)
            json.put("uid", user.uid)
            json.put("displayName", user.displayName ?: "مستخدم خُطوة")
            json.put("email", user.email ?: "")
            json.put("photoUrl", user.photoUrl?.toString() ?: "")
        } else {
            json.put("isSignedIn", false)
        }
        return json.toString()
    }

    @JavascriptInterface
    fun signInWithGoogle() {
        val clientId = try {
            activity.getString(R.string.default_web_client_id)
        } catch (e: Exception) {
            Log.e(TAG, "Missing default_web_client_id", e)
            val errJson = JSONObject().apply {
                put("success", false)
                put("error", "Google Client ID configuration is missing.")
            }
            runJs("window.onAuthResult && window.onAuthResult(${JSONObject.quote(errJson.toString())})")
            return
        }

        val signInOption = GetSignInWithGoogleOption.Builder(serverClientId = clientId).build()
        val request = GetCredentialRequest.Builder().addCredentialOption(signInOption).build()

        scope.launch {
            try {
                val result = credentialManager.getCredential(activity, request)
                val credential = result.credential
                if (credential is CustomCredential && credential.type == TYPE_GOOGLE_ID_TOKEN_CREDENTIAL) {
                    val googleIdToken = GoogleIdTokenCredential.createFrom(credential.data).idToken
                    val authCredential = GoogleAuthProvider.getCredential(googleIdToken, null)
                    val authResult = Firebase.auth.signInWithCredential(authCredential).await()
                    val user = authResult.user

                    val resJson = JSONObject().apply {
                        put("success", true)
                        put("uid", user?.uid ?: "")
                        put("displayName", user?.displayName ?: "مستخدم خُطوة")
                        put("email", user?.email ?: "")
                        put("photoUrl", user?.photoUrl?.toString() ?: "")
                    }
                    runJs("window.onAuthResult && window.onAuthResult(${JSONObject.quote(resJson.toString())})")
                } else {
                    val errJson = JSONObject().apply {
                        put("success", false)
                        put("error", "نوع بيانات الاعتماد غير مدعوم.")
                    }
                    runJs("window.onAuthResult && window.onAuthResult(${JSONObject.quote(errJson.toString())})")
                }
            } catch (e: GetCredentialCancellationException) {
                Log.w(TAG, "Google Sign-In flow cancelled or dismissed: ${e.message}", e)
                val errJson = JSONObject().apply {
                    put("success", false)
                    put("error", "تم إلغاء تسجيل الدخول.")
                }
                runJs("window.onAuthResult && window.onAuthResult(${JSONObject.quote(errJson.toString())})")
            } catch (e: Exception) {
                Log.e(TAG, "Sign-in failed", e)
                val errJson = JSONObject().apply {
                    put("success", false)
                    put("error", e.localizedMessage ?: "فشل تسجيل الدخول.")
                }
                runJs("window.onAuthResult && window.onAuthResult(${JSONObject.quote(errJson.toString())})")
            }
        }
    }

    @JavascriptInterface
    fun signOut() {
        Firebase.auth.signOut()
        scope.launch {
            try {
                credentialManager.clearCredentialState(ClearCredentialStateRequest())
            } catch (e: Exception) {
                Log.e(TAG, "Failed to clear credentials", e)
            }
            val resJson = JSONObject().apply {
                put("success", true)
                put("isSignedIn", false)
            }
            runJs("window.onAuthResult && window.onAuthResult(${JSONObject.quote(resJson.toString())})")
        }
    }

    @JavascriptInterface
    fun askGemini(prompt: String, callbackId: String) {
        scope.launch {
            val result = aiManager.askAssistant(prompt)
            result.onSuccess { text ->
                val safeText = JSONObject.quote(text)
                runJs("window.onGeminiResponse && window.onGeminiResponse('$callbackId', true, $safeText)")
            }.onFailure { error ->
                val safeError = JSONObject.quote(error.localizedMessage ?: "حدث خطأ أثناء معالجة الطلب.")
                runJs("window.onGeminiResponse && window.onGeminiResponse('$callbackId', false, $safeError)")
            }
        }
    }

    @JavascriptInterface
    fun generateJourney(goal: String, callbackId: String) {
        scope.launch {
            val result = aiManager.generateJourneyPlanJson(goal)
            result.onSuccess { jsonStr ->
                val safeJson = JSONObject.quote(jsonStr)
                runJs("window.onJourneyGenerated && window.onJourneyGenerated('$callbackId', true, $safeJson)")
            }.onFailure { error ->
                val safeErr = JSONObject.quote(error.localizedMessage ?: "فشل إنشاء الخطة.")
                runJs("window.onJourneyGenerated && window.onJourneyGenerated('$callbackId', false, $safeErr)")
            }
        }
    }

    @JavascriptInterface
    fun analyzeDocument(base64Image: String, prompt: String, callbackId: String) {
        scope.launch(Dispatchers.IO) {
            try {
                val cleanBase64 = if (base64Image.contains(",")) {
                    base64Image.substringAfter(",")
                } else {
                    base64Image
                }
                val bytes = Base64.decode(cleanBase64, Base64.DEFAULT)
                val bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
                if (bitmap == null) {
                    val safeErr = JSONObject.quote("تعذر فك تشفير الصورة.")
                    runJs("window.onDocumentAnalyzed && window.onDocumentAnalyzed('$callbackId', false, $safeErr)")
                    return@launch
                }
                val result = aiManager.analyzeDocument(bitmap, prompt)
                result.onSuccess { text ->
                    val safeText = JSONObject.quote(text)
                    runJs("window.onDocumentAnalyzed && window.onDocumentAnalyzed('$callbackId', true, $safeText)")
                }.onFailure { error ->
                    val safeErr = JSONObject.quote(error.localizedMessage ?: "فشل تحليل المستند.")
                    runJs("window.onDocumentAnalyzed && window.onDocumentAnalyzed('$callbackId', false, $safeErr)")
                }
            } catch (e: Exception) {
                Log.e(TAG, "analyzeDocument error", e)
                val safeErr = JSONObject.quote(e.localizedMessage ?: "خطأ أثناء معالجة الصورة.")
                runJs("window.onDocumentAnalyzed && window.onDocumentAnalyzed('$callbackId', false, $safeErr)")
            }
        }
    }

    @JavascriptInterface
    fun syncJourney(journeyJsonStr: String, callbackId: String) {
        if (Firebase.auth.currentUser == null) {
            val res = JSONObject().apply {
                put("success", false)
                put("message", "يجب تسجيل الدخول لمزامنة الرحلات سحابيًا.")
            }
            runJs("window.onSyncResult && window.onSyncResult('$callbackId', false, ${JSONObject.quote(res.toString())})")
            return
        }

        scope.launch {
            try {
                val obj = JSONObject(journeyJsonStr)
                val journeyDoc = KhotwaJourneyDoc(
                    id = obj.optString("id"),
                    userId = Firebase.auth.currentUser?.uid ?: "",
                    title = obj.optString("title", "رحلة جديدة"),
                    description = obj.optString("description", ""),
                    category = obj.optString("category", "CIVIC"),
                    status = obj.optString("status", "IN_PROGRESS"),
                    progress = obj.optLong("progress", 0L),
                    stepsJson = obj.optString("stepsJson", "[]"),
                    documentsJson = obj.optString("documentsJson", "[]"),
                    officialSourcesJson = obj.optString("officialSourcesJson", "[]"),
                    deadlinesJson = obj.optString("deadlinesJson", "[]"),
                    notes = obj.optString("notes", "")
                )
                val saveRes = firestoreRepo.saveJourney(journeyDoc)
                if (saveRes.isSuccess) {
                    val res = JSONObject().apply {
                        put("success", true)
                        put("journeyId", journeyDoc.id)
                    }
                    runJs("window.onSyncResult && window.onSyncResult('$callbackId', true, ${JSONObject.quote(res.toString())})")
                } else {
                    val res = JSONObject().apply {
                        put("success", false)
                        put("error", saveRes.exceptionOrNull()?.localizedMessage ?: "فشل الحفظ.")
                    }
                    runJs("window.onSyncResult && window.onSyncResult('$callbackId', false, ${JSONObject.quote(res.toString())})")
                }
            } catch (e: Exception) {
                val res = JSONObject().apply {
                    put("success", false)
                    put("error", e.localizedMessage ?: "فشل المزامنة.")
                }
                runJs("window.onSyncResult && window.onSyncResult('$callbackId', false, ${JSONObject.quote(res.toString())})")
            }
        }
    }

    @JavascriptInterface
    fun pickDocument() {
        activity.runOnUiThread {
            onPickImageRequested()
        }
    }

    @JavascriptInterface
    fun speakArabicText(text: String) {
        activity.runOnUiThread {
            textToSpeech?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "KhotwaTTS")
        }
    }

    @JavascriptInterface
    fun stopSpeaking() {
        activity.runOnUiThread {
            textToSpeech?.stop()
        }
    }

    @JavascriptInterface
    fun vibrateHaptic(type: String) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vibratorManager = activity.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
                val effect = when (type) {
                    "light" -> VibrationEffect.createPredefined(VibrationEffect.EFFECT_TICK)
                    "medium" -> VibrationEffect.createPredefined(VibrationEffect.EFFECT_CLICK)
                    "success" -> VibrationEffect.createPredefined(VibrationEffect.EFFECT_HEAVY_CLICK)
                    else -> VibrationEffect.createOneShot(30, VibrationEffect.DEFAULT_AMPLITUDE)
                }
                vibratorManager?.defaultVibrator?.vibrate(effect)
            } else {
                @Suppress("DEPRECATION")
                val vibrator = activity.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
                @Suppress("DEPRECATION")
                vibrator?.vibrate(30)
            }
        } catch (e: Exception) {
            Log.w(TAG, "Haptic error", e)
        }
    }
}
