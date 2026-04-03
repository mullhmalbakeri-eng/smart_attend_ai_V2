'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-4">حدث خطأ غير متوقع</h2>
        <p className="text-slate-400 mb-6">حدث خطأ أثناء تحميل التطبيق</p>
        <button
          onClick={reset}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors"
        >
          إعادة المحاولة
        </button>
      </div>
    </div>
  );
}
