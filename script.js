let defaults = {
  name: "beautiful one",
  from: "someone cheering for you",
  opening: "This is not just a birthday page. It is a small world built to celebrate you.",
  note: "I hope this year feels gentle, bright, and deeply yours.",
  photo: "",
  audio: "",
  audioStart: "",
  audioEnd: "",
  photoCaptionText: "",
  sceneTwoImage: "",
  sceneTwoCaptionText: "",
  sceneThreeImage: "",
  sceneThreeCaptionText: "",
  sceneFourImage: "",
  sceneFourCaptionText: "",
  gallery: "",
  boothCaptions: "",
  theme: "moonlit",
};

const themes = {
  moonlit: { label: "Moonlit", themeColor: "#0c1220" },
  blush: { label: "Blush", themeColor: "#fff1f3" },
  daybreak: { label: "Daybreak", themeColor: "#f5ecdf" },
  starlit: { label: "Starlit", themeColor: "#07111f" },
  rosewood: { label: "Rosewood", themeColor: "#1b0c12" },
  meadow: { label: "Meadow", themeColor: "#edf7ef" },
};

const compliments = [
  "You make people feel comfortable without even trying.",
  "You turn ordinary moments into the kind people replay later.",
  "You have that rare mix of calm, wit, and warmth.",
  "You make a room feel lighter just by being fully yourself.",
  "You are easy to talk to, and hard to forget.",
  "You make kindness look natural, not performative.",
  "You have the kind of energy that makes people stay a little longer.",
  "You make being thoughtful look effortless.",
];

const noticing = [
  {
    title: "Calm presence",
    body: "You bring ease into a space without announcing it. People just feel it.",
  },
  {
    title: "Real warmth",
    body: "You have a way of making conversations feel safe, easy, and a little brighter.",
  },
  {
    title: "Quiet wit",
    body: "The best lines are rarely loud. They arrive softly and still win the whole moment.",
  },
  {
    title: "Effortless care",
    body: "You notice people in a way that makes them feel more like themselves.",
  },
];

const moments = [
  {
    title: "The easy conversations",
    body: "The kind that start casually and then become the part of the day you remember the most.",
  },
  {
    title: "The low-key funny moments",
    body: "Not the loud kind. The clever kind that sneaks up on you and keeps the whole mood light.",
  },
  {
    title: "The ordinary plans that felt better than expected",
    body: "The best memories do not always arrive with warning. Sometimes they just happen because the company is right.",
  },
  {
    title: "The feeling that stays afterward",
    body: "When the moment ends, but the warmth of it lingers longer than it probably should.",
  },
];

const boothPlaceholders = [
  {
    title: "An old smile belongs here",
    body: "Add a throwback photo that feels instantly familiar the second she sees it.",
  },
  {
    title: "A memory worth surprising her with",
    body: "Choose the kind of older frame that quietly says, “I still remember this.”",
  },
  {
    title: "One more little keepsake",
    body: "Even one nostalgic image here can make the ending feel unexpectedly personal.",
  },
];

const sceneFrameMeta = {
  sceneTwoImage: {
    title: "Page three frame",
    fallback: "A single image here makes the memory page feel intentional.",
    local: "Page 3 is previewing on this device and will upload when you copy the short share link.",
  },
  sceneThreeImage: {
    title: "Page four frame",
    fallback: "One focused image gives the middle of the story a cleaner, more premium feel.",
    local: "Page 4 is previewing on this device and will upload when you copy the short share link.",
  },
  sceneFourImage: {
    title: "Page five frame",
    fallback: "A dedicated image here gives the compliments page a stronger mood.",
    local: "Page 5 is previewing on this device and will upload when you copy the short share link.",
  },
};

const body = document.body;
const prefersReducedMotion =
  window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const REMOTE_SHARE_ENDPOINT = "/api/share";
const REMOTE_SHARE_PARAM = "share";
const REMOTE_SHARE_LIMIT_BYTES = 12 * 1024 * 1024;
const IMAGE_COMPRESSION_PROFILES = {
  cover: [
    { maxEdge: 2048, webpQuality: 0.96, jpegQuality: 0.98 },
    { maxEdge: 1840, webpQuality: 0.94, jpegQuality: 0.96 },
    { maxEdge: 1600, webpQuality: 0.9, jpegQuality: 0.92 },
    { maxEdge: 1360, webpQuality: 0.84, jpegQuality: 0.86 },
    { maxEdge: 1120, webpQuality: 0.76, jpegQuality: 0.78 },
  ],
  scene: [
    { maxEdge: 1920, webpQuality: 0.95, jpegQuality: 0.97 },
    { maxEdge: 1680, webpQuality: 0.92, jpegQuality: 0.94 },
    { maxEdge: 1440, webpQuality: 0.88, jpegQuality: 0.9 },
    { maxEdge: 1200, webpQuality: 0.82, jpegQuality: 0.84 },
    { maxEdge: 980, webpQuality: 0.74, jpegQuality: 0.76 },
  ],
  booth: [
    { maxEdge: 1440, webpQuality: 0.92, jpegQuality: 0.94 },
    { maxEdge: 1240, webpQuality: 0.9, jpegQuality: 0.92 },
    { maxEdge: 1080, webpQuality: 0.86, jpegQuality: 0.88 },
    { maxEdge: 920, webpQuality: 0.8, jpegQuality: 0.82 },
    { maxEdge: 760, webpQuality: 0.72, jpegQuality: 0.74 },
  ],
};

let state;
let activeShareHash = "";
let activeShareId = "";
let shareNeedsSync = true;
let shareSyncTimer = 0;
let youtubePlayer = null;
let youtubeApiPromise = null;
let youtubeState = {
  source: "",
  videoId: "",
  ready: false,
  playing: false,
  pollTimer: 0,
};
const sharedMedia = {
  photo: "",
  sceneTwoImage: "",
  sceneThreeImage: "",
  sceneFourImage: "",
  gallery: [],
};
const localPreview = {
  photo: null,
  audio: null,
  sceneTwoImage: null,
  sceneThreeImage: null,
  sceneFourImage: null,
  gallery: [],
};

const refs = {
  shell: document.querySelector(".shell"),
  storyUi: document.querySelector(".story-ui"),
  page: document.querySelector(".page"),
  customizeLauncher: document.getElementById("customizeToggle"),
  nameSlots: Array.from(document.querySelectorAll("[data-name]")),
  fromSlots: Array.from(document.querySelectorAll("[data-from]")),
  openingSlots: Array.from(document.querySelectorAll("[data-opening]")),
  titleNode: document.querySelector("title"),
  themeColorMeta: document.querySelector('meta[name="theme-color"]'),
  navLinks: Array.from(document.querySelectorAll(".nav a")),
  storyPages: Array.from(document.querySelectorAll(".story-page")),
  storyCounter: document.getElementById("storyCounter"),
  storyDots: document.getElementById("storyDots"),
  prevStory: document.getElementById("prevStory"),
  nextStory: document.getElementById("nextStory"),
  photoImage: document.getElementById("photoImage"),
  photoPlaceholder: document.getElementById("photoPlaceholder"),
  monogram: document.getElementById("monogram"),
  photoCaption: document.getElementById("photoCaption"),
  noticingGrid: document.getElementById("noticingGrid"),
  memoryGrid: document.getElementById("memoryGrid"),
  sceneTwoImage: document.getElementById("sceneTwoImage"),
  sceneTwoPlaceholder: document.getElementById("sceneTwoPlaceholder"),
  sceneTwoCaption: document.getElementById("sceneTwoCaption"),
  sceneThreeImage: document.getElementById("sceneThreeImage"),
  sceneThreePlaceholder: document.getElementById("sceneThreePlaceholder"),
  sceneThreeCaption: document.getElementById("sceneThreeCaption"),
  sceneFourImage: document.getElementById("sceneFourImage"),
  sceneFourPlaceholder: document.getElementById("sceneFourPlaceholder"),
  sceneFourCaption: document.getElementById("sceneFourCaption"),
  boothGrid: document.getElementById("boothGrid"),
  boothHint: document.getElementById("boothHint"),
  complimentTextCurrent: document.getElementById("complimentTextCurrent"),
  complimentTextNext: document.getElementById("complimentTextNext"),
  complimentBtn: document.getElementById("complimentBtn"),
  complimentQuick: document.getElementById("complimentQuick"),
  sparkButton: document.getElementById("sparkButton"),
  letterLines: document.getElementById("letterLines"),
  finaleLead: document.getElementById("finaleLead"),
  finaleMessage: document.getElementById("finaleMessage"),
  celebrateButton: document.getElementById("celebrateButton"),
  audioPlayer: document.getElementById("audioPlayer"),
  audioToggle: document.getElementById("audioToggle"),
  nameInput: document.getElementById("nameInput"),
  fromInput: document.getElementById("fromInput"),
  openingInput: document.getElementById("openingInput"),
  photoInput: document.getElementById("photoInput"),
  photoFileInput: document.getElementById("photoFileInput"),
  photoFileStatus: document.getElementById("photoFileStatus"),
  photoCaptionInput: document.getElementById("photoCaptionInput"),
  audioInput: document.getElementById("audioInput"),
  audioStartInput: document.getElementById("audioStartInput"),
  audioEndInput: document.getElementById("audioEndInput"),
  youtubeClipFields: document.getElementById("youtubeClipFields"),
  audioFileInput: document.getElementById("audioFileInput"),
  audioFileStatus: document.getElementById("audioFileStatus"),
  sceneTwoInput: document.getElementById("sceneTwoInput"),
  sceneTwoFileInput: document.getElementById("sceneTwoFileInput"),
  sceneTwoFileStatus: document.getElementById("sceneTwoFileStatus"),
  sceneTwoCaptionInput: document.getElementById("sceneTwoCaptionInput"),
  sceneThreeInput: document.getElementById("sceneThreeInput"),
  sceneThreeFileInput: document.getElementById("sceneThreeFileInput"),
  sceneThreeFileStatus: document.getElementById("sceneThreeFileStatus"),
  sceneThreeCaptionInput: document.getElementById("sceneThreeCaptionInput"),
  sceneFourInput: document.getElementById("sceneFourInput"),
  sceneFourFileInput: document.getElementById("sceneFourFileInput"),
  sceneFourFileStatus: document.getElementById("sceneFourFileStatus"),
  sceneFourCaptionInput: document.getElementById("sceneFourCaptionInput"),
  boothInput: document.getElementById("boothInput"),
  boothFileInput: document.getElementById("boothFileInput"),
  boothFileStatus: document.getElementById("boothFileStatus"),
  boothCaptionsInput: document.getElementById("boothCaptionsInput"),
  noteInput: document.getElementById("noteInput"),
  copyLink: document.getElementById("copyLink"),
  copyLinkSecondary: document.getElementById("copyLinkSecondary"),
  resetPage: document.getElementById("resetPage"),
  customizePanel: document.getElementById("customizePanel"),
  customizeToggle: document.getElementById("customizeToggle"),
  openCustomizer: document.getElementById("openCustomizer"),
  closeCustomizer: document.getElementById("closeCustomizer"),
  themeButtons: Array.from(document.querySelectorAll("[data-theme-choice]")),
  floatLayer: document.getElementById("floatLayer"),
  confettiLayer: document.getElementById("confettiLayer"),
  youtubePlayerHost: document.getElementById("youtubePlayerHost"),
  youtubePlayerMount: document.getElementById("youtubePlayer"),
  nextButtons: Array.from(document.querySelectorAll("[data-next]")),
};

const complimentState = {
  index: Math.floor(Math.random() * compliments.length),
  busy: false,
};

const storyState = {
  index: 0,
};

function trim(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isHttpUrl(value) {
  return /^https?:\/\//i.test(trim(value));
}

function isDataUrl(value) {
  return /^data:image\//i.test(trim(value));
}

function isMediaDataUrl(value) {
  return /^data:(audio|video)\//i.test(trim(value));
}

function isRelativeImagePath(value) {
  return /^(?:\.\/)?[a-z0-9][a-z0-9/_\-.]*\.(png|jpe?g|webp|gif|avif|svg)$/i.test(trim(value));
}

function isRelativeMediaPath(value) {
  return /^(?:\.\/)?[a-z0-9][a-z0-9/_\-.]*\.(mp3|wav|ogg|m4a|mp4|m4v|webm|mov)$/i.test(
    trim(value)
  );
}

function isImageSource(value) {
  const candidate = trim(value);
  return isHttpUrl(candidate) || isDataUrl(candidate) || isRelativeImagePath(candidate);
}

function extractYouTubeVideoId(value) {
  const candidate = trim(value);
  if (!candidate) return "";

  try {
    const url = new URL(candidate);
    const host = url.hostname.replace(/^www\./i, "").toLowerCase();

    if (host === "youtu.be") {
      return url.pathname.split("/").filter(Boolean)[0] || "";
    }

    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "music.youtube.com" ||
      host === "youtube-nocookie.com"
    ) {
      if (url.searchParams.get("v")) {
        return trim(url.searchParams.get("v"));
      }

      const parts = url.pathname.split("/").filter(Boolean);
      if (parts[0] === "embed" || parts[0] === "shorts" || parts[0] === "live") {
        return parts[1] || "";
      }
    }
  } catch {
    return "";
  }

  return "";
}

function isYouTubeUrl(value) {
  return Boolean(extractYouTubeVideoId(value));
}

function isAudioSource(value) {
  const candidate = trim(value);
  return isHttpUrl(candidate) || isMediaDataUrl(candidate) || isRelativeMediaPath(candidate) || isYouTubeUrl(candidate);
}

function isQuerySafeImageSource(value) {
  const candidate = trim(value);
  return isHttpUrl(candidate) || isRelativeImagePath(candidate);
}

function isShareableAudioSource(value) {
  const candidate = trim(value);
  return isHttpUrl(candidate) || isRelativeMediaPath(candidate) || isYouTubeUrl(candidate);
}

function escapeHTML(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeTheme(theme) {
  return themes[theme] ? theme : defaults.theme;
}

function normalizeSingleLineText(raw, fallback = "", maxLength = 160) {
  const value = trim(raw);
  return value ? value.slice(0, maxLength) : fallback;
}

function normalizeCaptionLines(raw, maxCount = 6) {
  if (typeof raw !== "string") return "";

  return raw
    .split(/\r?\n/)
    .slice(0, maxCount)
    .map((line) => trim(line).slice(0, 120))
    .join("\n");
}

function parseCaptionLines(raw, maxCount = 6) {
  return normalizeCaptionLines(raw, maxCount)
    .split(/\r?\n/)
    .slice(0, maxCount);
}

function parseTimeInputToSeconds(value) {
  const candidate = trim(value);
  if (!candidate) return null;

  if (/^\d+$/.test(candidate)) {
    return Math.max(0, Number(candidate));
  }

  const parts = candidate.split(":").map((part) => Number(part));
  if (parts.some((part) => !Number.isFinite(part) || part < 0)) {
    return null;
  }

  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }

  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }

  return null;
}

function getAudioClipRange() {
  const start = parseTimeInputToSeconds(state.audioStart);
  const end = parseTimeInputToSeconds(state.audioEnd);

  return {
    start: start ?? 0,
    end: Number.isFinite(end) && end > (start ?? 0) ? end : null,
  };
}

function normalizeGalleryText(raw) {
  if (typeof raw !== "string") return "";

  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [rawUrl, ...captionParts] = line.split("|");
      const url = trim(rawUrl);
      if (!isImageSource(url)) return "";
      const caption = trim(captionParts.join("|"));
      return caption ? `${url} | ${caption}` : url;
    })
    .filter(Boolean)
    .slice(0, 6)
    .join("\n");
}

function parseGalleryEntries(raw) {
  return normalizeGalleryText(raw)
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line, index) => {
      const [rawUrl, ...captionParts] = line.split("|");
      const url = trim(rawUrl);
      if (!url) return null;

      const caption = trim(captionParts.join("|"));
      return {
        url,
        caption: caption || `Memory ${index + 1}`,
      };
    })
    .filter(Boolean)
    .slice(0, 6);
}

function extractGalleryUrls(raw) {
  return parseGalleryEntries(raw).map((entry) => entry.url);
}

function normalizeState(raw, fallback = defaults) {
  const legacyGallery = normalizeGalleryText(typeof raw.gallery === "string" ? raw.gallery : fallback.gallery);

  return {
    name: trim(raw.name) || fallback.name,
    from: trim(raw.from) || fallback.from,
    opening: trim(raw.opening) || fallback.opening,
    note: trim(raw.note) || fallback.note,
    photo: isImageSource(raw.photo) ? trim(raw.photo) : fallback.photo || "",
    audio: isAudioSource(raw.audio) ? trim(raw.audio) : fallback.audio || "",
    audioStart: normalizeSingleLineText(raw.audioStart, fallback.audioStart || "", 20),
    audioEnd: normalizeSingleLineText(raw.audioEnd, fallback.audioEnd || "", 20),
    photoCaptionText: normalizeSingleLineText(raw.photoCaptionText, fallback.photoCaptionText || "", 160),
    sceneTwoImage: isImageSource(raw.sceneTwoImage)
      ? trim(raw.sceneTwoImage)
      : fallback.sceneTwoImage || "",
    sceneTwoCaptionText: normalizeSingleLineText(
      raw.sceneTwoCaptionText,
      fallback.sceneTwoCaptionText || "",
      160
    ),
    sceneThreeImage: isImageSource(raw.sceneThreeImage)
      ? trim(raw.sceneThreeImage)
      : fallback.sceneThreeImage || "",
    sceneThreeCaptionText: normalizeSingleLineText(
      raw.sceneThreeCaptionText,
      fallback.sceneThreeCaptionText || "",
      160
    ),
    sceneFourImage: isImageSource(raw.sceneFourImage)
      ? trim(raw.sceneFourImage)
      : fallback.sceneFourImage || "",
    sceneFourCaptionText: normalizeSingleLineText(
      raw.sceneFourCaptionText,
      fallback.sceneFourCaptionText || "",
      160
    ),
    gallery: legacyGallery,
    boothCaptions: normalizeCaptionLines(
      typeof raw.boothCaptions === "string" ? raw.boothCaptions : fallback.boothCaptions,
      6
    ),
    theme: normalizeTheme(raw.theme || fallback.theme),
  };
}

function revokePreviewEntry(entry) {
  if (entry?.url) {
    URL.revokeObjectURL(entry.url);
  }
}

function clearSharedMedia(key) {
  if (key in sharedMedia) {
    sharedMedia[key] = key === "gallery" ? [] : "";
  }
}

function clearAllSharedMedia() {
  Object.keys(sharedMedia).forEach((key) => {
    sharedMedia[key] = key === "gallery" ? [] : "";
  });
}

function invalidateShareHash() {
  activeShareHash = "";
  shareNeedsSync = true;
  if (shareSyncTimer) {
    window.clearTimeout(shareSyncTimer);
    shareSyncTimer = 0;
  }
}

function clearLocalPhotoPreview(options = {}) {
  revokePreviewEntry(localPreview.photo);
  localPreview.photo = null;

  if (!options.keepInput && refs.photoFileInput) {
    refs.photoFileInput.value = "";
  }
}

function clearLocalAudioPreview(options = {}) {
  revokePreviewEntry(localPreview.audio);
  localPreview.audio = null;

  if (!options.keepInput && refs.audioFileInput) {
    refs.audioFileInput.value = "";
  }
}

function clearLocalScenePreview(key, options = {}) {
  revokePreviewEntry(localPreview[key]);
  localPreview[key] = null;

  const inputMap = {
    sceneTwoImage: refs.sceneTwoFileInput,
    sceneThreeImage: refs.sceneThreeFileInput,
    sceneFourImage: refs.sceneFourFileInput,
  };

  if (!options.keepInput && inputMap[key]) {
    inputMap[key].value = "";
  }
}

function clearLocalBoothPreview(options = {}) {
  localPreview.gallery.forEach((entry) => {
    revokePreviewEntry(entry);
  });
  localPreview.gallery = [];

  if (!options.keepInput && refs.boothFileInput) {
    refs.boothFileInput.value = "";
  }
}

function clearAllLocalPreviews() {
  clearLocalPhotoPreview();
  clearLocalAudioPreview();
  clearLocalScenePreview("sceneTwoImage");
  clearLocalScenePreview("sceneThreeImage");
  clearLocalScenePreview("sceneFourImage");
  clearLocalBoothPreview();
}

function hasLocalPreviews() {
  return Boolean(
      localPreview.photo ||
      localPreview.audio ||
      localPreview.sceneTwoImage ||
      localPreview.sceneThreeImage ||
      localPreview.sceneFourImage ||
      localPreview.gallery.length
  );
}

function hasReceiverMediaPayload() {
  return Boolean(
    localPreview.photo ||
      localPreview.sceneTwoImage ||
      localPreview.sceneThreeImage ||
      localPreview.sceneFourImage ||
      localPreview.gallery.length ||
      sharedMedia.photo ||
      sharedMedia.sceneTwoImage ||
      sharedMedia.sceneThreeImage ||
      sharedMedia.sceneFourImage ||
      sharedMedia.gallery.length
  );
}

function hasLocalAudioPreview() {
  return Boolean(localPreview.audio);
}

function hasEmbeddedSharedMedia() {
  return Boolean(
      sharedMedia.photo ||
      sharedMedia.sceneTwoImage ||
      sharedMedia.sceneThreeImage ||
      sharedMedia.sceneFourImage ||
      sharedMedia.gallery.length
  );
}

function scheduleShareLinkSync(delayMs = 900) {
  if (!hasShareableState()) {
    return;
  }

  if (shareSyncTimer) {
    window.clearTimeout(shareSyncTimer);
  }

  shareSyncTimer = window.setTimeout(async () => {
    shareSyncTimer = 0;

    try {
      await buildShareLink();
    } catch {
      // Keep the editor usable even if background sync fails.
    }
  }, delayMs);
}

function hasShareableState() {
  return Boolean(
    hasReceiverMediaPayload() ||
      state.name !== defaults.name ||
      state.from !== defaults.from ||
      state.opening !== defaults.opening ||
      state.note !== defaults.note ||
      state.photoCaptionText !== defaults.photoCaptionText ||
      state.audio !== defaults.audio ||
      state.audioStart !== defaults.audioStart ||
      state.audioEnd !== defaults.audioEnd ||
      state.sceneTwoCaptionText !== defaults.sceneTwoCaptionText ||
      state.sceneThreeCaptionText !== defaults.sceneThreeCaptionText ||
      state.sceneFourCaptionText !== defaults.sceneFourCaptionText ||
      state.gallery !== defaults.gallery ||
      state.boothCaptions !== defaults.boothCaptions ||
      state.theme !== defaults.theme ||
      state.photo ||
      state.sceneTwoImage ||
      state.sceneThreeImage ||
      state.sceneFourImage
  );
}

function titleFromFileName(name) {
  const baseName = trim(name).replace(/\.[^.]+$/, "");
  if (!baseName) return "Chosen from your device";

  const cleaned = baseName.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  return cleaned ? cleaned[0].toUpperCase() + cleaned.slice(1) : "Chosen from your device";
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(reader.error || new Error("Could not read file."));
    reader.readAsDataURL(blob);
  });
}

function extensionFromMimeType(type, fallback = ".bin") {
  const normalized = trim(type).toLowerCase();
  if (normalized === "image/jpeg") return ".jpg";
  if (normalized === "image/png") return ".png";
  if (normalized === "image/webp") return ".webp";
  if (normalized === "image/gif") return ".gif";
  if (normalized === "image/avif") return ".avif";
  if (normalized === "image/svg+xml") return ".svg";
  return fallback;
}

async function dataUrlToFile(dataUrl, baseName) {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const extension = extensionFromMimeType(blob.type, ".jpg");
  return new File([blob], `${baseName}${extension}`, {
    type: blob.type || "application/octet-stream",
  });
}

async function uploadMediaFile(file) {
  const formData = new FormData();
  formData.append("file", file, file.name || "upload.bin");

  const response = await fetch("/api/media", {
    method: "POST",
    body: formData,
  });

  const payload = await response.json().catch(() => null);
  const url = trim(payload?.url || "");

  if (!response.ok || !isHttpUrl(url)) {
    throw new Error("Could not upload media for sharing.");
  }

  return url;
}

async function getUploadedPreviewUrl(entry, fallbackName) {
  if (!entry) return "";
  if (isHttpUrl(entry.remoteUrl)) return entry.remoteUrl;

  if (entry.file instanceof File) {
    entry.remoteUrl = await uploadMediaFile(entry.file);
    return entry.remoteUrl;
  }

  if (isDataUrl(entry.src)) {
    const file = await dataUrlToFile(entry.src, fallbackName);
    entry.remoteUrl = await uploadMediaFile(file);
    return entry.remoteUrl;
  }

  return "";
}

function buildGalleryState(entries) {
  return entries
    .map((entry) => {
      const url = trim(entry?.url);
      if (!isHttpUrl(url)) return "";
      const caption = trim(entry?.caption);
      return caption ? `${url} | ${caption}` : url;
    })
    .filter(Boolean)
    .slice(0, 6)
    .join("\n");
}

async function compressImageFileForShare(file, profile = "scene", tier = 0) {
  try {
    const bitmap = await createImageBitmap(file);
    const tiers = IMAGE_COMPRESSION_PROFILES[profile] || IMAGE_COMPRESSION_PROFILES.scene;
    const settings = tiers[Math.min(Math.max(tier, 0), tiers.length - 1)];
    const maxEdge = settings.maxEdge;
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");

    if (!context) {
      bitmap.close?.();
      return blobToDataUrl(file);
    }

    context.clearRect(0, 0, width, height);
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const webpBlob = await new Promise((resolve) => {
      canvas.toBlob(resolve, "image/webp", settings.webpQuality);
    });

    if (webpBlob) {
      return blobToDataUrl(webpBlob);
    }

    const jpegBlob = await new Promise((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", settings.jpegQuality);
    });

    if (jpegBlob) {
      return blobToDataUrl(jpegBlob);
    }

    return blobToDataUrl(file);
  } catch {
    return blobToDataUrl(file);
  }
}

function getPhotoSource() {
  return localPreview.photo?.url || state.photo || sharedMedia.photo;
}

function getAudioSource() {
  return localPreview.audio?.url || state.audio;
}

function getSceneImageSource(key) {
  return localPreview[key]?.url || state[key] || sharedMedia[key];
}

function getFrameCaptionText(key) {
  const captionMap = {
    photo: state.photoCaptionText,
    sceneTwoImage: state.sceneTwoCaptionText,
    sceneThreeImage: state.sceneThreeCaptionText,
    sceneFourImage: state.sceneFourCaptionText,
  };

  const value = trim(captionMap[key]);
  if (value) return value;

  if (key === "photo") {
    return "A favorite portrait makes the opening feel instantly personal.";
  }

  return sceneFrameMeta[key]?.fallback || "";
}

function getBoothCaptionText(index, fallback = "") {
  const caption = parseCaptionLines(state.boothCaptions, 6)[index];
  return caption || fallback || `Memory ${index + 1}`;
}

function syncBoothCaptionsWithState() {
  if (localPreview.gallery.length) {
    localPreview.gallery.forEach((entry, index) => {
      entry.caption = getBoothCaptionText(index);
    });
  }

  if (sharedMedia.gallery.length) {
    sharedMedia.gallery = sharedMedia.gallery.map((entry, index) => ({
      ...entry,
      caption: getBoothCaptionText(index, entry.caption),
    }));
  }
}

function syncAudioClipFieldsVisibility() {
  if (!refs.youtubeClipFields) return;
  const show = isYouTubeUrl(localPreview.audio ? "" : refs.audioInput?.value || state.audio);
  refs.youtubeClipFields.hidden = !show;
}

function stopYouTubePoll() {
  if (youtubeState.pollTimer) {
    window.clearInterval(youtubeState.pollTimer);
    youtubeState.pollTimer = 0;
  }
}

function resetYouTubeState() {
  stopYouTubePoll();
  youtubeState.source = "";
  youtubeState.videoId = "";
  youtubeState.ready = false;
  youtubeState.playing = false;
}

function ensureYouTubeApi() {
  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (youtubeApiPromise) {
    return youtubeApiPromise;
  }

  youtubeApiPromise = new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve(window.YT);
    };

    const checkInterval = window.setInterval(() => {
      if (window.YT?.Player) {
        window.clearInterval(checkInterval);
        resolve(window.YT);
      }
    }, 120);
  });

  return youtubeApiPromise;
}

function stopEmbeddedYouTube(resetToStart = false) {
  if (!youtubePlayer || !youtubeState.ready) {
    resetYouTubeState();
    return;
  }

  const { start } = getAudioClipRange();

  try {
    youtubePlayer.pauseVideo();
    if (resetToStart) {
      youtubePlayer.seekTo(start, true);
    }
  } catch {
    // Ignore player teardown issues.
  }

  youtubeState.playing = false;
  stopYouTubePoll();
}

function stopDirectMedia(resetToStart = false) {
  const { start } = getAudioClipRange();
  refs.audioPlayer.pause();
  if (resetToStart) {
    try {
      refs.audioPlayer.currentTime = start;
    } catch {
      // Ignore seek failures.
    }
  }
}

function clearDirectMediaSource() {
  stopDirectMedia(false);
  refs.audioPlayer.removeAttribute("src");
  refs.audioPlayer.load();
}

function clearYouTubePlayer() {
  if (youtubePlayer && typeof youtubePlayer.destroy === "function") {
    youtubePlayer.destroy();
  }

  youtubePlayer = null;
  if (refs.youtubePlayerMount) {
    refs.youtubePlayerMount.innerHTML = "";
  }
  resetYouTubeState();
}

function syncYouTubeEndWatcher() {
  stopYouTubePoll();
  const { start, end } = getAudioClipRange();
  if (!youtubePlayer || !youtubeState.ready || !end) return;

  youtubeState.pollTimer = window.setInterval(() => {
    try {
      const currentTime = youtubePlayer.getCurrentTime?.() ?? 0;
      if (currentTime >= end) {
        youtubePlayer.pauseVideo();
        youtubePlayer.seekTo(start, true);
        youtubeState.playing = false;
        updateAudioButton();
      }
    } catch {
      stopYouTubePoll();
    }
  }, 250);
}

async function loadYouTubeSource(source) {
  const videoId = extractYouTubeVideoId(source);
  if (!videoId || !refs.youtubePlayerMount) return;

  const { start, end } = getAudioClipRange();
  const playerVars = {
    autoplay: 0,
    controls: 0,
    rel: 0,
    modestbranding: 1,
    playsinline: 1,
    start,
  };

  if (Number.isFinite(end) && end !== null) {
    playerVars.end = end;
  }

  if (youtubePlayer && youtubeState.videoId === videoId && youtubeState.ready) {
    youtubeState.source = source;
    try {
      youtubePlayer.cueVideoById({ videoId, startSeconds: start, endSeconds: end || undefined });
    } catch {
      // Recreate below if cueing fails.
      clearYouTubePlayer();
    }
    syncYouTubeEndWatcher();
    updateAudioButton();
    return;
  }

  clearYouTubePlayer();
  const YT = await ensureYouTubeApi();

  await new Promise((resolve) => {
    youtubePlayer = new YT.Player(refs.youtubePlayerMount, {
      width: "1",
      height: "1",
      videoId,
      playerVars,
      events: {
        onReady: () => {
          youtubeState.ready = true;
          youtubeState.source = source;
          youtubeState.videoId = videoId;
          youtubeState.playing = false;
          syncYouTubeEndWatcher();
          updateAudioButton();
          resolve();
        },
        onStateChange: (event) => {
          youtubeState.playing = event.data === YT.PlayerState.PLAYING;
          if (event.data === YT.PlayerState.ENDED) {
            youtubeState.playing = false;
          }
          updateAudioButton();
        },
      },
    });
  });
}

function syncLayoutMetrics() {
  if (!refs.page) return;

  const pageRect = refs.page.getBoundingClientRect();
  const topOffset = Math.max(Math.round(pageRect.top), 0);
  const launcherVisible =
    refs.customizeLauncher &&
    window.getComputedStyle(refs.customizeLauncher).display !== "none";
  const launcherHeight = launcherVisible ? refs.customizeLauncher.offsetHeight + 20 : 0;
  const bottomOffset = Math.max(window.innerWidth <= 640 ? launcherHeight : 18, 18);

  document.documentElement.style.setProperty("--page-top-offset", `${topOffset}px`);
  document.documentElement.style.setProperty("--page-bottom-offset", `${bottomOffset}px`);
}

function getMediaFrameNode(imageNode) {
  return imageNode?.closest(".portrait-frame, .scene-frame, .feature-frame-media, .booth-card-media") || null;
}

function resetMediaFrame(imageNode) {
  const frame = getMediaFrameNode(imageNode);
  if (!frame) return;
  frame.style.removeProperty("--media-aspect");
  delete frame.dataset.mediaShape;
}

function updateMediaFrame(imageNode) {
  const frame = getMediaFrameNode(imageNode);
  if (!imageNode || !frame || !imageNode.naturalWidth || !imageNode.naturalHeight) return;

  const width = imageNode.naturalWidth;
  const height = imageNode.naturalHeight;
  const ratio = width / height;
  let aspectValue = `${width} / ${height}`;

  if (ratio > 1.18) {
    frame.dataset.mediaShape = "landscape";
    aspectValue = frame.classList.contains("feature-frame-media") ? "16 / 10" : "6 / 5";
  } else if (ratio < 0.85) {
    frame.dataset.mediaShape = "portrait";
    aspectValue = frame.classList.contains("feature-frame-media") ? "4 / 5" : "4 / 5";
  } else {
    frame.dataset.mediaShape = "square";
    aspectValue = "1 / 1";
  }

  frame.style.setProperty("--media-aspect", aspectValue);
}

function bindMediaFrame(imageNode) {
  if (!imageNode) return;

  if (!imageNode.dataset.mediaBound) {
    imageNode.addEventListener("load", () => {
      updateMediaFrame(imageNode);
      syncLayoutMetrics();
    });
    imageNode.dataset.mediaBound = "true";
  }

  if (imageNode.complete && imageNode.naturalWidth && imageNode.naturalHeight) {
    updateMediaFrame(imageNode);
  }
}

function syncFileStatuses() {
  if (refs.photoFileStatus) {
    refs.photoFileStatus.textContent = localPreview.photo
      ? `${localPreview.photo.name} is previewing now and will upload only when you copy the short share link.`
      : "This image previews here first and uploads only when you copy the short share link.";
    refs.photoFileStatus.classList.toggle("is-active", Boolean(localPreview.photo));
  }

  if (refs.audioFileStatus) {
    refs.audioFileStatus.textContent = localPreview.audio
      ? `${localPreview.audio.name} is previewing on this device. Deploy to make the soundtrack available on the live page too.`
      : "Local audio or video previews here first. Deploy to make it available on the live site.";
    refs.audioFileStatus.classList.toggle("is-active", Boolean(localPreview.audio));
  }

  [
    ["sceneTwoImage", refs.sceneTwoFileStatus, "Page 3 previews here first and uploads when you copy the short share link."],
    ["sceneThreeImage", refs.sceneThreeFileStatus, "Page 4 previews here first and uploads when you copy the short share link."],
    ["sceneFourImage", refs.sceneFourFileStatus, "Page 5 previews here first and uploads when you copy the short share link."],
  ].forEach(([key, statusNode, idleMessage]) => {
    if (!statusNode) return;
    const preview = localPreview[key];
    statusNode.textContent = preview
      ? `${preview.name} is previewing now and will upload when you copy the short share link for that page.`
      : idleMessage;
    statusNode.classList.toggle("is-active", Boolean(preview));
  });

  if (refs.boothFileStatus) {
    const count = localPreview.gallery.length;
    refs.boothFileStatus.textContent = count
      ? `${count} old memory photo${count > 1 ? "s are" : " is"} previewing now. Add captions below, one line per memory, before you copy the short share link.`
      : "The photo booth previews here and uploads only when you copy the short share link.";
    refs.boothFileStatus.classList.toggle("is-active", Boolean(count));
  }
}

async function persistEmbeddedImage(key, file) {
  const dataUrl = await compressImageFileForShare(file, key === "photo" ? "cover" : "scene", 0);
  sharedMedia[key] = dataUrl;
  if (key === "photo" && isDataUrl(state.photo)) {
    state.photo = "";
  }
  if (key !== "photo" && isDataUrl(state[key])) {
    state[key] = "";
  }

  refreshUI();
}

async function persistEmbeddedGallery(files) {
  const embeds = await Promise.all(
    files.slice(0, 6).map(async (file, index) => ({
      src: await compressImageFileForShare(file, "booth", 0),
      caption: getBoothCaptionText(index),
    }))
  );

  sharedMedia.gallery = embeds.filter((entry) => isDataUrl(entry.src));
  refreshUI();
}

async function loadPublishedDefaults() {
  try {
    const response = await fetch("story-data.json", { cache: "no-store" });
    if (!response.ok) return;
    const raw = await response.json();
    defaults = normalizeState({ ...defaults, ...raw }, defaults);
  } catch {
    // Ignore missing published defaults.
  }
}

function getTextByteLength(text) {
  return new TextEncoder().encode(text).length;
}

function extractShareIdFromRemoteUrl(value) {
  const cleaned = trim(value).replace(/\/+$/, "");
  if (!cleaned) return "";

  try {
    const url = new URL(cleaned);
    if (url.hostname !== "paste.myst.rs" && url.hostname !== "paste.rs") return "";
    return url.pathname.split("/").filter(Boolean).pop() || "";
  } catch {
    return cleaned.replace(/^https?:\/\//i, "").split("/").filter(Boolean).pop() || "";
  }
}

async function createRemoteShare(text) {
  const response = await fetch(REMOTE_SHARE_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code: text }),
  });

  const payload = await response.json().catch(() => null);
  const shareId = trim(payload?.id || "");

  if (!response.ok || !shareId) {
    throw new Error("Could not create a short share link right now.");
  }

  activeShareId = shareId;
  activeShareHash = "";
  shareNeedsSync = false;
  updateUrl();
  pulseCopyButtons("Receiver link ready");
  return `${location.origin}${location.pathname}?${REMOTE_SHARE_PARAM}=${encodeURIComponent(shareId)}`;
}

async function readRemoteSharePayload(shareId) {
  const response = await fetch(`${REMOTE_SHARE_ENDPOINT}/${encodeURIComponent(shareId)}`, {
    method: "GET",
    headers: {
      Accept: "text/plain, application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Could not load this shared page.");
  }

  const code = trim(await response.text());
  if (!code) {
    throw new Error("This shared page is missing its content.");
  }

  if (code.startsWith("giftz=") || code.startsWith("gift=")) {
    const decoded = await decodeSharePayload(code);
    if (!decoded || typeof decoded !== "object") {
      throw new Error("This shared page is missing its content.");
    }
    return decoded;
  }

  return JSON.parse(code);
}

function encodeBase64UrlFromBytes(bytes) {
  let binary = "";
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const slice = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...slice);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64UrlToBytes(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4 || 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function getFflate() {
  return window.fflate && typeof window.fflate.gzipSync === "function" ? window.fflate : null;
}

async function encodeSharePayload(payload) {
  const text = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(text);

  if ("CompressionStream" in window) {
    const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream("gzip"));
    const compressed = new Uint8Array(await new Response(stream).arrayBuffer());
    return `giftz=${encodeBase64UrlFromBytes(compressed)}`;
  }

  const fflate = getFflate();
  if (fflate) {
    const compressed = fflate.gzipSync(bytes, { level: 9 });
    return `giftz=${encodeBase64UrlFromBytes(compressed)}`;
  }

  return `gift=${encodeBase64UrlFromBytes(bytes)}`;
}

async function decodeSharePayload(hashValue) {
  if (!hashValue) return null;

  if (hashValue.startsWith("giftz=")) {
    const bytes = decodeBase64UrlToBytes(hashValue.slice(6));

    if ("DecompressionStream" in window) {
      try {
        const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
        const text = await new Response(stream).text();
        return JSON.parse(text);
      } catch {
        // Fall through to the fflate fallback below.
      }
    }

    const fflate = getFflate();
    if (fflate && typeof fflate.gunzipSync === "function") {
      const uncompressed = fflate.gunzipSync(bytes);
      const text = new TextDecoder().decode(uncompressed);
      return JSON.parse(text);
    }
  }

  if (hashValue.startsWith("gift=")) {
    const bytes = decodeBase64UrlToBytes(hashValue.slice(5));
    const text = new TextDecoder().decode(bytes);
    return JSON.parse(text);
  }

  return null;
}

function normalizeSharedMedia(rawEmbeds) {
  const embeds = rawEmbeds && typeof rawEmbeds === "object" ? rawEmbeds : {};
  return {
    photo: isDataUrl(embeds.photo) ? trim(embeds.photo) : "",
    sceneTwoImage: isDataUrl(embeds.sceneTwoImage) ? trim(embeds.sceneTwoImage) : "",
    sceneThreeImage: isDataUrl(embeds.sceneThreeImage) ? trim(embeds.sceneThreeImage) : "",
    sceneFourImage: isDataUrl(embeds.sceneFourImage) ? trim(embeds.sceneFourImage) : "",
    gallery: Array.isArray(embeds.gallery)
      ? embeds.gallery
          .map((entry, index) => ({
            src: isDataUrl(entry?.src) ? trim(entry.src) : "",
            caption: trim(entry?.caption) || `Memory ${index + 1}`,
          }))
          .filter((entry) => entry.src)
          .slice(0, 6)
      : [],
  };
}

async function readHashState() {
  const hashValue = location.hash.replace(/^#/, "");
  if (!hashValue) return {};

  try {
    const payload = await decodeSharePayload(hashValue);
    if (!payload || typeof payload !== "object") return {};
    activeShareHash = hashValue;
    Object.assign(sharedMedia, normalizeSharedMedia(payload.embeds));
    return payload;
  } catch {
    return {};
  }
}

async function readRemoteShareState() {
  const params = new URLSearchParams(location.search);
  const shareId = extractShareIdFromRemoteUrl(trim(params.get(REMOTE_SHARE_PARAM)));
  if (!shareId) return {};

  try {
    const payload = await readRemoteSharePayload(shareId);
    if (!payload || typeof payload !== "object") return {};

    activeShareId = shareId;
    activeShareHash = "";
    shareNeedsSync = false;
    Object.assign(sharedMedia, normalizeSharedMedia(payload.embeds));
    return payload;
  } catch {
    return {};
  }
}

function readUrlState() {
  const params = new URLSearchParams(location.search);
  return {
    name: params.get("name") || "",
    from: params.get("from") || "",
    opening: params.get("opening") || "",
    note: params.get("note") || "",
    photo: params.get("photo") || "",
    audio: params.get("audio") || "",
    audioStart: params.get("audioStart") || "",
    audioEnd: params.get("audioEnd") || "",
    photoCaptionText: params.get("photoCaptionText") || "",
    sceneTwoImage: params.get("sceneTwoImage") || "",
    sceneTwoCaptionText: params.get("sceneTwoCaptionText") || "",
    sceneThreeImage: params.get("sceneThreeImage") || "",
    sceneThreeCaptionText: params.get("sceneThreeCaptionText") || "",
    sceneFourImage: params.get("sceneFourImage") || "",
    sceneFourCaptionText: params.get("sceneFourCaptionText") || "",
    gallery: params.get("gallery") || "",
    boothCaptions: params.get("boothCaptions") || "",
    theme: params.get("theme") || "",
  };
}

function readStorageState() {
  try {
    return JSON.parse(localStorage.getItem("birthday-page-state") || "{}");
  } catch {
    return {};
  }
}

function hydrateState(hashState = {}) {
  return normalizeState(
    {
      ...defaults,
      ...readStorageState(),
      ...readUrlState(),
      ...hashState,
    },
    defaults
  );
}

function saveState() {
  try {
    localStorage.setItem("birthday-page-state", JSON.stringify(state));
  } catch {
    // Ignore storage failures.
  }
}

function updateUrl() {
  if (activeShareId && (shareNeedsSync || hasShareableState())) {
    const nextUrl = `${location.pathname}?${REMOTE_SHARE_PARAM}=${encodeURIComponent(activeShareId)}`;
    history.replaceState({}, "", nextUrl);
    return;
  }

  if (hasReceiverMediaPayload()) {
    history.replaceState({}, "", location.pathname);
    return;
  }

  const params = new URLSearchParams();
  if (state.name !== defaults.name) params.set("name", state.name);
  if (state.from !== defaults.from) params.set("from", state.from);
  if (state.opening !== defaults.opening) params.set("opening", state.opening);
  if (state.note !== defaults.note) params.set("note", state.note);
  if (isQuerySafeImageSource(state.photo) && state.photo !== defaults.photo) {
    params.set("photo", state.photo);
  }
  if (isShareableAudioSource(state.audio) && state.audio !== defaults.audio) {
    params.set("audio", state.audio);
  }
  if (state.audioStart !== defaults.audioStart) params.set("audioStart", state.audioStart);
  if (state.audioEnd !== defaults.audioEnd) params.set("audioEnd", state.audioEnd);
  if (state.photoCaptionText !== defaults.photoCaptionText) {
    params.set("photoCaptionText", state.photoCaptionText);
  }
  if (isQuerySafeImageSource(state.sceneTwoImage) && state.sceneTwoImage !== defaults.sceneTwoImage) {
    params.set("sceneTwoImage", state.sceneTwoImage);
  }
  if (state.sceneTwoCaptionText !== defaults.sceneTwoCaptionText) {
    params.set("sceneTwoCaptionText", state.sceneTwoCaptionText);
  }
  if (isQuerySafeImageSource(state.sceneThreeImage) && state.sceneThreeImage !== defaults.sceneThreeImage) {
    params.set("sceneThreeImage", state.sceneThreeImage);
  }
  if (state.sceneThreeCaptionText !== defaults.sceneThreeCaptionText) {
    params.set("sceneThreeCaptionText", state.sceneThreeCaptionText);
  }
  if (isQuerySafeImageSource(state.sceneFourImage) && state.sceneFourImage !== defaults.sceneFourImage) {
    params.set("sceneFourImage", state.sceneFourImage);
  }
  if (state.sceneFourCaptionText !== defaults.sceneFourCaptionText) {
    params.set("sceneFourCaptionText", state.sceneFourCaptionText);
  }
  if (state.gallery && state.gallery !== defaults.gallery) {
    params.set("gallery", state.gallery);
  }
  if (state.boothCaptions && state.boothCaptions !== defaults.boothCaptions) {
    params.set("boothCaptions", state.boothCaptions);
  }
  if (state.theme !== defaults.theme) params.set("theme", state.theme);

  const nextUrl = `${location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
  history.replaceState({}, "", nextUrl);
}

function initials(name) {
  const parts = trim(name).split(/\s+/).filter(Boolean);
  if (!parts.length) return "B";

  return parts
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function buildLetterLines() {
  return [
    `Happy birthday, ${state.name}. Some people arrive loudly, but you somehow became important in the gentlest way.`,
    "You make ordinary conversations feel softer, longer, and a little more worth remembering than they should.",
    "If friendship can have a glow to it, yours does. Quiet, steady, and the kind people feel safe standing near.",
    state.note,
    "So this little page is just one honest thing: a small reminder that you are thought of with warmth, admiration, and more care than I probably say out loud.",
    "Stay bright. Stay kind. Stay exactly this rare.",
  ];
}

function setTheme(theme) {
  state.theme = normalizeTheme(theme);
  body.dataset.theme = state.theme;

  if (refs.themeColorMeta) {
    refs.themeColorMeta.setAttribute("content", themes[state.theme].themeColor);
  }

  refs.themeButtons.forEach((button) => {
    const active = button.dataset.themeChoice === state.theme;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function renderHero() {
  refs.nameSlots.forEach((slot) => {
    slot.textContent = state.name;
  });

  refs.fromSlots.forEach((slot) => {
    slot.textContent = state.from;
  });

  refs.openingSlots.forEach((slot) => {
    slot.textContent = state.opening;
  });

  if (refs.titleNode) {
    refs.titleNode.textContent = `For Youu 🎀 | Happy Birthday, ${state.name}`;
  }
}

function renderPhoto() {
  const photoSource = getPhotoSource();
  const hasPhoto = Boolean(photoSource);

  if (hasPhoto) {
    refs.photoImage.src = photoSource;
    refs.photoImage.hidden = false;
    refs.photoPlaceholder.hidden = true;
    bindMediaFrame(refs.photoImage);
    refs.photoCaption.textContent = getFrameCaptionText("photo");
  } else {
    refs.photoImage.removeAttribute("src");
    refs.photoImage.hidden = true;
    refs.photoPlaceholder.hidden = false;
    resetMediaFrame(refs.photoImage);
    refs.photoCaption.textContent = getFrameCaptionText("photo") || "A good photo turns the opening into a keepsake.";
  }

  refs.monogram.textContent = initials(state.name);
}

function renderNoticing() {
  refs.noticingGrid.innerHTML = noticing
    .map(
      (item, index) => `
        <article class="noticing-card reveal-item" style="transition-delay: ${index * 60}ms">
          <p class="noticing-index">0${index + 1}</p>
          <h3 class="noticing-title">${escapeHTML(item.title)}</h3>
          <p class="noticing-body">${escapeHTML(item.body)}</p>
        </article>
      `
    )
    .join("");
}

function renderMemories() {
  refs.memoryGrid.innerHTML = moments
    .map(
      (moment, index) => `
        <article class="memory-card reveal-item" style="transition-delay: ${index * 80}ms">
          <p class="memory-index">0${index + 1}</p>
          <h3 class="memory-title">${escapeHTML(moment.title)}</h3>
          <p class="memory-body">${escapeHTML(moment.body)}</p>
        </article>
      `
    )
    .join("");
}

function renderSceneFrame(key) {
  const imageNode = refs[key];
  const placeholderNode = refs[`${key.replace("Image", "")}Placeholder`];
  const captionNode = refs[`${key.replace("Image", "")}Caption`];
  const source = getSceneImageSource(key);
  const preview = localPreview[key];
  const meta = sceneFrameMeta[key];

  if (!imageNode || !placeholderNode || !captionNode || !meta) return;

  if (source) {
    imageNode.src = source;
    imageNode.hidden = false;
    placeholderNode.hidden = true;
    bindMediaFrame(imageNode);
    captionNode.textContent = getFrameCaptionText(key);
  } else {
    imageNode.removeAttribute("src");
    imageNode.hidden = true;
    placeholderNode.hidden = false;
    resetMediaFrame(imageNode);
    captionNode.textContent = getFrameCaptionText(key);
  }
}

function renderSceneFrames() {
  renderSceneFrame("sceneTwoImage");
  renderSceneFrame("sceneThreeImage");
  renderSceneFrame("sceneFourImage");
}

function setComplimentImmediate(text) {
  refs.complimentTextCurrent.textContent = text;
  refs.complimentTextCurrent.className = "compliment-text is-active";
  refs.complimentTextNext.textContent = "";
  refs.complimentTextNext.className = "compliment-text";
}

function renderCompliment(initial = false) {
  const compliment = compliments[complimentState.index % compliments.length];

  if (initial || prefersReducedMotion) {
    complimentState.busy = false;
    setComplimentImmediate(compliment);
    return;
  }

  if (complimentState.busy) return;
  complimentState.busy = true;
  refs.complimentTextNext.textContent = compliment;
  refs.complimentTextCurrent.className = "compliment-text is-leaving";
  refs.complimentTextNext.className = "compliment-text is-entering";

  window.setTimeout(() => {
    refs.complimentTextCurrent.textContent = compliment;
    refs.complimentTextCurrent.className = "compliment-text is-active";
    refs.complimentTextNext.textContent = "";
    refs.complimentTextNext.className = "compliment-text";
    complimentState.busy = false;
  }, 380);
}

function renderLetter() {
  refs.letterLines.innerHTML = "";
  buildLetterLines().forEach((line) => {
    const node = document.createElement("p");
    node.className = "line";
    node.textContent = line;
    refs.letterLines.appendChild(node);
  });
}

function getBoothEntries() {
  const urlEntries = parseGalleryEntries(state.gallery);
  const localEntries = localPreview.gallery.length
    ? localPreview.gallery.map((entry, index) => ({
        src: entry.url,
        caption: entry.caption || getBoothCaptionText(index),
        mode: "local",
      }))
    : sharedMedia.gallery.map((entry, index) => ({
        src: entry.src,
        caption: entry.caption || getBoothCaptionText(index),
        mode: "shared",
      }));

  if (localEntries.length) {
    return localEntries.slice(0, 6);
  }

  return urlEntries
    .map((entry) => ({
      src: entry.url,
      caption: entry.caption,
      mode: "url",
    }))
    .slice(0, 6);
}

function renderBooth() {
  if (!refs.boothGrid || !refs.boothHint) return;

  syncBoothCaptionsWithState();
  const entries = getBoothEntries();

  if (!entries.length) {
    refs.boothGrid.innerHTML = boothPlaceholders
      .map(
        (item) => `
          <article class="booth-card placeholder reveal-item">
            <p class="booth-title">${escapeHTML(item.title)}</p>
            <p class="booth-caption">${escapeHTML(item.body)}</p>
          </article>
        `
      )
      .join("");
    refs.boothHint.textContent =
      "Add a few old photos in the personalize panel to turn this into a little memory booth.";
    return;
  }

  refs.boothGrid.innerHTML = entries
    .map(
      (entry, index) => `
        <article class="booth-card reveal-item">
          <div class="booth-card-media">
            <img
              class="booth-image"
              src="${escapeHTML(entry.src)}"
              alt="${escapeHTML(entry.caption)}"
              data-booth-index="${index}"
            />
            <span class="booth-stamp">Memory ${index + 1}</span>
          </div>
          <div class="booth-copy">
            <p class="booth-title">${escapeHTML(entry.caption)}</p>
            <p class="booth-caption">
              ${entry.mode === "url"
                ? "Chosen from a public link so it opens cleanly for both you and her."
                : "Attached from your device and packed into the short share link for the surprise."}
            </p>
          </div>
        </article>
      `
    )
    .join("");

  refs.boothHint.textContent =
    "Old photos land best here. They make the ending feel more personal, more nostalgic, and a little unexpected.";

  refs.boothGrid.querySelectorAll(".booth-image").forEach((imageNode) => {
    bindMediaFrame(imageNode);
    imageNode.addEventListener(
      "error",
      () => {
        const card = imageNode.closest(".booth-card");
        if (!card) return;
        card.classList.add("placeholder");
        resetMediaFrame(imageNode);
        card.replaceChildren();
        card.insertAdjacentHTML(
          "afterbegin",
          `
            <p class="booth-title">That memory could not load.</p>
            <p class="booth-caption">Try another photo so this photo booth still feels complete.</p>
          `
        );
      },
      { once: true }
    );
  });
}

function renderFinale() {
  refs.finaleLead.textContent = `I hope this year meets ${state.name} with the same warmth ${state.name} gives so easily to everyone around them.`;
  refs.finaleMessage.classList.remove("visible");
}

function updateAudioButton() {
  if (!getAudioSource()) {
    youtubeState.playing = false;
    refs.audioToggle.hidden = true;
    refs.audioToggle.textContent = "Play soundtrack";
    refs.audioToggle.setAttribute("aria-pressed", "false");
    return;
  }

  refs.audioToggle.hidden = false;
  const playing = isYouTubeUrl(getAudioSource()) ? youtubeState.playing : !refs.audioPlayer.paused;
  refs.audioToggle.textContent = playing ? "Pause soundtrack" : "Play soundtrack";
  refs.audioToggle.setAttribute("aria-pressed", String(playing));
}

function syncDirectMediaClipWindow() {
  if (isYouTubeUrl(getAudioSource()) || refs.audioPlayer.readyState < 1) return;

  const { start, end } = getAudioClipRange();
  const currentTime = refs.audioPlayer.currentTime || 0;

  if (currentTime < start || (end && currentTime >= end)) {
    try {
      refs.audioPlayer.currentTime = start;
    } catch {
      // Ignore seek failures.
    }
  }
}

async function renderAudio() {
  const mediaSource = getAudioSource();
  syncAudioClipFieldsVisibility();

  if (!mediaSource) {
    stopEmbeddedYouTube(false);
    clearYouTubePlayer();
    clearDirectMediaSource();
    updateAudioButton();
    return;
  }

  if (isYouTubeUrl(mediaSource)) {
    clearDirectMediaSource();
    await loadYouTubeSource(mediaSource);
    updateAudioButton();
    return;
  }

  stopEmbeddedYouTube(false);
  clearYouTubePlayer();

  if (refs.audioPlayer.getAttribute("src") !== mediaSource) {
    stopDirectMedia(false);
    refs.audioPlayer.setAttribute("src", mediaSource);
    refs.audioPlayer.load();
  }

  syncDirectMediaClipWindow();
  updateAudioButton();
}

function syncInputs() {
  refs.nameInput.value = state.name;
  refs.fromInput.value = state.from;
  refs.openingInput.value = state.opening;
  refs.photoInput.value = state.photo;
  refs.photoCaptionInput.value = state.photoCaptionText;
  refs.audioInput.value = state.audio;
  refs.audioStartInput.value = state.audioStart;
  refs.audioEndInput.value = state.audioEnd;
  refs.sceneTwoInput.value = state.sceneTwoImage;
  refs.sceneTwoCaptionInput.value = state.sceneTwoCaptionText;
  refs.sceneThreeInput.value = state.sceneThreeImage;
  refs.sceneThreeCaptionInput.value = state.sceneThreeCaptionText;
  refs.sceneFourInput.value = state.sceneFourImage;
  refs.sceneFourCaptionInput.value = state.sceneFourCaptionText;
  refs.boothInput.value = state.gallery;
  refs.boothCaptionsInput.value = state.boothCaptions;
  refs.noteInput.value = state.note;
  syncAudioClipFieldsVisibility();
  syncFileStatuses();
}

function renderStoryDots() {
  refs.storyDots.innerHTML = refs.storyPages
    .map(
      (page, index) => `
        <button
          class="story-dot${index === storyState.index ? " active" : ""}"
          type="button"
          data-story-index="${index}"
          aria-label="Go to ${escapeHTML(page.id)}"
        ></button>
      `
    )
    .join("");

  refs.storyDots.querySelectorAll("[data-story-index]").forEach((dot) => {
    dot.addEventListener("click", () => {
      goToStoryPage(Number(dot.dataset.storyIndex));
    });
  });
}

function revealStoryPage(page) {
  const items = Array.from(page.querySelectorAll(".reveal-item, .line"));
  items.forEach((item, index) => {
    window.setTimeout(
      () => {
        item.classList.add("visible");
      },
      prefersReducedMotion ? 0 : index * 70
    );
  });
}

function resetStoryPage(page) {
  page.scrollTop = 0;
  page.querySelectorAll(".reveal-item, .line").forEach((item) => {
    item.classList.remove("visible");
  });
}

function syncStoryControls() {
  refs.storyCounter.textContent = `${storyState.index + 1} / ${refs.storyPages.length}`;
  refs.prevStory.disabled = storyState.index === 0;
  refs.nextStory.disabled = storyState.index === refs.storyPages.length - 1;

  refs.storyDots.querySelectorAll("[data-story-index]").forEach((dot, index) => {
    dot.classList.toggle("active", index === storyState.index);
  });

  refs.navLinks.forEach((link) => {
    const active = link.getAttribute("href") === `#${refs.storyPages[storyState.index].id}`;
    if (active) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function findPageIndex(selector) {
  return refs.storyPages.findIndex((page) => `#${page.id}` === selector);
}

function goToStoryPage(index) {
  const clamped = Math.max(0, Math.min(index, refs.storyPages.length - 1));
  storyState.index = clamped;

  refs.storyPages.forEach((page, pageIndex) => {
    const active = pageIndex === clamped;
    page.classList.toggle("active", active);
    if (active) {
      page.scrollTop = 0;
      revealStoryPage(page);
    } else {
      resetStoryPage(page);
    }
  });

  syncStoryControls();
}

function goToStorySelector(selector) {
  const nextIndex = findPageIndex(selector);
  if (nextIndex >= 0) {
    goToStoryPage(nextIndex);
  }
}

function refreshUI() {
  setTheme(state.theme);
  renderHero();
  renderPhoto();
  renderNoticing();
  renderMemories();
  renderSceneFrames();
  renderCompliment(true);
  renderLetter();
  renderBooth();
  renderFinale();
  void renderAudio();
  syncInputs();
  renderStoryDots();
  syncLayoutMetrics();
  saveState();
  updateUrl();
  goToStoryPage(Math.min(storyState.index, refs.storyPages.length - 1));
}

function applyInputState() {
  invalidateShareHash();
  state.name = trim(refs.nameInput.value) || defaults.name;
  state.from = trim(refs.fromInput.value) || defaults.from;
  state.opening = trim(refs.openingInput.value) || defaults.opening;
  state.note = trim(refs.noteInput.value) || defaults.note;
  state.photo = isImageSource(refs.photoInput.value) ? trim(refs.photoInput.value) : "";
  state.photoCaptionText = normalizeSingleLineText(refs.photoCaptionInput.value, "", 160);
  state.audio = isAudioSource(refs.audioInput.value) ? trim(refs.audioInput.value) : "";
  state.audioStart = normalizeSingleLineText(refs.audioStartInput.value, "", 20);
  state.audioEnd = normalizeSingleLineText(refs.audioEndInput.value, "", 20);
  state.sceneTwoImage = isImageSource(refs.sceneTwoInput.value) ? trim(refs.sceneTwoInput.value) : "";
  state.sceneTwoCaptionText = normalizeSingleLineText(refs.sceneTwoCaptionInput.value, "", 160);
  state.sceneThreeImage = isImageSource(refs.sceneThreeInput.value) ? trim(refs.sceneThreeInput.value) : "";
  state.sceneThreeCaptionText = normalizeSingleLineText(refs.sceneThreeCaptionInput.value, "", 160);
  state.sceneFourImage = isImageSource(refs.sceneFourInput.value) ? trim(refs.sceneFourInput.value) : "";
  state.sceneFourCaptionText = normalizeSingleLineText(refs.sceneFourCaptionInput.value, "", 160);
  state.gallery = normalizeGalleryText(refs.boothInput.value);
  state.boothCaptions = normalizeCaptionLines(refs.boothCaptionsInput.value, 6);
  syncBoothCaptionsWithState();
  refreshUI();

  scheduleShareLinkSync(1200);
}

function applyPhotoFileSelection() {
  const file = refs.photoFileInput?.files?.[0];
  clearLocalPhotoPreview({ keepInput: true });
  clearSharedMedia("photo");
  invalidateShareHash();

  if (!file) {
    state.photo = "";
    refreshUI();
    return;
  }

  localPreview.photo = {
    url: URL.createObjectURL(file),
    name: file.name,
    file,
  };
  refs.photoInput.value = "";
  state.photo = "";
  refreshUI();
  void persistEmbeddedImage("photo", file);
  scheduleShareLinkSync(500);
}

function applyAudioFileSelection() {
  const file = refs.audioFileInput?.files?.[0];
  clearLocalAudioPreview({ keepInput: true });
  invalidateShareHash();

  if (!file) {
    syncFileStatuses();
    void renderAudio();
    return;
  }

  localPreview.audio = {
    url: URL.createObjectURL(file),
    name: file.name,
    file,
  };
  refs.audioInput.value = "";
  refs.audioStartInput.value = "";
  refs.audioEndInput.value = "";
  state.audio = "";
  state.audioStart = "";
  state.audioEnd = "";
  refreshUI();
}

function applySceneFileSelection(key) {
  const refMap = {
    sceneTwoImage: refs.sceneTwoFileInput,
    sceneThreeImage: refs.sceneThreeFileInput,
    sceneFourImage: refs.sceneFourFileInput,
  };

  const file = refMap[key]?.files?.[0];
  clearLocalScenePreview(key, { keepInput: true });
  clearSharedMedia(key);
  invalidateShareHash();

  if (!file) {
    state[key] = "";
    refreshUI();
    return;
  }

  localPreview[key] = {
    url: URL.createObjectURL(file),
    name: file.name,
    caption: titleFromFileName(file.name),
    file,
  };
  const inputMap = {
    sceneTwoImage: refs.sceneTwoInput,
    sceneThreeImage: refs.sceneThreeInput,
    sceneFourImage: refs.sceneFourInput,
  };
  if (inputMap[key]) {
    inputMap[key].value = "";
  }
  state[key] = "";
  refreshUI();
  void persistEmbeddedImage(key, file);
  scheduleShareLinkSync(500);
}

function applyBoothFilesSelection() {
  const files = Array.from(refs.boothFileInput?.files || []).slice(0, 6);
  clearLocalBoothPreview({ keepInput: true });
  clearSharedMedia("gallery");
  invalidateShareHash();

  if (!files.length) {
    refreshUI();
    return;
  }

  localPreview.gallery = files.map((file, index) => ({
    url: URL.createObjectURL(file),
    name: file.name,
    caption: getBoothCaptionText(index),
    file,
  }));
  refreshUI();
  void persistEmbeddedGallery(files);
  scheduleShareLinkSync(500);
}

function openPanel() {
  refs.customizePanel.classList.add("open");
  refs.customizePanel.setAttribute("aria-hidden", "false");
  refs.customizeToggle.setAttribute("aria-expanded", "true");
  refs.openCustomizer.setAttribute("aria-expanded", "true");
  body.classList.add("panel-open");
  syncLayoutMetrics();
}

function closePanel() {
  refs.customizePanel.classList.remove("open");
  refs.customizePanel.setAttribute("aria-hidden", "true");
  refs.customizeToggle.setAttribute("aria-expanded", "false");
  refs.openCustomizer.setAttribute("aria-expanded", "false");
  body.classList.remove("panel-open");
  syncLayoutMetrics();
}

function burstAtButton(button, mode = "confetti") {
  const layer = refs.confettiLayer;
  const rect = button?.getBoundingClientRect() || {
    left: window.innerWidth / 2,
    top: window.innerHeight / 2,
    width: 0,
    height: 0,
  };

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const colors =
    mode === "sparkle"
      ? ["#f1ce8d", "#d6aa63", "#ffffff", "#d79090"]
      : ["#d79090", "#f1ce8d", "#ffffff", "#b78742"];
  const count = mode === "sparkle" ? 18 : mode === "grand" ? 54 : 30;

  for (let index = 0; index < count; index += 1) {
    const piece = document.createElement("span");
    const angle = (index / count) * Math.PI * 2;
    const distance = mode === "grand" ? 120 + Math.random() * 220 : 80 + Math.random() * 140;
    const width = mode === "sparkle" ? 7 + Math.random() * 5 : 10 + Math.random() * 8;
    const height = mode === "sparkle" ? 7 + Math.random() * 5 : 12 + Math.random() * 10;

    piece.className = "confetti-piece";
    piece.style.setProperty("--x", `${centerX}px`);
    piece.style.setProperty("--y", `${centerY}px`);
    piece.style.setProperty("--tx", `${Math.cos(angle) * distance}px`);
    piece.style.setProperty("--ty", `${Math.sin(angle) * distance - 40 - Math.random() * 140}px`);
    piece.style.setProperty("--rot", `${Math.random() * 720 - 360}deg`);
    piece.style.setProperty("--duration", `${700 + Math.random() * 700}ms`);
    piece.style.setProperty("--delay", `${Math.random() * 80}ms`);
    piece.style.setProperty("--w", `${width}px`);
    piece.style.setProperty("--h", `${height}px`);
    piece.style.setProperty("--r", Math.random() > 0.5 ? "999px" : "4px");
    piece.style.setProperty("--c", colors[index % colors.length]);
    layer.appendChild(piece);

    window.setTimeout(() => piece.remove(), 1800);
  }
}

function createFloatingSymbols() {
  const symbols = [10022, 10023, 9825, 10034, 8727, 8226];
  const count = prefersReducedMotion ? 0 : window.innerWidth < 720 ? 12 : 18;
  refs.floatLayer.innerHTML = "";

  for (let index = 0; index < count; index += 1) {
    const node = document.createElement("span");
    const size = index % 5 === 0 ? 1.28 : index % 3 === 0 ? 1.06 : 0.88;
    node.className = "float-symbol";
    node.textContent = String.fromCodePoint(symbols[index % symbols.length]);
    node.style.left = `${Math.random() * 100}%`;
    node.style.top = `${85 + Math.random() * 20}%`;
    node.style.fontSize = `${size}rem`;
    node.style.animationDuration = `${16 + Math.random() * 12}s`;
    node.style.animationDelay = `${Math.random() * 9}s`;
    node.style.setProperty("--dx", `${(Math.random() * 220 - 110).toFixed(1)}px`);
    refs.floatLayer.appendChild(node);
  }
}

function pulseCopyButtons(label) {
  [refs.copyLink, refs.copyLinkSecondary].forEach((button) => {
    if (!button) return;
    const original = button.textContent;
    button.textContent = label;
    window.setTimeout(() => {
      button.textContent = original;
    }, 1200);
  });
}

function setCopyButtonsTemporary(label, timeoutMs = 0) {
  [refs.copyLink, refs.copyLinkSecondary].forEach((button) => {
    if (!button) return;
    const original = button.dataset.originalLabel || button.textContent || "";
    button.dataset.originalLabel = original;
    button.textContent = label;

    if (timeoutMs > 0) {
      window.setTimeout(() => {
        button.textContent = original;
      }, timeoutMs);
    }
  });
}

function getShareableStateValue(key) {
  const value = trim(state[key]);
  return isQuerySafeImageSource(value) ? value : "";
}

function getCompressionAttempts() {
  return [
    { cover: 0, scene: 0, booth: 0 },
    { cover: 0, scene: 0, booth: 1 },
    { cover: 0, scene: 0, booth: 2 },
    { cover: 0, scene: 1, booth: 1 },
    { cover: 0, scene: 1, booth: 2 },
    { cover: 0, scene: 1, booth: 3 },
    { cover: 1, scene: 1, booth: 2 },
    { cover: 1, scene: 1, booth: 3 },
    { cover: 1, scene: 2, booth: 3 },
    { cover: 1, scene: 2, booth: 4 },
    { cover: 2, scene: 2, booth: 4 },
    { cover: 2, scene: 3, booth: 4 },
    { cover: 3, scene: 3, booth: 4 },
    { cover: 4, scene: 4, booth: 4 },
  ];
}

async function buildSharePayloadText(compressionPlan) {
  const embeds = {};
  const photoCandidate = localPreview.photo?.file
    ? await compressImageFileForShare(localPreview.photo.file, "cover", compressionPlan.cover)
    : sharedMedia.photo || (isDataUrl(state.photo) ? state.photo : "");
  if (!isQuerySafeImageSource(state.photo) && photoCandidate) {
    embeds.photo = photoCandidate;
  }

  for (const key of ["sceneTwoImage", "sceneThreeImage", "sceneFourImage"]) {
    const candidate = localPreview[key]?.file
      ? await compressImageFileForShare(localPreview[key].file, "scene", compressionPlan.scene)
      : sharedMedia[key] || (isDataUrl(state[key]) ? state[key] : "");
    if (!isQuerySafeImageSource(state[key]) && candidate) {
      embeds[key] = candidate;
    }
  }

  if (localPreview.gallery.length || sharedMedia.gallery.length) {
    embeds.gallery = localPreview.gallery.length
      ? await Promise.all(
          localPreview.gallery.slice(0, 6).map(async (entry, index) => ({
            src: await compressImageFileForShare(entry.file, "booth", compressionPlan.booth),
            caption: entry.caption || `Memory ${index + 1}`,
          }))
        )
      : sharedMedia.gallery;
  }

  const payload = {
    name: state.name,
    from: state.from,
    opening: state.opening,
    note: state.note,
    photo: getShareableStateValue("photo"),
    audio: isShareableAudioSource(state.audio) ? trim(state.audio) : "",
    audioStart: state.audioStart,
    audioEnd: state.audioEnd,
    photoCaptionText: state.photoCaptionText,
    sceneTwoImage: getShareableStateValue("sceneTwoImage"),
    sceneTwoCaptionText: state.sceneTwoCaptionText,
    sceneThreeImage: getShareableStateValue("sceneThreeImage"),
    sceneThreeCaptionText: state.sceneThreeCaptionText,
    sceneFourImage: getShareableStateValue("sceneFourImage"),
    sceneFourCaptionText: state.sceneFourCaptionText,
    gallery: state.gallery,
    boothCaptions: state.boothCaptions,
    theme: state.theme,
    embeds,
  };

  return encodeSharePayload(payload);
}

async function buildShareLink() {
  if (activeShareId && !shareNeedsSync) {
    return `${location.origin}${location.pathname}?${REMOTE_SHARE_PARAM}=${encodeURIComponent(activeShareId)}`;
  }

  for (const compressionPlan of getCompressionAttempts()) {
    const payloadText = await buildSharePayloadText(compressionPlan);
    if (getTextByteLength(payloadText) <= REMOTE_SHARE_LIMIT_BYTES) {
      return createRemoteShare(payloadText);
    }
  }

  throw new Error("SHARE_TOO_LARGE");
}

async function copyCurrentLink() {
  const localAudioWarning =
    "Local audio or video from your device still does not travel in the short share link. Use a public media URL, a YouTube link, or publish-story.ps1 -Deploy if you want the receiver to hear it too.";

  setCopyButtonsTemporary("Saving...", 3000);

  try {
    const link = await buildShareLink();

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(link);
      pulseCopyButtons("Copied short share link");
    } else {
      window.prompt("Copy this link", link);
    }

    if (hasLocalAudioPreview()) {
      window.setTimeout(() => {
        window.alert(localAudioWarning);
      }, 120);
    }
  } catch (error) {
    if (error instanceof Error && error.message === "SHARE_TOO_LARGE") {
      pulseCopyButtons("Share failed");
      window.alert(
        "This receiver link could not be prepared cleanly yet. Try Copy share link again once. The page now keeps using the short share format, not a huge link."
      );
      return;
    }

    if (hasReceiverMediaPayload() || activeShareId) {
      pulseCopyButtons("Share failed");
      window.alert(
        "The receiver-safe link could not be created, so no plain fallback link was copied. Try Copy share link again."
      );
      return;
    }

    const fallbackLink = `${location.origin}${location.pathname}${location.search}`;
    pulseCopyButtons("Copy manually");
    window.prompt("Copy this link", fallbackLink);
  }
}

async function toggleAudio() {
  const mediaSource = getAudioSource();
  if (!mediaSource) return;

  if (isYouTubeUrl(mediaSource)) {
    await loadYouTubeSource(mediaSource);
    if (!youtubePlayer || !youtubeState.ready) return;

    const { start } = getAudioClipRange();
    try {
      if (youtubeState.playing) {
        youtubePlayer.pauseVideo();
        youtubeState.playing = false;
      } else {
        youtubePlayer.seekTo(start, true);
        youtubePlayer.playVideo();
        youtubeState.playing = true;
        syncYouTubeEndWatcher();
      }
    } catch {
      // Ignore player state failures.
    }

    updateAudioButton();
    return;
  }

  if (refs.audioPlayer.paused) {
    syncDirectMediaClipWindow();
    try {
      await refs.audioPlayer.play();
    } catch {
      // Ignore autoplay restrictions and let the user try again.
    }
  } else {
    refs.audioPlayer.pause();
  }

  updateAudioButton();
}

function showNextCompliment() {
  if (complimentState.busy) return;
  complimentState.index = (complimentState.index + 1) % compliments.length;
  renderCompliment();
  burstAtButton(refs.complimentBtn, "sparkle");
}

function celebrate() {
  refs.finaleMessage.classList.add("visible");
  burstAtButton(refs.celebrateButton, "grand");
}

function wireEvents() {
  refs.nextButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.next;
      if (!target) return;
      burstAtButton(button, "sparkle");
      goToStorySelector(target);
    });
  });

  refs.navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      goToStorySelector(link.getAttribute("href"));
    });
  });

  refs.prevStory.addEventListener("click", () => {
    goToStoryPage(storyState.index - 1);
  });

  refs.nextStory.addEventListener("click", () => {
    goToStoryPage(storyState.index + 1);
  });

  refs.complimentBtn.addEventListener("click", showNextCompliment);

  refs.complimentQuick.addEventListener("click", () => {
    goToStorySelector("#words");
    window.setTimeout(showNextCompliment, prefersReducedMotion ? 0 : 220);
  });

  refs.sparkButton.addEventListener("click", () => {
    burstAtButton(refs.sparkButton, "confetti");
  });

  refs.celebrateButton.addEventListener("click", celebrate);
  refs.audioToggle.addEventListener("click", toggleAudio);

  [refs.copyLink, refs.copyLinkSecondary].forEach((button) => {
    button.addEventListener("click", copyCurrentLink);
  });

  refs.customizeToggle.addEventListener("click", openPanel);
  refs.openCustomizer.addEventListener("click", openPanel);
  refs.closeCustomizer.addEventListener("click", closePanel);

  refs.customizePanel.addEventListener("click", (event) => {
    if (event.target === refs.customizePanel) {
      closePanel();
    }
  });

  refs.themeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      invalidateShareHash();
      state.theme = normalizeTheme(button.dataset.themeChoice);
      refreshUI();
      createFloatingSymbols();
    });
  });

  [
    refs.nameInput,
    refs.fromInput,
    refs.openingInput,
    refs.photoCaptionInput,
    refs.boothInput,
    refs.boothCaptionsInput,
    refs.noteInput,
    refs.audioStartInput,
    refs.audioEndInput,
    refs.sceneTwoCaptionInput,
    refs.sceneThreeCaptionInput,
    refs.sceneFourCaptionInput,
  ].forEach((field) => {
    field.addEventListener("input", () => {
      applyInputState();
    });
  });

  refs.photoInput.addEventListener("input", () => {
    if (trim(refs.photoInput.value)) {
      clearLocalPhotoPreview();
      clearSharedMedia("photo");
    }
    applyInputState();
  });

  refs.audioInput.addEventListener("input", () => {
    if (trim(refs.audioInput.value)) {
      clearLocalAudioPreview();
    }
    syncAudioClipFieldsVisibility();
    applyInputState();
  });

  [
    ["sceneTwoImage", refs.sceneTwoInput],
    ["sceneThreeImage", refs.sceneThreeInput],
    ["sceneFourImage", refs.sceneFourInput],
  ].forEach(([key, input]) => {
    input.addEventListener("input", () => {
      if (trim(input.value)) {
        clearLocalScenePreview(key);
        clearSharedMedia(key);
      }
      applyInputState();
    });
  });

  refs.photoFileInput?.addEventListener("change", applyPhotoFileSelection);
  refs.audioFileInput?.addEventListener("change", applyAudioFileSelection);
  refs.sceneTwoFileInput?.addEventListener("change", () => applySceneFileSelection("sceneTwoImage"));
  refs.sceneThreeFileInput?.addEventListener("change", () => applySceneFileSelection("sceneThreeImage"));
  refs.sceneFourFileInput?.addEventListener("change", () => applySceneFileSelection("sceneFourImage"));
  refs.boothFileInput?.addEventListener("change", applyBoothFilesSelection);

  refs.resetPage.addEventListener("click", () => {
    invalidateShareHash();
    activeShareId = "";
    clearAllSharedMedia();
    clearAllLocalPreviews();
    Object.assign(state, defaults);
    refs.audioPlayer.pause();
    refreshUI();
    createFloatingSymbols();
  });

  refs.photoImage.addEventListener("error", () => {
    resetMediaFrame(refs.photoImage);
    if (localPreview.photo) {
      clearLocalPhotoPreview();
    } else {
      state.photo = "";
    }
    refreshUI();
  });

  refs.audioPlayer.addEventListener("loadedmetadata", syncDirectMediaClipWindow);
  refs.audioPlayer.addEventListener("timeupdate", () => {
    const { start, end } = getAudioClipRange();
    if (end && refs.audioPlayer.currentTime >= end) {
      refs.audioPlayer.pause();
      try {
        refs.audioPlayer.currentTime = start;
      } catch {
        // Ignore seek failures.
      }
      updateAudioButton();
    }
  });
  refs.audioPlayer.addEventListener("play", updateAudioButton);
  refs.audioPlayer.addEventListener("pause", updateAudioButton);
  refs.audioPlayer.addEventListener("ended", () => {
    syncDirectMediaClipWindow();
    updateAudioButton();
  });
  refs.audioPlayer.addEventListener("error", () => {
    if (localPreview.audio) {
      clearLocalAudioPreview();
    } else {
      state.audio = "";
    }
    refreshUI();
  });

  [
    ["sceneTwoImage", refs.sceneTwoImage],
    ["sceneThreeImage", refs.sceneThreeImage],
    ["sceneFourImage", refs.sceneFourImage],
  ].forEach(([key, node]) => {
    node.addEventListener("error", () => {
      resetMediaFrame(node);
      if (localPreview[key]) {
        clearLocalScenePreview(key);
      } else {
        state[key] = "";
      }
      refreshUI();
    });
  });

  window.addEventListener("resize", createFloatingSymbols);
  window.addEventListener("resize", syncLayoutMetrics);
  window.addEventListener("orientationchange", syncLayoutMetrics);

  if ("ResizeObserver" in window) {
    const resizeObserver = new ResizeObserver(() => {
      syncLayoutMetrics();
    });

    [refs.shell, refs.storyUi, refs.page].forEach((node) => {
      if (node) {
        resizeObserver.observe(node);
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closePanel();
    }

    if (body.classList.contains("panel-open")) return;
    if (event.key === "ArrowRight") {
      goToStoryPage(storyState.index + 1);
    }
    if (event.key === "ArrowLeft") {
      goToStoryPage(storyState.index - 1);
    }
  });
}

async function start() {
  await loadPublishedDefaults();
  const remoteShareState = await readRemoteShareState();
  const hashState = Object.keys(remoteShareState).length ? {} : await readHashState();
  state = hydrateState({ ...hashState, ...remoteShareState });
  createFloatingSymbols();
  refreshUI();
  wireEvents();
  syncLayoutMetrics();
}

start();
