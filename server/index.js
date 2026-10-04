import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { ApiError } from './service.js'
import { connectDB, isDbConfigured } from './db.js'
import {
  MAX_SIZE_MB,
  handleGetScore,
  handleListScores,
  handleResumeScore,
  handleResumeUpload,
  healthCheck,
  uploadResume,
} from './controller.js'

const PORT = process.env.PORT || 5000

const app = express()
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }))
app.use(express.json())

app.get('/api/health', healthCheck)
app.post('/api/resume/upload', uploadResume, handleResumeUpload)
app.post('/api/resume/score', uploadResume, handleResumeScore)
app.get('/api/scores', handleListScores)
app.get('/api/scores/:id', handleGetScore)

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.originalUrl} not found.` },
  })
})

// Every error, including multer's, is returned as JSON.
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? `File is too large. Max size is ${MAX_SIZE_MB} MB.`
        : err.code === 'LIMIT_UNEXPECTED_FILE'
          ? 'Unexpected field. Upload a single PDF in the "resume" field.'
          : err.message
    return res.status(status).json({ success: false, error: { code: err.code, message } })
  }

  if (err instanceof ApiError) {
    return res.status(err.status).json({
      success: false,
      error: { code: err.code, message: err.message },
    })
  }

  console.error(err)
  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong on the server.' },
  })
})

// Connect early so the first request is fast. A failure here is logged, not fatal:
// scoring still works and saving is retried on the next request.
if (isDbConfigured()) {
  connectDB().catch((err) => console.error(`MongoDB connection failed: ${err.message}`))
}

// On Vercel the app runs as a serverless function (see /api/index.js), so only listen locally.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
  })
}

export default app
