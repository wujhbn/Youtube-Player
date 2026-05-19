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
    <div className="min-h-screen px-4 sm:px-12 max-w-7xl mx-auto flex flex-col gap-8" style={{ paddingTop: 'max(2rem, env(safe-area-inset-top))', paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
      <header className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-4">
        <h1 className={`${titleSize} font-bold tracking-tight text-gray-900`}>
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
            <Card className="flex flex-col gap-6 items-center justify-center p-8 min-h-[280px]">
              <h2 className="text-2xl font-bold tracking-tight">⚙️ Settings</h2>
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
            className="flex flex-col gap-4 items-center justify-center p-8 min-h-[280px]"
            onClick={() => navigate('playlist', playlist.id)}
          >
            <div className="absolute top-4 right-4 z-10" onClick={(e) => e.stopPropagation()}>
               <button 
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 active:scale-95 text-gray-500 hover:text-red-500 transition-colors"
                  onClick={() => setPlaylistToDelete(playlist.id)}
               >
                 <Trash2 size={20} strokeWidth={2} />
               </button>
            </div>

            {playlist.coverImg ? (
              <img 
                src={playlist.coverImg} 
                alt={playlist.name} 
                className="w-full aspect-[4/3] rounded-[20px] object-cover shadow-sm bg-gray-100"
              />
            ) : (
              <div className="w-full aspect-[4/3] rounded-[20px] bg-gray-100 flex items-center justify-center shadow-sm">
                <Music size={iconSize} strokeWidth={2} className="text-gray-400" />
              </div>
            )}
            <h2 className={`${cardTitleSize} font-bold text-center mt-2 tracking-tight text-gray-900`}>
              {playlist.name}
            </h2>
            <div className="text-sm font-medium text-gray-500 bg-gray-100 px-4 py-1.5 rounded-full">
              {playlist.songs.length} 首歌
            </div>
          </Card>
        ))}
        {playlists.length === 0 && (
          <div className="col-span-full text-center py-24 text-xl font-medium text-gray-400 bg-white rounded-[32px] border border-gray-100 shadow-sm">
             還沒有歌單喔，按上面的「新增」來建立吧！
          </div>
        )}
      </div>

      <Modal isOpen={isAddModalOpen}>
        <h2 className="text-2xl font-bold text-center text-gray-900 tracking-tight">幫新歌單取個名字吧</h2>
        <input 
          type="text" 
          value={newPlaylistName} 
          onChange={e => setNewPlaylistName(e.target.value)} 
          className="text-xl font-medium p-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 ring-blue-500 outline-none w-full transition-all"
        />
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <BigButton variant="success" className="flex-1" onClick={confirmAdd}>確定</BigButton>
          <BigButton variant="secondary" className="flex-1" onClick={() => setIsAddModalOpen(false)}>取消</BigButton>
        </div>
      </Modal>

      <Modal isOpen={!!playlistToDelete}>
        <h2 className="text-2xl font-bold text-center text-gray-900 tracking-tight">確定要刪除這本歌單嗎？</h2>
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <BigButton variant="danger" className="flex-1" onClick={() => {
            if (playlistToDelete) deletePlaylist(playlistToDelete);
            setPlaylistToDelete(null);
          }}>確定刪除</BigButton>
          <BigButton variant="secondary" className="flex-1 text-4xl py-6" onClick={() => setPlaylistToDelete(null)}>取消</BigButton>
        </div>
      </Modal>
    </div>
  );
}
