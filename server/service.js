import { PDFParse } from 'pdf-parse'
import { getData } from 'pdf-parse/worker'

// Load the PDF worker inline so it is found on serverless hosts like Vercel.
PDFParse.setWorker(getData())

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message)
    this.status = status
    this.code = code
  }
}

export async function extractPdfText(buffer) {
  // The mimetype comes from the client, so also check the file really is a PDF.
  if (buffer.subarray(0, 5).toString() !== '%PDF-') {
    throw new ApiError(415, 'INVALID_FILE_TYPE', 'The file is not a valid PDF.')
  }

  const parser = new PDFParse({ data: buffer })
  let result
  try {
    result = await parser.getText()
  } catch (err) {
    if (err?.name === 'PasswordException') {
      throw new ApiError(422, 'PDF_PASSWORD_PROTECTED', 'The PDF is password protected.')
    }
    throw new ApiError(422, 'PDF_PARSE_FAILED', 'Could not read the PDF. It may be corrupted.')
  } finally {
    await parser.destroy()
  }

  const text = (result.text || '').replace(/-- \d+ of \d+ --/g, '').trim()
  if (!text) {
    throw new ApiError(
      422,
      'NO_TEXT_FOUND',
      'No readable text found in the PDF. It may be a scanned image.'
    )
  }

  return { text, pages: result.total ?? result.pages?.length ?? null }
}

export async function processResume(file) {
  const { text, pages } = await extractPdfText(file.buffer)
  return {
    fileName: file.originalname,
    fileSize: file.size,
    pages,
    characterCount: text.length,
    text,
  }
}
