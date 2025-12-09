// src/data/mockData.js

// 1. Dữ liệu cho Trang Chủ
export const homePlaylists = [
  { id: 101, title: 'Top Hits Việt Nam', description: 'Sơn Tùng M-TP, Mono, tlinh...', image: 'https://placehold.co/400x400/1e40af/ffffff?text=VN+Hits' },
  { id: 102, title: 'Chill Coffee', description: 'Nhẹ nhàng thư giãn buổi sáng', image: 'https://placehold.co/400x400/3f3cbb/ffffff?text=Chill' },
  { id: 103, title: 'Rap Việt Mùa 3', description: 'Những bản Rap hot nhất', image: 'https://placehold.co/400x400/b91c1c/ffffff?text=Rap' },
  { id: 104, title: 'K-Pop On Air', description: 'BTS, BlackPink, NewJeans', image: 'https://placehold.co/400x400/be185d/ffffff?text=K-Pop' },
];

// 2. Dữ liệu Dropdown
export const artists = [
  { id: '1', name: 'Sơn Tùng M-TP' },
  { id: '2', name: 'Taylor Swift' },
  { id: '3', name: 'BTS' },
  { id: '4', name: 'Đen Vâu' },
  { id: '5', name: 'Imagine Dragons' },
];

export const countries = [
  { id: 'VN', name: 'Việt Nam' },
  { id: 'US', name: 'Mỹ - Anh' },
  { id: 'KR', name: 'Hàn Quốc' },
];

// 3. Kho nhạc đề xuất (Có link MP3 thật để test)
const recommendationPool = [
  {
    id: 1, type: 'song', title: 'Muộn Rồi Mà Sao Còn', subtitle: 'Sơn Tùng M-TP',
    image: 'https://placehold.co/300x300/181818/ffffff?text=M-TP',
    mp3Url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' 
  },
  {
    id: 2, type: 'song', title: 'Cruel Summer', subtitle: 'Taylor Swift',
    image: 'https://placehold.co/300x300/5b21b6/ffffff?text=Taylor',
    mp3Url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'
  },
  {
    id: 3, type: 'artist', title: 'MONO', subtitle: 'Nghệ sĩ',
    image: 'https://placehold.co/300x300/181818/ffffff?text=MONO',
    rounded: true
  },
  {
    id: 4, type: 'song', title: 'Nấu ăn cho em', subtitle: 'Đen Vâu ft. PiaLinh',
    image: 'https://placehold.co/300x300/065f46/ffffff?text=Den+Vau',
    mp3Url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
  },
  {
    id: 5, type: 'song', title: 'Dynamite', subtitle: 'BTS',
    image: 'https://placehold.co/300x300/9d174d/ffffff?text=BTS',
    mp3Url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
  },
  {
    id: 6, type: 'artist', title: 'Hoàng Thùy Linh', subtitle: 'Nghệ sĩ',
    image: 'https://placehold.co/300x300/831843/ffffff?text=HTL',
    rounded: true
  },
  {
    id: 7, type: 'song', title: 'Believer', subtitle: 'Imagine Dragons',
    image: 'https://placehold.co/300x300/7f1d1d/ffffff?text=Dragons',
    mp3Url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3'
  },
  {
    id: 8, type: 'song', title: 'See Tình', subtitle: 'Hoàng Thùy Linh',
    image: 'https://placehold.co/300x300/db2777/ffffff?text=See+Tinh',
    mp3Url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3'
  },
];

// Hàm giả lập API lấy dữ liệu
export const getRecommendations = async (selectedArtistId, selectedCountryId) => {
  // Giả vờ đợi 0.5s cho giống mạng thật
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Trộn ngẫu nhiên và lấy 5 phần tử
  const shuffled = [...recommendationPool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 5);
};