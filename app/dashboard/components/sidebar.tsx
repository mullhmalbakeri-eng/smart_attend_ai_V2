"use client";

import { Button } from "@/components/ui/button";
import { UserIcon, Building2, CalendarIcon, SunIcon, MoonIcon } from "lucide-react";

interface Props {
  activePage: "users" | "departments" | "attendance";
  setActivePage: (page: "users" | "departments" | "attendance") => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export default function Sidebar({
  activePage,
  setActivePage,
  darkMode,
  toggleDarkMode,
}: Props) {
  return (
    <aside 
      className="h-screen w-64 flex flex-col border-r shadow-sm bg-white border-gray-200 sidebar-container dark:bg-slate-900 dark:border-slate-700"
    >
      <h2 
        className="text-xl font-bold mb-6 p-4 text-gray-900 dark:text-white"
      >
        SmartAttend
      </h2>

      <nav className="flex flex-col space-y-2 px-3">
        <div
          onClick={() => setActivePage("users")}
          className={`flex items-center p-3 my-1 font-medium rounded-md cursor-pointer transition-colors text-gray-600 hover:bg-gray-50 dark:text-white dark:hover:bg-slate-700 ${activePage === "users" ? "bg-slate-200 dark:bg-slate-800" : ""}`}
        >
          <UserIcon className="w-4 h-4 mr-3" />
          Users
        </div>

        <div
          onClick={() => setActivePage("departments")}
          className={`flex items-center p-3 my-1 font-medium rounded-md cursor-pointer transition-colors text-gray-600 hover:bg-gray-50 dark:text-white dark:hover:bg-slate-700 ${activePage === "departments" ? "bg-slate-200 dark:bg-slate-800" : ""}`}
        >
          <Building2 className="w-4 h-4 mr-3" />
          Departments
        </div>

        <div
          onClick={() => setActivePage("attendance")}
          className={`flex items-center p-3 my-1 font-medium rounded-md cursor-pointer transition-colors text-gray-600 hover:bg-gray-50 dark:text-white dark:hover:bg-slate-700 ${activePage === "attendance" ? "bg-slate-200 dark:bg-slate-800" : ""}`}
        >
          <CalendarIcon className="w-4 h-4 mr-3" />
          Attendance
        </div>
      </nav>

      <div className="mt-auto p-3">
        <Button 
          variant="outline" 
          onClick={toggleDarkMode} 
          className="w-full justify-start text-gray-600 hover:bg-gray-50 dark:text-white dark:hover:bg-slate-700"
        >
          {darkMode ? (
            <>
              <SunIcon className="w-4 h-4 mr-2" />
              Light Mode
            </>
          ) : (
            <>
              <MoonIcon className="w-4 h-4 mr-2" />
              Dark Mode
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}