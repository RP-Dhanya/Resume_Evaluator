# Resume_Evaluator

Upload a resume (PDF) and paste a job description to get a 0–100 match score, a score breakdown, matched and missing keywords, and suggestions to improve.

- **frontend/**: React + Tailwind CSS (Vite)
- **server/**: Node.js + Express API that extracts text from the PDF and scores it
- **api/**: Vercel serverless entry that runs the Express app

## Run locally

```bash
npm install            # installs concurrently (root)
npm run install:all    # installs frontend and server dependencies
npm run dev            # starts server (http://localhost:5000) and frontend (http://localhost:5173)
```

Open http://localhost:5173. In development, Vite forwards `/api` requests to the Express server.

## API

`POST /api/resume/score` (multipart/form-data)

| Field | Type | Rules |
|---|---|---|
| `resume` | file | PDF only, max 5 MB |
| `jobDescription` | text | 50–15,000 characters |

Success returns `{ success: true, data: { score, rating, breakdown, keywords, suggestions, resume } }`.
Errors return `{ success: false, error: { code, message } }`.

Other routes: `POST /api/resume/upload` (text extraction only) and `GET /api/health`.

## How the score works

Scoring uses the [labd](https://agent.thedevlabs.io) AI API when `LABD_API_KEY` is set in `server/.env`.
The server extracts the resume text, sends it with the job description to labd, and asks for a JSON score across:
Skills match (35), Experience relevance (20), Impact & results (15), Clarity (15) and ATS readability (15).
The server validates labd's reply, caps each category at its maximum and adds up the total itself.

If labd is not configured, fails (401/402/403/429, timeout, or an unusable reply), the server falls back to
built-in rules and the response includes `engine: "rules"` and a `notice`. AI results have `engine: "labd"`.

Built-in rules:

| Category | Points |
|---|---|
| Job description match (skills and keywords) | 40 |
| Impact & results (numbers, action verbs) | 20 |
| Clarity (sections, length, concise lines) | 20 |
| ATS readability (contact details, standard headings, clean text, 1–2 pages) | 20 |

The results page highlights Impact & results, Clarity and ATS readability as separate scores out of 100.

## Deploy

Import the repo on Vercel with the root directory left as the repo root. `vercel.json` builds the frontend and serves the API from `/api`.
Add `LABD_API_KEY` under Settings → Environment Variables.
Note: Vercel limits request bodies to 4.5 MB.
