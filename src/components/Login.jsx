import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AlertCircle, Loader2 } from 'lucide-react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      console.log('Attempting login with:', { email, password });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        throw error;
      }

      console.log('Login successful - Initial data:', data);

      // Verify the session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        console.error('Failed to verify session after login:', sessionError);
        throw new Error('Session verification failed. Please try again.');
      }

      console.log('Verified session after login:', sessionData.session);
      console.log('Logged in user ID:', sessionData.session.user.id);

      // Verify user exists in auth.users by fetching user data
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        console.error('Failed to fetch user data:', userError);
        throw new Error('User not found. Please sign up again.');
      }

      console.log('Fetched user data:', userData.user);

      navigate('/study-plan', { replace: true });
    } catch (err) {
      console.error('Login catch error:', err);
      setError(err.message || 'Failed to log in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      console.log('Attempting signup with:', { email, password });
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('Signup error:', error);
        throw error;
      }

      console.log('Signup successful - User data:', data);

      // Since email confirmation is disabled, the user should be logged in immediately
      // Force a session refresh to ensure the session is active
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        console.error('Failed to verify session after signup:', sessionError);
        throw new Error('Session verification failed after signup. Please log in manually.');
      }

      console.log('Session after signup:', sessionData.session);

      if (data.user && !data.user.confirmed_at) {
        setMessage(
          'Signup successful! Please check your email to confirm your account. After confirmation, log in to continue.'
        );
      } else {
        console.log('User confirmed, redirecting to study-plan');
        navigate('/study-plan', { replace: true });
      }
    } catch (err) {
      console.error('Signup catch error:', err);
      setError(err.message || 'Failed to sign up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md mx-auto bg-gray-800 rounded-lg p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-white text-center mb-6">Login or Sign Up</h1>
        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-4 flex items-center gap-3">
            <AlertCircle className="text-red-500" />
            <p className="text-red-100">{error}</p>
          </div>
        )}
        {message && (
          <div className="bg-green-900/50 border border-green-500 rounded-lg p-4 mb-4 flex items-center gap-3">
            <p className="text-green-100">{message}</p>
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-purple-500"
              required
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-purple-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Login'}
          </button>
        </form>
        <button
          onClick={handleSignup}
          className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          disabled={loading}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign Up'}
        </button>
      </div>
    </div>
  );
}

export default Login;