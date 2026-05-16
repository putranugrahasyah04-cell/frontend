import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import crypto from "crypto";
import sharp from "sharp";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, ".env") });

const app = express();

// ═══════════════════════════════════════════════════════════════════
// SECURITY HEADERS
// ═══════════════════════════════════════════════════════════════════
app.disable("x-powered-by");
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});

const allowedOrigins = process.env.ALLOWED_ORIGIN
  ? process.env.ALLOWED_ORIGIN.split(",").map((o) => o.trim())
  : ["http://localhost:5173"];
app.use(cors({ origin: allowedOrigins }));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

const PORT = process.env.PORT || 3000;

// ═══════════════════════════════════════════════════════════════════
// LOG FILE
// ═══════════════════════════════════════════════════════════════════
const LOG_DIR  = join(__dirname, "logs");
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR);
const LOG_FILE = join(LOG_DIR, "server.log");

function writeLog(message) {
  const timestamp = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
  const line = `[${timestamp}] ${message}\n`;
  process.stdout.write(line);
  try { fs.appendFileSync(LOG_FILE, line); } catch (_) {}
}

function cleanLogIfNeeded() {
  try {
    const stat = fs.statSync(LOG_FILE);
    if (stat.size > 5 * 1024 * 1024) {
      fs.writeFileSync(LOG_FILE, `[LOG DIBERSIHKAN — melebihi 5MB]\n`);
      writeLog("🧹 Log file dibersihkan (melebihi 5MB)");
    }
  } catch (_) {}
}

cleanLogIfNeeded();
setInterval(cleanLogIfNeeded, 6 * 60 * 60 * 1000);

writeLog("═══════════════════════════════════════");
writeLog("🌴 SAWPI Server dimulai");
writeLog("═══════════════════════════════════════");

// ═══════════════════════════════════════════════════════════════════
// GLOBAL ERROR HANDLER
// ═══════════════════════════════════════════════════════════════════
process.on("unhandledRejection", (reason, promise) => {
  writeLog(`⚠️  UnhandledRejection: ${reason}`);
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
  writeLog(`🔴 UncaughtException: ${err.message}`);
  console.error("Uncaught Exception:", err);
});

// ═══════════════════════════════════════════════════════════════════
// RATE LIMITER
// ═══════════════════════════════════════════════════════════════════
const rateLimitStore = new Map();
const RATE_LIMIT_MAX    = parseInt(process.env.RATE_LIMIT_MAX    || "10");
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW || "60");

function maskIP(ip) {
  if (!ip || ip === "unknown") return "unknown";
  if (ip.includes(":")) return ip.replace(/:[^:]+$/, ":***");
  return ip.replace(/\.\d+$/, ".***");
}

function getRealIP(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

function checkRateLimit(ip) {
  const now      = Date.now();
  const windowMs = RATE_LIMIT_WINDOW * 1000;
  const record   = rateLimitStore.get(ip);

  if (!record || now >= record.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }

  if (record.count >= RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - record.count };
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitStore.entries()) {
    if (now >= record.resetAt) rateLimitStore.delete(ip);
  }
}, 5 * 60 * 1000);

writeLog(`✅ Rate limiter aktif (maks ${RATE_LIMIT_MAX} req/${RATE_LIMIT_WINDOW}s per IP)`);

// ═══════════════════════════════════════════════════════════════════
// KONSTANTA & UTILITAS DASAR
// ═══════════════════════════════════════════════════════════════════
const REQUEST_TIMEOUT_MS = parseInt(process.env.REQUEST_TIMEOUT_MS || "20000");
const MAX_PROMPT_LENGTH  = parseInt(process.env.MAX_PROMPT_LENGTH  || "5000");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ═══════════════════════════════════════════════════════════════════
// GEMINI API KEYS — Provider utama
// ═══════════════════════════════════════════════════════════════════
const GEMINI_KEYS = [];

if (process.env.GEMINI_API_KEY) GEMINI_KEYS.push(process.env.GEMINI_API_KEY);
let gi = 1;
while (process.env[`GEMINI_API_KEY_${gi}`]) {
  const key = process.env[`GEMINI_API_KEY_${gi}`];
  if (!GEMINI_KEYS.includes(key)) GEMINI_KEYS.push(key);
  gi++;
}

const GEMINI_MODELS = [
  "gemini-2.5-flash",      // ✅ Utama   — 250 req/hari, 10 RPM
  "gemini-2.5-flash-lite", // ✅ Backup  — 1000 req/hari, 30 RPM
  "gemini-2.5-pro",        // ⚠️ Darurat — 100 req/hari, 5 RPM
];

let currentGeminiKeyIndex = 0;
const exhaustedGeminiKeys  = new Map();
const geminiPerMinCooldown = new Map();
const PER_MIN_COOLDOWN_MS  = 62000; // satu konstanta dipakai Gemini & OpenRouter

function isGeminiPerDayError(message) {
  const msg = message.toLowerCase();
  if (msg.includes("daily") || msg.includes("per day") || msg.includes("generaterequestsperday")) return true;
  if (
    message.includes("RESOURCE_EXHAUSTED") &&
    (msg.includes("quota") || msg.includes("exceeded")) &&
    !msg.includes("per minute") && !msg.includes("per_minute") && !msg.includes("qpm")
  ) return true;
  return false;
}

function isGeminiRateLimitError(message) {
  const msg = message.toLowerCase();
  return (
    msg.includes("429") ||
    msg.includes("rate_limit") ||
    msg.includes("ratelimitexceeded") ||
    message.includes("Resource has been exhausted") ||
    (message.includes("RESOURCE_EXHAUSTED") && !isGeminiPerDayError(message)) ||
    msg.includes("per minute") ||
    msg.includes("qpm")
  );
}

function isGeminiProviderError(message) {
  const msg = message.toLowerCase();
  return (
    msg.includes("503") || msg.includes("502") || msg.includes("504") ||
    msg.includes("overloaded") || msg.includes("upstream") || msg.includes("service unavailable")
  );
}

function getGeminiResetTime() {
  const now    = new Date();
  const month  = now.getUTCMonth() + 1;
  const isPDT  = month >= 3 && month <= 11;
  const offset = isPDT ? -7 : -8;
  const pacificNow      = new Date(now.getTime() + offset * 60 * 60 * 1000);
  const pacificMidnight = new Date(pacificNow);
  pacificMidnight.setUTCHours(24, 0, 0, 0);
  return new Date(pacificMidnight.getTime() - offset * 60 * 60 * 1000);
}

function isGeminiKeyExhausted(idx) {
  const exhaustedAt = exhaustedGeminiKeys.get(idx);
  if (!exhaustedAt) return false;
  if (Date.now() >= getGeminiResetTime().getTime()) {
    exhaustedGeminiKeys.delete(idx);
    writeLog(`♻️  Gemini Key #${idx + 1} sudah reset (Pacific midnight)`);
    return false;
  }
  return true;
}

function isGeminiKeyInCooldown(idx) {
  const until = geminiPerMinCooldown.get(idx);
  if (!until) return false;
  if (Date.now() >= until) { geminiPerMinCooldown.delete(idx); return false; }
  return true;
}

function getNextGeminiKey(startIdx) {
  for (let i = 0; i < GEMINI_KEYS.length; i++) {
    const idx = (startIdx + i) % GEMINI_KEYS.length;
    if (!isGeminiKeyExhausted(idx) && !isGeminiKeyInCooldown(idx)) return idx;
  }
  let earliest = -1, earliestTime = Infinity;
  for (let i = 0; i < GEMINI_KEYS.length; i++) {
    const idx = (startIdx + i) % GEMINI_KEYS.length;
    if (!isGeminiKeyExhausted(idx)) {
      const t = geminiPerMinCooldown.get(idx) || 0;
      if (t < earliestTime) { earliestTime = t; earliest = idx; }
    }
  }
  return earliest;
}

async function callGemini(model, image, mimeType, prompt, apiKey) {
  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [
            { inline_data: { mime_type: mimeType, data: image } },
            { text: prompt },
          ]}],
          generationConfig: { temperature: 0, topP: 1, maxOutputTokens: 2000 },
        }),
        signal: controller.signal,
      }
    );
    const data = await response.json();
    if (data.error) throw new Error(data.error.message || "Gemini error");
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    if (!text) throw new Error("Respons kosong dari Gemini");
    return text;
  } catch (err) {
    if (err.name === "AbortError") throw new Error(`Timeout: Gemini tidak merespons dalam ${REQUEST_TIMEOUT_MS / 1000} detik`);
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function runGeminiAnalysis(compressed, prompt) {
  if (GEMINI_KEYS.length === 0) return null;

  const startIdx = getNextGeminiKey(currentGeminiKeyIndex);
  if (startIdx === -1) { writeLog("⚠️  Semua Gemini key habis/cooldown, beralih ke OpenRouter"); return null; }
  currentGeminiKeyIndex = startIdx;

  const maxAttempts = GEMINI_KEYS.length * 2;
  let attempts = 0;

  while (attempts < maxAttempts) {
    attempts++;

    if (isGeminiKeyExhausted(currentGeminiKeyIndex)) {
      const next = getNextGeminiKey(currentGeminiKeyIndex + 1);
      if (next === -1) { writeLog("⚠️  Semua Gemini key habis kuota"); return null; }
      currentGeminiKeyIndex = next;
      continue;
    }

    if (isGeminiKeyInCooldown(currentGeminiKeyIndex)) {
      const alt = getNextGeminiKey(currentGeminiKeyIndex + 1);
      if (alt !== -1 && alt !== currentGeminiKeyIndex) { currentGeminiKeyIndex = alt; continue; }
      const waitMs = (geminiPerMinCooldown.get(currentGeminiKeyIndex) || 0) - Date.now();
      if (waitMs > 0) { writeLog(`   ⏳ Gemini cooldown, tunggu ${Math.ceil(waitMs / 1000)}s...`); await sleep(waitMs + 500); }
      geminiPerMinCooldown.delete(currentGeminiKeyIndex);
      continue;
    }

    const apiKey = GEMINI_KEYS[currentGeminiKeyIndex];
    writeLog(`\n🔷 Gemini key #${currentGeminiKeyIndex + 1}`);
    let keyNeedsRotate = false;

    for (const model of GEMINI_MODELS) {
      try {
        writeLog(`   Mencoba Gemini: ${model}`);
        const rawText = await callGemini(model, compressed.base64, compressed.mimeType, prompt, apiKey);
        const parsed  = parseAIResult(rawText);
        if (!parsed || !parsed.penyakit) {
          writeLog(`   ⚠️  ${model} — Respons bukan JSON valid, coba model berikutnya`);
          continue;
        }
        writeLog(`   ✅ BERHASIL Gemini: ${model} [key #${currentGeminiKeyIndex + 1}]`);
        writeLog(`   Preview: ${rawText.slice(0, 120)}`);
        recordModelSuccess(`gemini/${model}`);
        return { rawText, successModel: `gemini/${model}` };
      } catch (err) {
        const msg = err.message;
        if (isGeminiPerDayError(msg)) {
          exhaustedGeminiKeys.set(currentGeminiKeyIndex, Date.now());
          stats.exhaustedKeyEvents++;
          writeLog(`   🚫 Gemini key #${currentGeminiKeyIndex + 1} habis kuota harian`);
          // Alert jika ini key Gemini terakhir yang tersedia
          const allGeminiExhausted = GEMINI_KEYS.every((_, idx) => isGeminiKeyExhausted(idx));
          if (allGeminiExhausted) {
            sendTelegramAlert("🔴 Semua Gemini API key habis kuota harian!").catch(() => {});
          }
          keyNeedsRotate = true; break;
        }
        if (isGeminiRateLimitError(msg)) {
          geminiPerMinCooldown.set(currentGeminiKeyIndex, Date.now() + PER_MIN_COOLDOWN_MS);
          writeLog(`   ⏱️  Gemini per-min limit key #${currentGeminiKeyIndex + 1}`);
          keyNeedsRotate = true; break;
        }
        if (isGeminiProviderError(msg)) { writeLog(`   ⚡ Gemini provider down: ${model} — skip`); continue; }
        writeLog(`   ❌ Gemini error: ${model} — ${msg}`);
      }
    }

    if (keyNeedsRotate) {
      const next = getNextGeminiKey(currentGeminiKeyIndex + 1);
      if (next === -1) { writeLog("⚠️  Tidak ada Gemini key tersedia, beralih ke OpenRouter"); return null; }
      currentGeminiKeyIndex = next;
      await sleep(500);
    } else {
      break;
    }
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════════
// OPENROUTER API KEYS — Fallback
// ═══════════════════════════════════════════════════════════════════
const API_KEYS = [];

if (process.env.OPENROUTER_API_KEY) API_KEYS.push(process.env.OPENROUTER_API_KEY);
let i = 1;
while (process.env[`OPENROUTER_API_KEY_${i}`]) {
  const key = process.env[`OPENROUTER_API_KEY_${i}`];
  if (!API_KEYS.includes(key)) API_KEYS.push(key);
  i++;
}

let currentKeyIndex = 0;
const exhaustedKeys  = new Map();
const perMinCooldown = new Map();

function getOpenRouterResetTime() { return getGeminiResetTime(); }

function isKeyExhausted(keyIndex) {
  const exhaustedAt = exhaustedKeys.get(keyIndex);
  if (!exhaustedAt) return false;
  if (Date.now() >= getOpenRouterResetTime().getTime()) {
    exhaustedKeys.delete(keyIndex);
    writeLog(`♻️  Key #${keyIndex + 1} sudah reset, siap digunakan kembali`);
    return false;
  }
  return true;
}

function isKeyInCooldown(keyIndex) {
  const cooldownUntil = perMinCooldown.get(keyIndex);
  if (!cooldownUntil) return false;
  if (Date.now() >= cooldownUntil) { perMinCooldown.delete(keyIndex); return false; }
  return true;
}

function setKeyPerMinCooldown(keyIndex) {
  perMinCooldown.set(keyIndex, Date.now() + PER_MIN_COOLDOWN_MS);
  writeLog(`⏱️  Key #${keyIndex + 1} cooldown per-menit selama ${PER_MIN_COOLDOWN_MS / 1000}s`);
}

function markKeyExhausted(keyIndex) {
  exhaustedKeys.set(keyIndex, Date.now());
  const resetTime = getOpenRouterResetTime();
  writeLog(`🚫 Key #${keyIndex + 1} habis kuota. Reset jam ${resetTime.toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta" })} WIB`);
  stats.exhaustedKeyEvents++;

  // Alert jika ini key OpenRouter terakhir yang tersedia
  const allExhausted = API_KEYS.every((_, idx) => isKeyExhausted(idx));
  if (allExhausted) {
    sendTelegramAlert("🔴 Semua OpenRouter API key habis kuota harian!").catch(() => {});
  }
}

function getNextAvailableKeyIndex(startIndex) {
  for (let i = 0; i < API_KEYS.length; i++) {
    const idx = (startIndex + i) % API_KEYS.length;
    if (!isKeyExhausted(idx) && !isKeyInCooldown(idx)) return idx;
  }
  let earliest = -1, earliestTime = Infinity;
  for (let i = 0; i < API_KEYS.length; i++) {
    const idx = (startIndex + i) % API_KEYS.length;
    if (!isKeyExhausted(idx)) {
      const t = perMinCooldown.get(idx) || 0;
      if (t < earliestTime) { earliestTime = t; earliest = idx; }
    }
  }
  return earliest;
}

function getCurrentKey() { return API_KEYS[currentKeyIndex]; }

function rotateKey() {
  const nextIdx = getNextAvailableKeyIndex(currentKeyIndex + 1);
  if (nextIdx === -1) return false;
  currentKeyIndex = nextIdx;
  writeLog(`🔄 Rotate ke API key #${currentKeyIndex + 1} dari ${API_KEYS.length}`);
  return true;
}

function isRateLimitError(message) {
  return (
    message.includes("Rate limit") || message.includes("rate limit") ||
    message.includes("free-models-per-day") || message.includes("free-models-per-min") ||
    message.includes("429")
  );
}

function isProviderError(message) {
  return (
    message.includes("Provider returned error") || message.includes("No endpoints found") ||
    message.includes("upstream") || message.includes("overloaded") ||
    message.includes("503") || message.includes("502") || message.includes("504")
  );
}

function isPerDayError(message) { return message.includes("free-models-per-day"); }

function isPerMinError(message) {
  return (message.includes("Rate limit") || message.includes("rate limit") || message.includes("429")) && !isPerDayError(message);
}

writeLog(`✅ ${GEMINI_KEYS.length} Gemini key dimuat (provider utama)`);
writeLog(`✅ ${API_KEYS.length} OpenRouter key dimuat (fallback)`);

// ═══════════════════════════════════════════════════════════════════
// STATISTIK
// ═══════════════════════════════════════════════════════════════════
const stats = {
  totalRequests: 0, successRequests: 0, failedRequests: 0,
  cacheHits: 0, totalByteSaved: 0, modelUsage: {},
  exhaustedKeyEvents: 0, startTime: Date.now(),
  geminiSuccess: 0, openrouterSuccess: 0,
  rateLimitBlocked: 0,
  totalResponseTimeMs: 0,
  retryAttempts: 0,        // UPGRADE: tracking retry
  visualGuardBlocked: 0,   // UPGRADE: tracking visual guard rejection
};

function recordModelSuccess(model) {
  stats.modelUsage[model] = (stats.modelUsage[model] || 0) + 1;
  if (model.startsWith("gemini/")) stats.geminiSuccess++;
  else stats.openrouterSuccess++;
}

writeLog(`✅ Statistik penggunaan aktif`);

// ═══════════════════════════════════════════════════════════════════
// TELEGRAM ALERT
// Kirim notifikasi ke Telegram jika semua provider down / quota habis.
// Dibatasi 1 notifikasi per 30 menit agar tidak spam.
// Set di .env: TELEGRAM_BOT_TOKEN=xxx  TELEGRAM_CHAT_ID=123
// ═══════════════════════════════════════════════════════════════════
let lastAlertSentAt = 0;
const ALERT_COOLDOWN_MS = 30 * 60 * 1000;

async function sendTelegramAlert(message) {
  const token  = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const now = Date.now();
  if (now - lastAlertSentAt < ALERT_COOLDOWN_MS) return;
  lastAlertSentAt = now;

  const text =
    `🚨 *SAWPI Server Alert*\n\n${message}\n\n` +
    `📊 Total: ${stats.totalRequests} | ✅ OK: ${stats.successRequests} | ❌ Gagal: ${stats.failedRequests}\n` +
    `⏰ ${new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}`;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
    });
    writeLog(`📨 Telegram alert terkirim`);
  } catch (err) {
    writeLog(`⚠️  Telegram alert gagal: ${err.message}`);
  }
}

writeLog(`✅ Telegram alert: ${process.env.TELEGRAM_BOT_TOKEN ? "aktif" : "nonaktif (set TELEGRAM_BOT_TOKEN di .env)"}`);

// ═══════════════════════════════════════════════════════════════════
// LRU CACHE
// ═══════════════════════════════════════════════════════════════════
class LRUCache {
  constructor(maxSize, ttlMs) {
    this.maxSize = maxSize;
    this.ttlMs   = ttlMs;
    this.store   = new Map();
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.ttlMs) { this.store.delete(key); return null; }
    this.store.delete(key);
    this.store.set(key, entry);
    return entry;
  }

  set(key, result, model) {
    if (this.store.has(key)) this.store.delete(key);
    if (this.store.size >= this.maxSize) {
      this.store.delete(this.store.keys().next().value);
    }
    this.store.set(key, { result, model, timestamp: Date.now() });
  }

  get size() { return this.store.size; }
}

const CACHE_TTL_MS    = 60 * 60 * 1000;
const analysisCache   = new LRUCache(100, CACHE_TTL_MS);
const pendingRequests = new Map();

// Sweep TTL expired — entri yang tidak pernah di-get tidak otomatis terhapus
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of analysisCache.store.entries()) {
    if (now - entry.timestamp > CACHE_TTL_MS) analysisCache.store.delete(key);
  }
}, 15 * 60 * 1000);

function getCacheKey(imageBase64, prompt) {
  const buf = Buffer.from(imageBase64, "base64");
  return crypto.createHash("sha256").update(buf).update("|").update(prompt).digest("hex");
}

writeLog(`✅ Cache LRU aktif (TTL: 1 jam, maks 100 entri)`);

// ═══════════════════════════════════════════════════════════════════
// VALIDASI GAMBAR
// ═══════════════════════════════════════════════════════════════════
const ALLOWED_MIME_TYPES   = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

function validateImage(base64Image, mimeType) {
  if (!ALLOWED_MIME_TYPES.includes(mimeType))
    return { valid: false, error: `Format tidak didukung: ${mimeType}. Gunakan JPEG, PNG, WebP, atau GIF.` };
  const sizeBytes = Math.ceil((base64Image.length * 3) / 4);
  if (sizeBytes > MAX_IMAGE_SIZE_BYTES)
    return { valid: false, error: `Ukuran gambar terlalu besar (${(sizeBytes / 1024 / 1024).toFixed(1)}MB). Maksimal 10MB.` };
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64Image.slice(0, 100)))
    return { valid: false, error: "Format gambar tidak valid (bukan base64)." };
  return { valid: true };
}

writeLog(`✅ Validasi gambar aktif (JPEG/PNG/WebP/GIF, maks 10MB)`);

// ═══════════════════════════════════════════════════════════════════
// KOMPRESI GAMBAR
// ═══════════════════════════════════════════════════════════════════
async function compressImage(base64Image, mimeType) {
  try {
    const inputBuffer  = Buffer.from(base64Image, "base64");
    const originalSize = inputBuffer.length;
    const outputBuffer = await sharp(inputBuffer)
      .resize(1024, 1024, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 88 })
      .toBuffer();
    const compressedSize = outputBuffer.length;
    if (compressedSize < originalSize) {
      stats.totalByteSaved += (originalSize - compressedSize);
      writeLog(`🗜️  Dikompres: ${(originalSize/1024).toFixed(0)}KB → ${(compressedSize/1024).toFixed(0)}KB (hemat ${((1 - compressedSize/originalSize)*100).toFixed(1)}%)`);
      return { base64: outputBuffer.toString("base64"), mimeType: "image/jpeg" };
    }
    writeLog(`ℹ️  Gambar sudah optimal (${(originalSize/1024).toFixed(0)}KB), tidak dikompres`);
    return { base64: base64Image, mimeType };
  } catch (err) {
    writeLog(`⚠️  Kompresi gagal (${err.message}), pakai gambar asli`);
    return { base64: base64Image, mimeType };
  }
}

writeLog(`✅ Kompresi gambar otomatis aktif (maks 1024px, JPEG 88%)`);

// ═══════════════════════════════════════════════════════════════════
// VISUAL GUARD — Validasi konten gambar secara visual
// Cek apakah gambar adalah foto sawit sebelum analisis penuh.
// Pakai gemini-2.5-flash-lite (model paling ringan, cukup untuk ya/tidak).
// Nonaktifkan via .env: VISUAL_GUARD=false
// ═══════════════════════════════════════════════════════════════════
const VISUAL_GUARD_ENABLED = process.env.VISUAL_GUARD !== "false";
const VISUAL_GUARD_PROMPT  =
  "Is this image related to oil palm plant (Elaeis guineensis), its leaves, fruit, trunk, or plantation? " +
  "Reply with ONLY one word: yes or no.";

async function validateImageContent(compressed) {
  if (!VISUAL_GUARD_ENABLED) return { valid: true };
  // Jika tidak ada Gemini key tersedia, loloskan saja — jangan blokir user
  if (GEMINI_KEYS.length === 0) return { valid: true };

  // Pilih key yang tidak sedang exhausted/cooldown; fallback ke key[0]
  let guardKeyIdx = currentGeminiKeyIndex;
  if (isGeminiKeyExhausted(guardKeyIdx) || isGeminiKeyInCooldown(guardKeyIdx)) {
    const alt = getNextGeminiKey(0);
    if (alt === -1) return { valid: true }; // semua key tidak tersedia, loloskan
    guardKeyIdx = alt;
  }
  const apiKey = GEMINI_KEYS[guardKeyIdx];

  try {
    const reply  = await callGemini(
      "gemini-2.5-flash-lite",
      compressed.base64,
      compressed.mimeType,
      VISUAL_GUARD_PROMPT,
      apiKey
    );
    const answer = reply.trim().toLowerCase().replace(/[^a-z]/g, "");
    if (answer === "no") {
      return {
        valid: false,
        reason: "Gambar tidak terdeteksi sebagai foto tanaman sawit. " +
                "Pastikan mengunggah foto daun, buah, batang, atau kebun sawit.",
      };
    }
    return { valid: true };
  } catch (err) {
    // Kalau validasi sendiri error (timeout, quota, dsb), loloskan request
    // agar user tidak terblokir karena masalah sisi server
    writeLog(`⚠️  Visual guard error (${err.message}), gambar diloloskan`);
    return { valid: true };
  }
}

writeLog(`✅ Visual guard: ${VISUAL_GUARD_ENABLED ? "aktif (validasi konten sawit)" : "nonaktif (VISUAL_GUARD=false)"}`);

// ═══════════════════════════════════════════════════════════════════
// OPENROUTER MODEL LIST — Fallback
// ═══════════════════════════════════════════════════════════════════
const VISION_MODELS = [
  "google/gemma-4-31b-it:free",
  "google/gemma-4-26b-a4b-it:free",
  "qwen/qwen2.5-vl-72b-instruct:free",
  "qwen/qwen2.5-vl-32b-instruct:free",
  "qwen/qwen-2.5-vl-7b-instruct:free",
  "google/gemma-3-27b-it:free",
  "google/gemma-3-12b-it:free",
  "google/gemma-3-4b-it:free",
  "nvidia/nemotron-nano-12b-v2-vl:free",
];

// ═══════════════════════════════════════════════════════════════════
// PARSE JSON
// ═══════════════════════════════════════════════════════════════════
function parseAIResult(text) {
  if (!text) return null;
  try { return JSON.parse(text.trim()); } catch (_) {}
  try { const m = text.match(/```json\s*([\s\S]*?)\s*```/); if (m) return JSON.parse(m[1].trim()); } catch (_) {}
  try { const m = text.match(/\{[\s\S]*"penyakit"[\s\S]*\}/); if (m) return JSON.parse(m[0]); } catch (_) {}
  try { const s = text.indexOf("{"), e = text.lastIndexOf("}"); if (s !== -1 && e > s) return JSON.parse(text.slice(s, e + 1)); } catch (_) {}
  return null;
}

// ═══════════════════════════════════════════════════════════════════
// FRIENDLY ERROR MESSAGES
// Terjemahkan error teknis menjadi pesan yang bisa dimengerti user.
// ═══════════════════════════════════════════════════════════════════
function getFriendlyError(err) {
  const msg = err?.message || "";

  if (msg.includes("Timeout") || msg.includes("AbortError"))
    return "Server sedang lambat, coba lagi dalam beberapa detik.";

  if (
    msg.includes("quota") || msg.includes("exhausted") ||
    msg.includes("RESOURCE_EXHAUSTED") || msg.includes("free-models-per-day")
  )
    return "Semua server sedang penuh kuota. Coba lagi besok atau hubungi admin.";

  if (
    msg.includes("Rate limit") || msg.includes("rate limit") ||
    msg.includes("429") || msg.includes("per minute") || msg.includes("free-models-per-min")
  )
    return "Server sedang sibuk, coba lagi dalam 1 menit.";

  if (
    msg.includes("overloaded") || msg.includes("503") ||
    msg.includes("502") || msg.includes("504") ||
    msg.includes("upstream") || msg.includes("service unavailable")
  )
    return "Server AI sedang tidak stabil, coba lagi dalam beberapa menit.";

  if (msg.includes("Semua provider"))
    return "Semua layanan AI sedang tidak tersedia. Coba lagi nanti atau hubungi admin.";

  if (msg.includes("Respons kosong") || msg.includes("bukan JSON valid"))
    return "Analisis gagal menghasilkan hasil yang valid. Coba kirim ulang gambar.";

  return "Terjadi kesalahan tak terduga. Coba lagi atau hubungi admin jika terus berulang.";
}

// ═══════════════════════════════════════════════════════════════════
// AUTO-RETRY WRAPPER
// Retry otomatis untuk error sementara (timeout, provider down).
// Error kuota/validasi TIDAK di-retry — sudah pasti gagal lagi.
// ═══════════════════════════════════════════════════════════════════
const RETRY_DELAYS_MS = [2000, 5000]; // maks 2 percobaan ulang

function isRetryableError(msg) {
  return (
    msg.includes("Timeout") ||
    msg.includes("overloaded") ||
    msg.includes("503") || msg.includes("502") || msg.includes("504") ||
    msg.includes("upstream") ||
    msg.includes("Respons kosong")
  );
}

async function withRetry(fn, requestId) {
  let lastErr;
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const isLast = attempt === RETRY_DELAYS_MS.length;
      if (isLast || !isRetryableError(err.message)) throw err;
      const delay = RETRY_DELAYS_MS[attempt];
      stats.retryAttempts++;
      writeLog(`   🔁 Request #${requestId} retry ke-${attempt + 1} dalam ${delay / 1000}s (${err.message})`);
      await sleep(delay);
    }
  }
  throw lastErr;
}

// ═══════════════════════════════════════════════════════════════════
// OPENROUTER CALL
// ═══════════════════════════════════════════════════════════════════
async function callOpenRouter(model, image, mimeType, prompt, apiKey) {
  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:5173",
        "X-Title": "SAWPI Aplikasi Sawit",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: [
          { type: "image_url", image_url: { url: `data:${mimeType};base64,${image}` } },
          { type: "text", text: prompt },
        ]}],
        max_tokens: 800, temperature: 0, top_p: 1,
      }),
      signal: controller.signal,
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message || "Model error");
    const text = data.choices?.[0]?.message?.content || "";
    if (!text) throw new Error("Respons kosong dari model");
    return text;
  } catch (err) {
    if (err.name === "AbortError") throw new Error(`Timeout: model tidak merespons dalam ${REQUEST_TIMEOUT_MS / 1000} detik`);
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ═══════════════════════════════════════════════════════════════════
// OPENROUTER ANALISIS — Fallback
// ═══════════════════════════════════════════════════════════════════
async function runOpenRouterAnalysis(compressed, prompt) {
  if (API_KEYS.length === 0) return null;

  let rawText = "", successModel = "";
  const startIdx = getNextAvailableKeyIndex(currentKeyIndex);
  if (startIdx === -1) return null;
  currentKeyIndex = startIdx;

  const maxAttempts = API_KEYS.length * 2;
  let attempts = 0;

  while (attempts < maxAttempts) {
    attempts++;

    if (isKeyExhausted(currentKeyIndex)) {
      if (!rotateKey()) { writeLog(`\n🚫 Semua OpenRouter key sudah habis kuota harian`); break; }
      continue;
    }

    if (isKeyInCooldown(currentKeyIndex)) {
      const alt = getNextAvailableKeyIndex(currentKeyIndex + 1);
      if (alt !== -1 && alt !== currentKeyIndex) { currentKeyIndex = alt; continue; }
      const waitMs = (perMinCooldown.get(currentKeyIndex) || 0) - Date.now();
      if (waitMs > 0) { writeLog(`   ⏳ Semua key cooldown, tunggu ${Math.ceil(waitMs / 1000)}s...`); await sleep(waitMs + 500); }
      perMinCooldown.delete(currentKeyIndex);
      continue;
    }

    const apiKey = getCurrentKey();
    writeLog(`\n🔑 OpenRouter key #${currentKeyIndex + 1}`);
    let keyNeedsRotate = false, keyNeedsExhaust = false;

    for (const model of VISION_MODELS) {
      try {
        writeLog(`   Mencoba model: ${model}`);
        rawText = await callOpenRouter(model, compressed.base64, compressed.mimeType, prompt, apiKey);
        const parsed = parseAIResult(rawText);
        if (!parsed || !parsed.penyakit) {
          writeLog(`   ⚠️  ${model} — Respons bukan JSON valid`);
          rawText = ""; continue;
        }
        successModel = model;
        writeLog(`   ✅ BERHASIL: ${model} [key #${currentKeyIndex + 1}]`);
        writeLog(`   Preview: ${rawText.slice(0, 120)}`);
        recordModelSuccess(model);
        break;
      } catch (err) {
        if (isPerDayError(err.message))   { markKeyExhausted(currentKeyIndex); writeLog(`   ⏭️  Per-day limit, ganti key`); keyNeedsExhaust = true; break; }
        if (isPerMinError(err.message))   { setKeyPerMinCooldown(currentKeyIndex); keyNeedsRotate = true; break; }
        if (isProviderError(err.message)) { writeLog(`   ⚡ Provider down: ${model} — skip`); continue; }
        writeLog(`   ❌ Error: ${model} — ${err.message}`);
      }
    }

    if (rawText) break;

    if (keyNeedsExhaust) {
      if (!rotateKey()) { writeLog(`\n🚫 Semua OpenRouter key habis kuota harian`); break; }
      await sleep(1000);
    } else if (keyNeedsRotate) {
      if (!rotateKey()) continue;
    } else {
      if (!rotateKey()) break;
    }
  }

  if (!rawText) return null;
  return { rawText, successModel };
}

// ═══════════════════════════════════════════════════════════════════
// FUNGSI INTI ANALISIS — Gemini dulu, OpenRouter sebagai fallback
// ═══════════════════════════════════════════════════════════════════
async function runAnalysis(compressed, prompt) {
  if (GEMINI_KEYS.length > 0) {
    writeLog(`\n🔷 Mencoba Gemini (provider utama)...`);
    const geminiResult = await runGeminiAnalysis(compressed, prompt);
    if (geminiResult) return geminiResult;
    writeLog(`⚠️  Gemini gagal, beralih ke OpenRouter (fallback)...`);
  }

  if (API_KEYS.length > 0) {
    const openrouterResult = await runOpenRouterAnalysis(compressed, prompt);
    if (openrouterResult) return openrouterResult;
  }

  // Semua provider gagal — kirim alert sebelum throw
  sendTelegramAlert(
    "⚠️ Semua provider (Gemini & OpenRouter) tidak tersedia.\n" +
    "Server tidak bisa memproses analisis saat ini."
  ).catch(() => {});

  throw new Error("Semua provider (Gemini & OpenRouter) tidak tersedia. Coba lagi nanti.");
}

// ═══════════════════════════════════════════════════════════════════
// REQUEST QUEUE — deduplikasi concurrent request
// ═══════════════════════════════════════════════════════════════════
const PENDING_TIMEOUT_MS = 3 * 60 * 1000;
const pendingRequestTime = new Map();

function cleanStalePendingRequests() {
  const now = Date.now();
  for (const [key, addedAt] of pendingRequestTime.entries()) {
    if (now - addedAt > PENDING_TIMEOUT_MS) {
      pendingRequests.delete(key);
      pendingRequestTime.delete(key);
      writeLog(`🧹 Pending request stale dibersihkan (hang > 3 menit)`);
    }
  }
}

writeLog(`✅ Request queue aktif (deduplikasi concurrent request)`);

// ═══════════════════════════════════════════════════════════════════
// SHUTDOWN MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════
let isShuttingDown = false;

app.use((req, res, next) => {
  if (isShuttingDown) return res.status(503).json({ error: "Server sedang dalam proses restart, coba lagi sebentar" });
  next();
});

// ═══════════════════════════════════════════════════════════════════
// ENDPOINT: GET /health
// ═══════════════════════════════════════════════════════════════════
app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: Math.floor((Date.now() - stats.startTime) / 1000) });
});

// ═══════════════════════════════════════════════════════════════════
// ENDPOINT: POST /analyze
// ═══════════════════════════════════════════════════════════════════
app.post("/analyze", async (req, res) => {
  // Rate limiting per IP
  const ip = getRealIP(req);
  const rl = checkRateLimit(ip);
  if (!rl.allowed) {
    stats.rateLimitBlocked++;
    writeLog(`🚫 Rate limit: IP ${maskIP(ip)} diblokir (coba lagi ${rl.retryAfter}s)`);
    res.setHeader("Retry-After", rl.retryAfter);
    return res.status(429).json({ error: `Terlalu banyak permintaan. Coba lagi dalam ${rl.retryAfter} detik.` });
  }

  stats.totalRequests++;
  const requestId    = stats.totalRequests;
  const reqStartTime = Date.now();
  writeLog(`\n📥 Request #${requestId} masuk (IP: ${maskIP(ip)})`);

  try {
    const { image, mimeType, prompt } = req.body;

    if (typeof image !== "string" || typeof mimeType !== "string" || typeof prompt !== "string") {
      stats.failedRequests++;
      return res.status(400).json({ error: "Tipe data tidak valid. image, mimeType, dan prompt harus berupa string." });
    }

    if (!image || !mimeType || !prompt) {
      stats.failedRequests++;
      return res.status(400).json({ error: "Data tidak lengkap (image, mimeType, prompt wajib ada)" });
    }

    if (prompt.trim().length === 0 || prompt.length > MAX_PROMPT_LENGTH) {
      stats.failedRequests++;
      return res.status(400).json({ error: `Prompt tidak valid (tidak boleh kosong, maks ${MAX_PROMPT_LENGTH} karakter)` });
    }

    const validation = validateImage(image, mimeType);
    if (!validation.valid) {
      stats.failedRequests++;
      writeLog(`   ⛔ Validasi gagal: ${validation.error}`);
      return res.status(400).json({ error: validation.error });
    }

    const cacheKey = getCacheKey(image, prompt);
    const cached   = analysisCache.get(cacheKey);
    if (cached) {
      stats.cacheHits++;
      stats.successRequests++;
      writeLog(`   ⚡ Cache hit! (model: ${cached.model}) [${Date.now() - reqStartTime}ms]`);
      return res.json({ rawText: cached.result, model: cached.model, fromCache: true });
    }

    if (pendingRequests.has(cacheKey)) {
      writeLog(`   ⏳ Request #${requestId} menunggu request duplikat selesai...`);
      try {
        const { rawText, successModel } = await pendingRequests.get(cacheKey);
        stats.cacheHits++;
        stats.successRequests++;
        return res.json({ rawText, model: successModel, fromCache: true });
      } catch (err) {
        stats.failedRequests++;
        return res.status(500).json({ error: getFriendlyError(err) });
      }
    }

    // Kompresi terlebih dahulu (butuh untuk visual guard & analisis)
    const compressed = await compressImage(image, mimeType);

    // Visual guard — cek apakah gambar benar-benar foto sawit
    const contentCheck = await validateImageContent(compressed);
    if (!contentCheck.valid) {
      stats.failedRequests++;
      stats.visualGuardBlocked++;
      writeLog(`   🚫 Visual guard: bukan sawit (request #${requestId})`);
      return res.status(422).json({ error: contentCheck.reason });
    }

    // Jalankan analisis dengan retry otomatis untuk error sementara
    const analysisPromise = withRetry(() => runAnalysis(compressed, prompt), requestId);
    pendingRequests.set(cacheKey, analysisPromise);
    pendingRequestTime.set(cacheKey, Date.now());

    let rawText, successModel;
    try {
      ({ rawText, successModel } = await analysisPromise);
    } finally {
      // Selalu bersihkan pending, bahkan jika analisis gagal
      pendingRequests.delete(cacheKey);
      pendingRequestTime.delete(cacheKey);
    }

    analysisCache.set(cacheKey, rawText, successModel);
    stats.successRequests++;

    const elapsed = Date.now() - reqStartTime;
    stats.totalResponseTimeMs += elapsed;
    writeLog(`✅ Request #${requestId} selesai dalam ${elapsed}ms (model: ${successModel})`);
    return res.json({ rawText, model: successModel, fromCache: false });

  } catch (err) {
    stats.failedRequests++;
    writeLog(`❌ Request #${requestId} gagal dalam ${Date.now() - reqStartTime}ms: ${err.message}`);
    return res.status(500).json({
      error: getFriendlyError(err),
      // Detail teknis hanya tampil di mode development agar tidak bocor ke production
      detail: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// ═══════════════════════════════════════════════════════════════════
// ENDPOINT: GET /status
// ═══════════════════════════════════════════════════════════════════
app.get("/status", (req, res) => {
  const secret = process.env.STATUS_SECRET;
  if (secret && req.headers["x-status-key"] !== secret) {
    return res.status(401).json({ error: "Unauthorized. Sertakan header x-status-key yang benar." });
  }

  const uptimeSeconds = Math.floor((Date.now() - stats.startTime) / 1000);
  const uptimeStr     = `${Math.floor(uptimeSeconds/3600)}j ${Math.floor((uptimeSeconds%3600)/60)}m ${uptimeSeconds%60}d`;

  const geminiStatus = GEMINI_KEYS.map((_, idx) => {
    if (isGeminiKeyExhausted(idx)) return { key: `gemini_key_${idx + 1}`, status: "exhausted" };
    if (isGeminiKeyInCooldown(idx)) {
      const remaining = Math.ceil(((geminiPerMinCooldown.get(idx) || 0) - Date.now()) / 1000);
      return { key: `gemini_key_${idx + 1}`, status: `cooldown_${remaining}s` };
    }
    return { key: `gemini_key_${idx + 1}`, status: "available" };
  });

  const keyStatus = API_KEYS.map((_, idx) => {
    if (isKeyExhausted(idx)) return { key: `key_${idx + 1}`, status: "exhausted" };
    if (isKeyInCooldown(idx)) {
      const remaining = Math.ceil(((perMinCooldown.get(idx) || 0) - Date.now()) / 1000);
      return { key: `key_${idx + 1}`, status: `cooldown_${remaining}s` };
    }
    return { key: `key_${idx + 1}`, status: "available" };
  });

  const modelRanking = Object.entries(stats.modelUsage)
    .sort((a, b) => b[1] - a[1])
    .map(([model, count]) => ({ model, count }));

  const resetTimeStr = getGeminiResetTime().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });

  const nonCacheSuccess = stats.successRequests - stats.cacheHits;
  const avgResponseMs   = nonCacheSuccess > 0
    ? Math.round(stats.totalResponseTimeMs / nonCacheSuccess)
    : 0;

  res.json({
    server: {
      uptime: uptimeStr,
      started: new Date(stats.startTime).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }),
      quota_reset_at: resetTimeStr,
    },
    requests: {
      total: stats.totalRequests,
      success: stats.successRequests,
      failed: stats.failedRequests,
      cache_hits: stats.cacheHits,
      pending: pendingRequests.size,
      rate_limit_blocked: stats.rateLimitBlocked,
      visual_guard_blocked: stats.visualGuardBlocked,
      retry_attempts: stats.retryAttempts,
      success_rate: stats.totalRequests > 0
        ? `${((stats.successRequests / stats.totalRequests) * 100).toFixed(1)}%`
        : "0%",
      gemini_success: stats.geminiSuccess,
      openrouter_success: stats.openrouterSuccess,
      avg_response_ms: avgResponseMs,
    },
    gemini: {
      total_keys: GEMINI_KEYS.length,
      available: geminiStatus.filter(k => k.status === "available").length,
      exhausted: geminiStatus.filter(k => k.status === "exhausted").length,
      cooldown:  geminiStatus.filter(k => k.status.startsWith("cooldown")).length,
      models: GEMINI_MODELS,
      detail: geminiStatus,
    },
    openrouter: {
      total_keys: API_KEYS.length,
      available: keyStatus.filter(k => k.status === "available").length,
      exhausted: keyStatus.filter(k => k.status === "exhausted").length,
      cooldown:  keyStatus.filter(k => k.status.startsWith("cooldown")).length,
      models: VISION_MODELS.length,
      detail: keyStatus,
    },
    cache: { size: analysisCache.size, ttl: "1 jam", strategy: "LRU" },
    compression: { total_saved_kb: (stats.totalByteSaved / 1024).toFixed(1) },
    models: { ranking: modelRanking },
    rate_limiter: {
      max_per_window: RATE_LIMIT_MAX,
      window_seconds: RATE_LIMIT_WINDOW,
      active_ips: rateLimitStore.size,
    },
    features: {
      visual_guard: VISUAL_GUARD_ENABLED,
      auto_retry: true,
      retry_max_attempts: RETRY_DELAYS_MS.length,
      telegram_alert: !!process.env.TELEGRAM_BOT_TOKEN,
      log_endpoint: !!process.env.STATUS_SECRET,
    },
  });
});

// ═══════════════════════════════════════════════════════════════════
// ENDPOINT: GET /logs
// Download atau lihat isi log server.
// Dilindungi STATUS_SECRET (sama seperti /status).
// Wajib set STATUS_SECRET di .env — tanpanya endpoint ini disabled.
//
// Cara pakai:
//   Lihat 200 baris terakhir : GET /logs
//   Lihat N baris terakhir   : GET /logs?tail=50
//   Download seluruh log     : GET /logs?download=1
// Header: x-status-key: <STATUS_SECRET>
// ═══════════════════════════════════════════════════════════════════
app.get("/logs", (req, res) => {
  const secret = process.env.STATUS_SECRET;

  // Endpoint dinonaktifkan jika STATUS_SECRET belum di-set
  if (!secret) {
    return res.status(403).json({
      error: "Endpoint /logs dinonaktifkan. Set STATUS_SECRET di .env untuk mengaktifkan.",
    });
  }

  if (req.headers["x-status-key"] !== secret) {
    return res.status(401).json({ error: "Unauthorized. Sertakan header x-status-key yang benar." });
  }

  if (!fs.existsSync(LOG_FILE)) {
    return res.status(404).json({ error: "File log belum ada." });
  }

  try {
    const content  = fs.readFileSync(LOG_FILE, "utf-8");
    const download = req.query.download === "1";

    if (download) {
      const filename = `sawpi-server-${new Date().toISOString().slice(0,10)}.log`;
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      return res.send(content);
    }

    // Mode tail — kembalikan N baris terakhir sebagai JSON
    const tail   = Math.min(Math.max(parseInt(req.query.tail || "200"), 1), 2000);
    const lines  = content.split("\n").filter(Boolean);
    const sliced = lines.slice(-tail);

    return res.json({
      total_lines:  lines.length,
      showing_last: sliced.length,
      log:          sliced,
    });
  } catch (err) {
    return res.status(500).json({ error: "Gagal membaca log", detail: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
// GRACEFUL SHUTDOWN
// ═══════════════════════════════════════════════════════════════════
const cleanupInterval = setInterval(cleanStalePendingRequests, 60 * 1000);

function gracefulShutdown(signal) {
  writeLog(`\n⚠️  Menerima sinyal ${signal}, memulai graceful shutdown...`);
  isShuttingDown = true;
  clearInterval(cleanupInterval);
  server.close(() => {
    writeLog(`✅ Server berhasil dimatikan dengan aman`);
    writeLog("═══════════════════════════════════════");
    process.exit(0);
  });
  setTimeout(() => { writeLog(`⚠️  Force shutdown setelah 30 detik`); process.exit(1); }, 30000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT",  () => gracefulShutdown("SIGINT"));

writeLog(`✅ Graceful shutdown aktif`);

// ═══════════════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════════════
const server = app.listen(PORT, () => {
  writeLog(`\n🌴 SAWPI Server jalan di http://localhost:${PORT}`);
  writeLog(`🔷 Gemini keys     : ${GEMINI_KEYS.length} key (provider utama)`);
  writeLog(`🔷 Gemini models   : ${GEMINI_MODELS.length} model tersedia`);
  writeLog(`🔑 OpenRouter keys : ${API_KEYS.length} key (fallback)`);
  writeLog(`📦 OpenRouter model: ${VISION_MODELS.length} model tersedia`);
  writeLog(`⚡ Cache analisis  : aktif LRU (TTL 1 jam, maks 100 entri)`);
  writeLog(`🗜️  Kompresi gambar : aktif (maks 1024px, JPEG 88%)`);
  writeLog(`⏱️  Timeout request : ${REQUEST_TIMEOUT_MS / 1000} detik`);
  writeLog(`🛡️  Rate limit      : ${RATE_LIMIT_MAX} req/${RATE_LIMIT_WINDOW}s per IP`);
  writeLog(`✏️  Maks prompt     : ${MAX_PROMPT_LENGTH} karakter`);
  writeLog(`🌿 Visual guard    : ${VISUAL_GUARD_ENABLED ? "aktif (validasi konten sawit)" : "nonaktif"}`);
  writeLog(`🔁 Auto-retry      : aktif (maks ${RETRY_DELAYS_MS.length}x, jeda ${RETRY_DELAYS_MS.join("/")}ms)`);
  writeLog(`📨 Telegram alert  : ${process.env.TELEGRAM_BOT_TOKEN ? "aktif" : "nonaktif (set TELEGRAM_BOT_TOKEN)"}`);
  writeLog(`🔒 Status/Log auth : ${process.env.STATUS_SECRET ? "aktif (x-status-key)" : "nonaktif (set STATUS_SECRET)"}`);
  writeLog(`📋 Log file        : ${LOG_FILE}`);
  writeLog(`❤️  Health check    : http://localhost:${PORT}/health`);
  writeLog(`📊 Status monitor  : http://localhost:${PORT}/status`);
  writeLog(`📄 Log endpoint    : http://localhost:${PORT}/logs\n`);
});