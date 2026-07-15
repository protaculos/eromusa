"use client";

import { useSettings } from "@/context/SettingsContext";
import Link from "next/link";
import Image from "next/image";

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-sm mx-auto bg-card rounded-2xl border border-border overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="text-base font-semibold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Auto Play Videos Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Auto Play Videos</p>
              <p className="text-xs text-text-secondary mt-0.5">
                Automatically play video previews on templates
              </p>
            </div>
            <button
              onClick={() => updateSettings({ autoPlayVideos: !settings.autoPlayVideos })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.autoPlayVideos ? "bg-accent-orange" : "bg-border"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.autoPlayVideos ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}