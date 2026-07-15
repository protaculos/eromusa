"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getUserVideoJobs, pollJobStatus, deleteVideoJob, VideoJob } from "@/services/videoJobService";
import LoginModal from "@/components/LoginModal";

export default function GalleryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [jobs, setJobs] = useState<VideoJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement }>({});
  const [confirmModal, setConfirmModal] = useState<{ type: "download" | "delete"; jobId: string; url?: string; name?: string } | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);

  // Fetch jobs from database
  const fetchJobs = useCallback(async () => {
    if (!user) return;

    try {
      const userJobs = await getUserVideoJobs(user.id);
      setJobs(userJobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial fetch
  useEffect(() => {
    if (authLoading) return;

    if (user) {
      fetchJobs();
    } else {
      setLoading(false);
    }
  }, [user, authLoading, router, fetchJobs]);

  // Poll for job updates
  useEffect(() => {
    if (!user) return;

    const processingJobs = jobs.filter((job) => job.status === "processing");
    if (processingJobs.length === 0) return;

    const cleanupFunctions: (() => void)[] = [];

    processingJobs.forEach((job) => {
      const cleanup = pollJobStatus(job.id, (updatedJob) => {
        setJobs((prev) =>
          prev.map((j) => (j.id === updatedJob.id ? updatedJob : j))
        );
      });
      cleanupFunctions.push(cleanup);
    });

    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
  }, [user, jobs]);

  // Listen for new job events from VideoCreateModal
  useEffect(() => {
    const handleNewJob = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { jobId } = customEvent.detail;
      fetchJobs();
      router.refresh();
    };

    window.addEventListener("eromusa-job-created", handleNewJob);
    return () => {
      window.removeEventListener("eromusa-job-created", handleNewJob);
    };
  }, [fetchJobs, router]);

  // Poll for updates every 5 seconds
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchJobs();
    }, 5000);

    return () => clearInterval(interval);
  }, [user, fetchJobs]);

  const toggleVideo = (jobId: string) => {
    if (playingVideo === jobId) {
      setPlayingVideo(null);
    } else {
      setPlayingVideo(jobId);
    }
  };

  // Play/pause video when playingVideo state changes
  useEffect(() => {
    Object.keys(videoRefs.current).forEach((id) => {
      const video = videoRefs.current[id];
      if (video) {
        video.pause();
      }
    });

    if (playingVideo && videoRefs.current[playingVideo]) {
      videoRefs.current[playingVideo].play().catch(() => {});
    }
  }, [playingVideo]);

  const handleDownload = (url: string, name: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}.mp4`;
    a.click();
  };

  const handleDelete = async (jobId: string) => {
    const success = await deleteVideoJob(jobId);
    if (success) {
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    }
  };

  if (authLoading || loading) {
    return (
      <div className="pt-32 sm:pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-12 h-12 border-3 border-accent-orange/30 border-t-accent-orange rounded-full animate-spin mb-4" />
            <p className="text-text-secondary text-sm">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="pt-32 sm:pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              {user ? "My Generations" : "Gallery"}
            </h1>
            <p className="text-text-secondary max-w-2xl mx-auto text-sm">
              {user
                ? "Your AI video creations"
                : "Sign in to see your AI video creations"}
            </p>
          </div>

          {/* Warning Banner - Videos expire in 72 hours */}
          {jobs.length > 0 && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-3">
              <svg className="w-5 h-5 text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-yellow-300 text-xs sm:text-sm">
                Your videos will be automatically deleted after <strong>72 hours</strong>. Please download them before they expire.
              </p>
            </div>
          )}

          {jobs.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-20 sm:py-32">
              <div className="w-20 h-20 rounded-full bg-card border border-border flex items-center justify-center mb-6">
                <svg
                  className="w-10 h-10 text-text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                {user ? "No generations yet" : "Sign in to get started"}
              </h2>
              <p className="text-text-secondary text-center max-w-md mb-8">
                {user
                  ? "Start by choosing a template from the Discover page to animate your photos"
                  : "Create your account to start generating AI videos"}
              </p>
              {user ? (
                <a
                  href="/"
                  className="px-6 py-3 rounded-xl bg-accent-orange hover:bg-orange-600 text-white font-semibold transition-colors"
                >
                  Discover Templates
                </a>
              ) : (
                <button
                  onClick={() => setLoginOpen(true)}
                  className="px-6 py-3 rounded-xl bg-accent-orange hover:bg-orange-600 text-white font-semibold transition-colors"
                >
                  Sign In / Sign Up
                </button>
              )}
            </div>
          ) : (
            /* Gallery Grid */
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-card border border-border group cursor-pointer"
                  onClick={() => job.status === "completed" && toggleVideo(job.id)}
                >
                  {/* Completed - show video or user photo as thumbnail */}
                  {job.status === "completed" && job.result_url ? (
                    <>
                      {/* Show user photo when paused, video when playing */}
                      {playingVideo === job.id ? (
                        <video
                          ref={(el) => { if (el) videoRefs.current[job.id] = el; }}
                          src={job.result_url}
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="relative w-full h-full">
                          {job.user_photo && (
                            <img
                              src={job.user_photo}
                              alt={job.template_name}
                              className="w-full h-full object-cover"
                            />
                          )}
                          {!job.user_photo && (
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400" />
                          )}
                          {/* Play overlay */}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                              <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action buttons - Download & Delete */}
                      <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Download */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmModal({ type: "download", jobId: job.id, url: job.result_url!, name: job.template_name });
                          }}
                          className="p-2 rounded-lg bg-black/60 hover:bg-black/80 text-white transition-colors"
                          title="Download"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                        {/* Delete */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmModal({ type: "delete", jobId: job.id });
                          }}
                          className="p-2 rounded-lg bg-black/60 hover:bg-red-500/80 text-white transition-colors"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </>
                  ) : (
                    /* Processing or Failed state - show user's uploaded photo */
                    <div className="relative w-full h-full">
                      {job.user_photo && (
                        <img
                          src={job.user_photo}
                          alt={job.template_name}
                          className={`w-full h-full object-cover transition-all duration-500 ${
                            job.status === "processing" || job.status === "pending" ? "opacity-40" : "opacity-100"
                          }`}
                        />
                      )}
                      {!job.user_photo && (
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400" />
                      )}
                    </div>
                  )}

                  {/* Processing overlay */}
                  {(job.status === "processing" || job.status === "pending") && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
                      <div className="w-12 h-12 border-3 border-accent-orange/30 border-t-accent-orange rounded-full animate-spin mb-3" />
                      <p className="text-white text-xs font-medium text-center px-4">
                        Processing...
                      </p>
                      <p className="text-text-secondary text-[10px] text-center px-4 mt-1">
                        Please wait 2-5 minutes
                      </p>
                    </div>
                  )}

                  {/* Failed overlay */}
                  {job.status === "failed" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                      <svg className="w-10 h-10 text-red-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-white text-xs font-medium">Failed</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="mt-2 px-3 py-1 text-xs bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        Retry
                      </button>
                    </div>
                  )}

                  {/* Bottom info */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-white text-xs font-medium truncate">
                      {job.template_name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span
                        className={`inline-block w-1.5 h-1.5 rounded-full ${
                          job.status === "processing" || job.status === "pending"
                            ? "bg-yellow-400 animate-pulse"
                            : job.status === "completed"
                            ? "bg-green-400"
                            : "bg-red-400"
                        }`}
                      />
                      <span className="text-[10px] text-white/60 capitalize">
                        {job.status === "processing" || job.status === "pending"
                          ? "Processing"
                          : job.status === "completed"
                          ? "Completed"
                          : "Failed"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setConfirmModal(null)} />
          <div className="relative w-full max-w-sm mx-4 bg-[#161827] rounded-2xl border border-[#1E2130] shadow-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-3">
              {confirmModal.type === "download" ? "Download Video" : "Delete Video"}
            </h3>
            <p className="text-text-secondary text-sm mb-6">
              {confirmModal.type === "download"
                ? "Are you sure you want to download this video?"
                : "Are you sure you want to delete this video? This action cannot be undone."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-2.5 px-4 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmModal.type === "download" && confirmModal.url) {
                    handleDownload(confirmModal.url, confirmModal.name || "video");
                  } else if (confirmModal.type === "delete") {
                    handleDelete(confirmModal.jobId);
                  }
                  setConfirmModal(null);
                }}
                className={`flex-1 py-2.5 px-4 rounded-lg text-white text-sm font-semibold transition-colors ${
                  confirmModal.type === "download"
                    ? "bg-accent-orange hover:bg-orange-600"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {confirmModal.type === "download" ? "Download" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}