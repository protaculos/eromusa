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
    console.log("Webhook received:", payload.event, payload.id);

    switch (payload.event) {
      case "payment.completed":
        await handlePaymentCompleted(payload);
        break;
      case "payment.failed":
        console.log(`Payment failed: ${payload.id}`);
        break;
      case "payment.refunded":
        console.log(`Payment refunded: ${payload.id}`);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}

async function handlePaymentCompleted(payload: WebhookPayload) {
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

  // Find payment in our database
  const localPayment = await getPaymentByVexutopiaId(payload.id, supabaseAdmin);

  if (!localPayment) {
    console.error("Payment not found in database:", payload.id);
    return;
  }

  if (localPayment.status !== "pending") {
    console.log("Payment already processed:", payload.id, localPayment.status);
    return;
  }

  // Add credits to user
  const { data: userData } = await supabaseAdmin
    .from("users")
    .select("credits")
    .eq("id", localPayment.user_id)
    .single();

  if (userData) {
    const newCredits = (userData.credits || 0) + localPayment.credits;
    console.log("Adding credits via webhook:", localPayment.credits, "to user", localPayment.user_id, ". Total:", newCredits);

    await supabaseAdmin
      .from("users")
      .update({ credits: newCredits })
      .eq("id", localPayment.user_id);
  }

  // Mark as completed
  await completePayment(payload.id, supabaseAdmin);
  console.log(`Webhook: Payment ${payload.id} completed. Added ${localPayment.credits} credits.`);
}