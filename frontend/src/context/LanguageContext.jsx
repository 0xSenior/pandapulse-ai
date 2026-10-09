import React, { createContext, useContext, useState, useEffect } from 'react';

const TRANSLATIONS = {
  EN: {
    // Nav & Common
    overview: 'Overview',
    chat: 'Chat',
    dataStudio: 'Data Studio',
    architecture: 'Architecture',
    knowledgeBase: 'Knowledge Base',
    engineer: 'Engineer',
    readyStatus: 'Python 3.14 · Ready',
    connectingStatus: 'Connecting...',
    openStudio: 'Open Studio',
    launchStudio: 'Launch Studio',
    language: 'Language',
    arabic: 'العربية',
    english: 'English',
    settings: 'Settings',
    apiSettings: 'API Key Settings (BYOK)',
    github: 'GitHub Repository',
    
    // Dock Tooltips
    dockOverview: 'Overview',
    dockChat: 'Chat Workspace',
    dockStudio: 'Data Studio Canvas',
    dockDocs: 'Architecture & Docs',
    dockKnowledge: 'Knowledge Base',
    dockEngineer: 'Engineer Profile',

    // Chat
    chatTitle: 'Python 3.x & Modern Pandas 2.0+ AI Engine',
    chatSubtitle: 'Real-time token streaming, WebAssembly execution, zero deprecated APIs.',
    inputPlaceholder: 'Ask a question about Python, Pandas 2.0, or request code...',
    inputHint: 'Press Enter to send · Shift+Enter for newline',
    newChat: 'New Chat',
    history: 'History',
    clearChat: 'Clear Chat',
    exportNotebook: 'Export Notebook',
    verifiedSources: 'Verified Sources',
    send: 'Send',
    stop: 'Stop Generating',
    citations: 'Citations',
    noCitations: 'No citations for this session yet.',
    chatHistoryTitle: 'Chat History',
    clearAll: 'Clear All',
    noHistory: 'No past conversations found.',
    thinking: 'Thinking...',
    copy: 'Copy',
    copied: 'Copied!',
    studio: 'Studio',
    share: 'Share',
    run: 'Run',
    running: 'Running...',

    // Quick Prompts
    qp1Label: 'Functions & Typing',
    qp1Prompt: 'Write clean Python functions with type hints and exception handling',
    qp2Label: 'Pandas 2.0 Concat',
    qp2Prompt: 'Concatenate DataFrames without deprecated append in Pandas 2.0+',
    qp3Label: 'Copy-on-Write Safe',
    qp3Prompt: 'Enable Copy-on-Write to eliminate SettingWithCopyWarning',
    qp4Label: 'List vs Generator RAM',
    qp4Prompt: 'Compare memory overhead: List vs. Generator in Python',
    qp5Label: 'PyArrow SIMD Speed',
    qp5Prompt: 'Accelerate Pandas queries with PyArrow and ArrowDtype',
    qp6Label: 'GroupBy Named Agg',
    qp6Prompt: 'Perform Named Aggregations in GroupBy with custom metric names',

    // Data Studio
    runScript: 'Run Script',
    reset: 'Reset',
    downloadPy: 'Download .py',
    exportIpynb: 'Export .ipynb',
    terminalOutput: 'Terminal Output',
    dataFrameViewer: 'DataFrame Viewer',
    plotViewer: 'Plot Viewer',
    askAI: 'Ask AI',
    downloadChart: 'Download Chart PNG',
    snippets: 'Snippets',
    shortcuts: 'Shortcuts',

    // Hero
    previewBadge: 'Preview',
    heroTitle1: 'PandaPulse',
    heroTitle2: 'Ready to use. Right now.',
    heroSubtitle: 'Everyday data tasks, pandas pipelines, or your own analytical workspace—it starts here.',
    heroInputPlaceholder: 'Describe what you want to build, analyze, or run...',
    tryPrompt: 'Try Prompt',
    startChat: 'Start Chat',

    // Settings
    settingsDesc: 'Configure your own API keys for direct inference. Keys are stored locally in your browser.',
    apiKey: 'API Key',
    save: 'Save',
    cancel: 'Cancel',
  },
  AR: {
    // Nav & Common
    overview: 'نظرة عامة',
    chat: 'المحادثة الذكية',
    dataStudio: 'استوديو البيانات',
    architecture: 'المعمارية والتوثيق',
    knowledgeBase: 'قاعدة المعرفة',
    engineer: 'الملف التقني',
    readyStatus: 'بايثون 3.14 · جاهز للعمل',
    connectingStatus: 'جاري الاتصال...',
    openStudio: 'فتح الاستوديو',
    launchStudio: 'بدء الاستوديو',
    language: 'اللغة',
    arabic: 'العربية',
    english: 'English',
    settings: 'الإعدادات',
    apiSettings: 'إعدادات مفاتيح API (BYOK)',
    github: 'مستودع GitHub',

    // Dock Tooltips
    dockOverview: 'نظرة عامة',
    dockChat: 'مساحة المحادثة',
    dockStudio: 'استوديو البيانات',
    dockDocs: 'المعمارية والتوثيق',
    dockKnowledge: 'قاعدة المعرفة',
    dockEngineer: 'الملف التقني للمهندس',

    // Chat
    chatTitle: 'محرك الذكاء الاصطناعي لبايثون وبانداس 2.0+ الحديث',
    chatSubtitle: 'توليد فوري للكود، تنفيذ فائق السرعة عبر المتصفح (WASM)، وبدون أي دوال مهملة.',
    inputPlaceholder: 'اسأل عن بايثون، بانداس 2.0، أو اطلب تحليل بيانات وكتابة كود...',
    inputHint: 'اضغط Enter للإرسال · Shift+Enter لسطر جديد',
    newChat: 'محادثة جديدة',
    history: 'السجل',
    clearChat: 'مسح المحادثة',
    exportNotebook: 'تصدير نوت بوك',
    verifiedSources: 'المصادر الموثقة',
    send: 'إرسال',
    stop: 'إيقاف التوليد',
    citations: 'المصادر المستند إليها',
    noCitations: 'لا توجد مراجع لهذه الجلسة بعد.',
    chatHistoryTitle: 'سجل المحادثات',
    clearAll: 'مسح الكل',
    noHistory: 'لا توجد محادثات سابقة.',
    thinking: 'جاري التفكير والتحليل...',
    copy: 'نسخ',
    copied: 'تم النسخ!',
    studio: 'استوديو',
    share: 'مشاركة',
    run: 'تشغيل',
    running: 'جاري التنفيذ...',

    // Quick Prompts
    qp1Label: 'دوال بايثون والأنماط',
    qp1Prompt: 'اكتب دوال بايثون نظيفة مع Type Hints ومعالجة الاستثناءات',
    qp2Label: 'دمج DataFrames الحديث',
    qp2Prompt: 'دمج الجداول في بانداس 2.0+ بدون استخدام دالة append المهملة',
    qp3Label: 'أمان Copy-on-Write',
    qp3Prompt: 'تفعيل Copy-on-Write لتجنب تحذيرات SettingWithCopyWarning',
    qp4Label: 'استهلاك الذاكرة RAM',
    qp4Prompt: 'مقارنة استهلاك الذاكرة بين القوائم والمولدات Generators في بايثون',
    qp5Label: 'سرعة محرك PyArrow',
    qp5Prompt: 'تسريع استعلامات Pandas باستخدام محرك PyArrow وأنواع ArrowDtype',
    qp6Label: 'تجميع البيانات GroupBy',
    qp6Prompt: 'إجراء عمليات تجميع متقدمة Named Aggregation في GroupBy بأسماء مخصصة',

    // Data Studio
    runScript: 'تشغيل الكود',
    reset: 'إعادة تعيين',
    downloadPy: 'تحميل .py',
    exportIpynb: 'تصدير .ipynb',
    terminalOutput: 'مخرجات الطرفية',
    dataFrameViewer: 'جدول البيانات',
    plotViewer: 'الرسم البياني',
    askAI: 'اسأل الذكاء الاصطناعي',
    downloadChart: 'تحميل الرسم البياني PNG',
    snippets: 'القصاصات',
    shortcuts: 'الاختصارات',

    // Hero
    previewBadge: 'إصدار تجريبي',
    heroTitle1: 'باندا بلس',
    heroTitle2: 'جاهز للعمل معك الآن',
    heroSubtitle: 'مهام البيانات اليومية، معالجة خطوط أنابيب Pandas، ومساحة العمل التحليلية المتكاملة.',
    heroInputPlaceholder: 'صف ما ترغب في إنجازه، أو تحليله، أو تشغيله...',
    tryPrompt: 'تجربة الأمر',
    startChat: 'بدء المحادثة',

    // Settings
    settingsDesc: 'أدخل مفاتيح API الخاصة بك للاتصال المباشر. يتم تخزين المفاتيح محلياً في متصفحك فقط.',
    apiKey: 'مفتاح API',
    save: 'حفظ الإعدادات',
    cancel: 'إلغاء',
  },
};

const LanguageContext = createContext({
  locale: 'AR',
  setLocale: () => {},
  toggleLocale: () => {},
  isRTL: true,
  t: (key) => key,
});

export const LanguageProvider = ({ children }) => {
  const [locale, setLocaleState] = useState(() => {
    try {
      const saved = localStorage.getItem('pandapulse_locale');
      if (saved === 'EN' || saved === 'AR') return saved;
    } catch (e) {
      // fallback
    }
    return 'AR'; // Default to Arabic as requested by user
  });

  const isRTL = locale === 'AR';

  const setLocale = (newLocale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem('pandapulse_locale', newLocale);
    } catch (e) {
      // ignore
    }
  };

  const toggleLocale = () => {
    setLocale(locale === 'AR' ? 'EN' : 'AR');
  };

  useEffect(() => {
    document.documentElement.lang = locale === 'AR' ? 'ar' : 'en';
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    if (isRTL) {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }, [locale, isRTL]);

  const t = (key) => {
    const dict = TRANSLATIONS[locale] || TRANSLATIONS.EN;
    return dict[key] || TRANSLATIONS.EN[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, toggleLocale, isRTL, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
