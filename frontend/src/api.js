const BASE = "/api";

export function getAuthToken() {
  try {
    return localStorage.getItem("auth_token") || "";
  } catch {
    return "";
  }
}

export function setAuthToken(token) {
  try {
    if (token) localStorage.setItem("auth_token", token);
    else localStorage.removeItem("auth_token");
  } catch {
    /* ignore */
  }
}

async function request(url, options = {}) {
  const token = getAuthToken();
  const headers = {
    ...(options.headers || {}),
  };
  if (token && !headers["Authorization"] && !headers["authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const data = await res.json();
      detail = data.detail || detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  return res.json();
}

const CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB per chunk
const SMALL_FILE_THRESHOLD = 10 * 1024 * 1024; // use classic upload for files < 10 MB

export function uploadFile(file, onProgress) {
  const fileName = file.name || (file.type?.includes("video") ? "recording.mp4" : "recording.webm");
  if (file.size <= SMALL_FILE_THRESHOLD) {
    return _classicUpload(file, fileName, onProgress);
  }
  return _chunkedUpload(file, fileName, onProgress);
}

/** Classic single-request upload (for small files). */
function _classicUpload(file, fileName, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE}/upload`);
    const token = getAuthToken();
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          reject(new Error("استجابة غير صالحة من الخادم"));
        }
      } else {
        let detail = xhr.responseText;
        try {
          detail = JSON.parse(xhr.responseText).detail || detail;
        } catch {
          /* ignore */
        }
        reject(new Error(detail));
      }
    };
    xhr.onerror = () => reject(new Error("حدث انقطاع في الاتصال أثناء الرفع"));
    const form = new FormData();
    form.append("file", file, fileName);
    xhr.send(form);
  });
}

/** Chunked upload for large files — bypasses proxy size limits. */
async function _chunkedUpload(file, fileName, onProgress) {
  const token = getAuthToken();
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  // 1. Init: get a fresh upload_id
  const initRes = await fetch(`${BASE}/upload/init`, {
    method: "POST",
    headers: { ...authHeaders },
  });
  if (!initRes.ok) throw new Error("فشل بدء الرفع السحابي");
  const { upload_id } = await initRes.json();

  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  let uploaded = 0;

  try {
    // 2. Upload each chunk with retry
    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const blob = file.slice(start, end);

      let success = false;
      let lastErr = null;

      for (let attempt = 0; attempt < 4; attempt++) {
        try {
          const form = new FormData();
          form.append("upload_id", upload_id);
          form.append("chunk_index", String(i));
          form.append("file", blob, fileName);

          const res = await fetch(`${BASE}/upload/chunk`, {
            method: "POST",
            headers: { ...authHeaders },
            body: form,
          });
          if (res.ok) {
            success = true;
            break;
          }
          let detail = "فشل رفع الجزء";
          try { detail = (await res.json()).detail || detail; } catch { /* ignore */ }
          lastErr = new Error(detail);
        } catch (err) {
          lastErr = err;
        }
        await new Promise((r) => setTimeout(r, 1200));
      }

      if (!success) {
        throw lastErr || new Error(`فشل رفع الجزء ${i + 1} بعد عدة محاولات`);
      }

      uploaded += blob.size;
      onProgress(Math.round((uploaded / file.size) * 95)); // reserve 5% for assembly
    }

    // 3. Complete: ask server to assemble
    onProgress(97);
    let completeRes = null;
    let completeErr = null;

    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        completeRes = await fetch(`${BASE}/upload/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders },
          body: JSON.stringify({ upload_id, filename: fileName, total_chunks: totalChunks }),
        });
        if (completeRes.ok) break;
        let detail = "فشل تجميع الملف";
        try { detail = (await completeRes.json()).detail || detail; } catch { /* ignore */ }
        completeErr = new Error(detail);
      } catch (err) {
        completeErr = err;
      }
      await new Promise((r) => setTimeout(r, 2000));
    }

    if (!completeRes || !completeRes.ok) {
      throw completeErr || new Error("فشل تجميع الملف في الخادم");
    }

    onProgress(100);
    return await completeRes.json();
  } catch (err) {
    // Best-effort cleanup
    fetch(`${BASE}/upload/abort/${upload_id}`, {
      method: "DELETE",
      headers: { ...authHeaders },
    }).catch(() => {});
    throw err;
  }
}



export const api = {
  upload: uploadFile,

  getHealth: () => request(`${BASE}/health`),

  listSessions: () => request(`${BASE}/sessions`),

  getSession: (id) => request(`${BASE}/sessions/${id}`),

  saveSession: (id, data) =>
    request(`${BASE}/sessions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  deleteSession: (id) =>
    request(`${BASE}/sessions/${id}`, { method: "DELETE" }),

  startTranscribe: (id, language) =>
    request(`${BASE}/sessions/${id}/transcribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language: language || null }),
    }),

  startDiarize: (id, numSpeakers) =>
    request(`${BASE}/sessions/${id}/diarize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ num_speakers: numSpeakers }),
    }),

  exportUrl: (id, { format, includeSpeakers, includeTimestamps }) => {
    const params = new URLSearchParams({
      format,
      include_speakers: String(includeSpeakers),
      include_timestamps: String(includeTimestamps),
    });
    const token = getAuthToken();
    if (token) params.set("token", token);
    return `${BASE}/sessions/${id}/export?${params.toString()}`;
  },

  // Owner action: mint the stable share link for one transcript.
  createShareLink: (id) => request(`${BASE}/sessions/${id}/share`, { method: "POST" }),

  // <audio> tags cannot send headers, so the token rides in the query string.
  audioUrl: (id) => {
    const token = getAuthToken();
    return `${BASE}/sessions/${id}/audio${token ? `?token=${encodeURIComponent(token)}` : ""}`;
  },

  register: (username, email, password, profile = {}) =>
    request(`${BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        email,
        password,
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        country: profile.country || "",
      }),
    }),

  login: (identifier, password) =>
    request(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    }),

  // ── Post-transcription insights (never touches the transcript itself) ──
  startTranslate: (id, language) =>
    request(`${BASE}/sessions/${id}/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language }),
    }),

  translateStatus: (id) => request(`${BASE}/sessions/${id}/translate/status`),

  startSummary: (id) =>
    request(`${BASE}/sessions/${id}/summary`, { method: "POST" }),

  summaryStatus: (id) => request(`${BASE}/sessions/${id}/summary/status`),

  stats: (id) => request(`${BASE}/sessions/${id}/stats`),
};