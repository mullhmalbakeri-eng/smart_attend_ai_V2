export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-black">Smart Attend AI</h1>
        <p className="text-black mt-4">Welcome to the attendance system.</p>
        <div className="mt-8 space-x-4">
          <a href="/login" className="text-blue-600 underline">Login</a>
          <a href="/dashboard" className="text-blue-600 underline">Dashboard</a>
        </div>
      </div>
    </div>
  );
}
