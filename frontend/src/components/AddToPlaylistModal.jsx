import React, { useState, useEffect } from 'react';
import { FaMusic, FaCheck } from 'react-icons/fa';

// Nhận thêm prop: onShowToast
export default function AddToPlaylistModal({ track, onClose, onShowToast }) {
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('myPlaylists')) || [];
    setPlaylists(saved);
  }, []);

  const handleAddToPlaylist = (playlistId) => {
    const allPlaylists = JSON.parse(localStorage.getItem('myPlaylists')) || [];
    
    const updatedPlaylists = allPlaylists.map(pl => {
      if (pl.id === playlistId) {
        const isExist = pl.songs.some(s => s.id === track.id);
        if (!isExist) {
          return { ...pl, songs: [...pl.songs, track] };
        }
      }
      return pl;
    });

    localStorage.setItem('myPlaylists', JSON.stringify(updatedPlaylists));
    
    // THAY ALERT CŨ BẰNG CÁI NÀY
    if (onShowToast) {
      onShowToast(`Added to Playlist`);
    }

    window.dispatchEvent(new Event("storage"));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#282828] w-full max-w-md rounded-xl p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold">&times;</button>
        
        <h2 className="text-xl font-bold text-white mb-2">Thêm vào Playlist</h2>
        <p className="text-gray-400 text-sm mb-6">Chọn playlist để thêm bài: <span className="text-green-400">{track.title}</span></p>

        <div className="max-h-60 overflow-y-auto flex flex-col gap-2 scrollbar-thin">
          {playlists.length > 0 ? (
            playlists.map(pl => (
              <button 
                key={pl.id}
                onClick={() => handleAddToPlaylist(pl.id)}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-[#3E3E3E] transition text-left group"
              >
                <div className="bg-[#121212] w-12 h-12 flex items-center justify-center rounded text-gray-500">
                  <FaMusic />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white">{pl.title}</h3>
                  <p className="text-xs text-gray-400">{pl.songs?.length || 0} bài hát</p>
                </div>
                {/* Check nếu bài hát đã có trong playlist thì hiện dấu tick */}
                {pl.songs?.some(s => s.id === track.id) && <FaCheck className="text-green-500" />}
              </button>
            ))
          ) : (
            <div className="text-center text-gray-400 py-4">
              Bạn chưa có Playlist nào.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}