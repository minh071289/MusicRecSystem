import React, { useEffect, useState } from 'react';
import { FaSearch, FaTimes, FaArrowLeft } from 'react-icons/fa';
import { getNewReleases, getTopTracks, searchSpotify } from '../services/spotifyService';
import SongCard from '../components/SongCard';
import AlbumCard from '../components/AlbumCard';

// 1. Nhận thêm prop onShowToast ở đây
export default function HomePage({ onAddRequest, onShowToast }) {
  const [topTracks, setTopTracks] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const getGreetingWithEmoji = () => {
    const hour = new Date().getHours();
    const greetings = [
      { time: [0, 5], text: "Dreaming in the Eclips-era 🌙", emoji: "🌙" },
      { time: [5, 12], text: "Eclipse the morning blues ☀️", emoji: "☀️" },
      { time: [12, 14], text: "Eclipse your hunger 🍽️", emoji: "🍽️" },
      { time: [14, 18], text: "Afternoon vibes in our Era 🌤️", emoji: "🌤️" },
      { time: [18, 22], text: "Have a good Eclip-sera 🌃", emoji: "🌃" },
      { time: [22, 24], text: "Stars align in the Eclipsera ⭐", emoji: "⭐" }
    ];
    return greetings.find(g => hour >= g.time[0] && hour < g.time[1])?.text || "Welcome to Eclipsera!";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tracks, releases] = await Promise.all([
          getTopTracks(),
          getNewReleases()
        ]);
        setTopTracks(tracks || []);
        setNewReleases(releases || []);
      } catch (e) { console.error(e); } 
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await searchSpotify(searchQuery);
      setSearchResults(results);
    } catch (error) { console.error(error); }
  };

  const clearSearch = () => {
    setIsSearching(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  if (loading) return <div className="p-8 text-[#b3b3b3] flex justify-center h-screen items-center">Loading data...</div>;

  return (
    <div className="animate-fade-in pb-32">
       
       <div className="mb-8 p-6 rounded-xl bg-gradient-to-br from-indigo-900 to-black shadow-xl">
        <h1 className="text-2xl md:text-4xl font-bold mb-4 font-orbitron tracking-wide text-white/90">
            {getGreetingWithEmoji()}
        </h1>
        
        <form onSubmit={handleSearch} className="relative max-w-md">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="What do you want to listen to? (Song, Artist...)" 
            className="w-full bg-white/10 text-white pl-10 pr-10 py-3 rounded-full border border-transparent focus:border-[#1db954] focus:bg-white/20 outline-none transition placeholder-gray-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button type="button" onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
              <FaTimes />
            </button>
          )}
        </form>
      </div>

      {isSearching ? (
        <div className="animate-slide-up">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={clearSearch} className="flex items-center gap-2 text-gray-400 hover:text-white font-bold transition">
              <FaArrowLeft /> Back to Home
            </button>
            <h2 className="text-2xl font-bold">Results for "{searchQuery}"</h2>
          </div>
          {searchResults.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {/* 2. Truyền onShowToast vào SongCard kết quả tìm kiếm */}
              {searchResults.map(item => (
                <SongCard 
                  key={item.id} 
                  item={item} 
                  onAddToPlaylist={onAddRequest} 
                  onShowToast={onShowToast} 
                />
              ))}
            </div>
          ) : (
             <div className="text-center text-gray-400 py-10">No results found.</div>
          )}
        </div>
      ) : (
        <div className="animate-fade-in">
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Trending Songs</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {/* 3. Truyền onShowToast vào SongCard thịnh hành */}
              {topTracks.map(item => (
                <SongCard 
                  key={item.id} 
                  item={item} 
                  onAddToPlaylist={onAddRequest} 
                  onShowToast={onShowToast} 
                />
              ))}
            </div>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">New Albums</h2>
            <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
              {newReleases.map(item => <AlbumCard key={item.id} item={item} />)}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}