/**
 * Vexutopia Payment Gateway Client
 *
 * Documentation: https://vexutopia.com/docs
 * API Base URL: https://vexutopia.com/api/v1
 */

const VEXUTOPIA_BASE_URL = 'https://vexutopia.com/api/v1'

interface VexutopiaPaymentRequest {
  amount: string | number
  currency: string
  return_url: string
  customer_email?: string
  customer_name?: string
  metadata?: Record<string, string>
  webhook_url?: string
  direct?: boolean
  crypto?: boolean
  payment_method?: string
}

interface VexutopiaTelegramStarsRequest {
  amount: string | number
  currency: 'XTR' | 'USD'
  return_url: string
  customer_email?: string
  customer_name?: string
  customer_id?: string
  webhook_url?: string
  metadata?: Record<string, string>
  country?: string
}

interface VexutopiaPaymentResponse {
  id: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  amount: string
  currency: string
  checkout_url: string
  return_url?: string
  provider?: string
  customer_email?: string | null
  customer_name?: string | null
  failure_reason?: string | null
  metadata?: Record<string, string>
  created_at: string
  updated_at: string
  expires_at: string
  completed_at?: string | null
  // Telegram Stars specific
  telegram_invoice_url?: string
  stars?: number
}

interface VexutopiaWebhookPayload {
  event: 'payment.completed' | 'payment.failed' | 'payment.cancelled' | 'payment.refunded'
  id: string
  status: string
  amount: string
  currency: string
  timestamp: string
  livemode: boolean
  payment_method?: string
  failure_code?: string
  failure_reason?: string
  metadata?: Record<string, string>
  customer_email?: string
  customer_name?: string
}

/**
 * Create a payment session for standard checkout (fiat, card, on-ramp)
 */
export async function createPayment(
  body: VexutopiaPaymentRequest
): Promise<VexutopiaPaymentResponse> {
  const apiKey = process.env.VEXUTOPIA_API_KEY

  if (!apiKey) {
    throw new Error('VEXUTOPIA_API_KEY is not configured')
  }

  const response = await fetch(`${VEXUTOPIA_BASE_URL}/payments`, {
    method: 'POST',
    headers: {
      'X-API-Key': apiKey,
      'Content-Type': 'application/json',
      'User-Agent': 'EroMusa-Integration/1.0'
    },
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || `HTTP ${response.status}`)
  }

  return response.json()
}

/**
 * Create a Telegram Stars payment
 * NOTE: Requires LIVE API key (test keys are rejected)
 */
export async function createTelegramStarsPayment(
  body: VexutopiaTelegramStarsRequest
): Promise<VexutopiaPaymentResponse> {
  const apiKey = process.env.VEXUTOPIA_API_KEY

  if (!apiKey) {
    throw new Error('VEXUTOPIA_API_KEY is not configured')
  }

  // Telegram Stars requires LIVE key
  if (apiKey.startsWith('vex_test_')) {
    throw new Error('Telegram Stars requires a LIVE API key (vex_live_...)')
  }

  const response = await fetch(`${VEXUTOPIA_BASE_URL}/payments/telegram-stars`, {
    method: 'POST',
    headers: {
      'X-API-Key': apiKey,
      'Content-Type': 'application/json',
      'User-Agent': 'EroMusa-Integration/1.0'
    },
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || `HTTP ${response.status}`)
  }

  return response.json()
}

/**
 * Retrieve a payment by ID
 */
export async function getPayment(id: string): Promise<VexutopiaPaymentResponse> {
  const apiKey = process.env.VEXUTOPIA_API_KEY

  if (!apiKey) {
    throw new Error('VEXUTOPIA_API_KEY is not configured')
  }

  const response = await fetch(`${VEXUTOPIA_BASE_URL}/payments/${id}`, {
    method: 'GET',
    headers: {
      'X-API-Key': apiKey,
      'User-Agent': 'EroMusa-Integration/1.0'
    }
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || `HTTP ${response.status}`)
  }

  return response.json()
}

/**
 * Resend webhook for a completed payment
 */
export async function resendWebhook(id: string): Promise<{ ok: boolean; transaction_id: string; event: string }> {
  const apiKey = process.env.VEXUTOPIA_API_KEY

  if (!apiKey) {
    throw new Error('VEXUTOPIA_API_KEY is not configured')
  }

  const response = await fetch(`${VEXUTOPIA_BASE_URL}/payments/${id}/resend-webhook`, {
    method: 'POST',
    headers: {
      'X-API-Key': apiKey,
      'User-Agent': 'EroMusa-Integration/1.0'
    }
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || `HTTP ${response.status}`)
  }

  return response.json()
}

/**
 * Verify webhook signature
 *
 * The signature is sent in the X-Vexutopia-Signature header.
 * Format: t={timestamp},v1={hex_encoded_signature}
 *
 * The signature is computed as: HMAC-SHA256(secret, `{timestamp}.{rawRequestBody}`)
 */
export function verifyWebhookSignature(
  rawBody: string | Buffer,
  signatureHeader: string,
  secret: string
): boolean {
  const parts = Object.fromEntries(
    signatureHeader.split(',').map((kv) => {
      const [key, value] = kv.trim().split('=')
      return [key, value]
    })
  )

  const t = parts.t
  const v1 = parts.v1

  if (!t || !v1) {
    return false
  }

  // Replay window: reject anything older than 5 minutes
  const ageSec = Math.abs(Math.floor(Date.now() / 1000) - Number(t))
  if (!Number.isFinite(ageSec) || ageSec > 300) {
    return false
  }

  // Compute expected signature
  const bodyString = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8')
  const payload = `${t}.${bodyString}`

  // Node.js crypto
  if (typeof crypto !== 'undefined' && crypto.createHmac) {
    const expected = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')

    // Constant-time comparison
    return expected.length === v1.length &&
           crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1))
  }

  // Browser/edge runtime fallback (less secure)
  // Note: In edge runtimes, use a proper HMAC implementation
  return false
}

export type {
  VexutopiaPaymentRequest,
  VexutopiaTelegramStarsRequest,
  VexutopiaPaymentResponse,
  VexutopiaWebhookPayload
}
