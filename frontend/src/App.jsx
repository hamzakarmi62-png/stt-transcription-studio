import React, { useState } from "react";
import LoginScreen from "./components/LoginScreen.jsx";
import UploadScreen from "./components/UploadScreen.jsx";
import TranscriptScreen from "./components/TranscriptScreen.jsx";

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

  const handleLogin = (u) => {
    setUser(u);
  };

  const handleLogout = () => {
    setUser(null);
    setSession(null);
  };

  if (!user) {
    return (
      <ErrorBoundary>
        <LoginScreen onLogin={handleLogin} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="absolute top-4 left-4 z-50 flex items-center gap-3 bg-white/95 backdrop-blur px-3 py-2 rounded-2xl shadow-lg shadow-black/5 border border-slate-200 text-sm" dir="ltr">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-black shrink-0">
          {(user.full_name || user.username || "?")
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((p) => p[0])
            .join("")
            .toUpperCase()}
        </div>
        <div className="leading-tight min-w-0">
          <p className="font-bold text-slate-900 truncate max-w-[160px]">
            {user.full_name || user.username}
          </p>
          <p className="text-[11px] text-slate-400 truncate max-w-[160px]">{user.email}</p>
        </div>
        <div className="w-[1px] h-7 bg-slate-200"></div>
        <button
          onClick={handleLogout}
          className="text-red-600 hover:text-white hover:bg-red-600 font-semibold text-xs px-3 py-2 rounded-xl border border-red-200 transition"
          title="Se déconnecter"
        >
          Déconnexion
        </button>
      </div>
      {session ? (
        <TranscriptScreen
          key={session.id}
          initialSession={session}
          onBack={() => setSession(null)}
        />
      ) : (
        <UploadScreen onComplete={setSession} />
      )}
    </ErrorBoundary>
  );
}
