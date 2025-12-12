import React, { useState, useEffect, useRef } from 'react';
import SongCard from '../components/SongCard';
import ConfirmModal from '../components/ConfirmModal';
import { FaHeart, FaArrowLeft, FaPlay, FaPen, FaSearch, FaTimes, FaPlus, FaTrash, FaBook } from 'react-icons/fa';
import { usePlayer } from '../contexts/PlayerContext';
import { searchSpotify } from '../services/spotifyService';

export default function LibraryPage({ onShowToast, onOpenCreatePlaylist }) {
  const { playItem } = usePlayer();
  const [playlists, setPlaylists] = useState([]);
  const [likedSongs, setLikedSongs] = useState([]);
  
  const [viewPlaylist, setViewPlaylist] = useState(null);
  const [playlistToDelete, setPlaylistToDelete] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

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

  const handleInlineSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchResults([]);
    try {
      const results = await searchSpotify(searchQuery);
      setSearchResults(results || []);
    } catch (error) { console.error(error); } finally { setIsSearching(false); }
  };

  const handleDeleteRequest = (e, id) => { e.stopPropagation(); setPlaylistToDelete(id); };
  
  const confirmDelete = () => {
    if (!playlistToDelete) return;
    const newData = playlists.filter(p => p.id !== playlistToDelete);
    localStorage.setItem('myPlaylists', JSON.stringify(newData));
    setPlaylists(newData);
    if(viewPlaylist?.id === playlistToDelete) setViewPlaylist(null);
    setPlaylistToDelete(null);
    if (onShowToast) onShowToast("Playlist deleted successfully");
  };

  const handleImageUpdate = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500000) return alert("Image too large! Please choose an image < 500KB.");
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImage = reader.result;
        const updatedPlaylists = playlists.map(pl => pl.id === viewPlaylist.id ? { ...pl, image: newImage } : pl);
        localStorage.setItem('myPlaylists', JSON.stringify(updatedPlaylists));
        setPlaylists(updatedPlaylists);
        setViewPlaylist({ ...viewPlaylist, image: newImage });
        if (onShowToast) onShowToast("Cover image updated!");
        window.dispatchEvent(new Event("storage"));
      };
      reader.readAsDataURL(file);
    }
  };

  const clearInlineSearch = () => { setSearchQuery(''); setSearchResults([]); };

  const addSongToCurrentPlaylist = (track) => {
    if (viewPlaylist.songs.some(s => s.id === track.id)) {
      if (onShowToast) onShowToast("Song already in playlist!");
      return;
    }
    const updatedPlaylist = { ...viewPlaylist, songs: [...viewPlaylist.songs, track] };
    const updatedAllPlaylists = playlists.map(pl => pl.id === viewPlaylist.id ? updatedPlaylist : pl);
    localStorage.setItem('myPlaylists', JSON.stringify(updatedAllPlaylists));
    setPlaylists(updatedAllPlaylists);
    setViewPlaylist(updatedPlaylist); 
    if (onShowToast) onShowToast(`Added "${track.title}"`);
    window.dispatchEvent(new Event("storage"));
  };

  const removeSongFromPlaylist = (e, songId) => {
    e.stopPropagation();
    const updatedSongs = viewPlaylist.songs.filter(s => s.id !== songId);
    const updatedPlaylist = { ...viewPlaylist, songs: updatedSongs };
    const updatedAllPlaylists = playlists.map(pl => 
      pl.id === viewPlaylist.id ? updatedPlaylist : pl
    );
    localStorage.setItem('myPlaylists', JSON.stringify(updatedAllPlaylists));
    setPlaylists(updatedAllPlaylists);
    setViewPlaylist(updatedPlaylist);
    if (onShowToast) onShowToast("Removed song from playlist");
    window.dispatchEvent(new Event("storage"));
  };

  // --- VIEW DETAILS ---
  if (viewPlaylist) {
    return (
      <div className="animate-fade-in pb-32 pt-4">
        <button onClick={() => setViewPlaylist(null)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 font-bold transition text-sm">
          <FaArrowLeft /> Back to Library
        </button>

        <div className="flex flex-col md:flex-row gap-6 mb-8 items-end">
          <div className="relative group w-40 h-40 flex-shrink-0 cursor-pointer shadow-lg" onClick={() => fileInputRef.current.click()} title="Click to change cover">
            <img src={viewPlaylist.image} className="w-full h-full rounded shadow-xl object-cover" alt="Cover" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition duration-300 rounded flex flex-col items-center justify-center text-white">
              <FaPen className="text-2xl mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Edit</span>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpdate} />
          </div>
          <div className="flex flex-col justify-end w-full pb-1">
             <p className="text-xs font-bold uppercase mb-1 text-white">Playlist</p>
             <h1 className="text-3xl md:text-5xl font-black mb-3 text-white tracking-tight truncate">{viewPlaylist.title}</h1>
             <p className="text-sm text-gray-400 font-medium">
               Eclipsea User • {viewPlaylist.songs?.length || 0} songs
             </p>
          </div>
        </div>

        <div className="mb-8 relative z-20 w-full max-w-3xl"> 
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-white">Find songs to add</h2>
          </div>

          <form onSubmit={handleInlineSearch} className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            
            <input 
              type="text" 
              placeholder="Search for songs to add..." 
              className="w-full bg-[#2a2a2a] text-white pl-10 pr-10 py-3 rounded-md border border-transparent focus:border-[#1db954] outline-none transition placeholder-gray-500 shadow-md" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
            
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
               {isSearching ? (
                 <div className="w-4 h-4 border-2 border-[#1db954] border-t-transparent rounded-full animate-spin"></div>
               ) : searchQuery && (
                 <button type="button" onClick={clearInlineSearch} className="text-gray-400 hover:text-white">
                   <FaTimes />
                 </button>
               )}
            </div>
          </form>

          {searchResults.length > 0 && (
            <div className="bg-[#282828] rounded-md mt-2 border border-[#333] animate-slide-up max-h-[400px] overflow-y-auto shadow-2xl absolute top-full left-0 right-0 z-30">
              <h3 className="text-gray-400 text-xs font-bold uppercase px-4 py-2 bg-[#2a2a2a] sticky top-0">Results</h3>
              <div className="flex flex-col">
                {searchResults.map(song => {
                  const isAdded = viewPlaylist.songs.some(s => s.id === song.id);
                  return (
                    <div key={song.id} className="flex items-center gap-3 p-3 hover:bg-[#3E3E3E] group transition cursor-default border-b border-[#333] last:border-0">
                      <img src={song.image} className="w-10 h-10 rounded object-cover" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white text-sm truncate">{song.title}</h4>
                        <p className="text-xs text-gray-400 truncate" dangerouslySetInnerHTML={{__html: song.subtitle}}></p>
                      </div>
                      {isAdded ? (
                        <span className="text-xs text-[#1db954] font-bold px-3 py-1 border border-[#1db954] rounded-full">Added</span>
                      ) : (
                        <button 
                          onClick={() => addSongToCurrentPlaylist(song)} 
                          className="px-4 py-1.5 rounded-full border border-gray-500 text-white text-xs font-bold hover:border-white hover:bg-white hover:text-black transition"
                        >
                          Add
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="bg-[#181818]/30 p-4 rounded-lg min-h-[300px]">
          <h3 className="text-gray-400 text-xs font-bold uppercase mb-3 border-b border-[#333] pb-2">Tracks</h3>
          {viewPlaylist.songs && viewPlaylist.songs.length > 0 ? (
            <div className="flex flex-col gap-0.5"> 
              {viewPlaylist.songs.map((song, index) => (
                <div key={index} onClick={() => playItem(song)} className="flex items-center gap-3 p-2 rounded hover:bg-[#ffffff1a] cursor-pointer group transition">
                  <span className="text-gray-500 w-5 text-center text-xs font-mono group-hover:hidden">{index + 1}</span>
                  <FaPlay className="text-white w-5 text-center text-[10px] hidden group-hover:block" />
                  <img src={song.image} className="w-8 h-8 rounded shadow-sm" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white group-hover:text-[#1db954] transition text-sm truncate">{song.title}</h4>
                    <p className="text-xs text-gray-400 truncate" dangerouslySetInnerHTML={{__html: song.subtitle}}></p>
                  </div>
                  
                  <button 
                    onClick={(e) => removeSongFromPlaylist(e, song.id)}
                    className="text-gray-400 hover:text-white p-2 opacity-0 group-hover:opacity-100 transition"
                    title="Remove"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-10 flex flex-col items-center">
              <p className="text-sm">Playlist is empty</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-32">

      <div className="mb-10 p-6 rounded-xl bg-gradient-to-br from-indigo-900 to-black shadow-xl flex flex-col md:flex-row items-end gap-6">

        <div className="w-32 h-32 flex-shrink-0 bg-white/10 rounded-lg shadow-lg flex items-center justify-center backdrop-blur-sm">
           <FaBook className="text-5xl text-white" />
        </div>

        <div className="flex flex-col gap-1 w-full">
           <span className="text-xs font-bold uppercase tracking-widest text-white/70">Personal Space</span>
           
           <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight shadow-black drop-shadow-md">
             Your Library
           </h1>

           <div className="flex items-center gap-3 text-sm text-gray-300 mt-2 font-medium">
              <span>Eclipsea User</span>
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span>{playlists.length} Playlists</span>
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span>{likedSongs.length} Liked Songs</span>
           </div>
        </div>
      </div>

      <section className="mb-10 px-2 md:px-0">
        <div className="flex items-center justify-between mb-4 border-b border-[#282828] pb-2">
          <h2 className="text-lg font-bold text-white">My Playlists</h2>
          
          {playlists.length > 0 && (
            <button 
              onClick={onOpenCreatePlaylist}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition"
              title="Create new playlist"
            >
              <FaPlus className="text-sm" /> 
            </button>
          )}
        </div>

        {playlists.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {playlists.map(pl => (
              <div 
                key={pl.id} 
                onClick={() => {
                   setViewPlaylist(pl);
                   setSearchResults([]); 
                   setSearchQuery('');
                }}
                className="bg-[#181818] p-3 rounded-md hover:bg-[#282828] relative group cursor-pointer transition duration-300"
              >
                <div className="relative mb-3 aspect-square shadow-lg bg-[#282828] rounded-md overflow-hidden">
                   <img src={pl.image} className="w-full h-full object-cover" alt={pl.title}/>
                   <div className="absolute bottom-2 right-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition duration-300 shadow-xl">
                      <div className="bg-[#1db954] rounded-full p-2.5 flex items-center justify-center hover:scale-105 shadow-md">
                        <FaPlay className="text-black ml-0.5 text-xs" />
                      </div>
                   </div>
                </div>
                <h3 className="font-bold truncate text-white text-sm mb-1">{pl.title}</h3>
                <p className="text-xs text-[#a7a7a7]">By You</p>
                <button 
                  onClick={(e) => handleDeleteRequest(e, pl.id)} 
                  className="absolute top-2 right-2 bg-[#121212]/60 hover:bg-[#121212] text-gray-300 hover:text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition z-10"
                  title="Delete"
                >
                  <FaTrash className="text-[10px]" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center bg-[#181818]/50 rounded-lg border border-dashed border-[#333] flex flex-col items-center justify-center gap-4">
            <div 
              onClick={onOpenCreatePlaylist}
              className="w-12 h-12 bg-[#282828] hover:bg-[#1db954] rounded-full flex items-center justify-center text-gray-500 hover:text-black cursor-pointer transition-all duration-300 shadow-lg group"
              title="Click to create"
            >
              <FaPlus className="text-lg group-hover:rotate-90 transition-transform duration-300" />
            </div>
            <div>
              <p className="text-white font-bold text-sm mb-1">Create your first playlist</p>
              <p className="text-xs text-[#777]">It's easy, we'll help you.</p>
            </div>
          </div>
        )}
      </section>

      <section className="px-2 md:px-0">
        <h2 className="text-lg font-bold mb-4 border-b border-[#282828] pb-2 flex items-center gap-2 text-white">
           <FaHeart className="text-[#1db954] text-sm"/> Liked Songs
        </h2>
        {likedSongs.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {likedSongs.map(song => <SongCard key={song.id} item={song} onShowToast={onShowToast} />)}
          </div>
        ) : (
          <p className="text-xs text-[#777]">No liked songs yet.</p>
        )}
      </section>

      {playlistToDelete && (
        <ConfirmModal 
          title="Delete Playlist"
          message="Are you sure? This cannot be undone."
          onConfirm={confirmDelete}
          onCancel={() => setPlaylistToDelete(null)}
        />
      )}
    </div>
  );
}