# -*- coding: utf-8 -*-
"""AudStudio storage-alert listener (Windows desktop toasts).

Connects to the ntfy alert topic and pops a native Windows notification for
every alert — no browser, no email, no phone. Runs hidden in the background
(scheduled task "AudAlerts" at logon) and reconnects automatically if the
network drops.
"""

import json
import subprocess
import time
import urllib.request

TOPIC = "audstudio-storage-NdZDPqsrQtgZ00"
STREAM = f"https://ntfy.sh/{TOPIC}/json"

PS_TEMPLATE = r"""
[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
[Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null
$template = @"
<toast scenario="reminder"><visual><binding template="ToastGeneric"><text>__TITLE__</text><text>__BODY__</text></binding></visual></toast>
"@
$xml = New-Object Windows.Data.Xml.Dom.XmlDocument
$xml.LoadXml($template)
$toast = New-Object Windows.UI.Notifications.ToastNotification $xml
[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('Aud Studio Alerts').Show($toast)
"""


def _xml_escape(text: str) -> str:
    return (
        str(text)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


def show_toast(title: str, body: str, high: bool) -> None:
    ps = PS_TEMPLATE.replace("__TITLE__", _xml_escape(title)).replace(
        "__BODY__", _xml_escape(body)
    )
    try:
        subprocess.run(
            ["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", ps],
            capture_output=True,
            timeout=20,
        )
    except Exception as exc:
        print("toast failed:", exc)


def show_fallback(title: str, body: str) -> None:
    """Last resort if the modern toast API is unavailable: a message box."""
    safe_title = title.replace("'", "''")
    safe_body = body.replace("'", "''")
    subprocess.run(
        [
            "powershell", "-NoProfile", "-Command",
            f"Add-Type -AssemblyName System.Windows.Forms; "
            f"[System.Windows.Forms.MessageBox]::Show('{safe_body}', '{safe_title}')",
        ],
        capture_output=True,
        timeout=60,
    )


def handle_message(msg: dict) -> None:
    if msg.get("event") != "message":
        return
    title = msg.get("title") or "تنبيه AudStudio"
    body = msg.get("message") or ""
    high = str(msg.get("priority", 3)) in ("4", "5")
    print(f"[alert] {title} | {body}")
    try:
        show_toast(title, body, high)
    except Exception:
        try:
            show_fallback(title, body)
        except Exception as exc:
            print("fallback toast failed:", exc)


def main() -> None:
    # Only new messages: start from "now" so old cached alerts don't replay.
    since = int(time.time())
    while True:
        try:
            url = f"{STREAM}?since={since}"
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req, timeout=600) as resp:
                for raw in resp:
                    line = raw.decode("utf-8", "replace").strip()
                    if not line:
                        continue
                    try:
                        msg = json.loads(line)
                    except ValueError:
                        continue
                    since = max(since, int(msg.get("time", 0)))
                    handle_message(msg)
        except Exception as exc:
            print("stream dropped, reconnecting in 15s:", exc)
            time.sleep(15)


if __name__ == "__main__":
    main()
