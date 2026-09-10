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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // PREVENT DOUBLE CLICKS - disable button immediately
    if (isLoading) return;
    
    setError("");
    setIsLoading(true);

    console.log("Attempting Login...");

    // TIMEOUT PROTECTION - reset loading state if server doesn't respond
    const timeout = setTimeout(() => {
      console.log("Login timeout - resetting loading state");
      setIsLoading(false);
      setError("انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى.");
    }, 5000);

    try {
      // Validate form data - use safeParse to prevent console errors
      const validationResult = loginSchema.safeParse(formData);
      if (!validationResult.success) {
        setError(validationResult.error.errors[0]?.message || "بيانات غير صالحة");
        setIsLoading(false);
        clearTimeout(timeout);
        return;
      }
      const validatedData = validationResult.data;
      
      // COMPLETE BYPASS - no external connections
     const apiUrl = '/api/auth/login';
      
      console.log("API URL:", apiUrl);
      console.log("Login Payload:", validatedData);
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedData),
      });

      clearTimeout(timeout); // Clear timeout on successful response

      const data = await response.json();
      console.log("Response status:", response.status);

      if (response.ok) {
        // Store user data in localStorage
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("userRole", data.user.role);
        localStorage.setItem("userEmail", data.user.email);  // ← أضف هذا
        localStorage.setItem("userName", data.user.name);    // ← أضف هذا
        // DYNAMIC REDIRECT - force clean page load
        console.log("Login successful, redirecting to dashboard...");
      
   

// ثم في handleSubmit:
      router.push('/dashboard');
      } else {
        // Silent handling - no console output
        setError(data.error || "فشل تسجيل الدخول");
      }
    } catch (error) {
      clearTimeout(timeout); // Clear timeout on error
      // Silent error handling - no console output
      if (error instanceof z.ZodError) {
        setError(error.errors[0]?.message || "بيانات غير صالحة");
      } else {
        setError("فشل في الاتصال بالخادم. يرجى المحاولة مرة أخرى.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
      {/* Clean ODOO-style centered login */}
      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#1e293b] mb-2">شركة الاتحاد</h1>
          <p className="text-[#475569]">Smart Attend AI</p>
        </div>

        {/* Login Form */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-[#1e293b] mb-2">تسجيل الدخول</h2>
            <p className="text-[#475569] text-sm">أدخل بياناتك للوصول إلى النظام</p>
          </div>

          {/* Alert Message */}
          {error && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <p className="text-yellow-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pr-10 pl-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="name@company.com"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pr-10 pl-12 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-transparent animate-spin rounded-full"></div>
                  <span>جاري تسجيل الدخول...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L5 5l4 4" />
                  </svg>
                  <span>تسجيل الدخول</span>
                </>
              )}
            </button>

          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-[#475569] text-sm">
              تحتاج مساعدة؟{" "}
              <Link href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                تواصل مع الدعم الفني
              </Link>
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-8">
          <p className="text-[#475569] text-xs">
            © 2026 شركة الاتحاد - جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </div>
  );
}
