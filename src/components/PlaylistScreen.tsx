import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Card } from './Card';
import { BigButton } from './BigButton';
import { ArrowLeft, Play, Plus, Trash2, Home, Film } from 'lucide-react';
import { Modal } from './Modal';

export function PlaylistScreen() {
  const { playlists, activePlaylistId, navigate, addSong, deleteSong, playPlaylist, settings } = useStore();
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [songToDelete, setSongToDelete] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState('');

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<any>(null);
  const [showAuthIframe, setShowAuthIframe] = useState(false);

  const playlist = playlists.find(p => p.id === activePlaylistId);

  if (!playlist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <BigButton onClick={() => navigate('home')}>回首頁</BigButton>
      </div>
    );
  }

  const handleAddYoutube = async () => {
    if (!urlInput.trim()) return;
    
    // Very simple Youtube ID extraction
    let videoId = "";
    try {
      const urlObj = new URL(urlInput);
      if (urlObj.hostname.includes('youtube.com')) {
        videoId = urlObj.searchParams.get('v') || "";
      } else if (urlObj.hostname.includes('youtu.be')) {
        videoId = urlObj.pathname.slice(1);
      }
    } catch (e) {
      // Not a valid URL, treat as search query
    }

    if (!videoId) {
      // Perform search instead!
      setLoading(true);
      try {
        const res = await fetch(`/api/video-search?q=${encodeURIComponent(urlInput)}`);
        
        // Handle AI Studio Proxy Cookie Check for PWAs
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("text/html")) {
          setShowAuthIframe(true);
          setLoading(false);
          return;
        }

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Search failed: ${res.status} ${text}`);
        }
        const data = await res.json();
        if (data && data.length > 0) {
          setSearchResults(data);
          setIsSearchModalOpen(true);
        } else {
          setAlertMessage("找不到影片，換個關鍵字試試看！");
        }
      } catch (err: any) {
        setAlertMessage(`搜尋失敗: ${err.message || String(err)}`);
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/video-info?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}`);
      
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        setShowAuthIframe(true);
        setLoading(false);
        return;
      }
      
      let title = `影片 ${videoId}`;
      let thumbnail = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
      
      if (res.ok) {
        const data = await res.json();
        title = data.title || title;
        thumbnail = data.thumbnail || thumbnail;
      }
      
      addSong(playlist.id, {
        youtubeId: videoId,
        title,
        thumbnail
      });
      setUrlInput('');
      setAlertMessage("加好了！");
    } catch (err: any) {
      console.error(err);
      setAlertMessage(`無法取得影片資訊 (${err.message})，但已加入列表。`);
      addSong(playlist.id, {
        youtubeId: videoId,
        title: `新影片`,
        thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
      });
      setUrlInput('');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSearchResult = (video: any) => {
    addSong(playlist.id, {
      youtubeId: video.videoId,
      title: video.title,
      thumbnail: video.thumbnail
    });
    setIsSearchModalOpen(false);
    setPreviewVideo(null);
    setUrlInput('');
    setAlertMessage("加好了！");
  };

  const titleSize = settings.bigButtonMode ? 'text-4xl sm:text-6xl' : 'text-3xl sm:text-5xl';
  const textSize = settings.bigButtonMode ? 'text-2xl sm:text-4xl' : 'text-lg sm:text-2xl';

  return (
    <div className="min-h-screen px-4 sm:px-12 max-w-7xl mx-auto flex flex-col gap-6" style={{ paddingTop: 'max(2rem, env(safe-area-inset-top))', paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
      <header className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-4">
        <div className="flex items-center gap-4 w-full sm:w-auto overflow-hidden pr-2">
          <BigButton variant="secondary" onClick={() => navigate('home')} icon={<ArrowLeft strokeWidth={2} />} className="p-3 shrink-0">
            返回
          </BigButton>
          <h1 className={`${titleSize} font-extrabold text-[#4a3a31] drop-shadow-sm tracking-tight truncate flex-1 min-w-0 pb-1 pt-1`}>
            {playlist.name}
          </h1>
        </div>
        
        {playlist.songs.length > 0 && (
          <BigButton 
            variant="primary" 
            onClick={() => navigate('player', playlist.id)} 
            icon={<Play fill="currentColor" strokeWidth={3} />}
          >
            開始看影片！
          </BigButton>
        )}
      </header>

      {!settings.singleStepMode && (
        <Card className="flex flex-col gap-4 p-6 sm:p-8 mt-4 bg-[#6cc1ff]" color="bg-[#6cc1ff]">
          <h2 className="text-xl font-extrabold flex items-center gap-2 text-[#4a3a31]"><Plus strokeWidth={4} /> 加新影片進來 🎬</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text" 
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  (e.target as HTMLInputElement).blur();
                  handleAddYoutube();
                }
              }}
              placeholder="請貼上網址，或輸入關鍵字搜尋..."
              className={`flex-1 rounded-[20px] border-[4px] border-[#4a3a31] bg-[#fffcea] text-[#4a3a31] px-5 py-4 font-bold outline-none focus:bg-white focus:shadow-[2px_4px_0px_#4a3a31] transition-all ${textSize}`}
            />
            <BigButton variant="success" onClick={handleAddYoutube} disabled={loading} className="py-3 px-6">
              {loading ? '讀取中...' : '找找看'}
            </BigButton>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
        {playlist.songs.map((song, idx) => (
          <Card 
            key={song.id} 
            color="bg-white"
            className="flex flex-col gap-3 p-4 hover:bg-white cursor-pointer"
            onClick={() => {
              useStore.getState().playPlaylist(playlist.id, idx);
              navigate('player', playlist.id);
            }}
          >
            <div className="absolute top-3 right-3 z-10 flex gap-2">
              {!settings.singleStepMode && (
                  <button 
                  className="w-10 h-10 rounded-full bg-[#ff8e8b] border-[3px] border-[#4a3a31] flex items-center justify-center hover:brightness-110 active:translate-y-[2px] text-[#4a3a31] transition-transform shadow-[2px_2px_0px_#4a3a31]"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSongToDelete(song.id);
                  }}
                >
                  <Trash2 size={20} strokeWidth={3} />
                </button>
              )}
            </div>

            <div className="relative aspect-video rounded-[24px] overflow-hidden bg-[#fffcea] border-[3px] border-[#4a3a31] box-border">
              <img src={song.thumbnail} alt={song.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                 <Play className="text-white w-12 h-12 drop-shadow-md" fill="currentColor" />
              </div>
            </div>
            
            <h3 className={`${settings.bigButtonMode ? 'text-2xl' : 'text-xl'} font-extrabold line-clamp-2 mt-1 leading-snug text-[#4a3a31]`}>
              {song.title}
            </h3>
          </Card>
        ))}
        {playlist.songs.length === 0 && (
          <div 
            className="col-span-full text-center py-24 text-xl font-bold text-[#4a3a31] bg-white rounded-[32px] border-[4px] border-[#4a3a31] shadow-[4px_6px_0px_#4a3a31] cursor-pointer hover:bg-[#fffcea] active:translate-y-[2px] transition-all"
            onClick={() => {
              const input = document.querySelector('input');
              if (input) {
                input.focus();
                input.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }}
          >
             🪹 還沒有影片喔，趕快加入吧！
          </div>
        )}
      </div>

      <Modal isOpen={!!songToDelete}>
        <h2 className="text-2xl font-extrabold text-center text-[#4a3a31] tracking-tight">確定要刪除這個影片嗎？ 🗑️</h2>
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <BigButton variant="danger" className="flex-1" onClick={() => {
            if (songToDelete) {
              deleteSong(playlist.id, songToDelete);
            }
            setSongToDelete(null);
          }}>確定刪除</BigButton>
          <BigButton variant="secondary" className="flex-1 text-4xl py-6" onClick={() => setSongToDelete(null)}>取消</BigButton>
        </div>
      </Modal>

      <Modal isOpen={!!alertMessage}>
        <h2 className="text-xl font-extrabold text-center text-[#4a3a31] leading-normal tracking-tight">{alertMessage} 💡</h2>
        <div className="flex justify-center mt-8">
          <BigButton variant="primary" className="flex-1" onClick={() => setAlertMessage('')}>我知道了</BigButton>
        </div>
      </Modal>

      <Modal isOpen={isSearchModalOpen}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-extrabold text-[#4a3a31] tracking-tight">{previewVideo ? '預覽影片 👀' : '選一個你想加的影片 👀'}</h2>
          <button className="text-[#4a3a31] hover:bg-[#fffcea] p-2 rounded-full transition-colors font-bold" onClick={() => { setIsSearchModalOpen(false); setPreviewVideo(null); }}>
             取消
          </button>
        </div>
        
        {previewVideo ? (
          <div className="flex flex-col gap-4">
            <div className="aspect-video w-full rounded-[16px] overflow-hidden border-[4px] border-[#4a3a31] shadow-[4px_6px_0px_#4a3a31] bg-black">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${previewVideo.videoId}?autoplay=1`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <h3 className="text-lg font-bold text-[#4a3a31] line-clamp-2 leading-snug">{previewVideo.title}</h3>
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <BigButton 
                variant="success" 
                className="flex-1" 
                onClick={() => handleSelectSearchResult(previewVideo)}
                icon={<Plus strokeWidth={3} />}
              >
                加入清單
              </BigButton>
              <BigButton 
                variant="secondary" 
                className="flex-1" 
                onClick={() => setPreviewVideo(null)}
                icon={<ArrowLeft strokeWidth={3} />}
              >
                返回搜尋
              </BigButton>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-2">
            {searchResults.map((video, i) => (
               <div 
                key={i} 
                className="flex items-center gap-4 p-3 rounded-[24px] cursor-pointer hover:bg-white transition-colors active:translate-y-[2px] bg-[#fffcea] border-[3px] border-[#4a3a31] box-border shadow-[2px_2px_0px_#4a3a31]"
                onClick={() => setPreviewVideo(video)}
              >
                <img src={video.thumbnail} alt={video.title} className="w-32 aspect-video object-cover rounded-[16px] border-[2px] border-[#4a3a31]" />
                <h3 className="text-md font-bold flex-1 line-clamp-3 text-[#4a3a31] leading-snug">{video.title}</h3>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <Modal isOpen={showAuthIframe}>
        <h2 className="text-xl font-extrabold text-[#4a3a31] tracking-tight mb-4 text-center">需要驗證連線 🔐</h2>
        <p className="text-[#4a3a31] mb-6 text-md font-bold text-center bg-[#fffcea] p-4 rounded-[20px] border-[3px] border-[#4a3a31]">Apple 系統需要您手動允許搜尋連線。<br/><br/>點擊下方按鈕後，請點擊「Allow」或「允許」，接著會自動回到本應用程式。</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <BigButton variant="success" className="flex-1" onClick={() => {
            window.location.href = "/api/auth";
          }}>前往驗證</BigButton>
          <BigButton variant="secondary" className="flex-1" onClick={() => setShowAuthIframe(false)}>取消</BigButton>
        </div>
      </Modal>
    </div>
  );
}
