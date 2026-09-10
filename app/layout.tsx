import type { Metadata } from "next"
import "./globals.css"
import { ToastProvider } from "@/components/ui/toast"

export const metadata: Metadata = {
  title: "Smart Attend AI - شركة الاتحاد",
  description: "AI-powered attendance system for Etihad Company",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html dir="rtl" lang="ar" className="bg-[#f8fafc] text-slate-900">
      <body className="antialiased bg-[#f8fafc] text-slate-900 font-sans overflow-x-hidden">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
