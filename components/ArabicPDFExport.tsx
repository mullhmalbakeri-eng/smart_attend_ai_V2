'use client';

import { Document, Page, Text, View, StyleSheet, Font, PDFDownloadLink, BlobProvider } from '@react-pdf/renderer';
import { useState, useEffect } from 'react';

// Register Cairo font with absolute URL
Font.register({
  family: 'Cairo',
  src: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/fonts/Cairo-Regular.ttf`,
});

// Prepare text for PDF (no reshaping - react-pdf handles Arabic natively)
const prepareTextForPDF = (text: string): string => text || '';

// Prepare text for Excel (raw UTF-8)
const prepareTextForExcel = (text: string) => {
  return text; // Excel handles Arabic natively
};

// Define styles with RTL support
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Cairo',
    fontSize: 12,
    padding: 30,
    direction: 'rtl',
  },
  header: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#1a1a1a',
    fontFamily: 'Cairo',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
    fontFamily: 'Cairo',
  },
  date: {
    fontSize: 12,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
    fontFamily: 'Cairo',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Cairo',
  },
  table: {
    flexDirection: 'column',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row-reverse',
  },
  tableColHeader: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
    padding: 5,
    textAlign: 'right',
    fontWeight: 'bold',
    fontFamily: 'Cairo',
  },
  tableCol: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 5,
    textAlign: 'right',
    fontFamily: 'Cairo',
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  summaryLabel: {
    width: '30%',
    textAlign: 'right',
    fontWeight: 'bold',
    fontFamily: 'Cairo',
  },
  summaryValue: {
    width: '70%',
    textAlign: 'right',
    fontFamily: 'Cairo',
  },
});

// PDF Download Component
export default function ArabicPDFExport({ 
  records, 
  summary, 
  companyName, 
  selectedDate, 
  disabled = false 
}: any) {
  // Font is registered at module level, no need to load here

  // PDF Document Component with UTF-8 encoding
  const PDFDocument = ({ records, summary, companyName, selectedDate }: any) => {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          {/* Header */}
          <Text style={styles.header}>{prepareTextForPDF(companyName)}</Text>
          <Text style={styles.subtitle}>{prepareTextForPDF('تقرير الحضور اليومي')}</Text>
          <Text style={styles.date}>
            {prepareTextForPDF(new Date(selectedDate).toLocaleDateString('ar-SA'))}
          </Text>

          {/* Summary Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{prepareTextForPDF('ملخص الحضور:')}</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{prepareTextForPDF('إجمالي السجلات:')}</Text>
              <Text style={styles.summaryValue}>{summary.total}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{prepareTextForPDF('في الوقت:')}</Text>
              <Text style={styles.summaryValue}>{summary.onTime}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{prepareTextForPDF('متأخرين:')}</Text>
              <Text style={styles.summaryValue}>{summary.late}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{prepareTextForPDF('خروج:')}</Text>
              <Text style={styles.summaryValue}>{summary.out}</Text>
            </View>
          </View>

          {/* Table */}
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableColHeader}>{prepareTextForPDF('الموظف')}</Text>
              <Text style={styles.tableColHeader}>{prepareTextForPDF('القسم')}</Text>
              <Text style={styles.tableColHeader}>{prepareTextForPDF('الوقت')}</Text>
              <Text style={styles.tableColHeader}>{prepareTextForPDF('النوع')}</Text>
              <Text style={styles.tableColHeader}>{prepareTextForPDF('الحالة')}</Text>
            </View>
            {records.map((record: any, index: number) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCol}>
                  {prepareTextForPDF(record.user.name.substring(0, 15))}
                </Text>
                <Text style={styles.tableCol}>
                  {prepareTextForPDF(record.user.department?.name || '—')}
                </Text>
                <Text style={styles.tableCol}>{record.time}</Text>
                <Text style={styles.tableCol}>
                  {prepareTextForPDF(record.type === 'IN' ? 'دخول' : 'خروج')}
                </Text>
                <Text style={styles.tableCol}>{prepareTextForPDF(record.statusBadge.text)}</Text>
              </View>
            ))}
          </View>
        </Page>
      </Document>
    );
  };

  return (
    <BlobProvider document={<PDFDocument records={records} summary={summary} companyName={companyName} selectedDate={selectedDate} />}>
      {({ blob, url, loading, error }) => {
        if (loading) {
          return (
            <button 
              disabled 
              className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg flex items-center gap-2"
            >
              <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
              {prepareTextForPDF('جاري التحميل...')}
            </button>
          );
        }

        if (error) {
          console.error('PDF generation error:', error);
          return (
            <button disabled className="px-4 py-2 bg-red-300 text-red-600 rounded-lg">
              {prepareTextForPDF('فشل في إنشاء PDF')}
            </button>
          );
        }

        return (
          <button
            onClick={() => {
              if (blob && url) {
                const link = document.createElement('a');
                link.href = url;
                link.download = `attendance-report-${selectedDate}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }
            }}
            disabled={disabled}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {prepareTextForPDF('تصدير PDF')}
          </button>
        );
      }}
    </BlobProvider>
  );
}
