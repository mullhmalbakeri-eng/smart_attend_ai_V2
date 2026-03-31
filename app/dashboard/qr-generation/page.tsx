"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, Printer, User, Mail, Building, Phone } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function QRGenerationPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [qrValue, setQrValue] = useState<string>("");
  const { addToast } = useToast();

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
        addToast({ title: "خطأ", description: "فشل جلب بيانات الموظفين", type: "error" });
      }
    };

    fetchUsers();
  }, [addToast]);

  const generateQR = (user: any) => {
    const qrData = JSON.stringify({
      employeeId: user.id,
      name: user.name,
      email: user.email,
      department: user.department,
      timestamp: new Date().toISOString()
    });
    setQrValue(qrData);
    setSelectedUser(user);
  };

  const downloadQR = () => {
    if (!qrValue) return;
    
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const link = document.createElement("a");
      link.download = `qr-${selectedUser?.name || 'employee'}.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      addToast({ title: "نجاح", description: "تم تحميل كود QR بنجاح", type: "success" });
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const printQR = () => {
    if (!qrValue) return;
    
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>طباعة كود QR - ${selectedUser?.name}</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
            .qr-container { border: 2px solid #000; padding: 20px; display: inline-block; }
            .employee-info { margin-top: 20px; text-align: right; }
            h2 { margin: 0 0 10px 0; }
            p { margin: 5px 0; }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div id="qr-code-svg"></div>
            <div class="employee-info">
              <h2>${selectedUser?.name}</h2>
              <p><strong>القسم:</strong> ${selectedUser?.department}</p>
              <p><strong>البريد:</strong> ${selectedUser?.email}</p>
              <p><strong>الهاتف:</strong> ${selectedUser?.phone}</p>
            </div>
          </div>
          <script>
            document.getElementById("qr-code-svg").innerHTML = document.getElementById("qr-code-svg").outerHTML;
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
    
    addToast({ title: "نجاح", description: "تم إرسال كود QR للطباعة", type: "success" });
  };

  return (
    <div className="p-10 space-y-8 fade-in">
      <div className="text-right">
        <h1 className="text-5xl font-black text-gradient">توليد أكواد QR</h1>
        <p className="text-xl text-gray-600 mt-3">إنشاء أكواد QR للموظفين للبطاقات الشخصية</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Users List */}
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-right">الموظفين</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {users.map((user) => (
              <div
                key={user.id}
                onClick={() => generateQR(user)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedUser?.id === user.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.department}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <User className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* QR Code Display */}
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-right">كود QR</h2>
          {qrValue ? (
            <div className="space-y-6">
              <div className="flex justify-center p-8 bg-white rounded-xl border-2 border-gray-300">
                <QRCodeSVG
                  id="qr-code-svg"
                  value={qrValue}
                  size={256}
                  level="H"
                  includeMargin={true}
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={downloadQR}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  <span>تحميل الكود</span>
                </button>
                
                <button
                  onClick={printQR}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                >
                  <Printer className="w-5 h-5" />
                  <span>طباعة</span>
                </button>
              </div>
              
              {selectedUser && (
                <div className="p-4 bg-gray-50 rounded-xl text-right">
                  <h3 className="font-bold text-gray-900 mb-2">معلومات الموظف</h3>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{selectedUser.name}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{selectedUser.email}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{selectedUser.department}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{selectedUser.phone}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-600">اختر موظفاً لتوليد كود QR</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
