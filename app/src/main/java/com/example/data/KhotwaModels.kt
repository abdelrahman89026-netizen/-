package com.example.data

import com.google.firebase.Timestamp
import com.google.firebase.firestore.DocumentId
import com.google.firebase.firestore.IgnoreExtraProperties
import com.google.firebase.firestore.ServerTimestamp

@IgnoreExtraProperties
data class KhotwaUserProfile(
    @DocumentId val id: String = "",
    val userId: String = "",
    val displayName: String = "",
    val email: String = "",
    val photoUrl: String = "",
    val language: String = "ar",
    val theme: String = "light",
    @ServerTimestamp val createdAt: Timestamp? = null,
    @ServerTimestamp val updatedAt: Timestamp? = null
)

@IgnoreExtraProperties
data class KhotwaJourneyDoc(
    @DocumentId val id: String = "",
    val userId: String = "",
    val title: String = "",
    val description: String = "",
    val category: String = "CIVIC",
    val status: String = "IN_PROGRESS",
    val progress: Long = 0L,
    val stepsJson: String = "[]",
    val documentsJson: String = "[]",
    val officialSourcesJson: String = "[]",
    val deadlinesJson: String = "[]",
    val notes: String = "",
    @ServerTimestamp val createdAt: Timestamp? = null,
    @ServerTimestamp val updatedAt: Timestamp? = null
)

@IgnoreExtraProperties
data class KhotwaDocumentRecord(
    @DocumentId val id: String = "",
    val userId: String = "",
    val fileName: String = "",
    val fileType: String = "IMAGE",
    val summary: String = "",
    val extractedRequirementsJson: String = "[]",
    val extractedDatesJson: String = "[]",
    @ServerTimestamp val createdAt: Timestamp? = null,
    @ServerTimestamp val updatedAt: Timestamp? = null
)
