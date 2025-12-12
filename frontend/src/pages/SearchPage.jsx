import React, { useState, useEffect, useRef } from 'react';
import { runMiningAlgorithm, artistModels, fpArtistList, cfArtistList, userList, loadAllData } from '../services/miningLogic';
import { getArtistsDetails, smartSearch } from '../services/spotifyService';
import SongCard from '../components/SongCard';
import PlaylistCard from '../components/PlaylistCard';
import ArtistCard from '../components/ArtistCard';
import ArtistProfile from '../components/ArtistProfile'; 
import { FaChevronDown, FaSearch, FaUser, FaMusic, FaSignInAlt, FaChartBar, FaUsers } from 'react-icons/fa';

const SimpleBarChart = ({ data, color, title }) => {
  return (
    <div className="bg-[#2a2a2a] p-4 rounded-lg border border-[#333] w-full">
      <h4 className="text-xs font-bold uppercase text-gray-400 mb-3 flex items-center gap-2">
        <FaChartBar /> {title}
      </h4>
      <div className="space-y-3">
        {data.map((item, idx) => (
          <div key={idx} className="w-full">
            <div className="flex justify-between text-xs text-white mb-1">
              <span>{item.name}</span>
              <span className="font-mono text-[#1db954]">{item.value.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-[#121212] rounded-full h-2 overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${item.value}%`, backgroundColor: color }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const LoginForm = ({ onLogin }) => {
  const [userId, setUserId] = useState('');
  return (
    <div className="flex flex-col items-center justify-center py-8 animate-fade-in">
      <div className="w-16 h-16 bg-[#2a2a2a] rounded-full flex items-center justify-center text-3xl text-gray-400 mb-4">
        <FaUser />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">My Community</h3>
      <p className="text-gray-400 text-sm mb-6 text-center max-w-sm">
        Enter your User ID to analyze your demographic profile.
      </p>
      
      <div className="flex gap-2 w-full max-w-md">
        <input 
          type="text" placeholder="User ID (e.g. 1, 5...)" 
          className="flex-1 bg-[#2a2a2a] text-white p-3 pl-5 rounded-l-lg outline-none border border-transparent focus:border-[#1db954] transition placeholder-gray-500"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && userId && onLogin(userId)}
        />
        <button onClick={() => userId && onLogin(userId)}
          className="bg-[#1db954] text-black font-bold px-6 py-3 rounded-r-lg hover:bg-[#1ed760] transition flex items-center gap-2"
        >
          <FaSignInAlt /> Access
        </button>
      </div>
    </div>
  );
};

const ArtistDropdown = ({ options, value, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState(value);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => { setText(value) }, [value]);

  const filteredOptions = options.filter(item => item.name.toLowerCase().includes(text.toLowerCase())).slice(0, 50);

  return (
    <div className="relative flex-1" ref={wrapperRef}>
      <div className="relative">
        <input type="text" placeholder="Search Artist Name..." 
          className="w-full bg-[#2a2a2a] text-white p-4 pl-12 pr-10 rounded-lg outline-none border border-transparent focus:border-[#1db954] transition placeholder-gray-500 shadow-inner"
          value={text} onChange={(e) => { setText(e.target.value); setIsOpen(true); }} onFocus={() => setIsOpen(true)}
        />
        <FaMusic className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#282828] border border-[#333] rounded-lg shadow-2xl max-h-60 overflow-y-auto z-50 scrollbar-thin animate-slide-up">
          {filteredOptions.length > 0 ? (
            filteredOptions.map(item => (
              <div key={item.id} onClick={() => { setText(item.name); onSelect(item.id); setIsOpen(false); }}
                className="p-3 hover:bg-[#3E3E3E] cursor-pointer text-sm text-gray-200 border-b border-[#333] last:border-0"
              >{item.name}</div>
            ))
          ) : (
            <div className="p-4 text-gray-500 text-sm">Artist not found in this model</div>
          )}
        </div>
      )}
    </div>
  );
};

export default function SearchPage({ onAddRequest, onShowToast }) {
  const [activeTab, setActiveTab] = useState('artist');
  const [selectedModel, setSelectedModel] = useState(artistModels[0].id);
  const [inputValue, setInputValue] = useState('');
  const [inputLabel, setInputLabel] = useState('');

  const [currentUser, setCurrentUser] = useState(null);
  const [userStats, setUserStats] = useState(null);

  const [results, setResults] = useState([]);
  const [explanation, setExplanation] = useState('');
  const [resultType, setResultType] = useState('track'); 
  const [viewingArtist, setViewingArtist] = useState(null); 
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);

  useEffect(() => {
    const init = async () => { await loadAllData(); setIsDataReady(true); };
    init();
  }, []);

  const currentArtistList = selectedModel === 'fp_growth' ? fpArtistList : cfArtistList;

  const switchTab = (tab) => {
    setActiveTab(tab);
    setInputValue(''); setInputLabel(''); setResults([]); setHasSearched(false); setExplanation('');
    setCurrentUser(null); setUserStats(null);
  };

  const handleAnalysis = async (val, modeOverride) => {
    setIsLoading(true);
    setHasSearched(true);
    setViewingArtist(null);

    const mode = modeOverride || activeTab;
    const miningResult = runMiningAlgorithm(mode, selectedModel, val);
    
    setExplanation(miningResult.explanation);
    if (miningResult.stats) setUserStats(miningResult.stats);

    let data = [];
    try {
        if (miningResult.type === 'artist_list') {
            data = await getArtistsDetails(miningResult.data);
        } else {
            data = await smartSearch(miningResult.query, miningResult.type);
        }
    } catch(e) { console.error(e); }
    
    setResults(data);
    setResultType(miningResult.type === 'artist_list' ? 'artist' : miningResult.type);
    setIsLoading(false);
  };

  const handleUserLogin = (uid) => {
    if (!userList.includes(uid)) {
        if(onShowToast) onShowToast("User ID not found!");
        return;
    }
    setCurrentUser(uid);
    handleAnalysis(uid, 'user');
  };

  if (viewingArtist) return <ArtistProfile artist={viewingArtist} onBack={() => setViewingArtist(null)} onAddRequest={onAddRequest} />;

  return (
    <div className="animate-fade-in pb-32 pt-8 px-4 md:px-0">
      <h1 className="text-4xl font-black mb-8 text-white tracking-tight">
        Recommended <span className="text-[#1db954]">Station</span>
      </h1>
      
      <div className="flex gap-6 mb-6 border-b border-[#333]">
        <button onClick={() => switchTab('artist')}
            className={`pb-3 text-sm font-bold uppercase tracking-wider border-b-2 transition ${activeTab === 'artist' ? 'border-[#1db954] text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
        ><FaMusic className="inline mb-1 mr-2"/> Artist Discovery</button>
        <button onClick={() => switchTab('user')}
            className={`pb-3 text-sm font-bold uppercase tracking-wider border-b-2 transition ${activeTab === 'user' ? 'border-[#1db954] text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
        ><FaUsers className="inline mb-1 mr-2"/> My Community</button>
      </div>

      <div className="bg-[#181818] p-8 rounded-2xl shadow-xl border border-[#333] mb-10 min-h-[300px]">
        
        {/* --- TAB 1: ARTIST --- */}
        {activeTab === 'artist' && (
            <div className="animate-slide-up">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {artistModels.map(model => (
                        <div key={model.id} 
                            onClick={() => { 
                                setSelectedModel(model.id); 
                                setInputValue(''); 
                                setInputLabel(''); 
                            }}
                            className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-[1.02]
                                ${selectedModel === model.id ? 'border-[#1db954] bg-[#1db954]/10' : 'border-[#333] bg-[#222] hover:border-gray-500'}`}
                        >
                            <h3 className={`font-bold text-base mb-1 ${selectedModel === model.id ? 'text-[#1db954]' : 'text-white'}`}>{model.name}</h3>
                            <p className="text-xs text-gray-400 leading-relaxed">{model.desc}</p>
                        </div>
                    ))}
                </div>
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    {isDataReady ? (
                        <>
                            <ArtistDropdown options={currentArtistList} value={inputLabel} 
                                onSelect={(id) => { setInputValue(id); const a = currentArtistList.find(x=>x.id===id); setInputLabel(a?a.name:id); }} 
                            />
                            <button onClick={() => inputValue ? handleAnalysis(inputValue) : onShowToast("Please enter artist name!")} 
                                disabled={isLoading} 
                                className="bg-[#1db954] text-black font-extrabold px-8 py-4 rounded-lg hover:scale-105 transition shadow-lg flex items-center gap-2 whitespace-nowrap min-w-[160px] justify-center"
                            >
                                {isLoading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : <><FaSearch /> Explore</>}
                            </button>
                        </>
                    ) : <div className="text-gray-500 italic w-full text-center py-4">Loading artist database...</div>}
                </div>
            </div>
        )}

        {/* --- TAB 2: USER --- */}
        {activeTab === 'user' && (
            <div className="animate-slide-up">
                {!currentUser ? (
                    isDataReady ? <LoginForm onLogin={handleUserLogin} /> : <div className="text-gray-500 italic text-center py-10">Loading users...</div>
                ) : (
                    <div className="flex flex-col items-center animate-fade-in w-full">
                        <div className="flex items-center gap-4 bg-[#2a2a2a] px-6 py-4 rounded-full border border-[#1db954] mb-8 shadow-lg">
                            <span className="text-white font-bold">Logged in as User #{currentUser}</span>
                            <button onClick={() => { setCurrentUser(null); setResults([]); }} className="ml-4 text-xs text-gray-400 hover:text-white underline">Sign Out</button>
                        </div>
                        
                        {userStats && (
                            <div className="w-full mb-8">
                                <p className="text-gray-300 mb-6 text-center text-sm bg-[#2a2a2a]/50 p-3 rounded border border-[#333] w-full">
                                    <FaUsers className="inline mr-2 text-[#1db954]"/>
                                    Here is the distribution of the top 30 users that share the same music taste as you
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <SimpleBarChart title="Gender Distribution" color="#3b82f6" data={userStats.sex} />
                                    <SimpleBarChart title="Top Country Distribution" color="#1db954" data={userStats.countries} />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        )}
      </div>

      {hasSearched && results.length > 0 && (
        <div className="animate-slide-up">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
             <span className="text-[#1db954]">Recommended</span> for You <div className="h-px bg-gray-800 flex-1"></div>
          </h2>
          {explanation && (
             <div className="mb-8 p-6 bg-gradient-to-r from-[#1db954]/10 to-transparent border-l-4 border-[#1db954] rounded-r-lg text-sm text-gray-300 shadow-md">
                <span dangerouslySetInnerHTML={{__html: explanation}}></span>
             </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {results.map((item, idx) => (
              resultType === 'artist' 
                ? <ArtistCard key={idx} item={item} onClick={() => setViewingArtist(item)} />
                : resultType === 'playlist'
                  ? <PlaylistCard key={idx} item={item} />
                  : <SongCard key={idx} item={item} onAddToPlaylist={onAddRequest} onShowToast={onShowToast} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}