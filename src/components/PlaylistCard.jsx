import React from 'react';
import { FaPlay } from 'react-icons/fa';
import { usePlayer } from '../contexts/PlayerContext';

export default function PlaylistCard({ item }) {
  const { playItem } = usePlayer();

  return (
    <div 
      onClick={() => playItem(item)}
      className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition duration-300 cursor-pointer group flex flex-col h-full"
    >
      <div className="relative mb-4 w-full aspect-square">
        <img src={item.image} alt={item.title} className="w-full h-full object-cover rounded-md shadow-lg" />
        <div className="absolute bottom-2 right-2 bg-[#1db954] rounded-full p-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-xl hover:scale-105">
          <FaPlay className="text-black ml-1 text-sm" />
        </div>
      </div>
      <h3 className="text-white font-bold truncate text-base mb-1">{item.title}</h3>
      <p className="text-[#a7a7a7] text-sm line-clamp-2" dangerouslySetInnerHTML={{__html: item.subtitle}}></p>
    </div>
  );
}