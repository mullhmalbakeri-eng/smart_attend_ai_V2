"use client";

import { ReactNode, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/layout/sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [companyName, setCompanyName] = useState<string>("شركة الاتحاد");

  useEffect(() => {
    const role = localStorage.getItem('userRole') || "";
    setUserRole(role.toUpperCase());
    
    // Load company name
    const loadCompanyName = async () => {
      try {
        const response = await fetch('/api/company-settings');
        if (response.ok) {
          const data = await response.json();
          if (data.settings?.companyName) {
            setCompanyName(data.settings.companyName);
          }
        }
      } catch (error) {
        console.error('Failed to load company name:', error);
      }
    };
    
    loadCompanyName();
  }, []);

  // Redirect non-admins from dashboard routes
  useEffect(() => {
    if (userRole && userRole !== "ADMIN") {
      // If user is not admin and trying to access dashboard routes, redirect to scan
      if (pathname === '/dashboard' || pathname.startsWith('/dashboard/') && pathname !== '/dashboard/scan') {
        router.push('/dashboard/scan');
      }
    }
  }, [userRole, pathname, router]);

  return (
    <div className="min-h-screen">
      {/* Mobile Menu Button - Only show when sidebar is closed and user is admin */}
      {userRole === "ADMIN" && !isSidebarOpen && (
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 bg-slate-800 rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors"
          >
            <div className="w-6 h-6 flex flex-col justify-center gap-1">
              <div className="w-6 h-0.5 bg-white"></div>
              <div className="w-6 h-0.5 bg-white"></div>
              <div className="w-6 h-0.5 bg-white"></div>
            </div>
          </button>
        </div>
      )}

      {/* Desktop Layout - Only for Admins */}
      {userRole === "ADMIN" && (
        <div className="hidden lg:grid grid-cols-[280px_1fr] min-h-screen">
          {/* Fixed Sidebar - 280px width, full height */}
          <div className="h-screen bg-zinc-950 border-l border-zinc-800">
            <Sidebar isOpen={true} onToggle={() => {}} />
          </div>
          
          {/* Main Content - flexible width with high contrast */}
          <div className="bg-white overflow-y-auto">
            {/* Header with Company Name */}
            <div className="bg-white border-b border-zinc-200 px-8 py-4">
              <h1 className="text-2xl font-bold text-zinc-900">{companyName}</h1>
              <p className="text-sm text-zinc-600">نظام إدارة الحضور الذكي</p>
            </div>
            
            {/* Page Content */}
            <div className="p-8">
              {children}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Layout - Admin or Employee */}
      {(userRole === "ADMIN" || userRole === "EMPLOYEE") && (
        <div className="lg:hidden">
          {/* Mobile Header */}
          <div className="bg-slate-900 border-b border-slate-700 px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-white">{companyName}</h1>
                <p className="text-xs text-slate-400">نظام إدارة الحضور الذكي</p>
              </div>
              
              {/* Menu button for admin */}
              {userRole === "ADMIN" && (
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 bg-slate-800 rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors"
                >
                  <div className="w-5 h-5 flex flex-col justify-center gap-1">
                    <div className="w-5 h-0.5 bg-white"></div>
                    <div className="w-5 h-0.5 bg-white"></div>
                    <div className="w-5 h-0.5 bg-white"></div>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Sidebar Overlay */}
          {userRole === "ADMIN" && isSidebarOpen && (
            <div className="fixed inset-0 z-50 flex">
              <div className="fixed inset-0 bg-black/50" onClick={() => setIsSidebarOpen(false)} />
              <div className="relative w-80 h-full bg-zinc-950 border-l border-zinc-800">
                <Sidebar isOpen={true} onToggle={() => setIsSidebarOpen(false)} />
              </div>
            </div>
          )}

          {/* Mobile Content */}
          <div className="min-h-screen bg-slate-900">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
