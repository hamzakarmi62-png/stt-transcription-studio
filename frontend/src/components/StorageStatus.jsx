import { useCallback, useEffect, useState } from "react";
import { api } from "../api";

const fmtMB = (mb) => (mb >= 1024 ? `${(mb / 1024).toFixed(2)} GB` : `${Math.round(mb)} MB`);
const fmtBytes = (b) => (b == null ? "—" : b >= 1073741824 ? `${(b / 1073741824).toFixed(2)} GB` : `${Math.round(b / 1048576)} MB`);

/**
 * Storage dashboard card: how full the cloud bucket and the server's
 * ephemeral disk are. When the bucket approaches its free-plan cap the card
 * turns amber and advises deleting old sessions from the archive — deletion
 * frees the cloud copy too.
 */
export default function StorageStatus({ isDark, glass, hairline, textSub, inputBg }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      setStatus(await api.storageStatus());
    } catch (e) {
      setErr(e?.message || "فشل جلب الحالة");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const bucket = status?.bucket || {};
  const usedGB = bucket.bytes != null ? bucket.bytes / 1073741824 : null;
  const limitGB = status?.plan_limit_gb || null;
  const pct = usedGB != null && limitGB ? Math.min(100, Math.round((usedGB / limitGB) * 100)) : null;
  const warn = pct != null && pct >= 75;

  const card = `${glass} rounded-[30px] p-6 border`;

  return (
    <div className={card}>
      <div className={`flex items-center gap-3 pb-4 border-b ${hairline}`}>
        <span className="w-10 h-10 rounded-xl border-[1.5px] border-[#18123b]/25 flex items-center justify-center text-[#18123b]">☁️</span>
        <div className="flex-1">
          <h2 className="text-lg font-black">حالة التخزين</h2>
          <p className={`text-xs ${textSub}`}>راقب المساحة واحذف الجلسات القديمة قبل الامتلاء</p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className={`text-xs font-bold px-3 py-2 rounded-xl border transition ${inputBg} disabled:opacity-50`}
        >
          {loading ? "..." : "تحديث"}
        </button>
      </div>

      {err && <p className="text-xs text-red-400 mt-3">{err}</p>}
      {!status && !err && <p className={`text-xs ${textSub} mt-3`}>جارٍ الجلب…</p>}

      {status && (
        <div className="mt-4 space-y-4">
          {/* Cloud bucket */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span>☁️ التخزين السحابي {bucket.driver === "s3" ? "(B2)" : bucket.driver === "supabase" ? "(Supabase)" : ""}</span>
              <span className={warn ? "text-amber-400" : ""}>
                {usedGB != null ? `${usedGB.toFixed(2)} GB` : fmtBytes(bucket.bytes)}
                {limitGB ? ` / ${limitGB} GB` : ""}
              </span>
            </div>
            {pct != null && (
              <div className={`h-2.5 rounded-full overflow-hidden ${isDark ? "bg-white/10" : "bg-slate-200"}`}>
                <div
                  className={`h-full rounded-full transition-all ${warn ? "bg-amber-500" : "bg-gradient-to-r from-indigo-500 to-violet-500"}`}
                  style={{ width: `${Math.max(2, pct)}%` }}
                ></div>
              </div>
            )}
            <p className={`text-[11px] mt-1.5 ${textSub}`}>
              {bucket.objects != null ? `${bucket.objects} ملف` : "—"}
              {bucket.media_bytes != null ? ` · وسائط: ${fmtBytes(bucket.media_bytes)}` : ""}
              {bucket.chunks_bytes != null ? ` · أجزاء مؤقتة: ${fmtBytes(bucket.chunks_bytes)}` : ""}
            </p>
            {warn && (
              <p className="text-[11px] text-amber-400 mt-1 font-bold">
                ⚠️ المساحة تقترب من الامتلاء — احذف الجلسات القديمة من أرشيفك (الحذف يفرّغ السحابة أيضاً).
              </p>
            )}
          </div>

          {/* Server disk */}
          <div className={`pt-4 border-t ${hairline}`}>
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span>🖥️ قرص الخادم (مؤقت — ينظّف نفسه تلقائياً)</span>
              <span>{fmtMB(status.disk?.free_mb)} حرّة</span>
            </div>
            <p className={`text-[11px] ${textSub}`}>
              {status.disk?.uploads_mb ?? 0} MB وسائط محلية ({status.disk?.local_files ?? 0} ملف) · احتياطي محفوظ {status.disk?.reserve_mb} MB · الحذف التلقائي عند الضيق
            </p>
          </div>

          {/* Janitor */}
          {status.janitor?.last_cycle ? (
            <p className={`text-[11px] ${textSub} pt-3 border-t ${hairline}`}>
              🧹 آخر دورية تنظيف: {new Date(status.janitor.last_cycle * 1000).toLocaleTimeString()}
              {status.janitor.evicted_total > 0 ? ` · أُزيلت ${status.janitor.evicted_total} نسخة محلية منذ الإقلاع` : " · لا حاجة للتنظيف بعد"}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
