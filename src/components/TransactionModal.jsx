import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { TRANSACTION_CATEGORIES } from '../utils/mockData';
import { getTodayString } from '../utils/storage';
import { X, PlusCircle, Upload, CheckCircle2, TrendingUp, TrendingDown, Image, Calendar, Tag, FileText, AlertTriangle, Lock } from 'lucide-react';

export const TransactionModal = ({ isOpen, onClose, onSaveTransaction, initialData = null }) => {
  const { user } = useAuth();

  const [type, setType] = useState('INCOME');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(getTodayString());
  const [time, setTime] = useState('12:00');
  const [note, setNote] = useState('');
  const [invoiceUrl, setInvoiceUrl] = useState('');
  const [previewImage, setPreviewImage] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    setValidationError('');
    if (initialData) {
      setType(initialData.type || 'INCOME');
      setAmount(initialData.amount ? String(initialData.amount) : '');
      setCategory(initialData.category || '');
      setDate(initialData.date || getTodayString());
      setTime(initialData.time || '12:00');
      setNote(initialData.note || '');
      setInvoiceUrl(initialData.invoiceUrl || '');
      setPreviewImage(initialData.invoiceUrl || '');
    } else {
      setType('INCOME');
      setAmount('');
      setCategory(TRANSACTION_CATEGORIES.INCOME[0].id);
      setDate(getTodayString());
      const now = new Date();
      setTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
      setNote('');
      setInvoiceUrl('');
      setPreviewImage('');
    }
  }, [initialData, isOpen]);

  const handleTypeChange = (newType) => {
    setType(newType);
    const catList = newType === 'INCOME' ? TRANSACTION_CATEGORIES.INCOME : TRANSACTION_CATEGORIES.EXPENSE;
    setCategory(catList[0].id);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInvoiceUrl(reader.result);
        setPreviewImage(reader.result);
        setValidationError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    const numAmount = parseFloat(amount.replace(/[^0-9]/g, ''));
    if (isNaN(numAmount) || numAmount <= 0) {
      setValidationError('Vui lòng nhập số tiền hợp lệ lớn hơn 0!');
      return;
    }

    // STRICT MANDATORY INVOICE REQUIREMENT
    if (!invoiceUrl || !invoiceUrl.trim()) {
      setValidationError('⚠️ BẮT BUỘC TẢI ẢNH HÓA ĐƠN / CHỨNG TỪ MỚI CÓ THỂ LƯU GIAO DỊCH!');
      return;
    }

    const catList = type === 'INCOME' ? TRANSACTION_CATEGORIES.INCOME : TRANSACTION_CATEGORIES.EXPENSE;
    const catObj = catList.find(c => c.id === category) || catList[0];

    const transactionData = {
      id: initialData?.id || `tx_${Date.now()}`,
      type,
      amount: numAmount,
      category: catObj.id,
      categoryName: catObj.name,
      date,
      time,
      note: note.trim() || catObj.name,
      createdByName: user?.name || 'Tài khoản Lem Quán',
      createdByRole: user?.role || 'MANAGER',
      invoiceUrl: invoiceUrl
    };

    onSaveTransaction(transactionData);
    onClose();
  };

  if (!isOpen) return null;

  const currentCategories = type === 'INCOME' ? TRANSACTION_CATEGORIES.INCOME : TRANSACTION_CATEGORIES.EXPENSE;
  const isInvoiceMissing = !invoiceUrl || !invoiceUrl.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in no-print">
      <div className="w-full max-w-lg rounded-3xl glass-panel bg-ocean-950/95 border border-amber-500/30 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className={`p-2.5 rounded-2xl ${type === 'INCOME' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
              {type === 'INCOME' ? <TrendingUp size={22} /> : <TrendingDown size={22} />}
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-100 font-heading">
                {initialData ? 'CHỈNH SỬA GIAO DỊCH' : 'NHẬP GIAO DỊCH THU / CHI MỚI'}
              </h3>
              <p className="text-xs text-red-400 font-bold">⚠️ Bắt buộc phải đính kèm ảnh Hóa đơn mới cho phép Lưu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-ocean-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Validation Warning Alert */}
        {validationError && (
          <div className="mb-4 p-3 rounded-2xl bg-red-500/20 border border-red-500/50 text-red-300 text-xs font-bold flex items-center gap-2 animate-shake">
            <AlertTriangle size={18} className="shrink-0 text-red-400" />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Switcher: Thu vs Chi */}
          <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-ocean-900 border border-slate-800">
            <button
              type="button"
              onClick={() => handleTypeChange('INCOME')}
              className={`py-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition ${
                type === 'INCOME'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp size={16} />
              <span>GIAO DỊCH THU (+ Doanh Thu)</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('EXPENSE')}
              className={`py-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition ${
                type === 'EXPENSE'
                  ? 'bg-red-500 text-white shadow-md shadow-red-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingDown size={16} />
              <span>GIAO DỊCH CHI (- Chi Phí)</span>
            </button>
          </div>

          {/* Amount Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Số tiền (VNĐ) <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={amount ? Number(amount.replace(/[^0-9]/g, '')).toLocaleString('vi-VN') : ''}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Ví dụ: 15.000.000"
                required
                className="w-full px-4 py-3 rounded-xl bg-ocean-900 border border-slate-700 text-amber-300 font-extrabold text-lg focus:border-amber-500 outline-none transition"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                VNĐ
              </span>
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Tag size={14} className="text-amber-400" />
              Danh mục {type === 'INCOME' ? 'Thu nhập' : 'Chi phí'} <span className="text-red-400">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-ocean-900 border border-slate-700 text-slate-100 text-sm focus:border-amber-500 outline-none transition"
            >
              {currentCategories.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-ocean-950 text-slate-100 py-1">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Calendar size={14} className="text-amber-400" /> Ngày ghi nhận
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl bg-ocean-900 border border-slate-700 text-slate-100 text-sm focus:border-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Thời gian
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-ocean-900 border border-slate-700 text-slate-100 text-sm focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <FileText size={14} className="text-amber-400" /> Ghi chú nội dung giao dịch
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập tên bàn, loại hải sản nhập, tên vựa hoặc diễn giải chi tiết..."
              className="w-full px-4 py-2.5 rounded-xl bg-ocean-900 border border-slate-700 text-slate-100 text-sm focus:border-amber-500 outline-none"
            />
          </div>

          {/* MANDATORY INVOICE ATTACHMENT UPLOAD */}
          <div className={`p-4 rounded-2xl bg-ocean-900/90 border transition-all ${isInvoiceMissing ? 'border-red-500/60 shadow-lg shadow-red-500/10' : 'border-emerald-500/60'}`}>
            <label className="block text-xs font-extrabold text-amber-300 flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5">
                <Image size={16} className="text-amber-400" />
                Đính kèm ảnh Hóa đơn / Biểu mẫu
              </span>
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${isInvoiceMissing ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-500 text-slate-950'}`}>
                {isInvoiceMissing ? 'BẮT BUỘC 100%' : 'ĐÃ TẢI HÓA ĐƠN ✓'}
              </span>
            </label>
            
            <div className="flex items-center gap-3">
              <label className={`flex-1 cursor-pointer p-3.5 rounded-xl bg-ocean-950 border border-dashed transition flex items-center justify-center gap-2 ${isInvoiceMissing ? 'border-red-500/60 hover:border-red-400' : 'border-emerald-500/60'}`}>
                <Upload size={18} className={isInvoiceMissing ? 'text-red-400' : 'text-emerald-400'} />
                <span className={`font-bold text-xs ${isInvoiceMissing ? 'text-red-300' : 'text-emerald-300'}`}>
                  {previewImage ? 'Thay đổi ảnh hóa đơn' : 'BẤM VÀO ĐÂY ĐỂ TẢI ẢNH HÓA ĐƠN *'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {previewImage && (
                <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-emerald-400 group shrink-0 shadow-md">
                  <img src={previewImage} alt="Hóa đơn" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setInvoiceUrl(''); setPreviewImage(''); }}
                    className="absolute inset-0 bg-red-950/80 text-red-300 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-[10px] font-bold"
                  >
                    Hủy ảnh
                  </button>
                </div>
              )}
            </div>
            
            {isInvoiceMissing && (
              <p className="text-[11px] text-red-400 font-bold mt-2 flex items-center gap-1">
                <Lock size={12} /> Nút "LƯU GIAO DỊCH" sẽ bị khóa cho đến khi chọn ảnh Hóa đơn đính kèm.
              </p>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-ocean-900 text-slate-300 text-xs font-bold border border-slate-700 hover:bg-ocean-800 transition"
            >
              Hủy Bỏ
            </button>

            <button
              type="submit"
              disabled={isInvoiceMissing}
              className={`px-6 py-2.5 rounded-xl font-extrabold text-xs shadow-lg transition flex items-center gap-2 ${
                isInvoiceMissing 
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60' 
                  : 'gold-gradient-bg text-slate-950 shadow-amber-500/25 hover:shadow-amber-500/40'
              }`}
            >
              {isInvoiceMissing ? <Lock size={14} /> : <CheckCircle2 size={16} />}
              <span>{isInvoiceMissing ? 'KHÓA LƯU (THIẾU HÓA ĐƠN)' : (initialData ? 'CẬP NHẬT GIAO DỊCH' : 'LƯU GIAO DỊCH')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
