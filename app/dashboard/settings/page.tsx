"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { Building, Clock, AlertTriangle, Save, ArrowLeft } from "lucide-react";

interface CompanySettings {
  companyName: string;
  logoUrl: string | null;
  workStartTime: string;
  workEndTime: string;
  gracePeriodMinutes: number;
}

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<CompanySettings>({
    companyName: '',
    logoUrl: null,
    workStartTime: '09:00',
    workEndTime: '17:00',
    gracePeriodMinutes: 15
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Check user role
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setUserRole(user.role);
      
      // Redirect non-admin users
      if (user.role !== 'ADMIN') {
        router.push('/dashboard');
        return;
      }
    } else {
      router.push('/login');
      return;
    }

    fetchSettings();
  }, [router]);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/company-settings');
      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          setSettings({
            companyName: data.settings.companyName || '',
            logoUrl: data.settings.logoUrl || null,
            workStartTime: data.settings.workStartTime || '09:00',
            workEndTime: data.settings.workEndTime || '17:00',
            gracePeriodMinutes: data.settings.gracePeriodMinutes || 15
          });
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    
    try {
      console.log('Saving settings with payload:', settings);
      
      // Validate required fields
      if (!settings.companyName.trim()) {
        setMessage({ type: 'error', text: 'اسم الشركة مطلوب' });
        return;
      }

      const payload = {
        companyName: settings.companyName.trim(),
        logoUrl: settings.logoUrl,
        workStartTime: settings.workStartTime,
        workEndTime: settings.workEndTime,
        gracePeriodMinutes: parseInt(settings.gracePeriodMinutes.toString())
      };

      console.log('Final payload being sent:', payload);
      
      let response: Response;
      try {
        // Check if we're running on mobile (different host)
        const isMobile = window.location.hostname !== 'localhost';
        const baseUrl = isMobile ? `http://${window.location.hostname}:3000` : '';
        const apiUrl = `${baseUrl}/api/company-settings`;
        
        console.log('Attempting to fetch from:', apiUrl);
        
        response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
      } catch (fetchError) {
        console.error('Failed to reach settings API:', fetchError);
        setMessage({ type: 'error', text: 'تعذر الاتصال بخدمة الإعدادات - تحقق من اتصال الشبكة' });
        return;
      }

      console.log('Response status:', response.status);
      
      if (response.ok) {
        let data: unknown = {};
        try {
          data = await response.json();
        } catch {
          data = {};
        }
        console.log('Save response:', data);
        setMessage({ type: 'success', text: 'تم حفظ الإعدادات بنجاح!' });
      } else {
        let errorData: Record<string, unknown> = {};
        try {
          const parsed = await response.json();
          if (parsed && typeof parsed === "object") {
            errorData = parsed as Record<string, unknown>;
          }
        } catch {
          errorData = {};
        }
        console.error('Save error response:', errorData);
        
        // Handle different error formats
        let errorMessage = 'فشل حفظ الإعدادات';
        if (typeof errorData.error === "string") {
          errorMessage = errorData.error;
        } else if (typeof errorData.details === "string") {
          errorMessage = errorData.details;
        } else if (typeof errorData.message === "string") {
          errorMessage = errorData.message;
        }
        
        setMessage({ type: 'error', text: errorMessage });
      }
    } catch (error) {
      console.error('Network error:', error);
      setMessage({ type: 'error', text: 'خطأ في الاتصال بالخادم' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (userRole !== 'ADMIN') {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-[#475569] hover:text-[#1e293b] transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          العودة إلى لوحة التحكم
        </button>
        <h1 className="text-3xl font-bold text-[#1e293b] mb-2">الإعدادات</h1>
        <p className="text-[#475569]">إدارة إعدادات الشركة والنظام</p>
      </div>

      {/* Message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-6 p-4 rounded-lg border ${
              message.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Form */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
        <div className="p-8">
          <div className="space-y-8">
            {/* Company Information */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Building className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-[#1e293b]">معلومات الشركة</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    اسم الشركة *
                  </label>
                  <input
                    type="text"
                    value={settings.companyName}
                    onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="أدخل اسم الشركة"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    رابط الشعار (اختياري)
                  </label>
                  <input
                    type="url"
                    value={settings.logoUrl || ''}
                    onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value || null })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>
            </div>

            {/* Working Hours */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-[#1e293b]">ساعات العمل</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    وقت بداية العمل
                  </label>
                  <input
                    type="time"
                    value={settings.workStartTime}
                    onChange={(e) => setSettings({ ...settings, workStartTime: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    وقت نهاية العمل
                  </label>
                  <input
                    type="time"
                    value={settings.workEndTime}
                    onChange={(e) => setSettings({ ...settings, workEndTime: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    فترة السماح (دقائق)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={settings.gracePeriodMinutes}
                    onChange={(e) => setSettings({ ...settings, gracePeriodMinutes: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-amber-800 mb-1">ملاحظات هامة</h3>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• سيتم تطبيق هذه الإعدادات على جميع الموظفين</li>
                    <li>• فترة السماح هي الوقت الإضافي المسموح به للتأخر</li>
                    <li>• يمكن تعديل هذه الإعدادات في أي وقت</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-slate-200 p-6">
          <div className="flex justify-end gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
