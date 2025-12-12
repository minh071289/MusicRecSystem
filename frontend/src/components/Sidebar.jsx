import React from 'react';
import { FaHome, FaSearch, FaBook, FaPlusSquare, FaHeart } from 'react-icons/fa';
import logoImg from '../assets/logo.png'; 

export default function Sidebar({ view, setView, onOpenCreateModal }) {
  
  const getNavLinkClass = (linkView) => {
    const base = "flex items-center gap-x-4 p-3 rounded font-bold transition-all duration-200 hover:translate-x-1";
    return view === linkView 
      ? `${base} text-[#1db954] bg-[#282828]` 
      : `${base} text-[#b3b3b3] hover:text-[#1db954]`;
  };

  return (
    <div className="hidden md:flex bg-black w-64 p-6 flex-col gap-y-4 h-full flex-shrink-0 border-r border-[#282828]">
      
      {/* LOGO */}
      <div 
        className="mb-6 px-2 cursor-pointer group" 
        onClick={() => setView('home')}
        title="Eclipsera - Home"
      >
        <img 
          src={logoImg} 
          alt="Eclipsera" 
          className="w-40 h-auto object-contain transition duration-500 logo-float" 
        />
      </div>

      {/* MAIN MENU */}
      <div className="flex flex-col gap-y-2">
        <button onClick={() => setView('home')} className={getNavLinkClass('home')}>
          <FaHome className="text-xl" /> Home
        </button>
        <button onClick={() => setView('search')} className={getNavLinkClass('search')}>
          <FaSearch className="text-xl" /> Discover
        </button>
        <button onClick={() => setView('library')} className={getNavLinkClass('library')}>
          <FaBook className="text-xl" /> Your Library
        </button>
      </div>

      {/* SECONDARY MENU */}
      <div className="mt-6 border-t border-[#282828] pt-6 flex flex-col gap-4">
        
        {/* Button 1: View Playlists */}
        <button 
          onClick={() => setView('library')} 
          className="flex items-center gap-x-4 text-[#b3b3b3] hover:text-[#1db954] font-bold transition hover:translate-x-1 active:scale-95"
        >
          <FaPlusSquare className="text-xl" /> 
          <span className="truncate">My Playlists</span>
        </button>
        
        {/* Button 2: Liked Songs */}
        <button 
          onClick={() => setView('library')} 
          className="flex items-center gap-x-4 text-[#b3b3b3] hover:text-[#1db954] font-bold transition hover:translate-x-1 active:scale-95"
        >
          <FaHeart className="text-xl text-purple-400" /> 
          <span className="truncate">Liked Songs</span>
        </button>

      </div>
    </div>
  );
}