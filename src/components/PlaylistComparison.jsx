// import React, { useState } from 'react';
// import { Search, BookOpen, CheckCircle, AlertCircle, Star, Users, BarChart, Clock } from 'lucide-react';
// import { getPlaylistDetails, extractPlaylistId } from '../lib/youtube';

// function PlaylistComparison() {
//   const [playlists, setPlaylists] = useState([]);
//   const [url, setUrl] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const handleAddPlaylist = async (e) => {
//     e.preventDefault();
//     if (!url) return;

//     setLoading(true);
//     setError(null);

//     try {
//       const playlistId = extractPlaylistId(url);
//       if (!playlistId) {
//         throw new Error('Invalid YouTube playlist URL');
//       }

//       const playlistData = await getPlaylistDetails(playlistId);
      
//       // Calculate average video length
//       const avgDuration = Math.floor(
//         playlistData.videos.reduce((acc, video) => {
//           const duration = video.contentDetails.duration;
//           const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
//           const hours = parseInt((match[1] || '0H').slice(0, -1)) * 3600;
//           const minutes = parseInt((match[2] || '0M').slice(0, -1)) * 60;
//           const seconds = parseInt((match[3] || '0S').slice(0, -1));
//           return acc + hours + minutes + seconds;
//         }, 0) / playlistData.videos.length
//       );

//       // Estimate difficulty based on video titles and descriptions
//       const difficultyKeywords = {
//         beginner: ['basic', 'beginner', 'introduction', 'fundamental', 'start'],
//         intermediate: ['intermediate', 'advanced', 'deep dive', 'in-depth'],
//         advanced: ['expert', 'advanced', 'complex', 'architecture', 'optimization']
//       };

//       let difficultyScore = 0;
//       const content = (
//         playlistData.details.snippet.title +
//         ' ' +
//         playlistData.details.snippet.description
//       ).toLowerCase();

//       difficultyKeywords.beginner.forEach(word => {
//         if (content.includes(word)) difficultyScore += 1;
//       });
//       difficultyKeywords.intermediate.forEach(word => {
//         if (content.includes(word)) difficultyScore += 2;
//       });
//       difficultyKeywords.advanced.forEach(word => {
//         if (content.includes(word)) difficultyScore += 3;
//       });

//       const getDifficultyLevel = (score) => {
//         if (score <= 2) return 'Beginner';
//         if (score <= 5) return 'Intermediate';
//         return 'Advanced';
//       };

//       // Calculate engagement score
//       const totalViews = playlistData.videos.reduce((acc, video) => 
//         acc + parseInt(video.statistics.viewCount || 0), 0
//       );
//       const totalLikes = playlistData.videos.reduce((acc, video) => 
//         acc + parseInt(video.statistics.likeCount || 0), 0
//       );
//       const engagementScore = ((totalLikes / totalViews) * 100).toFixed(2);

//       setPlaylists([...playlists, {
//         id: playlistId,
//         title: playlistData.details.snippet.title,
//         description: playlistData.details.snippet.description,
//         videoCount: playlistData.videoCount,
//         totalDuration: playlistData.totalDuration,
//         averageVideoLength: `${Math.floor(avgDuration / 60)}m ${avgDuration % 60}s`,
//         level: getDifficultyLevel(difficultyScore),
//         engagement: engagementScore,
//         views: totalViews,
//         thumbnail: playlistData.details.snippet.thumbnails.high.url
//       }]);

//       setUrl('');
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//       <div className="text-center mb-12">
//         <h1 className="text-3xl font-bold text-white mb-4">Compare YouTube Playlists</h1>
//         <p className="text-gray-400">Add multiple playlists to compare content, difficulty, and learning outcomes</p>
//       </div>

//       <form onSubmit={handleAddPlaylist} className="mb-8">
//         <div className="flex gap-4">
//           <input
//             type="text"
//             value={url}
//             onChange={(e) => setUrl(e.target.value)}
//             placeholder="Enter YouTube playlist URL"
//             className="flex-1 px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-purple-500"
//           />
//           <button
//             type="submit"
//             className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
//             disabled={loading || !url}
//           >
//             {loading ? 'Analyzing...' : 'Add Playlist'}
//           </button>
//         </div>
//       </form>

//       {error && (
//         <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-8 flex items-center gap-3">
//           <AlertCircle className="text-red-500" />
//           <p className="text-red-100">{error}</p>
//         </div>
//       )}

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {playlists.map((playlist, index) => (
//           <div key={index} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
//             <div className="aspect-video">
//               <img 
//                 src={playlist.thumbnail} 
//                 alt={playlist.title}
//                 className="w-full h-full object-cover"
//               />
//             </div>
//             <div className="p-6">
//               <h3 className="text-xl font-semibold text-white mb-4">{playlist.title}</h3>
//               <div className="space-y-3 text-gray-300">
//                 <p className="flex items-center gap-2">
//                   <BookOpen className="w-5 h-5" />
//                   {playlist.videoCount} videos • {playlist.totalDuration}
//                 </p>
//                 <p className="flex items-center gap-2">
//                   <Clock className="w-5 h-5" />
//                   Avg. video length: {playlist.averageVideoLength}
//                 </p>
//                 <p className="flex items-center gap-2">
//                   <BarChart className="w-5 h-5" />
//                   Level: {playlist.level}
//                 </p>
//                 <p className="flex items-center gap-2">
//                   <Users className="w-5 h-5" />
//                   {new Intl.NumberFormat().format(playlist.views)} views
//                 </p>
//                 <p className="flex items-center gap-2">
//                   <Star className="w-5 h-5" />
//                   {playlist.engagement}% engagement
//                 </p>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {playlists.length > 1 && (
//         <div className="mt-8 bg-gray-800 rounded-lg p-6">
//           <h3 className="text-xl font-semibold text-white mb-4">Comparison Summary</h3>
//           <div className="overflow-x-auto">
//             <table className="w-full text-left text-gray-300">
//               <thead>
//                 <tr className="border-b border-gray-700">
//                   <th className="py-3 px-4">Playlist</th>
//                   <th className="py-3 px-4">Videos</th>
//                   <th className="py-3 px-4">Duration</th>
//                   <th className="py-3 px-4">Level</th>
//                   <th className="py-3 px-4">Engagement</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {playlists.map((playlist, index) => (
//                   <tr key={index} className="border-b border-gray-700">
//                     <td className="py-3 px-4">{playlist.title}</td>
//                     <td className="py-3 px-4">{playlist.videoCount}</td>
//                     <td className="py-3 px-4">{playlist.totalDuration}</td>
//                     <td className="py-3 px-4">{playlist.level}</td>
//                     <td className="py-3 px-4">{playlist.engagement}%</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default PlaylistComparison;


//full correct code


// import React, { useState } from 'react';
// import { Search, BookOpen, CheckCircle, AlertCircle, Star, Users, BarChart, Clock } from 'lucide-react';
// import { getPlaylistDetails, extractPlaylistId } from '../lib/youtube';

// function PlaylistComparison() {
//   const [playlists, setPlaylists] = useState([]);
//   const [url, setUrl] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const handleAddPlaylist = async (e) => {
//     e.preventDefault();
//     if (!url) return;

//     setLoading(true);
//     setError(null);

//     try {
//       const playlistId = extractPlaylistId(url);
//       console.log('Extracted playlistId:', playlistId); // Debug log
//       if (!playlistId) {
//         throw new Error('Invalid YouTube playlist URL');
//       }

//       const playlistData = await getPlaylistDetails(playlistId);
//       console.log('Playlist data:', playlistData); // Debug log
      
//       // Calculate average video length
//       const avgDuration = Math.floor(
//         playlistData.videos.reduce((acc, video) => {
//           const duration = video.contentDetails.duration;
//           const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
//           const hours = parseInt((match[1] || '0H').slice(0, -1)) * 3600;
//           const minutes = parseInt((match[2] || '0M').slice(0, -1)) * 60;
//           const seconds = parseInt((match[3] || '0S').slice(0, -1));
//           return acc + hours + minutes + seconds;
//         }, 0) / playlistData.videos.length
//       );

//       // Estimate difficulty based on video titles and descriptions
//       const difficultyKeywords = {
//         beginner: ['basic', 'beginner', 'introduction', 'fundamental', 'start'],
//         intermediate: ['intermediate', 'advanced', 'deep dive', 'in-depth'],
//         advanced: ['expert', 'advanced', 'complex', 'architecture', 'optimization']
//       };

//       let difficultyScore = 0;
//       const content = (
//         playlistData.details.snippet.title +
//         ' ' +
//         playlistData.details.snippet.description
//       ).toLowerCase();

//       difficultyKeywords.beginner.forEach(word => {
//         if (content.includes(word)) difficultyScore += 1;
//       });
//       difficultyKeywords.intermediate.forEach(word => {
//         if (content.includes(word)) difficultyScore += 2;
//       });
//       difficultyKeywords.advanced.forEach(word => {
//         if (content.includes(word)) difficultyScore += 3;
//       });

//       const getDifficultyLevel = (score) => {
//         if (score <= 2) return 'Beginner';
//         if (score <= 5) return 'Intermediate';
//         return 'Advanced';
//       };

//       // Calculate engagement score
//       const totalViews = playlistData.videos.reduce((acc, video) => 
//         acc + parseInt(video.statistics.viewCount || 0), 0
//       );
//       const totalLikes = playlistData.videos.reduce((acc, video) => 
//         acc + parseInt(video.statistics.likeCount || 0), 0
//       );
//       const engagementScore = ((totalLikes / totalViews) * 100).toFixed(2);

//       setPlaylists([...playlists, {
//         id: playlistId,
//         title: playlistData.details.snippet.title,
//         description: playlistData.details.snippet.description,
//         videoCount: playlistData.videoCount,
//         totalDuration: playlistData.totalDuration,
//         averageVideoLength: `${Math.floor(avgDuration / 60)}m ${avgDuration % 60}s`,
//         level: getDifficultyLevel(difficultyScore),
//         engagement: engagementScore,
//         views: totalViews,
//         thumbnail: playlistData.details.snippet.thumbnails.high.url
//       }]);

//       setUrl('');
//     } catch (err) {
//       console.error('Error in handleAddPlaylist:', err); // Debug log
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//       <div className="text-center mb-12">
//         <h1 className="text-3xl font-bold text-white mb-4">Compare YouTube Playlists</h1>
//         <p className="text-gray-400">Add multiple playlists to compare content, difficulty, and learning outcomes</p>
//       </div>

//       <form onSubmit={handleAddPlaylist} className="mb-8">
//         <div className="flex gap-4">
//           <input
//             type="text"
//             value={url}
//             onChange={(e) => setUrl(e.target.value)}
//             placeholder="Enter YouTube playlist URL"
//             className="flex-1 px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-purple-500"
//           />
//           <button
//             type="submit"
//             className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
//             disabled={loading || !url}
//           >
//             {loading ? 'Analyzing...' : 'Add Playlist'}
//           </button>
//         </div>
//       </form>

//       {error && (
//         <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-8 flex items-center gap-3">
//           <AlertCircle className="text-red-500" />
//           <p className="text-red-100">{error}</p>
//         </div>
//       )}

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {playlists.map((playlist, index) => (
//           <div key={index} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
//             <div className="aspect-video">
//               <img 
//                 src={playlist.thumbnail} 
//                 alt={playlist.title}
//                 className="w-full h-full object-cover"
//               />
//             </div>
//             <div className="p-6">
//               <h3 className="text-xl font-semibold text-white mb-4">{playlist.title}</h3>
//               <div className="space-y-3 text-gray-300">
//                 <p className="flex items-center gap-2">
//                   <BookOpen className="w-5 h-5" />
//                   {playlist.videoCount} videos • {playlist.totalDuration}
//                 </p>
//                 <p className="flex items-center gap-2">
//                   <Clock className="w-5 h-5" />
//                   Avg. video length: {playlist.averageVideoLength}
//                 </p>
//                 <p className="flex items-center gap-2">
//                   <BarChart className="w-5 h-5" />
//                   Level: {playlist.level}
//                 </p>
//                 <p className="flex items-center gap-2">
//                   <Users className="w-5 h-5" />
//                   {new Intl.NumberFormat().format(playlist.views)} views
//                 </p>
//                 <p className="flex items-center gap-2">
//                   <Star className="w-5 h-5" />
//                   {playlist.engagement}% engagement
//                 </p>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {playlists.length > 1 && (
//         <div className="mt-8 bg-gray-800 rounded-lg p-6">
//           <h3 className="text-xl font-semibold text-white mb-4">Comparison Summary</h3>
//           <div className="overflow-x-auto">
//             <table className="w-full text-left text-gray-300">
//               <thead>
//                 <tr className="border-b border-gray-700">
//                   <th className="py-3 px-4">Playlist</th>
//                   <th className="py-3 px-4">Videos</th>
//                   <th className="py-3 px-4">Duration</th>
//                   <th className="py-3 px-4">Level</th>
//                   <th className="py-3 px-4">Engagement</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {playlists.map((playlist, index) => (
//                   <tr key={index} className="border-b border-gray-700">
//                     <td className="py-3 px-4">{playlist.title}</td>
//                     <td className="py-3 px-4">{playlist.videoCount}</td>
//                     <td className="py-3 px-4">{playlist.totalDuration}</td>
//                     <td className="py-3 px-4">{playlist.level}</td>
//                     <td className="py-3 px-4">{playlist.engagement}%</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default PlaylistComparison;


import React, { useState } from 'react';
import { Search, BookOpen, CheckCircle, AlertCircle, Star, Users, BarChart, Clock } from 'lucide-react';
import { getPlaylistDetails, extractPlaylistId } from '../lib/youtube';

function PlaylistComparison({ playlists, setPlaylists }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAddPlaylist = async (e) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError(null);

    try {
      const playlistId = extractPlaylistId(url);
      console.log('Extracted playlistId:', playlistId); // Debug log
      if (!playlistId) {
        throw new Error('Invalid YouTube playlist URL');
      }

      const playlistData = await getPlaylistDetails(playlistId);
      console.log('Playlist data:', playlistData); // Debug log
      
      // Calculate average video length
      const avgDuration = Math.floor(
        playlistData.videos.reduce((acc, video) => {
          const duration = video.contentDetails.duration;
          const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
          const hours = parseInt((match[1] || '0H').slice(0, -1)) * 3600;
          const minutes = parseInt((match[2] || '0M').slice(0, -1)) * 60;
          const seconds = parseInt((match[3] || '0S').slice(0, -1));
          return acc + hours + minutes + seconds;
        }, 0) / playlistData.videos.length
      );

      // Estimate difficulty based on video titles and descriptions
      const difficultyKeywords = {
        beginner: ['basic', 'beginner', 'introduction', 'fundamental', 'start'],
        intermediate: ['intermediate', 'advanced', 'deep dive', 'in-depth'],
        advanced: ['expert', 'advanced', 'complex', 'architecture', 'optimization']
      };

      let difficultyScore = 0;
      const content = (
        playlistData.details.snippet.title +
        ' ' +
        playlistData.details.snippet.description
      ).toLowerCase();

      difficultyKeywords.beginner.forEach(word => {
        if (content.includes(word)) difficultyScore += 1;
      });
      difficultyKeywords.intermediate.forEach(word => {
        if (content.includes(word)) difficultyScore += 2;
      });
      difficultyKeywords.advanced.forEach(word => {
        if (content.includes(word)) difficultyScore += 3;
      });

      const getDifficultyLevel = (score) => {
        if (score <= 2) return 'Beginner';
        if (score <= 5) return 'Intermediate';
        return 'Advanced';
      };

      // Calculate engagement score
      const totalViews = playlistData.videos.reduce((acc, video) => 
        acc + parseInt(video.statistics.viewCount || 0), 0
      );
      const totalLikes = playlistData.videos.reduce((acc, video) => 
        acc + parseInt(video.statistics.likeCount || 0), 0
      );
      const engagementScore = ((totalLikes / totalViews) * 100).toFixed(2);

      setPlaylists([...playlists, {
        id: playlistId,
        title: playlistData.details.snippet.title,
        description: playlistData.details.snippet.description,
        videoCount: playlistData.videoCount,
        totalDuration: playlistData.totalDuration,
        averageVideoLength: `${Math.floor(avgDuration / 60)}m ${avgDuration % 60}s`,
        level: getDifficultyLevel(difficultyScore),
        engagement: engagementScore,
        views: totalViews,
        thumbnail: playlistData.details.snippet.thumbnails.high.url
      }]);

      setUrl('');
    } catch (err) {
      console.error('Error in handleAddPlaylist:', err); // Debug log
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-white mb-4">Compare YouTube Playlists</h1>
        <p className="text-gray-400">Add multiple playlists to compare content, difficulty, and learning outcomes</p>
      </div>

      <form onSubmit={handleAddPlaylist} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter YouTube playlist URL"
            className="flex-1 px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            disabled={loading || !url}
          >
            {loading ? 'Analyzing...' : 'Add Playlist'}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-8 flex items-center gap-3">
          <AlertCircle className="text-red-500" />
          <p className="text-red-100">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {playlists.map((playlist, index) => (
          <div key={index} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
            <div className="aspect-video">
              <img 
                src={playlist.thumbnail} 
                alt={playlist.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">{playlist.title}</h3>
              <div className="space-y-3 text-gray-300">
                <p className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  {playlist.videoCount} videos • {playlist.totalDuration}
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Avg. video length: {playlist.averageVideoLength}
                </p>
                <p className="flex items-center gap-2">
                  <BarChart className="w-5 h-5" />
                  Level: {playlist.level}
                </p>
                <p className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {new Intl.NumberFormat().format(playlist.views)} views
                </p>
                <p className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  {playlist.engagement}% engagement
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {playlists.length > 1 && (
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Comparison Summary</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-gray-300">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="py-3 px-4">Playlist</th>
                  <th className="py-3 px-4">Videos</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Level</th>
                  <th className="py-3 px-4">Engagement</th>
                </tr>
              </thead>
              <tbody>
                {playlists.map((playlist, index) => (
                  <tr key={index} className="border-b border-gray-700">
                    <td className="py-3 px-4">{playlist.title}</td>
                    <td className="py-3 px-4">{playlist.videoCount}</td>
                    <td className="py-3 px-4">{playlist.totalDuration}</td>
                    <td className="py-3 px-4">{playlist.level}</td>
                    <td className="py-3 px-4">{playlist.engagement}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlaylistComparison;