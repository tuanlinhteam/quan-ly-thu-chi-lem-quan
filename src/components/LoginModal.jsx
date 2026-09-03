import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';
import { Lock, User, ArrowRight, Sparkles, Link2, ShieldCheck, ClipboardList } from 'lucide-react';

export const LoginModal = ({ isOpen, onClose }) => {
  const { login, portalRoute } = useAuth();

  // Determine which portal from URL
  const isQuanlyPortal =
    portalRoute === 'quanly' ||
    window.location.pathname.toLowerCase().includes('quanly') ||
    window.location.hash.toLowerCase().includes('quanly');

  const isAdminPortal =
    portalRoute === 'admin' ||
    window.location.pathname.toLowerCase().includes('admin') ||
    window.location.hash.toLowerCase().includes('admin');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset form fields when portal changes
  useEffect(() => {
    setUsername('');
    setPassword('');
    setErrorMsg('');
  }, [portalRoute]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    setTimeout(() => {
      const res = login(username, password);
      setLoading(false);
      if (res.success) {
        onClose();
      } else {
        setErrorMsg(res.message);
      }
    }, 300);
  };

  // ═══════════════════════════════════════════
  //  CỔNG QUẢN LÝ - /quanly
  //  Completely isolated, no admin elements
  // ═══════════════════════════════════════════
  if (isQuanlyPortal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
        <div className="w-full max-w-md rounded-3xl bg-ocean-950/95 border border-emerald-500/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Glow */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <Logo size="large" showSubtitle={false} />
            </div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/15 text-emerald-300 font-extrabold px-4 py-1.5 rounded-full border border-emerald-500/25 text-[10px] uppercase tracking-widest mb-2">
              <ClipboardList size={12} />
              CỔNG QUẢN LÝ THU CHI
            </div>
            <h2 className="text-xl font-black text-emerald-300 font-heading tracking-wide">
              ĐĂNG NHẬP QUẢN LÝ
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Dành cho Quản lý nhập/sửa Thu Chi hằng ngày & Kho hải sản
            </p>
          </div>

          {/* Error */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium text-center animate-shake">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tên đăng nhập</label>
              <div className="relative">
                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên đăng nhập quản lý..."
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-ocean-900 border border-slate-700 text-slate-100 text-sm focus:border-emerald-500 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mật khẩu</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-ocean-900 border border-slate-700 text-slate-100 text-sm focus:border-emerald-500 outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition disabled:opacity-50 mt-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25"
            >
              {loading ? (
                <span>Đang kiểm tra...</span>
              ) : (
                <>
                  <span>VÀO HỆ THỐNG QUẢN LÝ</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <p className="text-center text-[10px] text-slate-500 mt-5">
            Cổng dành riêng cho Quản lý • LEM QUÁN v2.5
          </p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  //  CỔNG ADMIN - /admin or default
  //  Full admin login with quick presets
  // ═══════════════════════════════════════════
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md rounded-3xl bg-ocean-950/95 border border-amber-500/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-red-500/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <Logo size="large" showSubtitle={false} />
          </div>
          <div className="inline-flex items-center gap-1.5 bg-amber-500/15 text-amber-300 font-extrabold px-4 py-1.5 rounded-full border border-amber-500/25 text-[10px] uppercase tracking-widest mb-2">
            <ShieldCheck size={12} />
            CỔNG QUẢN TRỊ ADMIN
          </div>
          <h2 className="text-xl font-black text-amber-300 font-heading tracking-wide">
            ĐĂNG NHẬP ADMIN
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Toàn quyền quản trị: Thêm, sửa, xóa & quản lý người dùng
          </p>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium text-center animate-shake">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tên đăng nhập</label>
            <div className="relative">
              <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên đăng nhập admin..."
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-ocean-900 border border-slate-700 text-slate-100 text-sm focus:border-amber-500 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mật khẩu</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-ocean-900 border border-slate-700 text-slate-100 text-sm focus:border-amber-500 outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition disabled:opacity-50 mt-2 gold-gradient-bg text-slate-950 shadow-amber-500/25"
          >
            {loading ? (
              <span>Đang kiểm tra...</span>
            ) : (
              <>
                <span>VÀO HỆ THỐNG ADMIN</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Quick Login - Admin only */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <p className="text-[11px] font-bold text-amber-400 uppercase tracking-widest text-center mb-3 flex items-center justify-center gap-1.5">
            <Sparkles size={13} /> Đăng nhập nhanh:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { setUsername('admin'); setPassword('admin123'); }}
              className="p-2.5 rounded-xl bg-ocean-900/90 border border-amber-500/30 text-left hover:border-amber-400 hover:bg-ocean-800 transition"
            >
              <div className="text-xs font-bold text-amber-300">🔑 Admin</div>
              <div className="text-[10px] text-slate-400 mt-0.5">admin / admin123</div>
            </button>
            <button
              onClick={() => { setUsername('Quanly'); setPassword('123123'); }}
              className="p-2.5 rounded-xl bg-ocean-900/90 border border-emerald-500/30 text-left hover:border-emerald-400 hover:bg-ocean-800 transition"
            >
              <div className="text-xs font-bold text-emerald-300">📝 Quản Lý</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Quanly / 123123</div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-slate-500 mt-5">
          Cổng quản trị toàn quyền • LEM QUÁN v3.3.4
        </p>
      </div>
    </div>
  );
};
