import UserProfile from '../../../components/auth/UserProfile';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <UserProfile />
      </div>
    </ProtectedRoute>
  );
}
