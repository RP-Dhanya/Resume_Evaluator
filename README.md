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

| Category | Points |
|---|---|
| Job description match (skills and keywords) | 45 |
| Impact & achievements (numbers, action verbs) | 20 |
| Resume structure (Experience, Skills, Education, Summary/Projects) | 15 |
| Contact details (email, phone, LinkedIn/GitHub) | 10 |
| Length (400–900 words is ideal) | 10 |

## Deploy

Import the repo on Vercel with the root directory left as the repo root. `vercel.json` builds the frontend and serves the API from `/api`.
Note: Vercel limits request bodies to 4.5 MB.
