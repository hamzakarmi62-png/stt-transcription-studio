import React, { useState } from "react";
import { api } from "../api.js";

const PAYS = [
  "Algérie", "Maroc", "Tunisie", "Mauritanie", "France", "Belgique",
  "Suisse", "Canada", "Émirats Arabes Unis", "Arabie Saoudite", "Autre",
];

function Logo({ size = "w-14 h-14", text = "text-2xl" }) {
  return (
    <div className={`${size} rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-indigo-500/40`}>
      <span className={text}>🎙️</span>
    </div>
  );
}

export default function LoginScreen({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordScore = (() => {
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  })();
  const strengthLabel = ["Trop court", "Faible", "Moyen", "Bon", "Fort", "Excellent"][
    password.length === 0 ? 0 : passwordScore
  ];
  const strengthColor = ["bg-slate-200", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-lime-500", "bg-emerald-500"][
    password.length === 0 ? 0 : passwordScore
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isRegister) {
        if (!fullName.trim()) throw new Error("Veuillez saisir votre nom complet.");
        if (!username || !email || !password) {
          throw new Error("Veuillez remplir tous les champs obligatoires.");
        }
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
          throw new Error("Adresse e-mail invalide.");
        }
        if (password !== confirmPassword) {
          throw new Error("Les mots de passe ne correspondent pas.");
        }
        if (password.length < 6) {
          throw new Error("Le mot de passe doit contenir au moins 6 caractères.");
        }
        setLoading(true);
        const res = await api.register(username, email, password, {
          full_name: fullName,
          phone,
          country,
        });
        if (res.success && res.user) {
          onLogin(res.user);
        }
      } else {
        if (!username || !password) {
          throw new Error("Veuillez saisir votre identifiant et votre mot de passe.");
        }
        setLoading(true);
        const res = await api.login(username, password);
        if (res.success && res.user) {
          onLogin(res.user);
        }
      }
    } catch (err) {
      setError(err.message || "Une erreur inattendue s'est produite.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex" dir="ltr" lang="fr">
      {/* Brand panel */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-950 to-violet-950">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-fuchsia-600/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <Logo />
            <div>
              <h1 className="text-white text-xl font-black tracking-tight">Zendocs</h1>
              <p className="text-indigo-300/80 text-xs">Studio de transcription par IA</p>
            </div>
          </div>

          <div className="space-y-8 max-w-md">
            <h2 className="text-4xl font-black text-white leading-tight">
              Transformez vos{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
                audio & vidéo
              </span>{" "}
              en texte, en quelques minutes.
            </h2>
            <ul className="space-y-4">
              {[
                ["🎯", "Transcription automatique fidèle, horodatage précis"],
                ["👥", "Détection des locuteurs et suivi de qui parle quand"],
                ["✍️", "Éditeur temps réel : corrigez en écoutant, mot par mot"],
                ["📄", "Export propre en TXT, SRT, DOCX et PDF"],
              ].map(([icon, text]) => (
                <li key={text} className="flex items-center gap-3 text-slate-300 text-sm">
                  <span className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    {icon}
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-slate-500 text-xs">
            🔒 Vos enregistrements restent privés — stockage chiffré et accès authentifié.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <Logo size="w-11 h-11" text="text-xl" />
            <div>
              <h1 className="text-white text-lg font-black">Zendocs</h1>
              <p className="text-indigo-300/80 text-[11px]">Studio de transcription par IA</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl shadow-black/40 p-8">
            <div className="flex items-center gap-3 mb-1">
              <div className={`flex rounded-xl bg-slate-100 p-1 text-sm font-semibold`}>
                <button
                  type="button"
                  onClick={() => { setIsRegister(false); setError(""); }}
                  className={`px-4 py-2 rounded-lg transition ${
                    !isRegister ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Connexion
                </button>
                <button
                  type="button"
                  onClick={() => { setIsRegister(true); setError(""); }}
                  className={`px-4 py-2 rounded-lg transition ${
                    isRegister ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Inscription
                </button>
              </div>
            </div>

            <h2 className="text-xl font-bold text-slate-900 mt-5">
              {isRegister ? "Créer votre compte" : "Bon retour parmi nous"}
            </h2>
            <p className="text-sm text-slate-500 mt-1 mb-6">
              {isRegister
                ? "Quelques informations et votre studio est prêt."
                : "Connectez-vous pour accéder à vos transcriptions."}
            </p>

            {error && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl font-medium flex items-start gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {isRegister && (
                <Field label="Nom complet" required>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex. : Hamza Karmi"
                    className={inputCls}
                    autoComplete="name"
                    required
                  />
                </Field>
              )}

              <Field label={isRegister ? "Nom d'utilisateur" : "Nom d'utilisateur ou e-mail"} required>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={isRegister ? "ex. : hamzakarmi" : "hamzakarmi"}
                  className={inputCls}
                  autoComplete="username"
                  required
                />
              </Field>

              {isRegister && (
                <>
                  <Field label="Adresse e-mail" required>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nom@exemple.com"
                      className={inputCls}
                      autoComplete="email"
                      required
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Téléphone">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+213 ..."
                        className={inputCls}
                        autoComplete="tel"
                      />
                    </Field>
                    <Field label="Pays">
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className={`${inputCls} cursor-pointer`}
                      >
                        <option value="">— Choisir —</option>
                        {PAYS.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </>
              )}

              <Field label="Mot de passe" required>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`${inputCls} pr-11`}
                    autoComplete={isRegister ? "new-password" : "current-password"}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm"
                    tabIndex={-1}
                    title={showPassword ? "Masquer" : "Afficher"}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                {isRegister && password.length > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${strengthColor} transition-all duration-300`}
                        style={{ width: `${(passwordScore / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 w-16">{strengthLabel}</span>
                  </div>
                )}
              </Field>

              {isRegister && (
                <Field label="Confirmer le mot de passe" required>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`${inputCls} ${
                      confirmPassword && confirmPassword !== password ? "border-red-300 focus:ring-red-300" : ""
                    }`}
                    autoComplete="new-password"
                    required
                  />
                  {confirmPassword && confirmPassword !== password && (
                    <p className="text-xs text-red-500 mt-1.5">Les mots de passe ne correspondent pas.</p>
                  )}
                </Field>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition duration-200 disabled:opacity-60 text-sm flex items-center justify-center gap-2"
              >
                {loading && (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                )}
                {loading
                  ? "Un instant…"
                  : isRegister
                  ? "Créer mon compte"
                  : "Se connecter"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              {isRegister ? "Vous avez déjà un compte ?" : "Pas encore de compte ?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError("");
                }}
                className="font-bold text-indigo-600 hover:text-indigo-800 transition"
              >
                {isRegister ? "Connectez-vous" : "Créez-en un gratuitement"}
              </button>
            </p>
          </div>

          <p className="text-center text-xs text-slate-600 mt-6">
            En continuant, vous acceptez que vos enregistrements soient traités pour la transcription.
          </p>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm outline-none transition";

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 mb-1.5">
        {label} {required && <span className="text-indigo-500">*</span>}
      </label>
      {children}
    </div>
  );
}
