// src/components/layout/TopNavigation.js
"use client"

import { useState } from 'react';
import { Menu, Bell, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Sidebar from './Sidebar';

const TopNavigation = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200">
      {/* Left Section - Mobile Menu & Search */}
      <div className="flex items-center space-x-4">
        {/* Mobile Menu Button */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar />
          </SheetContent>
        </Sheet>

        {/* Search Bar */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search letters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Center Section - Page Title */}
      <div className="hidden md:block">
        <h1 className="text-lg font-semibold text-gray-900">
          Letter Management
        </h1>
      </div>

      {/* Right Section - Notifications & Profile */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
        </Button>

        {/* User Profile */}
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
            <AvatarFallback className="bg-primary-100 text-primary-700">
              R
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900">Receptionist</p>
            <p className="text-xs text-gray-500">receptionist@company.com</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavigation;