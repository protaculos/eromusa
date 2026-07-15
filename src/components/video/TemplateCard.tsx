"use client";

import { useState } from "react";
import Image from "next/image";

interface TemplateCardProps {
  template: {
    id: string;
    title: string;
    thumbnail: string;
    isFree: boolean;
    isPopular: boolean;
    tags: string[];
    videoUrl: string;
    gradient: string;
  };
  isAutoPlay: boolean;
  onClick: () => void;
}

// Mapeamento de animações por tema
const getThemeAnimation = (title: string): { shimmer: string; particles: string } => {
  switch (title) {
    case "Cinematic Portrait":
      return {
        shimmer: "animate-shimmer-gold",
        particles: "bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500",
      };
    case "Neon Dreams":
      return {
        shimmer: "animate-neon-pulse",
        particles: "bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500",
      };
    case "Vintage Vibes":
      return {
        shimmer: "animate-warm-glow",
        particles: "bg-gradient-to-r from-amber-400 via-orange-500 to-rose-600",
      };
    case "Dark Elegance":
      return {
        shimmer: "animate-elegant-float",
        particles: "bg-gradient-to-r from-slate-500 via-gray-600 to-zinc-700",
      };
    default:
      return {
        shimmer: "animate-gradient-shift",
        particles: "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400",
      };
  }
};

export default function TemplateCard({ template, isAutoPlay, onClick }: TemplateCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Só inicia animação no hover ou autoplay - performance
  const shouldPlay = isAutoPlay || isHovered;
  const themeAnim = getThemeAnimation(template.title);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
      className="group relative aspect-[2/3] rounded-2xl overflow-hidden bg-card border border-border cursor-pointer hover:border-accent-orange/50 transition-all duration-300 will-change-transform"
    >
      {/* Thumbnail Image - visível quando não está tocando */}
      <Image
        src={template.thumbnail}
        alt={template.title}
        fill
        className={`object-cover transition-opacity duration-500 ${
          shouldPlay ? "opacity-0" : "opacity-100"
        }`}
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      />

      {/* Placeholder animado - aparece no hover */}
      {shouldPlay && (
        <div className={`absolute inset-0 bg-gradient-to-br ${template.gradient} ${themeAnim.shimmer}`}>
          {/* Partículas flutuantes */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Linha diagonal animada */}
            <div className={`absolute inset-0 ${themeAnim.particles} opacity-20`} />

            {/* Bolhas flutuantes */}
            <div className="absolute w-20 h-20 rounded-full bg-white/10 top-1/4 left-1/4 animate-float-1" />
            <div className="absolute w-16 h-16 rounded-full bg-white/10 top-1/3 right-1/4 animate-float-2" />
            <div className="absolute w-12 h-12 rounded-full bg-white/10 bottom-1/3 left-1/3 animate-float-3" />
            <div className="absolute w-10 h-10 rounded-full bg-white/10 bottom-1/4 right-1/3 animate-float-1-delayed" />

            {/* Partículas menores */}
            <div className="absolute w-3 h-3 rounded-full bg-white/30 top-1/5 left-1/2 animate-float-2" />
            <div className="absolute w-2 h-2 rounded-full bg-white/30 top-2/5 right-1/3 animate-float-1-delayed" />
            <div className="absolute w-2 h-2 rounded-full bg-white/30 bottom-1/5 left-1/3 animate-float-3" />
          </div>

          {/* Efeito de luz overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />

          {/* Ícone de play central */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Anel pulsante */}
              <div className="absolute inset-0 w-16 h-16 rounded-full bg-white/10 animate-ping" />
              {/* Círculo principal */}
              <div className="relative w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Label "Preview" */}
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 text-[10px] font-medium bg-black/40 backdrop-blur-sm text-white/90 rounded-full border border-white/20">
              Preview
            </span>
          </div>
        </div>
      )}

      {/* Gradient Overlay - sempre visível sobre a thumbnail */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

      {/* Badges */}
      <div className="absolute top-3 left-3 flex gap-2 z-10">
        {template.isFree && (
          <span className="px-2 py-1 rounded-md bg-green-500/90 text-white text-xs font-semibold">
            Free
          </span>
        )}
        {template.isPopular && (
          <span className="px-2 py-1 rounded-md bg-accent-purple/90 text-white text-xs font-semibold">
            Popular
          </span>
        )}
      </div>

      {/* Title & Tags */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
        <h3 className="text-white font-semibold text-sm sm:text-base mb-1">
          {template.title}
        </h3>
        <div className="flex flex-wrap gap-1">
          {template.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full bg-white/10 text-white/80 text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Play Icon on Hover (quando não está tocando) */}
      {!shouldPlay && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white ml-1"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}