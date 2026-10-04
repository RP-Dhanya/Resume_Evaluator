const STATUS_MESSAGES = {
  413: 'File is too large. Max size is 5 MB.',
  500: 'Something went wrong on the server. Please try again.',
  502: 'The server is not reachable right now. Please try again.',
  504: 'The server took too long to respond. Please try again.',
}

export async function scoreResume(file, jobDescription) {
  const body = new FormData()
  body.append('resume', file)
  body.append('jobDescription', jobDescription)

  let res
  try {
    res = await fetch('/api/resume/score', {
      method: 'POST',
      body,
      // AI scoring can take a while; give up after 60s instead of hanging forever.
      signal: AbortSignal.timeout(60000),
    })
  } catch (err) {
    throw new Error(
      err.name === 'TimeoutError'
        ? 'Scoring took too long. Please try again.'
        : 'Could not reach the server. Check your connection and try again.'
    )
  }

  let payload = null
  try {
    payload = await res.json()
  } catch {
    // Some errors (e.g. from a proxy or host) are not JSON.
  }

  if (!res.ok || !payload?.success) {
    throw new Error(
      payload?.error?.message ||
        STATUS_MESSAGES[res.status] ||
        `Request failed (${res.status}). Please try again.`
    )
  }

  return payload.data
}
