"use client";

import { useState, useEffect, useCallback } from "react";

export interface GalleryItem {
  id: string;
  jobId: number | null;
  templateName: string;
  styleId: string;
  userPhoto: string;
  thumbnailUrl: string;
  status: "processing" | "completed" | "failed";
  resultUrl?: string;
  createdAt: string;
}

const STORAGE_KEY = "eromusa-gallery";

// Custom event for gallery updates
export const GALLERY_UPDATE_EVENT = "eromusa-gallery-update";

export function useGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch {}
    }
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    // Dispatch custom event so Gallery page can update
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(GALLERY_UPDATE_EVENT));
    }
  }, [items]);

  const addItem = useCallback((item: GalleryItem) => {
    setItems((prev) => [item, ...prev]);
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<GalleryItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }, []);

  return { items, addItem, updateItem };
}