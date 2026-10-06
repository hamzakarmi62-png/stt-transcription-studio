// Link classification for the Link Transcription checker — pure functions.
// Returns { ok, type, label, tips[] } — never throws.

const YT_PATTERNS = [
  /^https?:\/\/(www\.|m\.)?youtube\.com\/watch\?/i,
  /^https?:\/\/youtu\.be\//i,
  /^https?:\/\/(www\.)?youtube\.com\/(shorts|embed|live)\//i,
];

export function checkLink(raw) {
  const url = String(raw || "").trim();
  if (!url) {
    return { ok: false, type: "empty", label: "No link yet", tips: ["Paste a YouTube link or a direct MP4/MP3 URL."] };
  }
  if (!/^https?:\/\//i.test(url)) {
    return { ok: false, type: "scheme", label: "Not a web link", tips: ["The link should start with http:// or https://.", "Example: https://youtu.be/… or https://example.com/audio.mp3"] };
  }
  if (/\s/.test(url)) {
    return { ok: false, type: "spaces", label: "The link contains spaces", tips: ["Copy the link again — a space usually means part of the page title came along."], };
  }
  if (YT_PATTERNS.some((re) => re.test(url))) {
    return { ok: true, type: "youtube", label: "YouTube link", tips: ["Aud fetches the video into your account and runs the normal transcription pipeline.", "The video must be publicly reachable — private or unlisted videos need the file uploaded instead."] };
  }
  if (/^https?:\/\/[^\s]+\.(mp3|mp4)(\?[^\s]*)?$/i.test(url)) {
    const ext = url.split("?")[0].split(".").pop().toLowerCase();
    return { ok: true, type: "direct", label: `Direct ${ext.toUpperCase()} link`, tips: ["Direct media links are fetched as-is.", "If the server requires a login, download the file and upload it instead."] };
  }
  if (/\.(mp3|mp4|m4a|wav|ogg|mkv|webm)(\?[^\s]*)?$/i.test(url)) {
    return { ok: false, type: "ext", label: "Direct link, but not one of the fetched types", tips: ["Link transcription fetches MP4 and MP3 URLs.", "For other formats, download the file and upload it (MP3, WAV, M4A, OGG, MP4, MKV are accepted)."] };
  }
  return {
    ok: false,
    type: "page",
    label: "Looks like a web page, not a media file",
    tips: [
      "Link transcription accepts YouTube links and direct MP4/MP3 URLs.",
      "If the media lives behind this page, copy its direct address — on YouTube use the Share button, for files right-click and copy the file address.",
    ],
  };
}
