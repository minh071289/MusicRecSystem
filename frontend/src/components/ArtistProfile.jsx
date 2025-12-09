import React, { useEffect, useState } from 'react';
import { FaArrowLeft, FaCheckCircle, FaSearch, FaPlay } from 'react-icons/fa';
import { getArtistData } from '../services/spotifyService';
import { usePlayer } from '../contexts/PlayerContext';

export default function ArtistProfile({ artist, onBack, onAddRequest }) {
  const { playItem, currentItem, isPlaying } = usePlayer();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackSearch, setTrackSearch] = useState('');
  const [showFullBio, setShowFullBio] = useState(false);

  useEffect(() => {
    if (!artist) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await getArtistData(artist.id);
        setData(res);
      } catch (error) {
        console.error("Lỗi tải profile:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [artist]);

  const filteredTracks = data?.topTracks?.filter(track => 
    track.title.toLowerCase().includes(trackSearch.toLowerCase())
  ) || [];

  if (!artist) return null;

  return (
    <div className="animate-fade-in pb-32 bg-[#121212] min-h-screen relative z-10">
      
      {/* --- 1. HEADER ĐIỀU HƯỚNG (ĐÃ SỬA: KHÔNG CỐ ĐỊNH) --- */}
      {/* Đã bỏ 'sticky top-0', bỏ border và shadow để nó hòa vào nền */}
      <div className="px-6 pt-6 flex items-center">
        <button 
          onClick={onBack} 
          className="flex items-center gap-3 text-gray-300 hover:text-white transition group"
        >
          <div className="bg-[#333] p-2 rounded-full group-hover:bg-[#1db954] group-hover:text-black transition">
            <FaArrowLeft />
          </div>
          <span className="font-bold text-sm uppercase tracking-wider">Quay lại tìm kiếm</span>
        </button>
      </div>

      <div className="px-6 mt-4">
        
        {/* 2. BANNER NGHỆ SĨ */}
        <div className="flex flex-col md:flex-row gap-8 mb-12 items-center md:items-end">
          <div className="relative group">
             <img 
               src={artist.image} 
               alt={artist.title}
               className="w-52 h-52 md:w-64 md:h-64 rounded-full shadow-[0_10px_60px_-15px_rgba(0,0,0,0.8)] object-cover border-4 border-[#121212]" 
             />
             <div className="absolute inset-0 rounded-full border-4 border-[#1db954] opacity-0 group-hover:opacity-100 transition duration-500"></div>
          </div>

          <div className="text-center md:text-left flex-1">
             <div className="flex items-center justify-center md:justify-start gap-2 text-[#1db954] mb-3">
                <FaCheckCircle className="text-xl" /> 
                <span className="text-xs font-bold uppercase tracking-widest text-white">Nghệ sĩ được xác minh</span>
             </div>
             <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-4 text-white tracking-tighter leading-none">{artist.title}</h1>
             <p className="text-gray-400 text-lg font-medium">
               {artist.followers?.toLocaleString()} người theo dõi
             </p>
          </div>
        </div>

        {/* 3. NỘI DUNG CHÍNH */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#b3b3b3]">
             <div className="w-12 h-12 border-4 border-[#1db954] border-t-transparent rounded-full animate-spin mb-4"></div>
             <p>Đang tải dữ liệu...</p>
          </div>
        ) : data ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* CỘT TRÁI (2/3): BÀI HÁT & BIO */}
            <div className="lg:col-span-2">
              
              {/* Search & Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 border-b border-[#333] pb-4">
                <h2 className="text-2xl font-bold text-white">Phổ biến</h2>
                <div className="relative w-full sm:w-64">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text"
                    placeholder="Lọc bài hát..."
                    className="w-full bg-[#2a2a2a] text-white pl-10 pr-4 py-2 rounded-full border border-transparent focus:border-[#1db954] outline-none transition text-sm placeholder-gray-500"
                    value={trackSearch}
                    onChange={(e) => setTrackSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* List Bài hát */}
              <div className="flex flex-col mb-12">
                {filteredTracks.length > 0 ? (
                  filteredTracks.map((track, idx) => {
                    const isCurrent = currentItem?.id === track.id;
                    return (
                      <div 
                        key={track.id} 
                        onClick={() => playItem(track)} 
                        className={`flex items-center gap-4 p-3 rounded-lg group transition cursor-pointer border border-transparent ${isCurrent ? 'bg-[#ffffff1a]' : 'hover:bg-[#ffffff1a]'}`}
                      >
                        <div className="w-8 text-center text-gray-400 font-mono text-sm flex justify-center items-center">
                          {isCurrent && isPlaying ? (
                             <div className="w-3 h-3 bg-[#1db954] rounded-full animate-pulse" />
                          ) : (
                             <>
                               <span className="group-hover:hidden">{idx + 1}</span>
                               <FaPlay className="hidden group-hover:block text-white text-xs" />
                             </>
                          )}
                        </div>
                        
                        <img src={track.image} className="w-12 h-12 rounded shadow-sm object-cover" />
                        
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-bold text-base truncate transition ${isCurrent ? 'text-[#1db954]' : 'text-white group-hover:text-[#1db954]'}`}>{track.title}</h4>
                          <p className="text-xs text-gray-400 truncate group-hover:text-gray-300">{track.subtitle}</p>
                        </div>
                        
                        <button 
                          onClick={(e) => { e.stopPropagation(); onAddRequest(track); }} 
                          className="w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-[#1db954]/20 opacity-0 group-hover:opacity-100 transition transform hover:scale-110"
                          title="Thêm vào playlist"
                        >
                          <span className="text-2xl font-light leading-none mb-1">+</span>
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center bg-[#181818] rounded-xl text-gray-400 border border-[#333]">
                    Không tìm thấy bài hát nào khớp với từ khóa.
                  </div>
                )}
              </div>

              {/* Bio Section */}
              {data.bio && (
                <div className="mb-10">
                  <h2 className="text-2xl font-bold text-white mb-6">Về {data.name || artist.title}</h2>
                  <div 
                    className="bg-gradient-to-b from-[#181818] to-[#121212] p-8 rounded-2xl border border-[#333] cursor-pointer hover:border-[#555] transition relative overflow-hidden"
                    onClick={() => setShowFullBio(!showFullBio)}
                    style={{ maxHeight: showFullBio ? 'none' : '300px' }}
                  >
                    <div 
                      className="text-gray-300 leading-7 text-justify"
                      dangerouslySetInnerHTML={{ __html: data.bio.replace(/\n/g, '<br/>') }} 
                    />
                    {!showFullBio && (
                      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#121212] via-[#121212]/90 to-transparent flex items-end justify-center pb-6">
                        <span className="font-bold text-black bg-white hover:bg-gray-200 hover:scale-105 transition px-6 py-2 rounded-full uppercase text-xs tracking-wider shadow-xl">
                          Đọc tiếp
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* CỘT PHẢI (1/3): ALBUM (VẪN STICKY ĐỂ LẤP CHỖ TRỐNG) */}
            <div className="lg:col-span-1 relative">
              <div className="sticky top-24 space-y-6">
                
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Discography</h2>
                  <span className="text-xs text-gray-400 uppercase tracking-wider bg-[#333] px-2 py-1 rounded">Mới nhất</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar">
                  {data.albums.map(album => (
                    <div 
                      key={album.id} 
                      onClick={() => playItem(album)} 
                      className="bg-[#181818] p-3 rounded-xl hover:bg-[#282828] transition duration-300 cursor-pointer group border border-transparent hover:border-[#333] hover:-translate-y-1"
                    >
                      <div className="relative mb-3 aspect-square overflow-hidden rounded-lg">
                        <img src={album.image} className="w-full h-full object-cover shadow-lg group-hover:scale-110 transition duration-500" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                           <div className="bg-[#1db954] rounded-full p-3 shadow-xl hover:scale-110 transition">
                              <FaPlay className="text-black ml-0.5 text-sm" />
                           </div>
                        </div>
                      </div>
                      <h3 className="text-white font-bold text-sm truncate group-hover:text-[#1db954] transition">{album.title}</h3>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-[#a7a7a7] text-xs">{album.subtitle}</p>
                        <span className="text-[10px] bg-[#333] text-gray-400 px-1.5 py-0.5 rounded border border-[#444]">Album</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-gradient-to-br from-[#1db954]/10 to-transparent p-4 rounded-xl border border-[#1db954]/20">
                  <p className="text-[#1db954] font-bold text-sm mb-1">Fan Fact</p>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    {artist.title} hiện đang là một trong những nghệ sĩ được quan tâm nhất tại {artist.followers > 1000000 ? 'khu vực và quốc tế' : 'thị trường nội địa'}.
                  </p>
                </div>

              </div>
            </div>

          </div>
        ) : (
          <div className="text-center text-red-400 p-10 border border-red-900/30 bg-red-900/10 rounded-xl">
            Không thể tải dữ liệu nghệ sĩ. Vui lòng thử lại sau.
          </div>
        )}
      </div>
    </div>
  );
}