import { YoutubeTranscript } from 'youtube-transcript';

export async function getVideoTranscript(videoId) {
  try {
    // Use a more reliable method to fetch transcripts
    const transcript = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: 'en',
      country: 'US'
    }).catch(() => null);

    if (!transcript?.length) {
      throw new Error('No transcript available for this video');
    }
    
    // Combine transcript text with timestamps
    return transcript.map(item => ({
      text: item.text,
      start: Math.floor(item.start),
      duration: item.duration
    }));
  } catch (error) {
    console.error('Error fetching transcript:', error);
    throw new Error('Failed to fetch video transcript. Make sure captions are available for this video.');
  }
}

export function formatTranscript(transcript) {
  return transcript.map(item => {
    const minutes = Math.floor(item.start / 60);
    const seconds = item.start % 60;
    const timestamp = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    return `[${timestamp}] ${item.text}`;
  }).join('\n');
}