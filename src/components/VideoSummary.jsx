import React, { useState } from 'react';
import { BookOpen, Clock, Brain, AlertCircle, Loader2 } from 'lucide-react';
import { getVideoDetails, extractVideoId } from '../lib/youtube';
import { getVideoTranscript, formatTranscript } from '../lib/transcript';
import { generateVideoSummary, generateVideoInsights } from '../lib/gemini';
import ReactMarkdown from 'react-markdown';

function VideoSummary() {
  const [videoUrl, setVideoUrl] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [usedTranscript, setUsedTranscript] = useState(true);

  const handleGenerateSummary = async (e) => {
    e.preventDefault();
    if (!videoUrl) return;

    setLoading(true);
    setError(null);

    try {
      const videoId = extractVideoId(videoUrl);
      if (!videoId) {
        throw new Error('Invalid YouTube URL');
      }

      // Get video details
      const videoDetails = await getVideoDetails(videoId);
      let summaryText;

      try {
        // Try to get transcript first
        const transcript = await getVideoTranscript(videoId);
        const formattedTranscript = formatTranscript(transcript);
        summaryText = await generateVideoSummary(formattedTranscript);
        setUsedTranscript(true);
      } catch (transcriptError) {
        // If transcript not available, use video metadata
        console.log('Transcript not available, using video metadata');
        summaryText = await generateVideoInsights({
          title: videoDetails.snippet.title,
          description: videoDetails.snippet.description,
          tags: videoDetails.snippet.tags || [],
          duration: videoDetails.duration
        });
        setUsedTranscript(false);
      }

      // Extract key points (lines starting with -)
      const keyPoints = summaryText
        .split('\n')
        .filter(line => line.trim().startsWith('-'))
        .map(point => point.substring(1).trim());

      setSummary({
        title: videoDetails.snippet.title,
        duration: videoDetails.duration,
        description: videoDetails.snippet.description,
        thumbnail: videoDetails.snippet.thumbnails.high.url,
        summaryText,
        keyPoints
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-white mb-4">AI Video Summary</h1>
        <p className="text-gray-400">Get instant insights from any educational video</p>
      </div>

      <form onSubmit={handleGenerateSummary} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Enter YouTube video URL"
            className="flex-1 px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            disabled={loading || !videoUrl}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Summary'
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-8 flex items-center gap-3">
          <AlertCircle className="text-red-500 shrink-0" />
          <p className="text-red-100">{error}</p>
        </div>
      )}

      {loading && (
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-700 rounded w-2/3"></div>
        </div>
      )}

      {summary && (
        <div className="space-y-8">
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="aspect-video">
              <img 
                src={summary.thumbnail}
                alt={summary.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-4">{summary.title}</h2>
              <div className="flex items-center gap-6 text-gray-300 mb-6">
                <span className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  {summary.duration}
                </span>
                <span className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  {summary.keyPoints.length} Key Points
                </span>
                {!usedTranscript && (
                  <span className="text-yellow-500 text-sm">
                    * Summary generated from video metadata (transcript unavailable)
                  </span>
                )}
              </div>
              
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown>{summary.summaryText}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoSummary;