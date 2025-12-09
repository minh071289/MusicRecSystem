import React from 'react';
import { FaPlay } from 'react-icons/fa';
import { usePlayer } from '../contexts/PlayerContext';

export default function AlbumCard({ item }) {
  const { playItem } = usePlayer();

  return (
    <div className="min-w-[160px] cursor-pointer group" onClick={() => playItem(item)}>
      <div className="relative mb-3">
        <img src={item.image} alt={item.title} className="w-40 h-40 rounded-md shadow-lg object-cover" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
           <div className="bg-[#1db954] rounded-full p-3 hover:scale-110 transition">
              <FaPlay className="text-black ml-1" />
           </div>
        </div>
      </div>
      <h3 className="text-white font-bold truncate text-sm w-40">{item.title}</h3>
      <p className="text-[#a7a7a7] text-xs truncate w-40">{item.subtitle}</p>
    </div>
  );
}