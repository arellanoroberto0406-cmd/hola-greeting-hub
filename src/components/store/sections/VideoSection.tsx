import { StoreSection } from "@/types/storeLayout";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface VideoSectionProps {
  section: StoreSection;
  store: any;
}

export const VideoSection = ({ section, store }: VideoSectionProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const videoUrl = section.settings.videoUrl || "";
  const youtubeId = section.settings.youtubeId || "";
  const showControls = section.settings.showControls !== false;
  const autoplay = section.settings.autoplay || false;
  const loop = section.settings.loop !== false;

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // If it's a YouTube video
  if (youtubeId) {
    return (
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          {section.settings.headline && (
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                {section.settings.headline}
              </h2>
              {section.settings.subtitle && (
                <p className="text-muted-foreground">{section.settings.subtitle}</p>
              )}
            </div>
          )}

          <div className="max-w-4xl mx-auto overflow-hidden rounded-xl shadow-lg">
            <AspectRatio ratio={16/9}>
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=${autoplay ? 1 : 0}&mute=1&loop=${loop ? 1 : 0}&playlist=${youtubeId}`}
                title="Video de presentación"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </AspectRatio>
          </div>
        </div>
      </section>
    );
  }

  // If it's a direct video URL
  if (videoUrl) {
    return (
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          {section.settings.headline && (
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                {section.settings.headline}
              </h2>
              {section.settings.subtitle && (
                <p className="text-muted-foreground">{section.settings.subtitle}</p>
              )}
            </div>
          )}

          <div className="max-w-4xl mx-auto relative overflow-hidden rounded-xl shadow-lg group">
            <AspectRatio ratio={16/9}>
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full object-cover"
                muted={isMuted}
                loop={loop}
                autoPlay={autoplay}
                playsInline
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            </AspectRatio>

            {showControls && (
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon"
                  variant="secondary"
                  className="rounded-full bg-black/50 hover:bg-black/70 text-white border-0"
                  onClick={togglePlay}
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="rounded-full bg-black/50 hover:bg-black/70 text-white border-0"
                  onClick={toggleMute}
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Placeholder if no video configured
  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div 
            className="aspect-video rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${store?.primary_color}10` }}
          >
            <div className="text-center space-y-2">
              <Play 
                className="h-16 w-16 mx-auto opacity-30"
                style={{ color: store?.primary_color }}
              />
              <p className="text-muted-foreground">
                Configura una URL de video o ID de YouTube
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};