'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createUserDocument, getUserDocument } from '@/services/firestore';
import { Button } from '@/components/ui/button';

export default function FirestoreTest() {
  const { user } = useAuth();
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const testFirestore = async () => {
    if (!user) {
      setStatus('❌ You must be logged in to test Firestore');
      return;
    }

    setLoading(true);
    setStatus('🔄 Testing Firestore connection...');

    try {
      // Test 1: Try to create user document
      setStatus('🔄 Step 1: Creating user document...');
      await createUserDocument(user);
      setStatus('✅ Step 1: User document created successfully');

      // Test 2: Try to read user document
      setStatus('🔄 Step 2: Reading user document...');
      const userDoc = await getUserDocument(user.uid);
      
      if (userDoc) {
        setStatus(`✅ Firestore test successful! User: ${userDoc.displayName || userDoc.email}`);
      } else {
        setStatus('⚠️ User document created but could not be read back');
      }

    } catch (error) {
      console.error('Firestore test error:', error);
      
      if (error.code === 'permission-denied') {
        setStatus('❌ Permission denied. Please update Firestore security rules.');
      } else if (error.code === 'unavailable') {
        setStatus('❌ Firestore is unavailable. Check your internet connection.');
      } else {
        setStatus(`❌ Error: ${error.code} - ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">Firestore Connection Test</h2>
      
      {user ? (
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            <strong>User:</strong> {user.displayName || user.email}
          </p>
          <p className="text-sm text-gray-600">
            <strong>UID:</strong> {user.uid}
          </p>
        </div>
      ) : (
        <div className="mb-4 p-3 bg-yellow-100 rounded">
          <p className="text-sm text-yellow-700">Please log in first to test Firestore</p>
        </div>
      )}
      
      <Button
        onClick={testFirestore}
        disabled={loading || !user}
        className="w-full mb-4"
      >
        {loading ? 'Testing...' : 'Test Firestore Connection'}
      </Button>
      
      {status && (
        <div className="p-3 bg-gray-100 rounded">
          <p className="text-sm">{status}</p>
        </div>
      )}
      
      <div className="mt-6 text-xs text-gray-600">
        <h3 className="font-semibold">Required Security Rules:</h3>
        <pre className="mt-2 p-2 bg-gray-200 rounded text-xs overflow-x-auto">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
    match /letters/{letterId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.createdBy;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.createdBy;
    }
  }
}`}
        </pre>
      </div>
    </div>
  );
}
