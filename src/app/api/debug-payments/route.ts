import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log("DEBUG: Checking last payments...");
    const { data: payments, error: pError } = await supabaseAdmin
      .from('payments')
      .select('id, user_id, credits, status')
      .order('created_at', { ascending: false })
      .limit(10);

    if (pError) console.error("DEBUG ERROR Payments:", pError);
    console.log("DEBUG Payments Data:", JSON.stringify(payments));

    console.log("DEBUG: Checking users credits...");
    const { data: users, error: uError } = await supabaseAdmin
      .from('users')
      .select('id, email, credits')
      .order('updated_at', { ascending: false })
      .limit(10);

    if (uError) console.error("DEBUG ERROR Users:", uError);
    console.log("DEBUG Users Data:", JSON.stringify(users));

    return NextResponse.json({
      message: "Check your Vercel logs for the detailed data",
      payments,
      users
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}