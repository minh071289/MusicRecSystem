import React from 'react';

export default function ArtistCard({ item, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition duration-300 cursor-pointer group flex flex-col items-center text-center animate-fade-in"
    >
      <div className="relative mb-4 w-full aspect-square">
        <img src={item.image} alt={item.title} className="w-full h-full object-cover rounded-full shadow-lg group-hover:scale-105 transition duration-500" />
      </div>
      <h3 className="text-white font-bold truncate text-base w-full">{item.title}</h3>
      <p className="text-[#a7a7a7] text-sm mt-1">Nghệ sĩ</p>
      {item.genres && <p className="text-xs text-[#1db954] mt-1 capitalize truncate w-full">{item.genres}</p>}
    </div>
  );
}