const fs = require('fs');

const API_KEY = 'AIzaSyCWB9m3YbSK4KTE_Tw8ynqdGh4WNX4Zbmo';

const queries = [
  'latest top hindi bollywood hits official music video',
  'top global english pop hits official music video',
  'latest top bengali hits official music video'
];

async function generatePool() {
  let allItems = [];
  
  for (const q of queries) {
    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${encodeURIComponent(q)}&type=video&key=${API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.items) {
        allItems.push(...data.items);
      }
    } catch (e) {
      console.error('Error fetching', q, e);
    }
  }

  // Shuffle and slice to 50
  allItems = allItems.sort(() => 0.5 - Math.random()).slice(0, 50);

  const poolCode = allItems.map((item, index) => {
    const title = item.snippet.title.replace(/'/g, "\\'").replace(/"/g, '\\"');
    const artist = item.snippet.channelTitle.replace(/'/g, "\\'").replace(/"/g, '\\"');
    const videoId = item.id.videoId;
    return `  { id: 't${index}', title: '${title}', artist: '${artist}', duration: 180, bpm: 120, key: 'G Min', pitch: 260, source: 'youtube', youtubeVideoId: '${videoId}', img: 'https://img.youtube.com/vi/${videoId}/mqdefault.jpg' }`;
  }).join(',\n');

  console.log(`const TRENDING_POOL = [\n${poolCode}\n];`);
}

generatePool();
