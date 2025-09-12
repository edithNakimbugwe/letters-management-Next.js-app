'use client';

import { useAuth } from '../../contexts/AuthContext';
import FirebaseStorageTest from '../../components/debug/FirebaseStorageTest';

export default function TestFirebaseStoragePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p>Please log in to test Firebase Storage.</p>
        </div>
      </div>
    );
  }

  return <FirebaseStorageTest />;
}
