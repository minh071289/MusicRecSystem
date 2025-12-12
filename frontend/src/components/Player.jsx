import React from 'react';
import { FaTimes } from 'react-icons/fa';
import { usePlayer } from '../contexts/PlayerContext';

export default function Player() {
  const { currentItem, closePlayer } = usePlayer();

  if (!currentItem) return null;

  // Logic tạo link embed Spotify (Đã sửa lại chuẩn URL và cú pháp)
  let embedUrl = `https://open.spotify.com/embed/track/${currentItem.id}?utm_source=generator&theme=0`;
  
  if (currentItem.type === 'album') {
    embedUrl = `https://open.spotify.com/embed/album/${currentItem.id}?utm_source=generator&theme=0`;
  } else if (currentItem.type === 'playlist') {
    embedUrl = `https://open.spotify.com/embed/playlist/${currentItem.id}?utm_source=generator&theme=0`;
  }

  return (
    <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-50 px-2 pb-1 md:pb-0 animate-slide-up">
      
      {/* Player Container */}
      <div className="relative bg-black border-t border-[#282828] md:rounded-t-xl overflow-visible">
        
        {/* --- CLOSE BUTTON (X) --- */}
        <button 
          onClick={closePlayer}
          className="absolute -top-3 right-2 md:right-4 bg-[#282828] text-white hover:bg-red-600 hover:scale-110 p-1.5 rounded-full shadow-lg border border-gray-600 transition z-50 flex items-center justify-center cursor-pointer"
          title="Close Player"
        >
          <FaTimes className="text-xs md:text-sm" />
        </button>

        {/* Spotify Iframe */}
        <iframe 
          style={{borderRadius: "12px"}} 
          src={embedUrl}
          width="100%" 
          height="80" 
          frameBorder="0" 
          allowFullScreen="" 
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
          loading="lazy"
          title="Spotify Player"
        ></iframe>
      </div>
    </div>
  );
}