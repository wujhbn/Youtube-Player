import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Card } from './Card';
import { BigButton } from './BigButton';
import { Plus, Music, Settings, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from './Modal';

export function HomeScreen() {
  const { playlists, navigate, addPlaylist, deletePlaylist, settings, toggleBigButtonMode, toggleSingleStepMode } = useStore();
  const [showSettings, setShowSettings] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('我的新音樂');
  const [playlistToDelete, setPlaylistToDelete] = useState<string | null>(null);

  const handleAdd = () => {
    setNewPlaylistName('我的新音樂');
    setIsAddModalOpen(true);
  };

  const confirmAdd = () => {
    if (newPlaylistName.trim()) {
      addPlaylist(newPlaylistName.trim());
    }
    setIsAddModalOpen(false);
  };

  const titleSize = settings.bigButtonMode ? 'text-6xl' : 'text-4xl sm:text-5xl';
  const cardTitleSize = settings.bigButtonMode ? 'text-5xl' : 'text-3xl';
  const iconSize = settings.bigButtonMode ? 80 : 64;

  return (
    <div className="min-h-screen p-6 sm:p-12 max-w-7xl mx-auto flex flex-col gap-12">
      <header className="flex flex-col sm:flex-row justify-between items-center gap-6">
        <h1 className={`${titleSize} font-black text-stone-800 drop-shadow-[3px_3px_0_#fff59d]`}>
          📺 YouTube 播放器
        </h1>
        <div className="flex gap-4 w-full sm:w-auto">
          <BigButton variant="success" onClick={handleAdd} icon={<Plus strokeWidth={3} />} className="flex-1 sm:flex-none">
            新增
          </BigButton>
          <BigButton variant="secondary" onClick={() => setShowSettings(!showSettings)} icon={<Settings strokeWidth={3} />} className="flex-1 sm:flex-none">
            設定
          </BigButton>
        </div>
      </header>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card color="bg-pink-100" className="flex flex-col gap-6">
              <h2 className="text-3xl font-black">⚙️ 特別設定</h2>
              <div className="flex flex-wrap gap-6">
                <BigButton 
                  variant={settings.bigButtonMode ? 'primary' : 'secondary'} 
                  onClick={toggleBigButtonMode}
                >
                  {settings.bigButtonMode ? '✅ 超大按鈕模式：開' : '⬜ 超大按鈕模式：關'}
                </BigButton>
                <BigButton 
                  variant={settings.singleStepMode ? 'primary' : 'secondary'} 
                  onClick={toggleSingleStepMode}
                >
                  {settings.singleStepMode ? '✅ 簡單畫面模式：開' : '⬜ 簡單畫面模式：關'}
                </BigButton>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {playlists.map((playlist) => (
          <Card 
            key={playlist.id} 
            color="bg-blue-100"
            className="flex flex-col gap-6 items-center justify-center p-12 min-h-[300px]"
            onClick={() => navigate('playlist', playlist.id)}
          >
            <div className="absolute top-4 right-4 z-10" onClick={(e) => e.stopPropagation()}>
               <button 
                  className="w-16 h-16 rounded-full bg-pink-300 border-4 border-stone-800 flex items-center justify-center hover:bg-pink-400 active:scale-95 shadow-[2px_2px_0_0_#292524]"
                  onClick={() => setPlaylistToDelete(playlist.id)}
               >
                 <Trash2 size={32} strokeWidth={3} />
               </button>
            </div>

            {playlist.coverImg ? (
              <img 
                src={playlist.coverImg} 
                alt={playlist.name} 
                className="w-48 h-32 rounded-2xl border-4 border-stone-800 object-cover shadow-[2px_2px_0_0_#292524]"
              />
            ) : (
              <div className="w-48 h-32 rounded-2xl border-4 border-stone-800 bg-orange-200 flex items-center justify-center shadow-[2px_2px_0_0_#292524]">
                <Music size={iconSize} strokeWidth={3} className="text-stone-800 opacity-50" />
              </div>
            )}
            <h2 className={`${cardTitleSize} font-black text-center mt-4`}>
              {playlist.name}
            </h2>
            <div className="text-2xl font-bold bg-white/50 px-6 py-2 rounded-full border-4 border-transparent">
              {playlist.songs.length} 首歌
            </div>
          </Card>
        ))}
        {playlists.length === 0 && (
          <div className="col-span-full text-center py-20 text-3xl font-black text-stone-400 border-8 border-dashed border-stone-300 rounded-[3rem]">
             還沒有歌單喔，按上面的「新增」來建立吧！
          </div>
        )}
      </div>

      <Modal isOpen={isAddModalOpen}>
        <h2 className="text-4xl font-black text-stone-800">幫新歌單取個名字吧：</h2>
        <input 
          type="text" 
          value={newPlaylistName} 
          onChange={e => setNewPlaylistName(e.target.value)} 
          className="text-3xl font-bold p-6 rounded-2xl border-[6px] border-stone-800 bg-white focus:bg-pink-50 outline-none w-full shadow-[2px_2px_0_0_#292524]"
        />
        <div className="flex flex-col sm:flex-row gap-6 mt-4">
          <BigButton variant="success" className="flex-1 text-4xl py-6" onClick={confirmAdd}>確定</BigButton>
          <BigButton variant="secondary" className="flex-1 text-4xl py-6" onClick={() => setIsAddModalOpen(false)}>取消</BigButton>
        </div>
      </Modal>

      <Modal isOpen={!!playlistToDelete}>
        <h2 className="text-4xl font-black text-center text-stone-800">確定要刪除這本歌單嗎？</h2>
        <div className="flex flex-col sm:flex-row gap-6 mt-4">
          <BigButton variant="danger" className="flex-1 text-4xl py-6" onClick={() => {
            if (playlistToDelete) deletePlaylist(playlistToDelete);
            setPlaylistToDelete(null);
          }}>確定刪除</BigButton>
          <BigButton variant="secondary" className="flex-1 text-4xl py-6" onClick={() => setPlaylistToDelete(null)}>取消</BigButton>
        </div>
      </Modal>
    </div>
  );
}
