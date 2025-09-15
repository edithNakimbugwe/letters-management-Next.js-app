// src/components/layout/TopNavigation.js
"use client"

import { Menu, Bell, Settings, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SidebarContent } from './Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useState } from 'react';

const TopNavigation = () => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const getUserInitials = (name, email) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200 shadow-sm">
      {/* Left Section - Mobile Menu & Brand */}
      <div className="flex items-center space-x-4">
        {/* Mobile Menu Button */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="md:hidden hover:bg-gray-100">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64" aria-label="Navigation Menu">
            <SidebarContent />
          </SheetContent>
        </Sheet>

        {/* Brand/Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white border border-gray-200">
            <img src="/favicon.ico" alt="App Icon" className="w-6 h-6" />
          </div>
          <span className="hidden sm:block text-lg font-semibold text-gray-900">
            STI Letter Management System
          </span>
        </div>
      </div>

      {/* Center Section - Page Title */}
      {/* <div className="hidden md:block">
        <h1 className="text-lg font-semibold text-gray-900">
          Letter Management System
        </h1>
      </div> */}

      {/* Right Section - Actions & Profile */}
      <div className="flex items-center space-x-3">
        {/* Settings */}
        <Link href="/lettersystem/settings">
          <Button variant="ghost" size="sm" className="hover:bg-gray-100">
            <Settings className="h-4 w-4 text-gray-600" />
          </Button>
        </Link>

        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative hover:bg-gray-100">
          <Bell className="h-4 w-4 text-gray-600" />
          <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full animate-pulse"></span>
        </Button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-300"></div>

        {/* User Profile */}
        <div className="relative">
          <div 
            className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <Avatar className="h-8 w-8 border-2 border-gray-200">
              <AvatarImage 
                src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || user?.email)}&background=28b4b4&color=fff`} 
                alt="User" 
              />
              <AvatarFallback className="bg-[#28b4b4] text-white font-medium">
                {getUserInitials(user?.displayName, user?.email)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900">
                {user?.displayName || 'User'}
              </p>
              <p className="text-xs text-gray-500">
                {user?.email}
              </p>
            </div>
          </div>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
              <Link 
                href="/auth/profile"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setShowUserMenu(false)}
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Link>
              <Link 
                href="/lettersystem/settings"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setShowUserMenu(false)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
              <hr className="my-1" />
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  handleLogout();
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
};

export default TopNavigation;