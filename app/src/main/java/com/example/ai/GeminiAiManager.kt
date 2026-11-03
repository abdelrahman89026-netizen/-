package com.example.ai

import android.graphics.Bitmap
import android.util.Log
import com.google.firebase.Firebase
import com.google.firebase.ai.ai
import com.google.firebase.ai.type.Content
import com.google.firebase.ai.type.ImagePart
import com.google.firebase.ai.type.TextPart
import com.google.firebase.ai.type.generationConfig
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeout

private const val TAG = "GeminiAiManager"

class GeminiAiManager {

    private val generalModel by lazy {
        val sysInstruction = Content(
            role = "system",
            parts = listOf(
                TextPart(
                    """
                    أنت «خُطوة AI» — المساعد الذكي لإنجاز الخدمات والإجراءات والمستندات في العالم العربي، مع تركيز خاص وعميق على الإجراءات في مصر.
                    شخصيتك:
                    - ذكي، دقيق، هادئ وودود دون مبالغة.
                    - تفهم اللهجة المصرية والعربية الفصحى بدقة بالغة.
                    - تشرح المصطلحات المعقدة بأسلوب مبسط وعملي.
                    - لا تخترع أوراقًا أو رسومًا أو مواعيد؛ إذا كانت المعلومة غير مؤكدة، اذكر بوضوح: «هذه المعلومة تحتاج إلى تحقق من الجهة المختصة».
                    - تركز على الإنجاز العملي: من السؤال إلى خطة، ومن الخطة إلى قائمة مهام، ومن المهام إلى المتابعة.
                    - قدم إجاباتك بتنسيق واضح وسهل القراءة بنقاط أو خطوات رقمية.
                    """.trimIndent()
                )
            )
        )

        Firebase.ai.generativeModel(
            modelName = "gemini-3.8-flash",
            generationConfig = null,
            safetySettings = null,
            tools = null,
            toolConfig = null,
            systemInstruction = sysInstruction
        )
    }

    private val jsonModel by lazy {
        val config = generationConfig {
            responseMimeType = "application/json"
        }
        Firebase.ai.generativeModel(
            modelName = "gemini-3.8-flash",
            generationConfig = config
        )
    }

    suspend fun askAssistant(prompt: String): Result<String> = withContext(Dispatchers.IO) {
        return@withContext try {
            val response = withTimeout(60_000L) {
                generalModel.generateContent(prompt)
            }
            val text = response.text
            if (!text.isNullOrBlank()) {
                Result.success(text)
            } else {
                Result.failure(IllegalStateException("لم يتم استلام رد من النموذج."))
            }
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Log.e(TAG, "askAssistant error", e)
            Result.failure(e)
        }
    }

    fun streamAssistant(prompt: String): Flow<String> = flow {
        withTimeout(60_000L) {
            generalModel.generateContentStream(prompt).collect { chunk ->
                val chunkText = chunk.text.orEmpty()
                if (chunkText.isNotEmpty()) {
                    emit(chunkText)
                }
            }
        }
    }

    suspend fun analyzeDocument(bitmap: Bitmap, userPrompt: String): Result<String> = withContext(Dispatchers.IO) {
        return@withContext try {
            val prompt = if (userPrompt.isNotBlank()) userPrompt else """
                حلل هذا المستند بدقة واستخرج الآتي باللغة العربية:
                1. نوع المستند وملخص مبسط لمحتواه.
                2. ما المطلوب تحديدًا من حامل المستند أو المواطن؟
                3. التواريخ والمواعيد المهمة أو فترات السماح المذكورة.
                4. الجهات والوزارات المعنية.
                5. ملاحظات هامة أو أوراق يجب تجهيزها بناءً على هذا المستند.
            """.trimIndent()

            val inputContent = Content(
                role = "user",
                parts = listOf(
                    ImagePart(bitmap),
                    TextPart(prompt)
                )
            )

            val response = withTimeout(60_000L) {
                generalModel.generateContent(listOf(inputContent))
            }
            val text = response.text
            if (!text.isNullOrBlank()) {
                Result.success(text)
            } else {
                Result.failure(IllegalStateException("تعذر تحليل المستند."))
            }
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Log.e(TAG, "analyzeDocument error", e)
            Result.failure(e)
        }
    }

    suspend fun generateJourneyPlanJson(userGoal: String): Result<String> = withContext(Dispatchers.IO) {
        return@withContext try {
            val prompt = """
                أنت محرك التخطيط الذكي لتطبيق «خُطوة AI».
                حوّل هذا الهدف أو الإجراء: "$userGoal"
                إلى خطة إنجاز منظمة بصيغة JSON حصرية بدون أي نصوص قبلها أو بعدها.
                الهيكل المطلوب:
                {
                  "title": "عنوان الإجراء الدقيق",
                  "category": "CIVIC أو EDUCATION أو PERSONAL أو WORK",
                  "description": "وصف عملي وموجز للإجراء",
                  "estimatedTime": "المدة التقريبية المقدرة",
                  "steps": [
                    {
                      "id": "s1",
                      "title": "عنوان الخطوة",
                      "description": "شرح الخطوة بالتفصيل وما تحتاجه",
                      "isPrerequisite": true,
                      "estimatedDays": 1,
                      "tips": "نصيحة ذهبية لتوفير الوقت أو تجنب الزحام"
                    }
                  ],
                  "requiredDocuments": [
                    { "name": "اسم المستند", "isRequired": true, "notes": "أصل وصورة أو شروط خاصة" }
                  ],
                  "officialSources": [
                    { "name": "الجهة الرسمية (مثال: بوابة مصر الرقمية)", "url": "الرابط الرسمي إن وجد" }
                  ],
                  "beforeYouGoChecklist": [
                    "تأكد من إحضار كذا", "تأكد من مواعيد العمل الرسمية"
                  ]
                }
            """.trimIndent()

            val response = withTimeout(60_000L) {
                jsonModel.generateContent(prompt)
            }
            val text = response.text
            if (!text.isNullOrBlank()) {
                Result.success(text)
            } else {
                Result.failure(IllegalStateException("لم يتم استلام خطة JSON."))
            }
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Log.e(TAG, "generateJourneyPlanJson error", e)
            Result.failure(e)
        }
    }
}
