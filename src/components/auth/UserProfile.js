'use client';

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Avatar } from '../ui/avatar';

const UserProfile = () => {
  const { user, updateUserProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      await updateUserProfile({ displayName });
      setMessage('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      setError('Failed to log out');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <Avatar className="mx-auto mb-4 w-20 h-20">
          <img
            src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || user?.email)}&background=6366f1&color=fff`}
            alt="Profile"
            className="w-full h-full rounded-full object-cover"
          />
        </Avatar>
        <h2 className="text-xl font-semibold text-gray-900">
          {user?.displayName || 'User'}
        </h2>
        <p className="text-gray-600">{user?.email}</p>
      </div>

      {message && (
        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          
          <div className="flex space-x-3">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {loading ? 'Saving...' : 'Save'}
            </Button>
            <Button
              type="button"
              onClick={() => setIsEditing(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Account Information</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Email:</span> {user?.email}</p>
              <p><span className="font-medium">Name:</span> {user?.displayName || 'Not set'}</p>
              <p><span className="font-medium">Account created:</span> {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Unknown'}</p>
              <p><span className="font-medium">Last sign in:</span> {user?.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : 'Unknown'}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={() => setIsEditing(true)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Edit Profile
            </Button>
            
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full border-red-300 text-red-700 hover:bg-red-50"
            >
              Sign Out
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
