import React, { useState, useEffect } from 'react';
import { FaPlay, FaHeart, FaRegHeart, FaPlus } from 'react-icons/fa'; // Import FaPlus
import { usePlayer } from '../contexts/PlayerContext';

// Thêm prop: onAddToPlaylist
export default function SongCard({ item, onAddToPlaylist }) {
  const { playItem } = usePlayer();
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const likedSongs = JSON.parse(localStorage.getItem('likedSongs')) || [];
    const found = likedSongs.find(s => s.id === item.id);
    if (found) setIsLiked(true);
  }, [item.id]);

  const toggleLike = (e) => {
    e.stopPropagation();
    const likedSongs = JSON.parse(localStorage.getItem('likedSongs')) || [];
    if (isLiked) {
      const newLiked = likedSongs.filter(s => s.id !== item.id);
      localStorage.setItem('likedSongs', JSON.stringify(newLiked));
      setIsLiked(false);
    } else {
      localStorage.setItem('likedSongs', JSON.stringify([...likedSongs, item]));
      setIsLiked(true);
    }
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <div 
      onClick={() => playItem(item)}
      className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition duration-300 cursor-pointer group flex flex-col h-full relative"
    >
      <div className="relative mb-4 w-full aspect-square">
        <img src={item.image} alt={item.title} className="w-full h-full object-cover rounded-md shadow-lg" />
        <div className="absolute bottom-2 right-2 bg-[#1db954] rounded-full p-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-xl hover:scale-105 z-10">
          <FaPlay className="text-black ml-1 text-sm" />
        </div>
      </div>

      <h3 className="text-white font-bold truncate text-base mb-1">{item.title}</h3>
      <p className="text-[#a7a7a7] text-sm truncate" dangerouslySetInnerHTML={{__html: item.subtitle}}></p>

      {/* Cụm nút thao tác */}
      <div className="absolute top-4 right-4 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
         {/* Nút Thêm vào Playlist (MỚI) */}
         <button 
          onClick={(e) => {
            e.stopPropagation();
            if (onAddToPlaylist) onAddToPlaylist(item);
          }}
          title="Thêm vào Playlist"
          className="text-2xl text-white hover:text-[#1db954] drop-shadow-md hover:scale-110 transition"
        >
          <FaPlus />
        </button>

        {/* Nút Tim */}
        <button onClick={toggleLike} className="text-2xl drop-shadow-md hover:scale-110 transition">
          {isLiked ? <FaHeart className="text-[#1db954]" /> : <FaRegHeart className="text-white" />}
        </button>
      </div>
    </div>
  );
}