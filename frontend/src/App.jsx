import React, { useEffect, useState } from "react";
import LoginScreen from "./components/LoginScreen.jsx";
import UploadScreen from "./components/UploadScreen.jsx";
import TranscriptScreen from "./components/TranscriptScreen.jsx";
import audLogo from "./assets/aud-logo.png";

// Branded splash: the Aud logo scales in with a soft glow, holds a beat,
// then the veil fades to reveal the app.
function Splash({ done }) {
  return (
    <div
      className={`fixed inset-0 z-[999] bg-black flex flex-col items-center justify-center transition-opacity duration-500 ${
        done ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <img
        src={audLogo}
        alt="Aud — Transcription Services"
        className="w-[min(70vw,520px)] aud-splash-logo"
        draggable={false}
      />
      <div className="mt-6 h-1 w-40 rounded-full bg-white/10 overflow-hidden">
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

export default function App() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [splashGone, setSplashGone] = useState(false);
  const [splashFading, setSplashFading] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setSplashFading(true), 1400);
    const t2 = setTimeout(() => setSplashGone(true), 1950);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleLogin = (u) => {
    setUser(u);
  };

  const handleLogout = () => {
    setUser(null);
    setSession(null);
  };

  return (
    <>
      {!splashGone && <Splash done={splashFading} />}
      {(!user) ? (
        <ErrorBoundary>
          <LoginScreen onLogin={handleLogin} />
        </ErrorBoundary>
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
