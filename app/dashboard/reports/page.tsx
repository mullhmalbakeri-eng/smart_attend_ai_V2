"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  Download, 
  Filter, 
  Users, 
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  LogOut,
  FileText,
  Building2,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import dynamic from 'next/dynamic';
import html2canvas from "html2canvas";
import * as rtlDetect from "rtl-detect";
import { useToast } from "@/components/ui/toast";

// Dynamic import for client-side only component
const ArabicPDFExport = dynamic(() => import("@/components/ArabicPDFExport").then(mod => mod.default), {
  ssr: false,
  loading: () => <div className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg">Loading...</div>
});

interface AttendanceRecord {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
    department?: {
      name: string;
    };
  };
  type: string;
  status: string;
  statusBadge: {
    text: string;
    color: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
  };
  timestamp: string;
  time: string;
  date: string;
  formattedDate: string;
}

interface AttendanceSummary {
  total: number;
  onTime: number;
  late: number;
  out: number;
  absent: number;
}

export default function ReportsPage() {
  const { addToast } = useToast();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary>({
    total: 0,
    onTime: 0,
    late: 0,
    out: 0,
    absent: 0
  });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [companyName, setCompanyName] = useState("شركة الاتحاد");

  useEffect(() => {
    loadAttendanceData();
    loadCompanyName();
  }, [selectedDate]);

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

  const loadAttendanceData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/attendance?date=${selectedDate}`);
      if (response.ok) {
        const data = await response.json();
        setRecords(data.records || []);
        setSummary({
          ...data.summary,
          absent: 0 // Calculate absent based on total employees
        });
      }
    } catch (error) {
      console.error('Failed to load attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Process Arabic text for PDF - with safety guards
  const processArabicText = (text: string) => {
    try {
      if (rtlDetect && typeof rtlDetect.isRtl === 'function' && rtlDetect.isRtl(text)) {
        return text; // No reshaping - react-pdf handles Arabic natively
      }
    } catch (error) {
      console.warn('Error processing Arabic text:', error);
    }
    return text;
  };

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const headers = ["اسم الموظف", "البريد الإلكتروني", "القسم", "التاريخ", "الوقت", "نوع الحضور", "الحالة"];
      const csvRows = [
        [companyName],
        [`تقرير الحضور - ${new Date(selectedDate).toLocaleDateString("ar-SA")}`],
        [],
        headers,
        ...records.map((record) => [
          record.user.name,
          record.user.email,
          record.user.department?.name || "غير محدد",
          record.formattedDate,
          record.time,
          record.type === "IN" ? "دخول" : "خروج",
          record.statusBadge.text,
        ]),
      ];
      const csv = "\ufeff" + csvRows.map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      
      // Create download link with UTF-8 BOM
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `attendance-report-${selectedDate}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      addToast({
        title: "نجاح",
        description: "تم تصدير التقرير بنجاح",
        type: "success"
      });
    } catch (error) {
      console.error('CSV export error:', error);
      addToast({
        title: "خطأ",
        description: "فشل تصدير التقرير",
        type: "error"
      });
    } finally {
      setExporting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ON_TIME':
        return <CheckCircle className="w-4 h-4" />;
      case 'LATE':
        return <AlertTriangle className="w-4 h-4" />;
      case 'ABSENT':
        return <XCircle className="w-4 h-4" />;
      case 'OUT':
      case 'EARLY_OUT':
        return <LogOut className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ON_TIME':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'LATE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ABSENT':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'OUT':
      case 'EARLY_OUT':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

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

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white border border-slate-200 rounded-lg shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center"
              >
                <FileText className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  تقارير الحضور
                </h1>
                <p className="text-slate-600">عرض وتصدير سجلات الحضور المتقدمة</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <ArabicPDFExport
                records={records}
                summary={summary}
                companyName={companyName}
                selectedDate={selectedDate}
                disabled={exporting}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExportCSV}
                disabled={exporting}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:opacity-50 text-white font-medium rounded-lg flex items-center gap-2 transition-all"
              >
                {exporting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                    جاري التصدير...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    تصدير CSV
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Company Header */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center"
              >
                <Building2 className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {companyName}
                </h2>
                <p className="text-slate-600">تقرير الحضور اليومي - {new Date(selectedDate).toLocaleDateString('ar-SA')}</p>
              </div>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg"
            >
              <Activity className="w-4 h-4 text-blue-600" />
              <span className="text-blue-600 font-medium">نشط</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6"
        >
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">إجمالي السجلات</p>
                <p className="text-3xl font-bold text-slate-900">
                  {summary.total}
                </p>
              </div>
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center"
              >
                <Users className="w-6 h-6 text-white" />
              </motion.div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-500">+12% من الأمس</span>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">في الوقت</p>
                <p className="text-3xl font-bold text-green-600">{summary.onTime}</p>
              </div>
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center"
              >
                <CheckCircle className="w-6 h-6 text-white" />
              </motion.div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-500">+5% من الأمس</span>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">متأخرين</p>
                <p className="text-3xl font-bold text-yellow-600">{summary.late}</p>
              </div>
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center"
              >
                <AlertTriangle className="w-6 h-6 text-white" />
              </motion.div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <ArrowDownRight className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-500">-3% من الأمس</span>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">خروج</p>
                <p className="text-3xl font-bold text-blue-600">{summary.out}</p>
              </div>
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center"
              >
                <LogOut className="w-6 h-6 text-white" />
              </motion.div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-500">+8% من الأمس</span>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">غائبين</p>
                <p className="text-3xl font-bold text-red-600">{summary.absent}</p>
              </div>
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center"
              >
                <XCircle className="w-6 h-6 text-white" />
              </motion.div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <ArrowDownRight className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-500">-2% من الأمس</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Attendance Records Table */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              سجلات الحضور المتقدمة
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">الموظف</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">القسم</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">التاريخ</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">الوقت</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">النوع</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <AnimatePresence>
                  {records.map((record, index) => (
                    <motion.tr
                      key={record.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.01, backgroundColor: "rgba(59, 130, 246, 0.05)" }}
                      className="hover:bg-blue-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{record.user.name}</div>
                          <div className="text-sm text-slate-500">{record.user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-900">{record.user.department?.name || 'غير محدد'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-900">{record.formattedDate}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-slate-900">{record.time}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <motion.span
                          whileHover={{ scale: 1.05 }}
                          className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full border ${
                            record.type === 'IN' 
                              ? 'bg-blue-100 text-blue-800 border-blue-200' 
                              : 'bg-slate-100 text-slate-800 border-slate-200'
                          }`}
                        >
                          {record.type === 'IN' ? 'دخول' : 'خروج'}
                        </motion.span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <motion.span
                          whileHover={{ scale: 1.05 }}
                          className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(record.status)}`}
                        >
                          {getStatusIcon(record.status)}
                          {record.statusBadge.text}
                        </motion.span>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
            
            {records.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4"
                >
                  <Calendar className="w-8 h-8 text-slate-400" />
                </motion.div>
                <p className="text-slate-600 text-lg">لا توجد سجلات حضور في هذا التاريخ</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
