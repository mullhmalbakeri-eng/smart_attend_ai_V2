"use client";

import { Users, UserCheck, ClipboardCheck, Plus, FileText, Activity, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function Dashboard() {
  const router = useRouter();
  const { addToast } = useToast();
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    setLastRefresh(new Date());
  }, []);

  const { data: stats, error, isLoading, mutate } = useSWR('/api/dashboard/stats', fetcher, {
    refreshInterval: 30000,
    onSuccess: () => {
      setLastRefresh(new Date());
    }
  });

  if (error) {
    addToast({ 
      title: "خطأ", 
      description: "فشل تحديث الإحصائيات", 
      type: "error" 
    });
  }

  const handleAddEmployee = () => {
    router.push('/dashboard/users');
  };

  const handleRefresh = async () => {
    await mutate();
    setLastRefresh(new Date());
  };

  return (
    <div className="bg-[#f8fafc]">
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

      {/* Quick Actions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={handleAddEmployee}
          className="bg-white border border-slate-200 rounded-lg shadow-sm p-8 cursor-pointer hover:shadow-md transition-shadow relative z-50"
        >
          <div className="flex items-center gap-6">
            <div className="p-6 bg-blue-50 rounded-xl">
              <Plus className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-right flex-1">
              <h3 className="text-xl font-black text-[#1e293b]">إضافة موظف جديد</h3>
              <p className="text-base text-[#475569] mt-2">تسجيل موظف جديد في النظام</p>
            </div>
          </div>
        </div>
        
        <div 
          onClick={() => router.push('/dashboard/scan')}
          className="bg-white border border-slate-200 rounded-lg shadow-sm p-8 cursor-pointer hover:shadow-md transition-shadow relative z-50"
        >
          <div className="flex items-center gap-6">
            <div className="p-6 bg-green-50 rounded-xl">
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-right flex-1">
              <h3 className="text-xl font-black text-[#1e293b]">تسجيل حضور</h3>
              <p className="text-base text-[#475569] mt-2">مسح QR Code أو تسجيل يدوي</p>
            </div>
          </div>
        </div>
        
        <div 
          onClick={() => router.push('/dashboard/reports')}
          className="bg-white border border-slate-200 rounded-lg shadow-sm p-8 cursor-pointer hover:shadow-md transition-shadow relative z-50"
        >
          <div className="flex items-center gap-6">
            <div className="p-6 bg-amber-50 rounded-xl">
              <FileText className="w-8 h-8 text-amber-600" />
            </div>
            <div className="text-right flex-1">
              <h3 className="text-xl font-black text-[#1e293b]">التقارير</h3>
              <p className="text-base text-[#475569] mt-2">عرض وتحميل التقارير</p>
            </div>
          </div>
        </div>
      </div>

      {/* ID Card Modal */}
    </div>
  );
}
