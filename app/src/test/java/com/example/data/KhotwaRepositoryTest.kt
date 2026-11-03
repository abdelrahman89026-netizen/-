package com.example.data

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Test

class KhotwaRepositoryTest {

    @Test
    fun testJourneyModelDefaults() {
        val journey = KhotwaJourneyDoc(
            id = "test_1",
            userId = "user_1",
            title = "تجديد بطاقة الرقم القومي",
            status = "IN_PROGRESS",
            progress = 50L
        )

        assertEquals("test_1", journey.id)
        assertEquals("user_1", journey.userId)
        assertEquals("تجديد بطاقة الرقم القومي", journey.title)
        assertEquals(50L, journey.progress)
        assertNotNull(journey.stepsJson)
    }

    @Test
    fun testDocumentRecordDefaults() {
        val doc = KhotwaDocumentRecord(
            id = "doc_1",
            userId = "user_1",
            fileName = "passport_notice.pdf",
            summary = "إشعار تجديد جواز السفر"
        )

        assertEquals("doc_1", doc.id)
        assertEquals("passport_notice.pdf", doc.fileName)
        assertEquals("إشعار تجديد جواز السفر", doc.summary)
    }
}
