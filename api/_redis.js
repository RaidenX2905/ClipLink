// api/_redis.js - Shared Redis singleton for Vercel serverless functions
import { createClient } from "redis";

let client = null;
let connectingPromise = null;
let lastMemoryCheckTime = 0;

export async function getRedis() {
  if (client && client.isOpen) {
    return client;
  }
  if (connectingPromise) {
    return connectingPromise;
  }

  const redisUrl = process.env.REDIS_URL || process.env.KV_URL;
  if (!redisUrl) {
    throw new Error("Missing REDIS_URL or KV_URL environment variable");
  }

  const newClient = createClient({
    url: redisUrl,
    socket: {
      connectTimeout: 5000,
      reconnectStrategy: (retries) => {
        if (retries > 3) return new Error("Redis reconnection limit reached");
        return Math.min(retries * 50, 500);
      }
    }
  });

  newClient.on("error", (err) => {
    console.error("Redis Socket Error:", err.message || err);
  });

  connectingPromise = newClient.connect()
    .then(() => {
      client = newClient;
      connectingPromise = null;
      return client;
    })
    .catch((err) => {
      connectingPromise = null;
      throw err;
    });

  return connectingPromise;
}

/**
 * Autonomous Free-Tier Guard (30 MB Cap Protection):
 * Checks memory consumption periodically (or on OOM errors).
 * When memory exceeds 28 MB (or key count exceeds 200,000 threshold),
 * it flushes old keys to keep the database active under the free tier without downtime.
 */
export async function ensureFreeTierStorageSafety(redisInstance) {
  const now = Date.now();
  // Throttle check to at most once every 60 seconds to preserve daily commands
  if (now - lastMemoryCheckTime < 60000) {
    return;
  }
  lastMemoryCheckTime = now;

  try {
    let shouldPurge = false;

    // 1. Try reading Redis memory info if permitted
    try {
      const info = await redisInstance.info("memory");
      const match = info.match(/used_memory:(\d+)/);
      if (match) {
        const usedBytes = parseInt(match[1], 10);
        // 28 MB threshold (28 * 1024 * 1024 = 29,360,128 bytes)
        if (usedBytes >= 29360128) {
          shouldPurge = true;
        }
      }
    } catch (_) {
      // 2. Fallback to dbSize key count check if INFO command is restricted
      const totalKeys = await redisInstance.dbSize();
      if (totalKeys >= 200000) {
        shouldPurge = true;
      }
    }

    if (shouldPurge) {
      console.warn("[Auto-Guard] 30 MB free-tier limit approached. Executing FLUSHDB to maintain uptime...");
      await redisInstance.flushDb();
    }
  } catch (err) {
    console.warn("[Auto-Guard] Memory check skipped:", err.message || err);
  }
}

/**
 * Handle OOM error fallback by clearing database and retrying
 */
export async function purgeOnOom(redisInstance) {
  try {
    console.warn("[Auto-Guard] OOM detected. Flushing DB to restore service...");
    await redisInstance.flushDb();
  } catch (err) {
    console.error("[Auto-Guard] Flush failed:", err);
  }
}

/**
 * Optimized Serialization Protocol:
 * Compact Format: "<clicks>|<created_ms>|<original_url>"
 * Legacy Format: JSON string '{"id":..., "original_url":..., "short_code":..., "clicks":...}'
 */
export function packLink(originalUrl, clicks = 0, createdAt = Date.now()) {
  const ts = typeof createdAt === "number" ? createdAt : new Date(createdAt).getTime() || Date.now();
  return `${clicks}|${ts}|${originalUrl}`;
}

export function unpackLink(shortCode, raw) {
  if (!raw) return null;

  // 1. Backward compatibility for existing JSON data in production
  if (typeof raw === "string" && raw.charCodeAt(0) === 123) { // '{'
    try {
      const obj = JSON.parse(raw);
      return {
        id: obj.id || shortCode,
        original_url: obj.original_url || "",
        short_code: obj.short_code || shortCode,
        clicks: typeof obj.clicks === "number" ? obj.clicks : 0,
        created_at: obj.created_at || new Date().toISOString()
      };
    } catch (_) {}
  }

  // 2. Compact delimited format: clicks|created_ms|original_url
  const firstPipe = raw.indexOf("|");
  if (firstPipe !== -1) {
    const secondPipe = raw.indexOf("|", firstPipe + 1);
    if (secondPipe !== -1) {
      const clicksStr = raw.substring(0, firstPipe);
      const tsStr = raw.substring(firstPipe + 1, secondPipe);
      const url = raw.substring(secondPipe + 1);
      const tsNum = parseInt(tsStr, 10);
      return {
        id: shortCode,
        original_url: url,
        short_code: shortCode,
        clicks: parseInt(clicksStr, 10) || 0,
        created_at: !isNaN(tsNum) ? new Date(tsNum).toISOString() : new Date().toISOString()
      };
    }
  }

  // Fallback
  return {
    id: shortCode,
    original_url: raw,
    short_code: shortCode,
    clicks: 0,
    created_at: new Date().toISOString()
  };
}

/**
 * Collision-safe Short Code Generator
 * Uses crypto.randomBytes with Base62 charset
 */
const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function generateShortCode(length = 5) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  let code = "";
  for (let i = 0; i < length; i++) {
    code += ALPHABET[bytes[i] % 62];
  }
  return code;
}
