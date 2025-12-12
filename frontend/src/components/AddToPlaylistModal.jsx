import React, { useState, useEffect } from 'react';
import { FaMusic, FaCheck, FaPlus } from 'react-icons/fa';

export default function AddToPlaylistModal({ track, onClose, onShowToast, onOpenCreate }) {
  const [playlists, setPlaylists] = useState([]);
  const loadPlaylists = () => {
    const saved = JSON.parse(localStorage.getItem('myPlaylists')) || [];
    setPlaylists(saved);
  };

  useEffect(() => {
    loadPlaylists();
    window.addEventListener('storage', loadPlaylists);
    return () => window.removeEventListener('storage', loadPlaylists);
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
    
    if (onShowToast) {
      onShowToast(`Đã thêm vào Playlist`);
    }

    window.dispatchEvent(new Event("storage"));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#282828] w-full max-w-md rounded-xl p-6 shadow-2xl relative border border-[#333]">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold">&times;</button>
        
        <h2 className="text-xl font-bold text-white mb-2">Thêm vào Playlist</h2>
        <p className="text-gray-400 text-sm mb-6 truncate">Bài hát: <span className="text-[#1db954]">{track.title}</span></p>

        <button 
          onClick={onOpenCreate}
          className="w-full flex items-center justify-center gap-2 bg-[#333] hover:bg-[#444] text-white py-3 rounded-full mb-4 transition font-bold border border-white/10"
        >
          <FaPlus /> Tạo Playlist mới
        </button>

        <div className="max-h-60 overflow-y-auto flex flex-col gap-2 scrollbar-thin pr-1">
          {playlists.length > 0 ? (
            playlists.map(pl => (
              <button 
                key={pl.id}
                onClick={() => handleAddToPlaylist(pl.id)}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-[#3E3E3E] transition text-left group"
              >
                <div className="bg-[#121212] w-12 h-12 flex items-center justify-center rounded text-gray-500 overflow-hidden">
                  {pl.image && !pl.image.includes('placehold') ? (
                    <img src={pl.image} className="w-full h-full object-cover" />
                  ) : (
                    <FaMusic />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white group-hover:text-[#1db954] transition">{pl.title}</h3>
                  <p className="text-xs text-gray-400">{pl.songs?.length || 0} bài hát</p>
                </div>
                {pl.songs?.some(s => s.id === track.id) && <FaCheck className="text-[#1db954]" />}
              </button>
            ))
          ) : (
            <div className="text-center text-gray-500 py-4 text-sm">
              Bạn chưa có Playlist nào. Hãy tạo mới nhé!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}