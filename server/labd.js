// Minimal client for the labd chat API.
// labd keeps no memory between requests: send the whole conversation each time.

const LABD_URL = process.env.LABD_API_URL || 'https://agent.thedevlabs.io/v1/api/chat'
const TIMEOUT_MS = 25000

const STATUS_REASONS = {
  401: 'the API key is wrong or revoked',
  402: 'the labd allowance is used up',
  403: 'the labd API is switched off',
  429: 'too many requests this minute',
}

export class LabdError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

export function isLabdConfigured() {
  return Boolean(process.env.LABD_API_KEY)
}

/**
 * @param {{ role: 'user' | 'assistant', content: string }[]} messages ending on a user turn
 * @returns {Promise<string>} the reply text
 */
export async function labdChat(messages) {
  const key = process.env.LABD_API_KEY
  if (!key) throw new LabdError('LABD_API_KEY is not set')

  let res
  try {
    res = await fetch(LABD_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch (err) {
    const reason = err.name === 'TimeoutError' ? `timed out after ${TIMEOUT_MS / 1000}s` : err.message
    throw new LabdError(`labd request failed: ${reason}`)
  }

  const body = await res.json().catch(() => null)

  if (!res.ok) {
    const reason = STATUS_REASONS[res.status] || body?.message || 'unexpected error'
    throw new LabdError(`labd returned ${res.status}: ${reason}`, res.status)
  }

  const content = body?.message?.content
  if (typeof content !== 'string' || !content.trim()) {
    throw new LabdError('labd returned an empty reply')
  }

  const percentLeft = body?.credits?.percentLeft
  if (typeof percentLeft === 'number') {
    const log = percentLeft < 10 ? console.warn : console.log
    log(`labd: ${percentLeft}% of allowance left`)
  }

  return content
}
