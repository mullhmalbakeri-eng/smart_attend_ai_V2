"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/layout/sidebar";
import { ToastProvider } from "@/components/ui/toast";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const userData = localStorage.getItem("user");
    const storedRole = localStorage.getItem("userRole");
    if (!userData) {
      setUserRole(storedRole);
      return;
    }
    try {
      const user = JSON.parse(userData);
      setUserRole(user?.role || storedRole);
    } catch {
      setUserRole(storedRole);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (userRole && userRole.toUpperCase() !== "ADMIN") {
      if (pathname !== '/dashboard/scan') {
        router.push('/dashboard/scan');
      }
    }
  }, [mounted, userRole, pathname, router]);

  // إخفاء الـ Sidebar تماماً على صفحة الـ scan للموظفين
  const isEmployeeScanPage = pathname === '/dashboard/scan' && 
    userRole?.toUpperCase() !== 'ADMIN';

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-lg text-slate-900">جاري التحميل...</div>
      </div>
    );
  }

  // Layout للموظف — بدون sidebar
  if (isEmployeeScanPage) {
    return (
      <div className="min-h-screen bg-[#f8fafc] w-full">
        {children}
      </div>
    );
  }

  // Layout للـ Admin — مع sidebar
  return (
    <ToastProvider>
      <div className="flex h-screen w-full bg-white overflow-hidden text-slate-900">
        {/* Sidebar — Desktop فقط */}
        <div className="hidden md:flex w-72 flex-shrink-0 z-50 no-print">
          <Sidebar isOpen={true} onToggle={() => setSidebarOpen(false)} />
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute right-0 top-0 h-full w-72 bg-white z-50">
              <Sidebar isOpen={true} onToggle={() => setSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-white relative">
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-200 bg-white sticky top-0 z-40">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="font-bold text-slate-900">Smart Attend AI</span>
            <div className="w-10" />
          </div>

          <div className="p-4 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}