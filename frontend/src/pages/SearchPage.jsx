import React, { useState, useEffect, useRef } from 'react';
import { runMiningAlgorithm, artists, countries, miningModels } from '../services/miningLogic';
import { smartSearch } from '../services/spotifyService';
import SongCard from '../components/SongCard';
import PlaylistCard from '../components/PlaylistCard';
import ArtistCard from '../components/ArtistCard';
import ArtistProfile from '../components/ArtistProfile'; 
import { FaChevronDown, FaSearch } from 'react-icons/fa';

// --- COMPONENT CON: AUTOCOMPLETE INPUT ---
const SearchableDropdown = ({ options, placeholder, value, onChange, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterText, setFilterText] = useState(value);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setFilterText(value);
  }, [value]);

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
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs" />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#282828] border border-[#333] rounded-lg shadow-2xl max-h-60 overflow-y-auto z-50 scrollbar-thin">
          {filteredOptions.length > 0 ? (
            filteredOptions.map(item => (
              <div 
                key={item.id}
                onClick={() => {
                  setFilterText(item.name);
                  onSelect(item.id);
                  onChange(item.name); 
                  setIsOpen(false);
                }}
                className="p-3 hover:bg-[#3E3E3E] cursor-pointer text-sm text-gray-200 border-b border-[#333] last:border-0"
              >
                {item.name}
              </div>
            ))
          ) : (
            <div className="p-3 text-gray-500 text-sm">No matching data found...</div>
          )}
        </div>
      )}
    </div>
  );
};

// --- MAIN COMPONENT ---
export default function SearchPage({ onAddRequest, onShowToast }) {
  const [selectedModel, setSelectedModel] = useState(miningModels[0].id);
  
  const [artistName, setArtistName] = useState('');
  const [countryName, setCountryName] = useState('');

  const [selectedArtistId, setSelectedArtistId] = useState(null);
  const [selectedCountryId, setSelectedCountryId] = useState(null);

  const [results, setResults] = useState([]);
  const [resultType, setResultType] = useState('track'); 
  const [viewingArtist, setViewingArtist] = useState(null); 
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Helper để hiển thị tên Model bằng tiếng Anh (ghi đè tên tiếng Việt từ file logic)
  const getModelNameInEnglish = (modelId) => {
    switch (modelId) {
        case 'similar_artist': return { title: 'Model 1', subtitle: 'Artist Similarity' };
        case 'mood_mix': return { title: 'Model 2', subtitle: 'Mood-Based Mix' };
        case 'market_trend': return { title: 'Model 3', subtitle: 'Market Trends' };
        default: return { title: 'Unknown Model', subtitle: 'General Analysis' };
    }
  };

  const handleSearch = async () => {
    // 1. Validation
    let finalCountryId = selectedCountryId;
    if (!finalCountryId && countryName) {
        const foundC = countries.find(c => c.name.toLowerCase() === countryName.toLowerCase());
        finalCountryId = foundC ? foundC.id : 'VN';
    }

    if (!countryName) {
      if(onShowToast) onShowToast("Please select a Country!");
      return;
    }
    
    if (selectedModel !== 'market_trend' && !artistName) {
      if(onShowToast) onShowToast("Please enter an Artist name!");
      return;
    }

    let finalArtistId = selectedArtistId;
    if (!finalArtistId && artistName) {
        const foundA = artists.find(a => a.name.toLowerCase() === artistName.toLowerCase());
        finalArtistId = foundA ? foundA.id : 'unknown';
    }

    setIsLoading(true);
    setHasSearched(true);
    setViewingArtist(null);

    // 2. Run Algorithm
    const miningResult = runMiningAlgorithm(selectedModel, finalArtistId, finalCountryId);
    
    let query = miningResult.query;
    if (finalArtistId === 'unknown' && selectedModel === 'similar_artist') {
        query = artistName;
    }

    // 3. Call API
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
      <h1 className="text-3xl font-bold mb-8">Data Mining Discovery System</h1>
      
      <div className="bg-[#181818] p-6 rounded-xl shadow-lg mb-8 max-w-4xl border border-[#333]">
        
        <h2 className="text-xl font-bold mb-4 text-[#1db954]">1. Select Recommendation Model</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {miningModels.map(model => {
            const engName = getModelNameInEnglish(model.id);
            return (
                <div 
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition flex flex-col justify-center h-24 ${selectedModel === model.id ? 'border-[#1db954] bg-[#282828]' : 'border-transparent bg-[#121212] hover:bg-[#282828]'}`}
                >
                <h3 className={`font-bold text-sm mb-1 ${selectedModel === model.id ? 'text-[#1db954]' : 'text-white'}`}>{engName.title}</h3>
                <p className="text-xs text-gray-400">{engName.subtitle}</p>
                </div>
            );
          })}
        </div>

        <h2 className="text-xl font-bold mb-4 text-[#1db954]">2. Enter Input Data</h2>
        <div className="flex flex-col md:flex-row gap-4">
          
          {/* ARTIST INPUT */}
          {selectedModel !== 'market_trend' && (
            <SearchableDropdown 
              options={artists}
              placeholder="Enter Artist Name..."
              value={artistName}
              onChange={(text) => {
                setArtistName(text);
                setSelectedArtistId(null); 
              }}
              onSelect={(id) => setSelectedArtistId(id)}
            />
          )}

          {/* COUNTRY INPUT */}
          <SearchableDropdown 
            options={countries}
            placeholder="Enter Country..."
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
            {isLoading ? 'Processing...' : <><FaSearch /> Analyze</>}
          </button>
        </div>
      </div>

      {hasSearched && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Analysis Results</h2>
          {isLoading ? (
            <div className="text-[#b3b3b3] p-10 text-center flex flex-col items-center">
               <div className="w-8 h-8 border-4 border-[#1db954] border-t-transparent rounded-full animate-spin mb-4"></div>
               Running data mining algorithms...
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
                  return <SongCard key={item.id} item={item} onAddToPlaylist={onAddRequest} onShowToast={onShowToast}/>;
                }
              })}
            </div>
          ) : (
            <p className="text-[#b3b3b3]">No suitable results found.</p>
          )}
        </div>
      )}
    </div>
  );
}