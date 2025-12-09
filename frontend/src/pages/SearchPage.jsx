import React, { useState, useEffect, useRef } from 'react';
import { runMiningAlgorithm, artists, countries, miningModels } from '../services/miningLogic';
import { smartSearch } from '../services/spotifyService';
import SongCard from '../components/SongCard';
import PlaylistCard from '../components/PlaylistCard';
import ArtistCard from '../components/ArtistCard';
import ArtistProfile from '../components/ArtistProfile'; 
import { FaChevronDown, FaSearch } from 'react-icons/fa';

// --- COMPONENT CON: Ô NHẬP LIỆU THÔNG MINH (AUTOCOMPLETE) ---
const SearchableDropdown = ({ options, placeholder, value, onChange, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterText, setFilterText] = useState(value);
  const wrapperRef = useRef(null);

  // Xử lý click ra ngoài để đóng dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cập nhật text khi props value thay đổi (ví dụ khi reset form)
  useEffect(() => {
    setFilterText(value);
  }, [value]);

  // Lọc danh sách hiển thị
  const filteredOptions = options.filter(item => 
    item.name.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="relative flex-1" ref={wrapperRef}>
      <div className="relative">
        <input 
          type="text"
          placeholder={placeholder}
          className="w-full bg-[#2a2a2a] text-white p-3 pr-10 rounded outline-none border border-transparent focus:border-[#1db954] transition placeholder-gray-500"
          value={filterText}
          onChange={(e) => {
            setFilterText(e.target.value);
            onChange(e.target.value); // Trả text về cha
            setIsOpen(true); // Mở dropdown khi gõ
          }}
          onFocus={() => setIsOpen(true)} // Mở dropdown khi bấm vào
        />
        <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs" />
      </div>

      {/* DROPDOWN DANH SÁCH (Chỉ hiện khi isOpen = true) */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#282828] border border-[#333] rounded-lg shadow-2xl max-h-60 overflow-y-auto z-50 scrollbar-thin">
          {filteredOptions.length > 0 ? (
            filteredOptions.map(item => (
              <div 
                key={item.id}
                onClick={() => {
                  setFilterText(item.name); // Điền tên vào ô
                  onSelect(item.id); // Trả ID về cha
                  onChange(item.name); 
                  setIsOpen(false); // Đóng dropdown
                }}
                className="p-3 hover:bg-[#3E3E3E] cursor-pointer text-sm text-gray-200 border-b border-[#333] last:border-0"
              >
                {item.name}
              </div>
            ))
          ) : (
            <div className="p-3 text-gray-500 text-sm">Không tìm thấy dữ liệu khớp...</div>
          )}
        </div>
      )}
    </div>
  );
};

// --- COMPONENT CHÍNH ---
export default function SearchPage({ onAddRequest, onShowToast }) {
  const [selectedModel, setSelectedModel] = useState(miningModels[0].id);
  
  // State lưu Text hiển thị trên ô nhập
  const [artistName, setArtistName] = useState('');
  const [countryName, setCountryName] = useState('');

  // State lưu ID thực sự để chạy thuật toán (ẩn bên dưới)
  const [selectedArtistId, setSelectedArtistId] = useState(null);
  const [selectedCountryId, setSelectedCountryId] = useState(null);

  const [results, setResults] = useState([]);
  const [resultType, setResultType] = useState('track'); 
  const [viewingArtist, setViewingArtist] = useState(null); 
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    // 1. Validation
    // Tìm ID quốc gia dựa trên tên (nếu người dùng gõ tay mà không chọn)
    let finalCountryId = selectedCountryId;
    if (!finalCountryId && countryName) {
        const foundC = countries.find(c => c.name.toLowerCase() === countryName.toLowerCase());
        finalCountryId = foundC ? foundC.id : 'VN'; // Mặc định VN nếu không tìm thấy
    }

    if (!countryName) {
      if(onShowToast) onShowToast("Vui lòng nhập Quốc gia!");
      return;
    }
    
    if (selectedModel !== 'market_trend' && !artistName) {
      if(onShowToast) onShowToast("Vui lòng nhập tên Nghệ sĩ!");
      return;
    }

    // Tìm ID nghệ sĩ (nếu người dùng gõ tay)
    let finalArtistId = selectedArtistId;
    if (!finalArtistId && artistName) {
        const foundA = artists.find(a => a.name.toLowerCase() === artistName.toLowerCase());
        finalArtistId = foundA ? foundA.id : 'unknown';
    }

    setIsLoading(true);
    setHasSearched(true);
    setViewingArtist(null);

    // 2. Chạy thuật toán
    const miningResult = runMiningAlgorithm(selectedModel, finalArtistId, finalCountryId);
    
    // Nếu ID unknown, dùng chính text người dùng nhập để tìm
    let query = miningResult.query;
    if (finalArtistId === 'unknown' && selectedModel === 'similar_artist') {
        query = artistName;
    }

    // 3. Gọi API
    const data = await smartSearch(query, miningResult.type);
    
    setResults(data);
    setResultType(miningResult.type);
    setIsLoading(false);
  };

  if (viewingArtist) {
    return <ArtistProfile artist={viewingArtist} onBack={() => setViewingArtist(null)} onAddRequest={onAddRequest} />;
  }

  return (
    <div className="animate-fade-in pb-32 pt-8">
      <h1 className="text-3xl font-bold mb-8">Hệ thống đề xuất Data Mining</h1>
      
      <div className="bg-[#181818] p-6 rounded-xl shadow-lg mb-8 max-w-4xl border border-[#333]">
        
        <h2 className="text-xl font-bold mb-4 text-[#1db954]">1. Chọn Mô hình Đề xuất</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {miningModels.map(model => (
            <div 
              key={model.id}
              onClick={() => setSelectedModel(model.id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition flex flex-col justify-center h-24 ${selectedModel === model.id ? 'border-[#1db954] bg-[#282828]' : 'border-transparent bg-[#121212] hover:bg-[#282828]'}`}
            >
              <h3 className={`font-bold text-sm mb-1 ${selectedModel === model.id ? 'text-[#1db954]' : 'text-white'}`}>{model.name.split(':')[0]}</h3>
              <p className="text-xs text-gray-400">{model.name.split(':')[1]}</p>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-bold mb-4 text-[#1db954]">2. Nhập dữ liệu đầu vào</h2>
        <div className="flex flex-col md:flex-row gap-4">
          
          {/* Ô NHẬP NGHỆ SĨ (AUTOCOMPLETE) */}
          {selectedModel !== 'market_trend' && (
            <SearchableDropdown 
              options={artists}
              placeholder="Nhập tên Nghệ sĩ..."
              value={artistName}
              onChange={(text) => {
                setArtistName(text);
                setSelectedArtistId(null); // Reset ID nếu người dùng sửa text
              }}
              onSelect={(id) => setSelectedArtistId(id)}
            />
          )}

          {/* Ô NHẬP QUỐC GIA (AUTOCOMPLETE) */}
          <SearchableDropdown 
            options={countries}
            placeholder="Nhập tên Quốc gia..."
            value={countryName}
            onChange={(text) => {
              setCountryName(text);
              setSelectedCountryId(null);
            }}
            onSelect={(id) => setSelectedCountryId(id)}
          />

          <button 
            onClick={handleSearch} 
            disabled={isLoading} 
            className="bg-[#1db954] text-black font-bold px-8 py-3 rounded-full hover:scale-105 active:scale-95 transition disabled:opacity-50 min-w-[150px] flex items-center justify-center gap-2"
          >
            {isLoading ? 'Đang chạy...' : <><FaSearch /> Phân tích</>}
          </button>
        </div>
      </div>

      {hasSearched && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Kết quả phân tích</h2>
          {isLoading ? (
            <div className="text-[#b3b3b3] p-10 text-center flex flex-col items-center">
               <div className="w-8 h-8 border-4 border-[#1db954] border-t-transparent rounded-full animate-spin mb-4"></div>
               Đang chạy thuật toán & kết nối API...
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {results.map(item => {
                if (resultType === 'artist') {
                  return <ArtistCard key={item.id} item={item} onClick={() => setViewingArtist(item)} />;
                } 
                else if (resultType === 'playlist') {
                  return <PlaylistCard key={item.id} item={item} />;
                } 
                else {
                  return <SongCard key={item.id} item={item} onAddToPlaylist={onAddRequest} />;
                }
              })}
            </div>
          ) : (
            <p className="text-[#b3b3b3]">Không tìm thấy kết quả phù hợp.</p>
          )}
        </div>
      )}
    </div>
  );
}