// src/components/layout/Sidebar.js
"use client"

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { FileText, Plus, Mail, Menu, LayoutDashboard, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const Sidebar = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/lettersystem',
      icon: LayoutDashboard,
    },
    {
      name: 'Add Letter',
      href: '/lettersystem/add-letter',
      icon: Plus,
    },
    {
      name: 'Letters',
      href: '/lettersystem/letters',
      icon: FileText,
    },
  ];

  const isActive = (href) => {
    return pathname === href;
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white border border-gray-200"
      >
        <Menu className="h-6 w-6 text-gray-600" />
      </button>

      {/* Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 flex flex-col w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out z-40 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Logo/Brand Section */}
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Mail className="h-8 w-8 text-[#28b4b4]" />
            <span className="text-xl font-semibold text-gray-900">
              LetterMS
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link key={item.name} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant={active ? "default" : "ghost"}
                    className={`w-full justify-start h-12 text-left rounded-md ${
                      active
                        ? 'bg-[#28b4b4] text-white hover:bg-[#28b4b4]/90'
                        : 'text-black hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`mr-3 h-5 w-5 ${active ? 'text-white' : 'text-black'}`} />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-black text-center">
            Letter Management System
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;