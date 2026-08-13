import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatVND, formatDateVN } from '../utils/storage';
import { 
  Boxes, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  AlertTriangle, 
  Search, 
  Fish, 
  CheckCircle2, 
  X,
  PackageCheck,
  TrendingDown,
  Edit2
} from 'lucide-react';

export const InventoryManagement = ({ 
  inventory, 
  onSaveInventory, 
  onAddTransactionFromInventory 
}) => {
  const { permissions, user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Stock In Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [importQty, setImportQty] = useState('');
  const [importUnitPrice, setImportUnitPrice] = useState('');
  const [autoCreateExpense, setAutoCreateExpense] = useState(true);
  const [importNote, setImportNote] = useState('');

  // Compute Total Inventory Valuation
  const totalValuation = useMemo(() => {
    return inventory.reduce((sum, item) => sum + (Number(item.stockQuantity) * Number(item.avgImportPrice)), 0);
  }, [inventory]);

  // Compute Low Stock Count
  const lowStockCount = useMemo(() => {
    return inventory.filter(item => Number(item.stockQuantity) <= Number(item.minQuantity)).length;
  }, [inventory]);

  // Filtered Inventory List
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
      }
      return true;
    });
  }, [inventory, selectedCategory, searchQuery]);

  const handleOpenImportModal = (item = null) => {
    setSelectedItem(item || inventory[0]);
    setImportQty('');
    setImportUnitPrice(item ? item.avgImportPrice : '');
    setImportNote('');
    setIsImportModalOpen(true);
  };

  const handleImportSubmit = (e) => {
    e.preventDefault();
    const qty = parseFloat(importQty);
    const price = parseFloat(importUnitPrice);

    if (!selectedItem || isNaN(qty) || qty <= 0 || isNaN(price) || price < 0) {
      alert('Vui lòng nhập số lượng và đơn giá nhập hợp lệ!');
      return;
    }

    const totalCost = qty * price;

    // Update Inventory Stock
    const updatedInventory = inventory.map(item => {
      if (item.id === selectedItem.id) {
        const newQty = Number(item.stockQuantity) + qty;
        // Weighted average import price
        const newAvgPrice = Math.round(
          ((Number(item.stockQuantity) * Number(item.avgImportPrice)) + totalCost) / newQty
        );
        return {
          ...item,
          stockQuantity: newQty,
          avgImportPrice: newAvgPrice,
          lastImportDate: new Date().toISOString().slice(0, 10)
        };
      }
      return item;
    });

    onSaveInventory(updatedInventory);

    // Auto create Expense transaction if checked
    if (autoCreateExpense && onAddTransactionFromInventory) {
      onAddTransactionFromInventory({
        id: `tx_inv_${Date.now()}`,
        type: 'EXPENSE',
        amount: totalCost,
        category: 'exp_seafood',
        categoryName: 'Nhập Hải sản tươi sống',
        date: new Date().toISOString().slice(0, 10),
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        note: `Nhập kho: ${qty} ${selectedItem.unit} ${selectedItem.name} (${formatVND(price)}/${selectedItem.unit}) ${importNote ? '• ' + importNote : ''}`,
        createdByName: user?.name || 'Tài khoản Quản Lý',
        createdByRole: user?.role || 'MANAGER'
      });
    }

    setIsImportModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-3xl border border-amber-500/20">
        <div>
          <h1 className="text-2xl font-black font-heading gold-gradient-text flex items-center gap-2">
            KHO HẢI SẢN & VẬT TƯ
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Quản lý số lượng tồn, giá nhập trung bình & nhật ký nhập hàng hải sản
          </p>
        </div>

        {permissions.canModifyInventory && (
          <button
            onClick={() => handleOpenImportModal()}
            className="px-4 py-2.5 rounded-xl gold-gradient-bg text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition"
          >
            <Plus size={18} />
            <span>Nhập Kho Hải Sản Mới</span>
          </button>
        )}
      </div>

      {/* Stats Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-3xl border border-amber-500/15">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase">TỔNG GIÁ TRỊ TỒN KHO</span>
            <Boxes className="text-amber-400" size={20} />
          </div>
          <div className="text-2xl font-black text-amber-300 font-heading">
            {formatVND(totalValuation)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Tính theo giá nhập trung bình</p>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-amber-500/15">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase">TỔNG MẶT HÀNG KHO</span>
            <Fish className="text-blue-400" size={20} />
          </div>
          <div className="text-2xl font-black text-slate-100 font-heading">
            {inventory.length} <span className="text-xs text-slate-400 font-normal">Mặt hàng</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Hải sản & Đồ uống</p>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-amber-500/15">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase">CẢNH BÁO SẮP HẾT</span>
            <AlertTriangle className={lowStockCount > 0 ? 'text-red-400 animate-pulse' : 'text-slate-500'} size={20} />
          </div>
          <div className={`text-2xl font-black font-heading ${lowStockCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {lowStockCount} <span className="text-xs font-normal">Sản phẩm cần nhập</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Dưới định mức an toàn</p>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="glass-panel p-4 rounded-3xl border border-amber-500/15 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm tên hải sản, loại sản phẩm..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-ocean-900 border border-slate-700 text-slate-100 text-xs focus:border-amber-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['ALL', 'Hải sản tươi sống', 'Hải sản cao cấp', 'Đồ uống'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedCategory === cat
                  ? 'gold-gradient-bg text-slate-950 font-bold'
                  : 'text-slate-400 bg-ocean-900 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'Tất cả' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="glass-panel rounded-3xl border border-amber-500/15 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-ocean-900/90 text-amber-300 font-bold uppercase tracking-wider border-b border-amber-500/20">
              <tr>
                <th className="py-3.5 px-4">Tên Mặt Hàng</th>
                <th className="py-3.5 px-4">Phân Loại</th>
                <th className="py-3.5 px-4 text-center">ĐVT</th>
                <th className="py-3.5 px-4 text-right">Số Lượng Tồn</th>
                <th className="py-3.5 px-4 text-right">Định Mức Tồn Min</th>
                <th className="py-3.5 px-4 text-right">Giá Nhập TB (VNĐ)</th>
                <th className="py-3.5 px-4 text-right">Tổng Giá Trị</th>
                <th className="py-3.5 px-4 text-center">Trạng Thái</th>
                {permissions.canModifyInventory && <th className="py-3.5 px-4 text-center">Nhập Hàng</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredInventory.map((item) => {
                const isLow = Number(item.stockQuantity) <= Number(item.minQuantity);
                const itemTotal = Number(item.stockQuantity) * Number(item.avgImportPrice);

                return (
                  <tr key={item.id} className="hover:bg-ocean-900/40 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-100 flex items-center gap-2">
                      <Fish size={16} className="text-amber-400 shrink-0" />
                      <span>{item.name}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="bg-ocean-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px]">
                        {item.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-semibold text-amber-300">
                      {item.unit}
                    </td>

                    <td className="py-3.5 px-4 text-right font-black text-sm text-slate-100">
                      {item.stockQuantity}
                    </td>

                    <td className="py-3.5 px-4 text-right text-slate-400">
                      {item.minQuantity} {item.unit}
                    </td>

                    <td className="py-3.5 px-4 text-right font-medium">
                      {formatVND(item.avgImportPrice)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-amber-400">
                      {formatVND(itemTotal)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {isLow ? (
                        <span className="bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] font-extrabold px-2 py-0.5 rounded-full inline-flex items-center gap-1 animate-pulse">
                          <AlertTriangle size={10} /> SẮP HẾT
                        </span>
                      ) : (
                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <CheckCircle2 size={10} /> ĐỦ TỒN
                        </span>
                      )}
                    </td>

                    {permissions.canModifyInventory && (
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleOpenImportModal(item)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 font-bold text-[11px] transition inline-flex items-center gap-1"
                        >
                          <Plus size={12} /> Nhập Thêm
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock In Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl glass-panel bg-ocean-950/95 border border-amber-500/30 p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-black text-amber-300 font-heading flex items-center gap-2">
                <PackageCheck size={20} /> NHẬP KHO HẢI SẢN / VẬT TƯ
              </h3>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleImportSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Mặt hàng nhập kho</label>
                <select
                  value={selectedItem?.id || ''}
                  onChange={(e) => {
                    const found = inventory.find(i => i.id === e.target.value);
                    setSelectedItem(found);
                    if (found) setImportUnitPrice(found.avgImportPrice);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-ocean-900 border border-slate-700 text-slate-100 focus:border-amber-500 outline-none"
                >
                  {inventory.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} (Tồn hiện tại: {item.stockQuantity} {item.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Số lượng nhập ({selectedItem?.unit || 'Kg'})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={importQty}
                    onChange={(e) => setImportQty(e.target.value)}
                    placeholder="Ví dụ: 10"
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-ocean-900 border border-slate-700 text-amber-300 font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Đơn giá nhập / {selectedItem?.unit || 'Kg'}
                  </label>
                  <input
                    type="number"
                    value={importUnitPrice}
                    onChange={(e) => setImportUnitPrice(e.target.value)}
                    placeholder="VNĐ"
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-ocean-900 border border-slate-700 text-amber-300 font-bold outline-none"
                  />
                </div>
              </div>

              {/* Total Calculation Preview */}
              {importQty && importUnitPrice && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-slate-200">
                  <span>Tổng tiền nhập hàng:</span>
                  <span className="text-base font-black text-amber-300 font-heading">
                    {formatVND(Number(importQty) * Number(importUnitPrice))}
                  </span>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Ghi chú vựa/nhà cung cấp</label>
                <input
                  type="text"
                  value={importNote}
                  onChange={(e) => setImportNote(e.target.value)}
                  placeholder="Ví dụ: Nhập từ vựa hải sản Chợ Đầm..."
                  className="w-full px-3 py-2 rounded-xl bg-ocean-900 border border-slate-700 text-slate-100 outline-none"
                />
              </div>

              {/* Checkbox: Auto create Expense */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="autoExpense"
                  checked={autoCreateExpense}
                  onChange={(e) => setAutoCreateExpense(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-ocean-900 border-slate-700"
                />
                <label htmlFor="autoExpense" className="text-slate-300 text-[11px] cursor-pointer">
                  Tự động ghi nhận 1 khoản <b>CHI</b> tương ứng vào Sổ Thu Chi Lem Quán
                </label>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-ocean-900 text-slate-300 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl gold-gradient-bg text-slate-950 font-extrabold shadow-lg"
                >
                  XÁC NHẬN NHẬP KHO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
