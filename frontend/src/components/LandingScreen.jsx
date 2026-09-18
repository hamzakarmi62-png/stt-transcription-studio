import audLogo from "../assets/aud-logo.png";
import {
  Mic, Users, Languages, Sparkles, Chart, Download,
  Lock, EyeOff,
} from "./Icons.jsx";

// Landing rebuilt after rev.com: warm cream background, slim nav with two
// CTAs, oversized two-line headline on the left with trust badges, and a
// dark product-demo card on the right cycling through animated scenes.
const PURPLE = "#6415f5";

const NAV = [
  { label: "Produit", active: false },
  { label: "Fonctionnalités", active: false },
  { label: "Ressources", active: false },
  { label: "À propos", active: false },
  { label: "Tarifs", active: true },
];

const FEATURES = [
  { icon: Mic, title: "Transcription par IA", text: "Audio et vidéo convertis en texte avec une précision remarquable, en plusieurs langues." },
  { icon: Users, title: "Détection des locuteurs", text: "L'IA distingue automatiquement les intervenants et étiquette chaque réplique." },
  { icon: Languages, title: "Traduction intégrée", text: "Traduisez votre transcription vers l'arabe, le français, l'anglais et plus encore." },
  { icon: Sparkles, title: "Résumé intelligent", text: "Un résumé clair de vos réunions et interviews, généré automatiquement." },
  { icon: Chart, title: "Statistiques de prise de parole", text: "Temps de parole, rythme et participation de chaque intervenant en un coup d'œil." },
  { icon: Download, title: "Export multi-format", text: "TXT, sous-titres SRT, Word et PDF — prêts à partager avec votre équipe." },
];

const STEPS = [
  { n: "1", title: "Importez votre fichier", text: "MP3, WAV, M4A, MP4… glissez-déposez ou enregistrez directement depuis votre micro." },
  { n: "2", title: "L'IA travaille", text: "Transcription, locuteurs et langue détectés automatiquement en quelques minutes." },
  { n: "3", title: "Éditez et exportez", text: "Corrigez le texte, nommez les intervenants, puis exportez dans votre format préféré." },
];

export default function LandingScreen({ onStart }) {
  return (
    <div
      className="min-h-screen bg-[#f6f3ed] text-[#18123b] antialiased"
      style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif" }}
      dir="ltr"
      lang="fr"
    >

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <header className="relative z-20">
        <div className="max-w-[1400px] mx-auto flex items-center gap-8 px-5 sm:px-8 h-[76px]">
          <button onClick={onStart} className="shrink-0" aria-label="Aud — accueil">
            <img src={audLogo} alt="Aud" className="h-10 w-auto" draggable={false} />
          </button>

          <nav className="hidden lg:flex items-center gap-7">
            {NAV.map((item) => (
              <button
                key={item.label}
                onClick={onStart}
                className={`text-[15px] font-medium transition-colors ${
                  item.active ? "text-[#6415f5]" : "text-[#18123b]/75 hover:text-[#18123b]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2.5 sm:gap-4">
            <button onClick={onStart} className="hidden sm:block text-[15px] font-medium text-[#18123b]/85 hover:text-[#18123b] transition-colors px-2">
              Connexion
            </button>
            <button
              onClick={onStart}
              className="hidden md:inline-flex items-center px-5 py-2.5 rounded-[10px] border-[1.5px] border-[#6415f5] text-[#6415f5] bg-white/50 text-[15px] font-semibold hover:bg-white transition"
            >
              Parler à un spécialiste
            </button>
            <button
              onClick={onStart}
              className="inline-flex items-center px-5 py-2.5 rounded-[10px] bg-[#6415f5] text-white text-[15px] font-semibold hover:bg-[#5311cf] transition shadow-sm"
            >
              Essayer Aud gratuitement
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pt-8 lg:pt-14 pb-14 grid lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-12 items-center">
          {/* Left */}
          <div>
            <h1 className="text-[clamp(36px,3.6vw,56px)] leading-[1.07] font-semibold tracking-[-0.025em] text-[#18123b]">
              Transcrivez tout
              <br /> en minutes, pas en heures
            </h1>

            <p className="mt-7 text-[17px] leading-[1.65] text-[#4b4763] max-w-[580px]">
              La plateforme de transcription conçue pour les équipes qui n'ont pas
              le temps de tout réécouter. Transcription, détection des locuteurs,
              traduction et résumés sur tous vos enregistrements. Chaque mot
              vérifié, pour que la décision reste la vôtre.
            </p>

            <button
              onClick={onStart}
              className="mt-9 inline-flex items-center px-9 py-4 rounded-xl bg-[#6415f5] text-white text-[17px] font-semibold hover:bg-[#5311cf] transition shadow-lg shadow-[#6415f5]/25"
            >
              Essayer Aud gratuitement
            </button>

            {/* Trust badges */}
            <div className="mt-11 flex flex-wrap items-center gap-x-8 gap-y-5">
              <div className="flex items-center gap-3">
                <span className="w-11 h-11 rounded-xl border-[1.5px] border-[#18123b]/25 flex items-center justify-center text-[#18123b]">
                  <Lock className="w-5 h-5" />
                </span>
                <span className="text-[12px] font-semibold leading-[1.35] text-[#18123b]/85">
                  Aucune donnée vendue<br />à des tiers
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-11 h-11 rounded-xl border-[1.5px] border-[#18123b]/25 flex items-center justify-center text-[#18123b]">
                  <EyeOff className="w-5 h-5" />
                </span>
                <span className="text-[12px] font-semibold leading-[1.35] text-[#18123b]/85">
                  Traitement privé<br />&amp; chiffré
                </span>
              </div>

              <div className="w-[72px] h-[72px] rounded-full border-[1.5px] border-[#18123b]/30 flex flex-col items-center justify-center text-center leading-[1.15]">
                <span className="text-[9px] font-bold tracking-wide text-[#18123b]/80">CHIFFREMENT</span>
                <span className="text-[11px] font-extrabold tracking-wide text-[#18123b]">AES-256</span>
              </div>

              <div className="w-[72px] h-[72px] rounded-full border-[1.5px] border-[#18123b]/30 flex flex-col items-center justify-center text-center leading-[1.15]">
                <span className="text-[9px] font-bold tracking-wide text-[#18123b]/80">IA PRIVÉE</span>
                <span className="text-[11px] font-extrabold tracking-wide text-[#18123b]">RGPD</span>
              </div>
            </div>
          </div>

          {/* Right — dark demo card playing the real product walkthrough */}
          <div className="relative w-full h-[440px] sm:h-[520px] lg:h-[560px] rounded-[26px] overflow-hidden shadow-2xl shadow-[#18123b]/30 bg-[#12101f]">
            {/* ambient backdrop (visible while the video buffers) */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#262247] via-[#151226] to-[#0b0a16]" />
            <div className="absolute -top-24 -right-20 w-[420px] h-[420px] rounded-full bg-[#6415f5]/25 blur-[100px]" />
            <div className="absolute bottom-[-60px] -left-16 w-[340px] h-[340px] rounded-full bg-teal-300/10 blur-[90px]" />

            <video
              src="/demo-aud.mp4"
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* caption chip */}
            <div className="absolute bottom-5 left-5 rounded-xl bg-white/10 backdrop-blur border border-white/15 px-3.5 py-2 text-[10.5px] text-white/85">
              Voyez Aud en action — de l'import au texte final.
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section className="border-t border-[#18123b]/[0.07] bg-white/60">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 py-16 lg:py-20">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.02em] text-[#18123b] text-center">
            Tout ce qu'il faut pour vos <span className="text-[#6415f5]">comptes rendus</span>
          </h2>
          <div className="mt-11 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl bg-white border border-[#18123b]/[0.08] p-6 shadow-sm hover:shadow-md hover:border-[#6415f5]/30 transition">
                <div className="w-11 h-11 rounded-xl bg-[#6415f5]/[0.08] border border-[#6415f5]/20 flex items-center justify-center text-[#6415f5]">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="mt-4 font-semibold text-[#18123b]">{f.title}</h3>
                <p className="mt-2 text-sm text-[#4b4763] leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Steps ───────────────────────────────────────────────────────── */}
      <section className="border-t border-[#18123b]/[0.07]">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 py-16 lg:py-20">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.02em] text-[#18123b] text-center">Comment ça marche</h2>
          <div className="mt-11 grid sm:grid-cols-3 gap-5">
            {STEPS.map((s) => (
              <div key={s.n} className="relative rounded-2xl bg-white border border-[#18123b]/[0.08] p-6 shadow-sm">
                <span className="absolute -top-4 left-6 w-9 h-9 rounded-xl bg-[#6415f5] text-white font-extrabold flex items-center justify-center shadow-md">
                  {s.n}
                </span>
                <h3 className="mt-4 font-semibold text-[#18123b]">{s.title}</h3>
                <p className="mt-2 text-sm text-[#4b4763] leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-16">
        <div className="rounded-[26px] bg-[#6415f5] relative overflow-hidden px-8 py-14 sm:py-16 text-center">
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-black/10 blur-3xl" />
          <h2 className="relative text-3xl sm:text-4xl font-semibold tracking-[-0.02em] text-white">
            Prêt à gagner des heures de travail ?
          </h2>
          <p className="relative mt-4 text-white/80 max-w-xl mx-auto">
            Créez votre compte gratuit et transcrivez votre premier fichier dès aujourd'hui.
          </p>
          <button
            onClick={onStart}
            className="relative mt-8 inline-flex items-center gap-2 px-9 py-4 rounded-xl bg-white text-[#18123b] font-semibold hover:bg-slate-100 transition shadow-xl"
          >
            Créer mon compte gratuit
          </button>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#18123b]/10">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <img src={audLogo} alt="Aud" className="h-8 w-auto" draggable={false} />
          <p className="text-xs text-[#4b4763]/70">
            © {new Date().getFullYear()} Aud — Transcription Services · Intelligence Artificielle
          </p>
        </div>
      </footer>
    </div>
  );
}
