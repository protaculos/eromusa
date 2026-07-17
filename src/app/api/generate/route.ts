import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const API_BASE_URL = "https://api.leakifyhub.fun/api/v1";

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(supabaseUrl, supabaseKey);
}

export async function POST(req: NextRequest) {
  try {
    const API_KEY = process.env.LEAKIFY_API_KEY;
    if (!API_KEY) {
      return NextResponse.json({ error: "Leakify API key not configured" }, { status: 500 });
    }

    const body = await req.json();
    const { job_id, style_id, image_base64 } = body;

    if (!job_id || !style_id || !image_base64) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Upload image to Supabase Storage to get a public URL
    const base64Data = image_base64.split(",")[1] || image_base64;
    const buffer = Buffer.from(base64Data, "base64");
    const fileName = `uploads/${job_id}.jpg`;

    const { error: uploadError } = await getSupabase().storage
      .from("images")
      .upload(fileName, buffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      throw new Error("Failed to upload image");
    }

    const { data: urlData } = getSupabase().storage
      .from("images")
      .getPublicUrl(fileName);

    const imageUrl = urlData.publicUrl;

    // 2. Call LeakifyHub API with the public image URL
    const leakifyRes = await fetch(`${API_BASE_URL}/jobs/generate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_url: imageUrl,
        style: style_id,
        type: "video",
      }),
    });

    if (!leakifyRes.ok) {
      const errorData = await leakifyRes.json().catch(() => ({}));
      console.error("LeakifyHub API error:", leakifyRes.status, errorData);
      await getSupabase()
        .from("video_jobs")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("id", job_id);
      return NextResponse.json(
        { error: errorData.message || `LeakifyHub error: ${leakifyRes.status}` },
        { status: leakifyRes.status }
      );
    }

    const leakifyData = await leakifyRes.json();
    const leakifyJobId = leakifyData.job_id;

    // 3. Poll LeakifyHub until video is ready
    let videoUrl = null;
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      try {
        const statusRes = await fetch(`${API_BASE_URL}/jobs/${leakifyJobId}`, {
          headers: { Authorization: `Bearer ${API_KEY}` },
        });
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          if (statusData.status === "completed" && statusData.result_url) {
            videoUrl = statusData.result_url;
            break;
          }
          if (statusData.status === "failed") break;
        }
      } catch {}
    }

    if (!videoUrl) {
      await getSupabase()
        .from("video_jobs")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("id", job_id);
      return NextResponse.json({ error: "Video generation timed out" }, { status: 500 });
    }

    // 4. Save result
    await getSupabase()
      .from("video_jobs")
      .update({
        status: "completed",
        result_url: videoUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", job_id);

    return NextResponse.json({
      success: true,
      job_id,
      status: "completed",
      result_url: videoUrl,
    });
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("job_id");

    if (!jobId) {
      return NextResponse.json({ error: "Missing job_id" }, { status: 400 });
    }

    const { data: job } = await getSupabase()
      .from("video_jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({
      job_id: job.id,
      status: job.status,
      result_url: job.result_url,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}