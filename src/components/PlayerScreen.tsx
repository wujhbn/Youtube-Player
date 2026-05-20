import React, { useRef, useState, useEffect } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { useStore } from '../store/useStore';
import { BigButton } from './BigButton';
import { ArrowLeft, Play, Pause, SkipBack, SkipForward, Maximize, ArrowLeftCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function PlayerScreen() {
  const { playlists, currentPlaylistId, currentSongIndex, navigate, playNext, playPrev, settings } = useStore();
  const playerRef = useRef<any>(null);
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  const resetControlsTimeout = () => {
    setShowControls(true);
    if (hideControlsTimer.current) {
      clearTimeout(hideControlsTimer.current);
    }
    if (isPlaying) {
      hideControlsTimer.current = setTimeout(() => {
        setShowControls(false);
      }, 2000); // Hide after 2 seconds
    }
  };

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    };
  }, [isPlaying]);
  
  const playlist = playlists.find(p => p.id === currentPlaylistId);
  const song = playlist?.songs[currentSongIndex];

  useEffect(() => {
    // When song changes, start playing automatically
    setIsPlaying(true);
  }, [currentSongIndex]);

  if (!playlist || !song) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <BigButton onClick={() => navigate('playlist', currentPlaylistId || undefined)}>抱歉，找不到影片，點我返回</BigButton>
      </div>
    );
  }

  const opts: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      controls: 0, // hide default controls for a custom cute UI
      rel: 0,
      modestbranding: 1,
      disablekb: 1,
      fs: 0,
      iv_load_policy: 3,
      playsinline: 1,
    },
  };

  const onReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
    event.target.playVideo();
  };

  const onStateChange: YouTubeProps['onStateChange'] = (event) => {
    // 1 = playing, 2 = paused, 0 = ended, -1 = unstarted, 3 = buffering, 5 = cued
    if (event.data === 1 || event.data === 3) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
    
    if (event.data === 0) { // ended
      playNext();
    }
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      playerRef.current?.pauseVideo();
    } else {
      playerRef.current?.playVideo();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const iconSize = settings.bigButtonMode ? 48 : 36;
  const largeIconSize = settings.bigButtonMode ? 64 : 48;

  return (
    <div 
      className={cn("flex flex-col bg-black transition-all text-white", isFullscreen ? "fixed inset-0 z-50 pb-[env(safe-area-inset-bottom)] p-0" : "min-h-screen px-4 py-6 sm:p-8 max-w-7xl mx-auto")} 
      style={!isFullscreen ? { paddingTop: 'max(1.5rem, env(safe-area-inset-top))', paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' } : {}}
      onMouseMove={resetControlsTimeout}
      onTouchStart={resetControlsTimeout}
    >
      
      {!isFullscreen && (
        <header className={cn(
          "flex justify-between items-center mb-6 pt-2 px-2 transition-opacity duration-500 z-10 relative",
          !showControls ? "opacity-0 pointer-events-none" : "opacity-100"
        )}>
          <BigButton 
            variant="secondary" 
            onClick={() => navigate('playlist', playlist.id)} 
            icon={<ArrowLeft strokeWidth={3} />}
          >
            回清單
          </BigButton>
          <div className="text-right flex-1 ml-6">
            <h2 className="text-xl sm:text-2xl font-bold truncate text-white">{playlist.name}</h2>
            <p className="text-sm sm:text-base font-medium text-gray-400 mt-1">第 {currentSongIndex + 1} 首 / 共 {playlist.songs.length} 首</p>
          </div>
        </header>
      )}

      {/* Video Container */}
      <div className={cn(
        "relative rounded-3xl bg-black overflow-hidden flex-1 flex flex-col justify-center",
        isFullscreen ? "h-full w-full rounded-none" : "w-full aspect-video md:aspect-auto md:min-h-[500px]"
      )}>
        <YouTube 
          videoId={song.youtubeId} 
          opts={opts} 
          onReady={onReady} 
          onStateChange={onStateChange} 
          className="w-full h-full absolute inset-0 [&>iframe]:w-full [&>iframe]:h-full border-none pointer-events-none"
        />
        
        {/* Overlay to capture touch/mouse events since iframe blocks them */}
        <div 
          className="absolute inset-0 cursor-pointer" 
          onClick={(e) => {
             e.stopPropagation();
             handlePlayPause();
             resetControlsTimeout();
          }}
          onMouseMove={resetControlsTimeout}
          onTouchStart={resetControlsTimeout}
        />
      </div>

      {/* Controls */}
      <div 
        className={cn(
          "transition-opacity duration-500 z-10",
          !showControls ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
      >
        <div className={cn(
          "flex items-center justify-between gap-4 sm:gap-8 mt-6 pb-4",
          isFullscreen && "absolute bottom-10 left-6 right-6"
        )}>
           {/* Left Side */}
           <div className="flex gap-4">
             {isFullscreen && (
                <button 
                  onClick={toggleFullscreen}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#ff8e8b] text-[#4a3a31] flex items-center justify-center transition-all border-[4px] border-[#4a3a31] shadow-[4px_6px_0px_#4a3a31] active:translate-y-[4px] active:shadow-[0px_2px_0px_#4a3a31] hover:brightness-110"
                >
                  <ArrowLeftCircle strokeWidth={2} size={32} />
                </button>
             )}
           </div>

           {/* Center Controls */}
           <div className="flex items-center gap-6 sm:gap-8 mx-auto px-6 py-4 rounded-[40px]">
              {!settings.singleStepMode && (
                <button 
                  onClick={playPrev}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#fffcea] text-[#4a3a31] flex items-center justify-center transition-all border-[4px] border-[#4a3a31] shadow-[4px_6px_0px_#4a3a31] active:translate-y-[4px] active:shadow-[0px_2px_0px_#4a3a31] hover:brightness-110"
                >
                   <SkipBack size={32} strokeWidth={2} fill="currentColor" />
                </button>
              )}

              <motion.button 
                whileHover={{ scale: 1.05 }}
                onClick={handlePlayPause}
                className={cn(
                  "w-20 h-20 sm:w-24 sm:h-24 rounded-full text-[#4a3a31] flex items-center justify-center transition-all border-[4px] border-[#4a3a31] shadow-[4px_6px_0px_#4a3a31] active:translate-y-[4px] active:shadow-[0px_2px_0px_#4a3a31]",
                  isPlaying ? "bg-[#ff8e8b]" : "bg-[#6cc1ff]"
                )}
              >
                 {isPlaying 
                   ? <Pause size={40} strokeWidth={2} fill="currentColor" /> 
                   : <Play size={40} strokeWidth={2} fill="currentColor" className="ml-2" />
                 }
              </motion.button>

                <button 
                  onClick={playNext}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#fffcea] text-[#4a3a31] flex items-center justify-center transition-all border-[4px] border-[#4a3a31] shadow-[4px_6px_0px_#4a3a31] active:translate-y-[4px] active:shadow-[0px_2px_0px_#4a3a31] hover:brightness-110"
                >
                 <SkipForward size={32} strokeWidth={2} fill="currentColor" />
              </button>
           </div>

           {/* Right Side */}
           <div className="flex gap-4">
             {!isFullscreen && !settings.singleStepMode && (
               <button 
                  onClick={toggleFullscreen}
                  className="w-14 h-14 rounded-full bg-[#6ddeba] text-[#4a3a31] flex items-center justify-center transition-all border-[4px] border-[#4a3a31] shadow-[4px_6px_0px_#4a3a31] active:translate-y-[4px] active:shadow-[0px_2px_0px_#4a3a31] hover:brightness-110"
                >
                  <Maximize strokeWidth={3} size={24} />
                </button>
             )}
           </div>
        </div>
      </div>
      
    </div>
  );
}
