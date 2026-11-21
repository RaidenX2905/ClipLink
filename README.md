<div align="center">

# ClipLink

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](#) [![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)](#) [![Redis](https://img.shields.io/badge/Redis-KV%20Store-DC382D?style=flat-square&logo=redis&logoColor=white)](#) [![Express](https://img.shields.io/badge/Express-Serverless-000000?style=flat-square&logo=express&logoColor=white)](#) [![Vercel](https://img.shields.io/badge/Vercel-Edge%20Ready-000000?style=flat-square&logo=vercel&logoColor=white)](#) [![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](#)

<p align="center">
  High-performance, lightweight URL shortener with zero-latency 3-character redirects, click analytics, and permanent key-value persistence.
</p>

</div>

---

**Live Demo**: [https://cliplinkbyjsh.vercel.app/](https://cliplinkbyjsh.vercel.app/)

---

## Features

- **Instant Shortening**: Generates ultra-short 3-character slugs.
- **Persistent Key-Value Storage**: Powered by Vercel Redis (KV).
- **Click Telemetry**: Real-time counter tracks link usage and redirect traffic.
- **Minimalist Aesthetic**: Dark theme with refined typography and zero clutter.
- **Dynamic Origin Resolution**: Automatically matches client origin without hardcoded host configurations.

---

## Setup & Deployment

### Local Development

```bash
npm install
npm run dev
```

### Vercel Deployment

1. Import repository into Vercel.
2. Under **Storage**, create and connect a **Redis** database (automatically populates `REDIS_URL`).
3. Deploy.

---

## Project Structure

```text
├── src/           # React frontend client
├── api/           # Serverless redirect & shortening functions
├── index.html     # Frontend entry point
└── package.json   # Dependencies and build scripts
```

---

## License

MIT License
