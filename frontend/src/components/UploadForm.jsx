import { useRef, useState } from 'react'

export const MAX_SIZE_MB = 5
export const JD_MIN_LENGTH = 50
export const JD_MAX_LENGTH = 15000

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function validateFile(file) {
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
  if (!isPdf) return 'Only PDF files are allowed.'
  if (file.size > MAX_SIZE_MB * 1024 * 1024) return `File is too large. Max size is ${MAX_SIZE_MB} MB.`
  return ''
}

export default function UploadForm({ onSubmit, loading, serverError }) {
  const [file, setFile] = useState(null)
  const [fileError, setFileError] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef(null)

  const jdLength = jobDescription.trim().length
  const jdError =
    jdLength > JD_MAX_LENGTH
      ? `Keep the job description under ${JD_MAX_LENGTH.toLocaleString()} characters.`
      : ''
  const canSubmit = file && jdLength >= JD_MIN_LENGTH && !jdError && !loading

  const handleFile = (selected) => {
    if (!selected) return
    const error = validateFile(selected)
    setFileError(error)
    setFile(error ? null : selected)
    if (error && inputRef.current) inputRef.current.value = ''
  }

  const removeFile = () => {
    setFile(null)
    setFileError('')
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (canSubmit) onSubmit(file, jobDescription.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6 text-left">
      <div className="grid gap-6 lg:grid-cols-2">
      <div className="flex flex-col">
        <label className="mb-2 block text-sm font-semibold text-slate-200">
          1. Upload your resume <span className="font-normal text-slate-400">(PDF)</span>
        </label>
        {file ? (
          <div className="flex items-center justify-between rounded-2xl border border-slate-700 bg-white/5 p-4">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-indigo-500/20 text-xs font-bold text-indigo-300">
                PDF
              </div>
              <div className="overflow-hidden">
                <p className="truncate font-medium">{file.name}</p>
                <p className="text-sm text-slate-400">{formatSize(file.size)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={removeFile}
              disabled={loading}
              className="ml-4 shrink-0 text-sm text-slate-400 hover:text-red-400 disabled:opacity-40"
            >
              Remove
            </button>
          </div>
        ) : (
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setIsDragging(false)
              handleFile(e.dataTransfer.files[0])
            }}
            className={`flex flex-1 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition ${
              isDragging
                ? 'scale-[1.01] border-indigo-400 bg-indigo-500/20'
                : 'border-slate-600 bg-white/5 hover:border-indigo-400 hover:bg-white/10'
            }`}
          >
            <div className="mb-3 grid h-14 w-14 place-items-center rounded-full bg-indigo-500/20">
              <svg className="h-7 w-7 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
              </svg>
            </div>
            <p className="font-semibold">{isDragging ? 'Drop it here!' : 'Drag & drop your resume here'}</p>
            <p className="mt-1 text-sm text-slate-400">
              or <span className="text-indigo-300 underline">browse files</span> · PDF only, up to {MAX_SIZE_MB} MB
            </p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />
        {fileError && <p className="mt-2 text-sm text-red-400">{fileError}</p>}
      </div>

      <div className="flex flex-col">
        <label htmlFor="jd" className="mb-2 block text-sm font-semibold text-slate-200">
          2. Enter the job description <span className="font-normal text-slate-400">(required)</span>
        </label>
        <textarea
          id="jd"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          disabled={loading}
          rows={10}
          placeholder={'Paste or type the job description here, e.g.\n\nWe are hiring a Full Stack Developer…\nRequirements: React, Node.js, SQL, 3+ years of experience…'}
          className="min-h-56 w-full flex-1 resize-y rounded-2xl border border-slate-700 bg-white/5 p-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none disabled:opacity-60"
        />
        <div className="mt-1 flex justify-between text-xs">
          <span className="text-red-400">{jdError}</span>
          <span className={jdLength > 0 && jdLength < JD_MIN_LENGTH ? 'text-amber-400' : 'text-slate-500'}>
            {jdLength > 0 && jdLength < JD_MIN_LENGTH
              ? `${JD_MIN_LENGTH - jdLength} more characters needed`
              : `${jdLength.toLocaleString()} / ${JD_MAX_LENGTH.toLocaleString()}`}
          </span>
        </div>
      </div>
      </div>

      {serverError && (
        <div role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
          {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="flex w-full items-center justify-center gap-3 rounded-xl bg-indigo-500 py-4 text-lg font-semibold transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading && (
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        )}
        {loading ? 'Analyzing your resume…' : 'Get my score'}
      </button>
    </form>
  )
}
