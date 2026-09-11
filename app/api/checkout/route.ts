import { NextRequest, NextResponse } from 'next/server'
import { createPayment } from '@/lib/vexutopia'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase admin client for authenticated session verification
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export async function POST(request: NextRequest) {
  try {
    const { amount, currency, credits, email, userId, payment_method } = await request.json()

    // Validate request parameters
    if (!amount || !currency || !credits) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    const orderId = `order_${Math.random().toString(36).substring(2, 15)}`

    // Generate Vexutopia checkout session
    const payload = {
      amount: String(amount),
      currency,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://eromusa.com'}/creditos?status=success&order_id=${orderId}`,
      webhook_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://eromusa.com'}/api/webhooks/vexutopia`,
      customer_email: email || undefined,
      payment_method: payment_method || undefined,
      metadata: {
        order_id: orderId,
        user_id: userId || '',
        credits: String(credits),
        amount: String(amount),
        currency
      }
    }

    const payment = await createPayment(payload)

    // Save pending order to database
    const { error: orderError } = await supabase
      .from('orders')
      .insert({
        id: orderId,
        transaction_id: payment.id,
        status: 'pending',
        amount: String(amount),
        currency,
        payment_method: payment_method || 'vexutopia',
        user_id: userId || null,
        credits: parseInt(credits, 10),
        metadata: payload.metadata,
        created_at: new Date().toISOString()
      })

    if (orderError) {
      console.error('Failed to create pending order record:', orderError)
      // Continue and return payment link even if database insert fails
    }

    return NextResponse.json({
      id: payment.id,
      checkout_url: payment.checkout_url,
      order_id: orderId
    })
  } catch (error: any) {
    console.error('Checkout API error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
