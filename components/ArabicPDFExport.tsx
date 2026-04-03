'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

export default function ArabicPDFExport({ records, summary, companyName, selectedDate, disabled = false }: any) {
  const [PDFButton, setPDFButton] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const { Document, Page, Text, View, StyleSheet, Font, pdf } = await import('@react-pdf/renderer');

      Font.register({
        family: 'Cairo',
        src: 'https://fonts.gstatic.com/s/cairo/v28/SLXgc1nY6HkvangtZmpQdkhzfH5lkSs2SgRjCAGMQ1z0hOA-W1ToLA.ttf',
      });

      const styles = StyleSheet.create({
        page: { padding: 30, fontFamily: 'Cairo' },
        text: { fontFamily: 'Cairo', fontSize: 14, marginBottom: 10 },
      });

      const Doc = () => (
        <Document>
          <Page size="A4" style={styles.page}>
            <Text style={styles.text}>{companyName}</Text>
            <Text style={styles.text}>تقرير الحضور اليومي</Text>
            {records.map((r: any, i: number) => (
              <Text key={i} style={styles.text}>
                {r.user?.name} - {r.time} - {r.type === 'IN' ? 'دخول' : 'خروج'}
              </Text>
            ))}
          </Page>
        </Document>
      );

      setPDFButton(() => async () => {
        const blob = await pdf(<Doc />).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `report-${selectedDate}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
      });
    };

    load();
  }, [records, companyName, selectedDate]);

  return (
    <button
      onClick={PDFButton}
      disabled={disabled || !PDFButton}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
    >
      {PDFButton ? 'تصدير PDF' : 'جارٍ التحميل...'}
    </button>
  );
}
