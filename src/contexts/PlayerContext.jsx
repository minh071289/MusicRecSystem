import React, { createContext, useState, useContext } from 'react';

const PlayerContext = createContext();

export const usePlayer = () => useContext(PlayerContext);

export const PlayerProvider = ({ children }) => {
  const [currentItem, setCurrentItem] = useState(null);

  // Hàm phát nhạc
  const playItem = (item) => {
    // Nếu item thiếu type, mặc định là track
    const type = item.type || 'track';
    setCurrentItem({ ...item, type });
  };

  // --- HÀM MỚI: TẮT NHẠC ---
  const closePlayer = () => {
    setCurrentItem(null); // Set về null thì Player sẽ tự ẩn đi
  };

  return (
    <PlayerContext.Provider value={{ currentItem, playItem, closePlayer }}>
      {children}
    </PlayerContext.Provider>
  );
};