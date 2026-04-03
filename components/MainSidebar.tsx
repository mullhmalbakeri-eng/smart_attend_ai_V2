'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Building2, 
  Activity,
  Settings,
  FileText,
  LogOut,
  Menu,
  X
} from 'lucide-react';

interface SidebarItem {
  icon: any;
  label: string;
  href: string;
  active?: boolean;
}

export default function MainSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const sidebarItems: SidebarItem[] = [
    { icon: Users, label: 'الموظفين', href: '/dashboard/employees', active: true },
    { icon: Activity, label: 'سجل الحضور', href: '/dashboard/attendance' },
    { icon: FileText, label: 'التقارير', href: '/dashboard/reports' },
    { icon: Settings, label: 'الإعدادات', href: '/dashboard/settings' },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-slate-800 rounded-lg border border-slate-700"
      >
        <Menu className="h-5 w-5 text-slate-50" />
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
            />
            
            {/* Sidebar Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed inset-y-0 left-0 z-50 w-64 lg:static lg:inset-0"
            >
              <div className="h-full bg-slate-900 border-r border-slate-800">
                {/* Header */}
                <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h1 className="text-lg font-bold text-slate-50">شركة الاتحاد</h1>
                      <p className="text-xs text-slate-400">Smart Attend AI</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="lg:hidden text-slate-400 hover:text-slate-50"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-6 space-y-1">
                  {sidebarItems.map((item, index) => (
                    <a
                      key={index}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center space-x-3 space-x-reverse px-3 py-2 rounded-lg transition-all duration-200 ${
                        item.active
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-50'
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </a>
                  ))}
                </nav>

                {/* User Section */}
                <div className="border-t border-slate-800 p-4">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-white">م</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-50 truncate">مدير النظام</p>
                      <p className="text-xs text-slate-400 truncate">admin@etihad.com</p>
                    </div>
                    <button className="text-slate-400 hover:text-slate-50 transition-colors">
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar (Always Visible) */}
      <div className="hidden lg:flex h-full">
        <div className="h-full bg-slate-900 border-r border-slate-800">
          {/* Header */}
          <div className="flex h-16 items-center justify-center px-6 border-b border-slate-800">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-50">شركة الاتحاد</h1>
                <p className="text-xs text-slate-400">Smart Attend AI</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1">
            {sidebarItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className={`flex items-center space-x-3 space-x-reverse px-3 py-2 rounded-lg transition-all duration-200 ${
                  item.active
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-50'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </a>
            ))}
          </nav>

          {/* User Section */}
          <div className="border-t border-slate-800 p-4">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">م</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-50 truncate">مدير النظام</p>
                <p className="text-xs text-slate-400 truncate">admin@etihad.com</p>
              </div>
              <button className="text-slate-400 hover:text-slate-50 transition-colors">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
