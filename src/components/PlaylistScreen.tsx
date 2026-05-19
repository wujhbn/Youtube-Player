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

  const playlist = playlists.find(p => p.id === activePlaylistId);

  if (!playlist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <BigButton onClick={() => navigate('home')}>回首頁</BigButton>
      </div>
    );
  }

  const handleAddYoutube = async () => {
    if (!urlInput) return;
    
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
      // ignore
    }

    if (!videoId) {
      setAlertMessage("請貼上正確的 YouTube 網址！");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/yt-info?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}`);
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

  const titleSize = settings.bigButtonMode ? 'text-6xl' : 'text-5xl';
  const textSize = settings.bigButtonMode ? 'text-4xl' : 'text-2xl';

  return (
    <div className="min-h-screen p-6 sm:p-12 max-w-7xl mx-auto flex flex-col gap-8">
      <header className="flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <BigButton variant="secondary" onClick={() => navigate('home')} icon={<ArrowLeft strokeWidth={3} />}>
            返回
          </BigButton>
          <h1 className={`${titleSize} font-black text-stone-800 drop-shadow-[3px_3px_0_#93c5fd]`}>
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
        <Card color="bg-green-100" className="flex flex-col gap-6 p-8">
          <h2 className="text-3xl font-black flex items-center gap-4"><Plus strokeWidth={3} /> 加新影片進來</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <input 
              type="text" 
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              placeholder="請貼上 YouTube 網址..."
              className={`flex-1 rounded-[1.5rem] border-[6px] border-stone-800 px-6 py-4 font-bold outline-none focus:border-pink-400 focus:bg-pink-50 transition-colors shadow-[4px_4px_0_0_#292524] ${textSize}`}
            />
            <BigButton variant="success" onClick={handleAddYoutube} disabled={loading}>
              {loading ? '讀取中...' : '確定加入'}
            </BigButton>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
        {playlist.songs.map((song, idx) => (
          <Card 
            key={song.id} 
            color="bg-white" 
            className="flex flex-col gap-4 p-6 hover:bg-orange-50 cursor-pointer"
            onClick={() => {
              useStore.getState().playPlaylist(playlist.id, idx);
              navigate('player', playlist.id);
            }}
          >
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              {!settings.singleStepMode && (
                  <button 
                  className="w-14 h-14 rounded-full bg-pink-100 border-4 border-stone-800 flex items-center justify-center hover:bg-pink-200 active:scale-95 shadow-[4px_4px_0_0_#292524]"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSongToDelete(song.id);
                  }}
                >
                  <Trash2 size={24} strokeWidth={3} />
                </button>
              )}
            </div>

            <div className="relative aspect-video rounded-2xl overflow-hidden border-4 border-stone-800 shadow-[4px_4px_0_0_#292524]">
              <img src={song.thumbnail} alt={song.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                 <Play className="text-white w-20 h-20 drop-shadow-lg" fill="currentColor" />
              </div>
            </div>
            
            <h3 className={`${settings.bigButtonMode ? 'text-3xl' : 'text-2xl'} font-black line-clamp-2 mt-2 leading-snug`}>
              {song.title}
            </h3>
          </Card>
        ))}
        {playlist.songs.length === 0 && (
          <div className="col-span-full text-center py-20 text-3xl font-black text-stone-400 border-8 border-dashed border-stone-300 rounded-[3rem]">
             還沒有影片喔，趕快加入吧！
          </div>
        )}
      </div>

      <Modal isOpen={!!songToDelete}>
        <h2 className="text-4xl font-black text-center text-stone-800">確定要刪除這個影片嗎？</h2>
        <div className="flex flex-col sm:flex-row gap-6 mt-4">
          <BigButton variant="danger" className="flex-1 text-4xl py-6" onClick={() => {
            if (songToDelete) {
              deleteSong(playlist.id, songToDelete);
            }
            setSongToDelete(null);
          }}>確定刪除</BigButton>
          <BigButton variant="secondary" className="flex-1 text-4xl py-6" onClick={() => setSongToDelete(null)}>取消</BigButton>
        </div>
      </Modal>

      <Modal isOpen={!!alertMessage}>
        <h2 className="text-4xl font-black text-center text-stone-800 leading-normal">{alertMessage}</h2>
        <div className="flex justify-center mt-8">
          <BigButton variant="primary" className="text-4xl py-6 px-12" onClick={() => setAlertMessage('')}>我知道了</BigButton>
        </div>
      </Modal>
    </div>
  );
}
