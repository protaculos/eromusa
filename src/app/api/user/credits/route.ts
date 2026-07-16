import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  try {
    // We use a server-side client with SERVICE_ROLE_KEY to bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get the session from the request headers/cookies to identify the user
    // For now, we rely on the AuthContext passing the ID or we get the session
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "No authorization header" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from("users")
      .select("credits")
      .eq("id", user.id)
      .single();

    if (error) throw error;

    return NextResponse.json({ credits: data?.credits ?? 0 });
  } catch (error: any) {
    console.error("Error fetching credits API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}