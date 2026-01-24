import { StoreSection } from "@/types/storeLayout";
import { Play, Pause, Volume2, VolumeX, Maximize2, Sparkles, Crown, Film, Video as VideoIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface PremiumVideoSectionProps {
  section: StoreSection;
  store: any;
  planTier?: 'basic' | 'professional' | 'enterprise';
}

type VideoLayoutStyle = 'cinematic' | 'split' | 'floating' | 'fullwidth' | 'grid';

export const PremiumVideoSection = ({ section, store, planTier = 'basic' }: PremiumVideoSectionProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(0);

  const videoUrl = section.settings.videoUrl || "";
  const youtubeId = section.settings.youtubeId || "";
  const showControls = section.settings.showControls !== false;
  const autoplay = section.settings.autoplay || false;
  const loop = section.settings.loop !== false;
  const layoutStyle: VideoLayoutStyle = section.settings.layoutStyle || 'cinematic';
  const overlayText = section.settings.overlayText || "";
  const overlayPosition = section.settings.overlayPosition || 'center';
  const showGradientOverlay = section.settings.showGradientOverlay !== false;
  const accentColor = store?.primary_color || '#8B4513';

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      const percentage = (video.currentTime / video.duration) * 100;
      setProgress(percentage);
    };

    video.addEventListener('timeupdate', updateProgress);
    return () => video.removeEventListener('timeupdate', updateProgress);
  }, []);

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

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  // Check if Enterprise tier required
  if (planTier !== 'enterprise') {
    return (
      <motion.section 
        className="py-16 md:py-24"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <div className="container mx-auto px-4">
          <div 
            className="max-w-4xl mx-auto rounded-2xl border-2 border-dashed p-12 text-center"
            style={{ borderColor: `${accentColor}30` }}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}40)` }}
              >
                <Crown className="h-10 w-10" style={{ color: accentColor }} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Sección de Video Premium</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Agrega videos cinematográficos con efectos avanzados para mostrar tus productos de forma impactante.
              </p>
              <Badge 
                className="text-sm px-4 py-2"
                style={{ background: `${accentColor}20`, color: accentColor }}
              >
                <Crown className="h-3.5 w-3.5 mr-1.5" />
                Requiere Plan Enterprise
              </Badge>
            </motion.div>
          </div>
        </div>
      </motion.section>
    );
  }

  // Cinematic Layout - Full width with parallax effect
  const renderCinematicLayout = () => (
    <motion.section 
      className="relative overflow-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1 }}
    >
      <div className="relative h-[70vh] md:h-[85vh]">
        {youtubeId ? (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=${autoplay ? 1 : 0}&mute=1&loop=${loop ? 1 : 0}&playlist=${youtubeId}&controls=0&showinfo=0&rel=0&modestbranding=1`}
            title="Video de presentación"
            className="absolute inset-0 w-full h-full object-cover"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            style={{ pointerEvents: 'none' }}
          />
        ) : videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            className="absolute inset-0 w-full h-full object-cover"
            muted={isMuted}
            loop={loop}
            autoPlay={autoplay}
            playsInline
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        ) : null}

        {/* Gradient Overlays */}
        {showGradientOverlay && (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div 
              className="absolute inset-0 mix-blend-overlay opacity-30"
              style={{ background: `linear-gradient(135deg, ${accentColor}, transparent)` }}
            />
          </>
        )}

        {/* Content Overlay */}
        <div className={`absolute inset-0 flex items-${overlayPosition === 'top' ? 'start pt-20' : overlayPosition === 'bottom' ? 'end pb-20' : 'center'} justify-center`}>
          <motion.div 
            className="text-center text-white max-w-4xl px-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {section.settings.headline && (
              <motion.h2 
                className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
                style={{ fontFamily: 'var(--store-heading-font)' }}
              >
                {section.settings.headline}
              </motion.h2>
            )}
            {section.settings.subtitle && (
              <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                {section.settings.subtitle}
              </p>
            )}
            {section.settings.showButton && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6 rounded-full"
                  style={{ backgroundColor: accentColor }}
                >
                  {section.settings.buttonText || 'Ver Colección'}
                  <Sparkles className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Video Controls */}
        {showControls && videoUrl && (
          <motion.div 
            className="absolute bottom-6 left-6 right-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {/* Progress Bar */}
            <div className="w-full h-1 bg-white/20 rounded-full mb-4 overflow-hidden">
              <motion.div 
                className="h-full rounded-full"
                style={{ width: `${progress}%`, backgroundColor: accentColor }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  size="icon"
                  variant="ghost"
                  className="rounded-full bg-white/10 hover:bg-white/20 text-white border-0 h-12 w-12"
                  onClick={togglePlay}
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="rounded-full bg-white/10 hover:bg-white/20 text-white border-0 h-10 w-10"
                  onClick={toggleMute}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full bg-white/10 hover:bg-white/20 text-white border-0 h-10 w-10"
                onClick={toggleFullscreen}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.section>
  );

  // Split Layout - Video on one side, content on other
  const renderSplitLayout = () => (
    <motion.section 
      className="py-16 md:py-24"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
    >
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Video Side */}
          <motion.div 
            className="relative rounded-3xl overflow-hidden shadow-2xl group"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <AspectRatio ratio={16/9}>
              {youtubeId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&mute=1&loop=${loop ? 1 : 0}&playlist=${youtubeId}`}
                  title="Video"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : videoUrl ? (
                <>
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
                  {/* Hover Controls */}
                  <AnimatePresence>
                    {isHovered && showControls && (
                      <motion.div 
                        className="absolute inset-0 bg-black/30 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <Button
                          size="lg"
                          className="rounded-full h-16 w-16"
                          style={{ backgroundColor: accentColor }}
                          onClick={togglePlay}
                        >
                          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center"
                  style={{ backgroundColor: `${accentColor}10` }}
                >
                  <VideoIcon className="h-16 w-16 opacity-30" style={{ color: accentColor }} />
                </div>
              )}
            </AspectRatio>
            
            {/* Decorative elements */}
            <div 
              className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-20 blur-xl"
              style={{ backgroundColor: accentColor }}
            />
          </motion.div>

          {/* Content Side */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {section.settings.badge && (
              <Badge 
                className="text-sm"
                style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
              >
                <Film className="h-3.5 w-3.5 mr-1.5" />
                {section.settings.badge}
              </Badge>
            )}
            
            <h2 
              className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight"
              style={{ fontFamily: 'var(--store-heading-font)' }}
            >
              {section.settings.headline || 'Descubre Nuestra Historia'}
            </h2>
            
            <p className="text-lg text-muted-foreground">
              {section.settings.subtitle || 'Conoce más sobre nosotros a través de este video exclusivo.'}
            </p>

            {section.settings.features && (
              <ul className="space-y-3">
                {(section.settings.features as string[]).map((feature, idx) => (
                  <motion.li 
                    key={idx}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                  >
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${accentColor}20` }}
                    >
                      <Sparkles className="h-3.5 w-3.5" style={{ color: accentColor }} />
                    </div>
                    <span>{feature}</span>
                  </motion.li>
                ))}
              </ul>
            )}

            {section.settings.showButton && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  size="lg" 
                  className="mt-4"
                  style={{ backgroundColor: accentColor }}
                >
                  {section.settings.buttonText || 'Explorar Más'}
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );

  // Floating Layout - Video with floating cards
  const renderFloatingLayout = () => (
    <motion.section 
      className="py-16 md:py-24 overflow-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
    >
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ fontFamily: 'var(--store-heading-font)' }}
          >
            {section.settings.headline || 'Video Destacado'}
          </h2>
          {section.settings.subtitle && (
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {section.settings.subtitle}
            </p>
          )}
        </motion.div>

        <div className="relative max-w-5xl mx-auto">
          {/* Main Video */}
          <motion.div 
            className="relative rounded-3xl overflow-hidden shadow-2xl"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <AspectRatio ratio={16/9}>
              {youtubeId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&mute=1`}
                  title="Video"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : videoUrl ? (
                <>
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
                  <AnimatePresence>
                    {isHovered && showControls && (
                      <motion.div 
                        className="absolute inset-0 bg-black/30 flex items-center justify-center gap-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <Button
                          size="lg"
                          className="rounded-full h-16 w-16"
                          style={{ backgroundColor: accentColor }}
                          onClick={togglePlay}
                        >
                          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center"
                  style={{ backgroundColor: `${accentColor}10` }}
                >
                  <div className="text-center space-y-4">
                    <Film className="h-16 w-16 mx-auto opacity-30" style={{ color: accentColor }} />
                    <p className="text-muted-foreground">Configura un video para mostrar aquí</p>
                  </div>
                </div>
              )}
            </AspectRatio>
          </motion.div>

          {/* Floating Cards */}
          {section.settings.floatingCards && (
            <>
              <motion.div 
                className="absolute -left-8 top-1/4 bg-background rounded-2xl p-4 shadow-xl border hidden lg:block"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                animate={{ y: [0, -10, 0] }}
                style={{ animation: 'float 3s ease-in-out infinite' }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${accentColor}20` }}
                  >
                    <Sparkles className="h-6 w-6" style={{ color: accentColor }} />
                  </div>
                  <div>
                    <p className="font-semibold">Calidad Premium</p>
                    <p className="text-sm text-muted-foreground">4K Ultra HD</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="absolute -right-8 bottom-1/4 bg-background rounded-2xl p-4 shadow-xl border hidden lg:block"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 }}
                animate={{ y: [0, 10, 0] }}
                style={{ animation: 'float 3s ease-in-out infinite 0.5s' }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${accentColor}20` }}
                  >
                    <Crown className="h-6 w-6" style={{ color: accentColor }} />
                  </div>
                  <div>
                    <p className="font-semibold">Experiencia Exclusiva</p>
                    <p className="text-sm text-muted-foreground">Solo para ti</p>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </motion.section>
  );

  // Full Width Layout - Simple but elegant
  const renderFullWidthLayout = () => (
    <motion.section 
      className="py-16 md:py-24"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
    >
      <div className="container mx-auto px-4">
        {(section.settings.headline || section.settings.subtitle) && (
          <motion.div 
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {section.settings.headline && (
              <h2 
                className="text-3xl md:text-4xl font-bold mb-3"
                style={{ fontFamily: 'var(--store-heading-font)' }}
              >
                {section.settings.headline}
              </h2>
            )}
            {section.settings.subtitle && (
              <p className="text-muted-foreground text-lg">{section.settings.subtitle}</p>
            )}
          </motion.div>
        )}

        <motion.div 
          className="max-w-6xl mx-auto relative overflow-hidden rounded-3xl shadow-2xl group"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <AspectRatio ratio={21/9}>
            {youtubeId ? (
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=${autoplay ? 1 : 0}&mute=1&loop=${loop ? 1 : 0}&playlist=${youtubeId}`}
                title="Video"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : videoUrl ? (
              <>
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
                
                {/* Elegant overlay controls */}
                <AnimatePresence>
                  {showControls && (
                    <motion.div 
                      className={`absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                    >
                      <div className="flex items-center gap-4">
                        <Button
                          size="icon"
                          className="rounded-full h-12 w-12"
                          style={{ backgroundColor: accentColor }}
                          onClick={togglePlay}
                        >
                          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                        </Button>
                        
                        <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all"
                            style={{ width: `${progress}%`, backgroundColor: accentColor }}
                          />
                        </div>
                        
                        <Button
                          size="icon"
                          variant="ghost"
                          className="rounded-full text-white hover:bg-white/20"
                          onClick={toggleMute}
                        >
                          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                        </Button>
                        
                        <Button
                          size="icon"
                          variant="ghost"
                          className="rounded-full text-white hover:bg-white/20"
                          onClick={toggleFullscreen}
                        >
                          <Maximize2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center"
                style={{ backgroundColor: `${accentColor}10` }}
              >
                <div className="text-center space-y-4">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Play className="h-20 w-20 mx-auto opacity-30" style={{ color: accentColor }} />
                  </motion.div>
                  <p className="text-muted-foreground">Configura una URL de video o ID de YouTube</p>
                </div>
              </div>
            )}
          </AspectRatio>
        </motion.div>
      </div>
    </motion.section>
  );

  // Grid Layout - Multiple videos
  const renderGridLayout = () => {
    const videos = section.settings.videos || [{ url: videoUrl, youtubeId }];
    
    return (
      <motion.section 
        className="py-16 md:py-24"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <div className="container mx-auto px-4">
          {section.settings.headline && (
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 
                className="text-3xl md:text-4xl font-bold mb-3"
                style={{ fontFamily: 'var(--store-heading-font)' }}
              >
                {section.settings.headline}
              </h2>
              {section.settings.subtitle && (
                <p className="text-muted-foreground text-lg">{section.settings.subtitle}</p>
              )}
            </motion.div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video: any, idx: number) => (
              <motion.div 
                key={idx}
                className="relative rounded-2xl overflow-hidden shadow-lg group cursor-pointer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <AspectRatio ratio={16/9}>
                  {video.youtubeId ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=0&mute=1`}
                      title={`Video ${idx + 1}`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : video.url ? (
                    <>
                      <video
                        src={video.url}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        playsInline
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <div 
                          className="w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                          style={{ backgroundColor: accentColor }}
                        >
                          <Play className="h-6 w-6 text-white ml-1" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center"
                      style={{ backgroundColor: `${accentColor}10` }}
                    >
                      <VideoIcon className="h-12 w-12 opacity-30" style={{ color: accentColor }} />
                    </div>
                  )}
                </AspectRatio>
                {video.title && (
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-white font-medium">{video.title}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    );
  };

  // Render based on layout style
  switch (layoutStyle) {
    case 'cinematic':
      return renderCinematicLayout();
    case 'split':
      return renderSplitLayout();
    case 'floating':
      return renderFloatingLayout();
    case 'fullwidth':
      return renderFullWidthLayout();
    case 'grid':
      return renderGridLayout();
    default:
      return renderFullWidthLayout();
  }
};

export default PremiumVideoSection;
