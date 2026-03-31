"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Users, 
  QrCode, 
  ClipboardList,
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    const role = localStorage.getItem('userRole') || "";
    setUserRole(role.toUpperCase());
  }, []);

  // Hide sidebar completely for employees (not admins)
  if (userRole && userRole !== "ADMIN") {
    return null;
  }

  const menuItems = [
    { 
      name: "لوحة التحكم", 
      href: "/dashboard", 
      icon: LayoutDashboard,
      description: "نظرة عامة على الإحصائيات"
    },
    { 
      name: "إدارة الموظفين", 
      href: "/dashboard/users", 
      icon: Users,
      description: "إدارة بيانات الموظفين"
    },
    { 
      name: "شاشة الحضور الحية", 
      href: "/dashboard/live-monitor", 
      icon: QrCode,
      description: "عرض الباركود المباشر"
    },
    { 
      name: "سجل التقارير", 
      href: "/dashboard/reports", 
      icon: ClipboardList,
      description: "تقارير الحضور والانصراف"
    },
    { 
      name: "الإعدادات", 
      href: "/dashboard/settings", 
      icon: Settings,
      description: "إعدادات النظام والشركة"
    },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-slate-800 rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors"
      >
        {isOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
      </button>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 right-0 h-full w-72 bg-gradient-to-b from-slate-900 to-slate-950 border-l border-slate-800 z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        lg:translate-x-0 lg:static lg:z-0
      `}>
        
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">نظام الحضور</h2>
              <p className="text-sm text-slate-400">Smart Attendance</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <li key={item.href}>
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
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25' 
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }
                    `}
                  >
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center
                      ${isActive 
                        ? 'bg-white/20' 
                        : 'bg-slate-800/50'
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

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800">
          <Link
            href="/login"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>تسجيل الخروج</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
