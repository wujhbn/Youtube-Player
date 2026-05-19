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
        const res = await fetch(`/api/yt-search?q=${encodeURIComponent(urlInput)}`);
        
        // Handle AI Studio Proxy Cookie Check for PWAs
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("text/html")) {
          setShowAuthIframe(true);
          setLoading(false);
          return;
        }

        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        if (data && data.length > 0) {
          setSearchResults(data);
          setIsSearchModalOpen(true);
        } else {
          setAlertMessage("找不到影片，換個關鍵字試試看！");
        }
      } catch (err) {
        setAlertMessage("搜尋失敗，請稍後再試！");
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/yt-info?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}`);
      
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
    } catch (err) {
      console.error(err);
      setAlertMessage("無法取得影片資訊，但已加入列表。");
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
    setUrlInput('');
    setAlertMessage("加好了！");
  };

  const titleSize = settings.bigButtonMode ? 'text-6xl' : 'text-5xl';
  const textSize = settings.bigButtonMode ? 'text-4xl' : 'text-2xl';

  return (
    <div className="min-h-screen px-4 sm:px-12 max-w-7xl mx-auto flex flex-col gap-6" style={{ paddingTop: 'max(2rem, env(safe-area-inset-top))', paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
      <header className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <BigButton variant="secondary" onClick={() => navigate('home')} icon={<ArrowLeft strokeWidth={2} />} className="p-3">
            返回
          </BigButton>
          <h1 className={`${titleSize} font-bold text-gray-900 tracking-tight truncate max-w-[200px] sm:max-w-md`}>
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
        <Card className="flex flex-col gap-4 p-6 sm:p-8 mt-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900"><Plus strokeWidth={2} /> 加新影片進來</h2>
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
              className={`flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-medium outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all ${textSize}`}
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
            className="flex flex-col gap-3 p-4 hover:bg-gray-50/50 cursor-pointer border-none shadow-sm"
            onClick={() => {
              useStore.getState().playPlaylist(playlist.id, idx);
              navigate('player', playlist.id);
            }}
          >
            <div className="absolute top-3 right-3 z-10 flex gap-2">
              {!settings.singleStepMode && (
                  <button 
                  className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center hover:bg-red-50 active:scale-95 text-gray-500 hover:text-red-500 transition-colors shadow-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSongToDelete(song.id);
                  }}
                >
                  <Trash2 size={16} strokeWidth={2} />
                </button>
              )}
            </div>

            <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
              <img src={song.thumbnail} alt={song.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                 <Play className="text-white w-12 h-12 drop-shadow-md" fill="currentColor" />
              </div>
            </div>
            
            <h3 className={`${settings.bigButtonMode ? 'text-xl' : 'text-base'} font-bold line-clamp-2 mt-1 leading-snug text-gray-900`}>
              {song.title}
            </h3>
          </Card>
        ))}
        {playlist.songs.length === 0 && (
          <div className="col-span-full text-center py-24 text-xl font-medium text-gray-400 bg-white rounded-[32px] border border-gray-100 shadow-sm">
             還沒有影片喔，趕快加入吧！
          </div>
        )}
      </div>

      <Modal isOpen={!!songToDelete}>
        <h2 className="text-2xl font-bold text-center text-gray-900 tracking-tight">確定要刪除這個影片嗎？</h2>
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
        <h2 className="text-xl font-bold text-center text-gray-900 leading-normal tracking-tight">{alertMessage}</h2>
        <div className="flex justify-center mt-8">
          <BigButton variant="primary" className="flex-1" onClick={() => setAlertMessage('')}>我知道了</BigButton>
        </div>
      </Modal>

      <Modal isOpen={isSearchModalOpen}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">選一個你想加的影片</h2>
          <button className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors font-bold" onClick={() => setIsSearchModalOpen(false)}>
             取消
          </button>
        </div>
        <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-2">
          {searchResults.map((video, i) => (
            <div 
              key={i} 
              className="flex items-center gap-4 p-3 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors active:scale-[0.98] bg-white border border-gray-100 shadow-sm"
              onClick={() => handleSelectSearchResult(video)}
            >
              <img src={video.thumbnail} alt={video.title} className="w-32 aspect-video object-cover rounded-lg bg-gray-100" />
              <h3 className="text-sm font-bold flex-1 line-clamp-3 text-gray-900 leading-snug">{video.title}</h3>
            </div>
          ))}
        </div>
      </Modal>

      <Modal isOpen={showAuthIframe}>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-4 text-center">需要驗證以啟用搜尋</h2>
        <p className="text-gray-600 mb-4 text-sm text-center">iOS 阻擋了應用程式的連線。請在下方點擊「Allow」或「允許」來驗證。</p>
        <div className="w-full h-[400px] border-2 border-gray-200 rounded-xl overflow-hidden bg-gray-50 mb-4 relative">
          <iframe 
            src="/api/yt-search"
            className="w-full h-full border-none"
            title="auth-frame"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <BigButton variant="success" className="flex-1" onClick={() => {
            setShowAuthIframe(false);
            handleAddYoutube();
          }}>我已經點了（再試一次）</BigButton>
          <BigButton variant="secondary" className="flex-1" onClick={() => setShowAuthIframe(false)}>取消</BigButton>
        </div>
      </Modal>
    </div>
  );
}
