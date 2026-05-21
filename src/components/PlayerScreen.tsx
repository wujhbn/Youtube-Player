import React, { useRef, useState, useEffect } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { useStore } from '../store/useStore';
import { BigButton } from './BigButton';
import { ArrowLeft, Play, Pause, SkipBack, SkipForward, Maximize, ArrowLeftCircle, Volume2, VolumeX, FastForward } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function PlayerScreen() {
  const { playlists, currentPlaylistId, currentSongIndex, navigate, playNext, playPrev, settings } = useStore();
  const playerRef = useRef<any>(null);
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  
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
    setVolume(event.target.getVolume());
    setIsMuted(event.target.isMuted());
    setPlaybackRate(event.target.getPlaybackRate() || 1);
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
    if (!playerRef.current) return;
    const state = playerRef.current.getPlayerState();
    // 1 = playing, 3 = buffering
    if (state === 1 || state === 3) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const handleToggleMute = () => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
      playerRef.current.setVolume(volume);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  const handleCycleSpeed = () => {
    if (!playerRef.current) return;
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    playerRef.current.setPlaybackRate(nextRate);
    setPlaybackRate(nextRate);
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
          "flex flex-wrap items-center justify-center sm:justify-between gap-y-4 gap-x-2 sm:gap-8 mt-2 sm:mt-6 pb-2 sm:pb-4 pointer-events-auto",
          isFullscreen && "absolute bottom-4 sm:bottom-10 left-2 right-2 sm:left-6 sm:right-6 pointer-events-none"
        )}>
           {/* Left Side */}
           <div className={cn(
             "flex items-center gap-2 sm:gap-4 pointer-events-auto",
             isFullscreen ? "absolute top-[-50px] left-0 sm:relative sm:top-0" : ""
           )}>
             {isFullscreen && (
                <button 
                  onClick={toggleFullscreen}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#ff8e8b] text-[#4a3a31] flex items-center justify-center transition-all border-[3px] sm:border-[4px] border-[#4a3a31] shadow-[2px_4px_0px_#4a3a31] sm:shadow-[4px_6px_0px_#4a3a31] active:translate-y-[4px] active:shadow-[0px_2px_0px_#4a3a31] hover:brightness-110"
                >
                  <ArrowLeftCircle strokeWidth={2} className="w-7 h-7 sm:w-8 sm:h-8" />
                </button>
             )}
             
             <button
               onClick={handleToggleMute}
               className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#fffcea] text-[#4a3a31] flex items-center justify-center transition-all border-[3px] sm:border-[4px] border-[#4a3a31] shadow-[2px_4px_0px_#4a3a31] sm:shadow-[4px_6px_0px_#4a3a31] active:translate-y-[4px] active:shadow-[0px_2px_0px_#4a3a31] hover:brightness-110"
             >
               {isMuted ? <VolumeX className="w-6 h-6 sm:w-6 sm:h-6" strokeWidth={3} /> : <Volume2 className="w-6 h-6 sm:w-6 sm:h-6" strokeWidth={3} />}
             </button>
           </div>

           {/* Center Controls */}
           <div className="flex items-center gap-4 sm:gap-8 mx-auto px-4 sm:px-6 py-2 sm:py-4 rounded-[40px] pointer-events-auto">
              {!settings.singleStepMode && (
                <button 
                  onClick={playPrev}
                  className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-[#fffcea] text-[#4a3a31] flex items-center justify-center transition-all border-[3px] sm:border-[4px] border-[#4a3a31] shadow-[2px_4px_0px_#4a3a31] sm:shadow-[4px_6px_0px_#4a3a31] active:translate-y-[4px] active:shadow-[0px_2px_0px_#4a3a31] hover:brightness-110"
                >
                   <SkipBack className="w-6 h-6 sm:w-8 sm:h-8" strokeWidth={2} fill="currentColor" />
                </button>
              )}

              <button 
                onClick={handlePlayPause}
                className={cn(
                  "w-16 h-16 sm:w-24 sm:h-24 rounded-full text-[#4a3a31] flex items-center justify-center transition-all border-[3px] sm:border-[4px] border-[#4a3a31] shadow-[2px_4px_0px_#4a3a31] sm:shadow-[4px_6px_0px_#4a3a31] active:translate-y-[4px] active:shadow-[0px_2px_0px_#4a3a31] hover:brightness-110",
                  isPlaying ? "bg-[#ff8e8b]" : "bg-[#6cc1ff]"
                )}
              >
                 {isPlaying 
                   ? <Pause className="w-8 h-8 sm:w-10 sm:h-10" strokeWidth={2} fill="currentColor" /> 
                   : <Play className="w-8 h-8 sm:w-10 sm:h-10 ml-1 sm:ml-2" strokeWidth={2} fill="currentColor" />
                 }
              </button>

                <button 
                  onClick={playNext}
                  className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-[#fffcea] text-[#4a3a31] flex items-center justify-center transition-all border-[3px] sm:border-[4px] border-[#4a3a31] shadow-[2px_4px_0px_#4a3a31] sm:shadow-[4px_6px_0px_#4a3a31] active:translate-y-[4px] active:shadow-[0px_2px_0px_#4a3a31] hover:brightness-110"
                >
                 <SkipForward className="w-6 h-6 sm:w-8 sm:h-8" strokeWidth={2} fill="currentColor" />
              </button>
           </div>

           {/* Right Side */}
           <div className={cn(
             "flex items-center gap-2 sm:gap-4 pointer-events-auto",
             isFullscreen ? "absolute top-[-50px] right-0 sm:relative sm:top-0" : ""
           )}>
             <button
               onClick={handleCycleSpeed}
               className="h-10 sm:h-14 px-3 sm:px-4 rounded-[24px] bg-[#fffcea] text-[#4a3a31] font-bold text-sm sm:text-lg flex items-center justify-center transition-all border-[3px] sm:border-[4px] border-[#4a3a31] shadow-[2px_4px_0px_#4a3a31] sm:shadow-[4px_6px_0px_#4a3a31] active:translate-y-[4px] active:shadow-[0px_2px_0px_#4a3a31] hover:brightness-110"
             >
               {playbackRate}x
             </button>

             {!isFullscreen && !settings.singleStepMode && (
               <button 
                  onClick={toggleFullscreen}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#6ddeba] text-[#4a3a31] flex items-center justify-center transition-all border-[3px] sm:border-[4px] border-[#4a3a31] shadow-[2px_4px_0px_#4a3a31] sm:shadow-[4px_6px_0px_#4a3a31] active:translate-y-[4px] active:shadow-[0px_2px_0px_#4a3a31] hover:brightness-110"
                >
                  <Maximize strokeWidth={3} className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
             )}
           </div>
        </div>
      </div>
      
    </div>
  );
}
