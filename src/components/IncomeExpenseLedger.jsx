import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatVND, formatDateVN } from '../utils/storage';
import { exportTransactionsToExcel } from '../utils/exportUtils';
import { TRANSACTION_CATEGORIES } from '../utils/mockData';
import { 
  Search, 
  Filter, 
  PlusCircle, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  Trash2, 
  Edit3, 
  Eye, 
  FileText, 
  Image, 
  ChevronLeft, 
  ChevronRight,
  X,
  AlertCircle,
  Calendar,
  Lock
} from 'lucide-react';

export const IncomeExpenseLedger = ({ 
  transactions, 
  onSaveTransaction, 
  onDeleteTransaction, 
  onOpenAddTransaction 
}) => {
  const { role, permissions } = useAuth();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'INCOME', 'EXPENSE'
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected Invoice Preview Modal
  const [viewInvoiceUrl, setViewInvoiceUrl] = useState(null);

  // Filtered Data Computation
  const filteredData = useMemo(() => {
    return transactions.filter(t => {
      // Type Filter
      if (filterType !== 'ALL' && t.type !== filterType) return false;

      // Category Filter
      if (filterCategory !== 'ALL' && t.category !== filterCategory) return false;

      // Date Range Filter
      if (startDate && t.date < startDate) return false;
      if (endDate && t.date > endDate) return false;

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const noteMatch = (t.note || '').toLowerCase().includes(query);
        const catMatch = (t.categoryName || '').toLowerCase().includes(query);
        const userMatch = (t.createdByName || '').toLowerCase().includes(query);
        const amountMatch = String(t.amount).includes(query);
        return noteMatch || catMatch || userMatch || amountMatch;
      }

      return true;
    });
  }, [transactions, filterType, filterCategory, startDate, endDate, searchQuery]);

  // Paginated Subset
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const handleExportExcel = () => {
    exportTransactionsToExcel(filteredData, 'So_Thu_Chi_Lem_Quan');
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterType('ALL');
    setFilterCategory('ALL');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Top Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-3xl border border-amber-500/20">
        <div>
          <h1 className="text-2xl font-black font-heading gold-gradient-text flex items-center gap-2">
            SỔ THU CHI LEM QUÁN
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Quản lý và tra cứu toàn bộ danh sách hóa đơn Thu & Chi theo thời gian
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportExcel}
            className="px-4 py-2.5 rounded-xl bg-ocean-900 border border-slate-700 hover:border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-2 transition hover:bg-ocean-800"
          >
            <Download size={16} />
            <span>Xuất Excel (.xlsx)</span>
          </button>

          {permissions.canAddTransaction && (
            <button
              onClick={onOpenAddTransaction}
              className="px-4 py-2.5 rounded-xl gold-gradient-bg text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition"
            >
              <PlusCircle size={16} />
              <span>Nhập Thu / Chi Mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar Panel */}
      <div className="glass-panel p-5 rounded-3xl border border-amber-500/15 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Keyword Search */}
          <div className="relative lg:col-span-2">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Tìm theo ghi chú, danh mục, số tiền, người tạo..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-ocean-900 border border-slate-700 text-slate-100 text-xs focus:border-amber-500 outline-none transition"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2.5 rounded-xl bg-ocean-900 border border-slate-700 text-slate-200 text-xs focus:border-amber-500 outline-none"
            >
              <option value="ALL">Tất cả Loại (Thu & Chi)</option>
              <option value="INCOME">Chỉ Thu (Doanh thu)</option>
              <option value="EXPENSE">Chỉ Chi (Chi phí)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={filterCategory}
              onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2.5 rounded-xl bg-ocean-900 border border-slate-700 text-slate-200 text-xs focus:border-amber-500 outline-none"
            >
              <option value="ALL">Tất cả Danh mục</option>
              <optgroup label="Danh mục THU">
                {TRANSACTION_CATEGORIES.INCOME.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </optgroup>
              <optgroup label="Danh mục CHI">
                {TRANSACTION_CATEGORIES.EXPENSE.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Clear Filters Button */}
          <div>
            <button
              onClick={handleClearFilters}
              className="w-full py-2.5 px-3 rounded-xl bg-ocean-900 text-slate-400 hover:text-white border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <X size={14} /> Xóa bộ lọc
            </button>
          </div>
        </div>

        {/* Date Range Picker */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800/80 text-xs text-slate-300">
          <span className="font-semibold text-amber-400 flex items-center gap-1">
            <Calendar size={14} /> Lọc theo khoảng ngày:
          </span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-ocean-900 border border-slate-700 text-slate-100 text-xs outline-none"
            />
            <span>đến</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-ocean-900 border border-slate-700 text-slate-100 text-xs outline-none"
            />
          </div>
          <span className="text-slate-500 ml-auto">
            Hiển thị <span className="text-amber-300 font-bold">{filteredData.length}</span> / {transactions.length} giao dịch
          </span>
        </div>
      </div>

      {/* Transactions Table Container */}
      <div className="glass-panel rounded-3xl border border-amber-500/15 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-ocean-900/90 text-amber-300 font-bold uppercase tracking-wider border-b border-amber-500/20">
              <tr>
                <th className="py-3.5 px-4">Loại</th>
                <th className="py-3.5 px-4">Ngày / Giờ</th>
                <th className="py-3.5 px-4">Danh mục</th>
                <th className="py-3.5 px-4">Ghi chú chi tiết</th>
                <th className="py-3.5 px-4 text-right">Số tiền (VNĐ)</th>
                <th className="py-3.5 px-4">Người tạo</th>
                <th className="py-3.5 px-4 text-center">Hóa đơn</th>
                <th className="py-3.5 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <AlertCircle size={32} className="mx-auto text-amber-500/40 mb-2" />
                    Không tìm thấy giao dịch nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                paginatedData.map((t) => {
                  const isIncome = t.type === 'INCOME';

                  return (
                    <tr key={t.id} className="hover:bg-ocean-900/40 transition group">
                      {/* Type Badge */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-extrabold text-[11px] ${
                          isIncome 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}>
                          {isIncome ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {isIncome ? 'THU' : 'CHI'}
                        </span>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-200">
                        <div>{formatDateVN(t.date)}</div>
                        <div className="text-[10px] text-slate-400">{t.time || '12:00'}</div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 font-semibold text-slate-200">
                        {t.categoryName || t.category}
                      </td>

                      {/* Notes */}
                      <td className="py-3.5 px-4 max-w-xs truncate text-slate-300">
                        {t.note || '—'}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right font-black font-heading text-sm">
                        <span className={isIncome ? 'text-emerald-400' : 'text-red-400'}>
                          {isIncome ? '+' : '-'}{formatVND(t.amount)}
                        </span>
                      </td>

                      {/* Created By */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="bg-ocean-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px]">
                          {t.createdByName}
                        </span>
                      </td>

                      {/* Invoice Image Preview Button */}
                      <td className="py-3.5 px-4 text-center">
                        {t.invoiceUrl ? (
                          <button
                            onClick={() => setViewInvoiceUrl(t.invoiceUrl)}
                            className="p-1.5 rounded-lg bg-amber-500/15 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 transition inline-flex items-center gap-1"
                            title="Xem hóa đơn đính kèm"
                          >
                            <Image size={14} />
                            <span className="text-[10px] font-bold">Xem</span>
                          </button>
                        ) : (
                          <span className="text-slate-600 text-[10px]">Không</span>
                        )}
                      </td>

                      {/* Action Buttons with Strict RBAC Control */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Admin Edit Button */}
                          {permissions.canEditTransaction && (
                            <button
                              onClick={() => onSaveTransaction(t)}
                              className="p-1.5 rounded-lg bg-ocean-800 text-slate-300 hover:text-white hover:bg-ocean-700 transition"
                              title="Chỉnh sửa giao dịch"
                            >
                              <Edit3 size={14} />
                            </button>
                          )}

                          {/* Strictly Admin Delete Button! Manager & Shareholder DO NOT SEE THIS BUTTON */}
                          {permissions.canDeleteTransaction ? (
                            <button
                              onClick={() => {
                                if (window.confirm(`Bạn có chắc chắn muốn xóa giao dịch "${t.note}" (${formatVND(t.amount)})?`)) {
                                  onDeleteTransaction(t.id);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition"
                              title="Xóa giao dịch (Chỉ Admin)"
                            >
                              <Trash2 size={14} />
                            </button>
                          ) : (
                            /* Visual Indicator for Quản lý / Cổ đông that delete is disabled for transparency */
                            <span 
                              className="text-[10px] text-slate-500 italic bg-ocean-900/60 px-2 py-1 rounded border border-slate-800 flex items-center gap-1"
                              title="Tài khoản Quản Lý / Cổ Đông không được phép xóa giao dịch để đảm bảo tính minh bạch tài chính"
                            >
                              <Lock size={10} className="text-amber-500/60" /> Khóa Xóa
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-ocean-900/90 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Trang <span className="text-amber-300 font-bold">{currentPage}</span> / {totalPages}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-ocean-800 text-slate-300 hover:bg-ocean-700 disabled:opacity-40 transition"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-ocean-800 text-slate-300 hover:bg-ocean-700 disabled:opacity-40 transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Attachment Preview Modal */}
      {viewInvoiceUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative max-w-xl w-full bg-ocean-900 p-4 rounded-3xl border border-amber-500/30 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-amber-300">Ảnh Hóa Đơn / Chứng Từ Đính Kèm</h4>
              <button
                onClick={() => setViewInvoiceUrl(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden max-h-[70vh] flex items-center justify-center bg-black">
              <img src={viewInvoiceUrl} alt="Hóa đơn" className="max-h-[65vh] object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
