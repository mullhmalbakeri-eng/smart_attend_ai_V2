'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">خطأ جوهري في التطبيق</h2>
            <p className="text-slate-400 mb-6">حدث خطأ حرج أثناء تشغيل التطبيق</p>
            <button
              onClick={reset}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              إعادة تشغيل التطبيق
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
