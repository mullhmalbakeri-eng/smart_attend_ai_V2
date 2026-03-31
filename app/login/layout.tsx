export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // جراحياً: نحذف <html> و <body> ونترك الـ children فقط
    <div className="min-h-screen bg-zinc-950">
        {children}
    </div>
  );
}
