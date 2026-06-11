# Church Voice — Scripture Recording Platform

A full-stack platform for recording, managing, and listening to scripture audio narration. Built with Next.js (frontend) and Express + MongoDB (backend).

## Project Structure

```
├── frontend/          Next.js 16 app (App Router)
│   ├── src/app/       Pages and routes
│   ├── src/components/UI and shared components
│   └── src/lib/       API client, auth context, utilities
├── backend/           Express + TypeScript API server
│   └── src/
│       ├── routes/    Auth, books, chapters, recordings, analytics
│       ├── models/    Mongoose schemas (User, Book, Recording)
│       ├── middleware/ JWT auth, Zod validation
│       └── utils/     R2 storage, error handling
├── docker-compose.yml MongoDB + Backend + Frontend
└── Dockerfile         Multi-stage frontend build
```

## Quick Start (Development)

### Prerequisites

- Node.js 20+
- MongoDB (local or Docker)

### Backend

```bash
cd backend
cp .env.example .env     # Configure MongoDB URI, JWT secret, R2 keys
npm install
npm run dev              # Starts on port 4000
```

### Frontend

```bash
cd frontend
npm install
npm run dev              # Starts on port 3000
```

Open [http://localhost:3000](http://localhost:3000).

## Production (Docker)

```bash
docker compose up --build
```

This starts:
- **MongoDB** on port 27017
- **Backend** (Express API) on port 4000
- **Frontend** (Next.js standalone) on port 3000

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Sign in (returns JWT) |
| GET | `/api/auth/me` | Yes | Current user profile |
| GET | `/api/books` | Yes | List user's books |
| POST | `/api/books` | Yes | Create book with chapters/verses |
| GET | `/api/books/:id` | Yes | Get book details |
| PATCH | `/api/books/:id` | Yes | Update book metadata |
| DELETE | `/api/books/:id` | Yes | Delete book |
| POST | `/api/recordings/:bookId/chapters/:chapterId/verses/:verseId` | Yes | Upload audio recording |
| GET | `/api/recordings/:bookId/chapters/:chapterId/verses/:verseId` | Yes | Get recording |
| GET | `/api/analytics` | Yes | Platform statistics |

## Audio Storage

Audio files are stored on **Cloudflare R2** (S3-compatible). Falls back to local-dev mode if R2 credentials aren't configured.

## Tech Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS 4, Framer Motion, Recharts
- **Backend:** Express, TypeScript, Mongoose, JWT, Zod
- **Database:** MongoDB
- **Storage:** Cloudflare R2 (S3)
- **Deployment:** Docker, docker-compose
