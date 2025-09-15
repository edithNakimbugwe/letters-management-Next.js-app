"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Plus, Mail, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export function SidebarContent() {
  const pathname = usePathname();
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.role === 'admin';

  const navigationItems = [
    { name: 'Dashboard', href: '/lettersystem', icon: LayoutDashboard },
    { name: 'Add Letter', href: '/lettersystem/add-letter', icon: Plus },
    { name: 'Letters', href: '/lettersystem/letters', icon: FileText },
    // Only show to admins:
    ...(isAdmin ? [
      { name: 'Bureaus', href: '/lettersystem/bureaus', icon: Mail },
      { name: 'Users & Roles', href: '/lettersystem/users', icon: FileText },
    ] : []),
  ];

  const isActive = (href) => pathname === href;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <Mail className="h-8 w-8 text-[#28b4b4]" />
        <span className="ml-2 text-xl font-semibold text-gray-900">
          LetterMS
        </span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigationItems.map(({ name, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={name}
              href={href}
            >
              <Button
                variant={active ? "default" : "ghost"}
                className={`w-full justify-start h-12 text-left rounded-md ${
                  active
                    ? 'bg-[#28b4b4] text-white hover:bg-[#28b4b4]/90'
                    : 'text-black hover:bg-gray-50'
                }`}
              >
                <Icon
                  className={`mr-3 h-5 w-5 ${
                    active ? 'text-white' : 'text-black'
                  }`}
                />
                {name}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 text-xs text-center text-black">
        Letter Management System
      </div>
    </div>
  );
}

const Sidebar = () => {
  return (
    <div className="relative">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-gray-200 lg:bg-white">
        <SidebarContent />
      </div>
    </div>
  );
};

export default Sidebar;
// Also export SidebarContent for use in TopNavigation
// (named export above)
