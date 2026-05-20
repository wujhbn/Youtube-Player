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
      iv_load_policy: 3
    },
  };

  const onReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
    event.target.playVideo();
  };

  const onStateChange: YouTubeProps['onStateChange'] = (event) => {
    // 1 = playing, 2 = paused
    if (event.data === 1) setIsPlaying(true);
    if (event.data === 2) setIsPlaying(false);
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
            className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md rounded-full shadow-none border border-white/20 px-4 py-2"
            icon={<ArrowLeft strokeWidth={2} className="text-white" />}
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
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleFullscreen}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <ArrowLeftCircle strokeWidth={2} size={32} />
                </motion.button>
             )}
           </div>

           {/* Center Controls */}
           <div className="flex items-center gap-6 sm:gap-8 mx-auto px-6 py-4 rounded-[40px]">
              {!settings.singleStepMode && (
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={playPrev}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white flex items-center justify-center transition-colors"
                >
                   <SkipBack size={32} strokeWidth={2} fill="currentColor" />
                </motion.button>
              )}

              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePlayPause}
                className={cn(
                  "w-20 h-20 sm:w-24 sm:h-24 rounded-full text-white flex items-center justify-center transition-all shadow-lg",
                  isPlaying ? "bg-red-500 hover:bg-red-400" : "bg-white text-black hover:bg-gray-100"
                )}
              >
                 {isPlaying 
                   ? <Pause size={40} strokeWidth={2} fill="currentColor" /> 
                   : <Play size={40} strokeWidth={2} fill="currentColor" className="ml-2" />
                 }
              </motion.button>

              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={playNext}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white flex items-center justify-center transition-colors"
              >
                 <SkipForward size={32} strokeWidth={2} fill="currentColor" />
              </motion.button>
           </div>

           {/* Right Side */}
           <div className="flex gap-4">
             {!isFullscreen && !settings.singleStepMode && (
               <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleFullscreen}
                  className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white flex items-center justify-center transition-colors"
                >
                  <Maximize strokeWidth={2} size={24} />
                </motion.button>
             )}
           </div>
        </div>
      </div>
      
    </div>
  );
}
