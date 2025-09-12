'use client';

import { useState } from 'react';
import { uploadLetterDocument } from '../../services/storage';
import { useAuth } from '../../contexts/AuthContext';

export default function FirebaseStorageTest() {
  const { user } = useAuth();
  const [testResult, setTestResult] = useState('');
  const [testing, setTesting] = useState(false);

  const testFileUpload = async () => {
    if (!user) {
      setTestResult('❌ User not logged in');
      return;
    }

    setTesting(true);
    setTestResult('🔄 Testing Firebase Storage...');

    try {
      // Create a simple test file
      const testContent = 'This is a test file for Firebase Storage - ' + new Date().toISOString();
      const testFile = new File([testContent], 'test-storage.txt', { type: 'text/plain' });
      
      console.log('=== TESTING FIREBASE STORAGE ===');
      console.log('Test file:', testFile);
      console.log('User:', user.uid);
      console.log('Storage service imported:', typeof uploadLetterDocument);
      
      const result = await uploadLetterDocument(testFile, user.uid);
      
      console.log('Upload result:', result);
      setTestResult(`✅ Firebase Storage working!\n\nFile Details:\n- Name: ${result.name}\n- Size: ${result.size} bytes\n- Type: ${result.type}\n- URL: ${result.url}\n- Path: ${result.path}\n- Uploaded: ${result.uploadedAt}`);
      
    } catch (error) {
      console.error('Storage test failed:', error);
      setTestResult(`❌ Firebase Storage failed:\n\nError Details:\n- Message: ${error.message}\n- Code: ${error.code || 'Unknown'}\n- Stack: ${error.stack || 'No stack trace'}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Firebase Storage Test</h2>
        
        <div className="space-y-4">
          <button
            onClick={testFileUpload}
            disabled={testing}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {testing ? 'Testing...' : 'Test File Upload'}
          </button>
          
          {testResult && (
            <div className="p-4 bg-gray-100 rounded whitespace-pre-line">
              {testResult}
            </div>
          )}
          
          <div className="text-sm text-gray-600">
            <p><strong>User ID:</strong> {user?.uid || 'Not logged in'}</p>
            <p><strong>User Email:</strong> {user?.email || 'Not logged in'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
