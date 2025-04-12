const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Convert ISO 8601 duration to human readable format
function formatDuration(duration) {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  const hours = (match[1] || '0H').slice(0, -1);
  const minutes = (match[2] || '0M').slice(0, -1);
  const seconds = (match[3] || '0S').slice(0, -1);
  
  if (hours !== '0') {
    return `${hours}h ${minutes}m`;
  }
  if (minutes !== '0') {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

// Calculate total duration from video items
function calculateTotalDuration(videos) {
  let totalSeconds = 0;
  
  videos.forEach(video => {
    const duration = video.contentDetails.duration;
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = parseInt((match[1] || '0H').slice(0, -1)) * 3600;
    const minutes = parseInt((match[2] || '0M').slice(0, -1)) * 60;
    const seconds = parseInt((match[3] || '0S').slice(0, -1));
    totalSeconds += hours + minutes + seconds;
  });

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

// Fetch all playlist items using pagination
async function getAllPlaylistItems(playlistId) {
  let items = [];
  let nextPageToken = '';

  do {
    const response = await fetch(
      `${BASE_URL}/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=50&pageToken=${nextPageToken}&key=${API_KEY}`
    );
    const data = await response.json();

    if (!data.items) {
      throw new Error('No videos found in playlist');
    }

    items = [...items, ...data.items];
    nextPageToken = data.nextPageToken;
  } while (nextPageToken);

  return items;
}

// Fetch video details in batches of 50
async function getVideosDetails(videoIds) {
  let allVideos = [];
  
  // Process videos in chunks of 50 (API limit)
  for (let i = 0; i < videoIds.length; i += 50) {
    const chunk = videoIds.slice(i, i + 50);
    const response = await fetch(
      `${BASE_URL}/videos?part=contentDetails,statistics&id=${chunk.join(',')}&key=${API_KEY}`
    );
    const data = await response.json();
    
    if (!data.items) {
      throw new Error('Failed to fetch video details');
    }
    
    allVideos = [...allVideos, ...data.items];
  }
  
  return allVideos;
}

export async function getPlaylistDetails(playlistId) {
  try {
    // Get playlist details
    const playlistResponse = await fetch(
      `${BASE_URL}/playlists?part=snippet,contentDetails&id=${playlistId}&key=${API_KEY}`
    );
    const playlistData = await playlistResponse.json();

    if (!playlistData.items?.length) {
      throw new Error('Playlist not found');
    }

    // Get all playlist items
    const playlistItems = await getAllPlaylistItems(playlistId);

    // Get video IDs
    const videoIds = playlistItems.map(item => item.contentDetails.videoId);

    // Get detailed video information
    const videosData = await getVideosDetails(videoIds);

    // Combine video data with playlist item data
    const videos = videosData.map(video => ({
      ...video,
      snippet: playlistItems.find(item => item.contentDetails.videoId === video.id).snippet
    }));

    return {
      details: playlistData.items[0],
      videos,
      totalDuration: calculateTotalDuration(videos),
      videoCount: videos.length
    };
  } catch (error) {
    console.error('Error fetching playlist:', error);
    throw new Error(error.message || 'Failed to fetch playlist details');
  }
}

export async function getVideoDetails(videoId) {
  try {
    const response = await fetch(
      `${BASE_URL}/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${API_KEY}`
    );
    const data = await response.json();

    if (!data.items?.length) {
      throw new Error('Video not found');
    }

    const video = data.items[0];
    return {
      ...video,
      duration: formatDuration(video.contentDetails.duration)
    };
  } catch (error) {
    console.error('Error fetching video:', error);
    throw new Error(error.message || 'Failed to fetch video details');
  }
}

export function extractVideoId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export function extractPlaylistId(url) {
  const regExp = /[&?]list=([^&]+)/i;
  const match = url.match(regExp);
  return match ? match[1] : null;
}