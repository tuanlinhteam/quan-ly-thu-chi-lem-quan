import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Receipt, 
  Boxes, 
  PieChart, 
  Settings, 
  PlusCircle, 
  ChevronRight,
  ShieldCheck,
  Lock
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab, onOpenAddTransaction, mobileMenuOpen, setMobileMenuOpen }) => {
  const { role, permissions } = useAuth();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Tổng Quan Thu Chi',
      icon: LayoutDashboard,
      show: true,
      badge: 'Realtime'
    },
    {
      id: 'ledger',
      label: 'Sổ Thu / Chi',
      icon: Receipt,
      show: true,
      badge: null
    },
    {
      id: 'inventory',
      label: 'Kho Hải Sản & Vật Tư',
      icon: Boxes,
      show: true,
      badge: null
    },
    {
      id: 'financial-reports',
      label: 'Báo Cáo Tài Chính',
      icon: PieChart,
      show: permissions.isAdmin,
      badge: 'Admin'
    },
    {
      id: 'settings',
      label: 'Quản Lý User & System',
      icon: Settings,
      show: permissions.isAdmin,
      badge: 'Admin'
    }
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
        />
      )}

      {/* Sidebar Navigation Panel */}
      <aside className={`fixed lg:static top-0 left-0 h-full w-72 bg-ocean-950/95 border-r border-amber-500/10 p-4 z-50 transition-transform duration-300 ease-in-out flex flex-col justify-between ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} no-print`}>
        
        <div className="space-y-6">
          {/* Quick Action Button for Admin & Manager */}
          {permissions.canAddTransaction && (
            <button
              onClick={() => {
                onOpenAddTransaction();
                if (mobileMenuOpen) setMobileMenuOpen(false);
              }}
              className="w-full py-3 px-4 rounded-2xl gold-gradient-bg text-slate-950 font-extrabold flex items-center justify-center gap-2.5 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] transition"
            >
              <PlusCircle size={20} className="stroke-[2.5]" />
              <span className="text-sm font-heading tracking-wide uppercase">Nhập Thu / Chi Mới</span>
            </button>
          )}



          {/* Navigation Section */}
          <div>
            <p className="text-[11px] font-bold text-amber-400/80 uppercase tracking-widest px-3 mb-2">
              Danh Mục Quản Lý
            </p>
            <nav className="space-y-1">
              {navItems.filter(item => item.show).map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all group ${
                      isActive 
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold shadow-inner' 
                        : 'text-slate-400 hover:text-slate-100 hover:bg-ocean-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/50' : 'bg-ocean-900 text-slate-400 group-hover:text-amber-400 group-hover:bg-ocean-800'}`}>
                        <Icon size={18} />
                      </div>
                      <span>{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.badge && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isActive ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight size={14} className={`text-slate-500 transition-transform ${isActive ? 'text-amber-400 translate-x-0.5' : 'opacity-0 group-hover:opacity-100'}`} />
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom System Banner */}
        <div className="pt-4 border-t border-slate-800/80 space-y-3">
          <div className="p-3 rounded-xl bg-ocean-900/40 border border-amber-500/10 text-slate-400 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-slate-200">LEM QUÁN v2.5</span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">Online</span>
            </div>
            <p className="text-[11px] text-slate-500">Hệ thống Admin & Quản Lý Thu Chi</p>
          </div>
        </div>

      </aside>
    </>
  );
};
