import { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

interface VideoPlayerProps {
  videoUrl: string;
}

export default function VideoPlayer({ videoUrl }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initPlayer = () => {
      if (videoRef.current && !playerRef.current && containerRef.current) {
        if (!document.body.contains(videoRef.current)) {
          return;
        }

        playerRef.current = videojs(videoRef.current, {
          controls: true,
          autoplay: false,
          preload: 'auto',
          fluid: true,
          sources: [{
            src: videoUrl,
            type: 'video/mp4'
          }]
        }, () => {
          console.log('Video.js player is ready');

          const videoElement = playerRef.current.el();

          const preventContextMenu = (e: Event) => {
            e.preventDefault();
            return false;
          };

          videoElement.addEventListener('contextmenu', preventContextMenu);
          videoElement.addEventListener('mouseup', (e: MouseEvent) => {
            if (e.button === 2 || e.button === 1) {
              e.preventDefault();
              return false;
            }
          });
        });
      }
    };

    const timeoutId = setTimeout(initPlayer, 100);

    return () => {
      clearTimeout(timeoutId);
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [videoUrl]);

  return (
    <div ref={containerRef} data-vjs-player>
      <video
        ref={videoRef}
        className="video-js vjs-big-play-centered"
      />
    </div>
  );
}
