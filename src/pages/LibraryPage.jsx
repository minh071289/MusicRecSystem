import React, { useState, useEffect, useRef } from 'react';
import SongCard from '../components/SongCard';
import ConfirmModal from '../components/ConfirmModal';
import { FaHeart, FaArrowLeft, FaPlay, FaCamera, FaPen } from 'react-icons/fa';
import { usePlayer } from '../contexts/PlayerContext';

export default function LibraryPage({ onShowToast }) {
  const { playItem } = usePlayer();
  const [playlists, setPlaylists] = useState([]);
  const [likedSongs, setLikedSongs] = useState([]);
  
  // Playlist đang xem chi tiết
  const [viewPlaylist, setViewPlaylist] = useState(null);
  const [playlistToDelete, setPlaylistToDelete] = useState(null);

  // Ref cho input file ẩn
  const fileInputRef = useRef(null);

  const loadData = () => {
    setPlaylists(JSON.parse(localStorage.getItem('myPlaylists')) || []);
    setLikedSongs(JSON.parse(localStorage.getItem('likedSongs')) || []);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  // --- XỬ LÝ XÓA PLAYLIST ---
  const handleDeleteRequest = (e, id) => {
    e.stopPropagation();
    setPlaylistToDelete(id);
  };

  const confirmDelete = () => {
    if (!playlistToDelete) return;
    const newData = playlists.filter(p => p.id !== playlistToDelete);
    localStorage.setItem('myPlaylists', JSON.stringify(newData));
    setPlaylists(newData);
    
    if(viewPlaylist?.id === playlistToDelete) setViewPlaylist(null);
    setPlaylistToDelete(null);
    if (onShowToast) onShowToast("Đã xóa playlist thành công");
  };

  // --- XỬ LÝ ĐỔI ẢNH PLAYLIST (MỚI) ---
  const handleImageUpdate = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 1. Validate dung lượng (< 500KB)
      if (file.size > 500000) {
        alert("Ảnh quá lớn! Vui lòng chọn ảnh < 500KB.");
        return;
      }

      // 2. Đọc file
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImage = reader.result;

        // 3. Cập nhật trong danh sách playlists
        const updatedPlaylists = playlists.map(pl => 
          pl.id === viewPlaylist.id ? { ...pl, image: newImage } : pl
        );

        // 4. Lưu lại LocalStorage
        localStorage.setItem('myPlaylists', JSON.stringify(updatedPlaylists));
        setPlaylists(updatedPlaylists);
        
        // 5. Cập nhật view hiện tại
        setViewPlaylist({ ...viewPlaylist, image: newImage });
        
        if (onShowToast) onShowToast("Đã cập nhật ảnh bìa!");
        
        // Gửi event để Sidebar cập nhật theo
        window.dispatchEvent(new Event("storage"));
      };
      reader.readAsDataURL(file);
    }
  };

  // --- GIAO DIỆN CHI TIẾT PLAYLIST ---
  if (viewPlaylist) {
    return (
      <div className="animate-fade-in pb-32 pt-4">
        <button onClick={() => setViewPlaylist(null)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 font-bold transition">
          <FaArrowLeft /> Quay lại thư viện
        </button>

        <div className="flex flex-col md:flex-row gap-8 mb-8 items-end">
          
          {/* --- KHU VỰC ẢNH BÌA (CÓ CHỨC NĂNG EDIT) --- */}
          <div 
            className="relative group w-52 h-52 flex-shrink-0 cursor-pointer"
            onClick={() => fileInputRef.current.click()} // Bấm vào ảnh -> Mở chọn file
            title="Bấm để đổi ảnh bìa"
          >
            <img 
              src={viewPlaylist.image} 
              className="w-full h-full shadow-2xl rounded-lg object-cover" 
              alt="Cover"
            />
            
            {/* Lớp phủ đen mờ khi hover */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition duration-300 rounded-lg flex flex-col items-center justify-center text-white">
              <FaPen className="text-3xl mb-2" />
              <span className="text-xs font-bold uppercase tracking-wider">Đổi ảnh</span>
            </div>

            {/* Input file ẩn */}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpdate}
            />
          </div>

          <div className="flex flex-col justify-end w-full">
             <p className="text-sm font-bold uppercase mb-2 text-white">Playlist</p>
             {/* Tên Playlist to đùng */}
             <h1 className="text-5xl md:text-7xl font-black mb-4 text-white tracking-tighter truncate">{viewPlaylist.title}</h1>
             <p className="text-gray-400 font-medium">
               {viewPlaylist.songs?.length || 0} bài hát • <span className="text-[#b3b3b3]">Playlist của tôi</span>
             </p>
          </div>
        </div>

        {/* Danh sách bài hát */}
        <div className="bg-gradient-to-b from-[#181818]/50 to-[#121212] p-6 rounded-xl min-h-[300px]">
          {viewPlaylist.songs && viewPlaylist.songs.length > 0 ? (
            <div className="flex flex-col gap-2">
              {viewPlaylist.songs.map((song, index) => (
                <div 
                  key={index} 
                  onClick={() => playItem(song)}
                  className="flex items-center gap-4 p-3 rounded hover:bg-[#ffffff1a] cursor-pointer group transition"
                >
                  <span className="text-gray-400 w-6 text-center text-sm font-mono group-hover:hidden">{index + 1}</span>
                  <FaPlay className="text-white w-6 text-center text-xs hidden group-hover:block" />
                  
                  <img src={song.image} className="w-10 h-10 rounded shadow-sm" />
                  <div className="flex-1">
                    <h4 className="font-bold text-white group-hover:text-[#1db954] transition text-sm">{song.title}</h4>
                    <p className="text-xs text-gray-400" dangerouslySetInnerHTML={{__html: song.subtitle}}></p>
                  </div>
                  
                  {/* Nút xóa bài hát khỏi playlist (Optional - Có thể thêm sau) */}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-16 flex flex-col items-center">
              <div className="text-4xl mb-4">🎵</div>
              <p className="text-lg text-white font-bold mb-2">Playlist đang trống</p>
              <p className="text-sm">Hãy tìm kiếm bài hát và thêm vào đây nhé!</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- GIAO DIỆN CHÍNH (LIST PLAYLIST) ---
  return (
    <div className="animate-fade-in pb-32 pt-8">
      <h1 className="text-3xl font-bold mb-8 text-white">Thư viện cá nhân</h1>

      <section className="mb-12">
        <h2 className="text-xl font-bold mb-4 border-b border-gray-800 pb-2 text-white">Playlist của tôi</h2>
        {playlists.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {playlists.map(pl => (
              <div 
                key={pl.id} 
                onClick={() => setViewPlaylist(pl)}
                className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] relative group cursor-pointer transition duration-300"
              >
                <div className="relative mb-3 aspect-square shadow-lg">
                   <img src={pl.image} className="w-full h-full object-cover rounded-md" alt={pl.title}/>
                   {/* Nút Play to hiện khi hover */}
                   <div className="absolute bottom-2 right-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition duration-300 shadow-xl">
                      <div className="bg-[#1db954] rounded-full p-3 flex items-center justify-center hover:scale-105">
                        <FaPlay className="text-black ml-1 text-sm" />
                      </div>
                   </div>
                </div>
                
                <h3 className="font-bold truncate text-white mb-1">{pl.title}</h3>
                <p className="text-xs text-[#a7a7a7]">Playlist • {pl.songs?.length || 0} bài</p>
                
                <button 
                  onClick={(e) => handleDeleteRequest(e, pl.id)} 
                  className="absolute top-3 right-3 bg-[#121212]/80 hover:bg-red-600 text-white w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition z-10"
                  title="Xóa playlist"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center bg-[#181818] rounded-xl border border-[#333]">
            <p className="text-[#b3b3b3]">Chưa có playlist nào. Hãy bấm "Tạo Playlist" ở menu bên trái.</p>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4 border-b border-gray-800 pb-2 flex items-center gap-2 text-white">
           <FaHeart className="text-[#1db954]"/> Bài hát đã thích ({likedSongs.length})
        </h2>
        {likedSongs.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {likedSongs.map(song => <SongCard key={song.id} item={song} />)}
          </div>
        ) : (
          <p className="text-[#b3b3b3]">Chưa thích bài hát nào.</p>
        )}
      </section>

      {playlistToDelete && (
        <ConfirmModal 
          title="Xóa Playlist?"
          message="Bạn có chắc chắn muốn xóa playlist này không? Hành động này không thể hoàn tác."
          onConfirm={confirmDelete}
          onCancel={() => setPlaylistToDelete(null)}
        />
      )}
    </div>
  );
}