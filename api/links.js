import { getRedis, packLink, unpackLink, generateShortCode, ensureFreeTierStorageSafety, purgeOnOom } from "./_redis.js";

export default async function handler(request, response) {
  // CORS
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (request.method === 'OPTIONS') return response.status(200).end();

  try {
    const redis = await getRedis();

    // GET /api/links - returns recent links without blocking server
    if (request.method === "GET") {
      let keys = [];
      try {
        const scanRes = await redis.scan(0, { MATCH: "link:*", COUNT: 20 });
        keys = scanRes.keys || [];
      } catch (_) {
        keys = await redis.keys("link:*");
      }

      const topKeys = keys.slice(0, 10);
      if (topKeys.length === 0) {
        return response.status(200).json({ links: [] });
      }

      const rawValues = await redis.mGet(topKeys);
      const links = [];
      for (let i = 0; i < topKeys.length; i++) {
        const key = topKeys[i];
        const val = rawValues[i];
        if (val) {
          const shortCode = key.replace(/^link:/, "");
          links.push(unpackLink(shortCode, val));
        }
      }

      return response.status(200).json({ links });
    }

    // POST /api/links - create new shortened link
    if (request.method === "POST") {
      const { originalUrl } = request.body || {};
      if (!originalUrl || typeof originalUrl !== "string") {
        return response.status(400).json({ error: "No URL" });
      }

      const trimmedUrl = originalUrl.trim();
      const now = Date.now();

      // Check storage guard to prevent exceeding 30 MB free-tier limit
      await ensureFreeTierStorageSafety(redis);

      let shortCode = "";
      let created = false;

      for (let attempt = 0; attempt < 5; attempt++) {
        shortCode = generateShortCode(5);
        const packed = packLink(trimmedUrl, 0, now);

        try {
          const setRes = await redis.set(`link:${shortCode}`, packed, { NX: true });
          if (setRes === "OK" || setRes === true) {
            created = true;
            break;
          }
        } catch (setErr) {
          if (setErr.message && setErr.message.includes("OOM")) {
            await purgeOnOom(redis);
            const retryRes = await redis.set(`link:${shortCode}`, packed, { NX: true });
            if (retryRes === "OK" || retryRes === true) {
              created = true;
              break;
            }
          } else {
            throw setErr;
          }
        }
      }

      if (!created) {
        return response.status(500).json({ error: "Failed to generate unique short link. Please retry." });
      }

      const link = {
        id: shortCode,
        original_url: trimmedUrl,
        short_code: shortCode,
        clicks: 0,
        created_at: new Date(now).toISOString()
      };

      return response.status(201).json({ link });
    }

    return response.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Link Handler Error:", error);
    return response.status(500).json({ error: error.message || "Internal server error" });
  }
}
