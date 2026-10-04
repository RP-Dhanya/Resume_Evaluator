import multer from 'multer'
import { ApiError, processResume } from './service.js'

export const MAX_SIZE_MB = 5

// Keep uploads in memory: the file is parsed and discarded, never written to disk.
export const uploadResume = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024, files: 1 },
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
