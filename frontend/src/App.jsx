import { useState } from 'react'
import { scoreResume } from './api.js'
import UploadForm from './components/UploadForm.jsx'
import ScoreResult from './components/ScoreResult.jsx'

const FEATURES = [
  { title: 'Instant score', text: 'See how well your resume fits the role on a 0–100 scale.' },
  { title: 'Keyword match', text: 'Find out which skills from the job description you are missing.' },
  { title: 'Private', text: 'Your resume is analyzed in memory and never stored.' },
]

export default function App() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (file, jobDescription) => {
    setLoading(true)
    setError('')
    try {
      setResult(await scoreResume(file, jobDescription))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setResult(null)
    setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <button onClick={reset} className="flex items-center gap-2 text-xl font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-500">R</span>
          ResumeScore
        </button>
        {!result && (
          <a href="#upload" className="text-sm text-slate-300 hover:text-white">
            Get started
          </a>
        )}
      </nav>

      <main className="mx-auto flex max-w-3xl flex-col items-center px-6 pt-8 pb-24 text-center">
        {result ? (
          <>
            <h1 className="mb-8 text-3xl font-extrabold tracking-tight sm:text-4xl">Your resume score</h1>
            <ScoreResult result={result} onReset={reset} />
          </>
        ) : (
          <>
            <span className="mb-6 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-1 text-sm text-indigo-300">
              Free resume analysis
            </span>
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
              Hey{' '}
              <span role="img" aria-label="wave">
                👋
              </span>
            </h1>
            <h2 className="mt-4 bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text pb-2 text-3xl leading-tight font-bold text-transparent sm:text-5xl">
              Get your resume reviewed and get a score
            </h2>
            <p className="mt-6 max-w-2xl text-lg text-slate-300">
              Upload your resume and paste the job description. We'll score how well you match and show
              you exactly what to improve.
            </p>

            <section id="upload" className="mt-12 w-full rounded-3xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8">
              <UploadForm onSubmit={handleSubmit} loading={loading} serverError={error} />
            </section>

            <div className="mt-16 grid w-full gap-6 sm:grid-cols-3">
              {FEATURES.map((f) => (
                <div key={f.title} className="rounded-xl border border-slate-800 bg-white/5 p-6 text-left">
                  <h3 className="font-semibold text-indigo-300">{f.title}</h3>
                  <p className="mt-2 text-sm text-slate-400">{f.text}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
