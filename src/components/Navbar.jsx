// import React from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import { Brain } from 'lucide-react';

// function Navbar() {
//   const location = useLocation();

//   const isActive = (path) => {
//     return location.pathname === path ? 'text-purple-500' : 'text-gray-300 hover:text-white';
//   };

//   return (
//     <nav className="bg-gray-900 border-b border-gray-800">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex items-center justify-between h-16">
//           <Link to="/" className="flex items-center">
//             <Brain className="h-8 w-8 text-purple-500" />
//             <span className="ml-2 text-xl font-bold text-white">AI StudyMate</span>
//           </Link>
//           <div className="flex space-x-4">
//             <Link to="/compare" className={`px-3 py-2 ${isActive('/compare')}`}>
//               Compare
//             </Link>
//             <Link to="/summary" className={`px-3 py-2 ${isActive('/summary')}`}>
//               Summarize
//             </Link>
//             <Link to="/study-plan" className={`px-3 py-2 ${isActive('/study-plan')}`}>
//               Study Plan
//             </Link>
//             <Link to="/dashboard" className={`px-3 py-2 ${isActive('/dashboard')}`}>
//               Dashboard
//             </Link>
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// }

// export default Navbar;

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Brain, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const isActive = (path) => {
    return location.pathname === path ? 'text-purple-500' : 'text-gray-300 hover:text-white';
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <Brain className="h-8 w-8 text-purple-500" />
            <span className="ml-2 text-xl font-bold text-white">AI StudyMate</span>
          </Link>
          <div className="flex space-x-4">
            <Link to="/compare" className={`px-3 py-2 ${isActive('/compare')}`}>Compare</Link>
            <Link to="/summary" className={`px-3 py-2 ${isActive('/summary')}`}>Summarize</Link>
            <Link to="/study-plan" className={`px-3 py-2 ${isActive('/study-plan')}`}>Study Plan</Link>
            <Link to="/dashboard" className={`px-3 py-2 ${isActive('/dashboard')}`}>Dashboard</Link>
            {user ? (
              <button
                onClick={handleLogout}
                className="px-3 py-2 text-gray-300 hover:text-white flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            ) : (
              <Link to="/login" className="px-3 py-2 text-gray-300 hover:text-white">Sign In</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;