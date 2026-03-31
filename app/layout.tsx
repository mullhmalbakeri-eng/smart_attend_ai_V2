import type { Metadata } from "next"
import "./globals.css"
import { ToastProvider } from "@/components/ui/toast"

export const metadata: Metadata = {
  title: "Smart Attend AI",
  description: "AI-powered attendance system",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html dir="rtl" lang="ar">
      <body className="antialiased bg-white text-black font-sans">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
