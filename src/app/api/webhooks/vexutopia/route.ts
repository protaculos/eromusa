import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { WebhookPayload, verifyWebhookSignature } from "@/services/vexutopiaApi";
import { getPaymentByVexutopiaId, completePayment } from "@/services/paymentService";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("X-Vexutopia-Signature") || "";
    const webhookSecret = process.env.VEXUTOOPIA_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return NextResponse.json({ error: "Server config error" }, { status: 500 });
    }

    if (!verifyWebhookSignature(webhookSecret, signature, rawBody)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload: WebhookPayload = JSON.parse(rawBody);

    switch (payload.event) {
      case "payment.completed":
        await handlePaymentCompleted(payload);
        break;
      case "payment.failed":
        break;
      case "payment.refunded":
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}

async function handlePaymentCompleted(payload: WebhookPayload) {
  try {
    // Create admin client to bypass RLS
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // 1. Find payment in our database to know which user gets the credits
    const localPayment = await getPaymentByVexutopiaId(payload.id, supabaseAdmin);

    if (!localPayment) {
      console.error(`[Webhook] Payment not found in local DB: ${payload.id}`);
      return;
    }

    if (localPayment.status !== "pending") {
      console.log(`[Webhook] Payment ${payload.id} already processed (status: ${localPayment.status}). Skipping.`);
      return;
    }

    // 2. Fetch current credits (Source of Truth)
    const { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .select("credits")
      .eq("id", localPayment.user_id)
      .maybeSingle();

    if (userError) {
      console.error(`[Webhook] Error fetching user ${localPayment.user_id} for credits:`, userError);
      return;
    }

    // 3. Calculate new balance (Current + Purchased)
    const currentBalance = userData?.credits || 0;
    const addedCredits = localPayment.credits || 0;
    const newBalance = currentBalance + addedCredits;

    console.log(`[Webhook] Adding credits to user ${localPayment.user_id}: ${currentBalance} + ${addedCredits} = ${newBalance}`);

    // 4. Update balance in database
    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({ credits: newBalance })
      .eq("id", localPayment.user_id);

    if (updateError) {
      console.error(`[Webhook] Error updating credits for user ${localPayment.user_id}:`, updateError);
      return;
    }

    // 5. Mark payment as completed
    await completePayment(payload.id, supabaseAdmin);
    console.log(`[Webhook] Successfully processed payment ${payload.id} and added ${addedCredits} credits.`);

  } catch (error) {
    console.error("[Webhook] Critical error in handlePaymentCompleted:", error);
  }
}
