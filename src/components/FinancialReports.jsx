import React, { useState, useMemo } from 'react';
import { formatVND, formatDateVN } from '../utils/storage';
import { exportFinancialReportToExcel, printDocument } from '../utils/exportUtils';
import { TRANSACTION_CATEGORIES } from '../utils/mockData';
import { 
  FileSpreadsheet, 
  Printer, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart as PieIcon, 
  Calendar, 
  ShieldCheck,
  CheckCircle2,
  Award,
  Sparkles
} from 'lucide-react';

export const FinancialReports = ({ transactions, settings }) => {
  const [reportPeriod, setReportPeriod] = useState('THIS_MONTH');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filter transactions for report
  const reportTransactions = useMemo(() => {
    const now = new Date();
    const currentMonthStr = now.toISOString().slice(0, 7);

    return transactions.filter(t => {
      if (!t.date) return false;
      if (reportPeriod === 'THIS_MONTH') {
        return t.date.startsWith(currentMonthStr);
      }
      if (reportPeriod === 'ALL') {
        return true;
      }
      if (reportPeriod === 'CUSTOM') {
        if (startDate && t.date < startDate) return false;
        if (endDate && t.date > endDate) return false;
        return true;
      }
      return true;
    });
  }, [transactions, reportPeriod, startDate, endDate]);

  // Aggregate Calculations
  const reportData = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    let seafoodExpense = 0;
    let operatingExpense = 0;

    const categoryMap = {};

    reportTransactions.forEach(t => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'INCOME') {
        totalIncome += amt;
      } else {
        totalExpense += amt;
        if (t.category === 'exp_seafood' || t.category === 'exp_drinks' || t.category === 'exp_ingredients') {
          seafoodExpense += amt;
        } else {
          operatingExpense += amt;
        }
      }

      // Track by Category Name
      const catName = t.categoryName || t.category;
      if (!categoryMap[catName]) {
        categoryMap[catName] = { name: catName, type: t.type, amount: 0 };
      }
      categoryMap[catName].amount += amt;
    });

    const netProfit = totalIncome - totalExpense;
    const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : '0';

    // Format Breakdown list with percentages
    const categoryBreakdown = Object.values(categoryMap).map(c => {
      const totalReference = c.type === 'INCOME' ? totalIncome : totalExpense;
      const percentage = totalReference > 0 ? ((c.amount / totalReference) * 100).toFixed(1) : '0';
      return {
        ...c,
        percentage
      };
    }).sort((a, b) => b.amount - a.amount);

    return {
      totalIncome,
      totalExpense,
      seafoodExpense,
      operatingExpense,
      netProfit,
      profitMargin,
      categoryBreakdown
    };
  }, [reportTransactions]);

  const getDateRangeLabel = () => {
    if (reportPeriod === 'THIS_MONTH') return `Tháng ${new Date().getMonth() + 1}/${new Date().getFullYear()}`;
    if (reportPeriod === 'ALL') return 'Toàn Bộ Thời Gian';
    return `${startDate ? formatDateVN(startDate) : 'Từ đầu'} đến ${endDate ? formatDateVN(endDate) : 'Hiện tại'}`;
  };

  const handleExportExcel = () => {
    exportFinancialReportToExcel(reportData, reportData.categoryBreakdown, getDateRangeLabel());
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Top Bar with Print & Excel Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-3xl border border-amber-500/20 no-print">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black font-heading gold-gradient-text">
              BÁO CÁO TÀI CHÍNH CỔ ĐÔNG
            </h1>
            <span className="bg-blue-500/20 text-blue-300 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-blue-500/30 flex items-center gap-1">
              <ShieldCheck size={14} /> Minh Bạch
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Báo cáo phân bổ doanh thu, giá vốn, chi phí vận hành & tỷ lệ chia cổ tức
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={printDocument}
            className="px-4 py-2.5 rounded-xl bg-ocean-900 border border-slate-700 hover:border-amber-500/40 text-slate-200 font-bold text-xs flex items-center gap-2 transition hover:bg-ocean-800"
          >
            <Printer size={16} />
            <span>In / Xuất PDF</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="px-4 py-2.5 rounded-xl gold-gradient-bg text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition"
          >
            <FileSpreadsheet size={16} />
            <span>Xuất Excel Báo Cáo</span>
          </button>
        </div>
      </div>

      {/* Date Range Selection Bar */}
      <div className="glass-panel p-4 rounded-3xl border border-amber-500/15 flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-2">
          <Calendar className="text-amber-400" size={18} />
          <span className="text-xs font-semibold text-slate-200">Kỳ báo cáo:</span>
        </div>

        <div className="flex items-center gap-2">
          {[
            { id: 'THIS_MONTH', label: 'Tháng Này' },
            { id: 'ALL', label: 'Tất Cả' },
            { id: 'CUSTOM', label: 'Tùy Chọn Ngày' }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setReportPeriod(p.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                reportPeriod === p.id
                  ? 'gold-gradient-bg text-slate-950 shadow-md'
                  : 'bg-ocean-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {reportPeriod === 'CUSTOM' && (
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-ocean-900 border border-slate-700 text-slate-100 outline-none"
            />
            <span>-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-ocean-900 border border-slate-700 text-slate-100 outline-none"
            />
          </div>
        )}
      </div>

      {/* Printable Report Document Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/20 space-y-8 bg-ocean-950/90 shadow-2xl">
        {/* Document Header */}
        <div className="border-b border-amber-500/20 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-100 font-heading tracking-wide uppercase">
              {settings.restaurantName}
            </h2>
            <p className="text-xs text-slate-400 mt-1">{settings.address} • Hotline: {settings.phone}</p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">
              BÁO CÁO THU CHI & LỢI NHUẬN
            </span>
            <span className="text-xs text-slate-300 font-medium">
              Kỳ: <span className="text-slate-100 font-bold">{getDateRangeLabel()}</span>
            </span>
          </div>
        </div>

        {/* 3 Major Financial Summary Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">TỔNG DOANH THU (THU)</span>
            <div className="text-2xl font-black text-emerald-400 font-heading">
              {formatVND(reportData.totalIncome)}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">100% Thu nhập hoạt động</span>
          </div>

          <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/30 text-center">
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider block mb-1">TỔNG CHI PHÍ (CHI)</span>
            <div className="text-2xl font-black text-red-400 font-heading">
              {formatVND(reportData.totalExpense)}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Giá vốn hải sản & vận hành</span>
          </div>

          <div className="p-5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-center relative overflow-hidden">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block mb-1">LỢI NHUẬN RÒNG CHIA CỔ TỨC</span>
            <div className="text-2xl font-black gold-gradient-text font-heading">
              {formatVND(reportData.netProfit)}
            </div>
            <span className="text-xs font-bold text-amber-400 mt-1 block">Tỷ suất lợi nhuận: {reportData.profitMargin}%</span>
          </div>
        </div>

        {/* Financial Breakdown Table */}
        <div>
          <h3 className="text-base font-bold text-slate-100 font-heading mb-3 flex items-center gap-2">
            <PieIcon size={18} className="text-amber-400" />
            BẢNG PHÂN BỔ CHI TIẾT DANH MỤC THU / CHI
          </h3>

          <div className="rounded-2xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-ocean-900 text-amber-300 font-bold uppercase border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">STT</th>
                  <th className="py-3 px-4">Loại</th>
                  <th className="py-3 px-4">Danh Mục Chi Phí / Thu Nhập</th>
                  <th className="py-3 px-4 text-right">Tổng Tiền (VNĐ)</th>
                  <th className="py-3 px-4 text-right">Tỷ Lệ / Tổng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {reportData.categoryBreakdown.map((cat, idx) => (
                  <tr key={idx} className="hover:bg-ocean-900/40">
                    <td className="py-3 px-4 font-bold text-slate-500">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded font-extrabold text-[10px] ${
                        cat.type === 'INCOME' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                      }`}>
                        {cat.type === 'INCOME' ? 'THU' : 'CHI'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-100">{cat.name}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-100">{formatVND(cat.amount)}</td>
                    <td className="py-3 px-4 text-right font-bold text-amber-300">{cat.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Signatures for Shareholder Reports */}
        <div className="pt-8 border-t border-slate-800 grid grid-cols-2 text-center text-xs text-slate-400">
          <div>
            <p className="font-bold text-slate-200">ĐẠI DIỆN BAN QUẢN LÝ</p>
            <p className="text-[10px] text-slate-500 mt-0.5">(Ký & ghi rõ họ tên)</p>
            <div className="h-16"></div>
            <p className="font-semibold text-amber-400">Trần Thị Quản Lý</p>
          </div>
          <div>
            <p className="font-bold text-slate-200">ĐẠI DIỆN HỘI ĐỒNG CỔ ĐÔNG</p>
            <p className="text-[10px] text-slate-500 mt-0.5">(Ký & xác nhận)</p>
            <div className="h-16"></div>
            <p className="font-semibold text-blue-400">Lê Văn Cổ Đông</p>
          </div>
        </div>
      </div>
    </div>
  );
};
