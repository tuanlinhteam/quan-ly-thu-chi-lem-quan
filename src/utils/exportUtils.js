import * as XLSX from 'xlsx';
import { formatVND, formatDateVN } from './storage';

export const exportTransactionsToExcel = (transactions, title = 'So_Thu_Chi_Lem_Quan') => {
  const formattedData = transactions.map((t, index) => ({
    'STT': index + 1,
    'Mã Giao Dịch': t.id,
    'Ngày Ghi Nhận': formatDateVN(t.date),
    'Giờ': t.time || '00:00',
    'Loại': t.type === 'INCOME' ? 'THU' : 'CHI',
    'Danh Mục': t.categoryName || t.category,
    'Số Tiền (VNĐ)': t.amount,
    'Người Tạo': t.createdByName,
    'Ghi Chú': t.note || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  
  // Set column widths
  const colWidths = [
    { wch: 6 },
    { wch: 12 },
    { wch: 14 },
    { wch: 8 },
    { wch: 8 },
    { wch: 25 },
    { wch: 18 },
    { wch: 20 },
    { wch: 35 }
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sổ Thu Chi');
  
  const fileName = `${title}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

export const exportFinancialReportToExcel = (summaryData, categoryBreakdown, dateRangeText) => {
  const overviewSheet = [
    { 'Chỉ số Tài Chính': 'Thời Gian Báo Cáo', 'Giá trị': dateRangeText },
    { 'Chỉ số Tài Chính': 'Tổng Doanh Thu (Thu)', 'Giá trị': formatVND(summaryData.totalIncome) },
    { 'Chỉ số Tài Chính': 'Tổng Chi Phí (Chi)', 'Giá trị': formatVND(summaryData.totalExpense) },
    { 'Chỉ số Tài Chính': 'Lợi Nhuận Ròng', 'Giá trị': formatVND(summaryData.netProfit) },
    { 'Chỉ số Tài Chính': 'Tỷ Suất Lợi Nhuận', 'Giá trị': `${summaryData.profitMargin}%` }
  ];

  const breakdownSheet = categoryBreakdown.map((c) => ({
    'Loại': c.type === 'INCOME' ? 'THU' : 'CHI',
    'Danh Mục Chi Phí / Thu Nhập': c.name,
    'Tổng Tiền (VNĐ)': c.amount,
    'Tỷ Lệ (%)': `${c.percentage}%`
  }));

  const workbook = XLSX.utils.book_new();
  
  const ws1 = XLSX.utils.json_to_sheet(overviewSheet);
  ws1['!cols'] = [{ wch: 30 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(workbook, ws1, 'Tổng Quan Tài Chính');

  const ws2 = XLSX.utils.json_to_sheet(breakdownSheet);
  ws2['!cols'] = [{ wch: 10 }, { wch: 30 }, { wch: 20 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(workbook, ws2, 'Chi Tiết Cơ Cấu');

  const fileName = `Bao_Cao_Tai_Chinh_Lem_Quan_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

export const printDocument = () => {
  window.print();
};
