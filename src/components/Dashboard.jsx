// import React, { useState, useEffect } from 'react';
// import { BookOpen, Clock, Brain, CheckCircle, Calendar, ArrowRight, Loader2 } from 'lucide-react';
// import { supabase } from '../lib/supabase';
// import { formatDistanceToNow } from 'date-fns';
// import { Link } from 'react-router-dom';

// function Dashboard() {
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [user, setUser] = useState(null);
//   const [stats, setStats] = useState({
//     totalPlans: 0,
//     completedModules: 0,
//     activePlans: 0,
//     totalProgress: 0
//   });
//   const [recentActivity, setRecentActivity] = useState([]);
//   const [studyPlans, setStudyPlans] = useState([]);

//   useEffect(() => {
//     checkUser();
//     if (user) {
//       loadDashboardData();
//     }
//   }, [user]);

//   async function checkUser() {
//     try {
//       const { data: { user } } = await supabase.auth.getUser();
//       setUser(user);
//     } catch (error) {
//       console.error('Error checking user:', error);
//     }
//   }

//   async function loadDashboardData() {
//     if (!user) return;

//     try {
//       setLoading(true);

//       // Fetch study plans
//       const { data: plans, error: plansError } = await supabase
//         .from('study_plans')
//         .select('*')
//         .eq('user_id', user.id)
//         .order('created_at', { ascending: false });

//       if (plansError) throw plansError;

//       // Fetch progress data
//       const { data: progress, error: progressError } = await supabase
//         .from('user_progress')
//         .select('*')
//         .eq('user_id', user.id)
//         .order('updated_at', { ascending: false });

//       if (progressError) throw progressError;

//       // Calculate statistics
//       const completedModules = progress.filter(p => p.completed).length;
//       const activePlans = plans.filter(p => {
//         const planProgress = progress.filter(pr => pr.content_id === p.id);
//         return planProgress.some(pr => !pr.completed);
//       }).length;

//       const totalProgressPercentage = progress.length > 0
//         ? Math.round(
//             (progress.reduce((acc, p) => acc + p.progress, 0) / (progress.length * 100)) * 100
//           )
//         : 0;

//       setStats({
//         totalPlans: plans.length,
//         completedModules,
//         activePlans,
//         totalProgress: totalProgressPercentage
//       });

//       // Format recent activity
//       const recentActivity = [...progress]
//         .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
//         .slice(0, 5)
//         .map(activity => {
//           const plan = plans.find(p => p.id === activity.content_id);
//           return {
//             type: 'module',
//             title: plan ? `${plan.topic} - Module ${activity.module_index + 1}` : 'Unknown Module',
//             timestamp: activity.updated_at,
//             progress: activity.progress,
//             completed: activity.completed
//           };
//         });

//       setRecentActivity(recentActivity);
//       setStudyPlans(plans);
//       setLoading(false);
//     } catch (err) {
//       setError(err.message);
//       setLoading(false);
//     }
//   }

//   if (!user) {
//     return (
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//         <div className="text-center">
//           <h1 className="text-3xl font-bold text-white mb-4">Welcome to AI StudyMate</h1>
//           <p className="text-gray-400 mb-8">Please sign in to view your dashboard</p>
//           <Link
//             to="/login"
//             className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
//           >
//             Sign In
//             <ArrowRight className="ml-2 w-5 h-5" />
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   if (loading) {
//     return (
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center">
//         <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//       <h1 className="text-3xl font-bold text-white mb-8">Learning Dashboard</h1>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
//         <div className="bg-gray-800 rounded-lg p-6">
//           <div className="flex items-center justify-between mb-4">
//             <BookOpen className="w-8 h-8 text-purple-500" />
//             <span className="text-2xl font-bold text-white">{stats.totalPlans}</span>
//           </div>
//           <p className="text-gray-400">Total Study Plans</p>
//         </div>

//         <div className="bg-gray-800 rounded-lg p-6">
//           <div className="flex items-center justify-between mb-4">
//             <CheckCircle className="w-8 h-8 text-purple-500" />
//             <span className="text-2xl font-bold text-white">{stats.completedModules}</span>
//           </div>
//           <p className="text-gray-400">Completed Modules</p>
//         </div>

//         <div className="bg-gray-800 rounded-lg p-6">
//           <div className="flex items-center justify-between mb-4">
//             <Clock className="w-8 h-8 text-purple-500" />
//             <span className="text-2xl font-bold text-white">{stats.activePlans}</span>
//           </div>
//           <p className="text-gray-400">Active Plans</p>
//         </div>

//         <div className="bg-gray-800 rounded-lg p-6">
//           <div className="flex items-center justify-between mb-4">
//             <Brain className="w-8 h-8 text-purple-500" />
//             <span className="text-2xl font-bold text-white">{stats.totalProgress}%</span>
//           </div>
//           <p className="text-gray-400">Overall Progress</p>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         <div className="bg-gray-800 rounded-lg p-6">
//           <h2 className="text-xl font-semibold text-white mb-6">Recent Activity</h2>
//           <div className="space-y-4">
//             {recentActivity.map((activity, index) => (
//               <div key={index} className="flex items-center justify-between border-b border-gray-700 pb-4">
//                 <div>
//                   <h3 className="text-white font-medium">{activity.title}</h3>
//                   <p className="text-sm text-gray-400">
//                     {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
//                   </p>
//                 </div>
//                 {activity.completed ? (
//                   <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
//                     Completed
//                   </span>
//                 ) : (
//                   <div className="w-24 bg-gray-700 rounded-full h-2">
//                     <div
//                       className="bg-purple-500 h-2 rounded-full"
//                       style={{ width: `${activity.progress}%` }}
//                     ></div>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="bg-gray-800 rounded-lg p-6">
//           <h2 className="text-xl font-semibold text-white mb-6">Your Study Plans</h2>
//           <div className="space-y-4">
//             {studyPlans.map((plan, index) => (
//               <Link
//                 key={index}
//                 to={`/study-plan/${plan.id}`}
//                 className="block bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
//               >
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h3 className="text-white font-medium">{plan.topic}</h3>
//                     <p className="text-sm text-gray-400">{plan.duration}</p>
//                   </div>
//                   <ArrowRight className="w-5 h-5 text-gray-400" />
//                 </div>
//               </Link>
//             ))}
            
//             {studyPlans.length === 0 && (
//               <div className="text-center py-8">
//                 <p className="text-gray-400 mb-4">No study plans yet</p>
//                 <Link
//                   to="/study-plan"
//                   className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
//                 >
//                   Create Your First Plan
//                   <ArrowRight className="ml-2 w-4 h-4" />
//                 </Link>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Dashboard;
































// import { useState, useEffect } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { supabase } from '../lib/supabase';
// import { formatDistanceToNow } from 'date-fns';
// import { BookOpen, Clock, Brain, CheckCircle, Calendar, ArrowRight, Loader2 } from 'lucide-react';

// function Dashboard() {
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [user, setUser] = useState(null);
//   const [stats, setStats] = useState({
//     totalPlans: 0,
//     completedModules: 0,
//     activePlans: 0,
//     totalProgress: 0,
//   });
//   const [recentActivity, setRecentActivity] = useState([]);
//   const [studyPlans, setStudyPlans] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       setError(null);

//       try {
//         // Check for logged-in user
//         const { data: { user }, error: userError } = await supabase.auth.getUser();
//         if (userError) {
//           console.error('Error fetching user:', userError);
//           throw new Error('Failed to authenticate user. Please try again.');
//         }

//         if (!user) {
//           navigate('/login');
//           return;
//         }

//         setUser(user);

//         // Fetch study plans
//         const { data: plans, error: plansError } = await supabase
//           .from('study_plans')
//           .select('*')
//           .eq('user_id', user.id)
//           .order('created_at', { ascending: false });

//         if (plansError) {
//           console.error('Error fetching study plans:', plansError);
//           throw plansError;
//         }

//         // Fetch progress data
//         const { data: progress, error: progressError } = await supabase
//           .from('user_progress')
//           .select('*')
//           .eq('user_id', user.id)
//           .order('updated_at', { ascending: false });

//         if (progressError) {
//           console.error('Error fetching progress:', progressError);
//           throw progressError;
//         }

//         // Calculate statistics
//         const completedModules = progress.filter(p => p.completed).length;
//         const activePlans = plans.filter(p => {
//           const planProgress = progress.filter(pr => pr.content_id === p.id);
//           return planProgress.some(pr => !pr.completed);
//         }).length;

//         const totalProgressPercentage = progress.length > 0
//           ? Math.round(
//               (progress.reduce((acc, p) => acc + p.progress, 0) / (progress.length * 100)) * 100
//             )
//           : 0;

//         setStats({
//           totalPlans: plans.length,
//           completedModules,
//           activePlans,
//           totalProgress: totalProgressPercentage,
//         });

//         // Format recent activity
//         const recentActivity = [...progress]
//           .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
//           .slice(0, 5)
//           .map(activity => {
//             const plan = plans.find(p => p.id === activity.content_id);
//             return {
//               type: 'module',
//               title: plan ? `${plan.topic} - Module ${activity.module_index + 1}` : 'Unknown Module',
//               timestamp: activity.updated_at,
//               progress: activity.progress,
//               completed: activity.completed,
//             };
//           });

//         setRecentActivity(recentActivity);
//         setStudyPlans(plans);
//       } catch (err) {
//         setError(err.message || 'An error occurred while loading your dashboard.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     // Listen for auth state changes
//     const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
//       if (event === 'SIGNED_IN') {
//         setUser(session?.user ?? null);
//         fetchData();
//       } else if (event === 'SIGNED_OUT') {
//         setUser(null);
//         navigate('/login');
//       }
//     });

//     // Initial fetch
//     fetchData();

//     // Cleanup listener on unmount
//     return () => {
//       authListener.subscription.unsubscribe();
//     };
//   }, [navigate]);

//   if (!user) {
//     return (
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//         <div className="text-center">
//           <h1 className="text-3xl font-bold text-white mb-4">Welcome to AI StudyMate</h1>
//           <p className="text-gray-400 mb-8">Please sign in to view your dashboard</p>
//           <Link
//             to="/login"
//             className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
//           >
//             Sign In
//             <ArrowRight className="ml-2 w-5 h-5" />
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   if (loading) {
//     return (
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center">
//         <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//         <div className="text-center text-red-400">
//           <p>{error}</p>
//           <button
//             onClick={() => fetchData()}
//             className="mt-4 inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//       <h1 className="text-3xl font-bold text-white mb-8">Learning Dashboard</h1>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
//         <div className="bg-gray-800 rounded-lg p-6">
//           <div className="flex items-center justify-between mb-4">
//             <BookOpen className="w-8 h-8 text-purple-500" />
//             <span className="text-2xl font-bold text-white">{stats.totalPlans}</span>
//           </div>
//           <p className="text-gray-400">Total Study Plans</p>
//         </div>

//         <div className="bg-gray-800 rounded-lg p-6">
//           <div className="flex items-center justify-between mb-4">
//             <CheckCircle className="w-8 h-8 text-purple-500" />
//             <span className="text-2xl font-bold text-white">{stats.completedModules}</span>
//           </div>
//           <p className="text-gray-400">Completed Modules</p>
//         </div>

//         <div className="bg-gray-800 rounded-lg p-6">
//           <div className="flex items-center justify-between mb-4">
//             <Clock className="w-8 h-8 text-purple-500" />
//             <span className="text-2xl font-bold text-white">{stats.activePlans}</span>
//           </div>
//           <p className="text-gray-400">Active Plans</p>
//         </div>

//         <div className="bg-gray-800 rounded-lg p-6">
//           <div className="flex items-center justify-between mb-4">
//             <Brain className="w-8 h-8 text-purple-500" />
//             <span className="text-2xl font-bold text-white">{stats.totalProgress}%</span>
//           </div>
//           <p className="text-gray-400">Overall Progress</p>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         <div className="bg-gray-800 rounded-lg p-6">
//           <h2 className="text-xl font-semibold text-white mb-6">Recent Activity</h2>
//           <div className="space-y-4">
//             {recentActivity.map((activity, index) => (
//               <div key={index} className="flex items-center justify-between border-b border-gray-700 pb-4">
//                 <div>
//                   <h3 className="text-white font-medium">{activity.title}</h3>
//                   <p className="text-sm text-gray-400">
//                     {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
//                   </p>
//                 </div>
//                 {activity.completed ? (
//                   <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
//                     Completed
//                   </span>
//                 ) : (
//                   <div className="w-24 bg-gray-700 rounded-full h-2">
//                     <div
//                       className="bg-purple-500 h-2 rounded-full"
//                       style={{ width: `${activity.progress}%` }}
//                     ></div>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="bg-gray-800 rounded-lg p-6">
//           <h2 className="text-xl font-semibold text-white mb-6">Your Study Plans</h2>
//           <div className="space-y-4">
//             {studyPlans.map((plan, index) => (
//               <Link
//                 key={index}
//                 to={`/study-plan/${plan.id}`}
//                 className="block bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
//               >
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h3 className="text-white font-medium">{plan.topic}</h3>
//                     <p className="text-sm text-gray-400">{plan.duration}</p>
//                   </div>
//                   <ArrowRight className="w-5 h-5 text-gray-400" />
//                 </div>
//               </Link>
//             ))}
            
//             {studyPlans.length === 0 && (
//               <div className="text-center py-8">
//                 <p className="text-gray-400 mb-4">No study plans yet</p>
//                 <Link
//                   to="/study-plan"
//                   className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
//                 >
//                   Create Your First Plan
//                   <ArrowRight className="ml-2 w-4 h-4" />
//                 </Link>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Dashboard;











//full correct code

// import { useState, useEffect } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { supabase } from '../lib/supabase';
// import { formatDistanceToNow } from 'date-fns';
// import {
//   BookOpen,
//   Clock,
//   Brain,
//   CheckCircle,
//   Calendar,
//   ArrowRight,
//   Loader2,
//   Trash2,
// } from 'lucide-react';

// function Dashboard() {
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [user, setUser] = useState(null);
//   const [stats, setStats] = useState({
//     totalPlans: 0,
//     completedModules: 0,
//     activePlans: 0,
//     totalProgress: 0,
//   });
//   const [recentActivity, setRecentActivity] = useState([]);
//   const [studyPlans, setStudyPlans] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       setError(null);

//       try {
//         const { data: { user }, error: userError } = await supabase.auth.getUser();
//         if (userError || !user) {
//           console.error('Error fetching user or no user:', userError);
//           navigate('/login');
//           return;
//         }

//         setUser(user);
//         console.log('User fetched in Dashboard:', user);

//         const { data: plans, error: plansError } = await supabase
//           .from('study_plans')
//           .select(`
//             id,
//             topic,
//             duration,
//             content,
//             modules,
//             created_at
//           `)
//           .eq('user_id', user.id)
//           .order('created_at', { ascending: false });

//         if (plansError) throw plansError;

//         const { data: progress, error: progressError } = await supabase
//           .from('user_progress')
//           .select('*')
//           .eq('user_id', user.id)
//           .order('updated_at', { ascending: false });

//         if (progressError) throw progressError;

//         const completedModules = progress.filter(p => p.completed).length;
//         const activePlans = plans.filter(p => {
//           const planProgress = progress.filter(pr => pr.content_id === p.id);
//           return planProgress.some(pr => !pr.completed);
//         }).length;

//         const totalProgressPercentage = progress.length > 0
//           ? Math.round(
//               (progress.reduce((acc, p) => acc + p.progress, 0) / (progress.length * 100)) * 100
//             )
//           : 0;

//         setStats({
//           totalPlans: plans.length,
//           completedModules,
//           activePlans,
//           totalProgress: totalProgressPercentage,
//         });

//         const recentActivityData = [...progress]
//           .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
//           .slice(0, 5)
//           .map(activity => {
//             const plan = plans.find(p => p.id === activity.content_id);
//             return {
//               type: 'module',
//               title: plan ? `${plan.topic} - Module ${activity.module_index + 1}` : 'Unknown Module',
//               timestamp: activity.updated_at,
//               progress: activity.progress,
//               completed: activity.completed,
//             };
//           });

//         setRecentActivity(recentActivityData);
//         setStudyPlans(plans);
//       } catch (err) {
//         console.error('Error in fetchData:', err);
//         setError(err.message || 'An error occurred while loading your dashboard.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();

//     const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
//       console.log('Auth state changed:', event, session);
//       if (event === 'SIGNED_OUT') {
//         setUser(null);
//         navigate('/login');
//       } else if (session && event !== 'INITIAL_SESSION') {
//         setUser(session.user);
//         fetchData();
//       }
//     });

//     return () => authListener.subscription.unsubscribe();
//   }, [navigate]);

//   const handleDeletePlan = async (planId) => {
//     if (!window.confirm('Are you sure you want to delete this study plan?')) return;

//     setLoading(true);
//     setError(null);

//     try {
//       // Delete related progress entries
//       await supabase
//         .from('user_progress')
//         .delete()
//         .match({ content_id: planId, content_type: 'study_plan' });

//       // Delete the plan
//       const { error } = await supabase
//         .from('study_plans')
//         .delete()
//         .eq('id', planId);

//       if (error) throw error;

//       setStudyPlans(studyPlans.filter(plan => plan.id !== planId));
//       setStats(prev => ({
//         ...prev,
//         totalPlans: prev.totalPlans - 1,
//       }));
//       console.log('Plan deleted successfully');
//     } catch (err) {
//       console.error('Error deleting plan:', err);
//       setError(err.message || 'Failed to delete plan.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!user) {
//     return (
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//         <div className="text-center">
//           <h1 className="text-3xl font-bold text-white mb-4">Welcome to AI StudyMate</h1>
//           <p className="text-gray-400 mb-8">Please sign in to view your dashboard</p>
//           <Link
//             to="/login"
//             className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
//           >
//             Sign In
//             <ArrowRight className="ml-2 w-5 h-5" />
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   if (loading) {
//     return (
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center">
//         <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//         <div className="text-center text-red-400">
//           <p>{error}</p>
//           <button
//             onClick={() => fetchData()}
//             className="mt-4 inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//       <h1 className="text-3xl font-bold text-white mb-8">Learning Dashboard</h1>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
//         <div className="bg-gray-800 rounded-lg p-6">
//           <div className="flex items-center justify-between mb-4">
//             <BookOpen className="w-8 h-8 text-purple-500" />
//             <span className="text-2xl font-bold text-white">{stats.totalPlans}</span>
//           </div>
//           <p className="text-gray-400">Total Study Plans</p>
//         </div>

//         <div className="bg-gray-800 rounded-lg p-6">
//           <div className="flex items-center justify-between mb-4">
//             <CheckCircle className="w-8 h-8 text-purple-500" />
//             <span className="text-2xl font-bold text-white">{stats.completedModules}</span>
//           </div>
//           <p className="text-gray-400">Completed Modules</p>
//         </div>

//         <div className="bg-gray-800 rounded-lg p-6">
//           <div className="flex items-center justify-between mb-4">
//             <Clock className="w-8 h-8 text-purple-500" />
//             <span className="text-2xl font-bold text-white">{stats.activePlans}</span>
//           </div>
//           <p className="text-gray-400">Active Plans</p>
//         </div>

//         <div className="bg-gray-800 rounded-lg p-6">
//           <div className="flex items-center justify-between mb-4">
//             <Brain className="w-8 h-8 text-purple-500" />
//             <span className="text-2xl font-bold text-white">{stats.totalProgress}%</span>
//           </div>
//           <p className="text-gray-400">Overall Progress</p>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         <div className="bg-gray-800 rounded-lg p-6">
//           <h2 className="text-xl font-semibold text-white mb-6">Recent Activity</h2>
//           <div className="space-y-4">
//             {recentActivity.length === 0 ? (
//               <p className="text-gray-400 text-center">No recent activity yet.</p>
//             ) : (
//               recentActivity.map((activity, index) => (
//                 <div key={index} className="flex items-center justify-between border-b border-gray-700 pb-4">
//                   <div>
//                     <h3 className="text-white font-medium">{activity.title}</h3>
//                     <p className="text-sm text-gray-400">
//                       {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
//                     </p>
//                   </div>
//                   {activity.completed ? (
//                     <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
//                       Completed
//                     </span>
//                   ) : (
//                     <div className="w-24 bg-gray-700 rounded-full h-2">
//                       <div
//                         className="bg-purple-500 h-2 rounded-full"
//                         style={{ width: `${activity.progress}%` }}
//                       ></div>
//                     </div>
//                   )}
//                 </div>
//               ))
//             )}
//           </div>
//         </div>

//         <div className="bg-gray-800 rounded-lg p-6">
//           <h2 className="text-xl font-semibold text-white mb-6">Your Study Plans</h2>
//           <div className="space-y-4">
//             {studyPlans.length === 0 ? (
//               <div className="text-center py-8">
//                 <p className="text-gray-400 mb-4">No study plans yet</p>
//                 <Link
//                   to="/study-plan"
//                   className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
//                 >
//                   Create Your First Plan
//                   <ArrowRight className="ml-2 w-4 h-4" />
//                 </Link>
//               </div>
//             ) : (
//               studyPlans.map((plan, index) => (
//                 <div key={index} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <Link
//                         to={`/study-plan/${plan.id}`}
//                         className="text-white font-medium hover:underline"
//                       >
//                         {plan.topic}
//                       </Link>
//                       <p className="text-sm text-gray-400">{plan.duration}</p>
//                       <p className="text-xs text-gray-500">
//                         Created {formatDistanceToNow(new Date(plan.created_at), { addSuffix: true })}
//                       </p>
//                     </div>
//                     <div>
//                       <button
//                         onClick={() => handleDeletePlan(plan.id)}
//                         className="text-red-500 hover:text-red-700 ml-4"
//                         disabled={loading}
//                       >
//                         {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Dashboard;


import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import {
  BookOpen,
  Clock,
  Brain,
  CheckCircle,
  Calendar,
  ArrowRight,
  Loader2,
  Trash2,
} from 'lucide-react';

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalPlans: 0,
    completedModules: 0,
    activePlans: 0,
    totalProgress: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [studyPlans, setStudyPlans] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          console.error('Error fetching user or no user:', userError);
          navigate('/login');
          return;
        }

        setUser(user);
        console.log('User fetched in Dashboard:', user);

        const { data: plans, error: plansError } = await supabase
          .from('study_plans')
          .select(`
            id,
            topic,
            duration,
            content,
            modules,
            created_at
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (plansError) throw plansError;

        const { data: progress, error: progressError } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });

        if (progressError) throw progressError;

        // Calculate statistics
        const completedModules = progress.filter(p => p.completed).length;

        // Consider a plan "active" if it exists and not all modules are completed
        const activePlans = plans.filter(p => {
          const planProgress = progress.filter(pr => pr.content_id === p.id);
          // If no progress entries, the plan is active (since it has modules per Step 2)
          if (planProgress.length === 0) return true;
          // Otherwise, active if at least one module is incomplete
          return planProgress.some(pr => !pr.completed);
        }).length;

        const totalProgressPercentage = progress.length > 0
          ? Math.round(
              (progress.reduce((acc, p) => acc + p.progress, 0) / (progress.length * 100)) * 100
            )
          : 0;

        setStats({
          totalPlans: plans.length,
          completedModules,
          activePlans,
          totalProgress: totalProgressPercentage,
        });

        const recentActivityData = [...progress]
          .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
          .slice(0, 5)
          .map(activity => {
            const plan = plans.find(p => p.id === activity.content_id);
            return {
              type: 'module',
              title: plan ? `${plan.topic} - Module ${activity.module_index + 1}` : 'Unknown Module',
              timestamp: activity.updated_at,
              progress: activity.progress,
              completed: activity.completed,
            };
          });

        setRecentActivity(recentActivityData);
        setStudyPlans(plans);
      } catch (err) {
        console.error('Error in fetchData:', err);
        setError(err.message || 'An error occurred while loading your dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Real-time subscriptions
    const plansSubscription = supabase
      .channel('study_plans_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'study_plans', filter: `user_id=eq.${user?.id}` }, payload => {
        console.log('Study plan changed:', payload);
        fetchData();
      })
      .subscribe();

    const progressSubscription = supabase
      .channel('user_progress_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_progress', filter: `user_id=eq.${user?.id}` }, payload => {
        console.log('User progress changed:', payload);
        fetchData();
      })
      .subscribe();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
      if (event === 'SIGNED_OUT') {
        setUser(null);
        navigate('/login');
      } else if (session && event !== 'INITIAL_SESSION') {
        setUser(session.user);
        fetchData();
      }
    });

    return () => {
      plansSubscription.unsubscribe();
      progressSubscription.unsubscribe();
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleDeletePlan = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this study plan?')) return;

    setLoading(true);
    setError(null);

    try {
      await supabase
        .from('user_progress')
        .delete()
        .match({ content_id: planId, content_type: 'study_plan' });

      const { error } = await supabase
        .from('study_plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;

      setStudyPlans(studyPlans.filter(plan => plan.id !== planId));
      setStats(prev => ({
        ...prev,
        totalPlans: prev.totalPlans - 1,
      }));
      console.log('Plan deleted successfully');
    } catch (err) {
      console.error('Error deleting plan:', err);
      setError(err.message || 'Failed to delete plan.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Welcome to AI StudyMate</h1>
          <p className="text-gray-400 mb-8">Please sign in to view your dashboard</p>
          <Link
            to="/login"
            className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Sign In
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center text-red-400">
          <p>{error}</p>
          <button
            onClick={() => fetchData()}
            className="mt-4 inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">Learning Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <BookOpen className="w-8 h-8 text-purple-500" />
            <span className="text-2xl font-bold text-white">{stats.totalPlans}</span>
          </div>
          <p className="text-gray-400">Total Study Plans</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-8 h-8 text-purple-500" />
            <span className="text-2xl font-bold text-white">{stats.completedModules}</span>
          </div>
          <p className="text-gray-400">Completed Modules</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 text-purple-500" />
            <span className="text-2xl font-bold text-white">{stats.activePlans}</span>
          </div>
          <p className="text-gray-400">Active Plans</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <Brain className="w-8 h-8 text-purple-500" />
            <span className="text-2xl font-bold text-white">{stats.totalProgress}%</span>
          </div>
          <p className="text-gray-400">Overall Progress</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <p className="text-gray-400 text-center">No recent activity yet.</p>
            ) : (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between border-b border-gray-700 pb-4">
                  <div>
                    <h3 className="text-white font-medium">{activity.title}</h3>
                    <p className="text-sm text-gray-400">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                  {activity.completed ? (
                    <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                      Completed
                    </span>
                  ) : (
                    <div className="w-24 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${activity.progress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Your Study Plans</h2>
          <div className="space-y-4">
            {studyPlans.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">No study plans yet</p>
                <Link
                  to="/study-plan"
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Create Your First Plan
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            ) : (
              studyPlans.map((plan, index) => (
                <div key={index} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <Link
                        to={`/study-plan/${plan.id}`}
                        className="text-white font-medium hover:underline"
                      >
                        {plan.topic}
                      </Link>
                      <p className="text-sm text-gray-400">{plan.duration}</p>
                      <p className="text-xs text-gray-500">
                        Created {formatDistanceToNow(new Date(plan.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <div>
                      <button
                        onClick={() => handleDeletePlan(plan.id)}
                        className="text-red-500 hover:text-red-700 ml-4"
                        disabled={loading}
                      >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;