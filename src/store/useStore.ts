import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { idbStorage } from '../lib/idbStorage';

export interface Song {
  id: string; // internal id
  youtubeId: string;
  title: string;
  thumbnail: string;
}

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
  coverImg?: string;
}

export interface Settings {
  bigButtonMode: boolean; // default false
  singleStepMode: boolean; // default false
}

interface AppState {
  playlists: Playlist[];
  settings: Settings;
  
  // Navigation
  currentScreen: 'home' | 'playlist' | 'player';
  activePlaylistId: string | null; // which playlist is currently being viewed/edited
  navigate: (screen: 'home' | 'playlist' | 'player', playlistId?: string) => void;

  // Player state
  currentPlaylistId: string | null; // which playlist is currently playing
  currentSongIndex: number;
  isPlaying: boolean;

  
  addPlaylist: (name: string) => void;
  deletePlaylist: (id: string) => void;
  updatePlaylistName: (id: string, name: string) => void;
  
  addSong: (playlistId: string, song: Omit<Song, 'id'>) => void;
  deleteSong: (playlistId: string, songId: string) => void;
  
  playPlaylist: (playlistId: string, startIndex?: number) => void;
  playNext: () => void;
  playPrev: () => void;
  stopPlaying: () => void;
  
  toggleBigButtonMode: () => void;
  toggleSingleStepMode: () => void;
}

const DEFAULT_PLAYLISTS: Playlist[] = [];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      playlists: DEFAULT_PLAYLISTS,
      settings: {
        bigButtonMode: false,
        singleStepMode: false,
      },
      currentScreen: 'home',
      activePlaylistId: null,
      currentPlaylistId: null,
      currentSongIndex: 0,
      isPlaying: false,

      navigate: (screen, playlistId) => set({ 
        currentScreen: screen, 
        activePlaylistId: playlistId !== undefined ? playlistId : get().activePlaylistId 
      }),

      addPlaylist: (name) => set((state) => ({
        playlists: [...state.playlists, { id: uuidv4(), name, songs: [] }]
      })),
      
      deletePlaylist: (id) => set((state) => ({
        playlists: state.playlists.filter(p => p.id !== id),
        currentPlaylistId: state.currentPlaylistId === id ? null : state.currentPlaylistId,
        isPlaying: state.currentPlaylistId === id ? false : state.isPlaying
      })),
      
      updatePlaylistName: (id, name) => set((state) => ({
        playlists: state.playlists.map(p => p.id === id ? { ...p, name } : p)
      })),
      
      addSong: (playlistId, song) => set((state) => ({
        playlists: state.playlists.map(p => {
          if (p.id === playlistId) {
            const newSongs = [...p.songs, { ...song, id: uuidv4() }];
            return { ...p, songs: newSongs, coverImg: p.coverImg || song.thumbnail };
          }
          return p;
        })
      })),
      
      deleteSong: (playlistId, songId) => set((state) => ({
        playlists: state.playlists.map(p => p.id === playlistId ? { ...p, songs: p.songs.filter(s => s.id !== songId) } : p)
      })),
      
      playPlaylist: (playlistId, startIndex = 0) => set({ 
        currentPlaylistId: playlistId, 
        currentSongIndex: startIndex,
        isPlaying: true 
      }),
      
      playNext: () => set((state) => {
        if (!state.currentPlaylistId) return state;
        const playlist = state.playlists.find(p => p.id === state.currentPlaylistId);
        if (!playlist || playlist.songs.length === 0) return state;
        
        let nextIndex = state.currentSongIndex + 1;
        if (nextIndex >= playlist.songs.length) {
          nextIndex = 0; // loop
        }
        return { currentSongIndex: nextIndex };
      }),
      
      playPrev: () => set((state) => {
        if (!state.currentPlaylistId) return state;
        const playlist = state.playlists.find(p => p.id === state.currentPlaylistId);
        if (!playlist || playlist.songs.length === 0) return state;
        
        let prevIndex = state.currentSongIndex - 1;
        if (prevIndex < 0) {
          prevIndex = playlist.songs.length - 1;
        }
        return { currentSongIndex: prevIndex };
      }),
      
      stopPlaying: () => set({ isPlaying: false, currentPlaylistId: null, currentSongIndex: 0 }),
      
      toggleBigButtonMode: () => set((state) => ({
        settings: { ...state.settings, bigButtonMode: !state.settings.bigButtonMode }
      })),
      
      toggleSingleStepMode: () => set((state) => ({
        settings: { ...state.settings, singleStepMode: !state.settings.singleStepMode }
      }))
    }),
    {
      name: 'happy-video-player-storage-v2',
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
