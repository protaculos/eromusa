import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Route: /api/user/credits
 * Purpose: Return the exact credit balance of the authenticated user from the database.
 * Principle: Database is the ONLY source of truth. No automatic profile creation or bonuses here.
 */
export async function GET(req: Request) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "No authorization header" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch ONLY the credits column from the users table for this specific ID
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("credits")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Database error fetching credits:", error);
      return NextResponse.json({ error: "Database fetch error" }, { status: 500 });
    }

    // If no profile exists or credits is null, return 0.
    // We do NOT create a profile here to avoid side-effects during a GET request.
    const balance = data?.credits ?? 0;

    return NextResponse.json({ credits: balance });

  } catch (error: any) {
    console.error("Unexpected error in /api/user/credits:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
