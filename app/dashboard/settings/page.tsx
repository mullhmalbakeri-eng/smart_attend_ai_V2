"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Building2, 
  Clock, 
  Save, 
  Upload, 
  AlertCircle, 
  Settings as SettingsIcon,
  Calendar,
  Users,
  FileText,
  Download,
  Shield,
  Bell,
  Globe,
  Palette,
  Activity,
  FileBarChart
} from "lucide-react";

interface CompanySettings {
  id: number;
  companyName: string;
  logoUrl: string | null;
  workStartTime: string;
  workEndTime: string;
  gracePeriodMinutes: number;
}

export default function SettingsPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const [settings, setSettings] = useState<CompanySettings>({
    id: 1,
    companyName: "شركة الاتحاد",
    logoUrl: null,
    workStartTime: "08:00",
    workEndTime: "16:00",
    gracePeriodMinutes: 15
  });

  useEffect(() => {
    // Check user role
    const role = localStorage.getItem('userRole');
    setUserRole(role || '');
    
    if (role !== 'ADMIN') {
      router.push('/dashboard/scan');
      return;
    }
    
    // Load settings
    loadSettings();
  }, [router]);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/company-settings');
      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          setSettings(data.settings);
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/company-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'تم حفظ الإعدادات بنجاح!' });
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'فشل حفظ الإعدادات' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'فشل حفظ الإعدادات' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 20
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 backdrop-blur-lg border-b border-slate-200/50 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg"
              >
                <SettingsIcon className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  الإعدادات
                </h1>
                <p className="text-slate-600">إدارة إعدادات الشركة والنظام المتقدمة</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-blue-800 disabled:to-blue-900 disabled:opacity-50 text-white font-medium rounded-lg flex items-center gap-2 transition-all shadow-lg"
            >
              {saving ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  حفظ الإعدادات
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto px-6 pt-4"
        >
          <div className={`p-4 rounded-xl border flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">{message.text}</span>
          </div>
        </motion.div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          
          {/* Company Identity Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -5 }}
            className="lg:col-span-2 bg-white/80 backdrop-blur-lg rounded-3xl border border-slate-200/50 shadow-xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center"
                >
                  <Building2 className="w-5 h-5 text-white" />
                </motion.div>
                <h2 className="text-xl font-bold text-white">هوية الشركة</h2>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              
              {/* Company Name Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-slate-50 rounded-xl p-4 border border-slate-200"
              >
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  اسم الشركة
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="text"
                  value={settings.companyName}
                  onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="أدخل اسم الشركة"
                />
              </motion.div>

              {/* Logo URL Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-slate-50 rounded-xl p-4 border border-slate-200"
              >
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
                  <Upload className="w-4 h-4 text-blue-600" />
                  رابط الشعار (اختياري)
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="url"
                  value={settings.logoUrl || ''}
                  onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value || null })}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="https://example.com/logo.png"
                />
              </motion.div>

              {/* Logo Preview Card */}
              {settings.logoUrl && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-slate-50 rounded-xl p-4 border border-slate-200"
                >
                  <label className="text-sm font-semibold text-slate-700 mb-3">معاينة الشعار</label>
                  <div className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-xl overflow-hidden bg-white">
                    <motion.img 
                      src={settings.logoUrl} 
                      alt="Company Logo" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                </motion.div>
              )}

            </div>
          </motion.div>

          {/* Work Schedule Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white/80 backdrop-blur-lg rounded-3xl border border-slate-200/50 shadow-xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6">
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center"
                >
                  <Clock className="w-5 h-5 text-white" />
                </motion.div>
                <h2 className="text-xl font-bold text-white">جدول العمل</h2>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              
              {/* Work Start Time Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-slate-50 rounded-xl p-4 border border-slate-200"
              >
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-green-600" />
                  وقت بدء العمل
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="time"
                  value={settings.workStartTime}
                  onChange={(e) => setSettings({ ...settings, workStartTime: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </motion.div>

              {/* Work End Time Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-slate-50 rounded-xl p-4 border border-slate-200"
              >
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-green-600" />
                  وقت نهاية العمل
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="time"
                  value={settings.workEndTime}
                  onChange={(e) => setSettings({ ...settings, workEndTime: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </motion.div>

              {/* Grace Period Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-slate-50 rounded-xl p-4 border border-slate-200"
              >
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-green-600" />
                  فترة السماح (دقائق)
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="number"
                  min="0"
                  max="60"
                  value={settings.gracePeriodMinutes}
                  onChange={(e) => setSettings({ ...settings, gracePeriodMinutes: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="15"
                />
                <p className="text-xs text-slate-500 mt-2">الدقائق المسموحة بعد وقت بدء العمل قبل اعتبار الموظف متأخراً</p>
              </motion.div>

            </div>
          </motion.div>

        </motion.div>

        {/* Info Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6"
        >
          
          {/* How It Works Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white/80 backdrop-blur-lg rounded-3xl border border-slate-200/50 shadow-xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6">
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center"
                >
                  <FileText className="w-5 h-5 text-white" />
                </motion.div>
                <h2 className="text-xl font-bold text-white">كيف تعمل هذه الإعدادات</h2>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
                <div className="space-y-3">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
                  >
                    <Clock className="w-4 h-4 text-purple-600 mt-1 flex-shrink-0" />
                    <span><strong>وقت بدء العمل:</strong> الوقت المتوقع لوصول الموظفين</span>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
                  >
                    <Clock className="w-4 h-4 text-purple-600 mt-1 flex-shrink-0" />
                    <span><strong>فترة السماح:</strong> دقائق إضافية مسموحة قبل اعتبار الموظف متأخراً</span>
                  </motion.div>
                </div>
                <div className="space-y-3">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
                  >
                    <Shield className="w-4 h-4 text-purple-600 mt-1 flex-shrink-0" />
                    <span><strong>مثال:</strong> إذا كان وقت البدء 8:00 صباحاً وفترة السماح 15 دقيقة، الموظفون الذين يصلون قبل 8:15 صباحاً سيتم اعتبارهم "في الوقت"</span>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
                  >
                    <Bell className="w-4 h-4 text-purple-600 mt-1 flex-shrink-0" />
                    <span><strong>كشف التأخير:</strong> يتم تطبيقه تلقائياً أثناء مسح الباركود</span>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Statistics Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white/80 backdrop-blur-lg rounded-3xl border border-slate-200/50 shadow-xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6">
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center"
                >
                  <Activity className="w-5 h-5 text-white" />
                </motion.div>
                <h2 className="text-xl font-bold text-white">الإحصائيات الحالية</h2>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-4 bg-green-50 rounded-xl border border-green-200"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-sm text-slate-600 mb-1">وقت البدء</p>
                  <p className="text-xl font-bold text-green-600">{settings.workStartTime}</p>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-sm text-slate-600 mb-1">وقت النهاية</p>
                  <p className="text-xl font-bold text-blue-600">{settings.workEndTime}</p>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-4 bg-yellow-50 rounded-xl border border-yellow-200"
                >
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <p className="text-sm text-slate-600 mb-1">فترة السماح</p>
                  <p className="text-xl font-bold text-yellow-600">{settings.gracePeriodMinutes} دقيقة</p>
                </motion.div>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}
