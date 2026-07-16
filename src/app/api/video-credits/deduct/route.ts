import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Route: /api/video-credits/deduct
 * Purpose: Securely deduct credits from the user's balance for video generation.
 * Principle: Atomic-like operation. Check balance -> Deduct -> Save.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { credits_cost } = body;

    if (typeof credits_cost !== "number" || credits_cost <= 0) {
      return NextResponse.json({ error: "Invalid credits cost provided" }, { status: 400 });
    }

    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized: No token provided" }, { status: 401 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 1. Validate User Token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });
    }

    // 2. Get Current Balance (Source of Truth)
    const { data: userData, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("credits")
      .eq("id", user.id)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching user credits for deduction:", fetchError);
      return NextResponse.json({ error: "Database error while fetching balance" }, { status: 500 });
    }

    const currentCredits = userData?.credits || 0;

    // 3. Check for Sufficient Balance
    if (currentCredits < credits_cost) {
      return NextResponse.json({
        error: "Insufficient credits",
        current_credits: currentCredits,
        required: credits_cost
      }, { status: 400 });
    }

    // 4. Deduct and Update
    const newBalance = currentCredits - credits_cost;
    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({ credits: newBalance })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating user credits:", updateError);
      return NextResponse.json({ error: "Failed to deduct credits from database" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      credits_deducted: credits_cost,
      remaining_credits: newBalance
    });

  } catch (error: any) {
    console.error("Unexpected error in /api/video-credits/deduct:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
