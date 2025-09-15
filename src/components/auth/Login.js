'use client';

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAuthErrorMessage } from '../../utils/authErrors';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signInWithGoogle } = useAuth();
  // Google sign-in handler
  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      router.push('/lettersystem');
    } catch (error) {
      setError(getAuthErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await login(email, password);
      router.push('/lettersystem');
    } catch (error) {
      setError(getAuthErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#28b4b4' }}>
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600">
              New here?{' '}
              <Link href="/auth/signup" className="font-semibold transition-colors" style={{ color: '#28b4b4' }}>
                Create an account
              </Link>
            </p>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* ...existing code... */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                <div className="flex">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="ml-3 text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}
            
            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 hover:border-gray-400"
                  style={{ '--tw-ring-color': '#28b4b4' }}
                  onFocus={(e) => e.target.style.borderColor = '#28b4b4'}
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 hover:border-gray-400"
                  style={{ '--tw-ring-color': '#28b4b4' }}
                  onFocus={(e) => e.target.style.borderColor = '#28b4b4'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-center">
              <Link
                href="/auth/forgot-password"
                className="text-sm font-medium transition-colors"
                style={{ color: '#28b4b4' }}
              >
                Forgot your password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              style={{ 
                backgroundColor: '#28b4b4',
                '--tw-ring-color': '#28b4b4'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#229999'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#28b4b4'}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </Button>

            <Button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl shadow-sm hover:bg-gray-50 transition-all duration-200 mt-2"
              style={{ color: '#444' }}
            >
              <svg className="h-5 w-5" viewBox="0 0 48 48">
                <g>
                  <path fill="#4285F4" d="M24 9.5c3.54 0 6.36 1.53 7.82 2.81l5.77-5.77C34.64 3.55 29.74 1.5 24 1.5 14.82 1.5 6.98 7.36 3.69 15.09l6.91 5.37C12.36 14.36 17.74 9.5 24 9.5z"/>
                  <path fill="#34A853" d="M46.1 24.5c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.91-2.18 5.38-4.65 7.04l7.19 5.59C43.98 37.36 46.1 31.36 46.1 24.5z"/>
                  <path fill="#FBBC05" d="M10.6 28.46c-1.04-3.09-1.04-6.39 0-9.48l-6.91-5.37C1.64 17.64 0 20.98 0 24.5c0 3.52 1.64 6.86 3.69 9.89l6.91-5.37z"/>
                  <path fill="#EA4335" d="M24 46.5c6.48 0 11.92-2.15 15.89-5.86l-7.19-5.59c-2.01 1.35-4.59 2.15-8.7 2.15-6.26 0-11.64-4.86-13.4-11.37l-6.91 5.37C6.98 41.64 14.82 46.5 24 46.5z"/>
                  <path fill="none" d="M0 0h48v48H0z"/>
                </g>
              </svg>
              Continue with Google
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
