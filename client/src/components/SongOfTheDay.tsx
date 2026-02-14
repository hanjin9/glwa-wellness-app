import { Music, Play } from "lucide-react";
import { useState } from "react";

interface SongOfTheDayProps {
  songTitle?: string;
  artistName?: string;
  songUrl?: string;
}

export default function SongOfTheDay({
  songTitle = "오늘의 축하 음악",
  artistName = "GLWA Wellness",
  songUrl,
}: SongOfTheDayProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(() => songUrl ? new Audio(songUrl) : null);

  const handlePlayClick = () => {
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(err => console.error("Audio play error:", err));
      setIsPlaying(true);
    }
  };

  return (
    <div className="w-full mb-6">
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-2xl p-6 shadow-lg overflow-hidden relative">
        {/* Background animation */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse" />
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <Music className="w-5 h-5 text-white" />
            <span className="text-sm font-medium text-white/90">🎵 오늘의 노래</span>
          </div>

          {/* Song title with scrolling effect */}
          <div className="mb-4 overflow-hidden">
            <div className="flex items-center gap-3">
              <button
                onClick={handlePlayClick}
                className="flex-shrink-0 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all hover:scale-110 backdrop-blur-sm"
              >
                <Play className="w-6 h-6 text-white fill-white" />
              </button>
              
              {/* Scrolling text */}
              <div className="flex-1 overflow-hidden">
                <div className="animate-marquee whitespace-nowrap">
                  <span className="text-xl font-bold text-white mr-8">
                    {songTitle}
                  </span>
                  <span className="text-xl font-bold text-white/70 mr-8">
                    • {artistName}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Artist info */}
          <div className="text-sm text-white/80">
            {isPlaying ? "▶️ 재생 중..." : "클릭하여 재생"}
          </div>
        </div>
      </div>

      {/* CSS for marquee animation */}
      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        
        .animate-marquee {
          animation: marquee 15s linear infinite;
        }
        
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
