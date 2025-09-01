// src/components/layout/TopNavigation.js
"use client"

import { Menu, Bell, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SidebarContent } from './Sidebar';

const TopNavigation = () => {
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
          <div className="w-8 h-8 bg-[#28b4b4] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <span className="hidden sm:block text-lg font-semibold text-gray-900">
            LetterMS
          </span>
        </div>
      </div>

      {/* Center Section - Page Title */}
      <div className="hidden md:block">
        <h1 className="text-lg font-semibold text-gray-900">
          Letter Management System
        </h1>
      </div>

      {/* Right Section - Actions & Profile */}
      <div className="flex items-center space-x-3">
        {/* Settings */}
        <Button variant="ghost" size="sm" className="hover:bg-gray-100">
          <Settings className="h-4 w-4 text-gray-600" />
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative hover:bg-gray-100">
          <Bell className="h-4 w-4 text-gray-600" />
          <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full animate-pulse"></span>
        </Button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-300"></div>

        {/* User Profile */}
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8 border-2 border-gray-200">
            <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
            <AvatarFallback className="bg-[#28b4b4] text-white font-medium">
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