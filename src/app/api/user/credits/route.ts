import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

    // Try to fetch credits
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("credits")
      .eq("id", user.id)
      .maybeSingle(); // Use maybeSingle instead of single to avoid the "coerce" error

    if (error) {
      console.error("Error fetching credits:", error);
      throw error;
    }

    if (!data) {
      console.log("User profile not found, creating one for ID:", user.id);
      // Automatically create user profile if it doesn't exist
      const { error: createError } = await supabaseAdmin
        .from("users")
        .insert({
          id: user.id,
          email: user.email,
          credits: 0,
        });

      if (createError) {
        console.error("Error creating user profile:", createError);
        return NextResponse.json({ credits: 0 });
      }
      return NextResponse.json({ credits: 0 });
    }

    return NextResponse.json({ credits: data.credits ?? 0 });
  } catch (error: any) {
    console.error("Error fetching credits API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}