"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { z } from "zod";

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.string()
    .email("البريد الإلكتروني غير صالح")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "البريد الإلكتروني يجب أن يكون بصيغة name@domain.com")
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear messages when user starts typing
    if (error || success) {
      setError("");
      setSuccess(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Validate form data
      const validatedData = forgotPasswordSchema.parse(formData);

      // Simulate API call
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedData),
      });

      const responseText = await response.text();
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('Server returned HTML/Non-JSON:', responseText);
        throw new Error('حدث خطأ في السيرفر، يرجى التحقق من مسار الـ API');
      }

      if (!response.ok) {
        throw new Error(data.message || 'فشل إرسال رابط إعادة التعيين');
      }

      // Success
      setSuccess(true);

    } catch (error: any) {
      if (error instanceof z.ZodError) {
        setError(error.errors[0]?.message || "بيانات غير صالحة");
      } else {
        setError(error.message || "حدث خطأ غير متوقع");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6" style={{ fontFamily: "Cairo, Tajawal, sans-serif" }}>
      <div className="w-full max-w-md">
        {/* Back to Login */}
        <div className="mb-6">
          <Link
            href="/login"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>العودة لتسجيل الدخول</span>
          </Link>
        </div>

        {/* Forgot Password Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-700 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 p-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-xl mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">نسيت كلمة المرور؟</h1>
            <p className="text-slate-400">
              أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-600/20 backdrop-blur-sm border border-green-500/50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-green-300 font-medium">تم الإرسال بنجاح!</p>
                  <p className="text-green-400 text-sm">
                    تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-600/20 backdrop-blur-sm border border-red-500/50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-red-400">{error}</p>
              </div>
            </div>
          )}

          {!success && (
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-blue-800 disabled:to-blue-900 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200 shadow-xl hover:shadow-2xl disabled:shadow-lg disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white/60 animate-spin rounded-full"></div>
                    <span>جاري الإرسال...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    <span>إرسال رابط إعادة التعيين</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              لم تستلم البريد؟ تحقق في مجلد الرسائل غير المرغوب فيها
            </p>
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
