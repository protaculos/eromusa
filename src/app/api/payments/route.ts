import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createPayment } from "@/services/vexutopiaApi";
import { createPaymentRecordWithClient } from "@/services/paymentService";
import { PRICING_PLANS, PlanId } from "@/lib/pricing-plans";

export async function POST(req: NextRequest) {
  try {
    // Create Supabase admin client (server-side, no cookies needed)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get auth token from request headers
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the user by the token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { plan_id } = body;

    if (!plan_id || !PRICING_PLANS[plan_id as PlanId]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const plan = PRICING_PLANS[plan_id as PlanId];
    const apiKey = process.env.VEXUTOOPIA_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Payment service not configured" },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.headers.get("origin") || "http://localhost:3000";

    // Create payment with Vexutopia
    console.log("Creating payment with Vexutopia...");
    let payment;
    try {
      payment = await createPayment(apiKey, {
        amount: plan.price.toFixed(2),
        currency: "USD",
        return_url: `${baseUrl}/pricing`,
        customer_email: user.email,
        webhook_url: `${baseUrl}/api/webhooks/vexutopia`,
        metadata: {
          user_id: user.id,
          plan_id: plan.id,
        },
      });
      console.log("Vexutopia payment created:", payment);
    } catch (vexError) {
      console.error("Vexutopia API error:", vexError);
      return NextResponse.json(
        { error: "Failed to create payment with payment provider", details: String(vexError) },
        { status: 500 }
      );
    }

    // Save payment record to database (using admin client to bypass RLS)
    console.log("Saving payment record to database...");
    const paymentRecord = await createPaymentRecordWithClient(supabaseAdmin, {
      userId: user.id,
      vexutopiaId: payment.id,
      planId: plan.id,
      planName: plan.name,
      amount: plan.price,
      credits: plan.credits,
    });

    if (!paymentRecord) {
      console.error("Failed to save payment record - see logs above");
      return NextResponse.json(
        { error: "Failed to save payment record" },
        { status: 500 }
      );
    }

    console.log("Payment record saved successfully:", paymentRecord);

    return NextResponse.json({
      success: true,
      checkout_url: payment.checkout_url,
      payment_id: payment.id,
      internal_id: paymentRecord.id,
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}