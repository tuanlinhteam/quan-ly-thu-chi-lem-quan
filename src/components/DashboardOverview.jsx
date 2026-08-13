import React, { useState, useMemo } from 'react';
import { formatVND, formatDateVN } from '../utils/storage';
import { TRANSACTION_CATEGORIES } from '../utils/mockData';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Percent, 
  Calendar, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight, 
  PieChart as PieIcon, 
  BarChart3, 
  Sparkles,
  PlusCircle,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  Cell, 
  PieChart as RePieChart, 
  Pie 
} from 'recharts';

export const DashboardOverview = ({ 
  transactions, 
  inventory, 
  settings, 
  onOpenAddTransaction, 
  onNavigateToLedger 
}) => {
  const [dateFilter, setDateFilter] = useState('ALL'); // 'TODAY', 'WEEK', 'MONTH', 'ALL'

  // Filter transactions based on date filter
  const filteredTransactions = useMemo(() => {
    if (dateFilter === 'ALL') return transactions;
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    return transactions.filter(t => {
      if (!t.date) return false;
      if (dateFilter === 'TODAY') {
        return t.date === todayStr;
      }
      if (dateFilter === 'WEEK') {
        const txDate = new Date(t.date);
        const diffTime = Math.abs(now - txDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      }
      if (dateFilter === 'MONTH') {
        return t.date.startsWith(now.toISOString().slice(0, 7));
      }
      return true;
    });
  }, [transactions, dateFilter]);

  // Aggregate Metrics
  const summary = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;

    filteredTransactions.forEach(t => {
      const val = Number(t.amount) || 0;
      if (t.type === 'INCOME') {
        totalIncome += val;
      } else if (t.type === 'EXPENSE') {
        totalExpense += val;
      }
    });

    const netProfit = totalIncome - totalExpense;
    const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : 0;
    const targetProgress = Math.min(Math.round((totalIncome / (settings.monthlyRevenueTarget || 350000000)) * 100), 100);

    return {
      totalIncome,
      totalExpense,
      netProfit,
      profitMargin,
      targetProgress
    };
  }, [filteredTransactions, settings]);

  // Prepare Bar Chart Data (Group by date)
  const barChartData = useMemo(() => {
    const map = {};
    // Sort transactions by date ascending
    const sorted = [...filteredTransactions].sort((a, b) => new Date(a.date) - new Date(b.date));

    sorted.forEach(t => {
      const dateKey = formatDateVN(t.date);
      if (!map[dateKey]) {
        map[dateKey] = { date: dateKey, Thu: 0, Chi: 0 };
      }
      if (t.type === 'INCOME') {
        map[dateKey].Thu += Number(t.amount);
      } else {
        map[dateKey].Chi += Number(t.amount);
      }
    });

    return Object.values(map).slice(-7); // Take last 7 days for clean display
  }, [filteredTransactions]);

  // Prepare Donut Chart Data (Expense by category)
  const expensePieData = useMemo(() => {
    const map = {};
    filteredTransactions.filter(t => t.type === 'EXPENSE').forEach(t => {
      const catName = t.categoryName || t.category;
      map[catName] = (map[catName] || 0) + Number(t.amount);
    });

    const colors = ['#EF4444', '#F97316', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6', '#06B6D4', '#64748B'];
    let idx = 0;

    return Object.keys(map).map(catName => ({
      name: catName,
      value: map[catName],
      color: colors[idx++ % colors.length]
    })).sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  // Low Inventory Items (< minQuantity)
  const lowStockItems = useMemo(() => {
    return inventory.filter(item => Number(item.stockQuantity) <= Number(item.minQuantity));
  }, [inventory]);

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Top Banner & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-3xl border border-amber-500/20">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black font-heading gold-gradient-text">
              TỔNG QUAN THU CHI
            </h1>
            <span className="bg-amber-500/20 text-amber-300 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-amber-500/30">
              {settings.restaurantName}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Theo dõi dòng tiền, doanh thu hải sản & lợi nhuận ròng thời gian thực
          </p>
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center gap-1.5 bg-ocean-900 p-1.5 rounded-2xl border border-slate-800 self-start md:self-auto">
          {[
            { id: 'TODAY', label: 'Hôm nay' },
            { id: 'WEEK', label: '7 Ngày qua' },
            { id: 'MONTH', label: 'Tháng này' },
            { id: 'ALL', label: 'Tất cả' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setDateFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                dateFilter === f.id
                  ? 'gold-gradient-bg text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-ocean-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income Card */}
        <div className="glass-panel glass-panel-hover p-5 rounded-3xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">TỔNG THU (DOANH THU)</span>
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <TrendingUp size={22} />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-heading tracking-tight">
            {formatVND(summary.totalIncome)}
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <ArrowUpRight size={14} /> Ca sáng & tối
            </span>
            <span>{filteredTransactions.filter(t => t.type === 'INCOME').length} Giao dịch</span>
          </div>
        </div>

        {/* Total Expense Card */}
        <div className="glass-panel glass-panel-hover p-5 rounded-3xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">TỔNG CHI (CHI PHÍ)</span>
            <div className="p-2.5 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 group-hover:scale-110 transition-transform">
              <TrendingDown size={22} />
            </div>
          </div>
          <div className="text-2xl font-black text-red-400 font-heading tracking-tight">
            {formatVND(summary.totalExpense)}
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
            <span className="flex items-center gap-1 text-red-400 font-semibold">
              <ArrowDownRight size={14} /> Nhập kho & vận hành
            </span>
            <span>{filteredTransactions.filter(t => t.type === 'EXPENSE').length} Khoản chi</span>
          </div>
        </div>

        {/* Net Profit Card */}
        <div className="glass-panel glass-panel-hover p-5 rounded-3xl relative overflow-hidden group border-amber-500/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">LỢI NHUẬN RÒNG</span>
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 group-hover:scale-110 transition-transform">
              <DollarSign size={22} />
            </div>
          </div>
          <div className={`text-2xl font-black font-heading tracking-tight ${summary.netProfit >= 0 ? 'gold-gradient-text' : 'text-red-400'}`}>
            {formatVND(summary.netProfit)}
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
            <span>Thu nhập ròng sau chi phí</span>
            <span className="text-amber-300 font-bold">Thu - Chi</span>
          </div>
        </div>

        {/* Profit Margin & Target Progress Card */}
        <div className="glass-panel glass-panel-hover p-5 rounded-3xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">TỶ SUẤT LỢI NHUẬN</span>
            <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Percent size={20} />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-400 font-heading">
            {summary.profitMargin}%
          </div>
          
          {/* Progress bar towards monthly goal */}
          <div className="mt-3 pt-2 border-t border-slate-800/80">
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>Mục tiêu tháng:</span>
              <span className="font-bold text-amber-300">{summary.targetProgress}%</span>
            </div>
            <div className="w-full bg-ocean-900 rounded-full h-2 overflow-hidden border border-slate-800">
              <div 
                className="gold-gradient-bg h-full rounded-full transition-all duration-500" 
                style={{ width: `${summary.targetProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Low Seafood Inventory Warning Banner */}
      {lowStockItems.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-red-500/15 via-orange-500/10 to-transparent border border-red-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-red-300">CẢNH BÁO TỒN KHO HẢI SẢN SẮP HẾT!</p>
              <p className="text-xs text-slate-300 mt-0.5">
                Có <span className="font-bold text-amber-300">{lowStockItems.length} mặt hàng</span> hết/dưới định mức tồn tối thiểu: {lowStockItems.map(i => i.name).join(', ')}.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateToLedger && onNavigateToLedger('inventory')}
            className="px-3.5 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-bold border border-red-500/40 transition shrink-0"
          >
            Nhập Kho Ngay
          </button>
        </div>
      )}

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart: Revenue vs Expenses over time */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-amber-500/15">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="text-amber-400" size={20} />
              <h3 className="text-base font-bold text-slate-100 font-heading">
                BIỂU ĐỒ SO SÁNH THU VS CHI ACCORDING TO DATE
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 bg-ocean-900 px-2.5 py-1 rounded-lg border border-slate-800">
              Đơn vị: VNĐ
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis 
                  stroke="#64748B" 
                  fontSize={10} 
                  tickLine={false}
                  tickFormatter={(v) => `${v / 1000000}M`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: 'rgba(245, 158, 11, 0.3)', 
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px' 
                  }}
                  formatter={(value) => [formatVND(value), '']}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Thu" name="Doanh Thu (Thu)" fill="#10B981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Chi" name="Chi Phí (Chi)" fill="#EF4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Category Donut Breakdown Chart */}
        <div className="glass-panel p-6 rounded-3xl border border-amber-500/15 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <PieIcon className="text-amber-400" size={20} />
              <h3 className="text-base font-bold text-slate-100 font-heading">
                CƠ CẤU CHI PHÍ
              </h3>
            </div>

            <div className="h-52 w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={expensePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {expensePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderColor: 'rgba(245, 158, 11, 0.3)', 
                      borderRadius: '12px',
                      fontSize: '12px' 
                    }}
                    formatter={(value) => [formatVND(value), 'Thành tiền']}
                  />
                </RePieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-slate-400 font-semibold">TỔNG CHI</span>
                <span className="text-sm font-black text-amber-300">{formatVND(summary.totalExpense)}</span>
              </div>
            </div>
          </div>

          {/* Category Legends */}
          <div className="space-y-1.5 mt-2 max-h-36 overflow-y-auto pr-1">
            {expensePieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-ocean-900/60 border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-300 line-clamp-1">{item.name}</span>
                </div>
                <span className="font-bold text-slate-100">{formatVND(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions List Feed */}
      <div className="glass-panel p-6 rounded-3xl border border-amber-500/15">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-100 font-heading">
              GIAO DỊCH THU CHI MỚI NHẤT
            </h3>
            <p className="text-xs text-slate-400">Xem lại các hóa đơn thu chi vừa ghi nhận</p>
          </div>
          <button
            onClick={() => onNavigateToLedger && onNavigateToLedger('ledger')}
            className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 hover:underline"
          >
            Xem tất cả Sổ Thu Chi →
          </button>
        </div>

        <div className="divide-y divide-slate-800/80">
          {filteredTransactions.slice(0, 5).map((t) => (
            <div key={t.id} className="py-3.5 flex items-center justify-between gap-4 group hover:bg-ocean-900/40 px-2 rounded-xl transition">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl ${t.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {t.type === 'INCOME' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-200">{t.note || t.categoryName}</span>
                    <span className="text-[10px] text-slate-400 bg-ocean-900 border border-slate-800 px-2 py-0.5 rounded-md">
                      {t.categoryName}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span>📅 {formatDateVN(t.date)} {t.time && `• ${t.time}`}</span>
                    <span>👤 {t.createdByName}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className={`text-base font-black font-heading ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {t.type === 'INCOME' ? '+' : '-'}{formatVND(t.amount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
