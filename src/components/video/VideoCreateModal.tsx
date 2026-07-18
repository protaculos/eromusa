"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createVideoJob } from "@/services/videoJobService";

interface VideoCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
  onVideoCreated?: (jobId: string) => void;
  template: {
    id: string;
    name: string;
    duration: string;
    credits: number;
    videoUrl: string;
    thumbnailUrl: string;
    instructions: string[];
    gradient?: string;
    styleId: string;
  };
}

interface CropBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

type DragType = 'move' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null;

export default function VideoCreateModal({
  isOpen,
  onClose,
  onOpenLogin,
  template,
}: VideoCreateModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();
  const { user, credits, refreshCredits, deductCredits } = useAuth();

  // Crop modal states
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImage, setCropImage] = useState<string | null>(null);

  // Crop box state (percentages) - starts covering full image
  const [cropBox, setCropBox] = useState<CropBox>({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const dragState = useRef({
    isDragging: false,
    dragType: null as DragType,
    startX: 0,
    startY: 0,
    startBox: { x: 0, y: 0, width: 0, height: 0 },
  });

  // Update container size
  useEffect(() => {
    if (containerRef.current) {
      const updateSize = () => {
        setContainerSize({
          width: containerRef.current!.offsetWidth,
          height: containerRef.current!.offsetHeight,
        });
      };
      updateSize();
      window.addEventListener('resize', updateSize);
      return () => window.removeEventListener('resize', updateSize);
    }
  }, [showCropModal]);

  // Reset selected image when template changes
  useEffect(() => {
    if (isOpen) {
      setSelectedImage(null);
      setIsPlaying(true);
    }
  }, [isOpen, template.thumbnailUrl]);

  // Reset file input when modal closes
  useEffect(() => {
    if (!isOpen && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCropImage(event.target?.result as string);
        setCropBox({ x: 0, y: 0, width: 100, height: 100 });
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCropImage(event.target?.result as string);
        setCropBox({ x: 0, y: 0, width: 100, height: 100 });
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const getDragType = (clientX: number, clientY: number): { type: DragType; offsetX: number; offsetY: number } => {
    if (!containerRef.current) return { type: null, offsetX: 0, offsetY: 0 };

    const rect = containerRef.current.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width * 100;
    const y = (clientY - rect.top) / rect.height * 100;

    const box = cropBox;
    const handleSize = 3; // percentage

    // Check corners first (higher priority)
    if (x >= box.x - handleSize && x <= box.x + handleSize && y >= box.y - handleSize && y <= box.y + handleSize) {
      return { type: 'top-left', offsetX: x - box.x, offsetY: y - box.y };
    }
    if (x >= box.x + box.width - handleSize && x <= box.x + box.width + handleSize && y >= box.y - handleSize && y <= box.y + handleSize) {
      return { type: 'top-right', offsetX: x - (box.x + box.width), offsetY: y - box.y };
    }
    if (x >= box.x - handleSize && x <= box.x + handleSize && y >= box.y + box.height - handleSize && y <= box.y + box.height + handleSize) {
      return { type: 'bottom-left', offsetX: x - box.x, offsetY: y - (box.y + box.height) };
    }
    if (x >= box.x + box.width - handleSize && x <= box.x + box.width + handleSize && y >= box.y + box.height - handleSize && y <= box.y + box.height + handleSize) {
      return { type: 'bottom-right', offsetX: x - (box.x + box.width), offsetY: y - (box.y + box.height) };
    }

    // Check edges
    if (y >= box.y - handleSize && y <= box.y + handleSize && x > box.x && x < box.x + box.width) {
      return { type: 'top', offsetX: x - box.x, offsetY: 0 };
    }
    if (y >= box.y + box.height - handleSize && y <= box.y + box.height + handleSize && x > box.x && x < box.x + box.width) {
      return { type: 'bottom', offsetX: x - box.x, offsetY: 0 };
    }
    if (x >= box.x - handleSize && x <= box.x + handleSize && y > box.y && y < box.y + box.height) {
      return { type: 'left', offsetX: 0, offsetY: y - box.y };
    }
    if (x >= box.x + box.width - handleSize && x <= box.x + box.width + handleSize && y > box.y && y < box.y + box.height) {
      return { type: 'right', offsetX: 0, offsetY: y - box.y };
    }

    // Check inside box
    if (x >= box.x && x <= box.x + box.width && y >= box.y && y <= box.y + box.height) {
      return { type: 'move', offsetX: x - box.x, offsetY: y - box.y };
    }

    return { type: null, offsetX: 0, offsetY: 0 };
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const { type, offsetX, offsetY } = getDragType(e.clientX, e.clientY);

    if (type) {
      dragState.current = {
        isDragging: true,
        dragType: type,
        startX: e.clientX,
        startY: e.clientY,
        startBox: { ...cropBox },
      };
    }
  }, [cropBox]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.current.isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = ((e.clientX - dragState.current.startX) / rect.width) * 100;
    const deltaY = ((e.clientY - dragState.current.startY) / rect.height) * 100;

    const start = dragState.current.startBox;
    const type = dragState.current.dragType;
    const minSize = 10; // minimum size in percentage

    let newBox = { ...start };

    switch (type) {
      case 'move':
        newBox.x = Math.max(0, Math.min(100 - start.width, start.x + deltaX));
        newBox.y = Math.max(0, Math.min(100 - start.height, start.y + deltaY));
        break;

      case 'top':
        const newTop = Math.max(0, Math.min(start.y + start.height - minSize, start.y + deltaY));
        newBox.y = newTop;
        newBox.height = start.y + start.height - newTop;
        break;

      case 'bottom':
        newBox.height = Math.max(minSize, Math.min(100 - start.y, start.height + deltaY));
        break;

      case 'left':
        const newLeft = Math.max(0, Math.min(start.x + start.width - minSize, start.x + deltaX));
        newBox.x = newLeft;
        newBox.width = start.x + start.width - newLeft;
        break;

      case 'right':
        newBox.width = Math.max(minSize, Math.min(100 - start.x, start.width + deltaX));
        break;

      case 'top-left':
        const newTopLeftY = Math.max(0, Math.min(start.y + start.height - minSize, start.y + deltaY));
        const newTopLeftX = Math.max(0, Math.min(start.x + start.width - minSize, start.x + deltaX));
        newBox.y = newTopLeftY;
        newBox.x = newTopLeftX;
        newBox.height = start.y + start.height - newTopLeftY;
        newBox.width = start.x + start.width - newTopLeftX;
        break;

      case 'top-right':
        const newTopRightY = Math.max(0, Math.min(start.y + start.height - minSize, start.y + deltaY));
        newBox.y = newTopRightY;
        newBox.height = start.y + start.height - newTopRightY;
        newBox.width = Math.max(minSize, Math.min(100 - start.x, start.width + deltaX));
        break;

      case 'bottom-left':
        const newBottomLeftX = Math.max(0, Math.min(start.x + start.width - minSize, start.x + deltaX));
        newBox.x = newBottomLeftX;
        newBox.width = start.x + start.width - newBottomLeftX;
        newBox.height = Math.max(minSize, Math.min(100 - start.y, start.height + deltaY));
        break;

      case 'bottom-right':
        newBox.width = Math.max(minSize, Math.min(100 - start.x, start.width + deltaX));
        newBox.height = Math.max(minSize, Math.min(100 - start.y, start.height + deltaY));
        break;
    }

    setCropBox(newBox);
  }, []);

  const handleMouseUp = useCallback(() => {
    dragState.current.isDragging = false;
    dragState.current.dragType = null;
  }, []);

  // Apply global mouse events when crop modal is open
  useEffect(() => {
    if (showCropModal) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [showCropModal, handleMouseMove, handleMouseUp]);

  const handleCropConfirm = () => {
    if (!imageRef.current || !cropImage || !containerRef.current) return;

    const img = imageRef.current;
    const container = containerRef.current;

    // Convert percentage to pixel values based on natural image dimensions
    const cropX = (cropBox.x / 100) * img.naturalWidth;
    const cropY = (cropBox.y / 100) * img.naturalHeight;
    const cropWidth = (cropBox.width / 100) * img.naturalWidth;
    const cropHeight = (cropBox.height / 100) * img.naturalHeight;

    // Create canvas and draw cropped image
    const canvas = document.createElement("canvas");
    canvas.width = cropWidth;
    canvas.height = cropHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(
      img,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );

    const croppedImageUrl = canvas.toDataURL("image/jpeg", 0.9);
    setSelectedImage(croppedImageUrl);
    setShowCropModal(false);
    setCropImage(null);
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setCropImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleCreateVideo = async () => {
    if (!selectedImage) return;

    // Check if user is logged in - open login modal instead
    if (!user) {
      onOpenLogin();
      return;
    }

    // Check if user has enough credits
    if (credits < template.credits) {
      setCreateError("Insufficient credits");
      return;
    }

    setIsCreating(true);
    setCreateError(null);

    try {
      const result = await createVideoJob(user.id, template, selectedImage);

      if (result.success && result.job) {
        // Deduct credits locally for instant UI update
        deductCredits(template.credits);

        // Refresh credits from DB to sync
        await refreshCredits();

        // Dispatch event for gallery to listen
        window.dispatchEvent(
          new CustomEvent("eromusa-job-created", {
            detail: { jobId: result.job!.id, job: result.job },
          })
        );

        // Navigate to gallery - loading state stays until redirect
        window.location.href = "/gallery";
      } else {
        setCreateError(result.error || "Failed to create video. Please try again.");
        setIsCreating(false);
      }
    } catch (error) {
      console.error("Error creating video:", error);
      setCreateError("An unexpected error occurred");
      setIsCreating(false);
    }
  };

  const getCursor = (): string => {
    const type = dragState.current.dragType;
    switch (type) {
      case 'move': return 'move';
      case 'top': case 'bottom': return 'ns-resize';
      case 'left': case 'right': return 'ew-resize';
      case 'top-left': case 'bottom-right': return 'nwse-resize';
      case 'top-right': case 'bottom-left': return 'nesw-resize';
      default: return 'crosshair';
    }
  };

  if (!isOpen) return null;

  // Crop Modal
  if (showCropModal && cropImage) {
    return (
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) handleCropCancel();
        }}
      >
        <div
          className="relative w-full max-w-sm mx-auto bg-card rounded-2xl border border-border overflow-hidden max-h-[95vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
            <h2 className="text-base font-semibold text-white">Crop Image</h2>
            <button
              onClick={handleCropCancel}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white/70 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Image with crop overlay */}
          <div className="flex-1 overflow-hidden p-4 flex items-center justify-center">
            <div
              ref={containerRef}
              className="relative w-full aspect-[3/4] max-h-[60vh] bg-black rounded-lg overflow-hidden"
              style={{ cursor: getCursor() }}
            >
              {/* Full image */}
              <img
                ref={imageRef}
                src={cropImage}
                alt="Crop preview"
                className="absolute inset-0 w-full h-full object-contain"
                crossOrigin="anonymous"
                draggable={false}
              />

              {/* Dark overlay outside crop area - only show when not full coverage */}
              {!(cropBox.x === 0 && cropBox.y === 0 && cropBox.width === 100 && cropBox.height === 100) && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `linear-gradient(to bottom,
                      rgba(0,0,0,0.7) 0%,
                      rgba(0,0,0,0.7) ${cropBox.y}%,
                      transparent ${cropBox.y}%,
                      transparent ${cropBox.y + cropBox.height}%,
                      rgba(0,0,0,0.7) ${cropBox.y + cropBox.height}%,
                      rgba(0,0,0,0.7) 100%),
                      linear-gradient(to right,
                      rgba(0,0,0,0.7) 0%,
                      rgba(0,0,0,0.7) ${cropBox.x}%,
                      transparent ${cropBox.x}%,
                      transparent ${cropBox.x + cropBox.width}%,
                      rgba(0,0,0,0.7) ${cropBox.x + cropBox.width}%,
                      rgba(0,0,0,0.7) 100%)`,
                    backgroundBlendMode: 'multiply',
                  }}
                />
              )}

              {/* Crop box with all handles */}
              <div
                className="absolute border-2 border-white pointer-events-auto"
                style={{
                  left: `${cropBox.x}%`,
                  top: `${cropBox.y}%`,
                  width: `${cropBox.width}%`,
                  height: `${cropBox.height}%`,
                }}
                onMouseDown={handleMouseDown}
              >
                {/* Grid lines (rule of thirds) */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/30" />
                  <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/30" />
                  <div className="absolute top-1/3 left-0 right-0 h-px bg-white/30" />
                  <div className="absolute top-2/3 left-0 right-0 h-px bg-white/30" />
                </div>

                {/* Edge handles - Top */}
                <div
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-2 bg-white rounded-sm cursor-ns-resize hover:bg-accent-orange transition-colors"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    dragState.current = {
                      isDragging: true,
                      dragType: 'top',
                      startX: e.clientX,
                      startY: e.clientY,
                      startBox: { ...cropBox },
                    };
                  }}
                />

                {/* Edge handles - Bottom */}
                <div
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-2 bg-white rounded-sm cursor-ns-resize hover:bg-accent-orange transition-colors"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    dragState.current = {
                      isDragging: true,
                      dragType: 'bottom',
                      startX: e.clientX,
                      startY: e.clientY,
                      startBox: { ...cropBox },
                    };
                  }}
                />

                {/* Edge handles - Left */}
                <div
                  className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-6 bg-white rounded-sm cursor-ew-resize hover:bg-accent-orange transition-colors"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    dragState.current = {
                      isDragging: true,
                      dragType: 'left',
                      startX: e.clientX,
                      startY: e.clientY,
                      startBox: { ...cropBox },
                    };
                  }}
                />

                {/* Edge handles - Right */}
                <div
                  className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-6 bg-white rounded-sm cursor-ew-resize hover:bg-accent-orange transition-colors"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    dragState.current = {
                      isDragging: true,
                      dragType: 'right',
                      startX: e.clientX,
                      startY: e.clientY,
                      startBox: { ...cropBox },
                    };
                  }}
                />

                {/* Corner handles */}
                {/* Top Left */}
                <div
                  className="absolute -top-1 -left-1 w-4 h-4 bg-white rounded-sm cursor-nwse-resize hover:bg-accent-orange transition-colors"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    dragState.current = {
                      isDragging: true,
                      dragType: 'top-left',
                      startX: e.clientX,
                      startY: e.clientY,
                      startBox: { ...cropBox },
                    };
                  }}
                />

                {/* Top Right */}
                <div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-sm cursor-nesw-resize hover:bg-accent-orange transition-colors"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    dragState.current = {
                      isDragging: true,
                      dragType: 'top-right',
                      startX: e.clientX,
                      startY: e.clientY,
                      startBox: { ...cropBox },
                    };
                  }}
                />

                {/* Bottom Left */}
                <div
                  className="absolute -bottom-1 -left-1 w-4 h-4 bg-white rounded-sm cursor-nesw-resize hover:bg-accent-orange transition-colors"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    dragState.current = {
                      isDragging: true,
                      dragType: 'bottom-left',
                      startX: e.clientX,
                      startY: e.clientY,
                      startBox: { ...cropBox },
                    };
                  }}
                />

                {/* Bottom Right */}
                <div
                  className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-sm cursor-nwse-resize hover:bg-accent-orange transition-colors"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    dragState.current = {
                      isDragging: true,
                      dragType: 'bottom-right',
                      startX: e.clientX,
                      startY: e.clientY,
                      startBox: { ...cropBox },
                    };
                  }}
                />

                {/* Center crosshair to indicate draggable */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                  <div className="w-4 h-4">
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M5 12h14M12 5v14" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="px-4 py-4 border-t border-border flex-shrink-0 flex gap-3">
            <button
              onClick={handleCropCancel}
              className="flex-1 py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCropConfirm}
              className="flex-1 py-2.5 px-4 bg-accent-orange hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm mx-auto bg-card rounded-2xl border border-border overflow-hidden max-h-[95vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
          <h2 className="text-base font-semibold text-white">
            {template.name}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-text-secondary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Foto e Vídeo lado a lado */}
          <div className="flex gap-3">
            {/* Upload de Foto */}
            <div className="flex-1">
              <p className="text-xs text-text-secondary mb-1.5 text-center">Your Image</p>
              <div
                className={`
                  aspect-[3/4] rounded-lg flex flex-col items-center justify-center
                  transition-all duration-200 relative overflow-hidden bg-transparent
                  ${!selectedImage ? "border border-dashed border-accent-orange/70 hover:bg-accent-orange/5 cursor-pointer group" : ""}
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !selectedImage && fileInputRef.current?.click()}
              >
                {selectedImage ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src={selectedImage}
                      alt="Selected photo"
                      className="max-w-full max-h-full object-contain"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="absolute top-1.5 right-1.5 p-1.5 bg-black/70 rounded-full hover:bg-black/90 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <>
                    {template.thumbnailUrl && (
                      <div className="absolute inset-0 z-0">
                        <Image
                          src={template.thumbnailUrl}
                          alt="Video reference"
                          fill
                          className="object-cover opacity-40"
                        />
                      </div>
                    )}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="p-2 bg-accent-orange/10 rounded-full mb-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-accent-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <p className="text-white text-xs font-medium">Drag & Drop</p>
                      <p className="text-white/50 text-[10px] mt-0.5">Upload your starting frame</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Vídeo */}
            <div className="flex-1">
              <p className="text-xs text-text-secondary mb-1.5 text-center">Output Video</p>
              <div
                className="aspect-[3/4] rounded-lg overflow-hidden cursor-pointer relative selectable-hover group"
                onClick={togglePlay}
              >
                {/* Close/Check icon overlay - appears on hover */}
                <div className="close-overlay absolute inset-0 flex items-center justify-center z-20">
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="relative w-14 h-14 rounded-full bg-accent-orange/80 backdrop-blur-sm flex items-center justify-center border-2 border-white/50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>

                {template.videoUrl ? (
                  <>
                    <video ref={videoRef} src={template.videoUrl} loop muted playsInline className="w-full h-full object-cover" autoPlay />
                    {!isPlaying && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className={`absolute inset-0 w-full h-full bg-gradient-to-br ${template.gradient || 'from-purple-500 via-pink-500 to-orange-400'} animate-gradient-shift`}>
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="absolute w-16 h-16 rounded-full bg-white/10 top-1/3 left-1/3 animate-float-1" />
                      <div className="absolute w-12 h-12 rounded-full bg-white/10 bottom-1/3 right-1/3 animate-float-2" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative">
                        <div className="absolute inset-0 w-12 h-12 rounded-full bg-white/10 animate-ping" />
                        <div className="relative w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 text-[9px] font-medium bg-black/60 text-white rounded">
                  {template.duration}
                </span>
              </div>
            </div>
          </div>

          {/* Instruções */}
          <div className="flex gap-2">
            <div className="flex-1 bg-red-500/10 rounded-lg p-2.5 border border-red-500/30">
              <p className="text-[10px] text-red-400 mb-1.5">Avoid</p>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-[10px] text-white/60">Blurry or low-res images</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-[10px] text-white/60">Heavy text or watermarks</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-[10px] text-white/60">Multiple subjects</span>
                </div>
              </div>
            </div>

            <div className="flex-1 bg-card/50 rounded-lg p-2.5 border border-border">
              <p className="text-[10px] text-accent-orange mb-1.5">Photo Tips</p>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-accent-orange flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[10px] text-white/80">Portrait-oriented photo</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-accent-orange flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[10px] text-white/80">Good lighting on face</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-accent-orange flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[10px] text-white/80">{template.instructions[2]}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {createError && (
            <div className="text-center text-red-400 text-xs">
              {createError}
            </div>
          )}

          {/* Créditos e Botão */}
          <div className={`flex items-center justify-center ${user ? "gap-4" : ""}`}>
            {user && (
              <div className="flex items-center gap-1.5">
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="#FBBF24"/>
                  <circle cx="12" cy="12" r="8" fill="#F59E0B"/>
                  <text x="12" y="16" textAnchor="middle" fill="#92400E" fontSize="10" fontWeight="bold">$</text>
                </svg>
                <span className="text-base font-bold text-yellow-500">{template.credits}</span>
                <span className="text-xs text-text-secondary">Credits</span>
              </div>
            )}
            <button
              onClick={handleCreateVideo}
              disabled={!selectedImage || isCreating}
              className="py-2.5 px-6 bg-accent-orange hover:bg-orange-600 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed animate-pulse-btn"
            >
              {isCreating ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Create Video
                </>
              )}
            </button>
          </div>
        </div>

        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" onChange={handleFileSelect} className="hidden" />
      </div>
    </div>
  );
}