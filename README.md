# ClipLink

A modern, fast, and lightweight URL shortener built with React, Vite, and Express serverless functions.

**Live Demo**: [https://cliplinkbyjsh.vercel.app/](https://cliplinkbyjsh.vercel.app/)

---

## Features

- **Instant Shortening**: Paste long URLs and generate short, shareable links.
- **Permanent Storage**: Powered by Vercel Redis (KV).
- **Click Analytics**: Tracks real-time link clicks.
- **Minimal UI**: Clean, responsive, and modern design.
- **Serverless Backend**: Fast, scalable, and cost-effective execution.

---

## Tech Stack

- **Frontend**: React + Vite + Vanilla CSS
- **Backend**: Express (Serverless Functions)
- **Database**: Vercel Redis
- **Deployment**: Vercel

---

## Setup & Deployment

### 1. Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### 2. Vercel Deployment
1. **Connect Repository**: Import this project into Vercel.
2. **Setup Storage**: Navigate to the **Storage** tab -> **Create** -> **Redis**.
3. **Connect Storage**: Connect the Redis database to the project (automatically sets `REDIS_URL`).
4. **Deploy**: Vercel automatically builds the frontend and serverless API functions.

---

## Project Structure

```text
├── src/           # React frontend application
├── api/           # Serverless functions for link management and redirection
├── index.html     # Frontend entry point
└── package.json   # Project dependencies and scripts
```

---

## License

MIT License
