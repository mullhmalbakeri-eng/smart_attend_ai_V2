"use client";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { User } from "@/types";
import { X, Download, Printer, Shield, Calendar, Building2, Mail } from "lucide-react";

interface IDCardGeneratorProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function IDCardGenerator({ user, isOpen, onClose }: IDCardGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen || !user) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    setIsGenerating(true);
    const svg = document.getElementById('qr-code-svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = 300;
        canvas.height = 300;
        ctx?.drawImage(img, 0, 0);
        
        const link = document.createElement('a');
        link.download = `id-card-${user.name.replace(/\s+/g, '-').toLowerCase()}.png`;
        link.href = canvas.toDataURL();
        link.click();
        setIsGenerating(false);
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-2xl font-bold">بطاقة الهوية الرسمية</h3>
              <p className="text-blue-100 text-sm mt-1">نظام الحضور الذكي</p>
            </div>
            <button 
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* ID Card */}
        <div className="p-6">
          <div className="relative">
            {/* Card Background */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
              </div>

              {/* Card Content */}
              <div className="relative z-10">
                <div className="flex items-start gap-6">
                  {/* User Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-lg">
                      {user.name.charAt(0)}
                    </div>
                    <div className="mt-2 bg-green-500 w-full h-2 rounded-full"></div>
                  </div>

                  {/* User Info */}
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Building2 size={14} />
                        <span>{user.department?.name || "عام"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Mail size={14} />
                        <span className="text-xs">{user.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Shield size={14} />
                        <span className="text-xs">الموظف رقم: #{user.id}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* QR Code Section */}
                <div className="mt-6 flex items-center justify-between">
                  <div className="bg-white rounded-xl p-3 shadow-lg">
                    <QRCodeSVG
                      id="qr-code-svg"
                      value={user.uuid || ''}
                      size={80}
                      level="H"
                      includeMargin={false}
                      bgColor="#ffffff"
                      fgColor="#000000"
                    />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 mb-1">معرف فريد</p>
                    <p className="font-mono text-xs bg-slate-800 px-2 py-1 rounded">
                      {user.uuid?.substring(0, 8)}...
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                      <Calendar size={10} />
                      <span>صالحة حتى 31/12/2025</span>
                    </div>
                  </div>
                </div>

                {/* Security Features */}
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>مشفرة رقمياً</span>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>نشطة</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
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

          {/* Instructions */}
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
              💡 استخدم هذه البطاقة للمسح السريع في نظام الحضور
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
