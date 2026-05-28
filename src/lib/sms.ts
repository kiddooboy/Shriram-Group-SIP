/**
 * SMS sender — uses Fast2SMS Quick route (no DLT, no website verification).
 * Returns `{ ok, dev, devMessage }` so callers can fall back gracefully when
 * the gateway is unavailable (e.g. no API key or insufficient balance).
 */
export interface SendSMSResult {
  ok: boolean
  /** True when SMS was not actually sent — caller may want to expose content via dev fallback. */
  dev: boolean
  /** The message content (kept for dev fallback / logs). */
  devMessage: string
  /** Underlying provider response, when available. */
  providerResponse?: unknown
}

export async function sendSMS(mobile: string, message: string): Promise<SendSMSResult> {
  const apiKey = process.env.FAST2SMS_API_KEY

  if (!apiKey) {
    console.log(`[SMS] *** DEV MODE — message to +91${mobile}: ${message}`)
    return { ok: false, dev: true, devMessage: message }
  }

  try {
    const url =
      `https://www.fast2sms.com/dev/bulkV2?authorization=${apiKey}` +
      `&route=q&message=${encodeURIComponent(message)}` +
      `&flash=0&numbers=${mobile}`

    const res  = await fetch(url, { method: 'GET' })
    const data = await res.json()

    if (data?.return) {
      console.log(`[SMS] sent to +91${mobile}`)
      return { ok: true, dev: false, devMessage: message, providerResponse: data }
    }

    console.error('[SMS] Fast2SMS error:', JSON.stringify(data))
    return { ok: false, dev: true, devMessage: message, providerResponse: data }
  } catch (e) {
    console.error('[SMS] Fast2SMS request failed:', e)
    return { ok: false, dev: true, devMessage: message }
  }
}
