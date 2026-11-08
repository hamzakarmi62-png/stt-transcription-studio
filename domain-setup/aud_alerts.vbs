' AudStudio storage-alert listener — runs completely hidden (no console window).
' The Python script connects to the ntfy alert topic and pops Windows toasts.
CreateObject("WScript.Shell").Run """C:\Users\dell\AppData\Local\Programs\Python\Python312\pythonw.exe"" ""C:\Users\dell\Desktop\hamza karmi\domain-setup\aud_alerts_listener.py""", 0, False
