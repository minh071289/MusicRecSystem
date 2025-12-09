// Dữ liệu giả lập mở rộng
export const artists = [
  // V-Pop
  { id: '1', name: 'Sơn Tùng M-TP', genre: 'Pop' },
  { id: '4', name: 'Đen Vâu', genre: 'Rap' },
  { id: '6', name: 'Binz', genre: 'Rap' },
  { id: '7', name: 'Hoàng Thùy Linh', genre: 'Pop' },
  { id: '8', name: 'Mono', genre: 'Pop' },
  { id: '9', name: 'HIEUTHUHAI', genre: 'Rap' },
  { id: '10', name: 'Mỹ Tâm', genre: 'Pop' },
  { id: '11', name: 'Phan Mạnh Quỳnh', genre: 'Ballad' },
  { id: '12', name: 'Vũ.', genre: 'Indie' },
  { id: '13', name: 'MCK', genre: 'Rap' },
  
  // US-UK
  { id: '2', name: 'Taylor Swift', genre: 'Country Pop' },
  { id: '5', name: 'Imagine Dragons', genre: 'Rock' },
  { id: '14', name: 'Justin Bieber', genre: 'Pop' },
  { id: '15', name: 'The Weeknd', genre: 'R&B' },
  { id: '16', name: 'Ariana Grande', genre: 'Pop' },
  { id: '17', name: 'Bruno Mars', genre: 'Pop' },
  { id: '18', name: 'Ed Sheeran', genre: 'Pop' },
  
  // K-Pop
  { id: '3', name: 'BTS', genre: 'K-Pop' },
  { id: '19', name: 'BLACKPINK', genre: 'K-Pop' },
  { id: '20', name: 'NewJeans', genre: 'K-Pop' },
  { id: '21', name: 'TWICE', genre: 'K-Pop' },
  { id: '22', name: 'Big Bang', genre: 'K-Pop' },
];

export const countries = [
  { id: 'VN', name: 'Việt Nam' },
  { id: 'US', name: 'Mỹ - Anh (US-UK)' },
  { id: 'KR', name: 'Hàn Quốc (K-Pop)' },
  { id: 'JP', name: 'Nhật Bản' },
  { id: 'CN', name: 'Trung Quốc' },
  { id: 'TH', name: 'Thái Lan' },
  { id: 'BR', name: 'Brazil' },
  { id: 'ES', name: 'Tây Ban Nha' },
];

export const miningModels = [
  { id: 'similar_artist', name: 'Mô hình 1: Nghệ sĩ tương đồng (Artist Similarity)' },
  { id: 'mood_mix', name: 'Mô hình 2: Gợi ý bài hát theo Mood (Content-Based)' },
  { id: 'market_trend', name: 'Mô hình 3: Xu hướng thị trường (Trend Analysis)' },
];

// Hàm chạy thuật toán (Logic giả lập)
export const runMiningAlgorithm = (modelId, artistId, countryId) => {
  console.log(`Running Model: ${modelId} | ArtistID: ${artistId} | Country: ${countryId}`);
  
  // Logic cơ bản: Nếu có ArtistID cụ thể thì dùng logic mapping, không thì trả về tên chung
  
  // MODEL 3: TREND (Chỉ cần Quốc gia)
  if (modelId === 'market_trend') {
    if (countryId === 'VN') return { query: 'Top 50 Vietnam', type: 'playlist' };
    if (countryId === 'KR') return { query: 'K-Pop Hot 100', type: 'playlist' };
    if (countryId === 'JP') return { query: 'Japan Top 50', type: 'playlist' };
    return { query: 'Global Top 50', type: 'playlist' };
  }

  // MODEL 1 & 2: Cần Artist
  // Nếu artistId là 'unknown' (người dùng nhập tên lạ), ta trả về chính tên đó để tìm kiếm
  
  const artistNameLookup = artists.find(a => a.id === artistId)?.name || '';

  if (modelId === 'similar_artist') {
    if (artistId === '1') return { query: 'Son Tung M-TP Fans', type: 'artist' }; 
    if (artistId === '3') return { query: 'K-Pop Boy Groups', type: 'artist' };
    // Mặc định: Tìm nghệ sĩ tương tự thông qua search của Spotify
    return { query: artistNameLookup || 'Pop Artist', type: 'artist' };
  }

  if (modelId === 'mood_mix') {
    if (countryId === 'VN') return { query: 'V-Pop Chill', type: 'track' };
    if (artistId === '4') return { query: 'Vietnamese Rap', type: 'track' };
    // Mặc định
    return { query: `${artistNameLookup} Mix`, type: 'track' };
  }

  return { query: 'Pop', type: 'track' };
};