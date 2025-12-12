// --- 1. DATASETS (English Translated) ---

export const artists = [
  { id: 'son_tung', name: 'Sơn Tùng M-TP', genres: 'V-Pop, Pop Ballad', region: 'VN' },
  { id: 'den_vau', name: 'Đen Vâu', genres: 'Rap, Hip-hop', region: 'VN' },
  { id: 'hoang_thuy_linh', name: 'Hoàng Thùy Linh', genres: 'Folktronica, Pop', region: 'VN' },
  { id: 'bts', name: 'BTS', genres: 'K-Pop, Hip-hop', region: 'KR' },
  { id: 'blackpink', name: 'BLACKPINK', genres: 'K-Pop, EDM', region: 'KR' },
  { id: 'taylor_swift', name: 'Taylor Swift', genres: 'Pop, Country', region: 'US' },
  { id: 'the_weeknd', name: 'The Weeknd', genres: 'R&B, Synth-pop', region: 'US' },
  { id: 'justin_bieber', name: 'Justin Bieber', genres: 'Pop, R&B', region: 'US' },
  { id: 'ariana_grande', name: 'Ariana Grande', genres: 'Pop, R&B', region: 'US' },
  { id: 'iu', name: 'IU', genres: 'K-Pop, Ballad', region: 'KR' },
  { id: 'binz', name: 'Binz', genres: 'Rap, Hip-hop', region: 'VN' },
  { id: 'min', name: 'Min', genres: 'V-Pop, Dance', region: 'VN' },
  { id: 'my_tam', name: 'Mỹ Tâm', genres: 'Pop Ballad', region: 'VN' },
];

export const countries = [
  { id: 'VN', name: 'Vietnam' },
  { id: 'KR', name: 'South Korea' },
  { id: 'US', name: 'United States' },
  { id: 'UK', name: 'United Kingdom' },
  { id: 'JP', name: 'Japan' },
  { id: 'CN', name: 'China' },
];

export const miningModels = [
  { id: 'similar_artist', name: 'Model 1: Artist Similarity' }, // Đã sửa tên hiển thị ở đây luôn cho chắc
  { id: 'mood_mix', name: 'Model 2: Mood-Based Mix' },
  { id: 'market_trend', name: 'Model 3: Market Trends' },
];

// --- 2. ALGORITHMS (LOGIC) ---

// (Giữ nguyên logic cũ, chỉ cập nhật comment nếu cần)
export const runMiningAlgorithm = (modelId, artistId, countryId) => {
  console.log(`Running Mining: Model=${modelId}, Artist=${artistId}, Country=${countryId}`);

  let result = {
    type: 'track', 
    query: '',
    explanation: ''
  };

  // --- MODEL 1: Tìm nghệ sĩ tương đồng (Collaborative Filtering mô phỏng) ---
  if (modelId === 'similar_artist') {
    result.type = 'artist';
    
    // Tìm nghệ sĩ gốc
    const seedArtist = artists.find(a => a.id === artistId);
    
    if (seedArtist) {
      // Logic: Tìm nghệ sĩ cùng thể loại (Genres)
      const relatedGenres = seedArtist.genres.split(',').map(g => g.trim());
      // Query search giả lập: "K-Pop" hoặc "V-Pop"
      result.query = `genre:"${relatedGenres[0]}"`; 
      
      // Nếu là VN thì ưu tiên tìm thêm nghệ sĩ VN khác
      if(countryId === 'VN' && seedArtist.region === 'VN') {
         result.query = 'V-Pop';
      }
    } else {
      // Fallback nếu không tìm thấy ID (người dùng nhập tay)
      result.query = 'Pop';
    }
  }

  // --- MODEL 2: Mood Mix (Phân lớp cảm xúc - Classification) ---
  else if (modelId === 'mood_mix') {
    result.type = 'playlist';
    // Logic đơn giản hóa: Dựa vào vùng miền để đoán "Mood"
    if (countryId === 'VN') result.query = 'Vietnamese Chill';
    else if (countryId === 'KR') result.query = 'K-Pop Energy';
    else if (countryId === 'US') result.query = 'US-UK Mood';
    else result.query = 'Global Chill';
  }

  // --- MODEL 3: Market Trend (Phân tích xu hướng - Clustering/Trend Analysis) ---
  else if (modelId === 'market_trend') {
    result.type = 'track'; // Trả về bài hát
    // Logic: Top 50 theo quốc gia
    if (countryId === 'VN') result.query = 'Top 50 Vietnam';
    else if (countryId === 'KR') result.query = 'K-Pop Hot';
    else if (countryId === 'US') result.query = 'Billboard Hot 100';
    else result.query = 'Global Top 50';
  }

  return result;
};