import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import libraryVideo from '@/assets/library-intro-video.mp4';

export function VideoTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [showVideo, setShowVideo] = useState(false);
  const [previousPath, setPreviousPath] = useState(location.pathname);

  useEffect(() => {
    // Only show video when navigating TO library FROM home
    if (previousPath === '/' && location.pathname === '/library') {
      setShowVideo(true);
    }
    setPreviousPath(location.pathname);
  }, [location.pathname, previousPath]);

  const handleVideoEnd = useCallback(() => {
    setShowVideo(false);
  }, []);

  // Auto-hide after 2.5 seconds as fallback
  useEffect(() => {
    if (showVideo) {
      const timer = setTimeout(() => setShowVideo(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [showVideo]);

  return (
    <>
      {showVideo && (
        <div className="fixed inset-0 z-[9999] bg-background">
          <video
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnd}
            className="w-full h-full object-cover"
          >
            <source src={libraryVideo} type="video/mp4" />
          </video>
        </div>
      )}
      {children}
    </>
  );
}
