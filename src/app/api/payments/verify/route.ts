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

  try {
    const { searchParams } = new URL(req.url);
    const paymentId = searchParams.get("payment_id");

    if (!paymentId) {
      return NextResponse.json({ error: "Missing payment_id" }, { status: 400 });
    }

    // Find payment by internal ID or Vexutopia ID (using admin client)
    let localPayment = await getPaymentById(paymentId, supabaseAdmin);
    if (!localPayment) {
      localPayment = await getPaymentByVexutopiaId(paymentId, supabaseAdmin);
    }

    if (!localPayment) {
      console.log("Payment not found for ID:", paymentId);
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    console.log("Found payment:", localPayment.id, "status:", localPayment.status);

    // Already completed - return cached
    if (localPayment.status === "completed") {
      return NextResponse.json({
        id: localPayment.id,
        vexutopia_id: localPayment.vexutopia_id,
        status: "completed",
        amount: localPayment.amount,
        credits: localPayment.credits,
        already_processed: true,
      });
    }

    const apiKey = process.env.VEXUTOOPIA_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Service not configured" }, { status: 500 });
    }

    // Check status from Vexutopia
    const vexPayment = await getPayment(apiKey, localPayment.vexutopia_id);
    console.log("Vexutopia payment status:", vexPayment.status);

    // Update status based on Vexutopia response
    if (vexPayment.status === "completed" && localPayment.status === "pending") {
      // Get user and add credits (using admin client)
      const { data: userData } = await supabaseAdmin
        .from("users")
        .select("credits")
        .eq("id", localPayment.user_id)
        .single();

      if (userData) {
        const newCredits = (userData.credits || 0) + localPayment.credits;
        console.log("Adding credits:", localPayment.credits, "to user", localPayment.user_id, ". Total:", newCredits);

        await supabaseAdmin
          .from("users")
          .update({ credits: newCredits })
          .eq("id", localPayment.user_id);
      }

      await completePayment(localPayment.vexutopia_id, supabaseAdmin);
      console.log(`Payment ${localPayment.vexutopia_id} completed. Added ${localPayment.credits} credits.`);
    } else if (vexPayment.status === "failed" && localPayment.status === "pending") {
      await updatePaymentInfo(localPayment.vexutopia_id, { status: "failed" }, supabaseAdmin);
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