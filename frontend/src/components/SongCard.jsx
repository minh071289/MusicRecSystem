import React, { useState, useEffect } from 'react';
import { FaPlay, FaHeart, FaRegHeart, FaPlus } from 'react-icons/fa';
import { usePlayer } from '../contexts/PlayerContext';

export default function SongCard({ item, onAddToPlaylist, onShowToast }) {
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

      if (onShowToast) onShowToast("Removed from Liked Songs");
    } else {
      localStorage.setItem('likedSongs', JSON.stringify([...likedSongs, item]));
      setIsLiked(true);

      if (onShowToast) onShowToast("Added to Liked Songs");
    }
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <div 
      onClick={() => playItem(item)}
      className="bg-[#181818] p-4 rounded-lg cursor-pointer group flex flex-col h-full relative 
                 transition-all duration-300 ease-in-out 
                 hover:bg-[#282828] hover:-translate-y-2 hover:shadow-2xl"
    >
      <div className="relative mb-4 w-full aspect-square overflow-hidden rounded-md">
        <img src={item.image} alt={item.title} className="w-full h-full object-cover shadow-lg transition duration-500 group-hover:scale-105" />
        
        <div className="absolute bottom-2 right-2 bg-[#1db954] rounded-full p-3 
                        opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 
                        transition-all duration-300 shadow-xl hover:scale-110 z-10">
          <FaPlay className="text-black ml-1 text-sm" />
        </div>
      </div>

      <h3 className="text-white font-bold truncate text-base mb-1 group-hover:text-[#1db954] transition">{item.title}</h3>
      <p className="text-[#a7a7a7] text-sm truncate" dangerouslySetInnerHTML={{__html: item.subtitle}}></p>

      <div className="absolute top-4 right-4 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
         <button 
          onClick={(e) => {
            e.stopPropagation();
            if (onAddToPlaylist) onAddToPlaylist(item);
          }}
          title="Add to Playlist"
          className="text-xl text-white hover:text-[#1db954] drop-shadow-md hover:scale-110 transition bg-black/50 p-1.5 rounded-full"
        >
          <FaPlus />
        </button>

        <button onClick={toggleLike} className="text-xl drop-shadow-md hover:scale-110 transition bg-black/50 p-1.5 rounded-full text-white">
          {isLiked ? <FaHeart className="text-[#1db954]" /> : <FaRegHeart />}
        </button>
      </div>
    </div>
  );
}