'use client';

import { useState } from 'react';
import { auth } from '@/firebase-config/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export default function GoogleSignInTest() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const testGoogleSignIn = async () => {
    setLoading(true);
    setStatus('Testing Google Sign-in...');

    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
      setStatus('🔄 Opening Google sign-in popup...');
      
      const result = await signInWithPopup(auth, provider);
      
      if (result.user) {
        setStatus(`✅ Google Sign-in successful! Welcome ${result.user.displayName || result.user.email}`);
        
        // Log user info
        console.log('User:', {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL
        });
      }
      
    } catch (error) {
      console.error('Google Sign-in test error:', error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        setStatus('❌ Sign-in was cancelled. You closed the popup before completing authentication.');
      } else if (error.code === 'auth/popup-blocked') {
        setStatus('❌ Pop-up was blocked by your browser. Please allow pop-ups for this site and try again.');
      } else if (error.code === 'auth/operation-not-allowed') {
        setStatus('❌ Google sign-in is not enabled in Firebase Console. Please enable it in Authentication > Sign-in method.');
      } else if (error.code === 'auth/unauthorized-domain') {
        setStatus('❌ This domain is not authorized. Please add it to Firebase Console > Authentication > Settings > Authorized domains.');
      } else {
        setStatus(`❌ Error: ${error.code} - ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">Google Sign-in Test</h2>
      
      <button
        onClick={testGoogleSignIn}
        disabled={loading}
        className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 disabled:opacity-50 flex items-center justify-center"
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {loading ? 'Testing...' : 'Test Google Sign-in'}
      </button>
      
      {status && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <p className="text-sm">{status}</p>
        </div>
      )}
      
      <div className="mt-6 text-xs text-gray-600">
        <h3 className="font-semibold">To enable Google Sign-in:</h3>
        <ol className="list-decimal list-inside mt-2 space-y-1">
          <li>Go to Firebase Console</li>
          <li>Select project: letter-lms</li>
          <li>Click "Authentication" → "Sign-in method"</li>
          <li>Enable "Google" provider</li>
          <li>Add authorized domains (localhost for dev)</li>
          <li>Save changes</li>
        </ol>
      </div>
    </div>
  );
}
