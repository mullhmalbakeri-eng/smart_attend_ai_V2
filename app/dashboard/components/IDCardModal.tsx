"use client";
import { useState } from "react";
import { User } from "@/types";
import { X, Download, Printer } from "lucide-react";

interface IDCardModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function IDCardModal({ user, isOpen, onClose }: IDCardModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  if (!isOpen || !user) return null;

  const generateQRCode = () => {
    const qrData = JSON.stringify({ userId: user.id, name: user.name });
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
  };

  const handlePrint = (e: React.MouseEvent) => {
    e.preventDefault();
    window.print();
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    const link = document.createElement('a');
    link.download = `id-card-${user.name.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            بطاقة هوية الموظف
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          {/* ID Card Design */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold backdrop-blur-sm">
                {user.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-blue-100 text-sm">{user.department?.name || "عام"}</p>
                <p className="text-blue-200 text-xs">الموظف رقم: #{user.id}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-3 flex justify-center">
              <img 
                src={generateQRCode()} 
                alt="QR Code" 
                className="w-32 h-32"
              />
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-xs text-blue-100">بطاقة هوية رسمية - نظام الحضور الذكي</p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handlePrint}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Printer size={16} />
              طباعة
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Download size={16} />
              تحميل
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
