package com.example.data

import android.util.Log
import com.google.firebase.firestore.FirebaseFirestoreException
import org.json.JSONObject

enum class OperationType {
    CREATE, READ, UPDATE, DELETE, LIST
}

fun handleFirestoreError(exception: Exception, operation: OperationType, path: String) {
    val errorDetails = JSONObject().apply {
        put("timestamp", System.currentTimeMillis())
        put("operation", operation.name)
        put("targetPath", path)
        put("exceptionClass", exception.javaClass.simpleName)
        put("message", exception.localizedMessage ?: "Unknown Firestore error")
        if (exception is FirebaseFirestoreException) {
            put("code", exception.code.name)
        }
    }
    Log.e("FirestoreError", errorDetails.toString(), exception)
}
