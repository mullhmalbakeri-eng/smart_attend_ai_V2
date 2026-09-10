"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, 
  FileText, 
  Settings, 
  LogOut, 
  LayoutDashboard,
  UserCheck
} from 'lucide-react';

const menuItems = [
  {
    name: 'لوحة التحكم',
    description: 'نظرة عامة على النظام',
    href: '/dashboard',
    icon: LayoutDashboard,
    adminOnly: true
  },
  {
    name: 'الموظفين',
    description: 'إدارة الموظفين والصلاحيات',
    href: '/dashboard/users',
    icon: Users,
    adminOnly: true
  },
  {
    name: 'شاشة الحضور الحية',
    description: 'مراقبة الحضور بشكل مباشر',
    href: '/dashboard/live-monitor',
    icon: UserCheck,
    adminOnly: false
  },
  {
    name: 'التقارير',
    description: 'عرض التقارير والإحصائيات',
    href: '/dashboard/reports',
    icon: FileText,
    adminOnly: false
  },
  {
    name: 'الإعدادات',
    description: 'إعدادات النظام',
    href: '/dashboard/settings',
    icon: Settings,
    adminOnly: true
  }
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const userData = localStorage.getItem('user');
    const storedRole = localStorage.getItem('userRole');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserRole(user?.role || storedRole);
      } catch (error) {
        console.error('Failed to parse user data:', error);
        setUserRole(storedRole);
      }
    } else {
      setUserRole(storedRole);
    }
  }, []);

  // Static placeholder to prevent React freeze on mobile
  if (!mounted) {
    return <div className="w-72 h-screen bg-[#1e293b]" />;
  }

  return (
    <>
      {/* Sidebar Overlay for mobile */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={onToggle}
        />
      )}

      {/* Single Sidebar - Right Side with ODOO Deep Navy */}
      <aside className={`
        fixed top-0 right-0 h-full w-72 bg-[#1e293b] z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        lg:translate-x-0
        md:translate-x-full
      `}>
        
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">شركة الاتحاد</h2>
              <p className="text-sm text-slate-400">Smart Attend AI</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              // RBAC: Hide admin-only items for non-admin users
              if (item.adminOnly && userRole !== "ADMIN") {
                return null;
              }
              
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => {
                      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                        onToggle();
                      }
                    }}
                    className={`
                      flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200
                      ${isActive 
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                      }
                    `}
                  >
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center
                      ${isActive 
                        ? 'bg-white/20' 
                        : 'bg-slate-600'
                      }
                    `}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs opacity-75">{item.description}</p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer - User Profile */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">A</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">مدير النظام</p>
              <p className="text-xs text-slate-400">admin@etihad.com</p>
            </div>
          </div>
          <Link
            href="/login"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-700 hover:text-white transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>تسجيل الخروج</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
