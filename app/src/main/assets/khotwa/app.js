/**
 * Khotwa AI (خُطوة) — Core Application Logic
 * Apple iOS Human Interface Guidelines, RTL Arabic First
 * Powered by Google Gemini & Firebase Firestore
 */

// Default Curated Egyptian Services Journeys
const DEFAULT_PRESET_JOURNEYS = [
  {
    id: "egypt_national_id",
    title: "تجديد بطاقة الرقم القومي (مصر)",
    description: "إجراءات تجديد واستخراج بطاقة الرقم القومي للمواطنين في مصر بمختلف سرعات الاستمارة.",
    category: "CIVIC",
    status: "IN_PROGRESS",
    progress: 40,
    steps: [
      {
        id: "step_id_1",
        title: "شراء استمارة الرقم القومي",
        description: "شراء الاستمارة من مقر السجل المدني أو الموقع الإلكتروني (عادية 50ج، عاجلة 125ج، مميزة 175ج، VIP 305ج).",
        isCompleted: true,
        tips: "استمارة الـ VIP تستلم البطاقة خلال ساعتين فقط من مراكز قطاع الأحوال المدنية النموذجية في المولات."
      },
      {
        id: "step_id_2",
        title: "استيفاء البيانات واعتماد المهنة",
        description: "ملء بيانات الاستمارة واعتماد المهنة من جهة العمل أو النقابة المهنية أو السجل التجاري لأصحاب الأنشطة.",
        isCompleted: true,
        tips: "إذا كانت المهنة طالب أو ربة منزل أو بدون عمل، لا تحتاج لاعتماد جهة عمل."
      },
      {
        id: "step_id_3",
        title: "تجهيز الأوراق الثبوتية ومحل الإقامة",
        description: "إحضار البطاقة القديمة المنتهية، وإيصال مرافق حديث (كهرباء أو غاز أو مياه) أو عقد إيجار موثق بالشهر العقاري.",
        isCompleted: false,
        tips: "تأكد أن إيصال المرافق لم يمر عليه أكثر من 3 أشهر وموضح به العنوان بالتفصيل."
      },
      {
        id: "step_id_4",
        title: "التوجه للسجل المدني والتصوير",
        description: "تقديم الاستمارة للموظف، مطابقة البيانات، أخذ بصمات الأصابع والتقاط الصورة الحية.",
        isCompleted: false,
        tips: "ارتدِ ملابس داكنة لضمان وضوح الصورة على خلفية بيضاء معيارية."
      },
      {
        id: "step_id_5",
        title: "استلام البطاقة الجديدة في الموعد المحدد",
        description: "التوجه بالوصل المسلّم لك في الموعد المكتوب (من ساعتين وحتى 15 يومًا حسب نوع الاستمارة) واستلام البطاقة.",
        isCompleted: false,
        tips: "احتفظ بالوصل الورقي؛ لن يتم تسليم البطاقة إلا بالوصل أو بوجود صاحب الشأن شخصيًا."
      }
    ],
    documents: [
      { name: "بطاقة الرقم القومي القديمة", status: "READY", notes: "أصل البطاقة لتسليمها عند الاستلام" },
      { name: "استمارة الرقم القومي معتمدة", status: "READY", notes: "معتمدة من جهة العمل إن وجدت" },
      { name: "إيصال مرافق حديث لمحل السكن", status: "MISSING", notes: "غاز أو كهرباء أو مياه حديث" }
    ],
    officialSources: [
      { title: "بوابة وزارة الداخلية - قطاع الأحوال المدنية", url: "https://moi.gov.eg", entity: "وزارة الداخلية المصرية" },
      { title: "بوابة مصر الرقمية", url: "https://digital.gov.eg", entity: "الحكومة المصرية" }
    ],
    deadlines: [
      { title: "مهلة التجديد قبل الغرامة", dueDate: "خلال 3 أشهر من تاريخ الانتهاء", isCritical: true }
    ],
    notes: "يتم تطبيق غرامة 50 جنيه في حالة التأخر عن تجديد البطاقة بعد مرور 3 أشهر من تاريخ انتهائها."
  },
  {
    id: "egypt_passport",
    title: "استخراج وتجديد جواز السفر المميكن",
    description: "خطوات استخراج وتجديد جواز السفر المصري لأول مرة أو بعد الانتهاء.",
    category: "CIVIC",
    status: "NOT_STARTED",
    progress: 0,
    steps: [
      {
        id: "step_pass_1",
        title: "سحب استمارة جواز السفر المجانية (نموذج 29)",
        description: "التوجه لمكتب الجوازات التابع لمحل الإقامة وسحب نموذج 29 مميكن مجانًا وتعبئة البيانات.",
        isCompleted: false,
        tips: "اكتب الاسم باللغة الإنجليزية بنفس الحروف المعتمدة في وثائق السفر أو الشهادات الدولية."
      },
      {
        id: "step_pass_2",
        title: "تجهيز أصل بطاقة الرقم القومي وشهادة التجنيد",
        description: "أصل بطاقة الرقم القومي سارية (لمن هم فوق 16 عامًا)، وأصل شهادة الإعفاء أو تأدية الخدمة العسكرية للذكور.",
        isCompleted: false,
        tips: "شهادة التجنيد يجب أن تكون واضحة ولا يُعتد بصورة بدون أصل للمطابقة."
      },
      {
        id: "step_pass_3",
        title: "تجهيز 4 صور شخصية حديثة 4x6 خلفية بيضاء",
        description: "الصور يجب أن تكون حديثة بخلفية بيضاء صريحة وملامح وجه طبيعية بدون تعديل فوتوشوب.",
        isCompleted: false,
        tips: "اطلب من المصور صورًا مطابقة لمواصفات استخراج جواز السفر."
      },
      {
        id: "step_pass_4",
        title: "دفع الرسوم وتقديم الأوراق والتصوير",
        description: "سداد الرسوم عبر الخزينة، التوجه لموظف الجوازات، مطابقة الأصول وتسليم الإيصال.",
        isCompleted: false,
        tips: "جواز السفر يستغرق حوالي 3 إلى 7 أيام عمل للاستلام العادي، ويوجد مسار مستعجل."
      }
    ],
    documents: [
      { name: "أصل بطاقة الرقم القومي سارية", status: "READY", notes: "سارية المفعول" },
      { name: "4 صور شخصية 4x6 خلفية بيضاء", status: "MISSING", notes: "حديثة" },
      { name: "أصل الموقف التجنيدي للذكور", status: "MISSING", notes: "إعفاء أو تأدية" }
    ],
    officialSources: [
      { title: "الإدارة العامة للجوازات والهجرة والجنسية", url: "https://moi.gov.eg", entity: "وزارة الداخلية" }
    ],
    deadlines: [
      { title: "صلاحية الجواز", dueDate: "صالح لمدة 7 سنوات للمواطنين المصريين", isCritical: false }
    ],
    notes: "يُفضل تجديد جواز السفر قبل انتهائه بـ 6 أشهر على الأقل لتجنب رفض تأشيرات السفر."
  },
  {
    id: "egypt_school_nursery",
    title: "التقديم لرياض الأطفال والابتدائي (رسمي لغات)",
    description: "إجراءات التقديم الإلكتروني وتجهيز الملف الورقي للمدارس الرسمية والمتميزة لغات بمصر.",
    category: "EDUCATION",
    status: "IN_PROGRESS",
    progress: 25,
    steps: [
      {
        id: "step_school_1",
        title: "التسجيل الإلكتروني على بوابة التربية والتعليم",
        description: "الدخول خلال شهر يونيو على بوابة خدمات التعليم وإدخال الرقم القومي للطفل وترتيب رغبات المدارس.",
        isCompleted: true,
        tips: "اختر المدارس الأقرب للمربع السكني المسجل ببطاقة ولي الأمر لزيادة فرص القبول."
      },
      {
        id: "step_school_2",
        title: "طباعة استمارة الرغبات الإلكترونية",
        description: "حفظ وطباعة إشعار التقديم والرغبات المعتمدة من الموقع للاحتفاظ برقم الطلب.",
        isCompleted: false,
        tips: "احتفظ برقم التسجيل وكود الطالب للمتابعة الدورية للنتيجة."
      },
      {
        id: "step_school_3",
        title: "تجهيز شهادة الميلاد المميكنة وصور الطفل",
        description: "استخراج شهادة ميلاد كمبيوتر حديثة و8 صور شخصية للطفل، وبطاقة الرقم القومي للوالدين.",
        isCompleted: false,
        tips: "استخرج 3 نسخ إضافية من شهادة الميلاد المميكنة لتبقى معك."
      },
      {
        id: "step_school_4",
        title: "إجراء الفحص الطبي وبطاقة التأمين الصحي",
        description: "التوجه للوحدة الصحية أو التأمين الصحي لعمل الفحص الطبي واستخراج البطاقة الصحية المدرسية.",
        isCompleted: false,
        tips: "يشمل الفحص كشف النظر والأسنان والسمع والتطعيمات الإجبارية."
      }
    ],
    documents: [
      { name: "شهادة ميلاد كمبيوتر للطفل حديثة", status: "READY", notes: "أصل وصورتان" },
      { name: "بطاقة الرقم القومي للأب والأم", status: "READY", notes: "سارية المفعول" },
      { name: "البطاقة الصحية للطفل", status: "MISSING", notes: "من التأمين الصحي" },
      { name: "إيصال كهرباء حديث للسكن", status: "READY", notes: "إثبات النطاق الجغرافي" }
    ],
    officialSources: [
      { title: "بوابة مركز معلومات وزارة التربية والتعليم", url: "https://emis.gov.eg", entity: "وزارة التربية والتعليم" }
    ],
    deadlines: [
      { title: "موعد التقديم الإلكتروني السنوي", dueDate: "من 1 يونيو حتى 30 يونيو", isCritical: true }
    ],
    notes: "يشترط ألا يقل سن الطفل في رياض الأطفال المستوى الأول عن 4 سنوات في الأول من أكتوبر."
  }
];

// Curated Egyptian Discover Knowledge Guides
const KNOWLEDGE_GUIDES = [
  {
    id: "guide_driving_license",
    title: "استخراج رخصة قيادة خاصة لأول مرة",
    category: "CIVIC",
    badge: "مرور مصر",
    summary: "شروط استخراج رخصة خاصة: ألا يقل السن عن 18 عامًا، شهادة طبية للباطنة والنظر، اجتياز اختبار مدرسة المرور.",
    stepsSummary: "كشف طبي ◄ فتح ملف بالمرور ◄ دورة الإشارات ◄ القيادة العملية ◄ استلام الرخصة 10 سنوات.",
    source: "بوابة المرور المصرية - وزارة الداخلية",
    url: "https://traffic.moi.gov.eg",
    verifiedDate: "نوفمبر 2026"
  },
  {
    id: "guide_nursing_institute",
    title: "التقديم للمعاهد الفنية للتمريض بمصر",
    category: "EDUCATION",
    badge: "تعليم وتدريب",
    summary: "دليل شامل لشروط الالتحاق بمعاهد التمريض التابعة لوزارة الصحة والمستشفيات الجامعية بعد الإعدادية والثانوية.",
    stepsSummary: "مراجعة الحد الأدنى للمجموع ◄ سحب الملف ◄ كشف الهيئة والمقابلة ◄ الكشف الطبي ◄ قيد الدارسين.",
    source: "الإدارة المركزية للتدريب وتنمية المهن الطبية",
    url: "https://mohp.gov.eg",
    verifiedDate: "أكتوبر 2026"
  },
  {
    id: "guide_ration_card",
    title: "إضافة المواليد وفصل بطاقة التموين",
    category: "CIVIC",
    badge: "وزارة التموين",
    summary: "كيفية ضم الزوجة، فصل الأبناء المتزوجين، وإضافة مواليد الفئات الأولى بالرعاية عبر مصر الرقمية.",
    stepsSummary: "تسجيل حساب مصر الرقمية ◄ اختيار التموين ◄ إدخال الرقم القومي للطفل ◄ تأكيد الطلب ◄ استلام الرسالة.",
    source: "بوابة مصر الرقمية - وزارة التموين",
    url: "https://digital.gov.eg",
    verifiedDate: "نوفمبر 2026"
  },
  {
    id: "guide_real_estate_notary",
    title: "توثيق وتصديق العقود في الشهر العقاري",
    category: "CIVIC",
    badge: "الشهر العقاري",
    summary: "حجز موعد إلكتروني مسبق عبر تطبيق «أرغب في عمل توكيل» لتجنب الزحام وإنجاز توكيلات وعقود البيع والإيجار.",
    stepsSummary: "حجز الموعد وتحديد الفرع ◄ تحضير الأصول وأرقام التوكيل ◄ الحضور وسداد الرسوم ◄ البصمة الإلكترونية والاستلام.",
    source: "مصلحة الشهر العقاري والتوثيق - وزارة العدل",
    url: "https://rso.gov.eg",
    verifiedDate: "نوفمبر 2026"
  }
];

// App State Management
class KhotwaApp {
  constructor() {
    this.journeys = this.loadStoredJourneys();
    this.activeTab = "home";
    this.activeJourneyId = null;
    this.chatMessages = [
      {
        id: "msg_welcome",
        sender: "ai",
        text: "أهلاً بك! أنا «خُطوة AI»، مساعدك الذكي لتنظيم وإنجاز أي إجراء أو خدمة أو ورقة معقدة.\n\nتفضل بسؤالي: مثلاً «عايز أجدد باسبور مستعجل»، أو «عندي ورقة ومش فاهم المطلوب منها»، أو اختر إجراءً من المقترحات أدناه لنبدأ خطوتك الأولى معًا!"
      }
    ];
    this.user = this.loadStoredUser();
    this.theme = localStorage.getItem("khotwa_theme") || "light";
    this.selectedImageBase64 = null;
    this.islandState = {
      text: "خُطوة AI مستعد لمساعدتك",
      badge: "جاهز",
      isExpanded: false
    };

    this.init();
  }

  init() {
    this.applyTheme(this.theme);
    this.bindEvents();
    this.render();
    this.checkNativeBridge();
  }

  loadStoredJourneys() {
    try {
      const data = localStorage.getItem("khotwa_journeys");
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn("Could not load stored journeys", e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_PRESET_JOURNEYS));
  }

  saveJourneysLocally() {
    try {
      localStorage.setItem("khotwa_journeys", JSON.stringify(this.journeys));
    } catch (e) {
      console.warn("Could not save journeys locally", e);
    }
  }

  loadStoredUser() {
    try {
      const data = localStorage.getItem("khotwa_user");
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {}
    return { isSignedIn: false, displayName: "زائر خُطوة", email: "" };
  }

  saveUserLocally(userObj) {
    this.user = userObj;
    localStorage.setItem("khotwa_user", JSON.stringify(userObj));
  }

  checkNativeBridge() {
    if (window.AndroidBridge && typeof window.AndroidBridge.getUserInfo === "function") {
      try {
        const info = JSON.parse(window.AndroidBridge.getUserInfo());
        if (info.isSignedIn) {
          this.user = info;
          this.saveUserLocally(info);
          this.render();
        }
      } catch (e) {
        console.warn("Bridge getUserInfo failed", e);
      }
    }
  }

  applyTheme(theme) {
    this.theme = theme;
    localStorage.setItem("khotwa_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }

  setDynamicIsland(text, badge = "نشط", autoRevertSeconds = 5) {
    this.islandState.text = text;
    this.islandState.badge = badge;
    this.updateIslandUI();

    if (autoRevertSeconds > 0) {
      setTimeout(() => {
        this.islandState.text = "خُطوة AI مستعد لمساعدتك";
        this.islandState.badge = "جاهز";
        this.updateIslandUI();
      }, autoRevertSeconds * 1000);
    }
  }

  updateIslandUI() {
    const island = document.getElementById("dynamic-island");
    if (island) {
      const textEl = island.querySelector(".island-text");
      const badgeEl = island.querySelector(".island-badge");
      if (textEl) textEl.textContent = this.islandState.text;
      if (badgeEl) badgeEl.textContent = this.islandState.badge;
    }
  }

  haptic(style = "light") {
    if (window.AndroidBridge && typeof window.AndroidBridge.vibrateHaptic === "function") {
      window.AndroidBridge.vibrateHaptic(style);
    } else if (navigator.vibrate) {
      navigator.vibrate(20);
    }
  }

  bindEvents() {
    // Listen for image from Android native photo picker
    window.onNativeImagePicked = (dataUrl) => {
      this.selectedImageBase64 = dataUrl;
      this.setDynamicIsland("تم اختيار المستند بنجاح", "جاهز للتحليل");
      this.activeTab = "docs";
      this.render();
      this.analyzeDocumentWithAi(dataUrl);
    };

    // Listen for Auth callbacks from native Google Sign-In
    window.onAuthResult = (jsonStr) => {
      try {
        const res = typeof jsonStr === "string" ? JSON.parse(jsonStr) : jsonStr;
        if (res.success && res.uid) {
          this.user = {
            isSignedIn: true,
            uid: res.uid,
            displayName: res.displayName,
            email: res.email,
            photoUrl: res.photoUrl
          };
          this.saveUserLocally(this.user);
          this.setDynamicIsland("أهلاً بك " + res.displayName, "مسجل");
          this.haptic("success");
          this.syncJourneysToCloud();
        } else {
          this.setDynamicIsland(res.error || "فشل تسجيل الدخول", "تنبيه");
        }
      } catch (e) {
        console.error("Auth result parse error", e);
      }
      this.render();
    };

    // Listen for Gemini responses from Android bridge
    window.onGeminiResponse = (callbackId, success, textOrError) => {
      this.handleGeminiResponse(callbackId, success, textOrError);
    };

    // Listen for Journey JSON generated from Android bridge
    window.onJourneyGenerated = (callbackId, success, jsonOrError) => {
      this.handleJourneyGenerated(callbackId, success, jsonOrError);
    };

    // Listen for Document analysis from Android bridge
    window.onDocumentAnalyzed = (callbackId, success, textOrError) => {
      this.handleDocumentAnalyzed(callbackId, success, textOrError);
    };
  }

  // Navigation router
  switchTab(tabName) {
    this.haptic("light");
    this.activeTab = tabName;
    this.render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  openJourney(journeyId) {
    this.haptic("medium");
    this.activeJourneyId = journeyId;
    this.activeTab = "journey_detail";
    this.render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  toggleStep(journeyId, stepId) {
    this.haptic("medium");
    const journey = this.journeys.find(j => j.id === journeyId);
    if (!journey) return;

    const step = journey.steps.find(s => s.id === stepId);
    if (!step) return;

    step.isCompleted = !step.isCompleted;

    // Recalculate progress percentage
    const completedCount = journey.steps.filter(s => s.isCompleted).length;
    journey.progress = Math.round((completedCount / journey.steps.length) * 100);

    if (journey.progress === 100) {
      journey.status = "COMPLETED";
      this.setDynamicIsland("مبروك! أنجزت كافة خطوات هذه الرحلة بنجاح", "إنجاز 100%");
      this.haptic("success");
    } else {
      journey.status = "IN_PROGRESS";
    }

    this.saveJourneysLocally();
    this.render();

    // Trigger cloud sync in background if signed in
    if (this.user.isSignedIn && window.AndroidBridge) {
      window.AndroidBridge.syncJourney(JSON.stringify(journey), "sync_" + Date.now());
    }
  }

  calculateReadiness(journey) {
    if (!journey) return { score: 0, label: "غير محدد", badgeClass: "status-missing-info" };

    const missingDocs = (journey.documents || []).filter(d => d.status === "MISSING").length;
    const completedSteps = (journey.steps || []).filter(s => s.isCompleted).length;
    const totalSteps = journey.steps.length;

    if (missingDocs === 0 && completedSteps >= totalSteps * 0.5) {
      return { score: 100, label: "جاهز تمامًا للتحرك!", badgeClass: "status-ready", advice: "جميع مستنداتك الأساسية مكتملة وجاهزة، توكل على الله." };
    } else if (missingDocs > 0) {
      return { score: 50, label: "يحتاج استكمال أوراق", badgeClass: "status-needs-work", advice: `ينقصك ${missingDocs} مستند مطلوب قبل التوجه لمقر الخدمة، راجع القائمة أدناه.` };
    } else {
      return { score: 75, label: "جاهز مبدئيًا — تأكد من المواعيد", badgeClass: "status-needs-work", advice: "تأكد من ساعات العمل الرسمية ورسوم الاستمارة قبل الانطلاق." };
    }
  }

  syncJourneysToCloud() {
    if (!this.user.isSignedIn || !window.AndroidBridge) return;
    this.journeys.forEach(j => {
      window.AndroidBridge.syncJourney(JSON.stringify(j), "init_sync_" + j.id);
    });
  }

  // AI Chat and Journey Generation
  sendChatMessage(text) {
    if (!text || text.trim() === "") return;
    const userText = text.trim();

    this.chatMessages.push({
      id: "msg_" + Date.now(),
      sender: "user",
      text: userText
    });

    const aiMsgId = "ai_" + Date.now();
    this.chatMessages.push({
      id: aiMsgId,
      sender: "ai",
      text: "جاري استشارة خُطوة AI للتفكير في أفضل مسار...",
      isLoading: true
    });

    this.setDynamicIsland("جاري تحليل استفسارك...", "ذكاء اصطناعي", 0);
    this.render();

    // Send to Android Bridge or fallback to direct processing
    if (window.AndroidBridge && typeof window.AndroidBridge.askGemini === "function") {
      window.AndroidBridge.askGemini(userText, aiMsgId);
    } else {
      // Offline fallback response simulation
      setTimeout(() => {
        this.handleGeminiResponse(aiMsgId, true, "فهمت استفسارك بخصوص: «" + userText + "». لتنفيذ هذا الإجراء بأفضل طريقة، أنصحك بالبدء بتجهيز الأوراق الثبوتية ومراجعة مواعيد العمل الرسمية، ويمكنك النقر على زر «إنشاء رحلة إنجاز» بالأسفل لتحويل هذا الطلب لخطوات منظمة.");
      }, 1200);
    }
  }

  handleGeminiResponse(callbackId, success, responseText) {
    const msg = this.chatMessages.find(m => m.id === callbackId);
    if (msg) {
      msg.isLoading = false;
      msg.text = success ? responseText : "عذرًا، حدثت مشكلة في الاتصال بالذكاء الاصطناعي: " + responseText;
    }
    this.setDynamicIsland("تم استلام إجابة خُطوة AI", "مكتمل");
    this.render();
  }

  createJourneyFromPrompt(goalText) {
    this.setDynamicIsland("جاري بناء رحلة إنجاز ذكية بواسطة Gemini...", "تخطيط ذكي", 0);
    const callbackId = "gen_journey_" + Date.now();

    if (window.AndroidBridge && typeof window.AndroidBridge.generateJourney === "function") {
      window.AndroidBridge.generateJourney(goalText, callbackId);
    } else {
      // Local builder fallback if bridge offline
      setTimeout(() => {
        const dummyJourney = {
          id: "custom_" + Date.now(),
          title: goalText.length > 30 ? goalText.substring(0, 30) + "..." : goalText,
          description: "رحلة إنجاز مبنية بالذكاء الاصطناعي لتحقيق: " + goalText,
          category: "PERSONAL",
          status: "IN_PROGRESS",
          progress: 0,
          steps: [
            { id: "s1", title: "مراجعة المتطلبات الأساسية", description: "فحص كافة الشروط والأوراق المطلوبة للبدء.", isCompleted: false, tips: "تأكد من صلاحية بطاقة الرقم القومي" },
            { id: "s2", title: "تجهيز ونسخ المستندات", description: "أخذ نسخ ضوئية من الأوراق الثبوتية.", isCompleted: false, tips: "احتفظ بنسخة PDF على هاتفك" },
            { id: "s3", title: "التنفيذ ومتابعة الإجراء", description: "التوجه للجهة المعنية أو إتمام الإجراء إلكترونيًا.", isCompleted: false, tips: "اذهب في الصباح الباكر لتجنب الزحام" }
          ],
          documents: [
            { name: "بطاقة الرقم القومي", status: "READY", notes: "سارية" }
          ],
          officialSources: [
            { title: "بوابة مصر الرقمية", url: "https://digital.gov.eg", entity: "الحكومة المصرية" }
          ],
          deadlines: [],
          notes: "أنشئت بواسطة خُطوة AI"
        };
        this.journeys.unshift(dummyJourney);
        this.saveJourneysLocally();
        this.setDynamicIsland("تم إنشاء رحلتك بنجاح!", "إنجاز");
        this.openJourney(dummyJourney.id);
      }, 1500);
    }
  }

  handleJourneyGenerated(callbackId, success, jsonText) {
    if (success) {
      try {
        const parsed = JSON.parse(jsonText);
        const newJourney = {
          id: "journey_" + Date.now(),
          title: parsed.title || "رحلة إنجاز جديدة",
          description: parsed.description || "",
          category: parsed.category || "CIVIC",
          status: "IN_PROGRESS",
          progress: 0,
          steps: (parsed.steps || []).map((s, idx) => ({
            id: s.id || "step_" + idx,
            title: s.title || "خطوة " + (idx + 1),
            description: s.description || "",
            isCompleted: false,
            tips: s.tips || ""
          })),
          documents: (parsed.requiredDocuments || []).map(d => ({
            name: d.name || "",
            status: "MISSING",
            notes: d.notes || ""
          })),
          officialSources: (parsed.officialSources || []).map(o => ({
            title: o.name || "جهة رسمية",
            url: o.url || "",
            entity: o.name || ""
          })),
          deadlines: [],
          notes: parsed.beforeYouGoChecklist ? "قائمة ما قبل التحرك: " + parsed.beforeYouGoChecklist.join(" • ") : ""
        };

        this.journeys.unshift(newJourney);
        this.saveJourneysLocally();
        this.setDynamicIsland("تم إنشاء وحفظ الرحلة الذكية بنجاح!", "إنجاز");
        this.openJourney(newJourney.id);

        if (this.user.isSignedIn && window.AndroidBridge) {
          window.AndroidBridge.syncJourney(JSON.stringify(newJourney), "sync_new_" + newJourney.id);
        }
      } catch (e) {
        console.error("Failed to parse journey JSON", e);
        this.setDynamicIsland("حدث خطأ أثناء معالجة الخطة الذكية", "تنبيه");
      }
    } else {
      this.setDynamicIsland("تعذر إنشاء الرحلة: " + jsonText, "تنبيه");
    }
  }

  // Document Analysis
  analyzeDocumentWithAi(base64Image) {
    this.setDynamicIsland("جاري فحص المستند بواسطة Gemini Multimodal...", "تحليل ذكي", 0);
    const callbackId = "doc_eval_" + Date.now();

    if (window.AndroidBridge && typeof window.AndroidBridge.analyzeDocument === "function") {
      window.AndroidBridge.analyzeDocument(base64Image, "", callbackId);
    } else {
      setTimeout(() => {
        this.handleDocumentAnalyzed(callbackId, true, "تم فحص المستند بنجاح:\n\n• نوع المستند: إشعار رسمي / مستند ثبوتي.\n• المطلوب منك: استيفاء البيانات وتقديم أصل المستند مع إيصال حديث.\n• المواعيد: يلزم التقديم قبل نهاية الشهر الحالي.\n• التوصية: يمكنك إضافة هذه المتطلبات كخطوات لرحلتك الحالية بنقرة زر واحدة.");
      }, 1500);
    }
  }

  handleDocumentAnalyzed(callbackId, success, textOrError) {
    this.latestDocAnalysis = success ? textOrError : "تعذر تحليل المستند: " + textOrError;
    this.setDynamicIsland("اكتمل فحص المستند", "تحليل جاهز");
    this.render();
  }

  explainSimply(text) {
    this.haptic("light");
    this.setDynamicIsland("جاري التبسيط بالعامية المصرية...", "شرح مبسط", 0);
    const prompt = `اشرح هذه العبارة الحكومية أو الرسمية بالعامية المصرية المبسطة جدًا بدون مصطلحات معقدة: "${text}"`;

    if (window.AndroidBridge && typeof window.AndroidBridge.askGemini === "function") {
      const cbId = "explain_" + Date.now();
      window.onGeminiResponse = (id, success, res) => {
        if (id === cbId) {
          alert("💡 الشرح ببساطة:\n\n" + (success ? res : "تعذر التبسيط"));
          this.setDynamicIsland("تم الشرح", "جاهز");
        }
      };
      window.AndroidBridge.askGemini(prompt, cbId);
    } else {
      alert("💡 الشرح ببساطة:\n\nالمقصود هنا إنك تجهز الورقة دي مختومة من شغلك وتأخذ صورة منها عشان الموظف يطابقها بالأصل.");
    }
  }

  whatIfScenario(stepTitle) {
    this.haptic("light");
    this.setDynamicIsland("جاري دراسة البدائل والحلول...", "ماذا لو؟", 0);
    const prompt = `أنا مواطن في مصر أسأل: ماذا لو لم أستطع تنفيذ هذه الخطوة: "${stepTitle}"؟ ما هي البدائل الرسمية والحلول المتاحة؟`;

    if (window.AndroidBridge && typeof window.AndroidBridge.askGemini === "function") {
      const cbId = "whatif_" + Date.now();
      window.onGeminiResponse = (id, success, res) => {
        if (id === cbId) {
          alert("🔍 سيناريو ماذا لو والبدائل:\n\n" + (success ? res : "تعذر استخراج البدائل"));
          this.setDynamicIsland("تم فحص البدائل", "جاهز");
        }
      };
      window.AndroidBridge.askGemini(prompt, cbId);
    } else {
      alert("🔍 سيناريو ماذا لو والبدائل:\n\nإذا لم يتوفر هذا المستند، يمكنك في الغالب استخراج بدل فاقد أو تقديم إقرار رسمي مصحوب بضامن من الدرجة الأولى.");
    }
  }

  speakText(text) {
    if (window.AndroidBridge && typeof window.AndroidBridge.speakArabicText === "function") {
      window.AndroidBridge.speakArabicText(text);
      this.setDynamicIsland("جاري القراءة الصوتية...", "صوت", 3);
    } else if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ar";
      window.speechSynthesis.speak(utterance);
    }
  }

  // UI Rendering Core
  render() {
    const root = document.getElementById("app-root");
    if (!root) return;

    let contentHtml = "";

    switch (this.activeTab) {
      case "home":
        contentHtml = this.renderHomeTab();
        break;
      case "journeys":
        contentHtml = this.renderJourneysTab();
        break;
      case "journey_detail":
        contentHtml = this.renderJourneyDetailTab();
        break;
      case "ai":
        contentHtml = this.renderAiTab();
        break;
      case "docs":
        contentHtml = this.renderDocsTab();
        break;
      case "discover":
        contentHtml = this.renderDiscoverTab();
        break;
      case "profile":
        contentHtml = this.renderProfileTab();
        break;
      default:
        contentHtml = this.renderHomeTab();
    }

    root.innerHTML = `
      <!-- Dynamic Island Activity Bar -->
      <div class="dynamic-island-wrapper">
        <div class="dynamic-island" id="dynamic-island">
          <div class="island-dot"></div>
          <span class="island-text">${this.islandState.text}</span>
          <span class="island-badge">${this.islandState.badge}</span>
        </div>
      </div>

      <!-- Main Content View -->
      <main class="main-content-view fade-in">
        ${contentHtml}
      </main>

      <!-- Apple Frosted Glass Bottom Navigation Bar -->
      <nav class="bottom-nav">
        <div class="nav-item ${this.activeTab === 'home' ? 'active' : ''}" onclick="window.app.switchTab('home')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span>الرئيسية</span>
        </div>

        <div class="nav-item ${this.activeTab === 'journeys' || this.activeTab === 'journey_detail' ? 'active' : ''}" onclick="window.app.switchTab('journeys')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 11 12 14 22 4"/>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
          <span>رحلاتي</span>
        </div>

        <div class="nav-item ai-sparkle ${this.activeTab === 'ai' ? 'active' : ''}" onclick="window.app.switchTab('ai')">
          <div class="nav-icon-container">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
          </div>
          <span>المساعد</span>
        </div>

        <div class="nav-item ${this.activeTab === 'docs' ? 'active' : ''}" onclick="window.app.switchTab('docs')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          <span>مستنداتي</span>
        </div>

        <div class="nav-item ${this.activeTab === 'profile' ? 'active' : ''}" onclick="window.app.switchTab('profile')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span>حسابي</span>
        </div>
      </nav>
    `;
  }

  // Screen 1: Home Dashboard
  renderHomeTab() {
    const todayAr = new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());

    return `
      <!-- App Header -->
      <header class="app-header">
        <div class="user-greeting-block">
          <p>${todayAr}</p>
          <h1>أهلاً، ${this.user.displayName || 'يا بطل'} 👋</h1>
        </div>
        <div class="header-actions">
          <button class="icon-btn" onclick="window.app.switchTab('discover')" title="دليل الإجراءات">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
          </button>
          <button class="icon-btn" onclick="window.app.toggleTheme()" title="تبديل الوضع">
            ${this.theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <!-- Hero Prompt Box -->
      <div class="hero-prompt-card">
        <div class="hero-prompt-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/></svg>
          <span>ما هو الإجراء أو الهدف الذي تريد إنجازه؟</span>
        </div>

        <div class="prompt-input-wrapper">
          <textarea id="home-prompt-input" class="prompt-textarea" placeholder="مثلاً: عايز أقدم لابني في مدرسة، أو أجدد بطاقة التموين، أو أسافر..."></textarea>
          
          <div class="prompt-actions-row">
            <div class="prompt-tool-btns">
              <button class="tool-btn" onclick="window.app.triggerPhotoPicker()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                <span>صوّر ورقة</span>
              </button>
              <button class="tool-btn" onclick="window.app.startVoiceInput()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                <span>تحدث</span>
              </button>
            </div>

            <button class="send-action-btn" onclick="window.app.submitHomePrompt()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Chips: Common Egyptian Procedures -->
      <div class="quick-chips-scroll">
        <div class="quick-chip" onclick="window.app.openJourney('egypt_national_id')">
          <span>🪪 تجديد بطاقة الرقم القومي</span>
        </div>
        <div class="quick-chip" onclick="window.app.openJourney('egypt_passport')">
          <span>✈️ استخراج جواز سفر مصري</span>
        </div>
        <div class="quick-chip" onclick="window.app.openJourney('egypt_school_nursery')">
          <span>🎒 تقديم المدارس الرسمية</span>
        </div>
        <div class="quick-chip" onclick="window.app.createJourneyFromPrompt('استخراج رخصة قيادة خاصة لأول مرة')">
          <span>🚗 استخراج رخصة قيادة</span>
        </div>
      </div>

      <!-- Before You Go (قبل ما تتحرك) Banner -->
      <div class="apple-card" style="background: linear-gradient(135deg, rgba(38,120,245,0.06), rgba(105,167,255,0.12)); border-color: rgba(38,120,245,0.2);">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <span style="font-size:12px; font-weight:800; color:var(--primary-blue);">خدمة ذكية حصرية</span>
            <h3 style="font-size:16px; font-weight:800; margin-top:2px;">قبل ما تتحرك 🚦</h3>
            <p style="font-size:12px; color:var(--text-sub); margin-top:2px;">افحص جاهزيتك قبل الخروج وتجنب الرجوع بدون إنجاز مصلحتك.</p>
          </div>
          <button class="tool-btn" style="background:var(--primary-blue); color:#fff; border:none;" onclick="window.app.openFirstJourneyReadiness()">
            فحص الجاهزية
          </button>
        </div>
      </div>

      <!-- Active Journeys Carousel -->
      <div class="section-header">
        <h2 class="section-title">رحلاتي النشطة</h2>
        <span class="section-link" onclick="window.app.switchTab('journeys')">عرض الكل (${this.journeys.length})</span>
      </div>

      <div style="padding: 0 20px;">
        ${this.journeys.slice(0, 3).map(j => this.renderJourneyCard(j)).join("")}
      </div>

      <!-- Weekly Achievement Summary -->
      <div class="apple-card">
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="width:48px; height:48px; border-radius:50%; background:var(--accent-green-soft); display:flex; align-items:center; justify-content:center; color:var(--accent-green); font-size:22px;">
            ✓
          </div>
          <div>
            <h4 style="font-size:15px; font-weight:700;">تقريرك الأسبوعي للإنجاز</h4>
            <p style="font-size:12px; color:var(--text-sub);">أنجزت ${this.getTotalCompletedSteps()} خطوة هذا الأسبوع بنجاح، وتقدمت في ${this.journeys.length} رحلات.</p>
          </div>
        </div>
      </div>
    `;
  }

  // Screen 2: Journeys List
  renderJourneysTab() {
    return `
      <header class="app-header">
        <div class="user-greeting-block">
          <p>خطط منظمة وموثوقة</p>
          <h1>رحلات الإنجاز 🗺️</h1>
        </div>
        <button class="icon-btn" onclick="window.app.promptNewJourney()" title="رحلة جديدة">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </header>

      <div style="padding: 0 20px 10px 20px;">
        <input type="text" id="journey-search-input" placeholder="🔍 ابحث في رحلاتك أو الخطوات..." oninput="window.app.filterJourneys(this.value)" style="width:100%; padding:12px 16px; border-radius:var(--radius-pill); border:1px solid var(--border-light); background:var(--bg-card); color:var(--text-main); font-family:inherit; font-size:13px; outline:none;" />
      </div>

      <div id="journeys-list-container" style="padding: 8px 20px;">
        ${this.journeys.map(j => this.renderJourneyCard(j)).join("")}
      </div>
    `;
  }

  renderJourneyCard(j) {
    const radius = 22;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (j.progress / 100) * circumference;

    return `
      <div class="journey-card" onclick="window.app.openJourney('${j.id}')">
        <div class="journey-info">
          <span class="journey-category-tag ${j.category === 'CIVIC' ? 'cat-civic' : j.category === 'EDUCATION' ? 'cat-edu' : 'cat-personal'}">
            ${j.category === 'CIVIC' ? '🏛️ حكومي' : j.category === 'EDUCATION' ? '🎓 تعليمي' : '🌟 شخصي'}
          </span>
          <h3 class="journey-title">${j.title}</h3>
          <div class="journey-meta">
            <span>${j.steps.filter(s => s.isCompleted).length} من ${j.steps.length} خطوات</span>
            <span>•</span>
            <span style="color:${j.progress === 100 ? 'var(--accent-green)' : 'var(--primary-blue)'}; font-weight:700;">${j.progress}%</span>
          </div>
        </div>

        <div class="progress-ring-container">
          <svg width="56" height="56">
            <circle class="progress-ring-circle-bg" stroke-width="4" fill="transparent" r="${radius}" cx="28" cy="28"/>
            <circle class="progress-ring-circle" stroke-width="4" stroke-dasharray="${circumference} ${circumference}" stroke-dashoffset="${offset}" fill="transparent" r="${radius}" cx="28" cy="28"/>
          </svg>
          <span class="progress-ring-value">${j.progress}%</span>
        </div>
      </div>
    `;
  }

  // Screen 3: Journey Detail & Checklist View
  renderJourneyDetailTab() {
    const journey = this.journeys.find(j => j.id === this.activeJourneyId);
    if (!journey) {
      return `<div style="padding:40px; text-align:center;"><h3>لم يتم العثور على الرحلة</h3><button class="tool-btn" onclick="window.app.switchTab('journeys')">العودة للرحلات</button></div>`;
    }

    const readiness = this.calculateReadiness(journey);

    return `
      <header class="app-header">
        <div class="header-actions">
          <button class="icon-btn" onclick="window.app.switchTab('journeys')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
        <div style="flex:1; margin-right:12px;">
          <h2 style="font-size:18px; font-weight:800; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${journey.title}</h2>
        </div>
        <button class="icon-btn" onclick="window.app.shareJourney('${journey.id}')" title="مشاركة وطباعة">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
        </button>
      </header>

      <!-- Before You Go (قبل ما تتحرك) Diagnostic Card -->
      <div class="readiness-meter-card">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:12px; font-weight:800; color:var(--text-sub);">🚦 فحص الجاهزية (قبل ما تتحرك)</span>
          <span class="readiness-status-badge ${readiness.badgeClass}">${readiness.label}</span>
        </div>
        <p style="font-size:13px; color:var(--text-main); margin-top:6px; line-height:1.4;">${readiness.advice}</p>
      </div>

      <!-- Actionable Checklist Steps -->
      <div class="apple-card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h3 style="font-size:16px; font-weight:800;">قائمة الخطوات التنفيذية</h3>
          <span style="font-size:12px; font-weight:700; color:var(--primary-blue);">${journey.progress}% مكتمل</span>
        </div>

        <div class="steps-list">
          ${journey.steps.map(step => `
            <div class="step-item">
              <div class="step-checkbox ${step.isCompleted ? 'checked' : ''}" onclick="window.app.toggleStep('${journey.id}', '${step.id}')">
                <svg viewBox="0 0 24 24" fill="none" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div class="step-content">
                <div class="step-title ${step.isCompleted ? 'completed' : ''}">${step.title}</div>
                <div class="step-desc">${step.description}</div>
                ${step.tips ? `
                  <div class="step-tips">
                    <span>💡 نصيحة خُطوة: ${step.tips}</span>
                  </div>
                ` : ''}
                <div style="margin-top:6px; display:flex; gap:6px;">
                  <button class="bubble-action-btn" onclick="window.app.explainSimply('${step.title} - ${step.description}')">
                    <span>🗣️ اشرح ببساطة</span>
                  </button>
                  <button class="bubble-action-btn" onclick="window.app.whatIfScenario('${step.title}')">
                    <span>❓ ماذا لو؟</span>
                  </button>
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- Required Documents Checklist -->
      <div class="apple-card">
        <h3 style="font-size:16px; font-weight:800; margin-bottom:10px;">المستندات والأوراق المطلوبة</h3>
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${(journey.documents || []).map(doc => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid var(--border-light);">
              <div>
                <span style="font-size:13px; font-weight:700;">📄 ${doc.name}</span>
                <p style="font-size:11px; color:var(--text-sub);">${doc.notes || ''}</p>
              </div>
              <span class="journey-category-tag ${doc.status === 'READY' ? 'cat-edu' : 'cat-personal'}">
                ${doc.status === 'READY' ? 'جاهز معك' : 'مطلوب استخراجه'}
              </span>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- Official Sources & Verification -->
      <div class="apple-card" style="background:var(--bg-card-secondary);">
        <h4 style="font-size:13px; font-weight:800; color:var(--text-sub); margin-bottom:6px;">المصادر الرسمية والجهات</h4>
        ${(journey.officialSources || []).map(src => `
          <div style="font-size:12px; margin-top:4px;">
            <span>🏛️ ${src.title} (${src.entity})</span>
            ${src.url ? `<br><a href="${src.url}" target="_blank" style="color:var(--primary-blue); font-size:11px;">زيارة الرابط الرسمي ↗</a>` : ''}
          </div>
        `).join("")}
      </div>
    `;
  }

  // Screen 4: AI Assistant Conversational Chat
  renderAiTab() {
    return `
      <header class="app-header">
        <div class="user-greeting-block">
          <p>شات الذكاء الاصطناعي</p>
          <h1>مساعد خُطوة الذكي 🤖</h1>
        </div>
        <button class="icon-btn" onclick="window.app.clearChat()" title="مسح المحادثة">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </header>

      <div class="chat-container" id="chat-messages-container">
        ${this.chatMessages.map(msg => `
          <div class="chat-bubble ${msg.sender}">
            ${msg.isLoading ? `<div class="skeleton" style="height:20px; width:160px;"></div>` : msg.text.replace(/\n/g, '<br>')}
            
            ${msg.sender === 'ai' && !msg.isLoading ? `
              <div class="bubble-actions">
                <button class="bubble-action-btn" onclick="window.app.speakText('${msg.text.replace(/'/g, "\\'")}')">
                  <span>🔊 استمع</span>
                </button>
                <button class="bubble-action-btn" onclick="window.app.convertChatToJourney('${msg.text.replace(/'/g, "\\'")}')">
                  <span>⚡ تحويل إلى رحلة إنجاز</span>
                </button>
                <button class="bubble-action-btn" onclick="navigator.clipboard.writeText('${msg.text.replace(/'/g, "\\'")}')">
                  <span>📋 نسخ</span>
                </button>
              </div>
            ` : ''}
          </div>
        `).join("")}
      </div>

      <!-- Quick AI Suggestion Chips -->
      <div class="quick-chips-scroll" style="margin-top:auto;">
        <div class="quick-chip" onclick="window.app.sendChatMessage('أنشئ لي خطة تجديد بطاقة الرقم القومي مستعجل')">
          <span>📝 خطة بطاقة مستعجل</span>
        </div>
        <div class="quick-chip" onclick="window.app.sendChatMessage('ما هي الأوراق المطلوبة لجواز السفر للأطفال؟')">
          <span>👶 جواز سفر الأطفال</span>
        </div>
        <div class="quick-chip" onclick="window.app.sendChatMessage('عايز أعرف شروط التقديم في معهد تمريض')">
          <span>🏥 معهد تمريض</span>
        </div>
      </div>

      <!-- Chat Input Field -->
      <div style="padding: 10px 20px 20px 20px;">
        <div class="prompt-input-wrapper">
          <textarea id="ai-chat-input" class="prompt-textarea" placeholder="اسأل خُطوة أي سؤال عن الإجراءات والأوراق..." onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault(); window.app.submitChatInput();}"></textarea>
          <div class="prompt-actions-row">
            <button class="tool-btn" onclick="window.app.triggerPhotoPicker()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
              <span>إرفاق ورقة</span>
            </button>
            <button class="send-action-btn" onclick="window.app.submitChatInput()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Screen 5: Document Intelligence Center
  renderDocsTab() {
    return `
      <header class="app-header">
        <div class="user-greeting-block">
          <p>تحليل المستندات بالذكاء الاصطناعي</p>
          <h1>مركز المستندات 📄</h1>
        </div>
      </header>

      <div class="apple-card" style="text-align:center; padding:28px 20px;">
        <div style="width:64px; height:64px; border-radius:50%; background:var(--accent-soft); display:inline-flex; align-items:center; justify-content:center; color:var(--primary-blue); margin-bottom:12px;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
        </div>
        <h3 style="font-size:16px; font-weight:800;">التقط صورة لورقتك أو مستندك</h3>
        <p style="font-size:12px; color:var(--text-sub); margin-top:4px; max-width:320px; margin-inline:auto;">
          ارفع أي إشعار أو استمارة أو قرار رسمي، وسيقوم Gemini بشرحها واستخراج التواريخ والمطلوب منك فورًا.
        </p>

        <div style="margin-top:16px; display:flex; justify-content:center; gap:12px;">
          <button class="tool-btn" style="background:var(--primary-blue); color:#FFFFFF; border:none; padding:10px 18px;" onclick="window.app.triggerPhotoPicker()">
            <span>📷 تصوير أو اختيار مستند</span>
          </button>
        </div>
      </div>

      ${this.selectedImageBase64 ? `
        <div class="apple-card">
          <h4 style="font-size:14px; font-weight:700; margin-bottom:10px;">معاينة المستند المرفوع</h4>
          <img src="${this.selectedImageBase64}" style="width:100%; max-height:240px; object-fit:contain; border-radius:var(--radius-md); border:1px solid var(--border-light);" />
        </div>
      ` : ''}

      ${this.latestDocAnalysis ? `
        <div class="apple-card" style="border-right: 4px solid var(--primary-blue);">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <h4 style="font-size:15px; font-weight:800; color:var(--primary-blue);">نتيجة الفحص والاستخراج الذكي</h4>
            <button class="bubble-action-btn" onclick="window.app.speakText('${this.latestDocAnalysis.replace(/'/g, "\\'")}')">🔊 قراءة</button>
          </div>
          <div style="font-size:13px; line-height:1.6; margin-top:10px; color:var(--text-main);">
            ${this.latestDocAnalysis.replace(/\n/g, '<br>')}
          </div>
          <div style="margin-top:14px;">
            <button class="tool-btn" style="background:var(--accent-green); color:#fff; border:none; width:100%; justify-content:center;" onclick="window.app.createJourneyFromPrompt(window.app.latestDocAnalysis)">
              ⚡ تحويل هذا التحليل إلى رحلة خطوات ومتابعة
            </button>
          </div>
        </div>
      ` : ''}
    `;
  }

  // Screen 6: Smart Discover & Knowledge Navigator
  renderDiscoverTab() {
    return `
      <header class="app-header">
        <div class="user-greeting-block">
          <p>أدلة رسمية موثقة</p>
          <h1>استكشاف الخدمات 🏛️</h1>
        </div>
      </header>

      <div style="padding: 0 20px;">
        ${KNOWLEDGE_GUIDES.map(g => `
          <div class="apple-card" style="margin-inline:0;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <span class="journey-category-tag cat-civic">${g.badge}</span>
              <span style="font-size:11px; color:var(--text-muted);">تحقق: ${g.verifiedDate}</span>
            </div>
            <h3 style="font-size:16px; font-weight:800; margin-top:4px;">${g.title}</h3>
            <p style="font-size:13px; color:var(--text-sub); margin-top:6px; line-height:1.4;">${g.summary}</p>
            
            <div style="background:var(--bg-card-secondary); padding:8px 12px; border-radius:var(--radius-sm); margin-top:10px; font-size:12px; font-weight:600;">
              🛣️ الخطوات: ${g.stepsSummary}
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px; padding-top:10px; border-top:1px solid var(--border-light);">
              <span style="font-size:11px; color:var(--text-sub);">المصدر: ${g.source}</span>
              <button class="tool-btn" style="background:var(--primary-blue); color:#fff; border:none;" onclick="window.app.createJourneyFromPrompt('${g.title}')">
                بدء الرحلة
              </button>
            </div>
          </div>
        `).join("")}
      </div>
    `;
  }

  // Screen 7: Profile & Settings
  renderProfileTab() {
    return `
      <header class="app-header">
        <div class="user-greeting-block">
          <p>الإعدادات والبيانات</p>
          <h1>حسابي ⚙️</h1>
        </div>
      </header>

      <!-- Account Card -->
      <div class="apple-card">
        <div style="display:flex; align-items:center; gap:14px;">
          <div style="width:56px; height:56px; border-radius:50%; background:var(--accent-soft); display:flex; align-items:center; justify-content:center; color:var(--primary-blue); font-size:22px; font-weight:800;">
            ${this.user.displayName ? this.user.displayName.charAt(0) : 'خ'}
          </div>
          <div>
            <h3 style="font-size:16px; font-weight:800;">${this.user.displayName || 'زائر خُطوة'}</h3>
            <p style="font-size:12px; color:var(--text-sub);">${this.user.email || 'وضع التجربة السريعة (بدون تسجيل)'}</p>
            <span class="journey-category-tag ${this.user.isSignedIn ? 'cat-edu' : 'cat-civic'}" style="margin-top:4px;">
              ${this.user.isSignedIn ? '✓ متصل بسحابة Firebase' : '💾 حفظ محلي فقط'}
            </span>
          </div>
        </div>

        <div style="margin-top:16px; padding-top:14px; border-top:1px solid var(--border-light);">
          ${this.user.isSignedIn ? `
            <button class="tool-btn" style="width:100%; justify-content:center; color:var(--accent-red); border-color:var(--accent-red-soft);" onclick="window.app.signOut()">
              تسجيل الخروج
            </button>
          ` : `
            <button class="tool-btn" style="width:100%; justify-content:center; background:var(--primary-blue); color:#FFFFFF; border:none;" onclick="window.app.signInWithGoogle()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg>
              <span>تسجيل الدخول باستخدام Google</span>
            </button>
          `}
        </div>
      </div>

      <!-- Apple Settings Group -->
      <div class="settings-group">
        <div class="settings-row" onclick="window.app.toggleTheme()">
          <div class="settings-label-wrapper">
            <div class="settings-icon-box" style="background:#5856D6;">🌓</div>
            <span style="font-size:14px; font-weight:600;">المظهر (Dark / Light)</span>
          </div>
          <span style="font-size:13px; color:var(--text-sub);">${this.theme === 'dark' ? 'الوضع الداكن' : 'الوضع الفاتح'}</span>
        </div>

        <div class="settings-row" onclick="alert('تطبيق خُطوة AI يعمل تلقائيًا باللغة العربية أولاً لدعم المجتمع العربي والمصري.')">
          <div class="settings-label-wrapper">
            <div class="settings-icon-box" style="background:#007AFF;">🌐</div>
            <span style="font-size:14px; font-weight:600;">اللغة</span>
          </div>
          <span style="font-size:13px; color:var(--text-sub);">العربية (افتراضي)</span>
        </div>

        <div class="settings-row" onclick="window.app.resetToDefaults()">
          <div class="settings-label-wrapper">
            <div class="settings-icon-box" style="background:#FF9500;">🔄</div>
            <span style="font-size:14px; font-weight:600;">استعادة الرحلات الافتراضية</span>
          </div>
          <span style="font-size:13px; color:var(--text-sub);">إعادة تعيين</span>
        </div>
      </div>

      <!-- About App -->
      <div class="apple-card" style="text-align:center; padding:20px;">
        <h4 style="font-size:15px; font-weight:800; color:var(--primary-blue);">خُطوة AI — KHOTWA</h4>
        <p style="font-size:12px; color:var(--text-sub); margin-top:2px;">«افهم المطلوب، اعرف خطوتك، وأنجز بثقة»</p>
        <p style="font-size:11px; color:var(--text-muted); margin-top:8px;">الإصدار 1.0 • مدعوم بـ Google Gemini وFirebase</p>
      </div>
    `;
  }

  // Interactive Helpers
  submitHomePrompt() {
    const input = document.getElementById("home-prompt-input");
    if (!input || !input.value.trim()) return;
    const text = input.value.trim();
    this.createJourneyFromPrompt(text);
  }

  submitChatInput() {
    const input = document.getElementById("ai-chat-input");
    if (!input || !input.value.trim()) return;
    const text = input.value.trim();
    input.value = "";
    this.sendChatMessage(text);
  }

  startVoiceInput() {
    this.haptic("medium");
    this.setDynamicIsland("تفضل بالتحدث الآن، أنا أستمع إليك...", "استماع صوتي", 4);
    // Suggest prompt directly
    setTimeout(() => {
      const voiceText = "عايز أجدد بطاقة الرقم القومي بتاعتي ومستعجل عليها";
      const promptInput = document.getElementById("home-prompt-input");
      if (promptInput) promptInput.value = voiceText;
      this.setDynamicIsland("تم التعرف على الصوت", "جاهز");
    }, 1800);
  }

  triggerPhotoPicker() {
    this.haptic("light");
    if (window.AndroidBridge && typeof window.AndroidBridge.pickDocument === "function") {
      window.AndroidBridge.pickDocument();
    } else {
      // Browser standard file input fallback
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/*";
      fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            window.onNativeImagePicked(event.target.result);
          };
          reader.readAsDataURL(file);
        }
      };
      fileInput.click();
    }
  }

  signInWithGoogle() {
    this.haptic("medium");
    this.setDynamicIsland("جاري تسجيل الدخول عبر Google...", "Google Sign-In", 0);
    if (window.AndroidBridge && typeof window.AndroidBridge.signInWithGoogle === "function") {
      window.AndroidBridge.signInWithGoogle();
    } else {
      setTimeout(() => {
        const dummyUser = { isSignedIn: true, uid: "user_demo_1", displayName: "عبد الرحمن أحمد", email: "abdelrahman@example.com" };
        this.saveUserLocally(dummyUser);
        this.setDynamicIsland("أهلاً عبد الرحمن", "متصل");
        this.render();
      }, 1000);
    }
  }

  signOut() {
    this.haptic("light");
    if (window.AndroidBridge && typeof window.AndroidBridge.signOut === "function") {
      window.AndroidBridge.signOut();
    } else {
      this.saveUserLocally({ isSignedIn: false, displayName: "زائر خُطوة", email: "" });
      this.setDynamicIsland("تم تسجيل الخروج", "جاهز");
      this.render();
    }
  }

  promptNewJourney() {
    const goal = prompt("ما هو الإجراء أو الهدف الذي تريد تنظيمه في رحلة جديدة؟");
    if (goal && goal.trim()) {
      this.createJourneyFromPrompt(goal.trim());
    }
  }

  filterJourneys(keyword) {
    const container = document.getElementById("journeys-list-container");
    if (!container) return;
    const lower = (keyword || "").toLowerCase();
    const filtered = this.journeys.filter(j => j.title.toLowerCase().includes(lower) || j.description.toLowerCase().includes(lower));
    container.innerHTML = filtered.map(j => this.renderJourneyCard(j)).join("");
  }

  openFirstJourneyReadiness() {
    if (this.journeys.length > 0) {
      this.openJourney(this.journeys[0].id);
    }
  }

  shareJourney(id) {
    const j = this.journeys.find(x => x.id === id);
    if (!j) return;
    const text = `🗺️ رحلة إنجاز: ${j.title}\nالتقدم: ${j.progress}%\nالخطوات:\n` + j.steps.map((s, i) => `${i + 1}. [${s.isCompleted ? '✓' : ' '}] ${s.title}`).join("\n");
    if (navigator.share) {
      navigator.share({ title: j.title, text: text });
    } else {
      navigator.clipboard.writeText(text);
      alert("تم نسخ ملخص الرحلة للحافظة للمشاركة!");
    }
  }

  clearChat() {
    this.chatMessages = [
      { id: "msg_clean", sender: "ai", text: "تم بدء محادثة جديدة. كيف يمكنني مساعدتك اليوم؟" }
    ];
    this.render();
  }

  convertChatToJourney(chatText) {
    this.createJourneyFromPrompt(chatText.substring(0, 100));
  }

  toggleTheme() {
    const nextTheme = this.theme === "dark" ? "light" : "dark";
    this.applyTheme(nextTheme);
    this.render();
  }

  resetToDefaults() {
    if (confirm("هل تريد استعادة الرحلات الافتراضية؟")) {
      this.journeys = JSON.parse(JSON.stringify(DEFAULT_PRESET_JOURNEYS));
      this.saveJourneysLocally();
      this.render();
    }
  }

  getTotalCompletedSteps() {
    return this.journeys.reduce((sum, j) => sum + j.steps.filter(s => s.isCompleted).length, 0);
  }
}

// Instantiate Global App
window.addEventListener("DOMContentLoaded", () => {
  window.app = new KhotwaApp();
});
