import { StoreSection } from "@/types/storeLayout";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { motion } from "framer-motion";

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
      <motion.section 
        className="py-8 md:py-12"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div className="container mx-auto px-4">
          {section.settings.headline && (
            <motion.div 
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                {section.settings.headline}
              </h2>
              {section.settings.subtitle && (
                <p className="text-muted-foreground">{section.settings.subtitle}</p>
              )}
            </motion.div>
          )}

          <motion.div 
            className="max-w-4xl mx-auto overflow-hidden rounded-xl shadow-lg"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <AspectRatio ratio={16/9}>
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=${autoplay ? 1 : 0}&mute=1&loop=${loop ? 1 : 0}&playlist=${youtubeId}`}
                title="Video de presentación"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </AspectRatio>
          </motion.div>
        </div>
      </motion.section>
    );
  }

  // If it's a direct video URL
  if (videoUrl) {
    return (
      <motion.section 
        className="py-8 md:py-12"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div className="container mx-auto px-4">
          {section.settings.headline && (
            <motion.div 
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                {section.settings.headline}
              </h2>
              {section.settings.subtitle && (
                <p className="text-muted-foreground">{section.settings.subtitle}</p>
              )}
            </motion.div>
          )}

          <motion.div 
            className="max-w-4xl mx-auto relative overflow-hidden rounded-xl shadow-lg group"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
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
              <motion.div 
                className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                initial={{ y: 20 }}
                whileInView={{ y: 0 }}
                transition={{ duration: 0.3 }}
              >
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
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.section>
    );
  }

  // Placeholder if no video configured
  return (
    <motion.section 
      className="py-8 md:py-12"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="aspect-video rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${store?.primary_color}10` }}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-center space-y-2">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Play 
                  className="h-16 w-16 mx-auto opacity-30"
                  style={{ color: store?.primary_color }}
                />
              </motion.div>
              <p className="text-muted-foreground">
                Configura una URL de video o ID de YouTube
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};