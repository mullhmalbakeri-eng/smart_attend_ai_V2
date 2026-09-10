"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, UserCheck, ClipboardCheck, Plus, FileText, Activity, RefreshCw } from "lucide-react";
import IDCardModal from "@/app/dashboard/components/IDCardModal";
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function Dashboard() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [swrError, setSwrError] = useState<string | null>(null);

  // Fix: Always set mounted after delay to ensure client-side hydration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
      setLastRefresh(new Date());
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Stable SWR configuration - DISABLE AUTO REFRESH
  const { data: stats, error, isLoading, mutate } = useSWR(
    isMounted ? '/api/dashboard/stats' : null, 
    fetcher, 
    {
      refreshInterval: 0, // Disable auto-refresh
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 1 minute deduping
      onSuccess: () => {
        setLastRefresh(new Date());
        setSwrError(null);
      },
      onError: (err) => {
        setSwrError("فشل تحديث الإحصائيات");
        console.error("Dashboard error:", err);
      }
    }
  );

  const handleAddEmployee = () => {
    if (isMounted) {
      router.push('/dashboard/users');
    }
  };

  const handleRefresh = async () => {
    if (!isMounted) return;
    await mutate();
    setLastRefresh(new Date());
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg text-slate-900">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen p-6 md:p-8">
      {/* Error Message */}
      {swrError && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">⚠️ {swrError}</p>
          <p className="text-sm text-yellow-600 mt-1">جرب تحديث الصفحة</p>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1e293b] mb-2">لوحة التحكم</h1>
        <p className="text-[#475569]">نظرة عامة على إحصائيات الحضور والنشاط</p>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-50 relative z-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          تحديث البيانات
        </button>
      </div>

      {/* Last Refresh Time */}
      <div className="text-left text-sm text-[#475569] mb-8">
        آخر تحديث: {lastRefresh.toLocaleTimeString('ar-EG')}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">إجمالي الموظفين</p>
              <p className="text-3xl font-bold text-slate-900">
                {stats?.totalEmployees || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">الحضور اليوم</p>
              <p className="text-3xl font-bold text-green-600">
                {stats?.presentToday || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">الغياب اليوم</p>
              <p className="text-3xl font-bold text-red-600">
                {stats?.absentToday || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
              <ClipboardCheck className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">معدل الحضور</p>
              <p className="text-3xl font-bold text-slate-900">
                {stats?.attendanceToday || 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="mt-10">
        <h2 className="text-xl font-bold text-[#1e293b] mb-4">الإجراءات السريعة</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button 
            onClick={handleAddEmployee}
            className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 text-right"
          >
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-100 rounded-xl">
                <Plus className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1e293b]">إضافة موظف جديد</h3>
                <p className="text-sm text-[#475569] mt-1">تسجيل موظف في النظام</p>
              </div>
            </div>
          </button>
          
          <button 
            onClick={() => router.push('/dashboard/scan')}
            className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 text-right"
          >
            <div className="flex items-center gap-4">
              <div className="p-4 bg-green-100 rounded-xl">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1e293b]">تسجيل حضور</h3>
                <p className="text-sm text-[#475569] mt-1">مسح QR أو تسجيل يدوي</p>
              </div>
            </div>
          </button>
          
          <button 
            onClick={() => router.push('/dashboard/reports')}
            className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 text-right"
          >
            <div className="flex items-center gap-4">
              <div className="p-4 bg-amber-100 rounded-xl">
                <FileText className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1e293b]">التقارير</h3>
                <p className="text-sm text-[#475569] mt-1">عرض وتحميل التقارير</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* ID Card Modal */}
    </div>
  );
}
