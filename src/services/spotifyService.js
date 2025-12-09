import axios from 'axios';

// --- API KEY CỦA BẠN ---
const CLIENT_ID = '77cf574820a4413491c3cdf662150ad4'; 
const CLIENT_SECRET = 'd67381309892423ab6ae76129fa4d56d'; 

let accessToken = '';
let tokenExpirationTime = 0;

// Hàm lấy Token
const getAccessToken = async () => {
  const now = Date.now();
  if (accessToken && now < tokenExpirationTime) return accessToken;

  const authString = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', // Link chuẩn
      new URLSearchParams({ grant_type: 'client_credentials' }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${authString}`
        }
      }
    );
    accessToken = response.data.access_token;
    tokenExpirationTime = now + (response.data.expires_in * 1000);
    return accessToken;
  } catch (error) {
    console.error("Lỗi Token:", error);
    return null;
  }
};

// 1. Hàm Search Đa Năng
export const smartSearch = async (query, type) => {
  const token = await getAccessToken();
  if (!token) return [];
  try {
    const response = await axios.get('https://api.spotify.com/v1/search', {
      headers: { Authorization: `Bearer ${token}` },
      params: { q: query, type: type, limit: 12, market: 'VN' } // Thêm market VN
    });

    if (type === 'artist') {
      return response.data.artists.items.map(item => ({
        id: item.id,
        title: item.name,
        image: item.images[0]?.url || 'https://placehold.co/400x400/333/fff?text=No+Image',
        followers: item.followers.total,
        genres: item.genres.slice(0, 2).join(', '),
        type: 'artist' 
      }));
    } 
    else if (type === 'playlist') {
      return response.data.playlists.items.map(item => ({
        id: item.id,
        title: item.name,
        subtitle: item.description || `Playlist`,
        image: item.images[0]?.url,
        type: 'playlist'
      }));
    }
    else {
      return response.data.tracks.items.map(item => ({
        id: item.id,
        title: item.name,
        subtitle: item.artists.map(a => a.name).join(', '),
        image: item.album.images[0]?.url,
        type: 'track'
      }));
    }
  } catch (error) {
    console.error("Lỗi smartSearch:", error);
    return [];
  }
};

// 2. Lấy chi tiết Profile Nghệ sĩ (QUAN TRỌNG: Sửa link API)
export const getArtistData = async (artistId) => {
  const token = await getAccessToken();
  if (!token) return null;
  
  try {
    const [tracksRes, albumsRes] = await Promise.all([
      // API Top Tracks: Bắt buộc phải có market=VN
      axios.get(`https://api.spotify.com/v1/artists/${artistId}/top-tracks`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { market: 'VN' } 
      }),
      // API Albums
      axios.get(`https://api.spotify.com/v1/artists/${artistId}/albums`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { include_groups: 'album,single', limit: 10, market: 'VN' }
      })
    ]);

    return {
      topTracks: tracksRes.data.tracks.map(track => ({
        id: track.id,
        title: track.name,
        subtitle: track.album.name,
        image: track.album.images[0]?.url,
        type: 'track'
      })),
      albums: albumsRes.data.items.map(album => ({
        id: album.id,
        title: album.name,
        subtitle: album.release_date.substring(0,4),
        image: album.images[0]?.url,
        type: 'album'
      }))
    };
  } catch (error) {
    console.error("Lỗi getArtistData:", error);
    return null;
  }
};

// Các hàm phụ (Wrapper cho code cũ)
export const searchSpotify = async (query) => await smartSearch(query, 'track');
export const searchArtists = async (query) => await smartSearch(query, 'artist');

export const getNewReleases = async () => {
  const token = await getAccessToken();
  if (!token) return [];
  try {
    const response = await axios.get('https://api.spotify.com/v1/browse/new-releases', {
      headers: { Authorization: `Bearer ${token}` },
      params: { limit: 10, country: 'VN' }
    });
    return response.data.albums.items.map(a => ({
      id: a.id, title: a.name, subtitle: a.artists[0].name, image: a.images[0]?.url, type: 'album'
    }));
  } catch (e) { return []; }
};

export const getFeaturedPlaylists = async () => {
  const token = await getAccessToken();
  if (!token) return [];
  try {
    const response = await axios.get('https://api.spotify.com/v1/browse/featured-playlists', {
      headers: { Authorization: `Bearer ${token}` },
      params: { limit: 8, country: 'VN', locale: 'vi_VN' }
    });
    return response.data.playlists.items.map(p => ({
      id: p.id, title: p.name, subtitle: p.description, image: p.images[0]?.url, type: 'playlist'
    }));
  } catch (e) { return []; }
};

export const getTopTracks = async () => await smartSearch('genre:pop year:2024', 'track');