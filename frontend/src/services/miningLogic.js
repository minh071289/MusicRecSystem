import Papa from 'papaparse';
import { dot, norm } from 'mathjs';

export let fpGrowthData = {};
export let cfFilteredData = {};
export let userProfiles = [];

export let fpArtistList = [];
export let cfArtistList = [];
export let userList = [];

let isDataLoaded = false;

const findKey = (row, partialName) => {
  return Object.keys(row).find(key => 
    key.trim().toLowerCase().includes(partialName.toLowerCase())
  );
};

export const loadAllData = async () => {
  if (isDataLoaded) return;

  const loadCSV = (path) => {
    return new Promise((resolve, reject) => {
      Papa.parse(path, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: (results) => resolve(results.data),
        error: (err) => reject(err)
      });
    });
  };

  try {
    const [fpData, cfData, userData] = await Promise.all([
      loadCSV('/data/artist_recommendations_fp_growth.csv'),
      loadCSV('/data/artist_recommendations_cf_filtered.csv'),
      loadCSV('/data/similar_users_analysis.csv')
    ]);

    const tempFpArtists = new Set();
    fpData.forEach(row => {
      const nameKey = findKey(row, 'artist');
      const recsKey = findKey(row, 'recommendations');
      
      if (nameKey && recsKey && row[nameKey] && row[recsKey]) {
        fpGrowthData[row[nameKey].toLowerCase().trim()] = row[recsKey].split('|').map(r => r.trim());
        tempFpArtists.add(row[nameKey].trim());
      }
    });
    
    fpArtistList = Array.from(tempFpArtists).map(name => ({
      id: name.toLowerCase(),
      name: name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    })).sort((a, b) => a.name.localeCompare(b.name));

    const tempCfArtists = new Set();
    cfData.forEach(row => {
      const nameKey = findKey(row, 'artist');
      const recsKey = findKey(row, 'recommendations');
      
      if (nameKey && recsKey && row[nameKey] && row[recsKey]) {
        cfFilteredData[row[nameKey].toLowerCase().trim()] = row[recsKey].split('|').map(r => r.trim());
        tempCfArtists.add(row[nameKey].trim());
      }
    });

    cfArtistList = Array.from(tempCfArtists).map(name => ({
      id: name.toLowerCase(),
      name: name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    })).sort((a, b) => a.name.localeCompare(b.name));

    userProfiles = userData.map(row => {
      const idKey = findKey(row, 'target_user_id');
      const userId = idKey ? row[idKey].toString().trim() : null;

      if (!userId) return null;

      const features = Object.keys(row)
        .filter(k => k !== idKey)
        .map(k => parseFloat(row[k]) || 0);

      let otherSum = 0;
      const allCountries = [];
      Object.keys(row).forEach(key => {
        if (key.includes('country_')) {
          const val = parseFloat(row[key]);
          const cName = key.split('country_')[1];
          if (cName === 'Others') otherSum += val;
          else allCountries.push({ name: cName, value: val * 100 });
        }
      });

      allCountries.sort((a, b) => b.value - a.value);
      const topCountries = allCountries.slice(0, 4);
      const remaining = allCountries.slice(4).reduce((sum, item) => sum + item.value, 0);
      
      const chartCountries = [...topCountries];
      if (otherSum * 100 + remaining > 0.1) {
        chartCountries.push({ name: 'Others', value: otherSum * 100 + remaining });
      }

      const dominantCountry = topCountries.length > 0 ? topCountries[0].name : 'Global';

      const sexMKey = findKey(row, 'sex_m');
      const sexFKey = findKey(row, 'sex_f');

      return { 
        id: userId, 
        vector: features, 
        dominantCountry,
        stats: {
          sex: [
            { name: 'Male', value: (parseFloat(row[sexMKey]) || 0) * 100 },
            { name: 'Female', value: (parseFloat(row[sexFKey]) || 0) * 100 }
          ],
          countries: chartCountries
        }
      };
    }).filter(u => u !== null);
    
    userList = userProfiles.map(u => u.id);

    isDataLoaded = true;
    console.log(`Loaded: FP(${fpArtistList.length}), CF(${cfArtistList.length}), Users(${userList.length})`);
    
  } catch (error) {
    console.error("Data Load Error:", error);
  }
};

const calculateCosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB) return 0;
  return dot(vecA, vecB) / (norm(vecA) * norm(vecB));
};

export const artistModels = [
  { id: 'fp_growth', name: 'Association Rules', desc: '' },
  { id: 'cf_filtered', name: 'Collaborative Filtering', desc: '' },
];

export const runMiningAlgorithm = (mode, modelId, inputData) => {
  let result = { type: 'track', query: '', data: [], explanation: '', stats: null };
  const safeInput = inputData.toString().toLowerCase().trim();

  if (mode === 'artist') {
    const db = modelId === 'fp_growth' ? fpGrowthData : cfFilteredData;
    const recs = db[safeInput];
    
    result.type = 'artist_list';
    if (recs) {
      result.data = recs;
      result.explanation = `Based on <strong>${modelId === 'fp_growth' ? 'Association Rules' : 'Collaborative Filtering'}</strong>, data suggests listeners of "${inputData}" also enjoy:`;
    } else {
      result.query = `artist:${inputData}`;
      result.type = 'artist';
      result.explanation = "Data not found in the selected model. Searching Spotify directly.";
    }
  }

  else if (mode === 'user') {
    const targetUser = userProfiles.find(u => u.id === inputData.toString().trim());
    
    if (targetUser) {
      const similarities = userProfiles
        .filter(u => u.id !== targetUser.id)
        .map(u => ({ ...u, score: calculateCosineSimilarity(targetUser.vector, u.vector) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 1);

      const match = similarities[0];
      
      result.type = 'playlist';
      result.query = `Top 50 ${match.dominantCountry}`;
      result.stats = targetUser.stats;
      
      result.explanation = `
        Your profile matches <strong>${(match.score * 100).toFixed(1)}%</strong> with User #${match.id}.<br/>
        Based on demographic analysis (charts below), recommended region: <strong>${match.dominantCountry}</strong>.
      `;
    } else {
      result.query = 'Global Top 50';
      result.explanation = `User ID "${inputData}" not found in database.`;
    }
  }

  return result;
};