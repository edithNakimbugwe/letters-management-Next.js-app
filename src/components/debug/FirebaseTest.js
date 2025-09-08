'use client';

import { useState } from 'react';
import { auth } from '@/firebase-config/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

export default function FirebaseTest() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const testFirebaseConnection = async () => {
    setLoading(true);
    setStatus('Testing Firebase connection...');

    try {
      // Test 1: Check if auth is initialized
      console.log('Auth object:', auth);
      console.log('Auth app:', auth.app);
      console.log('Auth config:', auth.config);
      
      setStatus('✅ Firebase Auth is initialized');
      
      // Test 2: Try to create a test user (will fail if auth is not enabled)
      const testEmail = `test${Date.now()}@example.com`;
      const testPassword = 'testpassword123';
      
      setStatus('🔄 Testing user creation...');
      
      const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
      
      if (userCredential.user) {
        setStatus('✅ Firebase Authentication is working! User created successfully.');
        
        // Clean up - delete the test user
        await userCredential.user.delete();
        setStatus('✅ Firebase Authentication is fully functional!');
      }
      
    } catch (error) {
      console.error('Firebase test error:', error);
      
      if (error.code === 'auth/configuration-not-found') {
        setStatus('❌ CONFIGURATION_NOT_FOUND: Authentication is not enabled in Firebase Console. Please enable Email/Password authentication.');
      } else if (error.code === 'auth/invalid-api-key') {
        setStatus('❌ Invalid API key. Please check your Firebase configuration.');
      } else if (error.code === 'auth/project-not-found') {
        setStatus('❌ Project not found. Please check your project ID.');
      } else {
        setStatus(`❌ Error: ${error.code} - ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">Firebase Connection Test</h2>
      
      <button
        onClick={testFirebaseConnection}
        disabled={loading}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Firebase Connection'}
      </button>
      
      {status && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <p className="text-sm">{status}</p>
        </div>
      )}
      
      <div className="mt-6 text-xs text-gray-600">
        <h3 className="font-semibold">If you see CONFIGURATION_NOT_FOUND:</h3>
        <ol className="list-decimal list-inside mt-2 space-y-1">
          <li>Go to Firebase Console</li>
          <li>Select your project: letter-lms</li>
          <li>Click "Authentication" in sidebar</li>
          <li>Click "Get started"</li>
          <li>Go to "Sign-in method" tab</li>
          <li>Enable "Email/Password"</li>
        </ol>
      </div>
    </div>
  );
}
