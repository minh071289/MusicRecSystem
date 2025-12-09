import { useState, useRef } from 'react'; // Thêm useRef
import { PlayerProvider } from './contexts/PlayerContext';

// Import Components
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import Player from './components/Player';
import AddToPlaylistModal from './components/AddToPlaylistModal';
import CreatePlaylistModal from './components/CreatePlaylistModal';
import Toast from './components/Toast';

// Import Pages
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import LibraryPage from './pages/LibraryPage';

function App() {
  const [view, setView] = useState('home');
  const [trackToAdd, setTrackToAdd] = useState(null); 
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // --- 1. STATE & REF CHO HIỆU ỨNG SCROLL ---
  const [scrollOpacity, setScrollOpacity] = useState(1);
  const scrollContainerRef = useRef(null); // Ref để móc vào thẻ div cuộn

  // Hàm hiển thị thông báo
  const showToast = (message) => {
    setToastMessage(message);
  };

  // --- 2. HÀM XỬ LÝ KHI CUỘN ---
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollTop = scrollContainerRef.current.scrollTop;
      // Tính toán độ mờ: Càng cuộn xuống (max 300px), độ mờ càng giảm
      // Bắt đầu từ 0.8, giảm dần về 0.1
      const newOpacity = Math.max(0.1, 0.8 - scrollTop / 400);
      setScrollOpacity(newOpacity);
    }
  };

  const handleCreatePlaylist = (playlistName, playlistImage) => {
    try {
      const existing = JSON.parse(localStorage.getItem('myPlaylists')) || [];
      const newPlaylist = {
        id: Date.now(),
        title: playlistName,
        image: playlistImage || ('https://placehold.co/400x400/222/fff?text=' + playlistName.charAt(0).toUpperCase()),
        subtitle: 'Playlist của tôi',
        songs: []
      };
      localStorage.setItem('myPlaylists', JSON.stringify([...existing, newPlaylist]));
      
      setIsCreateModalOpen(false);
      setView('library');
      window.dispatchEvent(new Event("storage")); 
      showToast(`Đã tạo playlist "${playlistName}"`);
    } catch (error) {
      console.error("Lỗi lưu trữ:", error);
      alert("Không thể lưu Playlist! Vui lòng chọn ảnh nhẹ hơn.");
    }
  };

  return (
    <PlayerProvider>
      <div className="flex h-screen bg-black text-white font-sans overflow-hidden">
        
        <Sidebar 
          view={view} 
          setView={setView} 
          onOpenCreateModal={() => setIsCreateModalOpen(true)} 
        />
        
        <main className="flex-1 bg-[#121212] m-0 md:m-2 md:rounded-lg overflow-hidden relative flex flex-col">
          
          {/* --- 3. NỀN GRADIENT ĐỘNG --- */}
          {/* Style opacity thay đổi theo biến scrollOpacity */}
          <div 
            className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#1e3a8a] to-[#121212] -z-0 pointer-events-none transition-opacity duration-300 ease-out"
            style={{ opacity: scrollOpacity }}
          ></div>
          
          {/* --- 4. GẮN SỰ KIỆN SCROLL VÀO ĐÂY --- */}
          <div 
            ref={scrollContainerRef} // Gắn Ref
            onScroll={handleScroll}  // Gắn hàm xử lý
            className="flex-1 overflow-y-auto p-4 md:p-8 z-10 scroll-smooth"
          >
            {view === 'home' && <HomePage onAddRequest={setTrackToAdd} />}
            {view === 'search' && <SearchPage onAddRequest={setTrackToAdd} onShowToast={showToast} />}
            {view === 'library' && <LibraryPage onShowToast={showToast} />}
          </div>
        </main>

        <Player />
        <MobileNav view={view} setView={setView} />

        {/* --- MODALS --- */}
        {trackToAdd && (
          <AddToPlaylistModal 
            track={trackToAdd} 
            onClose={() => setTrackToAdd(null)} 
            onShowToast={showToast} 
          />
        )}

        {isCreateModalOpen && (
          <CreatePlaylistModal 
            onClose={() => setIsCreateModalOpen(false)}
            onCreate={handleCreatePlaylist}
          />
        )}

        {toastMessage && (
          <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
        )}

      </div>
    </PlayerProvider>
  );
}

export default App;