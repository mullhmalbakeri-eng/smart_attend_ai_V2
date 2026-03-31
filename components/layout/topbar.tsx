"use client";
import { Sun, Moon, User, LogOut, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function Topbar() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleLogout = () => {
    router.push("/login");
  };

  return (
    <header className="h-20 flex items-center justify-between px-8 bg-white border-b border-gray-200 shadow-sm">
      {/* Search Bar */}
      <div className="flex items-center flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="بحث..."
            className="w-full pr-12 pl-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>
      
      {/* User Actions */}
      <div className="flex items-center space-x-6">
        {/* User Info */}
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
            A
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-gray-900">Admin User</p>
            <p className="text-xs text-gray-500">مدير النظام</p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <Button 
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline text-sm font-medium">خروج</span>
          </Button>
          
          <Button 
            onClick={toggleTheme} 
            variant="outline"
            className="p-3 rounded-xl hover:bg-gray-100 transition-all duration-200 border-gray-300"
            aria-label="Toggle theme"
          >
            <Moon className="h-5 w-5 text-gray-600" />
          </Button>
        </div>
      </div>
    </header>
  );
}
