"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, AlertCircle, User, Shield } from "lucide-react";
import { z } from "zod";

// Validation schemas
const loginSchema = z.object({
  email: z.string()
    .email("البريد الإلكتروني غير صالح")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "البريد الإلكتروني يجب أن يكون بصيغة name@domain.com"),
  password: z.string()
    .min(6, "كلمة المرور يجب أن تكون 6 خانات على الأقل")
    .max(50, "كلمة المرور يجب ألا تزيد عن 50 خانة")
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      // جراحياً: نحصل على النص الخام أولاً قبل محاولة تحويله لـ JSON
      const responseText = await response.text();
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        // إذا فشل التحويل، فهذا يعني أن السيرفر أرسل HTML (خطأ 404 أو 500)
        console.error('Server returned HTML/Non-JSON:', responseText);
        throw new Error('حدث خطأ في السيرفر، يرجى التحقق من مسار الـ API');
      }

      if (!response.ok) {
        throw new Error(data.message || 'فشل تسجيل الدخول');
      }

      // النجاح: توجيه المستخدم حسب دوره (Admin أو Employee)
      const userRole = data.user.role?.toUpperCase();
      console.log('User role from login:', userRole);
      
      // Store user data in localStorage
      localStorage.setItem('userEmail', data.user.email);
      localStorage.setItem('userName', data.user.name);
      localStorage.setItem('userRole', userRole);
      
      if (userRole === 'ADMIN') {
        router.push('/dashboard');
      } else {
        router.push('/dashboard/scan');
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6" style={{ fontFamily: "Cairo, Tajawal, sans-serif" }}>
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 p-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-xl">
            <Shield className="w-8 h-8 text-white" />
            <span className="text-white font-bold text-xl">SmartAttend</span>
          </div>
          <p className="text-slate-400 mt-4">نظام الحضور الذكي</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-700 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">تسجيل الدخول</h1>
            <p className="text-slate-400">أدخل بياناتك للوصول إلى النظام</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <Mail className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="example@company.com"
                  dir="ltr"
                  className="w-full pl-4 pr-12 py-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="•••••••••"
                  className="w-full pl-4 pr-12 py-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-600/20 border border-red-500/50 rounded-xl p-3">
                <p className="text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-blue-800 disabled:to-blue-900 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200 shadow-xl hover:shadow-2xl disabled:shadow-lg disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white/60 animate-spin rounded-full"></div>
                  <span>جاري تسجيل الدخول...</span>
                </>
              ) : (
                <>
                  <User className="w-5 h-5" />
                  <span>تسجيل الدخول</span>
                </>
              )}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center">
            <Link href="/forgot-password" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
              نسيت كلمة المرور؟
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            © 2024 SmartAttend - جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </div>
  );
}
