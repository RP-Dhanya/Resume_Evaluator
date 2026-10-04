import { useRef, useState } from 'react'

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
const MAX_SIZE_MB = 5

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function App() {
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef(null)

  const handleFile = (selected) => {
    if (!selected) return
    if (!ACCEPTED_TYPES.includes(selected.type)) {
      setError('Please upload a PDF or Word document (.pdf, .doc, .docx).')
      setFile(null)
      return
    }
    if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File is too large. Max size is ${MAX_SIZE_MB} MB.`)
      setFile(null)
      return
    }
    setError('')
    setFile(selected)
  }

  const onDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  const removeFile = () => {
    setFile(null)
    setError('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 text-xl font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-500">R</span>
          ResumeScore
        </div>
        <a href="#upload" className="text-sm text-slate-300 hover:text-white">
          Get started
        </a>
      </nav>

      <main className="mx-auto flex max-w-4xl flex-col items-center px-6 pt-12 pb-24 text-center">
        <span className="mb-6 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-1 text-sm text-indigo-300">
          Free resume analysis
        </span>

        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
          Hey{' '}
          <span role="img" aria-label="wave">
            👋
          </span>
        </h1>
        <h2 className="mt-4 bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-3xl font-bold text-transparent sm:text-5xl">
          Get your resume reviewed and get a score
        </h2>
        <p className="mt-6 max-w-2xl text-lg text-slate-300">
          Drop your resume below to see how it stacks up. Get a score and clear, actionable
          feedback to help you land more interviews.
        </p>

        <section id="upload" className="mt-12 w-full max-w-2xl">
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
            onDrop={onDrop}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-12 transition ${
              isDragging
                ? 'scale-[1.02] border-indigo-400 bg-indigo-500/20'
                : 'border-slate-600 bg-white/5 hover:border-indigo-400 hover:bg-white/10'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
            />
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-indigo-500/20">
              <svg className="h-8 w-8 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
              </svg>
            </div>
            <p className="text-lg font-semibold">
              {isDragging ? 'Drop it here!' : 'Drag & drop your resume here'}
            </p>
            <p className="mt-2 text-sm text-slate-400">
              or <span className="text-indigo-300 underline">browse files</span> · PDF, DOC, DOCX up to {MAX_SIZE_MB} MB
            </p>
          </div>

          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

          {file && (
            <div className="mt-6 flex items-center justify-between rounded-xl border border-slate-700 bg-white/5 p-4 text-left">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-indigo-500/20 text-xs font-bold text-indigo-300">
                  {file.name.split('.').pop().toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="truncate font-medium">{file.name}</p>
                  <p className="text-sm text-slate-400">{formatSize(file.size)}</p>
                </div>
              </div>
              <button onClick={removeFile} className="ml-4 text-sm text-slate-400 hover:text-red-400">
                Remove
              </button>
            </div>
          )}

          <button
            disabled={!file}
            className="mt-6 w-full rounded-xl bg-indigo-500 py-4 text-lg font-semibold transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Get my score
          </button>
        </section>

        <div className="mt-20 grid w-full gap-6 sm:grid-cols-3">
          {[
            { title: 'Instant score', text: 'See how your resume rates on a 0–100 scale.' },
            { title: 'Smart feedback', text: 'Find out what to fix in formatting, keywords and impact.' },
            { title: 'Private', text: 'Your resume stays yours. Nothing is shared.' },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-slate-800 bg-white/5 p-6 text-left">
              <h3 className="font-semibold text-indigo-300">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{f.text}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
