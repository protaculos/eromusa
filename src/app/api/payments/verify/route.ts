import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getPayment } from "@/services/vexutopiaApi";
import {
  getPaymentById,
  getPaymentByVexutopiaId,
  completePayment,
  updatePaymentInfo
} from "@/services/paymentService";

export async function GET(req: NextRequest) {
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

  const { searchParams } = new URL(req.url);
  const paymentId = searchParams.get("payment_id");

  if (!paymentId) {
    return NextResponse.json({ error: "Missing payment_id" }, { status: 400 });
  }

  try {
    // Try to find payment by internal ID first, then by vexutopia_id
    let localPayment = await getPaymentById(paymentId, supabaseAdmin);
    if (!localPayment) {
      localPayment = await getPaymentByVexutopiaId(paymentId, supabaseAdmin);
    }

    if (!localPayment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // If already completed, return immediately
    if (localPayment.status === "completed") {
      return NextResponse.json({
        id: localPayment.id,
        vexutopia_id: localPayment.vexutopia_id,
        status: "completed",
        amount: localPayment.amount,
        credits: localPayment.credits,
      });
    }

    // Check status with Vexutopia
    const vexApiKey = process.env.VEXUTOOPIA_API_KEY;
    if (!vexApiKey) {
      return NextResponse.json({ error: "Service not configured" }, { status: 500 });
    }
    const vexPayment = await getPayment(vexApiKey, localPayment.vexutopia_id);

    if (vexPayment.status === "completed") {
      // Credits already added by webhook, just mark as completed
      await completePayment(localPayment.vexutopia_id, supabaseAdmin);
    } else if (vexPayment.status === "failed" || vexPayment.status === "refunded") {
      await updatePaymentInfo(localPayment.vexutopia_id, { status: vexPayment.status }, supabaseAdmin);
    } else if (vexPayment.payment_method) {
      await updatePaymentInfo(localPayment.vexutopia_id, { payment_method: vexPayment.payment_method }, supabaseAdmin);
    }

    return NextResponse.json({
      id: localPayment.id,
      vexutopia_id: localPayment.vexutopia_id,
      status: vexPayment.status,
      amount: localPayment.amount,
      credits: localPayment.credits,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 });
  }
}
