# Sales Insight Automator

A full-stack web application that accepts CSV/XLSX sales data files, generates AI-powered analytical summaries using Groq (Llama 3.1), and delivers professional reports via email using Brevo.

Built as a placement assignment for **Rabbitt AI**.

---

## Live Demo

| Service  | URL |
|----------|-----|
| Frontend | https://rabbitt-sales-automator.vercel.app |
| Backend  | https://sales-insight-automator-api.onrender.com |
| API Docs | https://sales-insight-automator-api.onrender.com/api-docs |

> **Note:** Render free tier spins down after 15 min of inactivity. The first request after idle may take ~30s to respond while the server wakes up.

---

## Features

- **File Upload** — Drag-and-drop or click to upload `.csv` / `.xlsx` sales files (max 5MB)
- **AI Analysis** — Groq (Llama 3.1 8B) generates executive summaries, top regions, best categories, revenue insights, and recommendations
- **Email Delivery** — Professional HTML report sent to any email address via Brevo API
- **API Documentation** — Interactive Swagger UI at `/api-docs`
- **Rate Limiting** — 10 requests per 15 minutes per IP
- **Containerized** — Docker Compose spins up the full stack locally
- **CI/CD** — GitHub Actions validates builds and linting on every PR

---

## Engineer's Log — Architecture & Design Decisions

### Why Brevo over Resend / Nodemailer?
- **Nodemailer** uses SMTP, which is blocked on Render and Railway free tiers (port 465/587 restricted).
- **Resend** free tier only delivers to the signup email — unusable for a public-facing app without a custom domain.
- **Brevo** provides an HTTP-based API (no SMTP), allows sending to any email on the free tier (300/day), and requires zero domain setup.

### Why Groq over OpenAI?
- Groq offers **free API access** to Llama 3.1 8B with extremely fast inference (~500 tokens/sec).
- No credit card required. Ideal for a demo/assignment project.

### Why multer memoryStorage?
- Files are stored in RAM as buffers, parsed immediately, then discarded. No temp files on disk means no cleanup logic and no file system permissions issues on hosted environments.

### Docker Optimization
- **Backend Dockerfile**: `npm ci --only=production` skips devDependencies (eslint, nodemon), reducing image size.
- **Frontend Dockerfile**: Multi-stage build — Stage 1 (Node) builds the React app, Stage 2 (nginx:alpine) serves only the static `dist/` folder. Final image is ~30MB vs ~400MB if we shipped Node.
- **`.dockerignore`** files prevent `node_modules` and `.env` from being copied into images.
- **Layer caching**: `package.json` is copied before source code so `npm ci` only re-runs when dependencies change, not on every code edit.

### Endpoint Security — Layered Approach
1. **Helmet** — Automatically sets 11+ HTTP security headers (X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security, etc.)
2. **CORS** — Whitelisted to the frontend origin only. All other origins are rejected.
3. **Rate Limiting** — 10 requests per 15 minutes per IP using `express-rate-limit`. Behind a proxy (nginx/Render), `trust proxy` is set so real client IPs are used.
4. **Input Validation** — File type (.csv/.xlsx only), file size (5MB max), and email format are validated before any processing occurs. Uses `express-validator` for email and custom middleware for files.
5. **Global Error Handler** — In production, internal error messages and stack traces are hidden from API responses to prevent information leakage.
6. **No secrets in code** — All API keys loaded from environment variables via `dotenv`. `.gitignore` blocks `.env` files from being committed.

---

## Tech Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | React 18 + Vite |
| Backend    | Express.js (Node.js) |
| AI         | Groq API (Llama 3.1 8B Instant) |
| Email      | Brevo API (HTTP, no SMTP) |
| File Parse | multer + xlsx + csv-parse |
| Security   | helmet + cors + express-rate-limit + express-validator |
| Docs       | swagger-ui-express + swagger-jsdoc |
| DevOps     | Docker + Docker Compose + GitHub Actions |
| Hosting    | Vercel (frontend) + Render (backend) |

---

## Project Structure

```
rabbitt-sales-automator/
├── frontend/                  # React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── FileUpload.jsx # Drag-and-drop file input + email field
│   │   │   └── StatusMessage.jsx # Loading/success/error display
│   │   ├── App.jsx            # Main layout + API call logic
│   │   ├── main.jsx           # React entry point
│   │   └── index.css          # Global styles
│   ├── nginx.conf             # Production nginx config (Docker)
│   ├── Dockerfile             # Multi-stage: build + serve
│   └── package.json
│
├── backend/                   # Express.js API
│   ├── src/
│   │   ├── routes/upload.js   # POST /api/upload endpoint
│   │   ├── services/
│   │   │   ├── aiService.js   # Groq API → generate summary
│   │   │   ├── emailService.js # Brevo API → send email
│   │   │   └── fileParser.js  # CSV/XLSX → JSON array
│   │   ├── middleware/
│   │   │   ├── rateLimiter.js # 10 req / 15 min per IP
│   │   │   ├── validation.js  # File type + email validation
│   │   │   └── errorHandler.js # Global error handler
│   │   ├── config/swagger.js  # Swagger/OpenAPI config
│   │   └── app.js             # Express app setup
│   ├── Dockerfile             # Node 20 Alpine, production only
│   └── package.json
│
├── .github/workflows/ci.yml  # CI/CD pipeline (3 jobs)
├── docker-compose.yml         # Full stack: backend + frontend
├── .env.example               # All required env vars documented
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Docker & Docker Compose (for containerized run)

### API Keys (all free)

1. **Groq** — [console.groq.com/keys](https://console.groq.com/keys)
2. **Brevo** — [app.brevo.com/settings/keys/api](https://app.brevo.com/settings/keys/api)

### Option 1: Run with Docker (Recommended)

```bash
# 1. Clone the repo
git clone https://github.com/SHRESTHSHARMA10/rabbitt-sales-automator.git
cd rabbitt-sales-automator

# 2. Create .env from the example and fill in your keys
cp .env.example .env

# 3. Build and run
docker compose up --build

# 4. Open the app
# Frontend: http://localhost
# Backend:  http://localhost:5001
# API Docs: http://localhost:5001/api-docs
```

### Option 2: Run Locally (Without Docker)

```bash
# 1. Clone the repo
git clone https://github.com/SHRESTHSHARMA10/rabbitt-sales-automator.git
cd rabbitt-sales-automator

# 2. Setup backend
cd backend
cp ../.env.example .env    # then edit .env with your actual API keys
npm install
npm run dev                 # starts on http://localhost:5001

# 3. Setup frontend (in a NEW terminal)
cd frontend
echo "VITE_API_URL=http://localhost:5001" > .env
npm install
npm run dev                 # starts on http://localhost:5173

# 4. Open http://localhost:5173 in your browser
```

---

## API Endpoints

| Method | Endpoint       | Description |
|--------|----------------|-------------|
| POST   | `/api/upload`  | Upload a sales file + email to receive AI summary |
| GET    | `/health`      | Health check (returns `{ status: "ok" }`) |
| GET    | `/api-docs`    | Interactive Swagger API documentation |

### POST `/api/upload`

**Request:** `multipart/form-data`

| Field   | Type   | Required | Description |
|---------|--------|----------|-------------|
| `file`  | File   | Yes      | `.csv` or `.xlsx` file (max 5MB) |
| `email` | String | Yes      | Recipient email address |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Sales summary has been sent to your email!",
  "summary": "## Executive Summary\n..."
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Invalid file type: \".pdf\". Only .csv and .xlsx files are allowed."
}
```

---

## CI/CD Pipeline

GitHub Actions triggers on every Pull Request to `main` with 3 parallel jobs:

1. **Backend Lint & Validate** — `npm ci` → ESLint check → verifies server starts and `/health` responds
2. **Frontend Build & Validate** — `npm ci` → `npm run build` (ensures zero build errors)
3. **Docker Compose Build** — `docker compose build` (verifies both images build successfully)

All 3 jobs must pass before a PR can be merged.

---

## Environment Variables

See [`.env.example`](.env.example) for all required variables with descriptions.

| Variable | Service | Description |
|----------|---------|-------------|
| `PORT` | Backend | Server port (default: 5001) |
| `GROQ_API_KEY` | Backend | Groq API key for AI summaries |
| `BREVO_API_KEY` | Backend | Brevo API key for email delivery |
| `BREVO_SENDER_EMAIL` | Backend | Verified sender email in Brevo |
| `FRONTEND_URL` | Backend | Frontend origin for CORS |
| `NODE_ENV` | Backend | `development` or `production` |
| `VITE_API_URL` | Frontend | Backend API base URL |

---

## Email Note

Brevo free tier (300 emails/day) may occasionally deliver to spam folders since it uses shared sending IPs without custom domain authentication (SPF/DKIM). Adding a verified custom domain in the Brevo dashboard resolves this.
