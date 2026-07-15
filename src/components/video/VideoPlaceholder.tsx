"use client";

interface VideoPlaceholderProps {
  thumbnail: string;
  isPlaying: boolean;
  gradient?: string;
}

export default function VideoPlaceholder({ thumbnail, isPlaying, gradient = "from-purple-600 via-pink-500 to-orange-400" }: VideoPlaceholderProps) {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      {/* Thumbnail como fundo */}
      {thumbnail && (
        <img
          src={thumbnail}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            isPlaying ? "opacity-0" : "opacity-100"
          }`}
        />
      )}

      {/* Gradiente animado como placeholder do vídeo */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} ${
          isPlaying ? "opacity-100" : "opacity-0"
        } transition-opacity duration-500`}
      >
        {/* Partículas flutuantes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-32 h-32 bg-white/10 rounded-full animate-float-slow top-1/4 left-1/4" />
          <div className="absolute w-24 h-24 bg-white/10 rounded-full animate-float-slow-delayed top-1/3 right-1/4" />
          <div className="absolute w-20 h-20 bg-white/10 rounded-full animate-float-slow top-2/3 left-1/3" />
          <div className="absolute w-16 h-16 bg-white/10 rounded-full animate-float-slow-delayed-2 bottom-1/4 right-1/3" />
        </div>

        {/* Efeito de luz */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Ícone de play pulsante */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center animate-pulse">
            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}