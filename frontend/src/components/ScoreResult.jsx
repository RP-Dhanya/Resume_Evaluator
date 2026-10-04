function scoreColor(score) {
  if (score >= 80) return { text: 'text-emerald-400', stroke: '#34d399', bar: 'bg-emerald-400' }
  if (score >= 65) return { text: 'text-sky-400', stroke: '#38bdf8', bar: 'bg-sky-400' }
  if (score >= 45) return { text: 'text-amber-400', stroke: '#fbbf24', bar: 'bg-amber-400' }
  return { text: 'text-rose-400', stroke: '#fb7185', bar: 'bg-rose-400' }
}

function ScoreRing({ score }) {
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const color = scoreColor(score)
  return (
    <div className="relative h-44 w-44">
      <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
        <circle cx="80" cy="80" r={radius} fill="none" stroke="rgba(148,163,184,0.2)" strokeWidth="12" />
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke={color.stroke}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - score / 100)}
          className="transition-[stroke-dashoffset] duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-5xl font-extrabold ${color.text}`}>
          {score}
        </span>
        <span className="text-sm text-slate-400">out of 100</span>
      </div>
    </div>
  )
}

function KeywordChips({ title, items, tone }) {
  const styles =
    tone === 'good'
      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
      : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-300">
        {title} <span className="text-slate-500">({items.length})</span>
      </h4>
      {items.length ? (
        <div className="flex flex-wrap gap-2">
          {items.map((k) => (
            <span key={k} className={`rounded-full border px-3 py-1 text-xs font-medium ${styles}`}>
              {k}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">None</p>
      )}
    </div>
  )
}

export default function ScoreResult({ result, onReset }) {
  const color = scoreColor(result.score)

  return (
    <div className="w-full space-y-6 text-left">
      <div className="flex flex-col items-center gap-6 rounded-2xl border border-slate-800 bg-white/5 p-6 sm:flex-row sm:p-8">
        <ScoreRing score={result.score} />
        <div className="text-center sm:text-left">
          <p className={`text-2xl font-bold ${color.text}`}>{result.rating}</p>
          <p className="mt-2 text-slate-300">
            Your resume <span className="font-medium text-white">{result.resume.fileName}</span> matches{' '}
            {result.keywords.matched.length} of{' '}
            {result.keywords.matched.length + result.keywords.missing.length} key terms from the job
            description.
          </p>
          <button
            onClick={onReset}
            className="mt-5 rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium hover:border-indigo-400 hover:bg-white/5"
          >
            Score another resume
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-white/5 p-6">
        <h3 className="mb-5 text-lg font-semibold">Score breakdown</h3>
        <div className="space-y-5">
          {result.breakdown.map((item) => {
            const pct = Math.round((item.score / item.max) * 100)
            return (
              <div key={item.key}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-slate-400">
                    {item.score} / {item.max}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-700/60">
                  <div className={`h-full rounded-full ${scoreColor(pct).bar}`} style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-1 text-xs text-slate-400">{item.detail}</p>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid gap-6 rounded-2xl border border-slate-800 bg-white/5 p-6 sm:grid-cols-2">
        <KeywordChips title="Matched keywords" items={result.keywords.matched} tone="good" />
        <KeywordChips title="Missing keywords" items={result.keywords.missing} tone="bad" />
      </div>

      <div className="rounded-2xl border border-slate-800 bg-white/5 p-6">
        <h3 className="mb-4 text-lg font-semibold">How to improve</h3>
        <ul className="space-y-3">
          {result.suggestions.map((s) => (
            <li key={s} className="flex gap-3 text-sm text-slate-300">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
              {s}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
