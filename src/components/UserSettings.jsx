import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { loadTransactions, loadInventory, loadSettings, saveSettings, saveUsers, resetToFactoryDefaults, formatVND } from '../utils/storage';
import { 
  Users, 
  Settings as SettingsIcon, 
  ShieldCheck, 
  Key, 
  RefreshCw, 
  Save, 
  Download, 
  Upload, 
  Building, 
  Phone, 
  MapPin, 
  Target,
  CheckCircle2
} from 'lucide-react';

export const UserSettings = ({ settings, onUpdateSettings, onResetData }) => {
  const { usersList, setUsersList, permissions } = useAuth();

  const [formSettings, setFormSettings] = useState(settings);
  const [editingUserId, setEditingUserId] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  if (!permissions.canManageUsers) {
    return (
      <div className="p-8 text-center glass-panel rounded-3xl border border-red-500/30 text-red-400">
        ⚠️ Bạn không có quyền truy cập trang Cài Đặt Hệ Thống & Quản Lý User.
      </div>
    );
  }

  const handleSaveSettingsSubmit = (e) => {
    e.preventDefault();
    onUpdateSettings(formSettings);
    setSaveSuccessMsg('Đã lưu cấu hình hệ thống thành công!');
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  const handleChangePassword = (userId) => {
    if (!newPassword.trim()) {
      alert('Vui lòng nhập mật khẩu mới!');
      return;
    }
    const updatedUsers = usersList.map(u => {
      if (u.id === userId) {
        return { ...u, password: newPassword.trim() };
      }
      return u;
    });
    setUsersList(updatedUsers);
    saveUsers(updatedUsers);
    setEditingUserId(null);
    setNewPassword('');
    alert('Đã đổi mật khẩu thành công!');
  };

  // Export JSON Backup
  const handleExportBackupJSON = () => {
    const backupData = {
      transactions: loadTransactions(),
      inventory: loadInventory(),
      settings: loadSettings(),
      exportDate: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Backup_LemQuan_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="glass-panel p-5 rounded-3xl border border-amber-500/20">
        <h1 className="text-2xl font-black font-heading gold-gradient-text flex items-center gap-2">
          CÀI ĐẶT HỆ THỐNG & QUẢN LÝ TÀI KHOẢN
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Quản lý tài khoản đăng nhập 3 cấp quyền & cấu hình mục tiêu kinh doanh Lem Quán
        </p>
      </div>

      {saveSuccessMsg && (
        <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={16} /> {saveSuccessMsg}
        </div>
      )}

      {/* Grid 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column 1: Restaurant Info Settings Form */}
        <div className="glass-panel p-6 rounded-3xl border border-amber-500/15">
          <h3 className="text-base font-bold text-slate-100 font-heading mb-4 flex items-center gap-2">
            <Building className="text-amber-400" size={18} />
            THÔNG TIN QUÁN & MỤC TIÊU DOANH THU
          </h3>

          <form onSubmit={handleSaveSettingsSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tên Nhà Hàng / Quán</label>
              <input
                type="text"
                value={formSettings.restaurantName}
                onChange={(e) => setFormSettings({ ...formSettings, restaurantName: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-ocean-900 border border-slate-700 text-slate-100 font-bold outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                <MapPin size={12} className="text-amber-400" /> Địa chỉ
              </label>
              <input
                type="text"
                value={formSettings.address}
                onChange={(e) => setFormSettings({ ...formSettings, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-ocean-900 border border-slate-700 text-slate-100 outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                <Phone size={12} className="text-amber-400" /> Hotline liên hệ
              </label>
              <input
                type="text"
                value={formSettings.phone}
                onChange={(e) => setFormSettings({ ...formSettings, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-ocean-900 border border-slate-700 text-slate-100 outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                <Target size={12} className="text-amber-400" /> Mục tiêu doanh thu tháng (VNĐ)
              </label>
              <input
                type="number"
                value={formSettings.monthlyRevenueTarget}
                onChange={(e) => setFormSettings({ ...formSettings, monthlyRevenueTarget: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-ocean-900 border border-slate-700 text-amber-300 font-bold outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Tương đương: {formatVND(formSettings.monthlyRevenueTarget)}
              </span>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl gold-gradient-bg text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/25 flex items-center gap-2"
              >
                <Save size={16} />
                <span>LƯU CẤU HÌNH</span>
              </button>
            </div>
          </form>
        </div>

        {/* Column 2: User Accounts RBAC Management */}
        <div className="glass-panel p-6 rounded-3xl border border-amber-500/15">
          <h3 className="text-base font-bold text-slate-100 font-heading mb-4 flex items-center gap-2">
            <Users className="text-amber-400" size={18} />
            QUẢN LÝ NGHƯỜI DÙNG & ĐỔI MẬT KHẨU
          </h3>

          <div className="space-y-3">
            {usersList.map((u) => (
              <div key={u.id} className="p-3.5 rounded-2xl bg-ocean-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-lg bg-slate-800 p-0.5" />
                    <div>
                      <span className="text-xs font-bold text-slate-100 block">{u.name}</span>
                      <span className="text-[10px] text-slate-400">Username: <b className="text-amber-300">{u.username}</b></span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-amber-300">
                    {u.role}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                  <span className="text-slate-400">{u.roleLabel}</span>

                  {editingUserId === u.id ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="password"
                        placeholder="Mật khẩu mới"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="px-2 py-1 rounded-lg bg-ocean-950 border border-slate-700 text-white text-xs outline-none w-28"
                      />
                      <button
                        onClick={() => handleChangePassword(u.id)}
                        className="px-2 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold"
                      >
                        Lưu
                      </button>
                      <button
                        onClick={() => setEditingUserId(null)}
                        className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300"
                      >
                        Hủy
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingUserId(u.id)}
                      className="text-amber-400 hover:underline font-semibold flex items-center gap-1"
                    >
                      <Key size={12} /> Đổi mật khẩu
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Backup & Restore Data Section */}
          <div className="mt-6 pt-5 border-t border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              SAO LƯU & KHÔI PHỤC DỮ LIỆU
            </h4>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleExportBackupJSON}
                className="px-3.5 py-2 rounded-xl bg-ocean-900 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Download size={14} className="text-amber-400" /> Xuất File JSON Backup
              </button>

              <button
                onClick={() => onResetData && onResetData()}
                className="px-3.5 py-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-bold flex items-center gap-1.5 hover:bg-red-500/30 transition"
              >
                <RefreshCw size={14} /> Khôi Phục Dữ Liệu Ban Đầu
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
