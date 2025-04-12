// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Navbar from './components/Navbar.jsx';
// import Hero from './components/Hero.jsx';
// import Features from './components/Features.jsx';
// import PlaylistComparison from './components/PlaylistComparison.jsx';
// import VideoSummary from './components/VideoSummary.jsx';
// import StudyPlan from './components/StudyPlan.jsx';
// import Dashboard from './components/Dashboard.jsx';

// function App() {
//   return (
//     <Router>
//       <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
//         <Navbar />
//         <Routes>
//           <Route path="/" element={
//             <>
//               <Hero />
//               <Features />
//             </>
//           } />
//           <Route path="/compare" element={<PlaylistComparison />} />
//           <Route path="/summary" element={<VideoSummary />} />
//           <Route path="/study-plan" element={<StudyPlan />} />
//           <Route path="/dashboard" element={<Dashboard />} />
//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;


// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Navbar from './components/Navbar.jsx';
// import Hero from './components/Hero.jsx';
// import Features from './components/Features.jsx';
// import PlaylistComparison from './components/PlaylistComparison.jsx';
// import VideoSummary from './components/VideoSummary.jsx';
// import StudyPlan from './components/StudyPlan.jsx';
// import Dashboard from './components/Dashboard.jsx';
// import Login from './components/Login.jsx'; // Ensure this import is present

// function App() {
//   return (
//     <Router>
//       <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
//         <Navbar />
//         <Routes>
//           <Route path="/" element={
//             <>
//               <Hero />
//               <Features />
//             </>
//           } />
//           <Route path="/compare" element={<PlaylistComparison />} />
//           <Route path="/summary" element={<VideoSummary />} />
//           <Route path="/study-plan" element={<StudyPlan />} />
//           <Route path="/dashboard" element={<Dashboard />} />
//           <Route path="/login" element={<Login />} /> {/* Add this route */}
//           <Route path="*" element={<div className="text-white text-center mt-10">404 - Page Not Found</div>} />
//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;





// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
// import Login from './components/Login';
// import StudyPlan from './components/StudyPlan';
// import Dashboard from './components/Dashboard';
// import { supabase } from './lib/supabase';

// function App() {
//   // Custom hook to check authentication status
//   const useAuth = () => {
//     const [user, setUser] = React.useState(null);

//     React.useEffect(() => {
//       const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
//         console.log('Auth state changed in App:', { event, session });
//         setUser(session?.user ?? null);
//       });

//       // Set initial user state
//       supabase.auth.getUser().then(({ data: { user }, error }) => {
//         if (error) console.error('Error getting initial user:', error);
//         else setUser(user);
//       });

//       return () => authListener.subscription.unsubscribe();
//     }, []);

//     return user;
//   };

//   const user = useAuth();

//   // Protected Route Component
//   const ProtectedRoute = ({ children }) => {
//     if (!user) {
//       // Redirect to login if not authenticated
//       return <Navigate to="/login" replace />;
//     }
//     return children;
//   };

//   // Layout Component with Navigation
//   const AppLayout = ({ children }) => {
//     return (
//       <div className="min-h-screen bg-gray-900 text-white">
//         <header className="bg-gray-800 p-4 shadow-md">
//           <div className="max-w-7xl mx-auto flex justify-between items-center">
//             <h1 className="text-2xl font-bold">AI StudyMate</h1>
//             <nav>
//               {user ? (
//                 <div className="space-x-4">
//                   <Link to="/dashboard" className="hover:text-purple-400">Dashboard</Link>
//                   <Link to="/study-plan" className="hover:text-purple-400">Study Plan</Link>
//                   <button
//                     onClick={async () => await supabase.auth.signOut()}
//                     className="text-red-400 hover:text-red-600"
//                   >
//                     Logout
//                   </button>
//                 </div>
//               ) : (
//                 <Link to="/login" className="hover:text-purple-400">Login</Link>
//               )}
//             </nav>
//           </div>
//         </header>
//         <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//           {children}
//         </main>
//       </div>
//     );
//   };

//   return (
//     <Router>
//       <AppLayout>
//         <Routes>
//           <Route
//             path="/login"
//             element={user ? <Navigate to="/dashboard" replace /> : <Login />}
//           />
//           <Route
//             path="/study-plan"
//             element={
//               <ProtectedRoute>
//                 <StudyPlan />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/study-plan/:id"
//             element={
//               <ProtectedRoute>
//                 <StudyPlan />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/dashboard"
//             element={
//               <ProtectedRoute>
//                 <Dashboard />
//               </ProtectedRoute>
//             }
//           />
//           <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
//         </Routes>
//       </AppLayout>
//     </Router>
//   );
// }

// export default App;








import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import Features from './components/Features.jsx';
import PlaylistComparison from './components/PlaylistComparison.jsx';
import VideoSummary from './components/VideoSummary.jsx';
import StudyPlan from './components/StudyPlan.jsx';
import Dashboard from './components/Dashboard.jsx';
import Login from './components/Login.jsx';
import { supabase } from './lib/supabase';

function Home() {
  return (
    <div>
      <Navbar />
      <Hero />
      <Features />
    </div>
  );
}

function App() {
  // State for playlists (lifted from PlaylistComparison)
  const [playlists, setPlaylists] = useState([]);

  // Custom hook to check authentication status
  const useAuth = () => {
    const [user, setUser] = React.useState(null);

    React.useEffect(() => {
      const checkAuth = async () => {
        const { data: { user: initialUser }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Auth error:', error.message);
        } else {
          console.log('Initial user:', initialUser);
          setUser(initialUser);
        }
      };
      checkAuth();

      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', { event, session });
        setUser(session?.user ?? null);
      });

      return () => authListener.subscription.unsubscribe();
    }, []);

    return user;
  };

  const user = useAuth();

  // Protected Route Component
  const ProtectedRoute = ({ children }) => {
    if (!user) {
      console.log('Redirecting to /login due to no user');
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={user ? <Navigate to="/dashboard" replace /> : <Login />}
          />
          <Route
            path="/study-plan"
            element={
              <ProtectedRoute>
                <div>
                  <Navbar />
                  <StudyPlan />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/study-plan/:id"
            element={
              <ProtectedRoute>
                <div>
                  <Navbar />
                  <StudyPlan />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>
                  <Navbar />
                  <Dashboard />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/compare"
            element={
              <ProtectedRoute>
                <div>
                  <Navbar />
                  <PlaylistComparison playlists={playlists} setPlaylists={setPlaylists} />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/summary"
            element={
              <ProtectedRoute>
                <div>
                  <Navbar />
                  <VideoSummary />
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;