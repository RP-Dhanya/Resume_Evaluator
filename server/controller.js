import multer from 'multer'
import { ApiError, processResume, scoreResume } from './service.js'

export const MAX_SIZE_MB = 5
const JD_MIN_LENGTH = 50
const JD_MAX_LENGTH = 15000

// Keep uploads in memory: the file is parsed and discarded, never written to disk.
export const uploadResume = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024, files: 1, fields: 5 },
  fileFilter: (req, file, cb) => {
    const isPdf =
      file.mimetype === 'application/pdf' && file.originalname.toLowerCase().endsWith('.pdf')
    if (!isPdf) {
      return cb(new ApiError(415, 'INVALID_FILE_TYPE', 'Only PDF files are allowed.'))
    }
    cb(null, true)
  },
}).single('resume')

export function healthCheck(req, res) {
  res.json({ success: true, status: 'ok' })
}

export async function handleResumeUpload(req, res) {
  if (!req.file) {
    throw new ApiError(400, 'NO_FILE', 'No file uploaded. Send a PDF in the "resume" field.')
  }

  const resume = await processResume(req.file)

  res.json({
    success: true,
    message: 'Resume content extracted successfully.',
    data: resume,
  })
}

export async function handleResumeScore(req, res) {
  if (!req.file) {
    throw new ApiError(400, 'NO_FILE', 'No file uploaded. Send a PDF in the "resume" field.')
  }

  const jobDescription = (req.body?.jobDescription || '').trim()
  if (!jobDescription) {
    throw new ApiError(400, 'JD_REQUIRED', 'Please provide a job description.')
  }
  if (jobDescription.length < JD_MIN_LENGTH) {
    throw new ApiError(
      400,
      'JD_TOO_SHORT',
      `The job description is too short. Paste at least ${JD_MIN_LENGTH} characters.`
    )
  }
  if (jobDescription.length > JD_MAX_LENGTH) {
    throw new ApiError(
      400,
      'JD_TOO_LONG',
      `The job description is too long. Keep it under ${JD_MAX_LENGTH.toLocaleString()} characters.`
    )
  }

  const result = await scoreResume(req.file, jobDescription)

  res.json({
    success: true,
    message: 'Resume scored successfully.',
    data: result,
  })
}
