'use client';
import { useEffect, useState } from 'react';

export default function ArabicPDFExport({ records, summary, companyName, selectedDate, disabled = false }: any) {
  const [PDFButton, setPDFButton] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { Document, Page, Text, View, StyleSheet, Font, pdf } = await import('@react-pdf/renderer');

        // استخدم خط من @fontsource Cairo
     Font.register({
     family: 'Cairo',
      fonts: [
        {
          src: 'https://cdn.jsdelivr.net/npm/@fontsource/cairo@5.0.0/files/cairo-arabic-400-normal.ttf',
          fontWeight: 400,
        }
      ]
        });
        const styles = StyleSheet.create({
          page: {
            paddingTop: 40,
            paddingBottom: 40,
            paddingLeft: 40,
            paddingRight: 40,
            fontFamily: 'Cairo'
          },
          header: {
            fontSize: 22,
            marginBottom: 6,
            textAlign: 'right',
            color: '#1E3A8A'
          },
          subHeader: {
            fontSize: 13,
            marginBottom: 24,
            textAlign: 'right',
            color: '#475569'
          },

          // Summary - بدون row-reverse
          summary: {
            flexDirection: 'row',
            marginBottom: 20,
            gap: 8
          },
          statBox: {
            flex: 1,
            backgroundColor: '#F1F5F9',
            padding: 10,
            borderRadius: 4,
            alignItems: 'center'
          },
          statNum: {
            fontSize: 20,
            textAlign: 'center',
            color: '#1D4ED8'
          },
          statLabel: {
            fontSize: 9,
            textAlign: 'center',
            color: '#64748B',
            marginTop: 4
          },

          // Table - عرض ثابت لكل خلية
          table: { marginTop: 10, width: '100%' },
          tableHeader: {
            flexDirection: 'row',
            backgroundColor: '#1E3A8A',
            paddingVertical: 8,
            paddingHorizontal: 4
          },
          tableRow: {
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderBottomColor: '#E2E8F0',
            paddingVertical: 7,
            paddingHorizontal: 4
          },

          // عرض ثابت لكل عمود بدل flex:1
          cellName: { width: '25%', fontSize: 10, textAlign: 'right', color: '#334155', paddingHorizontal: 3 },
          cellDept: { width: '25%', fontSize: 10, textAlign: 'right', color: '#334155', paddingHorizontal: 3 },
          cellTime: { width: '18%', fontSize: 10, textAlign: 'center', color: '#334155', paddingHorizontal: 3 },
          cellType: { width: '15%', fontSize: 10, textAlign: 'center', color: '#334155', paddingHorizontal: 3 },
          cellStatus: { width: '17%', fontSize: 10, textAlign: 'center', color: '#334155', paddingHorizontal: 3 },

          headerCellName: { width: '25%', fontSize: 10, textAlign: 'right', color: '#FFFFFF', paddingHorizontal: 3 },
          headerCellDept: { width: '25%', fontSize: 10, textAlign: 'right', color: '#FFFFFF', paddingHorizontal: 3 },
          headerCellTime: { width: '18%', fontSize: 10, textAlign: 'center', color: '#FFFFFF', paddingHorizontal: 3 },
          headerCellType: { width: '15%', fontSize: 10, textAlign: 'center', color: '#FFFFFF', paddingHorizontal: 3 },
          headerCellStatus: { width: '17%', fontSize: 10, textAlign: 'center', color: '#FFFFFF', paddingHorizontal: 3 },
        });

        const Doc = () => (
          <Document>
            <Page size="A4" style={styles.page}>
              <Text style={styles.header}>{companyName}</Text>
              <Text style={styles.subHeader}>
                {`تقرير الحضور اليومي - ${new Date(selectedDate).toLocaleDateString('ar-SA')}`}
              </Text>

              {/* Summary */}
              <View style={styles.summary}>
                <View style={styles.statBox}>
                  <Text style={styles.statNum}>{summary?.absent || 0}</Text>
                  <Text style={styles.statLabel}>غائبين</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statNum}>{summary?.late || 0}</Text>
                  <Text style={styles.statLabel}>متأخرين</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statNum}>{summary?.onTime || 0}</Text>
                  <Text style={styles.statLabel}>في الوقت</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statNum}>{summary?.total || 0}</Text>
                  <Text style={styles.statLabel}>إجمالي السجلات</Text>
                </View>
              </View>

              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={styles.headerCellName}>الموظف</Text>
                <Text style={styles.headerCellDept}>القسم</Text>
                <Text style={styles.headerCellTime}>الوقت</Text>
                <Text style={styles.headerCellType}>النوع</Text>
                <Text style={styles.headerCellStatus}>الحالة</Text>
              </View>

              {/* Table Rows */}
              <View style={styles.table}>
                {records.map((r: any, i: number) => (
                  <View key={i} style={[styles.tableRow, {
                    backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#F8FAFC'
                  }]}>
                    <Text style={styles.cellName}>{r.user?.name || r.employee?.name || 'غير معروف'}</Text>
                    <Text style={styles.cellDept}>{r.user?.department?.name || r.employee?.department?.name || 'غير محدد'}</Text>
                    <Text style={styles.cellTime}>{r.time}</Text>
                    <Text style={styles.cellType}>{r.type === 'IN' ? 'دخول' : 'خروج'}</Text>
                    <Text style={styles.cellStatus}>
                      {r.status === 'ON_TIME' ? 'في الوقت' : r.status === 'LATE' ? 'متأخر' : 'خروج'}
                    </Text>
                  </View>
                ))}
              </View>
            </Page>
          </Document>
        );

        setPDFButton(() => async () => {
          const blob = await pdf(<Doc />).toBlob();
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `attendance-${selectedDate}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        });
      } catch (err) {
        console.error('PDF load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [records, companyName, selectedDate, summary]);

  return (
    <button
      onClick={PDFButton || undefined}
      disabled={disabled || !PDFButton}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
    >
      {loading ? 'جاري التحميل...' : PDFButton ? 'تصدير PDF' : 'تصدير PDF'}
    </button>
  );
}