"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, LogOut, User } from "lucide-react";

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [employeeName, setEmployeeName] = useState<string>("");

  // Get employee data from session/localStorage
  useState(() => {
    const name = localStorage.getItem('employeeName') || "الموظف";
    setEmployeeName(name);
  });

  const handleLogout = () => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('employeeName');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white" style={{ fontFamily: "Cairo, Tajawal, sans-serif" }}>
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">مرحباً بك يا {employeeName}</h1>
                <p className="text-sm text-slate-400">نظام الحضور الذكي</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 rounded-xl transition-all duration-200"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span className="text-red-400">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-3xl p-8 border border-slate-700">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">مسح الباركود لتسجيل الحضور</h2>
            <p className="text-slate-300">استخدم الكاميرا لتسجيل دخولك أو خروجك</p>
          </div>
          
          {/* QR Scanner will be rendered here */}
          <div className="flex items-center justify-center">
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-slate-800/50 backdrop-blur-sm border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <p className="text-center text-slate-400 text-sm">
            © 2024 نظام الحضور الذكي - جميع الحقوق محفوظة
          </p>
        </div>
      </footer>
    </div>
  );
}
