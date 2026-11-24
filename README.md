<p align="center">
  <img src="public/android-chrome-512x512.png" alt="ClipLink Brand Mark" width="128" height="128">
</p>

<div align="center">

# ClipLink

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](#) [![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)](#) [![Redis](https://img.shields.io/badge/Redis-Storage%20Optimized-DC382D?style=flat-square&logo=redis&logoColor=white)](#) [![Vercel](https://img.shields.io/badge/Vercel-Serverless-000000?style=flat-square&logo=vercel&logoColor=white)](#) [![Capacity](https://img.shields.io/badge/Capacity-214k+%20URLs%20%2F%2030MB-brightgreen?style=flat-square)](#) [![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](#)

<p align="center">
  High-performance, storage-optimized URL shortener with sub-millisecond redirects, collision-safe Base62 slugs, and automatic 30 MB free-tier storage governance.
</p>

</div>

---

**Live Demo**: [https://cliplinkbyjsh.vercel.app/](https://cliplinkbyjsh.vercel.app/)

---

## Performance & Storage Optimization

ClipLink's backend is specifically optimized for high concurrency and maximum storage efficiency within free-tier cloud limits:

- **2.3x Storage Capacity**: Custom delimited binary serialization (`clicks|created_ms|url`) reduces stored payload size by **61.7%**, increasing 30 MB Redis capacity from **~92,500** to **~214,000+ shortened URLs**.
- **916M+ Namespace & Collision Safety**: Base62 (`[0-9a-zA-Z]`) 5-character short-code generator with atomic `SET key val NX` check-and-set loops prevents race conditions and key collisions.
- **Instant Non-Blocking Redirects**: Serves HTTP 307 redirects immediately; click counters update asynchronously in the background.
- **Non-Blocking Querying**: Employs cursor-based `SCAN` and batched `MGET` pipelines instead of blocking `KEYS` operations.
- **Automated Free-Tier Guard**: Preemptive memory monitoring and automatic database flush when reaching 28 MB to maintain permanent free-tier uptime without manual intervention.
- **100% Backward Compatibility**: Dynamically parses both legacy JSON format and new compact delimited format.

---

## Features

- **Instant URL Shortening**: Compact 5-character shareable links.
- **Click Telemetry**: Real-time click counting for analytics.
- **Dynamic Origin Resolution**: Client automatically detects active origin without hardcoded host URLs.
- **Zero-Bloat Architecture**: Lean serverless handlers running on Vercel Edge/Serverless Functions.
- **Minimalist Interface**: Refined dark theme UI built with React 19.

---

## Setup & Deployment

### Local Development

```bash
npm install
npm run dev
```

### Vercel Deployment

1. Import this repository into [Vercel](https://vercel.com).
2. Under **Storage**, create and connect a **Redis** (Upstash) database.
3. Deploy. Vercel automatically populates `REDIS_URL` and builds the client into `/dist`.

---

## Project Structure

```text
├── src/           # React frontend application
├── api/           # Optimized serverless functions & Redis singleton
│   ├── _redis.js  # Connection reuse, codec, and auto-purge guard
│   ├── links.js   # Link creation and batch retrieval
│   └── r.js       # Fast non-blocking redirect handler
├── index.html     # Frontend entry point
└── package.json   # Minimal production dependencies
```

---

## License

MIT License
