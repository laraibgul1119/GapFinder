<h1 align="center">GapFinder 🎓</h1>

GapFinder helps teachers analyze quiz data to identify learning gaps and generate differentiated re-teaching plans in under 90 seconds.

## What it does ✅

- Uploads a quiz CSV and normalizes headers
- Analyzes results to identify the top learning gaps
- Generates tiered re-teaching activities for struggling, on-track, and advanced learners
- Exports an approved plan to copy or print

## Tech stack 🧰

- Frontend: React 18, Vite, Tailwind CSS
- Backend: Node.js, Express, Elasticsearch, Gemini via Google GenAI SDK

## Project structure 🗂️

- src/ - React app
- backend/ - Express API server
- public/ - Static assets

## Prerequisites 📦

- Node.js 18+ (recommended)
- An Elasticsearch deployment and API key
- Gemini API key

## Environment setup 🔐

Create backend/.env with the following values:

```
PORT=3001
GEMINI_API_KEY=your_gemini_key
ELASTIC_URL=https://your-elastic-host
ELASTIC_API_KEY=your_elastic_api_key
```

## Run locally 🚀

### 1) Frontend

```
cd GapFinder
npm install
npm run dev
```

Open the URL shown in the terminal (usually http://localhost:5173).

### 2) Backend

```
cd GapFinder\backend
npm install
npm start
```

The API runs on http://localhost:3001.

## Build and preview (frontend) 🧪

```
npm run build
npm run preview
```

## Screens 🧭

1. Upload - CSV drag-and-drop or paste, plus class and subject
2. Analyze - Status steps with progress
3. Results - Gap cards with differentiated activities
4. Export - Approved plan, copy, PDF print, start over

## Notes 📝

- The frontend expects the backend at http://localhost:3001.
- Upload accepts CSV with flexible header names (student name, question id, answers, score, topic).

## Troubleshooting 🧯

- If the frontend fails to start, make sure you are in the same folder that contains package.json.
- If the backend returns 500, verify your .env keys and Elasticsearch access.

## License 📄

See LICENSE.
