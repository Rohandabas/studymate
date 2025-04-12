// import React, { useState, useEffect } from 'react';
// import { Calendar, Clock, CheckSquare, BookOpen, Loader2, AlertCircle } from 'lucide-react';
// import { generateStudyPlan } from '../lib/gemini';
// import ReactMarkdown from 'react-markdown';
// import { supabase } from '../lib/supabase';
// import { useNavigate } from 'react-router-dom';

// function StudyPlan() {
//   const [topic, setTopic] = useState('');
//   const [duration, setDuration] = useState('4 weeks');
//   const [plan, setPlan] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [user, setUser] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     // Check authentication status
//     supabase.auth.getUser().then(({ data: { user } }) => {
//       setUser(user);
//     });
//   }, []);

//   const handleGeneratePlan = async (e) => {
//     e.preventDefault();
//     if (!topic) return;
  
//     if (!user) {
//       setError('Please sign in to create a study plan');
//       navigate('/login');
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       const planText = await generateStudyPlan(topic, duration);
      
//       // Parse the plan text to extract modules
//       const modules = planText.split('\n')
//         .filter(line => line.startsWith('Week'))
//         .map(line => {
//           const weekMatch = line.match(/Week (\d+)/);
//           return {
//             title: line,
//             completed: false
//           };
//         });

//       // Save to Supabase
//       const { data, error: dbError } = await supabase
//         .from('study_plans')
//         .insert([
//           {
//             user_id: user.id,
//             topic,
//             duration,
//             modules: modules,
//             content: planText
//           }
//         ])
//         .select()
//         .single();

//       if (dbError) throw dbError;

//       setPlan({
//         id: data.id,
//         content: planText,
//         modules: modules
//       });

//       // Create initial progress records
//       await supabase
//         .from('user_progress')
//         .insert(
//           modules.map((_, index) => ({
//             user_id: user.id,
//             content_type: 'study_plan',
//             content_id: data.id,
//             module_index: index,
//             progress: 0,
//             completed: false
//           }))
//         );

//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleModuleComplete = async (moduleIndex) => {
//     if (!user || !plan) return;

//     try {
//       const { data, error } = await supabase
//         .from('user_progress')
//         .update({
//           completed: true,
//           progress: 100,
//           updated_at: new Date().toISOString()
//         })
//         .match({
//           user_id: user.id,
//           content_type: 'study_plan',
//           content_id: plan.id,
//           module_index: moduleIndex
//         });

//       if (error) throw error;

//       // Update local state
//       const updatedModules = [...plan.modules];
//       updatedModules[moduleIndex].completed = true;
//       setPlan({ ...plan, modules: updatedModules });
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//       <div className="text-center mb-12">
//         <h1 className="text-3xl font-bold text-white mb-4">Personalized Study Plan</h1>
//         <p className="text-gray-400">Get a customized learning path based on your goals</p>
//       </div>

//       {!user && (
//         <div className="bg-purple-900/50 border border-purple-500 rounded-lg p-4 mb-8 text-center">
//           <p className="text-purple-100">Sign in to create and save your study plans</p>
//         </div>
//       )}

//       <form onSubmit={handleGeneratePlan} className="mb-8">
//         <div className="space-y-4">
//           <div>
//             <input
//               type="text"
//               value={topic}
//               onChange={(e) => setTopic(e.target.value)}
//               placeholder="Enter your learning topic (e.g., Web Development)"
//               className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-purple-500"
//             />
//           </div>
//           <div className="flex gap-4">
//             <select
//               value={duration}
//               onChange={(e) => setDuration(e.target.value)}
//               className="px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-purple-500"
//             >
//               <option value="2 weeks">2 weeks</option>
//               <option value="4 weeks">4 weeks</option>
//               <option value="8 weeks">8 weeks</option>
//               <option value="12 weeks">12 weeks</option>
//             </select>
//             <button
//               type="submit"
//               className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
//               disabled={loading || !topic || !user}
//             >
//               {loading ? (
//                 <>
//                   <Loader2 className="w-5 h-5 animate-spin" />
//                   Generating...
//                 </>
//               ) : (
//                 'Generate Plan'
//               )}
//             </button>
//           </div>
//         </div>
//       </form>

//       {error && (
//         <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-8 flex items-center gap-3">
//           <AlertCircle className="text-red-500 shrink-0" />
//           <p className="text-red-100">{error}</p>
//         </div>
//       )}

//       {loading && (
//         <div className="animate-pulse space-y-4">
//           <div className="h-4 bg-gray-700 rounded w-3/4"></div>
//           <div className="h-4 bg-gray-700 rounded w-1/2"></div>
//           <div className="h-4 bg-gray-700 rounded w-2/3"></div>
//         </div>
//       )}

//       {plan && (
//         <div className="space-y-8">
//           <div className="bg-gray-800 rounded-lg p-6">
//             <div className="prose prose-invert max-w-none">
//               <ReactMarkdown>{plan.content}</ReactMarkdown>
//             </div>
//           </div>

//           <div className="bg-gray-800 rounded-lg p-6">
//             <h3 className="text-xl font-semibold text-white mb-4">Progress Tracking</h3>
//             <div className="space-y-4">
//               {plan.modules.map((module, index) => (
//                 <div
//                   key={index}
//                   className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
//                 >
//                   <div className="flex items-center gap-3">
//                     <CheckSquare
//                       className={`w-5 h-5 ${
//                         module.completed ? 'text-green-500' : 'text-gray-400'
//                       }`}
//                     />
//                     <span className="text-white">{module.title}</span>
//                   </div>
//                   <button
//                     onClick={() => handleModuleComplete(index)}
//                     className={`px-3 py-1 rounded ${
//                       module.completed
//                         ? 'bg-green-600 text-white cursor-default'
//                         : 'bg-purple-600 hover:bg-purple-700 text-white'
//                     }`}
//                     disabled={module.completed}
//                   >
//                     {module.completed ? 'Completed' : 'Mark Complete'}
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default StudyPlan;



// import React, { useState, useEffect } from 'react';
// import { Calendar, Clock, CheckSquare, BookOpen, Loader2, AlertCircle } from 'lucide-react';
// import { generateStudyPlan } from '../lib/gemini';
// import ReactMarkdown from 'react-markdown';
// import { supabase } from '../lib/supabase';
// import { useNavigate } from 'react-router-dom';

// function StudyPlan() {
//   const [topic, setTopic] = useState('');
//   const [duration, setDuration] = useState('4 weeks');
//   const [plan, setPlan] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [user, setUser] = useState(null);
//   const [authLoading, setAuthLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
//       console.log('Auth state changed in StudyPlan:', { event, session });

//       if (event === 'INITIAL_SESSION') {
//         if (session) {
//           console.log('Initial session found:', session.user);
//           setUser(session.user);
//         } else {
//           console.log('No initial session found.');
//           navigate('/login', { replace: true });
//         }
//         setAuthLoading(false);
//       } else if (event === 'SIGNED_OUT' || !session) {
//         console.log('User signed out or no session.');
//         setUser(null);
//         setError('You have been signed out. Please sign in again.');
//         navigate('/login', { replace: true });
//       } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
//         console.log('User signed in or token refreshed:', session.user);
//         setUser(session.user);
//       }
//     });

//     return () => {
//       authListener.subscription.unsubscribe();
//     };
//   }, [navigate]);

//   const handleGeneratePlan = async (e) => {
//     e.preventDefault();
//     if (!topic) return;

//     if (!user || !user.id) {
//       console.log('User is invalid or null in handleGeneratePlan:', user);
//       setError('Please sign in to create a study plan');
//       navigate('/login', { replace: true });
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       console.log('Generating plan with user_id:', user.id);

//       // Check if a study plan with the same user_id and topic already exists
//       const { data: existingPlan, error: checkError } = await supabase
//         .from('study_plans')
//         .select('id')
//         .eq('user_id', user.id)
//         .eq('topic', topic)
//         .single();

//       if (checkError) {
//         console.error('Error checking for existing study plan:', checkError);
//         if (checkError.status === 406) {
//           setError('Server cannot process the request. Please try a simpler topic or contact support.');
//           return;
//         } else if (checkError.code !== 'PGRST116') { // PGRST116 means no rows found
//           throw new Error('Failed to check for existing study plan: ' + checkError.message);
//         }
//       }

//       if (existingPlan) {
//         setError('A study plan with this topic already exists. Please try a different topic or delete the existing plan from your dashboard.');
//         return;
//       }

//       const planText = await generateStudyPlan(topic, duration);

//       const modules = planText
//         .split('\n')
//         .filter(line => line.startsWith('Week'))
//         .map(line => ({
//           title: line,
//           completed: false
//         }));

//       console.log('Inserting into study_plans with user_id:', user.id);
//       const { data, error: dbError } = await supabase
//         .from('study_plans')
//         .insert([
//           {
//             user_id: user.id,
//             topic,
//             duration,
//             modules: modules,
//             content: planText
//           }
//         ])
//         .select()
//         .single();

//       if (dbError) {
//         console.error('Insert error details:', JSON.stringify(dbError, null, 2)); // Log full error object
//         if (dbError.code === '23503' || dbError.message.includes('violates foreign key constraint')) {
//           setError('User not found in database. This may indicate a sync issue. Please log out, sign up again with a new email, and try again.');
//         } else if (dbError.code === '23505' || dbError.message.includes('duplicate key value')) {
//           setError('A study plan with this topic already exists. Please try a different topic or delete the existing plan.');
//         } else if (dbError.status === 409) {
//           setError('Conflict error: ' + dbError.message + '. Please check the database or try again.');
//         } else {
//           setError(`Database error: ${dbError.message}`);
//         }
//         return;
//       }

//       if (!data) {
//         setError('Failed to create study plan. No data returned from the database.');
//         return;
//       }

//       setPlan({
//         id: data.id,
//         content: planText,
//         modules: modules
//       });

//       console.log('Inserting into user_progress for study plan:', data.id);
//       const { error: progressError } = await supabase
//         .from('user_progress')
//         .insert(
//           modules.map((_, index) => ({
//             user_id: user.id,
//             content_type: 'study_plan',
//             content_id: data.id,
//             module_index: index,
//             progress: 0,
//             completed: false
//           }))
//         );

//       if (progressError) {
//         console.error('Error inserting into user_progress:', progressError);
//         setError('Study plan created, but failed to initialize progress tracking: ' + progressError.message);
//       }

//     } catch (err) {
//       console.error('Error in handleGeneratePlan:', err);
//       setError(err.message || 'An unexpected error occurred while generating the study plan.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleModuleComplete = async (moduleIndex) => {
//     if (!user || !plan) return;

//     try {
//       const { data, error } = await supabase
//         .from('user_progress')
//         .update({
//           completed: true,
//           progress: 100,
//           updated_at: new Date().toISOString()
//         })
//         .match({
//           user_id: user.id,
//           content_type: 'study_plan',
//           content_id: plan.id,
//           module_index: moduleIndex
//         });

//       if (error) throw error;

//       const updatedModules = [...plan.modules];
//       updatedModules[moduleIndex].completed = true;
//       setPlan({ ...plan, modules: updatedModules });
//     } catch (err) {
//       setError(err.message || 'Failed to mark module as complete.');
//     }
//   };

//   if (authLoading) {
//     return <div className="text-center text-white">Loading...</div>;
//   }

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//       <div className="text-center mb-12">
//         <h1 className="text-3xl font-bold text-white mb-4">Personalized Study Plan</h1>
//         <p className="text-gray-400">Get a customized learning path based on your goals</p>
//       </div>

//       {!user && (
//         <div className="bg-purple-900/50 border border-purple-500 rounded-lg p-4 mb-8 text-center">
//           <p className="text-purple-100">Sign in to create and save your study plans</p>
//         </div>
//       )}

//       <form onSubmit={handleGeneratePlan} className="mb-8">
//         <div className="space-y-4">
//           <div>
//             <input
//               type="text"
//               value={topic}
//               onChange={(e) => setTopic(e.target.value)}
//               placeholder="Enter your learning topic (e.g., Web Development)"
//               className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-purple-500"
//             />
//           </div>
//           <div className="flex gap-4">
//             <select
//               value={duration}
//               onChange={(e) => setDuration(e.target.value)}
//               className="px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-purple-500"
//             >
//               <option value="2 weeks">2 weeks</option>
//               <option value="4 weeks">4 weeks</option>
//               <option value="8 weeks">8 weeks</option>
//               <option value="12 weeks">12 weeks</option>
//             </select>
//             <button
//               type="submit"
//               className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
//               disabled={loading || !topic || !user}
//             >
//               {loading ? (
//                 <>
//                   <Loader2 className="w-5 h-5 animate-spin" />
//                   Generating...
//                 </>
//               ) : (
//                 'Generate Plan'
//               )}
//             </button>
//           </div>
//         </div>
//       </form>

//       {error && (
//         <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-8 flex items-center gap-3">
//           <AlertCircle className="text-red-500 shrink-0" />
//           <p className="text-red-100">{error}</p>
//         </div>
//       )}

//       {loading && (
//         <div className="animate-pulse space-y-4">
//           <div className="h-4 bg-gray-700 rounded w-3/4"></div>
//           <div className="h-4 bg-gray-700 rounded w-1/2"></div>
//           <div className="h-4 bg-gray-700 rounded w-2/3"></div>
//         </div>
//       )}

//       {plan && (
//         <div className="space-y-8">
//           <div className="bg-gray-800 rounded-lg p-6">
//             <div className="prose prose-invert max-w-none">
//               <ReactMarkdown>{plan.content}</ReactMarkdown>
//             </div>
//           </div>

//           <div className="bg-gray-800 rounded-lg p-6">
//             <h3 className="text-xl font-semibold text-white mb-4">Progress Tracking</h3>
//             <div className="space-y-4">
//               {plan.modules.map((module, index) => (
//                 <div
//                   key={index}
//                   className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
//                 >
//                   <div className="flex items-center gap-3">
//                     <CheckSquare
//                       className={`w-5 h-5 ${
//                         module.completed ? 'text-green-500' : 'text-gray-400'
//                       }`}
//                     />
//                     <span className="text-white">{module.title}</span>
//                   </div>
//                   <button
//                     onClick={() => handleModuleComplete(index)}
//                     className={`px-3 py-1 rounded ${
//                       module.completed
//                         ? 'bg-green-600 text-white cursor-default'
//                         : 'bg-purple-600 hover:bg-purple-700 text-white'
//                     }`}
//                     disabled={module.completed}
//                   >
//                     {module.completed ? 'Completed' : 'Mark Complete'}
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default StudyPlan;





//corect code

// import React, { useState, useEffect } from 'react';
// import { Calendar, Clock, CheckSquare, BookOpen, Loader2, AlertCircle } from 'lucide-react';
// import { generateStudyPlan } from '../lib/gemini';
// import ReactMarkdown from 'react-markdown';
// import { supabase } from '../lib/supabase';
// import { useNavigate, useParams } from 'react-router-dom';

// function StudyPlan() {
//   const { id } = useParams(); // Get the :id parameter from the URL
//   const [topic, setTopic] = useState('');
//   const [duration, setDuration] = useState('4 weeks');
//   const [plan, setPlan] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [user, setUser] = useState(null);
//   const [authLoading, setAuthLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
//       console.log('Auth state changed in StudyPlan:', { event, session });

//       if (event === 'INITIAL_SESSION') {
//         if (session) {
//           console.log('Initial session found:', session.user);
//           setUser(session.user);
//         } else {
//           console.log('No initial session found.');
//           navigate('/login', { replace: true });
//         }
//         setAuthLoading(false);
//       } else if (event === 'SIGNED_OUT' || !session) {
//         console.log('User signed out or no session.');
//         setUser(null);
//         setError('You have been signed out. Please sign in again.');
//         navigate('/login', { replace: true });
//       } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
//         console.log('User signed in or token refreshed:', session.user);
//         setUser(session.user);
//       }
//     });

//     return () => {
//       authListener.subscription.unsubscribe();
//     };
//   }, [navigate]);

//   useEffect(() => {
//     const fetchPlan = async () => {
//       if (id && user) {
//         setLoading(true);
//         setError(null);
//         try {
//           const { data, error } = await supabase
//             .from('study_plans')
//             .select('*')
//             .eq('id', id)
//             .eq('user_id', user.id)
//             .single();

//           if (error) throw error;
//           if (!data) {
//             setError('Study plan not found or you do not have access to it.');
//             return;
//           }

//           setTopic(data.topic);
//           setDuration(data.duration);
//           setPlan({
//             id: data.id,
//             content: data.content,
//             modules: data.modules,
//           });
//         } catch (err) {
//           console.error('Error fetching plan:', err);
//           setError(err.message || 'Failed to load the study plan.');
//         } finally {
//           setLoading(false);
//         }
//       }
//     };

//     if (user) fetchPlan();
//   }, [id, user]);

//   const handleGeneratePlan = async (e) => {
//     e.preventDefault();
//     if (!topic) return;

//     if (!user || !user.id) {
//       console.log('User is invalid or null in handleGeneratePlan:', user);
//       setError('Please sign in to create a study plan');
//       navigate('/login', { replace: true });
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       console.log('Generating plan with user_id:', user.id);

//       // Check if a study plan with the same user_id and topic already exists
//       const { data: existingPlan, error: checkError } = await supabase
//         .from('study_plans')
//         .select('id')
//         .eq('user_id', user.id)
//         .eq('topic', topic)
//         .single();

//       if (checkError) {
//         console.error('Error checking for existing study plan:', checkError);
//         if (checkError.status === 406) {
//           setError('Server cannot process the request. Please try a simpler topic or contact support.');
//           return;
//         } else if (checkError.code !== 'PGRST116') { // PGRST116 means no rows found
//           throw new Error('Failed to check for existing study plan: ' + checkError.message);
//         }
//       }

//       if (existingPlan) {
//         setError('A study plan with this topic already exists. Please try a different topic or delete the existing plan from your dashboard.');
//         return;
//       }

//       const planText = await generateStudyPlan(topic, duration);

//       const modules = planText
//         .split('\n')
//         .filter(line => line.startsWith('Week'))
//         .map(line => ({
//           title: line,
//           completed: false
//         }));

//       console.log('Inserting into study_plans with user_id:', user.id);
//       const { data, error: dbError } = await supabase
//         .from('study_plans')
//         .insert([
//           {
//             user_id: user.id,
//             topic,
//             duration,
//             modules: modules,
//             content: planText
//           }
//         ])
//         .select()
//         .single();

//       if (dbError) {
//         console.error('Insert error details:', JSON.stringify(dbError, null, 2));
//         if (dbError.code === '23503' || dbError.message.includes('violates foreign key constraint')) {
//           setError('User not found in database. This may indicate a sync issue. Please log out, sign up again with a new email, and try again.');
//         } else if (dbError.code === '23505' || dbError.message.includes('duplicate key value')) {
//           setError('A study plan with this topic already exists. Please try a different topic or delete the existing plan.');
//         } else if (dbError.status === 409) {
//           setError('Conflict error: ' + dbError.message + '. Please check the database or try again.');
//         } else {
//           setError(`Database error: ${dbError.message}`);
//         }
//         return;
//       }

//       if (!data) {
//         setError('Failed to create study plan. No data returned from the database.');
//         return;
//       }

//       setPlan({
//         id: data.id,
//         content: planText,
//         modules: modules
//       });

//       console.log('Inserting into user_progress for study plan:', data.id);
//       const { error: progressError } = await supabase
//         .from('user_progress')
//         .insert(
//           modules.map((_, index) => ({
//             user_id: user.id,
//             content_type: 'study_plan',
//             content_id: data.id,
//             module_index: index,
//             progress: 0,
//             completed: false
//           }))
//         );

//       if (progressError) {
//         console.error('Error inserting into user_progress:', progressError);
//         setError('Study plan created, but failed to initialize progress tracking: ' + progressError.message);
//       }
//     } catch (err) {
//       console.error('Error in handleGeneratePlan:', err);
//       setError(err.message || 'An unexpected error occurred while generating the study plan.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleModuleComplete = async (moduleIndex) => {
//     if (!user || !plan) return;

//     try {
//       const { data, error } = await supabase
//         .from('user_progress')
//         .update({
//           completed: true,
//           progress: 100,
//           updated_at: new Date().toISOString()
//         })
//         .match({
//           user_id: user.id,
//           content_type: 'study_plan',
//           content_id: plan.id,
//           module_index: moduleIndex
//         });

//       if (error) throw error;

//       const updatedModules = [...plan.modules];
//       updatedModules[moduleIndex].completed = true;
//       setPlan({ ...plan, modules: updatedModules });
//     } catch (err) {
//       setError(err.message || 'Failed to mark module as complete.');
//     }
//   };

//   if (authLoading) {
//     return <div className="text-center text-white">Loading...</div>;
//   }

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//       <div className="text-center mb-12">
//         <h1 className="text-3xl font-bold text-white mb-4">
//           {id ? 'View Study Plan' : 'Personalized Study Plan'}
//         </h1>
//         <p className="text-gray-400">{id ? 'Review and manage your study plan' : 'Get a customized learning path based on your goals'}</p>
//       </div>

//       {!user && (
//         <div className="bg-purple-900/50 border border-purple-500 rounded-lg p-4 mb-8 text-center">
//           <p className="text-purple-100">Sign in to create and save your study plans</p>
//         </div>
//       )}

//       {!id && (
//         <form onSubmit={handleGeneratePlan} className="mb-8">
//           <div className="space-y-4">
//             <div>
//               <input
//                 type="text"
//                 value={topic}
//                 onChange={(e) => setTopic(e.target.value)}
//                 placeholder="Enter your learning topic (e.g., Web Development)"
//                 className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-purple-500"
//               />
//             </div>
//             <div className="flex gap-4">
//               <select
//                 value={duration}
//                 onChange={(e) => setDuration(e.target.value)}
//                 className="px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-purple-500"
//               >
//                 <option value="2 weeks">2 weeks</option>
//                 <option value="4 weeks">4 weeks</option>
//                 <option value="8 weeks">8 weeks</option>
//                 <option value="12 weeks">12 weeks</option>
//               </select>
//               <button
//                 type="submit"
//                 className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
//                 disabled={loading || !topic || !user}
//               >
//                 {loading ? (
//                   <>
//                     <Loader2 className="w-5 h-5 animate-spin" />
//                     Generating...
//                   </>
//                 ) : (
//                   'Generate Plan'
//                 )}
//               </button>
//             </div>
//           </div>
//         </form>
//       )}

//       {error && (
//         <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-8 flex items-center gap-3">
//           <AlertCircle className="text-red-500 shrink-0" />
//           <p className="text-red-100">{error}</p>
//         </div>
//       )}

//       {loading && (
//         <div className="animate-pulse space-y-4">
//           <div className="h-4 bg-gray-700 rounded w-3/4"></div>
//           <div className="h-4 bg-gray-700 rounded w-1/2"></div>
//           <div className="h-4 bg-gray-700 rounded w-2/3"></div>
//         </div>
//       )}

//       {plan && (
//         <div className="space-y-8">
//           <div className="bg-gray-800 rounded-lg p-6">
//             <div className="prose prose-invert max-w-none">
//               <ReactMarkdown>{plan.content}</ReactMarkdown>
//             </div>
//           </div>

//           <div className="bg-gray-800 rounded-lg p-6">
//             <h3 className="text-xl font-semibold text-white mb-4">Progress Tracking</h3>
//             <div className="space-y-4">
//               {plan.modules.map((module, index) => (
//                 <div
//                   key={index}
//                   className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
//                 >
//                   <div className="flex items-center gap-3">
//                     <CheckSquare
//                       className={`w-5 h-5 ${
//                         module.completed ? 'text-green-500' : 'text-gray-400'
//                       }`}
//                     />
//                     <span className="text-white">{module.title}</span>
//                   </div>
//                   <button
//                     onClick={() => handleModuleComplete(index)}
//                     className={`px-3 py-1 rounded ${
//                       module.completed
//                         ? 'bg-green-600 text-white cursor-default'
//                         : 'bg-purple-600 hover:bg-purple-700 text-white'
//                     }`}
//                     disabled={module.completed}
//                   >
//                     {module.completed ? 'Completed' : 'Mark Complete'}
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default StudyPlan;




import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckSquare, BookOpen, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { generateStudyPlan } from '../lib/gemini';
import ReactMarkdown from 'react-markdown';
import { supabase } from '../lib/supabase';
import { useNavigate, useParams } from 'react-router-dom';

function StudyPlan() {
  const { id } = useParams();
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState('4 weeks');
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        console.error('Error fetching user or no user:', error);
        setUser(null);
        navigate('/login', { replace: true });
      } else {
        console.log('Fetched user on mount:', user);
        setUser(user);
      }
      setAuthLoading(false);
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed in StudyPlan:', { event, session });
      if (event === 'SIGNED_OUT' || !session) {
        console.log('User signed out or no session.');
        setUser(null);
        setError('You have been signed out. Please sign in again.');
        navigate('/login', { replace: true });
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log('User signed in or token refreshed:', session.user);
        setUser(session.user);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchPlan = async () => {
      if (id && user) {
        setLoading(true);
        setError(null);
        try {
          const { data, error } = await supabase
            .from('study_plans')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

          if (error) throw error;
          if (!data) {
            setError('Study plan not found or you do not have access to it.');
            return;
          }

          setTopic(data.topic);
          setDuration(data.duration);
          setPlan({
            id: data.id,
            content: data.content,
            modules: data.modules,
          });
        } catch (err) {
          console.error('Error fetching plan:', err);
          setError(err.message || 'Failed to load the study plan.');
        } finally {
          setLoading(false);
        }
      }
    };

    if (user) fetchPlan();
  }, [id, user]);

  const handleGeneratePlan = async (e) => {
    e.preventDefault();
    if (!topic) return;

    const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
    if (userError || !currentUser) {
      console.error('User not authenticated:', userError);
      setError('Please sign in to create a study plan');
      navigate('/login', { replace: true });
      return;
    }

    setUser(currentUser);
    console.log('User ID before generating plan:', currentUser.id);

    setLoading(true);
    setError(null);

    try {
      // Encode the topic to handle special characters
      const encodedTopic = encodeURIComponent(topic);
      console.log('Encoded topic for query:', encodedTopic);

      // Check for existing plan
      const { data: existingPlan, error: checkError } = await supabase
        .from('study_plans')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('topic', topic) // Use the raw topic value (Supabase handles encoding)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking for existing study plan:', JSON.stringify(checkError, null, 2));
        throw new Error('Failed to check for existing study plan: ' + (checkError.message || 'Unknown error'));
      }

      if (existingPlan) {
        setError('A study plan with this topic already exists. Please try a different topic or delete the existing plan from your dashboard.');
        return;
      }

      const planText = await generateStudyPlan(topic, duration);

      let modules = planText
        .split('\n')
        .filter(line => line.startsWith('Week'))
        .map(line => ({
          title: line,
          completed: false,
        }));

      if (modules.length === 0) {
        console.warn('No "Week" headings found in the generated plan. Creating a default module.');
        modules = [
          {
            title: 'Week 1: Full Plan Overview',
            completed: false,
          },
        ];
        setSuccessMessage('Study plan generated, but no weekly modules were found. A default module has been created for progress tracking.');
      } else {
        setSuccessMessage('Study plan generated successfully!');
      }

      console.log('Generated modules:', modules);

      console.log('Inserting into study_plans with user_id:', currentUser.id);
      const { data, error: dbError } = await supabase
        .from('study_plans')
        .insert([
          {
            user_id: currentUser.id,
            topic,
            duration,
            modules,
            content: planText,
          },
        ])
        .select()
        .single();

      if (dbError) {
        console.error('Insert error details:', JSON.stringify(dbError, null, 2));
        setError(`Failed to create study plan: ${dbError.message || 'Unknown error'}`);
        return;
      }

      if (!data) {
        setError('Failed to create study plan. No data returned from the database.');
        return;
      }

      setPlan({
        id: data.id,
        content: planText,
        modules,
      });

      const progressEntries = modules.map((_, index) => ({
        user_id: currentUser.id,
        content_type: 'study_plan',
        content_id: data.id,
        module_index: index,
        progress: 0,
        completed: false,
      }));
      console.log('Inserting into user_progress with entries:', progressEntries);

      const { error: progressError } = await supabase
        .from('user_progress')
        .insert(progressEntries);

      if (progressError) {
        console.error('Progress insert error details:', JSON.stringify(progressError, null, 2));
        setError(
          'Study plan created, but failed to initialize progress tracking: ' +
          (progressError.message || 'Unknown error') +
          '. You can still view the plan, but progress tracking will be unavailable.'
        );
      }

      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Error in handleGeneratePlan:', err);
      setError(err.message || 'An unexpected error occurred while generating the study plan.');
    } finally {
      setLoading(false);
    }
  };

  const handleModuleComplete = async (moduleIndex) => {
    if (!user || !plan) return;

    try {
      const { error } = await supabase
        .from('user_progress')
        .update({
          completed: true,
          progress: 100,
          updated_at: new Date().toISOString(),
        })
        .match({
          user_id: user.id,
          content_type: 'study_plan',
          content_id: plan.id,
          module_index: moduleIndex,
        });

      if (error) throw error;

      const updatedModules = [...plan.modules];
      updatedModules[moduleIndex].completed = true;
      setPlan({ ...plan, modules: updatedModules });
    } catch (err) {
      setError(err.message || 'Failed to mark module as complete.');
    }
  };

  const handleClearForm = () => {
    setTopic('');
    setDuration('4 weeks');
    setPlan(null);
    setError(null);
    setSuccessMessage(null);
  };

  if (authLoading) {
    return <div className="text-center text-white">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Personalized Study Plan</h1>
          <p className="text-gray-400 mb-8">Please sign in to create and save your study plans</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-white mb-4">
          {id ? 'View Study Plan' : 'Personalized Study Plan'}
        </h1>
        <p className="text-gray-400">{id ? 'Review and manage your study plan' : 'Get a customized learning path based on your goals'}</p>
      </div>

      {!id && (
        <form onSubmit={handleGeneratePlan} className="mb-8">
          <div className="space-y-4">
            <div>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter your learning topic (e.g., Web Development)"
                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="flex gap-4">
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-purple-500"
              >
                <option value="2 weeks">2 weeks</option>
                <option value="4 weeks">4 weeks</option>
                <option value="8 weeks">8 weeks</option>
                <option value="12 weeks">12 weeks</option>
              </select>
              <button
                type="submit"
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                disabled={loading || !topic}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Plan'
                )}
              </button>
              <button
                type="button"
                onClick={handleClearForm}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                disabled={loading || (!topic && !plan)}
              >
                Clear Form
              </button>
            </div>
          </div>
        </form>
      )}

      {successMessage && (
        <div className="bg-green-900/50 border border-green-500 rounded-lg p-4 mb-8 flex items-center gap-3">
          <CheckCircle2 className="text-green-500 shrink-0" />
          <p className="text-green-100">{successMessage}</p>
        </div>
      )}

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

      {plan && (
        <div className="space-y-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown>{plan.content}</ReactMarkdown>
            </div>
          </div>

          {plan.modules && plan.modules.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Progress Tracking</h3>
              <div className="space-y-4">
                {plan.modules.map((module, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <CheckSquare
                        className={`w-5 h-5 ${module.completed ? 'text-green-500' : 'text-gray-400'}`}
                      />
                      <span className="text-white">{module.title}</span>
                    </div>
                    <button
                      onClick={() => handleModuleComplete(index)}
                      className={`px-3 py-1 rounded ${
                        module.completed
                          ? 'bg-green-600 text-white cursor-default'
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                      }`}
                      disabled={module.completed}
                    >
                      {module.completed ? 'Completed' : 'Mark Complete'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default StudyPlan;