import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  LogOut, 
  ChevronDown, 
  ShieldCheck, 
  Clock, 
  Menu, 
  X,
  Sparkles,
  RefreshCw,
  Lock
} from 'lucide-react';

export const Header = ({ mobileMenuOpen, setMobileMenuOpen, onResetData }) => {
  const { user, role, permissions, logout, switchAccount } = useAuth();
  const [timeString, setTimeString] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleDateString('vi-VN', {
          weekday: 'short',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }) + ' • ' + now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const getRoleBadgeStyle = () => {
    if (permissions.isAdmin) return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  };

  const handleUrlNavigate = (pathRoute) => {
    window.history.pushState({}, '', `/${pathRoute}`);
    if (pathRoute === 'quanly') {
      switchAccount('MANAGER');
    } else {
      switchAccount('ADMIN');
    }
    setUserDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-ocean-950/80 backdrop-blur-md border-b border-amber-500/10 px-4 lg:px-8 py-3 transition-all no-print">
      <div className="flex items-center justify-between gap-4">
        {/* Left Side: Mobile Menu Button & Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-ocean-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-ocean-800 transition"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Logo size="normal" showSubtitle={true} />
        </div>

        {/* Right Side: Clock, Account Status & User Profile */}
        <div className="flex items-center gap-3">
          {/* Live Date Time Display */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-ocean-900/60 border border-slate-800/80 text-slate-400 text-xs font-medium">
            <Clock size={14} className="text-amber-400 animate-pulse" />
            <span>{timeString}</span>
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl bg-ocean-900/80 border border-slate-800 hover:border-amber-500/40 hover:bg-ocean-800 transition shadow-inner"
            >
              <img
                src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=LemQuan'}
                alt={user?.name}
                className="w-9 h-9 rounded-xl object-cover bg-amber-500/10 border border-amber-500/30 p-0.5"
              />
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-100 line-clamp-1">
                  {user?.name || 'Chưa đăng nhập'}
                </span>
                <span className={`text-[10px] font-semibold border px-1.5 py-0.2 rounded-full w-fit mt-0.5 ${getRoleBadgeStyle()}`}>
                  {user?.roleLabel || role}
                </span>
              </div>
              <ChevronDown size={16} className={`text-slate-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl glass-panel bg-ocean-950/95 border border-amber-500/20 p-3 shadow-2xl z-50 animate-fade-in">
                <div className="p-2 border-b border-slate-800 mb-2">
                  <p className="text-xs text-slate-400">Đang đăng nhập với quyền:</p>
                  <p className="text-sm font-bold text-amber-400 flex items-center gap-1.5 mt-0.5">
                    <ShieldCheck size={16} />
                    {user?.roleLabel}
                  </p>
                </div>

                {/* SHOW QUICK SWITCHER ONLY FOR ADMIN! HIDDEN ABSOLUTELY FOR MANAGER! */}
                {permissions.isAdmin && (
                  <div className="mb-2">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1">
                      <Sparkles size={12} className="text-amber-400" /> Chuyển nhanh tài khoản:
                    </p>
                    <div className="space-y-1">
                      <button
                        onClick={() => handleUrlNavigate('admin')}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition ${role === 'ADMIN' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40' : 'text-slate-300 hover:bg-ocean-800'}`}
                      >
                        <span>🔑 Admin (URL: /admin)</span>
                        {role === 'ADMIN' && <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-1.5 py-0.5 rounded">Đang chọn</span>}
                      </button>

                      <button
                        onClick={() => handleUrlNavigate('quanly')}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition ${role === 'MANAGER' ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40' : 'text-slate-300 hover:bg-ocean-800'}`}
                      >
                        <span>📝 Quản Lý (URL: /quanly)</span>
                        {role === 'MANAGER' && <span className="text-[10px] bg-emerald-500 text-slate-950 font-bold px-1.5 py-0.5 rounded">Đang chọn</span>}
                      </button>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2 border-t border-slate-800 space-y-1">
                  {permissions.isAdmin && (
                    <button
                      onClick={() => { onResetData && onResetData(); setUserDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-amber-300 hover:bg-amber-500/10 flex items-center gap-2 transition"
                    >
                      <RefreshCw size={14} />
                      <span>Reset Dữ liệu Mẫu Ban Đầu</span>
                    </button>
                  )}

                  <button
                    onClick={() => { logout(); setUserDropdownOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition font-medium"
                  >
                    <LogOut size={14} />
                    <span>Đăng Xuất</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
