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
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimerRef = useRef<NodeJS.Timeout|null>(null);
  
  // Auto-hide controls logic
  const resetControlsTimer = () => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    resetControlsTimer();
    return () => {
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    };
  }, [isPlaying]);

  useEffect(() => {
    const handleEvents = () => resetControlsTimer();
    window.addEventListener('mousemove', handleEvents);
    window.addEventListener('touchstart', handleEvents);
    window.addEventListener('click', handleEvents);
    return () => {
      window.removeEventListener('mousemove', handleEvents);
      window.removeEventListener('touchstart', handleEvents);
      window.removeEventListener('click', handleEvents);
    };
  }, []);
  
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
    <div className={cn("flex flex-col bg-stone-900 transition-all text-white", isFullscreen ? "fixed inset-0 z-50 p-2" : "min-h-screen p-4 sm:p-8 max-w-7xl mx-auto")}>
      
      <AnimatePresence>
        {showControls && !isFullscreen && (
          <motion.header 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex justify-between items-center mb-6"
          >
            <BigButton 
              variant="secondary" 
              onClick={() => navigate('playlist', playlist.id)} 
              className="border-stone-400 bg-white shadow-[0_8px_0_0_#78716c]"
              icon={<ArrowLeft strokeWidth={3} className="text-stone-800" />}
            >
              回清單
            </BigButton>
            <div className="text-right flex-1 ml-6 text-stone-100">
              <h2 className="text-3xl sm:text-4xl font-black truncate">{playlist.name}</h2>
              <p className="text-xl sm:text-2xl font-bold text-stone-400 mt-2">第 {currentSongIndex + 1} 首 / 共 {playlist.songs.length} 首</p>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Video Container */}
      <div className={cn(
        "relative rounded-[2rem] border-8 border-stone-700 bg-black overflow-hidden flex-1 flex flex-col justify-center",
        isFullscreen ? "h-[calc(100vh-140px)]" : "w-full aspect-video md:aspect-auto md:min-h-[500px]"
      )}>
        <YouTube 
          videoId={song.youtubeId} 
          opts={opts} 
          onReady={onReady} 
          onStateChange={onStateChange} 
          className="w-full h-full absolute inset-0 [&>iframe]:w-full [&>iframe]:h-full border-none"
        />
      </div>

      {/* Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={cn(
              "flex items-center justify-between gap-4 sm:gap-8 mt-6",
              isFullscreen && "absolute bottom-6 left-6 right-6 z-20"
            )}
          >
             {/* Left Side */}
             <div className="flex gap-4">
               {isFullscreen && (
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleFullscreen}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white border-[6px] border-stone-800 text-stone-800 flex items-center justify-center shadow-[0_6px_0_0_#292524] active:shadow-none active:translate-y-[6px]"
                  >
                    <ArrowLeftCircle strokeWidth={3} size={40} />
                  </motion.button>
               )}
             </div>

             {/* Center Controls */}
             <div className="flex items-center gap-4 sm:gap-6 mx-auto bg-stone-800/90 backdrop-blur-md p-4 sm:p-6 rounded-[3rem] border-[6px] border-stone-700 shadow-2xl">
                {!settings.singleStepMode && (
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={playPrev}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-orange-100 border-[6px] border-stone-800 text-stone-800 flex items-center justify-center shadow-[0_6px_0_0_#292524] active:shadow-none active:translate-y-[6px]"
                  >
                     <SkipBack size={iconSize} strokeWidth={3} fill="currentColor" />
                  </motion.button>
                )}

                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePlayPause}
                  className={cn(
                    "w-28 h-28 sm:w-36 sm:h-36 rounded-full border-[8px] border-stone-800 text-stone-800 flex items-center justify-center shadow-[0_8px_0_0_#292524] active:shadow-none active:translate-y-[8px] transition-colors",
                    isPlaying ? "bg-pink-300 hover:bg-pink-200" : "bg-green-400 hover:bg-green-300"
                  )}
                >
                   {isPlaying 
                     ? <Pause size={largeIconSize} strokeWidth={3} fill="currentColor" /> 
                     : <Play size={largeIconSize} strokeWidth={3} fill="currentColor" className="ml-4" />
                   }
                </motion.button>

                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={playNext}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-orange-100 border-[6px] border-stone-800 text-stone-800 flex items-center justify-center shadow-[0_6px_0_0_#292524] active:shadow-none active:translate-y-[6px]"
                >
                   <SkipForward size={iconSize} strokeWidth={3} fill="currentColor" />
                </motion.button>
             </div>

             {/* Right Side */}
             <div className="flex gap-4">
               {!isFullscreen && !settings.singleStepMode && (
                 <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleFullscreen}
                    className="w-20 h-20 rounded-2xl bg-blue-300 border-[6px] border-stone-800 text-stone-800 flex items-center justify-center shadow-[0_6px_0_0_#292524] active:shadow-none active:translate-y-[6px]"
                  >
                    <Maximize strokeWidth={3} size={36} />
                  </motion.button>
               )}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
