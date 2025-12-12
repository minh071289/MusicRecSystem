import React, { createContext, useState, useContext } from 'react';

const PlayerContext = createContext();

export const usePlayer = () => useContext(PlayerContext);

export const PlayerProvider = ({ children }) => {
  const [currentItem, setCurrentItem] = useState(null);

  const playItem = (item) => {
    const type = item.type || 'track';
    setCurrentItem({ ...item, type });
  };

  const closePlayer = () => {
    setCurrentItem(null);
  };

  return (
    <PlayerContext.Provider value={{ currentItem, playItem, closePlayer }}>
      {children}
    </PlayerContext.Provider>
  );
};