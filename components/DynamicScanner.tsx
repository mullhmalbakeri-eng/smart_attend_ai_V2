"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { RefreshCw, Clock, Shield, Users, UserX, AlertCircle, Activity } from "lucide-react";

interface AttendanceStats {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  recentCheckIns: Array<{
    id: number;
    userName: string;
    department: string;
    time: string;
    type: string;
  }>;
}

interface DynamicScannerProps {
  className?: string;
}

export default function DynamicScanner({ className = "" }: DynamicScannerProps) {
  const [token, setToken] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(10);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [stats, setStats] = useState<AttendanceStats>({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
    recentCheckIns: []
  });

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/attendance/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  // Fetch token
  const fetchToken = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      
      const response = await fetch('/api/attendance/generate-token', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch token');
      }
      
      const data = await response.json();
      setToken(data.token);
      setCountdown(10);
      setIsLoading(false);
      
      // Refresh stats after token update
      fetchStats();
    } catch (err) {
      setError("Failed to generate QR code");
      setIsLoading(false);
    }
  }, [fetchStats]);

  useEffect(() => {
    fetchToken();
    fetchStats();
  }, [fetchToken, fetchStats]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchToken();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchToken]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchStats();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchStats]);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) return 10;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const progressPercentage = (countdown / 10) * 100;

  return (
    <div className={`p-10 space-y-8 fade-in bg-white text-gray-900 ${className}`} style={{ fontFamily: 'Cairo, Tajawal, sans-serif' }}>
      <div className="text-right">
        <h1 className="text-5xl font-black text-gradient">المراقب المباشر</h1>
        <p className="text-xl text-gray-600 mt-3">شاشة عرض الباركود لتسجيل الحضور</p>
      </div>

      {/* Top Stat Cards - Professional Design */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-400 text-lg font-bold">الحاضرون اليوم</p>
              <p className="text-4xl font-bold text-green-300">{stats.presentToday}</p>
            </div>
            <Users className="w-10 h-10 text-green-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-red-600/20 to-red-800/20 backdrop-blur-sm border border-red-500/30 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-400 text-lg font-bold">الغائبون اليوم</p>
              <p className="text-4xl font-bold text-red-300">{stats.absentToday}</p>
            </div>
            <UserX className="w-10 h-10 text-red-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-amber-600/20 to-amber-800/20 backdrop-blur-sm border border-amber-500/30 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-400 text-lg font-bold">المتأخرون اليوم</p>
              <p className="text-4xl font-bold text-amber-300">{stats.lateToday}</p>
            </div>
            <AlertCircle className="w-10 h-10 text-amber-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-400 text-lg font-bold">إجمالي الموظفين</p>
              <p className="text-4xl font-bold text-blue-300">{stats.totalEmployees}</p>
            </div>
            <Activity className="w-10 h-10 text-blue-400" />
          </div>
        </motion.div>
      </div>

      {/* Center QR Display - Glassmorphism Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center"
      >
        <div className="relative">
          <motion.div
            animate={{
              boxShadow: [
                "0 0 0 0 rgba(59, 130, 246, 0.5)",
                "0 0 0 20px rgba(59, 130, 246, 0)",
                "0 0 0 0 rgba(59, 130, 246, 0.5)"
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border-2 border-white/20 shadow-2xl"
          >
            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10">
              {token ? (
                <QRCodeSVG
                  value={token}
                  size={400}
                  level="H"
                  includeMargin={true}
                />
              ) : (
                <div className="flex items-center justify-center h-[400px]">
                  <p className="text-blue-400 animate-pulse font-arabic">جاري توليد الكود الخاص بالشركة...</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Circular Timer - Pulsing Colored Circles */}
          <div className="absolute -bottom-6 -right-6">
            <div className="relative w-24 h-24">
              <svg className="transform -rotate-90 w-24 h-24">
                <circle
                  cx="48"
                  cy="48"
                  r="44"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  className="text-white/20"
                />
                <motion.circle
                  cx="48"
                  cy="48"
                  r="44"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 44}`}
                  strokeDashoffset={`${2 * Math.PI * 44 * (1 - progressPercentage / 100)}`}
                  className="text-blue-400"
                  animate={{ 
                    strokeDashoffset: 2 * Math.PI * 44 * (1 - progressPercentage / 100),
                    opacity: [1, 0.8, 1]
                  }}
                  transition={{ 
                    duration: 1, 
                    ease: "linear",
                    repeat: Infinity
                  }}
                />
              </svg>
              <motion.div 
                className="absolute inset-0 flex items-center justify-center"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [1, 0.8, 1]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity
                }}
              >
                <span className="text-white font-bold text-2xl drop-shadow-lg">{countdown}</span>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            نظام الحضور الذكي
          </h1>
          <p className="text-gray-600 text-xl">امسح الكود لتسجيل الحضور • يتم التحديث كل 10 ثوانٍ</p>
        </div>

        {/* Refresh Button - Electric Blue */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={fetchToken}
            disabled={isLoading}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 disabled:from-blue-700 disabled:to-blue-800 text-white font-bold text-lg rounded-2xl transition-all duration-200 shadow-xl hover:shadow-2xl disabled:shadow-lg transform hover:scale-105 disabled:scale-100"
          >
            <RefreshCw className={`w-6 h-6 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'جاري التحديث...' : 'تحديث الكود'}</span>
          </button>
        </div>
      </motion.div>

      {/* Bottom Live Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gray-50 p-8 rounded-2xl border border-gray-200"
      >
        <h2 className="text-2xl font-bold mb-6 text-blue-600">تسجيلات الدخول المباشرة</h2>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          <AnimatePresence>
            {stats.recentCheckIns.map((checkIn, index: number) => (
              <motion.div
                key={checkIn.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{checkIn.userName}</p>
                    <p className="text-gray-600">{checkIn.department}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-blue-600 font-medium">{checkIn.time}</p>
                  <p className="text-gray-500 text-sm">{checkIn.type}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
