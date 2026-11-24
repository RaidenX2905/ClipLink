import { getRedis, packLink, unpackLink } from "./_redis.js";

export default async function handler(request, response) {
  const { shortCode } = request.query;
  if (!shortCode) return response.status(400).send("No code");

  try {
    const redis = await getRedis();
    const redisKey = `link:${shortCode}`;

    // 1. Fetch link in 1 round trip
    const raw = await redis.get(redisKey);
    if (!raw) {
      return response.status(404).send("Link not found");
    }

    const link = unpackLink(shortCode, raw);
    if (!link || !link.original_url) {
      return response.status(404).send("Link not found");
    }

    // 2. Perform redirect with 307 Temporary Redirect and cache-control
    response.setHeader('Cache-Control', 'private, max-age=0, no-cache');
    response.redirect(307, link.original_url);

    // 3. Increment clicks without blocking the response
    // Uses compact packing to keep memory small while updating clicks
    const updatedClicks = link.clicks + 1;
    const updatedPacked = packLink(link.original_url, updatedClicks, link.created_at);

    // Write back updated clicks asynchronously
    redis.set(redisKey, updatedPacked).catch(err => {
      console.warn("Click counter update failed:", err.message);
    });

  } catch (error) {
    console.error("Redirect Handler Error:", error);
    return response.status(500).send("Server error");
  }
}
