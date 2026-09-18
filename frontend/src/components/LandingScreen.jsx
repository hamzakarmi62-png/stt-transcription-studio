import audLogo from "../assets/aud-logo.png";
import { Mic, Users, Languages, Sparkles, Chart, Download, Check, Zap } from "./Icons.jsx";

// Public marketing landing — reachable without any account. is-a.dev (and any
// serious domain registry) denies root subdomains whose content sits behind a
// login wall, so this page is what audstudio.is-a.dev must serve at "/".
const FEATURES = [
  {
    icon: Mic,
    title: "Transcription par IA",
    text: "Audio et vidéo convertis en texte avec une précision remarquable, en plusieurs langues.",
  },
  {
    icon: Users,
    title: "Détection des locuteurs",
    text: "L'IA distingue automatiquement les intervenants et étiquette chaque réplique.",
  },
  {
    icon: Languages,
    title: "Traduction intégrée",
    text: "Traduisez votre transcription vers l'arabe, le français, l'anglais et plus encore.",
  },
  {
    icon: Sparkles,
    title: "Résumé intelligent",
    text: "Un résumé clair de vos réunions et interviews, généré automatiquement.",
  },
  {
    icon: Chart,
    title: "Statistiques de prise de parole",
    text: "Temps de parole, rythme et participation de chaque intervenant en un coup d'œil.",
  },
  {
    icon: Download,
    title: "Export multi-format",
    text: "TXT, sous-titres SRT, Word et PDF — prêts à partager avec votre équipe.",
  },
];

const STEPS = [
  {
    n: "1",
    title: "Importez votre fichier",
    text: "MP3, WAV, M4A, MP4… glissez-déposez ou enregistrez directement depuis votre micro.",
  },
  {
    n: "2",
    title: "L'IA travaille",
    text: "Transcription, locuteurs et langue détectés automatiquement en quelques minutes.",
  },
  {
    n: "3",
    title: "Éditez et exportez",
    text: "Corrigez le texte, nommez les intervenants, puis exportez dans votre format préféré.",
  },
];

const DEMO = [
  { speaker: "Locuteur 1", color: "bg-indigo-500", time: "00:12", text: "Bienvenue tout le monde, commençons la réunion." },
  { speaker: "Locuteur 2", color: "bg-fuchsia-500", time: "00:18", text: "Merci ! J'ai préparé le compte rendu du dernier trimestre." },
  { speaker: "Locuteur 1", color: "bg-indigo-500", time: "00:27", text: "Parfait, discutons des prochaines étapes du projet." },
];

export default function LandingScreen({ onStart }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200" dir="ltr" lang="fr">
      {/* ambient aurora */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[140px]"></div>
        <div className="absolute top-1/3 -right-32 w-[420px] h-[420px] bg-fuchsia-600/10 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-0 left-0 w-[380px] h-[380px] bg-blue-600/10 rounded-full blur-[140px]"></div>
      </div>

      <div className="relative">
        {/* Nav */}
        <header className="max-w-6xl mx-auto flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <img src={audLogo} alt="Aud" className="h-10 w-auto" draggable={false} />
          </div>
          <button
            onClick={onStart}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-bold hover:from-indigo-400 hover:to-violet-500 transition shadow-lg shadow-indigo-950/50"
          >
            Se connecter
          </button>
        </header>

        {/* Hero */}
        <section className="max-w-6xl mx-auto px-6 pt-14 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" /> Transcription automatique par IA
          </div>
          <h1 className="mt-7 text-4xl sm:text-6xl font-black text-white leading-[1.1]">
            Transformez vos{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              audio & vidéo
            </span>{" "}
            en texte, en quelques minutes.
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-400 leading-relaxed">
            Aud transcrit vos réunions, interviews et conférences, détecte les
            intervenants, traduit et résume — le tout depuis votre navigateur.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStart}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold text-base hover:from-indigo-400 hover:to-violet-500 transition shadow-xl shadow-indigo-950/60"
            >
              Commencer maintenant
            </button>
            <span className="text-sm text-slate-500">Gratuit · Aucune installation</span>
          </div>

          {/* Transcript preview */}
          <div className="mt-14 max-w-3xl mx-auto rounded-3xl bg-slate-900/70 backdrop-blur border border-white/10 shadow-2xl shadow-black/50 overflow-hidden text-left">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/5 bg-white/[0.02]">
              <span className="w-3 h-3 rounded-full bg-red-500/70"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500/70"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/70"></span>
              <span className="ml-3 text-xs text-slate-500 font-semibold">réunion-équipe.mp3 — transcription</span>
            </div>
            <div className="p-5 space-y-4">
              {DEMO.map((line, i) => (
                <div key={i} className="flex gap-3">
                  <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${line.color}`}></span>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold">
                      {line.speaker} · <span className="font-normal text-slate-600">{line.time}</span>
                    </p>
                    <p className="text-sm text-slate-300 mt-0.5">{line.text}</p>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-2 pt-2 text-indigo-400 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                IA en cours de transcription…
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-black text-white text-center">
            Tout ce qu'il faut pour vos <span className="bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">comptes rendus</span>
          </h2>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl bg-slate-900/60 backdrop-blur border border-white/10 p-6 hover:border-indigo-500/40 hover:bg-slate-900/80 transition group"
              >
                <div className="w-11 h-11 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:text-indigo-300 transition">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="mt-4 font-bold text-white">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Steps */}
        <section className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-black text-white text-center">Comment ça marche</h2>
          <div className="mt-12 grid sm:grid-cols-3 gap-5">
            {STEPS.map((s) => (
              <div key={s.n} className="relative rounded-2xl bg-slate-900/60 backdrop-blur border border-white/10 p-6">
                <span className="absolute -top-4 left-6 w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-black flex items-center justify-center shadow-lg shadow-indigo-950/60">
                  {s.n}
                </span>
                <h3 className="mt-4 font-bold text-white">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950 border border-indigo-500/20 p-10 sm:p-14 text-center relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-fuchsia-600/15 rounded-full blur-3xl"></div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Prêt à gagner des heures de travail ?
            </h2>
            <p className="mt-4 text-slate-400 max-w-xl mx-auto">
              Créez votre compte gratuit et transcrivez votre premier fichier dès aujourd'hui.
            </p>
            <button
              onClick={onStart}
              className="mt-8 inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold hover:from-indigo-400 hover:to-violet-500 transition shadow-xl shadow-black/40"
            >
              <Check className="w-5 h-5" /> Créer mon compte
            </button>
          </div>
        </section>

        <footer className="border-t border-white/5">
          <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <img src={audLogo} alt="Aud" className="h-8 w-auto opacity-80" draggable={false} />
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} Aud — Transcription Services · Intelligence Artificielle
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
