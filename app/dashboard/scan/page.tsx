"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Camera, X, CheckCircle, AlertCircle, ArrowRight, User, Smartphone } from "lucide-react";
import { z } from "zod";

// Email validation schema
const emailSchema = z.string().email("البريد الإلكتروني غير صالح").regex(
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  "البريد الإلكتروني يجب أن يكون بصيغة name@domain.com"
);

export default function EmployeeScanPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [employeeName, setEmployeeName] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [cameraPermission, setCameraPermission] = useState<"granted" | "denied" | "prompt" | "unknown">("unknown");
  const [isMobile, setIsMobile] = useState(false);
  const [scanTime, setScanTime] = useState<string>("");
  const [isScanningSuccess, setIsScanningSuccess] = useState(false);
  const [companyName, setCompanyName] = useState<string>("شركة الاتحاد");
  const [scanMessage, setScanMessage] = useState('');
  const [scanColor, setScanColor] = useState('green');
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const router = useRouter();

  // Get userId from session
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get real user data from localStorage
   const userData = localStorage.getItem('user');
   const parsedUser = userData ? JSON.parse(userData) : null;
   const userEmail = parsedUser?.email;
   const userName = parsedUser?.name;

if (userEmail && userName) {
  setUserId(userEmail);
  setEmployeeName(userName);
} else {
  // لا يوجد session — أعد للـ login
  router.push('/login');
}

    // Load company name
    const loadCompanyName = async () => {
      try {
        const response = await fetch('/api/company-settings');
        if (response.ok) {
          const data = await response.json();
          if (data.settings?.companyName) {
            setCompanyName(data.settings.companyName);
          }
        }
      } catch (error) {
        console.error('Failed to load company name:', error);
      }
    };
    
    loadCompanyName();

    // Check if mobile device
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check camera permissions
  useEffect(() => {
    const checkCameraPermission = async () => {
      try {
        // Check if permissions API is available
        if ('permissions' in navigator) {
          const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
          setCameraPermission(result.state as any);
          
          result.addEventListener('change', () => {
            setCameraPermission(result.state as any);
          });
        } else {
          // Fallback for browsers that don't support permissions API
          setCameraPermission('unknown');
        }
      } catch (error) {
        console.error('Error checking camera permission:', error);
        setCameraPermission('unknown');
      }
    };

    checkCameraPermission();
  }, []);

  const validateEmail = (email: string): boolean => {
    try {
      emailSchema.parse(email);
      setEmailError("");
      return true;
    } catch (error: any) {
      setEmailError(error.errors?.[0]?.message || "البريد الإلكتروني غير صالح");
      return false;
    }
  };

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: isMobile ? 'environment' : 'user',
          width: { ideal: isMobile ? 1280 : 640 },
          height: { ideal: isMobile ? 720 : 480 }
        } 
      });
      stream.getTracks().forEach(track => track.stop());
      setCameraPermission('granted');
      return true;
    } catch (error: any) {
      console.error('Camera permission denied:', error);
      setCameraPermission('denied');
      return false;
    }
  };

  useEffect(() => {
    let scanner: any = null;

    const startScanner = async () => {
      if (isScanning && !result) {
        // Request camera permission first
        const hasPermission = cameraPermission === 'granted' || await requestCameraPermission();
        
        if (!hasPermission) {
          alert('يرجى السماح بالوصول إلى الكاميرا لمسح الباركود');
          setIsScanning(false);
          return;
        }

        await new Promise(r => setTimeout(r, 200)); 
        
        const element = document.getElementById("reader");
        if (element) {
          const { Html5QrcodeScanner } = await import("html5-qrcode");
            
          // Mobile-optimized scanner settings
          const scannerConfig = isMobile ? {
            fps: 15,
            qrbox: { width: 300, height: 300 },
            aspectRatio: 1.0,
            videoConstraints: {
              facingMode: 'environment',
              width: { min: 640, ideal: 1280, max: 1920 },
              height: { min: 480, ideal: 720, max: 1080 }
            }
          } : {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          };
            
          scanner = new Html5QrcodeScanner(
            "reader",
            scannerConfig,
            false
          );

          scanner.render(
            async (decodedText: string) => {
              console.log('QR Code detected:', decodedText);
              setResult(decodedText);
              scanner.clear();
              handleVerify(decodedText);
            },
            (error: any) => { 
              // تجاهل أخطاء المسح اللحظية 
              console.log('Scanning error (normal):', error);
            }
          );
        }
      }
    };

    startScanner();

    return () => {
      if (scanner) {
        try {
          scanner.clear().catch(() => {});
        } catch {}
      }
    };
  }, [isScanning, result, cameraPermission, isMobile]);

  const handleVerify = async (token: string) => {
    try {
      console.log('Verifying QR token:', token);
      
      const res = await fetch("/api/attendance/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          token,
          userId: userId
        }),
      });
      
      console.log('API Response status:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log('API Response data:', data);
        
        if (data.success) {
          // Play success sound (disabled for now)
          // const audio = new Audio('/success-sound.mp3');
          // audio.play().catch(e => console.log('Audio play failed:', e));
          
          // Set success state and time
          const currentTime = new Date().toLocaleTimeString('ar-SA');
          setScanTime(currentTime);
          
          // تمييز بين IN و OUT في الرسالة والألوان
          const isCheckIn = data.attendance.type === 'IN';
          setScanMessage(isCheckIn ? '✅ تم تسجيل الحضور' : '🚪 تم تسجيل الخروج');
          setScanColor(isCheckIn ? 'green' : 'blue');
          
          setIsScanningSuccess(true);
          setShowSuccess(true);

          // حل مشكلة التجمد - clearTimeout صحيح
          const timer = setTimeout(() => {
            setShowSuccess(false);
            setResult(null);
            setIsScanning(false);
            setIsScanningSuccess(false);
            setScanMessage('');
          }, 5000);

          return () => clearTimeout(timer); // تنظيف عند unmount
        } else {
          console.error('API returned error:', data.error);
          setErrorMessage(data.error || 'فشل تسجيل الحضور');
          setShowError(true);
          setTimeout(() => setShowError(false), 5000);
        }
      } else {
        const errData = await res.json();
        setErrorMessage(errData.error || 'خطأ في الاتصال بالخادم');
        setShowError(true);
        setTimeout(() => setShowError(false), 5000);
      }
    } catch (error) {
      console.error("API Error:", error);
      setErrorMessage('خطأ في الاتصال بالخادم');
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    }
  };

  const handleScan = async () => {
    // Request camera permission before starting scan
    if (cameraPermission === 'denied') {
      setErrorMessage('تم رفض إذن الكاميرا. يرجى تفعيله من إعدادات المتصفح');
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
      return;
    }
    
    setIsScanning(true);
    setResult(null);
    setShowSuccess(false);
  };

  const handleStop = () => {
    setIsScanning(false);
    setResult(null);
    setShowSuccess(false);
  };

  return (
    <div className={`min-h-screen bg-[#f8fafc] text-slate-900 ${isMobile ? 'pb-20' : 'p-6'}`} style={{ fontFamily: "Cairo, Tajawal, sans-serif" }} translate="no">
      {/* Header */}
      <header className="bg-white border border-slate-200 rounded-lg shadow-sm" translate="no">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#1e293b]">{companyName}</h1>
                <p className="text-xs text-slate-500">نظام الحضور الذكي</p>
              </div>
            </div>
            
            <Link
              href="/login"
              className="flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all duration-200"
            >
              <ArrowRight className="w-4 h-4 text-red-600" />
              <span className="text-red-600 text-sm">خروج</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Error Message */}
      {showError && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm
                        bg-white border border-red-200 rounded-2xl shadow-xl p-5 text-center"
             dir="rtl">
          <div className="text-4xl mb-2">
            {errorMessage.includes('أكملت يومك') ? '🎉' : '⚠️'}
          </div>
          <p className="text-slate-800 font-bold text-lg leading-relaxed">
            {errorMessage}
          </p>
          <button
            onClick={() => setShowError(false)}
            className="mt-4 px-6 py-2 bg-slate-100 hover:bg-slate-200
                       text-slate-700 rounded-xl text-sm font-medium transition-colors"
          >
            حسناً
          </button>
        </div>
      )}

      {/* Error Backdrop */}
      {showError && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setShowError(false)}
        />
      )}

      {/* Success Message */}
      {showSuccess && (
        <div className={`m-4 bg-white border ${scanColor === 'green' ? 'border-green-200' : 'border-blue-200'} rounded-3xl p-6 text-center shadow-sm`}>
          <div className="flex items-center justify-center gap-4 mb-4">
            <CheckCircle className={`w-12 h-12 ${scanColor === 'green' ? 'text-green-600' : 'text-blue-600'}`} />
            <div className="text-right">
              <h2 className={`text-2xl font-bold ${scanColor === 'green' ? 'text-green-700' : 'text-blue-700'} mb-2`}>{scanMessage}</h2>
              <p className={`text-lg ${scanColor === 'green' ? 'text-green-700' : 'text-blue-700'}`}>مرحباً بك يا {employeeName}</p>
              <p className={`text-md ${scanColor === 'green' ? 'text-green-600' : 'text-blue-600'} mt-2`}>الوقت: {scanTime}</p>
            </div>
          </div>
          <div className={`${scanColor === 'green' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'} rounded-xl p-4 border`}>
            <p className={`${scanColor === 'green' ? 'text-green-700' : 'text-blue-700'} text-sm`}>
              {scanColor === 'green' ? 'تم تسجيل حضورك بنجاح في النظام' : 'تم تسجيل خروجك بنجاح في النظام'}
            </p>
          </div>
        </div>
      )}

      {/* Main Content - Full Screen on Mobile */}
      <div className={`${isMobile ? 'px-4 py-6' : 'max-w-4xl mx-auto p-8'}`}>
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="text-center mb-6">
            <h2 className={`font-bold text-slate-900 mb-4 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>مسح الباركود</h2>
            <p className="text-slate-600 text-sm">استخدم الكاميرا لتسجيل الحضور</p>
          </div>

          {/* Camera Permission Status */}
          {cameraPermission === 'denied' && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-red-700 font-medium">إذن الكاميرا مرفوض</p>
                  <p className="text-red-600 text-sm">يرجى تفعيل إذن الكاميرا من إعدادات المتصفح</p>
                </div>
              </div>
            </div>
          )}

          {/* Scanner Section - Mobile Optimized */}
          {isScanning ? (
            <div className="mt-6">
              <div className={`relative mx-auto overflow-hidden rounded-2xl border-2 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)] ${
                isMobile ? 'w-full aspect-square' : 'w-full aspect-square max-w-[400px]'
              }`}>
                <div id="reader" className="w-full h-full"></div>
              </div>
              <button 
                onClick={handleStop}
                className="mt-6 w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200 shadow-xl hover:shadow-2xl flex items-center justify-center gap-3"
              >
                <X className="w-6 h-6" />
                <span>إلغاء المسح</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleScan}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200 shadow-xl hover:shadow-2xl flex items-center justify-center gap-3"
            >
              {isMobile ? <Smartphone className="w-6 h-6" /> : <Camera className="w-6 h-6" />}
              <span>فتح الكاميرا للمسح</span>
            </button>
          )}
        </div>

        {/* Mobile-optimized Instructions */}
        <div className="mt-6 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            تعليمات المسح
          </h3>
          <ul className="space-y-3 text-slate-700 text-sm">
            <li className="flex items-start gap-3">
              <span className="text-blue-400">1.</span>
              <span>تأكد من وجود إضاءة جيدة</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400">2.</span>
              <span>وجه الكاميرا مباشرة نحو الباركود</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400">3.</span>
              <span>حافظ على مسافة مناسبة</span>
            </li>
            {isMobile && (
              <li className="flex items-start gap-3">
                <span className="text-blue-400">4.</span>
                <span>استخدم الكاميرا الخلفية للأداء الأفضل</span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
