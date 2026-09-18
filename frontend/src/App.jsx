import React, { useEffect, useState } from "react";
import LoginScreen from "./components/LoginScreen.jsx";
import LandingScreen from "./components/LandingScreen.jsx";
import UploadScreen from "./components/UploadScreen.jsx";
import TranscriptScreen from "./components/TranscriptScreen.jsx";
import audLogo from "./assets/aud-logo.png";

// Branded splash: pulsing glow ring around the Aud mark, letters of the
// name landing one after another, tagline tracking open, then the veil
// lifts to reveal the app.
function Splash({ done }) {
  return (
    <div
      className={`fixed inset-0 z-[999] bg-black flex flex-col items-center justify-center transition-opacity duration-700 ${
        done ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* ambient aurora */}
      <div className="absolute top-1/4 left-1/4 w-[420px] h-[420px] rounded-full bg-indigo-600/15 blur-[130px]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[380px] h-[380px] rounded-full bg-fuchsia-600/10 blur-[130px]"></div>

      <div className="relative">
        <div className="aud-splash-ring absolute -inset-8 rounded-full border-2 border-violet-500/30"></div>
        <div className="aud-splash-ring aud-splash-ring-2 absolute -inset-8 rounded-full border border-fuchsia-400/20"></div>
        <img
          src={audLogo}
          alt="Aud"
          className="relative w-52 h-52 sm:w-64 sm:h-64 object-contain aud-splash-logo"
          draggable={false}
        />
      </div>

      <p className="aud-splash-tag mt-7 text-[10px] sm:text-xs font-bold uppercase text-slate-400">
        Transcription Services · Intelligence Artificielle
      </p>

      <div className="mt-8 h-[3px] w-44 rounded-full bg-white/[0.08] overflow-hidden">
        <div className="aud-splash-bar h-full w-full bg-gradient-to-r from-blue-500 via-violet-500 to-fuchsia-500" />
      </div>
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-xl mx-auto mt-20 bg-red-50 border border-red-200 rounded-2xl text-red-700 space-y-4 shadow-lg" dir="rtl">
          <h2 className="text-lg font-bold">حدث خطأ في عرض الصفحة</h2>
          <pre className="text-xs bg-white p-3 rounded border border-red-200 overflow-auto text-red-600">
            {String(this.state.error && this.state.error.message)}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
          >
            إعادة تحميل الصفحة
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

import { setAuthToken } from "./api.js";

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const token = localStorage.getItem("auth_token");
      const savedUser = localStorage.getItem("auth_user");
      if (token && savedUser) {
        return JSON.parse(savedUser);
      }
      // If token is missing, clear stale user state to prevent unauthenticated session leaks
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_token");
      return null;
    } catch {
      return null;
    }
  });
  const [session, setSession] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [splashGone, setSplashGone] = useState(false);
  const [splashFading, setSplashFading] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setSplashFading(true), 2100);
    const t2 = setTimeout(() => setSplashGone(true), 2850);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleLogin = (u, token) => {
    setUser(u);
    if (token) {
      setAuthToken(token);
    }
    if (u) {
      try {
        localStorage.setItem("auth_user", JSON.stringify(u));
      } catch {
        /* ignore */
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    setSession(null);
    setAuthToken(null);
    try {
      localStorage.removeItem("auth_user");
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      {!splashGone && <Splash done={splashFading} />}
      {(!user) ? (
        showLogin ? (
          <ErrorBoundary>
            <LoginScreen onLogin={handleLogin} onBack={() => setShowLogin(false)} />
          </ErrorBoundary>
        ) : (
          <ErrorBoundary>
            <LandingScreen onStart={() => setShowLogin(true)} />
          </ErrorBoundary>
        )
      ) : (
        <ErrorBoundary>
          {session ? (
            <TranscriptScreen
              key={session.id}
              initialSession={session}
              onBack={() => setSession(null)}
              user={user}
              onLogout={handleLogout}
            />
          ) : (
            <UploadScreen onComplete={setSession} user={user} onLogout={handleLogout} />
          )}
        </ErrorBoundary>
      )}
    </>
  );
}
