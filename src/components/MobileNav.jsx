import React from 'react';
import { FaHome, FaSearch, FaBook } from 'react-icons/fa';

export default function MobileNav({ view, setView }) {
  const getNavClass = (linkView) => {
    return view === linkView ? 'text-[#1db954]' : 'text-[#b3b3b3]';
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black to-black/95 border-t border-[#282828] h-16 flex justify-around items-center z-50 pb-1">
      <button onClick={() => setView('home')} className={`flex flex-col items-center gap-1 transition ${getNavClass('home')}`}>
        <FaHome className="text-xl" />
        <span className="text-[10px]">Trang chủ</span>
      </button>
      <button onClick={() => setView('search')} className={`flex flex-col items-center gap-1 transition ${getNavClass('search')}`}>
        <FaSearch className="text-xl" />
        <span className="text-[10px]">Tìm kiếm</span>
      </button>
      <button onClick={() => setView('library')} className={`flex flex-col items-center gap-1 transition ${getNavClass('library')}`}>
        <FaBook className="text-xl" />
        <span className="text-[10px]">Thư viện</span>
      </button>
    </div>
  );
}