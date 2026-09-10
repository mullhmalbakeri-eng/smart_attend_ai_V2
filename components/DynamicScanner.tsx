"use client";

import { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { RefreshCw, Users, UserX, AlertCircle, Activity } from 'lucide-react';

interface AttendanceStats {
  presentToday: number;
  absentToday: number;
  lateToday: number;
  totalEmployees: number;
  recentCheckIns: Array<{
    id: string;
    userName: string;
    department: string;
    time: string;
    type: string;
  }>;
}

export default function DynamicScanner({ className = "" }: { className?: string }) {
  const [token, setToken] = useState<string>('');
  const [stats, setStats] = useState<AttendanceStats>({
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
    totalEmployees: 0,
    recentCheckIns: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [tokenError, setTokenError] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  // Prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchToken = useCallback(async () => {
    setIsLoading(true);
    setTokenError('');
    try {
      const response = await fetch('/api/attendance/generate-token');
      
      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          setToken(data.token);
        } else {
          setTokenError('No token received');
        }
      } else {
        setTokenError('Failed to generate token');
      }
    } catch (error) {
      console.error('Error fetching token:', error);
      setTokenError('Network error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats({
          presentToday: data.presentToday || 0,
          absentToday: data.absentToday || 0,
          lateToday: data.lateToday || 0,
          totalEmployees: data.totalEmployees || 0,
          recentCheckIns: data.recentCheckIns || []
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Initial fetch
    fetchToken();
    fetchStats();

    const statsInterval = setInterval(fetchStats, 5000);
    const tokenInterval = setInterval(fetchToken, 10000);

    return () => {
      clearInterval(statsInterval);
      clearInterval(tokenInterval);
    };
  }, [mounted, fetchToken, fetchStats]);

  if (!mounted) {
    return (
      <div className={`bg-[#f8fafc] min-h-screen p-8 ${className}`}>
        <div className="flex items-center justify-center h-full">
          <div className="text-[#475569]">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#f8fafc] min-h-screen p-8 ${className}`}>
      <div className="text-right mt-10">
        <h1 className="text-5xl font-black text-[#1e293b]">المراقب المباشر</h1>
        <p className="text-xl text-[#475569] mt-3">شاشة عرض الباركود لتسجيل الحضور</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 flex items-center justify-between">
          <div>
            <p className="text-green-600 text-lg font-bold">الحاضرون اليوم</p>
            <p className="text-4xl font-bold text-green-700">{stats.presentToday}</p>
          </div>
          <Users className="w-10 h-10 text-green-600" />
        </div>

        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 flex items-center justify-between">
          <div>
            <p className="text-red-600 text-lg font-bold">الغائبون اليوم</p>
            <p className="text-4xl font-bold text-red-700">{stats.absentToday}</p>
          </div>
          <UserX className="w-10 h-10 text-red-600" />
        </div>

        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 flex items-center justify-between">
          <div>
            <p className="text-amber-600 text-lg font-bold">المتأخرون اليوم</p>
            <p className="text-4xl font-bold text-amber-700">{stats.lateToday}</p>
          </div>
          <AlertCircle className="w-10 h-10 text-amber-600" />
        </div>

        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 flex items-center justify-between">
          <div>
            <p className="text-blue-600 text-lg font-bold">إجمالي الموظفين</p>
            <p className="text-4xl font-bold text-blue-700">{stats.totalEmployees}</p>
          </div>
          <Activity className="w-10 h-10 text-blue-600" />
        </div>
      </div>

      <div className="flex flex-col items-center mt-8">
        <div className="relative">
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-8 max-w-[450x]">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              {token ? (
                <QRCodeSVG
                  value={token}
                  size={450}
                  level="H"
                  includeMargin={true}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] text-center">
                  <p className="text-blue-600 animate-pulse mb-2">
                    {isLoading ? 'جاري توليد الكود...' : 'فشل تحميل الكود'}
                  </p>
                  {tokenError && (
                    <p className="text-red-500 text-sm">{tokenError}</p>
                  )}
                  {!isLoading && !token && (
                    <button
                      onClick={fetchToken}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      إعادة المحاولة
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={fetchToken}
            disabled={isLoading}
            className="flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-bold text-lg rounded-lg transition-colors shadow-lg"
          >
            <RefreshCw className={`w-6 h-6 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'جاري التحديث...' : 'تحديث الكود'}</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-bold mb-6 text-[#1e293b]">تسجيلات الدخول المباشرة</h2>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {stats.recentCheckIns.map((checkIn, index: number) => (
            <div
              key={checkIn.id}
              className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
            >
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                  <p className="font-bold text-[#1e293b] text-lg">{checkIn.userName}</p>
                  <p className="text-[#475569]">{checkIn.department}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-blue-600 font-medium">{checkIn.time}</p>
                <p className="text-slate-500 text-sm">{checkIn.type}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
