import React from 'react';
import { FaPlay } from 'react-icons/fa';

export default function PlaylistCard({ item }) {
  return (
    <div className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition duration-300 cursor-pointer group">
      <div className="relative mb-4">
        <img 
          src={item.image} 
          alt={item.title} 
          className="w-full aspect-square object-cover rounded-md shadow-lg" 
        />
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition duration-300 translate-y-2 group-hover:translate-y-0">
           <div className="bg-[#1db954] rounded-full p-3 shadow-lg flex items-center justify-center hover:scale-105">
             <FaPlay className="text-black ml-1 text-sm" />
           </div>
        </div>
      </div>
      <h3 className="font-bold text-white mb-1 truncate">{item.title}</h3>
      
      {/* SỬA: Dùng text tiếng Anh hoặc lấy từ data */}
      <p className="text-sm text-[#a7a7a7] line-clamp-2">
        {item.subtitle || `By ${item.owner || 'Spotify'}`}
      </p>
    </div>
  );
}