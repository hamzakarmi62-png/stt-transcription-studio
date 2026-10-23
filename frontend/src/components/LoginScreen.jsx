import React, { useEffect, useRef, useState } from "react";
import { api } from "../api.js";
import audLogo from "../assets/aud-logo.png";
import { Target, Users, PenLine, FileText, Lock, AlertTriangle, Eye, EyeOff } from "./Icons.jsx";

function Logo({ size = "h-12" }) {
  return (
    <img
      src={audLogo}
      alt="Aud — Transcription Services"
      className={`${size} w-auto`}
      draggable={false}
    />
  );
}

export default function LoginScreen({ onLogin, onBack }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // Social providers configured server-side (empty = hidden). Google uses the
  // official button; Apple a native-style one — both hand an ID token to the
  // backend, which verifies it and returns the same session as email login.
  // Seeded from the localStorage cache so the buttons appear instantly on
  // revisit; the network fetch below only refreshes the cache.
  const [providers, setProviders] = useState(() => {
    try {
      const c = JSON.parse(localStorage.getItem("aud_auth_config") || "{}");
      return { google: c.google_client_id || "", apple: c.apple_client_id || "" };
    } catch {
      return { google: "", apple: "" };
    }
  });
  // False only before the very first config fetch resolves (no cache yet):
  // the OR/social block then reserves its space invisibly instead of popping
  // in and pushing everything below it down.
  const [cfgLoaded, setCfgLoaded] = useState(() => {
    try { return !!localStorage.getItem("aud_auth_config"); } catch { return false; }
  });
  const googleBtnRef = useRef(null);

  useEffect(() => {
    let alive = true;
    api.authConfig().then((cfg) => {
      if (!alive) return;
      const next = { google: cfg.google_client_id || "", apple: cfg.apple_client_id || "" };
      try {
        localStorage.setItem("aud_auth_config", JSON.stringify(next));
      } catch { /* ignore */ }
      setProviders(next);
      setCfgLoaded(true);

      if (next.apple && !document.getElementById("appleid-script")) {
        const s = document.createElement("script");
        s.id = "appleid-script";
        s.src = "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
        s.async = true;
        document.head.appendChild(s);
      }
    }).catch(() => { if (alive) setCfgLoaded(true); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Draw the Google button whenever the login screen is shown — including
  // revisits where the GSI script is already loaded (previously the button
  // area stayed empty because renderButton only ran in the script's onload).
  useEffect(() => {
    if (!providers.google) return;

    const draw = () => {
      try {
        if (!googleBtnRef.current || !window.google?.accounts?.id) return;
        window.google.accounts.id.initialize({
          client_id: providers.google,
          callback: async (response) => {
            try {
              setError("");
              setLoading(true);
              const out = await api.googleAuth(response.credential);
              if (out.success && out.user) onLogin(out.user, out.token);
            } catch (err) {
              setError(err.message || "Google sign-in failed.");
            } finally {
              setLoading(false);
            }
          },
        });
        const host = googleBtnRef.current;
        // Hide the host until Google's iframe is actually inside, then fade
        // in — otherwise the button pops into an empty slot and then
        // reshapes (generic → personalized) in full view.
        host.style.opacity = "0";
        host.style.transition = "opacity 0.45s ease";
        window.google.accounts.id.renderButton(host, {
          theme: "outline",
          size: "large",
          shape: "pill",
          text: "signin_with",
          width: 360,
        });
        const reveal = () => { host.style.opacity = "1"; };
        const obs = new MutationObserver(() => {
          if (host.querySelector("iframe")) {
            reveal();
            // Reveal again after the personalized swap settles, in case the
            // first paint was the generic button flashing mid-fade.
            setTimeout(reveal, 600);
            obs.disconnect();
          }
        });
        obs.observe(host, { childList: true, subtree: true });
        setTimeout(reveal, 2500); // safety net if the iframe event never fires
      } catch {
        /* button stays hidden on failure */
      }
    };

    const s = document.getElementById("gsi-script");
    if (window.google?.accounts?.id) {
      draw();
    } else if (s) {
      // Script in flight (or loaded but not yet parsed): draw when ready.
      s.dataset.loaded === "1" ? draw() : s.addEventListener("load", draw, { once: true });
    } else {
      const el = document.createElement("script");
      el.id = "gsi-script";
      el.src = "https://accounts.google.com/gsi/client";
      el.async = true;
      el.defer = true;
      el.addEventListener("load", () => {
        el.dataset.loaded = "1";
        draw();
      }, { once: true });
      document.head.appendChild(el);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providers.google]);

  const handleApple = async () => {
    try {
      setError("");
      setLoading(true);
      window.AppleID.auth.init({
        clientId: providers.apple,
        scope: "name email",
        redirectURI: window.location.origin,
        usePopup: true,
      });
      const res = await window.AppleID.auth.signIn();
      const out = await api.appleAuth(res.authorization.id_token);
      if (out.success && out.user) onLogin(out.user, out.token);
    } catch (err) {
      setError(err.error || err.message || "Apple sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  const passwordScore = (() => {
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  })();
  const strengthLabel = ["Too short", "Weak", "Fair", "Good", "Strong", "Excellent"][
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
        if (!fullName.trim()) throw new Error("Please enter your full name.");
        if (!username || !password) {
          throw new Error("Please fill in all required fields.");
        }
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(username)) {
          throw new Error("Invalid email address.");
        }
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters.");
        }
        setLoading(true);
        const res = await api.register("", username.trim().toLowerCase(), password, {
          full_name: fullName,
        });
        if (res.success && res.user) {
          onLogin(res.user, res.token);
        }
      } else {
        if (!username || !password) {
          throw new Error("Please enter your email and password.");
        }
        setLoading(true);
        const res = await api.login(username, password);
        if (res.success && res.user) {
          onLogin(res.user, res.token);
        }
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex" dir="ltr" lang="en">
      {/* Brand panel — pinned to viewport height so it never stretches when
          the taller sign-up form makes the page scroll (kept identical in
          both modes, exactly like sign in). */}
      <div className="hidden lg:flex lg:w-[45%] lg:sticky lg:top-0 lg:h-screen self-start relative overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-950 to-violet-950">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-fuchsia-600/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center">
            <button
              type="button"
              onClick={onBack}
              title={onBack ? "Back to home" : undefined}
              className={`relative rounded-xl transition ${onBack ? "hover:opacity-80 hover:scale-[1.03] cursor-pointer" : "cursor-default"} focus:outline-none focus:ring-2 focus:ring-indigo-400/60 aud-brand-rise aud-brand-rise-1`}
            >
              <span
                className="aud-brand-halo absolute -inset-5 rounded-2xl bg-indigo-500/25 blur-2xl pointer-events-none"
                aria-hidden="true"
              ></span>
              <img
                src={audLogo}
                alt="Aud"
                className="aud-brand-logo relative h-16 w-auto drop-shadow-[0_10px_30px_rgba(37,99,235,0.35)]"
                draggable={false}
              />
            </button>
          </div>

          <div className="space-y-8 max-w-md">
            <h2 className="text-4xl font-black text-white leading-tight aud-brand-rise aud-brand-rise-2">
              Turn your{" "}
              <span className="aud-brand-sheen bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
                audio & video
              </span>{" "}
              into text, in minutes.
            </h2>
            <ul className="space-y-4">
              {[
                [<Target className="w-4 h-4 text-indigo-300" key="t" />, "Accurate automatic transcription with precise timestamps"],
                [<Users className="w-4 h-4 text-violet-300" key="u" />, "Speaker detection — know who said what, when"],
                [<PenLine className="w-4 h-4 text-fuchsia-300" key="p" />, "Real-time editor: fix while you listen, word by word"],
                [<FileText className="w-4 h-4 text-sky-300" key="f" />, "Clean export to TXT, SRT, DOCX and PDF"],
              ].map(([icon, text], i) => (
                <li
                  key={text}
                  className={`aud-brand-item flex items-center gap-3 text-slate-300 text-sm aud-brand-rise aud-brand-rise-${i + 3}`}
                >
                  <span className="aud-brand-icon w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    {icon}
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <p className="aud-brand-soft text-slate-500 text-xs flex items-center gap-1.5 aud-brand-rise aud-brand-rise-6">
            <Lock className="w-3.5 h-3.5 shrink-0" /><span>Your recordings stay private — encrypted storage and authenticated access.</span>
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center mb-8">
            <button
              type="button"
              onClick={onBack}
              title={onBack ? "Back to home" : undefined}
              className={`rounded-xl transition ${onBack ? "hover:opacity-80 cursor-pointer" : "cursor-default"}`}
            >
              <img
                src={audLogo}
                alt="Aud"
                className="h-14 w-auto drop-shadow-[0_8px_24px_rgba(37,99,235,0.35)]"
                draggable={false}
              />
            </button>
          </div>

          <div className="aud-card-in bg-white rounded-3xl shadow-2xl shadow-black/40 p-8">
            <div className="aud-card-el aud-card-el-1 flex items-center gap-3 mb-6">
              <div className={`flex rounded-xl bg-slate-100 p-1 text-sm font-semibold`}>
                <button
                  type="button"
                  onClick={() => { setIsRegister(false); setError(""); }}
                  className={`px-4 py-2 rounded-lg transition ${
                    !isRegister ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => { setIsRegister(true); setError(""); }}
                  className={`px-4 py-2 rounded-lg transition ${
                    isRegister ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Sign up
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl font-medium flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {isRegister && (
                <Field label="Full name" required>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Hamza Karmi"
                    className={inputCls}
                    autoComplete="name"
                    required
                  />
                </Field>
              )}

              <div className="aud-card-el aud-card-el-2">
                <Field label="Email" required>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="name@example.com"
                    className={inputCls}
                    autoComplete="email"
                    required
                  />
                </Field>
              </div>

              <div className="aud-card-el aud-card-el-3">
              <Field label="Password" required>
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
                    title={showPassword ? "Hide" : "Show"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
              </div>


              <button
                type="submit"
                disabled={loading}
                className="aud-cta aud-card-el aud-card-el-4 w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition duration-200 disabled:opacity-60 text-sm flex items-center justify-center gap-2"
              >
                {loading && (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                )}
                {loading
                  ? "One moment…"
                  : isRegister
                  ? "Create my account"
                  : "Sign in"}
              </button>
            </form>

            {(providers.google || providers.apple || !cfgLoaded) && (
              <div
                className={`aud-card-el aud-card-el-5 transition-opacity duration-300 ${cfgLoaded ? "opacity-100" : "opacity-0 pointer-events-none"}`}
              >
                <div className="my-5 flex items-center gap-4" aria-hidden="true">
                  <span className="flex-1 h-px bg-slate-200"></span>
                  <span className="text-sm font-bold text-slate-400">OR</span>
                  <span className="flex-1 h-px bg-slate-200"></span>
                </div>
                <div className="space-y-3">
                  {providers.google && <div ref={googleBtnRef} className="flex justify-center min-h-[44px]"></div>}
                  {providers.apple && (
                    <button
                      type="button"
                      onClick={handleApple}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-3 py-3 bg-white border border-slate-300 rounded-full font-semibold text-slate-900 hover:bg-slate-50 transition disabled:opacity-60 text-sm"
                    >
                      <svg viewBox="0 0 384 512" className="w-4 h-4 fill-slate-900" aria-hidden="true">
                        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                      </svg>
                      Sign in with Apple
                    </button>
                  )}
                </div>
              </div>
            )}

            <p className="aud-card-el aud-card-el-6 mt-6 text-center text-sm text-slate-500">
              {isRegister ? "Already have an account?" : "No account yet?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError("");
                }}
                className="font-bold text-indigo-600 hover:text-indigo-800 transition"
              >
                {isRegister ? "Sign in" : "Create one for free"}
              </button>
            </p>
          </div>

          <p className="text-center text-xs text-slate-600 mt-6">
            By continuing, you agree that your recordings are processed for transcription.
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
