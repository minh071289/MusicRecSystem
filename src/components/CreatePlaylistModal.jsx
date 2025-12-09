import React, { useState, useRef } from 'react';
import { FaCamera, FaMusic } from 'react-icons/fa';

export default function CreatePlaylistModal({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [image, setImage] = useState(null); // Lưu chuỗi Base64 ảnh
  const fileInputRef = useRef(null);

  // Xử lý khi chọn file ảnh
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Kiểm tra dung lượng (giới hạn < 500KB để tránh đầy LocalStorage)
      if (file.size > 500000) {
        alert("Ảnh quá lớn! Vui lòng chọn ảnh nhỏ hơn 500KB để lưu vào trình duyệt.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result); // Kết quả là chuỗi Base64
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    // Gửi cả tên và ảnh sang App.jsx
    onCreate(name, image);
    setName('');
    setImage(null);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#282828] w-full max-w-md rounded-xl p-6 shadow-2xl relative animate-scale-up border border-[#333]">
        <h2 className="text-xl font-bold text-white mb-6 text-center">Tạo Playlist mới</h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* KHU VỰC UPLOAD ẢNH & NHẬP TÊN (Chia cột) */}
          <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
            
            {/* 1. Ô vuông ảnh (Click vào để upload) */}
            <div 
              onClick={() => fileInputRef.current.click()}
              className="w-32 h-32 flex-shrink-0 bg-[#181818] rounded-md shadow-lg flex items-center justify-center cursor-pointer group relative overflow-hidden border border-[#333] hover:border-[#444]"
              title="Tải ảnh bìa lên"
            >
              {image ? (
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center text-gray-500 group-hover:text-white transition">
                  <FaMusic className="text-3xl mb-2" />
                  <span className="text-[10px]">Chọn ảnh</span>
                </div>
              )}
              
              {/* Overlay icon Camera khi hover */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                <FaCamera className="text-white text-2xl" />
              </div>

              {/* Input file ẩn */}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>

            {/* 2. Ô nhập tên */}
            <div className="flex-1 w-full">
              <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2 block">Tên Playlist</label>
              <input 
                type="text" 
                autoFocus
                placeholder="Ví dụ: Nhạc Chill..." 
                className="w-full bg-[#3e3e3e] text-white p-3 rounded border border-transparent focus:border-[#1db954] outline-none transition placeholder-gray-500 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <p className="text-[10px] text-gray-500 mt-2 ml-1 italic">
                *Mẹo: Ảnh dung lượng thấp giúp lưu trữ mượt hơn.
              </p>
            </div>
          </div>
          
          {/* Nút bấm */}
          <div className="flex gap-3 justify-end mt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="text-white font-bold px-4 py-2 rounded hover:bg-white/10 transition text-sm"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              disabled={!name.trim()}
              className="bg-[#1db954] text-black font-bold px-8 py-2 rounded-full hover:scale-105 active:scale-95 transition disabled:opacity-50 text-sm"
            >
              Tạo mới
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}