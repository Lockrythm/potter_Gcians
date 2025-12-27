import { useRef, useEffect } from 'react';
import libraryVideo from '@/assets/library-intro-video.mp4';

export function ScrollVideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const rect = container.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          
          // Calculate scroll progress (0 to 1)
          const scrollProgress = Math.max(0, Math.min(1, 
            1 - (rect.bottom / (windowHeight + rect.height))
          ));
          
          // Map scroll to video time
          if (video.duration && !isNaN(video.duration)) {
            video.currentTime = scrollProgress * video.duration;
          }
          
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden rounded-lg mb-8"
    >
      <video
        ref={videoRef}
        muted
        playsInline
        preload="auto"
        className="w-full h-full object-cover"
      >
        <source src={libraryVideo} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      <div className="absolute bottom-4 left-4 right-4 text-center">
        <p className="text-sm text-muted-foreground">Scroll to explore the magic</p>
      </div>
    </div>
  );
}
