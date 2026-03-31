"use client";

import { Users, UserCheck, ClipboardCheck, Plus, FileText, Activity, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import IDCardModal from "@/app/dashboard/components/IDCardModal";
import { useToast } from "@/components/ui/toast";
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function Dashboard() {
  const router = useRouter();
  const { addToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Use SWR to poll attendance stats every 5 seconds
  const { data: stats, error, isLoading } = useSWR(
    '/api/dashboard/stats',
    fetcher,
    {
      refreshInterval: 5000, // Poll every 5 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true
    }
  );

  // Manual refresh function
  const handleRefresh = () => {
    setLastRefresh(new Date());
    // SWR will automatically revalidate
  };

  useEffect(() => {
    if (error) {
      addToast({ 
        title: "خطأ", 
        description: "فشل تحديث الإحصائيات", 
        type: "error" 
      });
    }
  }, [error, addToast]);

  return (
    <div className="p-10 space-y-8 fade-in">
      {/* Page Header with Refresh */}
      <div className="flex items-center justify-between">
        <div className="text-right">
          <h1 className="text-5xl font-black text-gradient">لوحة التحكم</h1>
          <p className="text-xl text-gray-600 mt-3">مرحباً بك في نظام الحضور الذكي</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>تحديث</span>
        </button>
      </div>

      {/* Last Refresh Time */}
      <div className="text-left text-sm text-gray-500">
        آخر تحديث: {lastRefresh.toLocaleTimeString('ar-EG')}
      </div>

      {/* Stats Cards Grid - 4 cards in one container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Employees Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-2 left-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <div className="flex items-center justify-between mb-6">
            <div className="p-4 bg-blue-100 rounded-xl">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">إجمالي</span>
          </div>
          <p className="text-5xl font-extrabold text-gray-900">
            {isLoading ? (
              <span className="animate-pulse">...</span>
            ) : (
              stats?.totalEmployees || 0
            )}
          </p>
          <p className="text-lg font-bold text-gray-700 mt-2">الموظفين</p>
        </div>
        
        {/* Present Today Card - Real-time from database */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-2 left-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <div className="flex items-center justify-between mb-6">
            <div className="p-4 bg-green-100 rounded-xl">
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">اليوم</span>
          </div>
          <p className="text-5xl font-extrabold text-gray-900">
            {isLoading ? (
              <span className="animate-pulse">...</span>
            ) : (
              stats?.presentToday || 0
            )}
          </p>
          <p className="text-lg font-bold text-gray-700 mt-2">الحاضرين</p>
        </div>
        
        {/* Departments Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-2 left-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <div className="flex items-center justify-between mb-6">
            <div className="p-4 bg-amber-100 rounded-xl">
              <ClipboardCheck className="w-8 h-8 text-amber-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">نشطة</span>
          </div>
          <p className="text-5xl font-extrabold text-gray-900">
            {isLoading ? (
              <span className="animate-pulse">...</span>
            ) : (
              stats?.activeDepartments || 0
            )}
          </p>
          <p className="text-lg font-bold text-gray-700 mt-2">الأقسام</p>
        </div>
        
        {/* Attendance Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-2 left-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <div className="flex items-center justify-between mb-6">
            <div className="p-4 bg-purple-100 rounded-xl">
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">سجل</span>
          </div>
          <p className="text-5xl font-extrabold text-gray-900">
            {isLoading ? (
              <span className="animate-pulse">...</span>
            ) : (
              stats?.attendanceToday || 0
            )}
          </p>
          <p className="text-lg font-bold text-gray-700 mt-2">الحضور اليوم</p>
        </div>
      </div>

      {/* Quick Actions Cards - Maximum separation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div 
          onClick={() => setShowModal(true)}
          className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105"
        >
          <div className="flex items-center gap-6">
            <div className="p-6 bg-blue-50 rounded-xl">
              <Plus className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-right flex-1">
              <h3 className="text-xl font-black text-gray-900">إضافة موظف جديد</h3>
              <p className="text-base text-gray-600 mt-2">تسجيل موظف جديد في النظام</p>
            </div>
          </div>
        </div>
        
        <div 
          onClick={() => router.push('/dashboard/attendance')}
          className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105"
        >
          <div className="flex items-center gap-6">
            <div className="p-6 bg-green-50 rounded-xl">
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-right flex-1">
              <h3 className="text-xl font-black text-gray-900">تسجيل حضور</h3>
              <p className="text-base text-gray-600 mt-2">مسح QR Code أو تسجيل يدوي</p>
            </div>
          </div>
        </div>
        
        <div 
          onClick={() => router.push('/dashboard/reports')}
          className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105"
        >
          <div className="flex items-center gap-6">
            <div className="p-6 bg-amber-50 rounded-xl">
              <FileText className="w-8 h-8 text-amber-600" />
            </div>
            <div className="text-right flex-1">
              <h3 className="text-xl font-black text-gray-900">تقارير اليوم</h3>
              <p className="text-base text-gray-600 mt-2">عرض تقارير الحضور</p>
            </div>
          </div>
        </div>
      </div>

      {/* ID Card Modal */}
      {showModal && (
        <IDCardModal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)} 
          user={null}
        />
      )}
    </div>
  );
}
