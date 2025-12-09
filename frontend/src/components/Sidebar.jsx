import React from 'react';
import { FaHome, FaSearch, FaBook, FaPlusSquare, FaHeart } from 'react-icons/fa';

// Import Logo (Đảm bảo file logo.png nằm đúng chỗ này)
import logoImg from '../assets/logo.png'; 

export default function Sidebar({ view, setView, onOpenCreateModal }) {
  
  const getNavLinkClass = (linkView) => {
    const base = "flex items-center gap-x-4 p-3 rounded font-bold transition";
    return view === linkView 
      ? `${base} text-[#1db954] bg-[#282828]` 
      : `${base} text-[#b3b3b3] hover:text-[#1db954]`;
  };

  return (
    <div className="hidden md:flex bg-black w-64 p-6 flex-col gap-y-4 h-full flex-shrink-0">
      
      {/* --- PHẦN LOGO (CHỈ CÓ ẢNH) --- */}
      <div 
        className="mb-6 px-2 cursor-pointer group" // Thêm chút padding cho thoáng
        onClick={() => setView('home')}
      >
        <img 
          src={logoImg} 
          alt="Sound Wave" 
          // w-40 (160px): Độ rộng lớn để nhìn rõ logo full
          // h-auto: Chiều cao tự chỉnh theo tỉ lệ
          className="w-40 h-auto object-contain group-hover:opacity-90 transition duration-300" 
        />
      </div>
      {/* ----------------------------- */}

      <div className="flex flex-col gap-y-2">
        <button onClick={() => setView('home')} className={getNavLinkClass('home')}>
          <FaHome className="text-xl" /> Trang chủ
        </button>
        <button onClick={() => setView('search')} className={getNavLinkClass('search')}>
          <FaSearch className="text-xl" /> Tìm kiếm
        </button>
        <button onClick={() => setView('library')} className={getNavLinkClass('library')}>
          <FaBook className="text-xl" /> Thư viện
        </button>
      </div>

      <div className="mt-6 border-t border-[#282828] pt-6 flex flex-col gap-4">
        <button onClick={onOpenCreateModal} className="flex items-center gap-x-4 text-[#b3b3b3] hover:text-[#1db954] font-bold transition">
          <FaPlusSquare className="text-xl" /> Tạo Playlist
        </button>
        <button onClick={() => setView('library')} className="flex items-center gap-x-4 text-[#b3b3b3] hover:text-[#1db954] font-bold transition">
          <FaHeart className="text-xl text-purple-400" /> Bài hát đã thích
        </button>
      </div>
    </div>
  );
}