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
  );
}
