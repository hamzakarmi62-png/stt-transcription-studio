import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api.js";
import { sleep, uid } from "../utils.js";
import UserMenu from "./UserMenu.jsx";
import { Mic, Zap, Folder, FolderOpen, Star, FileVideo, FileAudio, FileText, Headphones, X, Check, AlertTriangle, Loader, Inbox, Pencil, Trash, Sun, Moon, Settings, ArrowUpRight, Lightbulb, Home, Box, AlignLeft } from "./Icons.jsx";
import audLogo from "../assets/aud-logo.png";

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
    startNewTranscribe: "بدء تحويل جديد",
    browseMyFiles: "استعراض ملفاتي",
    favoriteFiles: "الملفات المفضلة والأعمال الخاصة",
    viewAll: "عرض الكل ←",
    noFavorites: "لا توجد ملفات مفضلة محفوظة حالياً",
    availableFolders: "المجلدات المتاحة",
    open: "فتح",
    noFilesFolder: "لا توجد ملفات في هذا المجلد حالياً.",
    noFilesFolderDesc: "انقر على أيقونة النجمة (★) في الأرشيف لحفظ الملفات هنا ونقلها بين المجلدات.",
    folderLabel: "المجلد:",
    systemState: "حالة النظام",
    active: "نشط",
    largeFileTip: "ملاحظة: معالجة الملفات الكبيرة قد تستغرق بضع دقائق نظراً للتحليل الصوتي العميق محلياً. يرجى الانتظار وعدم إغلاق الصفحة.",
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
    startNewTranscribe: "Start New Transcription",
    browseMyFiles: "Browse My Files",
    favoriteFiles: "Favorite Files & Custom Works",
    viewAll: "View All →",
    noFavorites: "No favorite files saved yet",
    availableFolders: "Available Folders",
    open: "Open",
    noFilesFolder: "No files in this folder yet.",
    noFilesFolderDesc: "Click the star icon (★) in the archive to save files here and organize them.",
    folderLabel: "Folder:",
    systemState: "System State",
    active: "Active",
    largeFileTip: "Tip: Large files may take a few minutes to process locally due to deep AI speech analysis. Please keep the page open.",
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
    startNewTranscribe: "Démarrer une transcription",
    browseMyFiles: "Parcourir mes fichiers",
    favoriteFiles: "Fichiers Favoris & Travaux",
    viewAll: "Voir tout →",
    noFavorites: "Aucun fichier favori pour le moment",
    availableFolders: "Dossiers Disponibles",
    open: "Ouvrir",
    noFilesFolder: "Aucun fichier dans ce dossier pour le moment.",
    noFilesFolderDesc: "Cliquez sur l'icône étoile (★) dans l'archive pour enregistrer des fichiers ici.",
    folderLabel: "Dossier :",
    systemState: "État du système",
    active: "Actif",
    largeFileTip: "Conseil : Le traitement des gros fichiers peut prendre quelques minutes en raison de l'analyse IA locale en profondeur. Veuillez patienter.",
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
  const [theme, setTheme] = useState("light"); // dark | light (light = Rev cream by default)

  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState("");
  const [detectSpeakers, setDetectSpeakers] = useState(true);
  const [numSpeakers, setNumSpeakers] = useState(2);
  const [phase, setPhase] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sessions, setSessions] = useState([]);
  
  const userKey = useCallback((key) => (user?.id ? `${key}_${user.id}` : key), [user?.id]);

  const [customWorkIds, setCustomWorkIds] = useState(() => {
    try {
      const k = user?.id ? `custom_works_${user.id}` : "custom_works";
      return JSON.parse(localStorage.getItem(k) || "[]");
    } catch {
      return [];
    }
  });

  const [customFileNames, setCustomFileNames] = useState(() => {
    try {
      const k = user?.id ? `custom_file_names_${user.id}` : "custom_file_names";
      return JSON.parse(localStorage.getItem(k) || "{}");
    } catch {
      return {};
    }
  });

  const [folders, setFolders] = useState(() => {
    try {
      const k = user?.id ? `custom_folders_${user.id}` : "custom_folders";
      return JSON.parse(localStorage.getItem(k) || '[{"id":"default","name":"Général"}]');
    } catch {
      return [{ id: "default", name: "Général" }];
    }
  });

  const [sessionFolderMap, setSessionFolderMap] = useState(() => {
    try {
      const k = user?.id ? `session_folder_map_${user.id}` : "session_folder_map";
      return JSON.parse(localStorage.getItem(k) || "{}");
    } catch {
      return {};
    }
  });

  // Sync state when user changes
  useEffect(() => {
    if (!user?.id) return;
    try {
      setCustomWorkIds(JSON.parse(localStorage.getItem(`custom_works_${user.id}`) || "[]"));
      setCustomFileNames(JSON.parse(localStorage.getItem(`custom_file_names_${user.id}`) || "{}"));
      setFolders(JSON.parse(localStorage.getItem(`custom_folders_${user.id}`) || '[{"id":"default","name":"Général"}]'));
      setSessionFolderMap(JSON.parse(localStorage.getItem(`session_folder_map_${user.id}`) || "{}"));
    } catch {
      /* ignore */
    }
  }, [user?.id]);

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
  }, [loadSessions, checkHealth, user?.id]);

  useEffect(() => {
    try {
      localStorage.setItem(userKey("custom_works"), JSON.stringify(customWorkIds));
    } catch {
      /* ignore */
    }
  }, [customWorkIds, userKey]);

  useEffect(() => {
    try {
      localStorage.setItem(userKey("custom_file_names"), JSON.stringify(customFileNames));
    } catch {
      /* ignore */
    }
  }, [customFileNames, userKey]);

  useEffect(() => {
    try {
      localStorage.setItem(userKey("custom_folders"), JSON.stringify(folders));
    } catch {
      /* ignore */
    }
  }, [folders, userKey]);

  useEffect(() => {
    try {
      localStorage.setItem(userKey("session_folder_map"), JSON.stringify(sessionFolderMap));
    } catch {
      /* ignore */
    }
  }, [sessionFolderMap, userKey]);

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
            ? `جاري رفع الملف (${fileSizeMB} MB) بالرفع المجزّأ... يرجى الانتظار`
            : uiLang === "fr"
            ? `Envoi du fichier (${fileSizeMB} MB) en morceaux...`
            : `Uploading file (${fileSizeMB} MB) in chunks...`
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

  // ---- Rev Cream design tokens (light) / Aurora Glass (dark) ----
  const isDark = theme === "dark";
  const bgMain = isDark ? "bg-black text-slate-100" : "bg-[#f6f3ed] text-[#18123b]";
  const glass = isDark
    ? "bg-white/[0.045] border-white/[0.08] backdrop-blur-2xl"
    : "bg-white/85 border-[#18123b]/[0.08] backdrop-blur-2xl shadow-sm";
  const glassSoft = isDark
    ? "bg-white/[0.03] border-white/[0.07]"
    : "bg-white/60 border-[#18123b]/[0.07]";
  const textSub = isDark ? "text-slate-400" : "text-[#4b4763]";
  const inputBg = isDark
    ? "bg-white/[0.05] border-white/10 text-slate-100 focus:ring-indigo-500/60"
    : "bg-white border-[#18123b]/20 text-[#18123b] focus:ring-[#6415f5]/50";
  const hairline = isDark ? "border-white/[0.07]" : "border-[#18123b]/10";
  const hoverGlass = isDark ? "hover:bg-white/[0.06]" : "hover:bg-[#18123b]/[0.05]";
  const navPill = (active) =>
    active
      ? "bg-[#6415f5] text-white shadow-md shadow-[#6415f5]/30"
      : isDark
      ? "text-slate-400 hover:text-white hover:bg-white/[0.06]"
      : "text-[#18123b]/70 hover:text-[#18123b] hover:bg-[#18123b]/[0.06]";
  const filePill = (active) =>
    active
      ? "bg-[#6415f5] text-white shadow-md shadow-[#6415f5]/30"
      : isDark
      ? "bg-white/[0.04] text-slate-300 border border-white/10 hover:border-[#6415f5]/50"
      : "bg-white text-[#4b4763] border border-[#18123b]/10 hover:border-[#6415f5]/40";

  const NAV = [
    {
      id: "home",
      label: t.navHome,
      Icon: Home,
    },
    {
      id: "transcribe",
      label: t.navTranscribe,
      Icon: Mic,
    },
    {
      id: "myFiles",
      label: t.navMyFiles,
      badge: customWorksSessions.length,
      Icon: Star,
    },
    {
      id: "archive",
      label: t.navArchive,
      badge: sessions.length,
      Icon: Box,
    },
    {
      id: "settings",
      label: t.navSettings,
      Icon: Settings,
    },
  ];

  const STATUS_META = {
    done: { label: "Terminé", dot: "bg-emerald-400", cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25" },
    transcribed: { label: "Transcrit", dot: "bg-sky-400", cls: "text-sky-400 bg-sky-500/10 border-sky-500/25" },
    processing: { label: "En cours", dot: "bg-amber-400 animate-pulse", cls: "text-amber-400 bg-amber-500/10 border-amber-500/25" },
    error: { label: "Erreur", dot: "bg-red-400", cls: "text-red-400 bg-red-500/10 border-red-500/25" },
    uploaded: { label: "En attente", dot: "bg-slate-400", cls: "text-slate-400 bg-slate-500/10 border-slate-500/25" },
  };
  const statusMeta = (s) => STATUS_META[s.status] || STATUS_META.uploaded;
  const isVideo = (s) =>
    s.kind === "video" || /\.(mp4|webm|mov|m4v|mkv|avi)$/i.test(s.filename || "");

  const PIPELINE_STEPS = [
    { key: "uploading", label: "Envoi" },
    { key: "transcribing", label: "Transcription" },
    { key: "diarizing", label: "Locuteurs" },
  ];
  const phaseOrder = ["idle", "uploading", "transcribing", "diarizing", "done"];
  const activeStep = phase === "error" ? -1 : Math.max(0, phaseOrder.indexOf(phase) - 1);

  return (
    <div className={`min-h-screen ${bgMain} relative transition-colors duration-300`} dir={uiLang === "ar" ? "rtl" : "ltr"}>
      {/* ── Aurora background ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-48 -left-40 w-[640px] h-[640px] rounded-full blur-[140px] ${isDark ? "bg-indigo-600/[0.16]" : "bg-[#6415f5]/[0.07]"}`}></div>
        <div className={`absolute top-1/4 -right-48 w-[560px] h-[560px] rounded-full blur-[140px] ${isDark ? "bg-fuchsia-600/[0.10]" : "bg-[#6415f5]/[0.04]"}`}></div>
        <div className={`absolute -bottom-40 left-1/4 w-[520px] h-[520px] rounded-full blur-[140px] ${isDark ? "bg-violet-600/[0.09]" : "bg-[#6415f5]/[0.03]"}`}></div>
      </div>

      <div className="relative">
        {/* ── Floating glass navbar ── */}
        <header className="sticky top-0 z-40 px-3 sm:px-5 pt-3 pb-1">
          <div className={`max-w-7xl mx-auto rounded-[26px] border backdrop-blur-2xl px-4 sm:px-5 h-16 flex items-center gap-2 ${
            isDark ? "bg-slate-950/60 border-white/[0.08] shadow-xl shadow-black/20" : "bg-white/85 border-[#18123b]/[0.08] shadow-lg shadow-[#18123b]/5"
          }`}>
            <div className="flex items-center gap-2.5 shrink-0">
              <img src={audLogo} alt="Aud" className="h-9 w-auto" draggable={false} />
            </div>

            <nav className="hidden md:flex items-center gap-0.5 mx-auto min-w-0">
              {NAV.map((item) => {
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-2.5 rounded-2xl text-[11px] xl:text-xs font-bold transition-all ${navPill(active)}`}
                  >
                    <item.Icon className="w-4 h-4" />
                    <span className="hidden xl:block whitespace-nowrap">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${active ? "bg-white/25" : isDark ? "bg-white/10" : "bg-slate-200"}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center gap-1.5 sm:gap-2 ms-auto md:ms-0 shrink-0">
              <select
                value={uiLang}
                onChange={(e) => setUiLang(e.target.value)}
                className={`hidden xl:block text-xs rounded-xl px-2.5 py-2 border font-bold focus:outline-none ${inputBg} cursor-pointer`}
              >
                <option value="ar">ع</option>
                <option value="en">EN</option>
                <option value="fr">FR</option>
              </select>
              <button
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className={`w-9 h-9 rounded-2xl border flex items-center justify-center text-sm transition ${inputBg} ${hoverGlass}`}
                title={isDark ? t.lightMode : t.darkMode}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <UserMenu user={user} onLogout={onLogout} />
            </div>
          </div>

          {/* mobile tabs */}
          <div className="md:hidden flex gap-1.5 overflow-x-auto px-1 pt-2 pb-1 [scrollbar-width:none] max-w-6xl mx-auto">
            {NAV.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`shrink-0 px-4 py-2 rounded-full text-[11px] font-bold transition ${filePill(active)}`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </header>

        <main className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-16 space-y-8">
          {/* ══ HOME — Bento grid ══ */}
          {activeTab === "home" && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Hero bento tile — full width, Rev-style light hero */}
              <div className="col-span-2 lg:col-span-4 relative overflow-hidden rounded-[30px] bg-white border border-[#18123b]/[0.08] p-10 sm:p-14 flex flex-col justify-center min-h-[380px]">
                <div className="absolute -top-24 -end-20 w-96 h-96 bg-[#6415f5]/[0.09] rounded-full blur-3xl"></div>
                <div className="absolute -bottom-28 -start-16 w-80 h-80 bg-[#6415f5]/[0.06] rounded-full blur-3xl"></div>
                <div
                  className="absolute inset-0 opacity-[0.07]"
                  style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(24,18,59,0.55) 1px, transparent 0)", backgroundSize: "24px 24px" }}
                ></div>
                <div className="relative w-full flex flex-col lg:flex-row items-center gap-10 lg:gap-14">
                  {/* Left: message + actions */}
                  <div className="relative space-y-5 flex-1 min-w-0 text-center lg:text-start">
                    <span className="inline-flex items-center gap-2 bg-[#6415f5]/[0.06] border border-[#6415f5]/25 text-[#6415f5] px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      WHISPER + GROQ · IA
                    </span>
                    <h2 className="text-3xl sm:text-[40px] font-semibold text-[#18123b] leading-[1.12] tracking-[-0.02em]">
                      {t.welcomeBack}
                    </h2>
                    <p className="text-[#4b4763] text-[14px] leading-relaxed max-w-xl mx-auto lg:mx-0">{t.welcomeDesc}</p>
                    <div className="relative flex gap-3 flex-wrap justify-center lg:justify-start pt-1">
                      <button
                        onClick={() => setActiveTab("transcribe")}
                        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#6415f5] text-white font-bold text-sm hover:bg-[#5311cf] shadow-lg shadow-[#6415f5]/25 transition-all hover:-translate-y-0.5"
                      >
                        <Zap className="w-4 h-4" /> {t.startNewTranscribe}
                      </button>
                      <button
                        onClick={() => setActiveTab("myFiles")}
                        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white border-[1.5px] border-[#6415f5] text-[#6415f5] font-bold text-sm hover:bg-[#6415f5]/[0.05] transition-all"
                      >
                        <Folder className="w-4 h-4" /> {t.browseMyFiles}
                      </button>
                    </div>
                  </div>

                  {/* Right: the Aud mark on a light stage */}
                  <div className="relative shrink-0 w-60 h-60 sm:w-80 sm:h-80 flex items-center justify-center">
                    <div className="absolute inset-6 rounded-full bg-gradient-to-br from-blue-600/15 via-[#6415f5]/12 to-fuchsia-600/10 blur-3xl"></div>
                    <div className="aud-hero-ring absolute inset-2 rounded-[38px] border border-[#18123b]/[0.07]"></div>
                    <img
                      src={audLogo}
                      alt="Aud — Transcription Services"
                      className="relative w-full h-full object-contain aud-hero-logo"
                      draggable={false}
                    />
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-40 h-6 rounded-[100%] bg-[#6415f5]/20 blur-xl"></div>
                  </div>
                </div>
              </div>

              {/* Stat tiles — Rev-style outlined icon containers */}
              {[
                { label: t.totalSessions, value: totalSessionsCount, Icon: FileVideo },
                { label: t.completedSessions, value: completedSessionsCount, Icon: Check },
                { label: t.totalSegments, value: totalSegmentsCount, Icon: AlignLeft },
                { label: t.systemStatus, value: null, Icon: Zap },
              ].map((st) => (
                <div key={st.label} className="bg-white border border-[#18123b]/[0.08] rounded-[22px] p-5 relative group hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                  <div className="w-11 h-11 rounded-xl border-[1.5px] border-[#18123b]/25 flex items-center justify-center text-[#18123b]">
                    <st.Icon className="w-5 h-5" />
                  </div>
                  <p className="text-[10px] font-bold text-[#4b4763] mt-4 uppercase tracking-widest">{st.label}</p>
                  <h3 className="text-2xl font-extrabold mt-1 text-[#18123b]">
                    {st.value === null ? (
                      <span className="text-emerald-600 flex items-center gap-2 text-[13px] font-bold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        {t.active}
                      </span>
                    ) : (
                      st.value
                    )}
                  </h3>
                </div>
              ))}

              {/* Folders tile */}
              <div className="bg-white border border-[#18123b]/[0.08] rounded-[26px] p-6 col-span-2 lg:col-span-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs uppercase tracking-widest text-[#18123b] flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg border-[1.5px] border-[#18123b]/25 flex items-center justify-center text-[#18123b]">
                      <FolderOpen className="w-3.5 h-3.5" />
                    </span>
                    {t.availableFolders}
                  </h3>
                  <button onClick={handleCreateFolder} className="text-[11px] text-[#6415f5] font-bold hover:underline">
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
                        className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${isDark ? "bg-white/[0.03] border-white/[0.06] hover:border-indigo-500/50" : "bg-white border-[#18123b]/[0.1] hover:border-[#6415f5]/50"}`}
                      >
                        <span className="font-semibold text-xs truncate flex items-center gap-1.5 min-w-0 text-[#18123b]"><FolderOpen className="w-3.5 h-3.5 text-[#6415f5] shrink-0" /><span className="truncate">{f.name}</span></span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${isDark ? "bg-white/10" : "bg-[#18123b]/[0.06] text-[#18123b]"}`}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ══ TRANSCRIBE ══ */}
          {activeTab === "transcribe" && (
            <div className="grid lg:grid-cols-[1fr_370px] gap-5 items-start">
              <div className={`${glass} rounded-[30px] p-6 sm:p-8 border`}>
                <h2 className="text-base font-black mb-5">{t.uploadTitle}</h2>
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
                  className={`cursor-pointer border-2 border-dashed rounded-[26px] p-10 text-center transition-all duration-300 ${
                    dragOver
                      ? "border-indigo-400 bg-indigo-500/10 scale-[1.01]"
                      : isDark
                      ? "border-white/10 hover:border-indigo-500/60 bg-white/[0.02]"
                      : "border-slate-300 hover:border-indigo-400 bg-white/60"
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
                  <div className="w-16 h-16 mx-auto rounded-xl border-[1.5px] border-[#18123b]/25 flex items-center justify-center text-[#18123b] mb-4">
                    <Headphones className="w-7 h-7" />
                  </div>
                  <p className="font-bold text-sm">{t.uploadTitle}</p>
                  <p className={`text-xs ${textSub} mt-1.5`}>{t.uploadDesc}</p>
                  {file && (
                    <div className="mt-5 inline-flex items-center gap-3 bg-white text-[#18123b] border border-[#18123b]/15 px-4 py-2.5 rounded-2xl text-sm font-bold">
                      <span className="flex items-center gap-1.5 min-w-0"><FileText className="w-3.5 h-3.5 shrink-0" /><span className="truncate max-w-[260px]">{file.name}</span></span>
                      <button
                        className="text-slate-400 hover:text-red-400 font-black"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="my-7 flex items-center gap-3">
                  <div className={`h-px flex-1 ${isDark ? "bg-white/[0.07]" : "bg-slate-200"}`} />
                  <span className={`text-[10px] ${textSub} uppercase tracking-[0.25em] font-black`}>{t.orRecord}</span>
                  <div className={`h-px flex-1 ${isDark ? "bg-white/[0.07]" : "bg-slate-200"}`} />
                </div>

                {!recording && !recBlob && (
                  <button
                    onClick={startRecording}
                    className={`w-full rounded-3xl border-2 py-4 text-center font-bold transition-all flex items-center justify-center gap-2.5 ${
                      isDark
                        ? "border-white/10 bg-white/[0.02] hover:border-red-500/60 hover:bg-red-500/10 text-slate-200"
                        : "border-slate-300 bg-white hover:border-red-400 hover:bg-red-50 text-slate-700"
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-red-500 shadow shadow-red-500/50"></span>
                    {t.recordMic}
                  </button>
                )}

                {recording && (
                  <div className="rounded-3xl border-2 border-red-500/50 bg-red-500/10 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-3.5 h-3.5 rounded-full bg-red-500 animate-ping" />
                      <span className="font-black text-red-500 tabular-nums">
                        {String(Math.floor(recSeconds / 60)).padStart(2, "0")}:{String(recSeconds % 60).padStart(2, "0")}
                      </span>
                      <span className="text-xs text-red-400 font-semibold">{t.recording}</span>
                    </div>
                    <button
                      onClick={stopRecording}
                      className="px-5 py-2.5 rounded-2xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-600/30 text-sm"
                    >
                      {t.stopRecord}
                    </button>
                  </div>
                )}

                {recUrl && (
                  <div className={`rounded-3xl border p-4 space-y-3 ${isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-200 bg-white"}`}>
                    <audio src={recUrl} controls className="w-full accent-indigo-500" />
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setRecUrl(null);
                          setRecBlob(null);
                        }}
                        className={`px-4 py-2 rounded-xl border text-xs font-bold ${isDark ? "border-white/10 text-slate-300 hover:bg-white/10" : "border-slate-300 text-slate-600 hover:bg-slate-100"}`}
                      >
                        {t.discardRecord}
                      </button>
                      <button
                        onClick={() => {
                          if (mediaRecorderRef.current) resetRecording();
                          startRecording();
                        }}
                        className={`px-4 py-2 rounded-xl border text-xs font-bold ${isDark ? "border-white/10 text-slate-300 hover:bg-white/10" : "border-slate-300 text-slate-600 hover:bg-slate-100"}`}
                      >
                        {t.reRecord}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right rail */}
              <div className={`${glass} rounded-[30px] p-6 border space-y-5 lg:sticky lg:top-24`}>
                <h2 className="text-sm font-black uppercase tracking-widest">{t.aiOptions}</h2>

                <div>
                  <label className={`block text-[11px] font-bold ${textSub} mb-2 uppercase tracking-wide`}>{t.audioLang}</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className={`w-full rounded-2xl border px-3.5 py-3 text-sm focus:outline-none focus:ring-2 ${inputBg}`}
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.value} value={l.value}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-[11px] font-bold ${textSub} mb-2 uppercase tracking-wide`}>{t.expectedSpeakers}</label>
                  <select
                    value={numSpeakers}
                    onChange={(e) => setNumSpeakers(Number(e.target.value))}
                    disabled={!detectSpeakers}
                    className={`w-full rounded-2xl border px-3.5 py-3 text-sm disabled:opacity-40 focus:outline-none focus:ring-2 ${inputBg}`}
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>

                <label className="flex items-center gap-3 text-sm font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={detectSpeakers}
                    onChange={(e) => setDetectSpeakers(e.target.checked)}
                    className="w-4 h-4 rounded accent-indigo-500"
                  />
                  {t.autoSpeakers}
                </label>

                <div className={`rounded-3xl border p-4 space-y-3 ${glassSoft}`}>
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
                              ? "bg-indigo-500 text-white animate-pulse"
                              : isDark
                              ? "bg-white/[0.06] text-slate-500"
                              : "bg-slate-200 text-slate-400"
                          }`}
                        >
                          {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
                        </span>
                        <span className={`text-xs font-bold ${active ? "text-indigo-400" : done ? "text-emerald-400" : textSub}`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}

                  {phase === "uploading" && (
                    <div className="space-y-1.5 pt-2">
                      <div className={`flex justify-between text-xs font-bold ${textSub}`}>
                        <span>Upload…</span>
                        <span className="text-indigo-400">{progress}%</span>
                      </div>
                      <div className={`h-2 rounded-full overflow-hidden ${isDark ? "bg-white/[0.07]" : "bg-slate-200"}`}>
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {(phase === "transcribing" || phase === "diarizing") && (
                    <div className="space-y-2 pt-2">
                      <div className="h-2 rounded-full bg-gradient-to-r from-indigo-500/30 via-fuchsia-500 to-indigo-500/30 animate-pulse" />
                      <p className="text-[11px] text-amber-400 font-medium leading-relaxed flex items-start gap-1.5"><Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5" /><span>{t.largeFileTip}</span></p>
                    </div>
                  )}
                </div>

                {phase === "error" && (
                  <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-2xl p-3.5 font-semibold flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  onClick={handleProcess}
                  disabled={!hasAudio || busy}
                  className="w-full py-4 rounded-xl bg-[#6415f5] text-white font-bold text-sm hover:bg-[#5311cf] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#6415f5]/30 transition-all hover:-translate-y-0.5"
                >
                  <span className="inline-flex items-center justify-center gap-2">{busy ? <Loader className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}{busy ? t.processing : t.startTranscribe}</span>
                </button>
              </div>
            </div>
          )}

          {/* ══ ARCHIVE ══ */}
          {activeTab === "archive" && (
            <div className={`${glass} rounded-[30px] p-6 sm:p-8 border space-y-6`}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-black">{t.archiveTitle}</h2>
                  <p className={`text-xs ${textSub} mt-1`}>{t.archiveDesc}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <svg className="w-4 h-4 absolute inset-y-0 my-auto start-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder={t.searchPlaceholder}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`rounded-2xl border ps-9 pe-3 py-2.5 text-xs w-52 focus:outline-none focus:ring-2 ${inputBg}`}
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={`rounded-2xl border px-3.5 py-2.5 text-xs font-bold focus:outline-none ${inputBg} cursor-pointer`}
                  >
                    <option value="all">{t.allStatus}</option>
                    <option value="done">{t.completedOnly}</option>
                    <option value="processing">{t.processingStatus}</option>
                  </select>
                </div>
              </div>

              {filteredSessions.length === 0 ? (
                <div className={`text-center py-20 rounded-[26px] border-2 border-dashed ${isDark ? "border-white/10" : "border-slate-300"} ${textSub}`}>
                  <Inbox className="w-9 h-9 mx-auto mb-3 opacity-40" />
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
                        className={`group flex items-center gap-4 p-4 rounded-3xl border cursor-pointer transition-all duration-200 ${
                          isDark
                            ? "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-indigo-500/40"
                            : "bg-white/70 border-slate-200 hover:border-indigo-400 hover:shadow-md"
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-xl border-[1.5px] border-[#18123b]/25 flex items-center justify-center shrink-0 text-[#18123b] bg-transparent`}
                        >
                          {isVideo(s) ? <FileVideo className="w-5 h-5" /> : <FileAudio className="w-5 h-5" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h3 className="font-bold text-sm truncate max-w-full group-hover:text-indigo-400 transition-colors" title={displayName}>
                              {displayName}
                            </h3>
                            <span className={`inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full font-bold border ${st.cls}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></span>
                              {st.label}
                            </span>
                          </div>
                          <p className={`text-[11px] ${textSub} mt-1 truncate`}>
                            {new Date(s.created_at).toLocaleString()} · {s.segments?.length ?? 0} segments · {s.language || "auto"}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={(e) => toggleCustomWork(e, s.id)}
                            className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm transition ${
                              isCustom ? "text-amber-400 bg-amber-400/15" : "text-slate-500 hover:text-amber-400 hover:bg-amber-400/10"
                            }`}
                            title={isCustom ? t.removeFromCustom : t.addToCustom}
                          >
                            {isCustom ? <Star className="w-4 h-4" filled /> : <Star className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={(e) => handleRename(e, s.id)}
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-sm text-slate-500 hover:text-indigo-400 hover:bg-indigo-400/10 transition"
                            title={t.renameFile}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => deleteSession(e, s.id)}
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-sm text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition"
                            title={t.delete}
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ══ MY FILES ══ */}
          {activeTab === "myFiles" && (
            <div className={`${glass} rounded-[30px] p-6 sm:p-8 border space-y-6`}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-black">{t.myFilesTitle}</h2>
                  <p className={`text-xs ${textSub} mt-1`}>{t.myFilesDesc}</p>
                </div>
                <button
                  onClick={handleCreateFolder}
                  className="px-4 py-2.5 rounded-xl bg-[#6415f5] text-white font-bold text-xs hover:bg-[#5311cf] shadow-md shadow-[#6415f5]/30 transition-all flex items-center gap-1.5"
                >
                  {t.createNewFolder}
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedFolderFilter("all")}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition ${filePill(selectedFolderFilter === "all")}`}
                >
                  {t.allFiles} ({customWorksSessions.length})
                </button>
                {folders.map((f) => {
                  const count = customWorksSessions.filter((s) => (sessionFolderMap[s.id] || "default") === f.id).length;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFolderFilter(f.id)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition ${filePill(selectedFolderFilter === f.id)}`}
                    >
                      <FolderOpen className="w-3.5 h-3.5 opacity-70" /> {f.name} ({count})
                    </button>
                  );
                })}
              </div>

              {folderFilteredSessions.length === 0 ? (
                <div className={`text-center py-20 rounded-[26px] border-2 border-dashed ${isDark ? "border-white/10" : "border-slate-300"}`}>
                  <Inbox className="w-9 h-9 mx-auto mb-3 opacity-40" />
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
                        className={`group flex items-center gap-4 p-4 rounded-3xl border cursor-pointer transition-all duration-200 ${
                          isDark
                            ? "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-indigo-500/40"
                            : "bg-white/70 border-slate-200 hover:border-indigo-400 hover:shadow-md"
                        }`}
                      >
                        <div className="w-12 h-12 rounded-xl border-[1.5px] border-[#18123b]/25 bg-transparent flex items-center justify-center shrink-0 text-[#18123b]">
                          <Star className="w-5 h-5" filled />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm truncate group-hover:text-indigo-400 transition-colors">{displayName}</h3>
                          <p className={`text-[11px] ${textSub} mt-1 truncate`}>
                            {new Date(s.created_at).toLocaleString()} · {s.segments?.length ?? 0} segments
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
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
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-sm text-slate-500 hover:text-indigo-400 hover:bg-indigo-400/10 transition"
                            title={t.renameFile}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => deleteSession(e, s.id)}
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-sm text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition"
                            title={t.delete}
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ══ SETTINGS ══ */}
          {activeTab === "settings" && (
            <div className="space-y-5 max-w-2xl">
              <div className={`${glass} rounded-[30px] p-6 sm:p-8 border space-y-1`}>
                <div className={`flex items-center gap-3 pb-5 border-b ${hairline}`}>
                  <span className="w-10 h-10 rounded-xl border-[1.5px] border-[#18123b]/25 bg-transparent flex items-center justify-center text-[#18123b]"><Settings className="w-5 h-5" /></span>
                  <div>
                    <h2 className="text-lg font-black">{t.settingsTitle}</h2>
                    <p className={`text-xs ${textSub}`}>Préférences de l'espace de travail</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 py-5">
                  <div>
                    <h4 className="text-sm font-bold">{t.autoSave}</h4>
                    <p className={`text-xs ${textSub} mt-0.5`}>{t.autoSaveDesc}</p>
                  </div>
                  <button
                    onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                    className={`w-12 h-7 rounded-full relative transition-colors shrink-0 ${autoSaveEnabled ? "bg-indigo-500" : isDark ? "bg-white/10" : "bg-slate-300"}`}
                  >
                    <span
                      className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${autoSaveEnabled ? "start-6" : "start-1"}`}
                    ></span>
                  </button>
                </div>

                <div className={`flex items-center justify-between gap-4 py-5 border-t ${hairline}`}>
                  <div>
                    <h4 className="text-sm font-bold">{t.themeMode}</h4>
                    <p className={`text-xs ${textSub} mt-0.5`}>Aurora sombre ou porcelain clair</p>
                  </div>
                  <div className={`flex gap-1 p-1 rounded-2xl ${isDark ? "bg-white/[0.05]" : "bg-slate-200/70"}`}>
                    <button
                      onClick={() => setTheme("dark")}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${theme === "dark" ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow" : "text-slate-400"}`}
                    >
                      <Moon className="w-3.5 h-3.5" /> {t.darkMode}
                    </button>
                    <button
                      onClick={() => setTheme("light")}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${theme === "light" ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow" : "text-slate-400"}`}
                    >
                      <Sun className="w-3.5 h-3.5" /> {t.lightMode}
                    </button>
                  </div>
                </div>

                <div className={`flex items-center justify-between gap-4 py-5 border-t ${hairline}`}>
                  <div>
                    <h4 className="text-sm font-bold">{t.languageUi}</h4>
                    <p className={`text-xs ${textSub} mt-0.5`}>Langue de l'interface</p>
                  </div>
                  <select
                    value={uiLang}
                    onChange={(e) => setUiLang(e.target.value)}
                    className={`text-xs rounded-xl px-3 py-2.5 border font-bold focus:outline-none ${inputBg} cursor-pointer`}
                  >
                    <option value="ar">العربية (Arabic)</option>
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                  </select>
                </div>
              </div>

              <div className={`${glass} rounded-[30px] p-6 border ${textSub} text-xs leading-relaxed`}>
                <p className="font-black text-slate-400 mb-1">Aud Studio · Aurora Edition</p>
                <p>Transcription IA (Groq · Whisper) · Détection des locuteurs par empreinte vocale · Stockage cloud chiffré.</p>
              </div>
            </div>
          )}
        </main>

        <footer className={`relative pb-8 text-center text-[11px] ${textSub}`}>
          Aud — Studio de transcription audio & vidéo par IA
        </footer>
      </div>
    </div>
  );
}
