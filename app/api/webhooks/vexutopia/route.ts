import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Initialize Supabase admin client for webhook processing
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

/**
 * Verify Vexutopia webhook signature
 *
 * Header format: t={timestamp},v1={hex_signature}
 * Signed payload: {timestamp}.{rawBody}
 * Secret: VEX_WEBHOOK_SECRET env var
 */
function verifyWebhookSignature(
  rawBody: string,
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

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${t}.${rawBody}`)
    .digest('hex')

  // Constant-time comparison
  return expected.length === v1.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1))
}

export async function POST(request: NextRequest) {
  try {
    const secret = process.env.VEX_WEBHOOK_SECRET

    if (!secret) {
      console.error('VEX_WEBHOOK_SECRET is not configured')
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    const signatureHeader = request.headers.get('X-Vexutopia-Signature') || ''
    const rawBody = await request.text()

    // Verify signature
    if (!verifyWebhookSignature(rawBody, signatureHeader, secret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(rawBody)

    // Validate required fields
    if (!payload.event || !payload.id || !payload.status) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const {
      event,
      id: transactionId,
      status,
      amount,
      currency,
      payment_method,
      failure_code,
      metadata,
      livemode
    } = payload

    console.log('[VEXUTOPIA WEBHOOK] Received:', JSON.stringify({
      event,
      transactionId,
      status,
      amount,
      currency,
      payment_method,
      livemode,
      metadata
    }, null, 2))

    // Process event types
    switch (event) {
      case 'payment.completed':
        await handlePaymentCompleted(transactionId, payload)
        break

      case 'payment.failed':
        await handlePaymentFailed(transactionId, payload)
        break

      case 'payment.cancelled':
        await handlePaymentCancelled(transactionId, payload)
        break

      case 'payment.refunded':
        await handlePaymentRefunded(transactionId, payload)
        break

      default:
        console.warn('Unhandled Vexutopia event:', event)
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('Error processing Vexutopia webhook:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Handle successful payment completion
 * Update order status and deliver credits
 */
async function handlePaymentCompleted(transactionId: string, payload: any) {
  const { metadata, amount, currency, payment_method } = payload
  const orderId = metadata?.order_id || transactionId
  const userId = metadata?.user_id
  const credits = metadata?.credits ? parseInt(metadata.credits, 10) : 0

  // Update order status in database
  const { error: orderError } = await supabase
    .from('orders')
    .upsert({
      id: orderId,
      transaction_id: transactionId,
      status: 'completed',
      amount,
      currency,
      payment_method,
      user_id: userId || null,
      credits,
      metadata,
      updated_at: new Date().toISOString(),
      completed_at: new Date().toISOString()
    }, { onConflict: 'id' })

  if (orderError) {
    console.error('Failed to update order:', orderError)
    throw orderError
  }

  // Add credits to user's balance if user_id is present
  if (userId && credits > 0) {
    console.log('[VEXUTOPIA WEBHOOK] Adding credits:', JSON.stringify({ userId, credits, orderId }))

    const { error: creditError } = await supabase.rpc('add_credits', {
      user_uuid: userId,
      amount: credits,
      reference_id: orderId,
      description: `Purchase via ${payment_method || 'vexutopia'}`
    })

    if (creditError) {
      console.error('[VEXUTOPIA WEBHOOK] Failed to add credits:', JSON.stringify({
        error: creditError.message,
        details: creditError.details,
        hint: creditError.hint
      }))
      throw creditError
    }

    console.log('[VEXUTOPIA WEBHOOK] Credits delivered successfully')
  } else {
    console.log('[VEXUTOPIA WEBHOOK] No credits to add (userId or credits missing)')
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(transactionId: string, payload: any) {
  const { metadata, amount, currency, payment_method, failure_code, failure_reason } = payload
  const orderId = metadata?.order_id || transactionId
  const userId = metadata?.user_id

  const { error } = await supabase
    .from('orders')
    .upsert({
      id: orderId,
      transaction_id: transactionId,
      status: 'failed',
      amount,
      currency,
      payment_method,
      user_id: userId || null,
      failure_code: failure_code || null,
      failure_reason: failure_reason || null,
      metadata,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' })

  if (error) {
    console.error('Failed to update failed order:', error)
    throw error
  }

  console.log('Payment failed recorded:', { orderId, failure_code })
}

/**
 * Handle cancelled payment
 */
async function handlePaymentCancelled(transactionId: string, payload: any) {
  const { metadata, amount, currency, payment_method } = payload
  const orderId = metadata?.order_id || transactionId
  const userId = metadata?.user_id

  const { error } = await supabase
    .from('orders')
    .upsert({
      id: orderId,
      transaction_id: transactionId,
      status: 'cancelled',
      amount,
      currency,
      payment_method,
      user_id: userId || null,
      metadata,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' })

  if (error) {
    console.error('Failed to update cancelled order:', error)
    throw error
  }

  console.log('Payment cancelled recorded:', { orderId })
}

/**
 * Handle refunded payment
 * Revoke any delivered credits or digital goods
 */
async function handlePaymentRefunded(transactionId: string, payload: any) {
  const { metadata, amount, currency, payment_method } = payload
  const orderId = metadata?.order_id || transactionId
  const userId = metadata?.user_id

  // Mark order as refunded
  const { error: orderError } = await supabase
    .from('orders')
    .upsert({
      id: orderId,
      transaction_id: transactionId,
      status: 'refunded',
      amount,
      currency,
      payment_method,
      user_id: userId || null,
      metadata,
      updated_at: new Date().toISOString(),
      refunded_at: new Date().toISOString()
    }, { onConflict: 'id' })

  if (orderError) {
    console.error('Failed to update refunded order:', orderError)
    throw orderError
  }

  // Revoke credits if user_id and credits are present
  if (userId && metadata?.credits) {
    const credits = parseInt(metadata.credits, 10)
    const { error: creditError } = await supabase.rpc('deduct_credits', {
      user_uuid: userId,
      amount: credits,
      reference_id: orderId,
      description: `Refund / chargeback for order ${orderId}`
    })

    if (creditError) {
      console.error('Failed to revoke credits:', creditError)
      throw creditError
    }
  }

  console.log('Payment refunded processed:', { orderId, userId })
}
