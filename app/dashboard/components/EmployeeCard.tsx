"use client";
import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { User, Employee } from "@/types";
import { useToast } from "@/components/ui/toast";
import { X, Download, Printer, Shield, Calendar, Building2, Mail, Sparkles, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";

interface EmployeeCardProps {
  user: Employee | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EmployeeCard({ user, isOpen, onClose }: EmployeeCardProps) {
  const { addToast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setIsLoaded(true);
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      // Add small delay to ensure QR code is fully rendered
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const element = document.getElementById('employee-card');
      if (element) {
        const canvas = await html2canvas(element, {
          scale: 2,
          backgroundColor: null,
          logging: false,
          useCORS: true,
          allowTaint: true,
          ignoreElements: (element) => {
            // Ignore elements that might cause CORS issues
            return element.tagName === 'LINK' || element.tagName === 'STYLE';
          }
        });
        
        const link = document.createElement('a');
        link.download = `employee-card-${user?.name || 'card'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    } catch (error) {
      console.error("Error generating image:", error);
      addToast({
        title: "خطأ",
        description: "فشل في تحميل البطاقة، يرجى المحاولة مرة أخرى",
        type: "error",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="bg-white/10 dark:bg-slate-900/50 w-full max-w-md rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 backdrop-blur-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600/80 to-indigo-700/80 backdrop-blur-md p-6 text-white border-b border-white/20">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="h-6 w-6" />
                بطاقة الموظف
              </h3>
              <p className="text-blue-100 text-sm mt-1">SmartAttend AI System</p>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-all duration-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-6">
          {!isLoaded ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
              <p className="text-slate-600 dark:text-slate-300 font-medium">جاري تحميل البطاقة...</p>
            </div>
          ) : (
            <div id="employee-card" className="relative">
              {/* Card Background with Glassmorphism */}
              <div className="relative bg-gradient-to-br from-blue-500/20 via-indigo-600/20 to-purple-700/20 backdrop-blur-xl rounded-3xl p-8 text-slate-800 dark:text-white shadow-2xl border border-white/30 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/30 rounded-full -translate-y-16 translate-x-16 blur-xl"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/30 rounded-full translate-y-12 -translate-x-12 blur-xl"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                </div>

                {/* Card Content */}
                <div className="relative z-10">
                  {/* Logo and Header */}
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-4 py-2 mb-4">
                      <Sparkles className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-bold text-blue-600">SmartAttend AI</span>
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      بطاقة الهوية الرسمية
                    </h2>
                  </div>

                  <div className="flex items-start gap-6">
                    {/* User Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg backdrop-blur-md">
                        {user.name.charAt(0)}
                      </div>
                      <div className="mt-2 bg-green-500 w-full h-2 rounded-full"></div>
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{user.name}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                          <Building2 size={14} />
                          <span>{user.department?.name || "عام"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                          <Mail size={14} />
                          <span className="text-xs">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                          <Shield size={14} />
                          <span className="text-xs">الموظف رقم: #{user.id}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* QR Code Section */}
                  <div className="mt-6 flex items-center justify-between">
                    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/50">
                      {isLoaded && user ? (
                        <QRCodeSVG
                          key={user.uuid}
                          value={user.uuid || ''}
                          size={100}
                          level="H"
                          includeMargin={false}
                          bgColor="#ffffff"
                          fgColor="#000000"
                        />
                      ) : (
                        <div className="w-[100px] h-[100px] flex items-center justify-center">
                          <Loader2 className="animate-spin text-blue-600" size={24} />
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">معرف فريد</p>
                      <p className="font-mono text-xs bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg border border-white/30">
                        {user?.uuid?.substring(0, 8) || 'Loading...'}...
                      </p>
                      <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                        <Calendar size={10} />
                        <span>صالحة حتى 31/12/2025</span>
                      </div>
                    </div>
                  </div>

                  {/* Security Features */}
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Shield size={10} />
                        مشفرة رقمياً
                      </span>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>نشطة</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-4 text-center">
                    <p className="text-xs text-slate-500">© 2025 SmartAttend AI - All Rights Reserved</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {isLoaded && (
            <div className="flex gap-3 mt-6">
              <button
                onClick={onClose}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                تراجع
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Printer size={18} />
                طباعة البطاقة
              </button>
              <button
                onClick={handleDownload}
                disabled={isGenerating}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={18} />
                {isGenerating ? 'جاري التوليد...' : 'تحميل كصورة'}
              </button>
            </div>
          )}

          {/* Instructions */}
          {isLoaded && (
            <div className="mt-4 p-4 bg-blue-50/80 dark:bg-blue-900/20 backdrop-blur-md rounded-xl border border-blue-200/50 dark:border-blue-800/50">
              <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
                🎯 استخدم هذه البطاقة للمسح السريع في نظام الحضور
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
