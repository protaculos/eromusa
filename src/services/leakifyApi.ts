const API_BASE_URL = "https://api.leakifyhub.fun/api/v1";
const API_KEY = "sk_test_c1c729cd477db89b204474094579958e";

export interface Style {
  id: string;
  name: string;
  type: "video" | "photo";
  cost: number;
  requires_dual_image?: boolean;
  options?: Record<string, any>;
}

export interface GenerateJobResponse {
  job_id: number;
  status: "pending" | "processing" | "completed" | "failed";
  credits_cost: number;
  result_url?: string;
  result_expires_at?: string;
  encryption_metadata?: {
    encrypted_key: string;
    iv: string;
    algorithm: string;
    key_version: number;
  };
  error?: string;
}

export interface JobStatusResponse {
  job_id: number;
  status: "pending" | "processing" | "completed" | "failed";
  job_type: "video" | "photo";
  style: string;
  credits_cost: number;
  result_url?: string;
  result_expires_at?: string;
  encryption_metadata?: {
    encrypted_key: string;
    iv: string;
    algorithm: string;
    key_version: number;
  };
  error?: string;
}

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
};

/**
 * Fetch all available styles from the API
 */
export async function fetchStyles(): Promise<Style[]> {
  const res = await fetch(`${API_BASE_URL}/jobs/styles`, { headers });
  if (!res.ok) throw new Error(`Failed to fetch styles: ${res.status}`);
  return res.json();
}

/**
 * Submit a generation job
 * @param imageUrl - URL of the image to animate
 * @param styleId - The style ID to use
 * @param webhookUrl - Optional webhook URL for callback
 */
export async function generateVideo(
  imageUrl: string,
  styleId: string,
  webhookUrl?: string
): Promise<GenerateJobResponse> {
  const body: Record<string, any> = {
    image_url: imageUrl,
    style_id: styleId,
  };

  if (webhookUrl) {
    body.webhook_url = webhookUrl;
  }

  const res = await fetch(`${API_BASE_URL}/jobs/generate`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || `API error: ${res.status}`);
  }

  return res.json();
}

/**
 * Check the status of a job
 */
export async function getJobStatus(jobId: number): Promise<JobStatusResponse> {
  const res = await fetch(`${API_BASE_URL}/jobs/${jobId}`, { headers });
  if (!res.ok) throw new Error(`Failed to get job status: ${res.status}`);
  return res.json();
}

/**
 * Upload an image to a temporary hosting and return the URL
 * This converts a base64 data URL to a hosted URL the API can use
 */
export async function uploadImage(base64Image: string): Promise<string> {
  // Convert base64 to blob
  const res = await fetch(base64Image);
  const blob = await res.blob();

  // Upload to a temporary image hosting service
  const formData = new FormData();
  formData.append("image", blob, "photo.jpg");

  const uploadRes = await fetch("https://api.imgbb.com/1/upload?key=YOUR_IMGBB_KEY", {
    method: "POST",
    body: formData,
  });

  if (!uploadRes.ok) {
    throw new Error("Failed to upload image");
  }

  const data = await uploadRes.json();
  return data.data.url;
}

/**
 * Poll job status until completed or failed
 */
export async function waitForJobCompletion(
  jobId: number,
  onProgress?: (status: string) => void,
  maxAttempts = 60,
  intervalMs = 3000
): Promise<JobStatusResponse> {
  for (let i = 0; i < maxAttempts; i++) {
    const job = await getJobStatus(jobId);
    onProgress?.(job.status);

    if (job.status === "completed" || job.status === "failed") {
      return job;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error("Job timed out");
}