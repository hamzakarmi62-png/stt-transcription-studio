import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api.js";
import { sleep, uid } from "../utils.js";
import UserMenu from "./UserMenu.jsx";

const ACCEPTED = ".mp3,.wav,.m4a,.ogg,.mp4,.webm,.mkv,.avi";

const TRANSLATIONS = {
  ar: {
    title: "Transcription Studio Pro",
    subtitle: "نظام إدارة وتحليل التفريغ الصوتي بالذكاء الاصطناعي",
    navHome: "الرئيسية والتحليلات",
    navTranscribe: "تسجيل وتحويل جديد",
    navMyFiles: "ملفاتي والمجلدات",
    navArchive: "أرشيف الجلسات",
    navSettings: "إعدادات النظام",
    totalSessions: "إجمالي الجلسات",
    completedSessions: "الجلسات المكتملة",
    totalSegments: "إجمالي المقاطع",
    systemStatus: "حالة النظام",
    connected: "متصل وعمليات مستقرة",
    uploadTitle: "اسحب ملف الصوت أو الفيديو هنا",
    uploadDesc: "يدعم صيغ: MP3, WAV, M4A, OGG, MP4, MKV (الملفات الكبيرة مقبولة)",
    browse: "تصفح الملفات",
    orRecord: "أو التسجيل المباشر",
    recordMic: "بدء التسجيل المباشر بالميكروفون",
    recording: "جاري التسجيل المباشر…",
    stopRecord: "إيقاف التسجيل",
    discardRecord: "حذف",
    reRecord: "إعادة",
    aiOptions: "خيارات نموذج الذكاء الاصطناعي",
    audioLang: "لغة الملف الصوتي",
    expectedSpeakers: "عدد المتحدثين",
    autoSpeakers: "التحديد التلقائي للمتحدثين (Diarization)",
    startTranscribe: "بدء المعالجة والتفريغ الفوري",
    processing: "جاري المعالجة والتحليل بالذكاء الاصطناعي (الملفات الكبيرة تستغرق وقتاً أطول للاستفادة من الدقة العالية)...",
    transcribingMsg: "جاري التفريغ الصوتي (Whisper)... قد يستغرق دقيقة أو أكثر للملفات الكبيرة.",
    diarizingMsg: "جاري تصنيف وتمييز المتحدثين...",
    searchPlaceholder: "بحث شامل في الملفات...",
    allStatus: "جميع الحالات",
    completedOnly: "المكتملة فقط",
    processingStatus: "قيد المعالجة",
    archiveTitle: "أرشيف العمليات والجلسات",
    archiveDesc: "سجل كامل لجميع عمليات التفريغ السابقة مع إمكانية التصدير والبحث",
    openSession: "فتح واستعراض الملف ←",
    delete: "حذف",
    myFilesTitle: "إدارة المجلدات والملفات المخصصة",
    myFilesDesc: "نظم تفريغاتك داخل مجلدات مسمّاة لضمان عدم حدوث أي خلط في بياناتك",
    createNewFolder: "إنشاء مجلد جديد +",
    folderPrompt: "أدخل اسم المجلد الجديد (مثال: مقابلات العملاء، محاضرات جامعية):",
    allFiles: "جميع الملفات المحفوظة",
    moveToFolder: "نقل إلى مجلد:",
    noFolder: "بدون مجلد رئيسي",
    addToCustom: "إضافة للمفضلة / ملفاتي",
    removeFromCustom: "إزالة من ملفاتي",
    renameFile: "تسمية",
    renamePrompt: "أدخل الاسم المخصص لهذا الملف:",
    settingsTitle: "إعدادات المظهر واللغة والنظام",
    autoSave: "الحفظ التلقائي",
    autoSaveDesc: "حفظ التعديلات والتصحيحات النصية لحظياً",
    themeMode: "مظهر الشاشة",
    darkMode: "الوضع المظلم (Dark)",
    lightMode: "الوضع الفاتح (Light)",
    languageUi: "لغة واجهة لوحة التحكم",
    quickActions: "الإجراءات السريعة",
    recentFiles: "أحدث الملفات المضافة",
    welcomeBack: "مرحباً بك في لوحة تحكم استوديو التفريغ الصوتي",
    welcomeDesc: "استخدم الذكاء الاصطناعي لتحويل وتسجيل وتحليل الملفات الصوتية والمرئية وتنظيمها في مجلدات مخصصة بكل احترافية.",
    startNewTranscribe: "🎙️ بدء تحويل جديد",
    browseMyFiles: "📁 استعراض ملفاتي",
    favoriteFiles: "الملفات المفضلة والأعمال الخاصة",
    viewAll: "عرض الكل ←",
    noFavorites: "لا توجد ملفات مفضلة محفوظة حالياً",
    availableFolders: "المجلدات المتاحة",
    open: "فتح",
    noFilesFolder: "لا توجد ملفات في هذا المجلد حالياً.",
    noFilesFolderDesc: "انقر على أيقونة النجمة (⭐) في الأرشيف لحفظ الملفات هنا ونقلها بين المجلدات.",
    folderLabel: "📂 المجلد:",
    systemState: "حالة النظام",
    active: "نشط",
    largeFileTip: "💡 ملاحظة: معالجة الملفات الكبيرة قد تستغرق بضع دقائق نظراً للتحليل الصوتي العميق محلياً. يرجى الانتظار وعدم إغلاق الصفحة.",
  },
  en: {
    title: "Transcription Studio Pro",
    subtitle: "Enterprise AI Speech Transcription & Analysis Suite",
    navHome: "Dashboard & Overview",
    navTranscribe: "New Transcription",
    navMyFiles: "My Files & Folders",
    navArchive: "Sessions Archive",
    navSettings: "System Settings",
    totalSessions: "Total Sessions",
    completedSessions: "Completed",
    totalSegments: "Total Segments",
    systemStatus: "System Status",
    connected: "Online & Stable",
    uploadTitle: "Drag & drop audio or video file here",
    uploadDesc: "Supports: MP3, WAV, M4A, OGG, MP4, MKV (Large files supported)",
    browse: "Browse Files",
    orRecord: "or direct recording",
    recordMic: "Start Live Microphone Recording",
    recording: "Recording live...",
    stopRecord: "Stop Recording",
    discardRecord: "Discard",
    reRecord: "Re-record",
    aiOptions: "AI Model Options",
    audioLang: "Audio Language",
    expectedSpeakers: "Expected Speakers",
    autoSpeakers: "Automatic Speaker Detection (Diarization)",
    startTranscribe: "Start Transcription & Analysis",
    processing: "Processing large file with AI (may take a few minutes for deep analysis)...",
    transcribingMsg: "Running speech recognition (Whisper)... Large files take a bit longer.",
    diarizingMsg: "Detecting and separating speakers...",
    searchPlaceholder: "Global search across files...",
    allStatus: "All Statuses",
    completedOnly: "Completed Only",
    processingStatus: "Processing",
    archiveTitle: "Operations & Sessions Archive",
    archiveDesc: "Complete history of previous transcriptions with export & search",
    openSession: "Open & Review File →",
    delete: "Delete",
    myFilesTitle: "Custom Folders & Files Manager",
    myFilesDesc: "Organize transcriptions into named folders to prevent any confusion",
    createNewFolder: "+ New Folder",
    folderPrompt: "Enter new folder name (e.g., Client Interviews):",
    allFiles: "All Saved Files",
    moveToFolder: "Move to folder:",
    noFolder: "No Folder (Root)",
    addToCustom: "Add to My Files",
    removeFromCustom: "Remove from My Files",
    renameFile: "Rename",
    renamePrompt: "Enter custom name for this file:",
    settingsTitle: "Theme, Language & System Settings",
    autoSave: "Auto-Save",
    autoSaveDesc: "Automatically save text edits instantly",
    themeMode: "Display Theme",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    languageUi: "Dashboard UI Language",
    quickActions: "Quick Actions",
    recentFiles: "Recent Files",
    welcomeBack: "Welcome to your Professional Transcription Control Panel",
    welcomeDesc: "Use artificial intelligence to transcribe, record, and analyze audio and video files and organize them into custom folders.",
    startNewTranscribe: "🎙️ Start New Transcription",
    browseMyFiles: "📁 Browse My Files",
    favoriteFiles: "Favorite Files & Custom Works",
    viewAll: "View All →",
    noFavorites: "No favorite files saved yet",
    availableFolders: "Available Folders",
    open: "Open",
    noFilesFolder: "No files in this folder yet.",
    noFilesFolderDesc: "Click the star icon (⭐) in the archive to save files here and organize them.",
    folderLabel: "📂 Folder:",
    systemState: "System State",
    active: "Active",
    largeFileTip: "💡 Tip: Large files may take a few minutes to process locally due to deep AI speech analysis. Please keep the page open.",
  },
  fr: {
    title: "Studio de Transcription Pro",
    subtitle: "Suite Enterprise de Transcription & Analyse Vocale par IA",
    navHome: "Tableau de Bord",
    navTranscribe: "Nouvelle Transcription",
    navMyFiles: "Mes Fichiers & Dossiers",
    navArchive: "Archive des Sessions",
    navSettings: "Paramètres Système",
    totalSessions: "Total Sessions",
    completedSessions: "Terminées",
    totalSegments: "Total Segments",
    systemStatus: "État Système",
    connected: "En Ligne & Stable",
    uploadTitle: "Glissez-déposez un fichier audio ou vidéo",
    uploadDesc: "Supporte : MP3, WAV, M4A, OGG, MP4, MKV (Gros fichiers acceptés)",
    browse: "Parcourir",
    orRecord: "ou enregistrement direct",
    recordMic: "Enregistrement Micro en Direct",
    recording: "Enregistrement en cours...",
    stopRecord: "Arrêter l'enregistrement",
    discardRecord: "Supprimer",
    reRecord: "Réenregistrer",
    aiOptions: "Options du Modèle IA",
    audioLang: "Langue Audio",
    expectedSpeakers: "Locuteurs Attendus",
    autoSpeakers: "Détection Automatique des Locuteurs",
    startTranscribe: "Démarrer la Transcription",
    processing: "Traitement des fichiers volumineux par l'IA (cela peut prendre quelques minutes)...",
    transcribingMsg: "Transcription en cours (Whisper)... Les gros fichiers nécessitent un peu plus de temps.",
    diarizingMsg: "Sélection et séparation des locuteurs...",
    searchPlaceholder: "Recherche globale...",
    allStatus: "Tous les statuts",
    completedOnly: "Terminés uniquement",
    processingStatus: "En cours",
    archiveTitle: "Archive des Sessions",
    archiveDesc: "Historique complet des transcriptions précédentes",
    openSession: "Ouvrir le fichier →",
    delete: "Supprimer",
    myFilesTitle: "Gestionnaire de Dossiers & Fichiers",
    myFilesDesc: "Organisez vos transcriptions dans des dossiers nommés",
    createNewFolder: "+ Nouveau Dossier",
    folderPrompt: "Entrez le nom du nouveau dossier (ex: Réunions, Cours) :",
    allFiles: "Tous les Fichiers",
    moveToFolder: "Déplacer vers :",
    noFolder: "Sans dossier",
    addToCustom: "Ajouter aux favoris",
    removeFromCustom: "Retirer des favoris",
    renameFile: "Renommer",
    renamePrompt: "Entrez le nouveau nom personnalisé :",
    settingsTitle: "Paramètres du Système, Langue & Thème",
    autoSave: "Sauvegarde Automatique",
    autoSaveDesc: "Sauvegarder automatiquement les modifications",
    themeMode: "Mode d'Affichage",
    darkMode: "Mode Sombre",
    lightMode: "Mode Clair",
    languageUi: "Langue de l'Interface",
    quickActions: "Actions Rapides",
    recentFiles: "Fichiers Récents",
    welcomeBack: "Bienvenue dans votre Studio de Transcription",
    welcomeDesc: "Utilisez l'intelligence artificielle pour transcrire, enregistrer et analyser vos fichiers audio et vidéo avec précision.",
    startNewTranscribe: "🎙️ Démarrer une transcription",
    browseMyFiles: "📁 Parcourir mes fichiers",
    favoriteFiles: "Fichiers Favoris & Travaux",
    viewAll: "Voir tout →",
    noFavorites: "Aucun fichier favori pour le moment",
    availableFolders: "Dossiers Disponibles",
    open: "Ouvrir",
    noFilesFolder: "Aucun fichier dans ce dossier pour le moment.",
    noFilesFolderDesc: "Cliquez sur l'icône étoile (⭐) dans l'archive pour enregistrer des fichiers ici.",
    folderLabel: "📂 Dossier :",
    systemState: "État du système",
    active: "Actif",
    largeFileTip: "💡 Conseil : Le traitement des gros fichiers peut prendre quelques minutes en raison de l'analyse IA locale en profondeur. Veuillez patienter.",
  },
};

const LANGUAGES = [
  { value: "", label: "Auto-detect / Détection auto" },
  { value: "ar", label: "Arabic (العربية)" },
  { value: "en", label: "English" },
  { value: "fr", label: "French (Français)" },
  { value: "es", label: "Spanish (Español)" },
  { value: "de", label: "German (Deutsch)" },
  { value: "tr", label: "Turkish (Türkçe)" },
];

export default function UploadScreen({ onComplete, user, onLogout }) {
  const [activeTab, setActiveTab] = useState("home"); // home | transcribe | myFiles | archive | settings
  const [uiLang, setUiLang] = useState("fr"); // ar | en | fr (Default to French)
  const [theme, setTheme] = useState("dark"); // dark | light

  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState("");
  const [detectSpeakers, setDetectSpeakers] = useState(true);
  const [numSpeakers, setNumSpeakers] = useState(2);
  const [phase, setPhase] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sessions, setSessions] = useState([]);
  
  const [customWorkIds, setCustomWorkIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("custom_works") || "[]");
    } catch {
      return [];
    }
  });

  const [customFileNames, setCustomFileNames] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("custom_file_names") || "{}");
    } catch {
      return {};
    }
  });

  const [folders, setFolders] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("custom_folders") || '[{"id":"default","name":"Général / General"}]');
    } catch {
      return [{ id: "default", name: "Général / General" }];
    }
  });

  const [sessionFolderMap, setSessionFolderMap] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("session_folder_map") || "{}");
    } catch {
      return {};
    }
  });

  const [selectedFolderFilter, setSelectedFolderFilter] = useState("all");
  const [dragOver, setDragOver] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [systemHealth, setSystemHealth] = useState(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  const [recording, setRecording] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
  const [recUrl, setRecUrl] = useState(null);
  const [recBlob, setRecBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);

  const t = TRANSLATIONS[uiLang] || TRANSLATIONS.fr;

  const loadSessions = useCallback(async () => {
    try {
      const list = await api.listSessions();
      setSessions(list);
    } catch {
      /* ignore */
    }
  }, []);

  const checkHealth = useCallback(async () => {
    try {
      const h = await api.getHealth();
      setSystemHealth(h);
    } catch {
      setSystemHealth({ status: "offline" });
    }
  }, []);

  useEffect(() => {
    loadSessions();
    checkHealth();
  }, [loadSessions, checkHealth]);

  useEffect(() => {
    try {
      localStorage.setItem("custom_works", JSON.stringify(customWorkIds));
    } catch {
      /* ignore */
    }
  }, [customWorkIds]);

  useEffect(() => {
    try {
      localStorage.setItem("custom_file_names", JSON.stringify(customFileNames));
    } catch {
      /* ignore */
    }
  }, [customFileNames]);

  useEffect(() => {
    try {
      localStorage.setItem("custom_folders", JSON.stringify(folders));
    } catch {
      /* ignore */
    }
  }, [folders]);

  useEffect(() => {
    try {
      localStorage.setItem("session_folder_map", JSON.stringify(sessionFolderMap));
    } catch {
      /* ignore */
    }
  }, [sessionFolderMap]);

  const toggleCustomWork = (e, id) => {
    e.stopPropagation();
    setCustomWorkIds((prev) => {
      const next = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      if (!prev.includes(id) && !customFileNames[id]) {
        const session = sessions.find((s) => s.id === id);
        const defaultName = session ? session.filename : "My File";
        const customName = prompt(t.renamePrompt, defaultName);
        if (customName && customName.trim()) {
          setCustomFileNames((fn) => ({ ...fn, [id]: customName.trim() }));
        }
      }
      return next;
    });
  };

  const handleRename = (e, id) => {
    e.stopPropagation();
    const currentName = customFileNames[id] || sessions.find((s) => s.id === id)?.filename || "";
    const newName = prompt(t.renamePrompt, currentName);
    if (newName !== null && newName.trim()) {
      setCustomFileNames((fn) => ({ ...fn, [id]: newName.trim() }));
    }
  };

  const handleCreateFolder = () => {
    const folderName = prompt(t.folderPrompt);
    if (folderName && folderName.trim()) {
      const newFolder = { id: uid(), name: folderName.trim() };
      setFolders((prev) => [...prev, newFolder]);
    }
  };

  const handleMoveToFolder = (sessionId, folderId) => {
    setSessionFolderMap((prev) => ({ ...prev, [sessionId]: folderId }));
  };

  const resetRecording = () => {
    setRecording(false);
    setRecSeconds(0);
    setRecUrl(null);
    setRecBlob(null);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const startRecording = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "";
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const type = mime || recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type });
        setRecBlob(blob);
        setRecUrl(URL.createObjectURL(blob));
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
      setRecSeconds(0);
      timerRef.current = setInterval(() => setRecSeconds((s) => s + 1), 1000);
    } catch (e) {
      setError("Microphone access denied: " + e.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => () => resetRecording(), []);

  const selectedBlob = file || recBlob;

  const pollStatus = async (id, target) => {
    let consecutiveErrors = 0;
    const startedAt = Date.now();
    const POLL_TIMEOUT_MS = 30 * 60 * 1000; // 30 min ceiling for very long audio
    for (;;) {
      await sleep(2000);
      if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
        throw new Error(uiLang === "ar" ? "استغرقت المعالجة وقتاً طويلاً جداً، توقفت الانتظار. تحقق من الجلسة لاحقاً أو أعد المحاولة." : "Processing timed out after 30 minutes.");
      }
      try {
        const s = await api.getSession(id);
        consecutiveErrors = 0;
        if (s.status === "error") throw new Error(s.error || "فشلت معالجة الملف الصوتي بالذكاء الاصطناعي");
        if (s.status === target) return s;
      } catch (err) {
        if (err.message && (err.message.includes("فشلت") || err.message.includes("failed") || err.message.includes("خطأ"))) {
          throw err;
        }
        consecutiveErrors++;
        if (consecutiveErrors > 20) {
          throw err;
        }
      }
    }
  };

  const handleProcess = async () => {
    if (!selectedBlob) return;
    setError("");
    setMessage("");
    try {
      setPhase("uploading");
      setProgress(0);
      const fileSizeMB = (selectedBlob.size / (1024 * 1024)).toFixed(1);
      const isLarge = selectedBlob.size > 10 * 1024 * 1024;
      if (isLarge) {
        setMessage(
          uiLang === "ar"
            ? `📦 جاري رفع الملف (${fileSizeMB} MB) بالرفع المجزّأ... يرجى الانتظار`
            : uiLang === "fr"
            ? `📦 Envoi du fichier (${fileSizeMB} MB) en morceaux...`
            : `📦 Uploading file (${fileSizeMB} MB) in chunks...`
        );
      }
      const session = await api.upload(selectedBlob, setProgress);

      setPhase("transcribing");
      setMessage(t.transcribingMsg);
      await api.startTranscribe(session.id, language);
      await pollStatus(session.id, "transcribed");

      setPhase("diarizing");
      setMessage(t.diarizingMsg);
      await api.startDiarize(session.id, detectSpeakers ? numSpeakers : 1);
      await pollStatus(session.id, "done");

      const full = await api.getSession(session.id);
      setPhase("done");
      await loadSessions();
      onComplete(full);
    } catch (e) {
      console.error("Pipeline error:", e);
      setPhase("error");
      const errText = e?.message || (typeof e === "string" ? e : "");
      setError(errText && errText !== "{}" ? errText : "حدث خطأ غير متوقع أثناء المعالجة، يرجى المحاولة مجدداً.");
    }
  };


  const openSession = (s) => {
    setError("");
    setPhase("done");
    onComplete(s);
  };

  const deleteSession = async (e, id) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this session?")) return;
    try {
      await api.deleteSession(id);
      setCustomWorkIds((prev) => prev.filter((i) => i !== id));
      setCustomFileNames((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setSessionFolderMap((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      loadSessions();
    } catch {
      /* ignore */
    }
  };

  const busy = phase === "uploading" || phase === "transcribing" || phase === "diarizing";
  const hasAudio = !!selectedBlob;

  const totalSessionsCount = sessions.length;
  const completedSessionsCount = sessions.filter((s) => s.status === "done").length;
  const totalSegmentsCount = sessions.reduce((acc, s) => acc + (s.segments?.length || 0), 0);

  const filteredSessions = sessions.filter((s) => {
    const matchesSearch = (customFileNames[s.id] || s.filename || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const customWorksSessions = sessions.filter((s) => customWorkIds.includes(s.id));
  const folderFilteredSessions =
    selectedFolderFilter === "all"
      ? customWorksSessions
      : customWorksSessions.filter((s) => (sessionFolderMap[s.id] || "default") === selectedFolderFilter);

  // ---- Design tokens (premium light UI + always-dark sidebar) ----
  const isDark = theme === "dark";
  const bgMain = isDark ? "bg-slate-100 text-slate-900" : "bg-slate-50 text-slate-900";
  const bgCard = isDark ? "bg-slate-950/70 border-slate-800" : "bg-white border-slate-200/80 shadow-sm";
  const textSub = isDark ? "text-slate-400" : "text-slate-500";
  const inputBg = isDark ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-slate-300 text-slate-900";
  const cardHead = isDark ? "border-slate-800" : "border-slate-100";

  const NAV = [
    {
      id: "home",
      label: t.navHome,
      icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    },
    {
      id: "transcribe",
      label: t.navTranscribe,
      icon: "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z",
    },
    {
      id: "myFiles",
      label: t.navMyFiles,
      badge: customWorksSessions.length,
      badgeCls: "bg-amber-400/15 text-amber-300",
      icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4",
    },
    {
      id: "archive",
      label: t.navArchive,
      badge: sessions.length,
      badgeCls: "bg-indigo-400/15 text-indigo-300",
      icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
    },
    {
      id: "settings",
      label: t.navSettings,
      icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
    },
  ];

  const STATUS_META = {
    done: { label: "Terminé", cls: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" },
    transcribed: { label: "Transcrit", cls: "bg-sky-500/10 text-sky-600 border-sky-500/30" },
    processing: { label: "En cours", cls: "bg-amber-500/10 text-amber-600 border-amber-500/30 animate-pulse" },
    error: { label: "Erreur", cls: "bg-red-500/10 text-red-600 border-red-500/30" },
    uploaded: { label: "En attente", cls: "bg-slate-500/10 text-slate-500 border-slate-400/30" },
  };
  const statusMeta = (s) => STATUS_META[s.status] || STATUS_META.uploaded;
  const isVideo = (s) => (s.kind === "video") || /\.(mp4|webm|mov|m4v|mkv|avi)$/i.test(s.filename || "");

  const PIPELINE_STEPS = [
    { key: "uploading", label: "Envoi" },
    { key: "transcribing", label: "Transcription" },
    { key: "diarizing", label: "Locuteurs" },
  ];
  const phaseOrder = ["idle", "uploading", "transcribing", "diarizing", "done"];
  const activeStep = phase === "error" ? -1 : Math.max(0, phaseOrder.indexOf(phase) - 1);

  const navButton = (item) => {
    const active = activeTab === item.id;
    return (
      <button
        key={item.id}
        onClick={() => setActiveTab(item.id)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-semibold transition-all duration-200 ${
          active
            ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-950/50"
            : "text-slate-400 hover:bg-white/5 hover:text-white"
        }`}
      >
        <svg className="w-[18px] h-[18px] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {item.icon.split(" M").map((d, i) => (
            <path key={i} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d={i === 0 ? d : "M" + d} />
          ))}
        </svg>
        <span className="flex-1 text-start truncate">{item.label}</span>
        {item.badge !== undefined && item.badge > 0 && (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.badgeCls}`}>{item.badge}</span>
        )}
      </button>
    );
  };

  return (
    <div className={`min-h-screen ${bgMain} transition-colors duration-200`} dir={uiLang === "ar" ? "rtl" : "ltr"}>
      {/* ── Fixed dark sidebar ─────────────────────────────────────── */}
      <aside className="hidden lg:flex w-[264px] bg-slate-950 border-r border-white/5 flex-col fixed inset-y-0 z-40">
        <div className="p-5">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 flex items-center justify-center text-lg shadow-lg shadow-indigo-950">
              🎙️
            </div>
            <div>
              <h1 className="text-white font-black tracking-tight leading-none">Zendocs</h1>
              <p className="text-[10px] text-indigo-300/70 mt-1">Studio de transcription IA</p>
            </div>
          </div>
        </div>

        <nav className="px-3 space-y-1.5 flex-1 overflow-y-auto">{NAV.map(navButton)}</nav>

        <div className="p-4">
          <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3.5">
            <div className="flex items-center justify-between text-[11px] font-semibold">
              <span className="text-slate-400">{t.systemState}</span>
              <span className="text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {systemHealth ? t.connected : t.active}
              </span>
            </div>
            <div className="mt-2.5 pt-2.5 border-t border-white/5 text-[10px] text-slate-500 flex items-center justify-between">
              <span>Groq · Whisper AI</span>
              <span className="text-slate-600">v2.0</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main column ────────────────────────────────────────────── */}
      <div className="lg:ml-[264px] flex flex-col min-h-screen">
        {/* Top navbar with account box */}
        <header
          className={`sticky top-0 z-30 border-b backdrop-blur-xl ${
            isDark ? "bg-slate-100/85 border-slate-200" : "bg-white/85 border-slate-200"
          }`}
        >
          <div className="px-4 sm:px-6 h-16 flex items-center gap-3">
            <div className="lg:hidden flex items-center gap-2 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 flex items-center justify-center text-sm">
                🎙️
              </div>
              <span className="font-black tracking-tight text-slate-900">Zendocs</span>
            </div>

            <div className="relative flex-1 max-w-lg ml-auto hidden sm:block">
              <svg
                className="w-4 h-4 absolute inset-y-0 my-auto start-3 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full rounded-2xl border ps-10 pe-4 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-400 transition ${inputBg}`}
              />
            </div>

            <div className="flex items-center gap-2 ms-auto">
              <select
                value={uiLang}
                onChange={(e) => setUiLang(e.target.value)}
                className={`hidden md:block text-xs rounded-xl px-2.5 py-2 border font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${inputBg} cursor-pointer`}
              >
                <option value="ar">العربية</option>
                <option value="en">EN</option>
                <option value="fr">FR</option>
              </select>
              <button
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className={`w-9 h-9 rounded-xl border flex items-center justify-center text-sm transition ${
                  isDark
                    ? "bg-slate-950 border-slate-700 hover:bg-slate-800"
                    : "bg-white border-slate-200 hover:bg-slate-50"
                }`}
                title={isDark ? t.lightMode : t.darkMode}
              >
                {isDark ? "☀️" : "🌙"}
              </button>
              <div className={`w-px h-8 ${isDark ? "bg-slate-300" : "bg-slate-200"} mx-1 hidden sm:block`}></div>
              <UserMenu user={user} onLogout={onLogout} />
            </div>
          </div>

          {/* Mobile nav pills */}
          <div className="lg:hidden flex gap-1.5 overflow-x-auto px-4 pb-3 [scrollbar-width:none]">
            {NAV.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition ${
                    active
                      ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30"
                      : isDark
                      ? "bg-slate-950 text-slate-400 border border-slate-800"
                      : "bg-white text-slate-500 border border-slate-200"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </header>

        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
          {/* ── Stats ────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: t.totalSessions, value: totalSessionsCount, grad: "from-indigo-500 to-violet-500", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
              { label: t.completedSessions, value: completedSessionsCount, grad: "from-emerald-500 to-teal-500", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
              { label: t.totalSegments, value: totalSegmentsCount, grad: "from-violet-500 to-fuchsia-500", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
              { label: t.systemStatus, value: null, grad: "from-amber-500 to-orange-500", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
            ].map((st) => (
              <div
                key={st.label}
                className={`${bgCard} rounded-3xl p-5 border relative overflow-hidden group hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300`}
              >
                <div className={`absolute -top-8 -end-8 w-24 h-24 rounded-full bg-gradient-to-br ${st.grad} opacity-[0.07] blur-xl group-hover:opacity-20 transition-opacity`}></div>
                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${st.grad} text-white flex items-center justify-center shadow-lg`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={st.icon} />
                  </svg>
                </div>
                <p className={`text-[11px] font-semibold ${textSub} mt-3 uppercase tracking-wide`}>{st.label}</p>
                <h3 className="text-2xl font-black mt-0.5">
                  {st.value === null ? (
                    <span className="text-emerald-500 flex items-center gap-2 text-sm font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      {t.connected}
                    </span>
                  ) : (
                    st.value
                  )}
                </h3>
              </div>
            ))}
          </div>

          {/* ══ HOME ══════════════════════════════════════════════════ */}
          {activeTab === "home" && (
            <div className="space-y-6">
              {/* Hero */}
              <div className="relative overflow-hidden rounded-[28px] bg-slate-950 p-8 sm:p-12">
                <div className="absolute -top-32 -end-16 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -start-10 w-80 h-80 bg-fuchsia-600/20 rounded-full blur-3xl"></div>
                <div
                  className="absolute inset-0 opacity-[0.15]"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.25) 1px, transparent 0)",
                    backgroundSize: "26px 26px",
                  }}
                ></div>
                <div className="relative flex flex-wrap items-end justify-between gap-8">
                  <div className="space-y-4 max-w-xl">
                    <span className="inline-flex items-center gap-2 bg-white/10 border border-white/15 backdrop-blur text-indigo-200 px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      PROPULSÉ PAR L'IA · WHISPER + GROQ
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-black text-white leading-[1.15] tracking-tight">
                      {t.welcomeBack}
                    </h2>
                    <p className="text-slate-400 text-sm leading-relaxed">{t.welcomeDesc}</p>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => setActiveTab("transcribe")}
                      className="px-6 py-3.5 rounded-2xl bg-white text-slate-950 font-bold text-sm hover:bg-indigo-50 shadow-xl transition-all hover:-translate-y-0.5"
                    >
                      {t.startNewTranscribe}
                    </button>
                    <button
                      onClick={() => setActiveTab("myFiles")}
                      className="px-6 py-3.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur text-white font-bold text-sm hover:bg-white/20 transition-all"
                    >
                      {t.browseMyFiles}
                    </button>
                  </div>
                </div>
              </div>

              {/* Favorites + Folders */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className={`${bgCard} border rounded-3xl p-6 space-y-4`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-sm flex items-center gap-2 uppercase tracking-wide">
                      <span className="text-amber-500">★</span> {t.favoriteFiles}
                    </h3>
                    <button
                      onClick={() => setActiveTab("myFiles")}
                      className="text-xs text-indigo-500 font-bold hover:underline"
                    >
                      {t.viewAll}
                    </button>
                  </div>
                  {customWorksSessions.length === 0 ? (
                    <p className={`text-xs ${textSub} py-8 text-center rounded-2xl border border-dashed ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                      {t.noFavorites}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {customWorksSessions.slice(0, 4).map((s) => (
                        <div
                          key={s.id}
                          onClick={() => openSession(s)}
                          className={`p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all hover:border-indigo-400 hover:shadow-md ${inputBg}`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs shrink-0 ${isVideo(s) ? "bg-violet-500/15 text-violet-500" : "bg-indigo-500/15 text-indigo-500"}`}>
                            {isVideo(s) ? "🎬" : "🎵"}
                          </div>
                          <span className="font-semibold text-xs truncate flex-1">
                            {customFileNames[s.id] || s.filename}
                          </span>
                          <span className="text-[10px] text-indigo-500 font-bold">{t.open} ↗</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className={`${bgCard} border rounded-3xl p-6 space-y-4`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-sm flex items-center gap-2 uppercase tracking-wide">
                      <span className="text-indigo-500">▣</span> {t.availableFolders}
                    </h3>
                    <button
                      onClick={handleCreateFolder}
                      className="text-xs text-indigo-500 font-bold hover:underline"
                    >
                      {t.createNewFolder}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {folders.map((f) => {
                      const count = sessions.filter((s) => (sessionFolderMap[s.id] || "default") === f.id).length;
                      return (
                        <div
                          key={f.id}
                          onClick={() => {
                            setSelectedFolderFilter(f.id);
                            setActiveTab("myFiles");
                          }}
                          className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all hover:border-indigo-400 hover:shadow-md ${inputBg}`}
                        >
                          <span className="font-semibold text-xs truncate">📂 {f.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 font-bold">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ TRANSCRIBE ════════════════════════════════════════════ */}
          {activeTab === "transcribe" && (
            <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
              <div className="space-y-6">
                <div className={`${bgCard} rounded-3xl p-6 sm:p-8 border`}>
                  <h2 className="text-base font-black mb-5 flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-sm">
                      ↑
                    </span>
                    {t.uploadTitle}
                  </h2>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      const f = e.dataTransfer.files?.[0];
                      if (f) {
                        setFile(f);
                        resetRecording();
                        setError("");
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`cursor-pointer border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-300 ${
                      dragOver
                        ? "border-indigo-500 bg-indigo-500/10 scale-[1.01]"
                        : isDark
                        ? "border-slate-800 hover:border-indigo-500/60 bg-slate-950/40"
                        : "border-slate-300 hover:border-indigo-400 bg-slate-50/50"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={ACCEPTED}
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          setFile(f);
                          resetRecording();
                          setError("");
                        }
                      }}
                    />
                    <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-br from-indigo-500/15 to-violet-500/15 border border-indigo-500/20 flex items-center justify-center text-3xl mb-4">
                      🎧
                    </div>
                    <p className="font-bold text-sm">{t.uploadTitle}</p>
                    <p className={`text-xs ${textSub} mt-1.5`}>{t.uploadDesc}</p>
                    {file && (
                      <div className="mt-5 inline-flex items-center gap-3 bg-indigo-500/10 text-indigo-600 border border-indigo-500/30 px-4 py-2.5 rounded-2xl text-sm font-semibold">
                        <span>📄 {file.name}</span>
                        <button
                          className="text-slate-400 hover:text-red-500 font-black"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="my-7 flex items-center gap-3">
                    <div className={`h-px flex-1 ${isDark ? "bg-slate-800" : "bg-slate-200"}`} />
                    <span className={`text-[10px] ${textSub} uppercase tracking-[0.2em] font-bold`}>
                      {t.orRecord}
                    </span>
                    <div className={`h-px flex-1 ${isDark ? "bg-slate-800" : "bg-slate-200"}`} />
                  </div>

                  <div>
                    {!recording && !recBlob && (
                      <button
                        onClick={startRecording}
                        className={`w-full rounded-2xl border-2 py-4 text-center font-bold transition-all flex items-center justify-center gap-2.5 ${
                          isDark
                            ? "border-slate-800 bg-slate-950/50 hover:border-red-500 hover:bg-red-500/10 text-slate-200"
                            : "border-slate-200 bg-white hover:border-red-400 hover:bg-red-50 text-slate-700"
                        }`}
                      >
                        <span className="w-3 h-3 rounded-full bg-red-500 shadow shadow-red-500/50"></span>
                        {t.recordMic}
                      </button>
                    )}

                    {recording && (
                      <div className="rounded-2xl border-2 border-red-500/50 bg-red-500/10 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-3.5 h-3.5 rounded-full bg-red-500 animate-ping" />
                          <span className="font-black text-red-500 tabular-nums">
                            {String(Math.floor(recSeconds / 60)).padStart(2, "0")}:{String(recSeconds % 60).padStart(2, "0")}
                          </span>
                          <span className="text-xs text-red-400 font-semibold">{t.recording}</span>
                        </div>
                        <button
                          onClick={stopRecording}
                          className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-600/30 text-sm"
                        >
                          {t.stopRecord}
                        </button>
                      </div>
                    )}

                    {recUrl && (
                      <div className={`rounded-2xl border p-4 space-y-3 ${isDark ? "border-slate-800 bg-slate-950/60" : "border-slate-200 bg-slate-50"}`}>
                        <audio src={recUrl} controls className="w-full accent-indigo-600" />
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setRecUrl(null);
                              setRecBlob(null);
                            }}
                            className={`px-4 py-2 rounded-xl border text-xs font-bold ${isDark ? "border-slate-800 hover:bg-slate-800 text-slate-300" : "border-slate-300 hover:bg-slate-100 text-slate-700"}`}
                          >
                            {t.discardRecord}
                          </button>
                          <button
                            onClick={() => {
                              if (mediaRecorderRef.current) resetRecording();
                              startRecording();
                            }}
                            className={`px-4 py-2 rounded-xl border text-xs font-bold ${isDark ? "border-slate-800 hover:bg-slate-800 text-slate-300" : "border-slate-300 hover:bg-slate-100 text-slate-700"}`}
                          >
                            {t.reRecord}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Options + CTA panel */}
              <div className={`${bgCard} rounded-3xl p-6 border space-y-5 lg:sticky lg:top-24`}>
                <h2 className="text-base font-black flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center text-sm">⚙</span>
                  {t.aiOptions}
                </h2>

                <div>
                  <label className={`block text-xs font-bold ${textSub} mb-2`}>{t.audioLang}</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className={`w-full rounded-2xl border px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 ${inputBg}`}
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.value} value={l.value}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-bold ${textSub} mb-2`}>{t.expectedSpeakers}</label>
                  <select
                    value={numSpeakers}
                    onChange={(e) => setNumSpeakers(Number(e.target.value))}
                    disabled={!detectSpeakers}
                    className={`w-full rounded-2xl border px-3.5 py-3 text-sm disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 ${inputBg}`}
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>

                <label className="flex items-center gap-3 text-sm font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={detectSpeakers}
                    onChange={(e) => setDetectSpeakers(e.target.checked)}
                    className="w-4 h-4 rounded accent-indigo-600"
                  />
                  {t.autoSpeakers}
                </label>

                {/* Pipeline steps */}
                <div className={`rounded-2xl border p-4 space-y-3 ${isDark ? "border-slate-800 bg-slate-950/40" : "border-slate-200 bg-slate-50/60"}`}>
                  {PIPELINE_STEPS.map((step, i) => {
                    const done = activeStep > i || phase === "done";
                    const active = activeStep === i && busy;
                    return (
                      <div key={step.key} className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 transition-all ${
                            done
                              ? "bg-emerald-500 text-white"
                              : active
                              ? "bg-indigo-600 text-white animate-pulse"
                              : isDark
                              ? "bg-slate-800 text-slate-500"
                              : "bg-slate-200 text-slate-400"
                          }`}
                        >
                          {done ? "✓" : i + 1}
                        </span>
                        <span
                          className={`text-xs font-bold ${
                            active ? "text-indigo-500" : done ? "text-emerald-600" : textSub
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}

                  {phase === "uploading" && (
                    <div className="space-y-1.5 pt-2">
                      <div className={`flex justify-between text-xs font-bold ${textSub}`}>
                        <span>Upload…</span>
                        <span className="text-indigo-500">{progress}%</span>
                      </div>
                      <div className={`h-2 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-200"}`}>
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {(phase === "transcribing" || phase === "diarizing") && (
                    <div className="space-y-2 pt-2">
                      <div className="h-2 rounded-full overflow-hidden bg-gradient-to-r from-indigo-500/30 via-indigo-500 to-indigo-500/30 animate-pulse" />
                      <p className="text-[11px] text-amber-500 font-medium leading-relaxed">{t.largeFileTip}</p>
                    </div>
                  )}
                </div>

                {phase === "error" && (
                  <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/30 rounded-2xl p-3.5 font-semibold">
                    ⚠️ {error}
                  </div>
                )}

                <button
                  onClick={handleProcess}
                  disabled={!hasAudio || busy}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-black text-sm hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-xl shadow-indigo-600/25 transition-all hover:-translate-y-0.5"
                >
                  {busy ? "⏳ " + t.processing : "⚡ " + t.startTranscribe}
                </button>
              </div>
            </div>
          )}

          {/* ══ ARCHIVE ═══════════════════════════════════════════════ */}
          {activeTab === "archive" && (
            <div className={`${bgCard} rounded-3xl p-6 sm:p-8 border space-y-6`}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-lg font-black">{t.archiveTitle}</h2>
                  <p className={`text-xs ${textSub} mt-0.5`}>{t.archiveDesc}</p>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`rounded-2xl border px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/60 ${inputBg} cursor-pointer`}
                >
                  <option value="all">{t.allStatus}</option>
                  <option value="done">{t.completedOnly}</option>
                  <option value="processing">{t.processingStatus}</option>
                </select>
              </div>

              {filteredSessions.length === 0 ? (
                <div className={`text-center py-20 ${textSub} rounded-3xl border-2 border-dashed ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                  <p className="text-4xl mb-3">📭</p>
                  <p className="font-bold text-sm">Aucune session trouvée</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredSessions.map((s) => {
                    const isCustom = customWorkIds.includes(s.id);
                    const displayName = customFileNames[s.id] || s.filename;
                    const st = statusMeta(s);
                    return (
                      <div
                        key={s.id}
                        onClick={() => openSession(s)}
                        className={`group flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 ${
                          isDark ? "bg-slate-950/50 border-slate-800 hover:border-indigo-500/60" : "bg-white border-slate-200 hover:border-indigo-400"
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg shrink-0 ${
                            isVideo(s)
                              ? "bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/20 text-violet-500"
                              : "bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 text-indigo-500"
                          }`}
                        >
                          {isVideo(s) ? "🎬" : "🎵"}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-sm truncate max-w-full group-hover:text-indigo-500 transition-colors" title={displayName}>
                              {displayName}
                            </h3>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${st.cls}`}>
                              {st.label}
                            </span>
                          </div>
                          <p className={`text-[11px] ${textSub} mt-1 truncate`}>
                            📅 {new Date(s.created_at).toLocaleString()} · 📝 {s.segments?.length ?? 0} segments · 🌐{" "}
                            {s.language || "auto"}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={(e) => toggleCustomWork(e, s.id)}
                            className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm transition ${
                              isCustom ? "text-amber-500 bg-amber-500/15" : "text-slate-400 hover:text-amber-500 hover:bg-amber-500/10"
                            }`}
                            title={isCustom ? t.removeFromCustom : t.addToCustom}
                          >
                            {isCustom ? "★" : "☆"}
                          </button>
                          <button
                            onClick={(e) => handleRename(e, s.id)}
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-sm text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition"
                            title={t.renameFile}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={(e) => deleteSession(e, s.id)}
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-sm text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition"
                            title={t.delete}
                          >
                            🗑
                          </button>
                          <svg className={`w-4 h-4 ms-2 hidden sm:block ${textSub} group-hover:text-indigo-500 transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ══ MY FILES ══════════════════════════════════════════════ */}
          {activeTab === "myFiles" && (
            <div className={`${bgCard} rounded-3xl p-6 sm:p-8 border space-y-6`}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-lg font-black">{t.myFilesTitle}</h2>
                  <p className={`text-xs ${textSub} mt-0.5`}>{t.myFilesDesc}</p>
                </div>
                <button
                  onClick={handleCreateFolder}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-xs hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-1.5"
                >
                  <span>＋</span> {t.createNewFolder}
                </button>
              </div>

              {/* Folder pills */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedFolderFilter("all")}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition ${
                    selectedFolderFilter === "all"
                      ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30"
                      : isDark
                      ? "bg-slate-950 text-slate-400 border border-slate-800 hover:border-indigo-500/50"
                      : "bg-white text-slate-500 border border-slate-200 hover:border-indigo-400"
                  }`}
                >
                  {t.allFiles} ({customWorksSessions.length})
                </button>
                {folders.map((f) => {
                  const count = customWorksSessions.filter((s) => (sessionFolderMap[s.id] || "default") === f.id).length;
                  const active = selectedFolderFilter === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFolderFilter(f.id)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition ${
                        active
                          ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30"
                          : isDark
                          ? "bg-slate-950 text-slate-400 border border-slate-800 hover:border-indigo-500/50"
                          : "bg-white text-slate-500 border border-slate-200 hover:border-indigo-400"
                      }`}
                    >
                      📂 {f.name} ({count})
                    </button>
                  );
                })}
              </div>

              {folderFilteredSessions.length === 0 ? (
                <div className={`text-center py-20 rounded-3xl border-2 border-dashed ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                  <div className="text-4xl mb-3">🗂️</div>
                  <p className="font-bold text-sm">{t.noFilesFolder}</p>
                  <p className={`text-xs mt-1.5 ${textSub}`}>{t.noFilesFolderDesc}</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {folderFilteredSessions.map((s) => {
                    const displayName = customFileNames[s.id] || s.filename;
                    const currentFolderId = sessionFolderMap[s.id] || "default";
                    return (
                      <div
                        key={s.id}
                        onClick={() => openSession(s)}
                        className={`group flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 ${
                          isDark ? "bg-slate-950/50 border-slate-800 hover:border-indigo-500/60" : "bg-white border-slate-200 hover:border-indigo-400"
                        }`}
                      >
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/15 to-orange-500/15 border border-amber-500/20 flex items-center justify-center text-lg shrink-0">
                          ★
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm truncate group-hover:text-indigo-500 transition-colors">
                            {displayName}
                          </h3>
                          <p className={`text-[11px] ${textSub} mt-1 truncate`}>
                            📅 {new Date(s.created_at).toLocaleString()} · 📝 {s.segments?.length ?? 0} segments
                          </p>
                        </div>
                        <div
                          className="flex items-center gap-2 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <select
                            value={currentFolderId}
                            onChange={(e) => handleMoveToFolder(s.id, e.target.value)}
                            className={`text-[11px] rounded-xl px-2.5 py-2 border font-bold focus:outline-none max-w-[140px] ${inputBg} cursor-pointer`}
                            title={t.moveToFolder}
                          >
                            {folders.map((f) => (
                              <option key={f.id} value={f.id}>
                                {f.name}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={(e) => handleRename(e, s.id)}
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-sm text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition"
                            title={t.renameFile}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={(e) => deleteSession(e, s.id)}
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-sm text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition"
                            title={t.delete}
                          >
                            🗑
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ══ SETTINGS ══════════════════════════════════════════════ */}
          {activeTab === "settings" && (
            <div className="space-y-6 max-w-2xl">
              <div className={`${bgCard} rounded-3xl p-6 sm:p-8 border space-y-5`}>
                <div className={`flex items-center gap-3 pb-4 border-b ${cardHead}`}>
                  <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center">⚙️</span>
                  <div>
                    <h2 className="text-lg font-black">{t.settingsTitle}</h2>
                    <p className={`text-xs ${textSub}`}>Préférences de l'espace de travail</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold">{t.autoSave}</h4>
                    <p className={`text-xs ${textSub} mt-0.5`}>{t.autoSaveDesc}</p>
                  </div>
                  <button
                    onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                    className={`w-12 h-7 rounded-full relative transition-colors shrink-0 ${
                      autoSaveEnabled ? "bg-indigo-600" : isDark ? "bg-slate-800" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${
                        autoSaveEnabled ? "start-6" : "start-1"
                      }`}
                    ></span>
                  </button>
                </div>

                <div className={`flex items-center justify-between gap-4 pt-5 border-t ${cardHead}`}>
                  <div>
                    <h4 className="text-sm font-bold">{t.themeMode}</h4>
                    <p className={`text-xs ${textSub} mt-0.5`}>Mode sombre ou clair</p>
                  </div>
                  <div className={`flex gap-1 p-1 rounded-2xl ${isDark ? "bg-slate-950" : "bg-slate-100"}`}>
                    <button
                      onClick={() => setTheme("dark")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                        theme === "dark" ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow" : "text-slate-400"
                      }`}
                    >
                      🌙 {t.darkMode}
                    </button>
                    <button
                      onClick={() => setTheme("light")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                        theme === "light" ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow" : "text-slate-400"
                      }`}
                    >
                      ☀️ {t.lightMode}
                    </button>
                  </div>
                </div>

                <div className={`flex items-center justify-between gap-4 pt-5 border-t ${cardHead}`}>
                  <div>
                    <h4 className="text-sm font-bold">{t.languageUi}</h4>
                    <p className={`text-xs ${textSub} mt-0.5`}>Langue de l'interface</p>
                  </div>
                  <select
                    value={uiLang}
                    onChange={(e) => setUiLang(e.target.value)}
                    className={`text-xs rounded-xl px-3 py-2.5 border font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${inputBg} cursor-pointer`}
                  >
                    <option value="ar">العربية (Arabic)</option>
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                  </select>
                </div>
              </div>

              <div className={`${bgCard} rounded-3xl p-6 border ${textSub} text-xs leading-relaxed`}>
                <p className="font-bold text-slate-500 mb-1">Zendocs Studio v2.0</p>
                <p>Transcription par IA (Groq · Whisper) · Détection des locuteurs · Stockage cloud sécurisé.</p>
              </div>
            </div>
          )}
        </main>

        <footer className={`py-6 text-center text-[11px] ${textSub}`}>
          Zendocs — Studio de transcription audio & vidéo par IA
        </footer>
      </div>
    </div>
  );
}
