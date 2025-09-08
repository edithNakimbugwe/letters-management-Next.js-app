import FirebaseTest from '@/components/debug/FirebaseTest';
import GoogleSignInTest from '@/components/debug/GoogleSignInTest';
import FirestoreTest from '@/components/debug/FirestoreTest';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Firebase Test Suite</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <FirebaseTest />
          <GoogleSignInTest />
          <FirestoreTest />
        </div>
      </div>
    </div>
  );
}
