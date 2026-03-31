"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QRScanner from "@/app/dashboard/components/QRScanner";
import SmartAttendance from "@/app/dashboard/components/SmartAttendance";
import { Users, QrCode, Camera, UserCheck, CheckCircle, XCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function AttendancePage() {
  const [users, setUsers] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [activeTab, setActiveTab] = useState("scanner");
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    employee?: any;
    message?: string;
    error?: string;
  } | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    // Fetch real data from API
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
        toast.error("فشل جلب بيانات الموظفين");
      }
    };

    const fetchAttendance = async () => {
      try {
        const response = await fetch('/api/attendance/today');
        if (response.ok) {
          const data = await response.json();
          setAttendanceRecords(data);
        }
      } catch (error) {
        console.error('Failed to fetch attendance:', error);
        setAttendanceRecords([]);
      }
    };

    fetchUsers();
    fetchAttendance();
  }, []);

  const handleQRScan = async (token: string) => {
    if (isScanning) return;
    
    setIsScanning(true);
    setScanResult(null);

    try {
      const response = await fetch('/api/attendance/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }) // Send token instead of qrData
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Success animation with employee details
        setScanResult({
          success: true,
          employee: result.employee,
          message: result.message
        });

        // Show success toast with employee's name
        toast.success(
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <p className="font-bold">{result.employeeName}</p>
              <p className="text-sm">{result.message}</p>
            </div>
          </div>,
          {
            duration: 4000,
            position: 'top-center',
            style: {
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '14px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
            }
          }
        );

        // Refresh attendance records
        const attendanceResponse = await fetch('/api/attendance/today');
        if (attendanceResponse.ok) {
          const data = await attendanceResponse.json();
          setAttendanceRecords(data);
        }

        // Clear success animation after 3 seconds
        setTimeout(() => {
          setScanResult(null);
          setIsScanning(false);
        }, 3000);

      } else {
        // Error handling
        setScanResult({
          success: false,
          error: result.error
        });

        toast.error(
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-500" />
            <div>
              <p className="font-bold">خطأ في المسح</p>
              <p className="text-sm">{result.error}</p>
            </div>
          </div>,
          {
            duration: 4000,
            position: 'top-center',
            style: {
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '14px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
            }
          }
        );

        setIsScanning(false);
        setTimeout(() => setScanResult(null), 3000);
      }

    } catch (error) {
      toast.error("خطأ في الاتصال بالخادم");
      setIsScanning(false);
      setScanResult(null);
    }
  };

  const handleAttendance = (userId: number, dept: string, requestedType?: "In" | "Out") => {
    // Manual attendance logic
    fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, date: new Date().toISOString(), requestedType })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        toast.success("تم تسجيل الحضور بنجاح");
        // Refresh attendance records
        fetch('/api/attendance/today')
          .then(response => response.json())
          .then(data => setAttendanceRecords(data));
      } else {
        toast.error(data.error || "فشل تسجيل الحضور");
      }
    })
    .catch(error => {
      toast.error("فشل تسجيل الحضور");
    });
  };

  return (
    <div className="p-10 space-y-8 fade-in">
      <Toaster />
      
      <div className="text-right">
        <h1 className="text-5xl font-black text-gradient">تسجيل الحضور</h1>
        <p className="text-xl text-gray-600 mt-3">مسح QR Code أو تسجيل يدوي للحضور والانصراف</p>
      </div>

      {/* Success/Error Animation Overlay */}
      {scanResult && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className={`p-8 rounded-2xl shadow-2xl max-w-md mx-4 transform transition-all duration-500 ${
            scanResult.success 
              ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white scale-105' 
              : 'bg-gradient-to-br from-red-500 to-rose-600 text-white scale-105'
          }`}>
            <div className="text-center">
              {scanResult.success ? (
                <>
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 animate-bounce" />
                  <h2 className="text-2xl font-bold mb-2">تم المسح بنجاح!</h2>
                  <p className="text-lg mb-4">{scanResult.employee?.name}</p>
                  {scanResult.employee?.photo && (
                    <img 
                      src={scanResult.employee.photo} 
                      alt={scanResult.employee.name}
                      className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-white shadow-lg"
                    />
                  )}
                  <p className="text-sm opacity-90">{scanResult.message}</p>
                </>
              ) : (
                <>
                  <XCircle className="w-16 h-16 mx-auto mb-4 animate-pulse" />
                  <h2 className="text-2xl font-bold mb-2">خطأ في المسح</h2>
                  <p className="text-sm opacity-90">{scanResult.error}</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="scanner" className="flex items-center gap-2">
            <Camera className="w-4 h-4" />
            ماسح QR Code
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            تسجيل يدوي
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scanner" className="space-y-8">
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
            <div className="text-right mb-6">
              <h2 className="text-2xl font-bold text-gray-900">مسح QR Code</h2>
              <p className="text-gray-600 mt-2">وجه الكاميرا نحو QR Code للموظف</p>
            </div>
            <QRScanner onScanSuccess={handleQRScan} />
          </div>
        </TabsContent>

        <TabsContent value="manual" className="space-y-8">
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
            <div className="text-right mb-6">
              <h2 className="text-2xl font-bold text-gray-900">الحضور اليدوي</h2>
              <p className="text-gray-600 mt-2">اختر الموظف ونوع الحضور</p>
            </div>
            <SmartAttendance 
              users={users}
              attendanceRecords={attendanceRecords}
              onAttendance={handleAttendance}
            />
          </div>

          {/* Users List with QR Generation */}
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
            <div className="text-right mb-6">
              <h2 className="text-2xl font-bold text-gray-900">الموظفين</h2>
              <p className="text-gray-600 mt-2">اضغط على زر QR لتوليد كود للموظف</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user: any) => (
                <div key={user.id} className="bg-gray-50 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.department}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <button
                    onClick={() => window.open(`/dashboard/scan`, '_blank')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    <QrCode className="w-4 h-4" />
                    افتح الكاميرا للمسح
                  </button>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
