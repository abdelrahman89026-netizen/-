package com.example.data

import android.content.Context
import com.example.R
import com.google.firebase.Firebase
import com.google.firebase.auth.auth
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.snapshots
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.tasks.await

class FirestoreRepository(
    private val db: FirebaseFirestore
) {
    constructor(context: Context) : this(
        FirebaseFirestore.getInstance(
            context.applicationContext.getString(R.string.firestore_database_id)
        )
    )

    private val auth = Firebase.auth

    fun requireUserId(): String {
        return auth.currentUser?.uid
            ?: throw IllegalStateException("User must be signed in with Google before accessing Firestore.")
    }

    fun observeUserJourneys(): Flow<List<KhotwaJourneyDoc>> = flow {
        val uid = requireUserId()
        val path = "users/$uid/journeys"
        db.collection("users").document(uid).collection("journeys")
            .snapshots()
            .map { snapshot -> snapshot.toObjects(KhotwaJourneyDoc::class.java) }
            .catch { error ->
                if (error is Exception) handleFirestoreError(error, OperationType.LIST, path)
                throw error
            }
            .collect { emit(it) }
    }

    suspend fun saveJourney(journey: KhotwaJourneyDoc): Result<Unit> {
        return try {
            val uid = requireUserId()
            val targetId = if (journey.id.isNotBlank()) journey.id else "journey_${System.currentTimeMillis()}"
            val docRef = db.collection("users").document(uid).collection("journeys").document(targetId)
            val data = hashMapOf(
                "id" to targetId,
                "userId" to uid,
                "title" to journey.title,
                "description" to journey.description,
                "category" to journey.category,
                "status" to journey.status,
                "progress" to journey.progress,
                "stepsJson" to journey.stepsJson,
                "documentsJson" to journey.documentsJson,
                "officialSourcesJson" to journey.officialSourcesJson,
                "deadlinesJson" to journey.deadlinesJson,
                "notes" to journey.notes,
                "createdAt" to (journey.createdAt ?: FieldValue.serverTimestamp()),
                "updatedAt" to FieldValue.serverTimestamp()
            )
            docRef.set(data).await()
            Result.success(Unit)
        } catch (e: Exception) {
            handleFirestoreError(e, OperationType.UPDATE, "users/${auth.currentUser?.uid}/journeys/${journey.id}")
            Result.failure(e)
        }
    }

    suspend fun deleteJourney(journeyId: String): Result<Unit> {
        return try {
            val uid = requireUserId()
            val docRef = db.collection("users").document(uid).collection("journeys").document(journeyId)
            docRef.delete().await()
            Result.success(Unit)
        } catch (e: Exception) {
            handleFirestoreError(e, OperationType.DELETE, "users/${auth.currentUser?.uid}/journeys/$journeyId")
            Result.failure(e)
        }
    }

    suspend fun saveDocumentRecord(record: KhotwaDocumentRecord): Result<Unit> {
        return try {
            val uid = requireUserId()
            val targetId = if (record.id.isNotBlank()) record.id else "doc_${System.currentTimeMillis()}"
            val docRef = db.collection("users").document(uid).collection("documents").document(targetId)
            val data = hashMapOf(
                "id" to targetId,
                "userId" to uid,
                "fileName" to record.fileName,
                "fileType" to record.fileType,
                "summary" to record.summary,
                "extractedRequirementsJson" to record.extractedRequirementsJson,
                "extractedDatesJson" to record.extractedDatesJson,
                "createdAt" to (record.createdAt ?: FieldValue.serverTimestamp()),
                "updatedAt" to FieldValue.serverTimestamp()
            )
            docRef.set(data).await()
            Result.success(Unit)
        } catch (e: Exception) {
            handleFirestoreError(e, OperationType.CREATE, "users/${auth.currentUser?.uid}/documents")
            Result.failure(e)
        }
    }
}
