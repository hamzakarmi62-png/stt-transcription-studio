"""Storage alerts: the operator must KNOW when the bucket or the ephemeral
disk approach their limits — a dashboard nobody opens is not a warning.

Two channels, both best-effort and never raising:
  * ntfy push   — zero-config: POST to https://ntfy.sh/<NTFY_TOPIC> and the
                  operator's phone/browser subscription receives it instantly.
  * email       — via the existing SMTP_* settings (same as public forms).

Alerts are level-based with a cooldown (alert_cooldown_hours, default 24):
crossing 75% warns once, 90% warns once, and only a sustained condition
re-alerts. A restart may re-send one alert at most — acceptable.
"""

import json
import time
from email.mime.text import MIMEText

import requests

from ..config import settings

_cooldown: dict[str, float] = {}


def _should_send(key: str) -> bool:
    """Cooldown gate: the same alert level is re-sent after cooldown_hours."""
    now = time.time()
    last = _cooldown.get(key, 0)
    if now - last < settings.alert_cooldown_hours * 3600:
        return False
    _cooldown[key] = now
    return True


def _ntfy(title: str, body: str, priority: str) -> None:
    if not settings.ntfy_topic:
        return
    try:
        requests.post(
            f"{settings.ntfy_server.rstrip('/')}/{settings.ntfy_topic}",
            data=body[:1000].encode("utf-8"),
            headers={
                "Title": title[:200],
                "Priority": priority,
                "Tags": "warning" if priority == "high" else "information_source",
            },
            timeout=10,
        )
    except Exception as exc:
        print("[alerts] ntfy failed:", exc)


def _email(title: str, body: str) -> None:
    if not (settings.smtp_host and settings.smtp_user and settings.smtp_pass and settings.notify_email):
        return
    try:
        import smtplib

        msg = MIMEText(body, "plain", "utf-8")
        msg["Subject"] = title
        msg["From"] = settings.smtp_user
        msg["To"] = settings.notify_email
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as srv:
            srv.starttls()
            srv.login(settings.smtp_user, settings.smtp_pass)
            srv.send_message(msg)
    except Exception as exc:
        print("[alerts] email failed:", exc)


def notify(title: str, body: str, key: str = "", priority: str = "default", force: bool = False) -> bool:
    """Send one alert through every configured channel. Returns whether it went."""
    if not force:
        gate = key or title
        if not _should_send(gate):
            return False
    _ntfy(title, body, priority)
    _email(title, body)
    safe = (title + " - " + body[:120]).encode("ascii", "replace").decode("ascii")
    print(f"[alerts] {safe}")
    return True


def _bucket_level() -> tuple[int, float | None, float | None]:
    """(percent, used_gb, limit_gb) for the cloud bucket; (0, None, None) when
    usage is unknown."""
    from . import storage

    usage = storage.bucket_usage()
    limit_gb = 10 if storage.driver() == "s3" else (1 if storage.driver() == "supabase" else None)
    if not usage or usage.get("bytes") is None or not limit_gb:
        return 0, None, None
    used_gb = usage["bytes"] / 1073741824
    return round(used_gb / limit_gb * 100), used_gb, float(limit_gb)


def check_storage() -> None:
    """Called from the disk janitor cycle: bucket quota + disk reserve levels."""
    pct, used_gb, limit_gb = _bucket_level()
    if pct >= 90:
        notify(
            "🚨 المساحة السحابية حرِجة — " f"{pct}%",
            f"استُهلك {used_gb:.1f} GB من {limit_gb:.0f} GB. احذف الجلسات القديمة من الأرشيف الآن، "
            "أو الترفع الجديد سيفشل.",
            key="bucket90",
            priority="high",
        )
    elif pct >= 75:
        notify(
            "⚠️ المساحة السحابية تقترب من الامتلاء — " f"{pct}%",
            f"استُهلك {used_gb:.1f} GB من {limit_gb:.0f} GB. يُنصح بحذف الجلسات القديمة من الأرشيف.",
            key="bucket75",
        )

    free_mb = None
    try:
        from . import disk_janitor

        free_mb = disk_janitor.free_mb()
    except Exception:
        pass
    if free_mb is not None and free_mb < settings.disk_reserve_mb:
        notify(
            "🚨 قرص الخادم ممتلئ رغم التنظيف",
            f"المتاح {free_mb:.0f} MB فقط (الاحتياطي {settings.disk_reserve_mb} MB). "
            "الرفوعات الجديدة سترفض — فكّر بحذف جلسات كثيرة الوسائط أو بترقية الخطة.",
            key="diskfull",
            priority="high",
        )


def alert_disk_pressure() -> None:
    """A 507 path fired: the disk could not make room even after eviction."""
    notify(
        "🚨 رفض رفع: قرص الخادم ممتلئ",
        "وصل طلب رفع ولم تستطع بوابات الحماية توفير مساحة كافية حتى بعد التنظيف. "
        "الوسائط القديمة محفوظة في السحابة — احذف جلسات من الأرشيف.",
        key="disk507",
        priority="high",
    )


def alert_cloud_write_failure(key: str, detail: str) -> None:
    """A cloud archival write failed — the operator should know before a
    restart loses the local copy."""
    notify(
        "⚠️ فشل حفظ نسخة سحابية",
        f"تعذّر أرشفة {key} إلى السحابة: {detail[:200]} — النسخة المحلية باقية، "
        "لكن إعادة تشغيل الخادم ستفقدها.",
        key="cloudwrite",
        priority="high",
    )
