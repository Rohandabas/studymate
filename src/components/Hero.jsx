// import React from 'react';
// import { Youtube, BookOpen } from 'lucide-react';

// function Hero() {
//   return (
//     <div className="relative overflow-hidden">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
//         <div className="text-center">
//           <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
//             <span className="block">Transform Your Learning</span>
//             <span className="block text-purple-500">with AI-Powered Insights</span>
//           </h1>
//           <p className="mt-3 max-w-md mx-auto text-base text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
//             Compare YouTube playlists, generate smart summaries, and create personalized study plans with the power of AI.
//           </p>
//           <div className="mt-10 flex justify-center space-x-4">
//             <input
//               type="text"
//               placeholder="Enter YouTube playlist URL"
//               className="px-5 py-3 rounded-lg w-96 bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-purple-500"
//             />
//             <button className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors">
//               Analyze
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Hero;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Youtube, BookOpen } from 'lucide-react';

function Hero() {
  const [playlistUrl, setPlaylistUrl] = useState('');
  const navigate = useNavigate();

  const handleAnalyze = (e) => {
    e.preventDefault();
    // Navigate to /compare without passing the URL
    navigate('/compare');
  };

  return (
    <div className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
            <span className="block">Transform Your Learning</span>
            <span className="block text-purple-500">with AI-Powered Insights</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Compare YouTube playlists, generate smart summaries, and create personalized study plans with the power of AI.
          </p>
          <form onSubmit={handleAnalyze} className="mt-10 flex justify-center space-x-4">
            <input
              type="text"
              placeholder="Enter YouTube playlist URL"
              value={playlistUrl}
              onChange={(e) => setPlaylistUrl(e.target.value)}
              className="px-5 py-3 rounded-lg w-96 bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Analyze
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Hero;