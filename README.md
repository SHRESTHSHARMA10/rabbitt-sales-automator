# Sales Insight Automator

A full-stack web application that accepts CSV/XLSX sales data files, generates AI-powered analytical summaries using Groq (Llama 3.1), and delivers professional reports via email using Brevo.

Built as a placement assignment for **Rabbitt AI**.

---

## Live Demo

| Service  | URL |
|----------|-----|
| Frontend | _[Add Vercel URL after deployment]_ |
| Backend  | _[Add Render URL after deployment]_ |
| API Docs | _[Add Render URL]/api-docs_ |

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

---

## Project Structure

```
rabbitt-sales-automator/
├── frontend/                  # React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── FileUpload.jsx
│   │   │   └── StatusMessage.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── nginx.conf
│   ├── Dockerfile
│   └── package.json
│
├── backend/                   # Express.js API
│   ├── src/
│   │   ├── routes/upload.js
│   │   ├── services/
│   │   │   ├── aiService.js
│   │   │   ├── emailService.js
│   │   │   └── fileParser.js
│   │   ├── middleware/
│   │   │   ├── rateLimiter.js
│   │   │   ├── validation.js
│   │   │   └── errorHandler.js
│   │   ├── config/swagger.js
│   │   └── app.js
│   ├── Dockerfile
│   └── package.json
│
├── .github/workflows/ci.yml  # CI/CD pipeline
├── docker-compose.yml
├── .env.example
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
git clone https://github.com/YOUR_USERNAME/rabbitt-sales-automator.git
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
git clone https://github.com/YOUR_USERNAME/rabbitt-sales-automator.git
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

**Response (200):**
```json
{
  "success": true,
  "message": "Sales summary has been sent to your email!",
  "summary": "## Executive Summary\n..."
}
```

---

## Security Measures

- **Helmet** — Sets secure HTTP headers (XSS protection, content-type sniffing prevention, etc.)
- **CORS** — Restricts API access to the frontend origin only
- **Rate Limiting** — 10 requests per 15 minutes per IP via `express-rate-limit`
- **Input Validation** — File type, file size, and email format validated via `express-validator`
- **Error Handling** — Global error handler hides internal errors in production mode
- **Environment Variables** — All secrets stored in `.env` files, never committed to git

---

## CI/CD Pipeline

GitHub Actions triggers on every Pull Request to `main`:

1. **Backend Lint & Validate** — Installs deps, runs ESLint, verifies server starts
2. **Frontend Build & Validate** — Installs deps, runs `npm run build`
3. **Docker Compose Build** — Verifies both Docker images build successfully

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
