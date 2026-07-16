/**
 * Upload an image (base64 data URL) to a public URL for the LeakifyHub API
 *
 * The LeakifyHub API requires a publicly accessible image URL.
 * This service handles converting the cropped image to a hosted URL.
 */

// You can use any of these services - configure in .env.local
// IMGBB_KEY: Get free at https://api.imgbb.com
// FREEIMAGE_KEY: Get free at https://freeimage.host/page/api

export async function uploadImageToHost(base64Image: string): Promise<string> {
  // Convert base64 to blob
  const res = await fetch(base64Image);
  const blob = await res.blob();

  const formData = new FormData();
  formData.append("image", blob, "photo.jpg");

  // Try imgbb first (free, no auth needed for basic upload)
  const uploadRes = await fetch("https://api.imgbb.com/1/upload?key=" + getImgbbKey(), {
    method: "POST",
    body: formData,
  });

  if (!uploadRes.ok) {
    throw new Error("Failed to upload image to hosting service");
  }

  const data = await uploadRes.json();
  if (!data.data?.url) {
    throw new Error("Invalid response from image host");
  }

  return data.data.url;
}

function getImgbbKey(): string {
  const key = process.env.NEXT_PUBLIC_IMGBB_KEY;
  if (!key) {
    throw new Error("NEXT_PUBLIC_IMGBB_KEY environment variable is not set");
  }
  return key;
}