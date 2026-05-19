/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useStore } from './store/useStore';
import { HomeScreen } from './components/HomeScreen';
import { PlaylistScreen } from './components/PlaylistScreen';
import { PlayerScreen } from './components/PlayerScreen';
import { AnimatePresence, motion } from 'framer-motion';

export default function App() {
  const currentScreen = useStore(state => state.currentScreen);

  return (
    <div className="w-full min-h-screen overflow-x-hidden">
      <AnimatePresence mode="wait">
        {currentScreen === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <HomeScreen />
          </motion.div>
        )}
        {currentScreen === 'playlist' && (
          <motion.div
            key="playlist"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3 }}
          >
            <PlaylistScreen />
          </motion.div>
        )}
        {currentScreen === 'player' && (
          <motion.div
            key="player"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
          >
             <PlayerScreen />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

