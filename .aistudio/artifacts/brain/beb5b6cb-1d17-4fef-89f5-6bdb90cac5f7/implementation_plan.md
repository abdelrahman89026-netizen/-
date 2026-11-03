# Khotwa AI (خُطوة) — Architecture & Implementation Plan

A comprehensive, Arabic-first AI life and public services assistant that bridges Egyptian civic, educational, and personal procedures into clear, step-by-step actionable journeys powered by Google Gemini and synced with Firebase.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The user confirmed building a **Hybrid Web Architecture inside Android** with **Firebase Firestore Cloud Sync & Google Sign-In**, focusing primarily on **Egyptian educational & public civic procedures** as well as personal life management.

- **Confirmed Decision 1 (Architecture)**: Hybrid Web Architecture within Android. The client-side experience is crafted as an ultra-fast, offline-ready Apple-inspired web application bundled in Android assets (`assets/khotwa/`) and loaded inside a hardened Jetpack Compose `WebView` container with bidirectional JavaScript interfaces (`AndroidBridge`).
- **Confirmed Decision 2 (Data Storage & Authentication)**: Firebase Firestore cloud persistence scoped per authenticated user (`users/{uid}/...`), combined with Google Sign-In via Android Jetpack `CredentialManager` and local cache fallbacks for offline resilience.
- **Confirmed Decision 3 (AI Engine & Multimodal)**: Gemini AI engine for smart journey breakdowns, Egyptian procedure clarifications, multi-format document analysis (PDF/image uploads), "Before You Go" readiness audit, and audio speech-to-text / text-to-speech workflows.

---

## 1. Overview & Core Concept

**Khotwa AI (خُطوة) — من الحيرة إلى الإنجاز** is designed specifically for Arabic-speaking citizens, students, parents, and everyday individuals who need to navigate complex government services, schooling admissions, official paperwork, and personal milestones.

- **Target Persona**: Egyptian citizens renewing IDs, passports, or licenses; parents applying for school/university admissions; job seekers; and anyone feeling overwhelmed by bureaucratic paperwork or multistep personal goals.
- **Core Value Proposition**: Rather than returning overwhelming walls of text, Khotwa acts as an active companion: diagnosing what you have, discovering missing prerequisites, constructing structured checklist journeys, verifying readiness before leaving home ("قبل ما تتحرك"), and extracting action items directly from uploaded documents.

---

## 2. User Experience & Visual Design

### Visual Identity & Theme (Apple Design Language)
Inspired by iOS 18/26, Apple Reminders, Apple Health, and Apple Intelligence:
- **Color Palette (Light Mode)**:
  - Background: `#F5F6FA`
  - Elevated Cards / Surfaces: `#FFFFFF`
  - Primary Accent: `#2678F5` (iOS Blue)
  - Secondary Accent: `#69A7FF` (Sky Blue)
  - Text Primary: `#15171C`
  - Text Secondary: `#858A96`
  - Subtle Borders: `rgba(20, 30, 50, 0.08)`
  - Success Pill: `#34C759` | Warning Pill: `#FF9500`
- **Color Palette (Dark Mode)**:
  - Deep Background: `#090D15`
  - Elevated Surfaces: `#141B27` and `#1B2533`
  - Primary Accent: `#4A91FF`
  - Text Primary: `#F5F7FB`
  - Text Secondary: `#9AA6B6`
- **Typography**: Native Apple typography hierarchy (`SF Pro Display`, `SF Pro Text`, combined with crisp `Noto Sans Arabic` and system Arabic fonts) featuring precise letter-spacing, fluid RTL paragraph flow, and legible numeral presentation.
- **Micro-Interactions & Components**:
  - **Dynamic Island Activity Pill**: An interactive floating pill at the top of the screen tracking active journeys, document processing states, or voice recording.
  - **Progress Rings & Checkmark Animations**: Circular Apple Fitness-style progress rings for journey completion and spring-damped checkmarks upon completing steps.
  - **Frosted Glass Navigation & Bottom Sheets**: Floating translucent navigation bar and smooth spring-action bottom sheets for adding tasks, asking quick questions, or filtering.
  - **Before You Go (قبل ما تتحرك) Readiness Meter**: Visual status cards classifying your readiness (جاهز تمامًا / يحتاج استكمال / يحتاج تحقق) with clear warning pills.

### Key User Flows
1. **Onboarding & Guest/Google Sign-In**: Introduces Khotwa's 3-step philosophy (*افهم، اعرف خطوتك، أنجز بثقة*), with one-tap Google Sign-In and guest exploratory mode.
2. **Dashboard & Smart Prompt Bar**: Personalized Arabic greeting with hijri/gregorian date, floating Dynamic Island, quick-action chips (e.g. *تجديد بطاقة الرقم القومي*, *التقديم في رياض الأطفال*, *استخراج جواز سفر*), and a prominent voice/camera input bar.
3. **AI Smart Journey Builder**: Interactive conversational breakdown of any goal into sequenced phases, required paperwork, estimated fees, and deadlines.
4. **Document Intelligence Center**: Upload or snap photos of official notices, forms, or contracts; Gemini extracts summary, required user actions, dates, and adds them directly to the active journey.
5. **Smart Discover & Knowledge Navigator**: Curated repository of verified Egyptian public service pathways with source links, official government links, and verification dates.

---

## 3. Key Product Decisions & Trade-Offs

- **Hybrid Web Architecture over Pure Native Compose UI**:
  - *Chosen Approach*: Deliver the core UI through an embedded modern HTML5/JS/CSS single-page application loaded from local assets, wrapped by an Android Jetpack Compose host.
  - *Why*: Delivers 100% faithful Apple iOS frosted glassmorphism, fluid spring physics, dynamic RTL typography, and rapid multi-screen navigation, while retaining native Android platform integration (camera hardware, photo picker, Android Credential Manager Google Sign-In, and background sync).
- **Two-Tier Storage (Cloud Firestore + Local IndexedDB/LocalStorage Cache)**:
  - *Chosen Approach*: When signed in, records synchronize with Cloud Firestore under `/users/{uid}/journeys` and `/users/{uid}/documents`. For guest users or offline sessions, changes persist locally in client storage with seamless sync upon authentication.
  - *Why*: Guarantees instant interaction with zero network lag, while preserving full multi-device durability for registered users.
- **Gemini Multimodal Processing Pipeline**:
  - *Chosen Approach*: Route AI queries through structured JSON contracts with `gemini-3.8-flash` for journeys, chat advice, and document inspection.
  - *Why*: Ensures prompt responses with zero markdown formatting breakage, allowing direct binding to checklist items and progress meters.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Khotwa Android Container                        │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                 Jetpack Compose Host Activity                  │   │
│   │  • Edge-to-edge window insets padding & status bar styling    │   │
│   │  • Native Android Photo Picker & Camera Intent Launcher        │   │
│   │  • Jetpack Credential Manager (Google Sign-In)                 │   │
│   │  • Native AndroidBridge (@JavascriptInterface)                │   │
│   └────────────────────────────────┬───────────────────────────────┘   │
│                                    │ JavaScript Interface              │
│   ┌────────────────────────────────▼───────────────────────────────┐   │
│   │                 Khotwa Hybrid Web Client (SPA)                 │   │
│   │                                                                │   │
│   │  ┌───────────────────────┐  ┌───────────────────────────────┐  │   │
│   │  │   Apple-Inspired UI   │  │     State & Navigation        │  │   │
│   │  │ • RTL Arabic Layout   │  │ • Active Tab (Home/Journeys/  │  │   │
│   │  │ • Dynamic Island Pill │  │   AI Chat/Docs/Profile)       │  │   │
│   │  │ • Frosted Glass M3/iOS│  │ • Active Journey Flow         │  │   │
│   │  │ • Progress Rings      │  │ • Audio Recording & Speech    │  │   │
│   │  └───────────┬───────────┘  └───────────────┬───────────────┘  │   │
│   │              │                              │                  │   │
│   │  ┌───────────▼──────────────────────────────▼───────────────┐  │   │
│   │  │                 Khotwa Intelligence Core                 │  │   │
│   │  │ • Journey Generator (JSON Schema)                        │  │   │
│   │  │ • Document Inspector & OCR Extractor                     │  │   │
│   │  │ • "Before You Go" Readiness Auditor                      │  │   │
│   │  │ • Egyptian Civic Procedure Knowledge Navigator           │  │   │
│   │  └──────────────────────────┬───────────────────────────────┘  │   │
│   └─────────────────────────────┼──────────────────────────────────┘   │
│                                 │                                      │
│   ┌─────────────────────────────▼──────────────────────────────────┐   │
│   │                      Persistence Layer                         │   │
│   │  • Local Storage & Offline Cache (Immediate UI State)          │   │
│   │  • Firebase Firestore Database (users/{uid}/journeys, docs)    │   │
│   │  • Gemini 3.8 Flash Engine (Multimodal Analysis & Reasoning)   │   │
│   └────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Schema Overview (Firestore & Client Store)
- **User Profile (`users/{uid}`)**: `uid`, `displayName`, `email`, `language`, `theme`, `createdAt`
- **Journeys (`users/{uid}/journeys/{journeyId}`)**:
  - `id`: Unique string
  - `title`: e.g. "تجديد بطاقة الرقم القومي المصرية"
  - `category`: `CIVIC` | `EDUCATION` | `PERSONAL` | `WORK`
  - `status`: `NOT_STARTED` | `IN_PROGRESS` | `COMPLETED`
  - `progress`: `0` to `100` percent
  - `steps`: Array of `{ id, title, description, isCompleted, isPrerequisite, requiredDocs, estimatedTime, tips }`
  - `documents`: Array of `{ name, status: 'READY'|'MISSING'|'VERIFIED', notes }`
  - `officialSources`: Array of `{ title, url, verifiedDate, entity }`
  - `deadlines`: Array of `{ title, dueDate, isCritical }`
- **Documents (`users/{uid}/documents/{docId}`)**:
  - `id`: Unique string
  - `fileName`, `fileType`, `uploadedAt`
  - `summary`: Plain-Arabic simplified explanation
  - `extractedRequirements`: List of extracted mandatory tasks
  - `extractedDates`: Important dates found in document
  - `authenticityDisclaimer`: Note clarifying this is AI extraction, not legal certification

---

## 5. Verification & Acceptance Criteria
1. **Compilation**: Clean Gradle build via `compile_applet`.
2. **Apple Design Language**: Flawless frosted navigation, glass cards, dynamic island pill, Apple-like spring transitions, and native Arabic typography.
3. **Core Interactive Flows**:
   - Creating a journey from natural Arabic prompt (e.g., "عايز أجدد باسبور مستعجل").
   - Toggling tasks updates progress ring and journey status immediately.
   - Uploading or selecting an image/document runs AI analysis and displays extracted tasks.
   - "Before You Go" (قبل ما تتحرك) checks all prerequisites and issues a readiness diagnostic.
   - Voice assistant records audio query or speaks answers via Arabic TTS.
   - Light and Dark mode toggle seamlessly.
   - Discover tab provides verified guides for Egyptian and Arab services.
