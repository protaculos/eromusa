import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getPayment } from "@/services/vexutopiaApi";
import { completePayment, updatePaymentInfo } from "@/services/paymentService";

export async function POST(req: NextRequest) {
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
    // Parse request body
    let userId: string | null = null;
    let limit = 50;

    try {
      const body = await req.json().catch(() => ({}));
      userId = body.user_id || null;
      limit = body.limit || 50;
    } catch {
      // No body provided, reconcile all
    }

    // Get auth token if provided (for user-specific reconciliation)
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    // If token provided, verify user
    if (token) {
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      if (user) {
        userId = user.id;
      }
    }

    // Build query for pending payments
    let query = supabaseAdmin
      .from("payments")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(limit);

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data: pendingPayments, error: queryError } = await query;

    if (queryError) {
      return NextResponse.json(
        { error: "Failed to fetch pending payments" },
        { status: 500 }
      );
    }

    if (!pendingPayments || pendingPayments.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No pending payments found",
        processed: 0,
        payments: [],
      });
    }

    const apiKey = process.env.VEXUTOOPIA_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Payment service not configured" },
        { status: 500 }
      );
    }

    const results: Array<{
      vexutopia_id: string;
      status: string;
      credits_added: number;
      user_id: string;
      error?: string;
    }> = [];

    // Process each pending payment
    for (const payment of pendingPayments) {
      try {
        // Get current status from Vexutopia
        const vexPayment = await getPayment(apiKey, payment.vexutopia_id);

        if (vexPayment.status === "completed") {
          // Get user and add credits
          const { data: userData } = await supabaseAdmin
            .from("users")
            .select("credits")
            .eq("id", payment.user_id)
            .single();

          if (userData) {
            const newCredits = (userData.credits || 0) + payment.credits;

            await supabaseAdmin
              .from("users")
              .update({ credits: newCredits })
              .eq("id", payment.user_id);

            results.push({
              vexutopia_id: payment.vexutopia_id,
              status: "completed",
              credits_added: payment.credits,
              user_id: payment.user_id,
            });
          } else {
            results.push({
              vexutopia_id: payment.vexutopia_id,
              status: "error",
              credits_added: 0,
              user_id: payment.user_id,
              error: "User not found",
            });
          }

          // Mark payment as completed
          await completePayment(payment.vexutopia_id, supabaseAdmin);
        } else if (vexPayment.status === "failed") {
          await updatePaymentInfo(
            payment.vexutopia_id,
            { status: "failed" },
            supabaseAdmin
          );
          results.push({
            vexutopia_id: payment.vexutopia_id,
            status: "failed",
            credits_added: 0,
            user_id: payment.user_id,
          });
        } else if (vexPayment.payment_method) {
          // Update payment method if available
          await updatePaymentInfo(
            payment.vexutopia_id,
            { payment_method: vexPayment.payment_method },
            supabaseAdmin
          );
          results.push({
            vexutopia_id: payment.vexutopia_id,
            status: vexPayment.status,
            credits_added: 0,
            user_id: payment.user_id,
          });
        } else {
          results.push({
            vexutopia_id: payment.vexutopia_id,
            status: vexPayment.status,
            credits_added: 0,
            user_id: payment.user_id,
          });
        }
      } catch (paymentError) {
        results.push({
          vexutopia_id: payment.vexutopia_id,
          status: "error",
          credits_added: 0,
          user_id: payment.user_id,
          error: String(paymentError),
        });
      }
    }

    const processed = results.filter(
      (r) => r.status === "completed" && r.credits_added > 0
    ).length;

    return NextResponse.json({
      success: true,
      total_pending: pendingPayments.length,
      processed,
      payments: results,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to reconcile payments" },
      { status: 500 }
    );
  }
}

// Also expose GET for simple status check
export async function GET() {
  return NextResponse.json({
    message: "POST to this endpoint to reconcile pending payments",
    body_params: {
      user_id: "optional - filter by specific user",
      limit: "optional - max payments to check (default: 50)",
    },
  });
}