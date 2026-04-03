"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

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
    // Redirect non-admin users from admin routes
    if (userRole && userRole.toUpperCase() !== "ADMIN") {
      if (pathname === '/dashboard' || pathname.startsWith('/dashboard/') && pathname !== '/dashboard/scan') {
        router.push('/dashboard/scan');
      }
    }
  }, [mounted, userRole, pathname, router]);

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] overflow-hidden text-slate-900">
      {/* Main Content Area with proper spacing for sidebar */}
      <div className="flex-1 overflow-y-auto p-8 bg-[#f8fafc]">
        <main>{children}</main>
      </div>
      
      {/* Single Sidebar - Right Side Only */}
      <div className="w-[288px] flex-shrink-0">
        {mounted ? <Sidebar isOpen={true} onToggle={() => {}} /> : null}
      </div>
    </div>
  );
}
