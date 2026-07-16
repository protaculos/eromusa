import { supabase } from "@/lib/supabase";

export type JobStatus = "pending" | "processing" | "completed" | "failed";

export interface VideoJob {
  id: string;
  user_id: string;
  template_id: string;
  template_name: string;
  template_style_id: string;
  status: JobStatus;
  result_url: string | null;
  user_photo: string | null;
  created_at: string;
  updated_at: string;
}

// Create a new video generation job
export async function createVideoJob(
  userId: string,
  template: {
    id: string;
    name: string;
    styleId: string;
    thumbnailUrl: string;
    videoUrl: string;
    duration: string;
    credits: number;
  },
  croppedImageBase64: string
): Promise<{ success: boolean; job?: VideoJob; error?: string }> {
  try {
    // Deduct credits first
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    if (!token) {
      return { success: false, error: "Not authenticated" };
    }

    const deductResponse = await fetch("/api/video-credits/deduct", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ credits_cost: template.credits }),
    });

    if (!deductResponse.ok) {
      const errorData = await deductResponse.json();
      return { success: false, error: errorData.error || "Failed to deduct credits" };
    }

    // Create job record in database - set as processing immediately
    const { data, error } = await supabase
      .from("video_jobs")
      .insert({
        user_id: userId,
        template_id: template.id,
        template_name: template.name,
        template_style_id: template.styleId,
        user_photo: croppedImageBase64,
        status: "processing",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating video job:", error);
      return { success: false, error: "Failed to create video job" };
    }

    // Fire API call in background (don't await - let the gallery show processing immediately)
    fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        job_id: data.id,
        style_id: template.styleId,
        image_base64: croppedImageBase64,
      }),
    }).catch((err) => {
      console.error("Background API call failed:", err);
      // Mark as failed if API call errors
      supabase
        .from("video_jobs")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("id", data.id)
        .then();
    });

    return { success: true, job: { ...data, status: "processing" } as VideoJob };
  } catch (error) {
    console.error("Error creating video job:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// Get user's video jobs
export async function getUserVideoJobs(userId: string): Promise<VideoJob[]> {
  try {
    const { data, error } = await supabase
      .from("video_jobs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching video jobs:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching video jobs:", error);
    return [];
  }
}

// Get a single video job
export async function getVideoJob(jobId: string): Promise<VideoJob | null> {
  try {
    const { data, error } = await supabase
      .from("video_jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (error) {
      console.error("Error fetching video job:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching video job:", error);
    return null;
  }
}

// Poll job status (for client-side updates)
export function pollJobStatus(
  jobId: string,
  onUpdate: (job: VideoJob) => void,
  interval: number = 5000
): () => void {
  let intervalId: ReturnType<typeof setInterval>;

  const poll = async () => {
    const job = await getVideoJob(jobId);
    if (job) {
      onUpdate(job);

      // Stop polling if job is completed or failed
      if (job.status === "completed" || job.status === "failed") {
        clearInterval(intervalId);
      }
    }
  };

  intervalId = setInterval(poll, interval);

  // Initial poll
  poll();

  // Return cleanup function
  return () => clearInterval(intervalId);
}

// Delete a video job
export async function deleteVideoJob(jobId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("video_jobs")
      .delete()
      .eq("id", jobId);

    if (error) {
      console.error("Error deleting video job:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting video job:", error);
    return false;
  }
}