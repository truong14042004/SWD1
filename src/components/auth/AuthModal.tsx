'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useGSAP } from '@gsap/react';
import { animateModalEnter } from '@/lib/animations';
import { UserRole } from '@/types';
import { Lock, Mail, UserPlus, LogIn, X, CheckCircle, AlertCircle, Layers, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

const ROLES_LIST: { role: UserRole; title: string; desc: string }[] = [
  { role: 'PRODUCTION_PLANNER', title: 'Kế Hoạch Sản Xuất', desc: 'Lập đơn hàng, chọn vải màu, duyệt kế hoạch may' },
  { role: 'PROCESS_ENGINEER', title: 'Kỹ Sư Quy Trình', desc: 'Thiết kế quy trình may, ban hành chuẩn kỹ thuật' },
  { role: 'STATION_OPERATOR', title: 'Tổ Trưởng Công Đoạn', desc: 'Quản lý chuyền Cắt, May, Nhuộm, Giặt, Đóng gói' },
  { role: 'QC_INSPECTOR', title: 'Kiểm Định Chất Lượng (KCS)', desc: 'Kiểm tra độ co rút, phai màu, xử lý sửa hàng' },
  { role: 'WAREHOUSE_KEEPER', title: 'Thủ Kho Vải & Phụ Liệu', desc: 'Quản lý cuộn vải, cấp phát vải theo định mức' },
  { role: 'MANAGER', title: 'Giám Đốc Xưởng', desc: 'Theo dõi tiến độ, sản lượng và xử lý chậm chuyền' },
  { role: 'ADMIN', title: 'Quản Trị Nhà Máy', desc: 'Quản lý tài khoản, quy tắc vải màu, nhật ký xưởng' },
];

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultTab = 'login' }) => {
  const { login, register, allUsers, switchUser } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>(defaultTab);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('PRODUCTION_PLANNER');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (isOpen && modalRef.current) {
        animateModalEnter(modalRef.current);
      }
    },
    { dependencies: [isOpen, tab] }
  );

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    const res = await login(loginEmail, loginPassword);
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Đăng nhập không thành công');
    } else {
      setSuccessMessage('Đăng nhập thành công!');
      setTimeout(() => {
        onClose();
      }, 600);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    const res = await register({
      fullName: regFullName,
      email: regEmail,
      password: regPassword,
      role: regRole,
    });
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Đăng ký không thành công');
    } else {
      setSuccessMessage('Đăng ký tài khoản thành công!');
      setTimeout(() => {
        onClose();
      }, 700);
    }
  };

  const handleQuickLogin = (userId: string) => {
    switchUser(userId);
    setSuccessMessage('Chuyển đổi tài khoản thành công!');
    setTimeout(() => {
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden"
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-denim-600 via-denim-700 to-indigo-800 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-white/15 rounded-xl backdrop-blur-sm">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl tracking-tight">DenimFlow</h3>
              <p className="text-xs text-denim-100">Hệ Thống Quản Lý Sản Xuất May Quần Jean</p>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex bg-black/20 p-1 rounded-xl mt-4 backdrop-blur-sm">
            <button
              onClick={() => {
                setTab('login');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                tab === 'login' ? 'bg-white text-denim-900 shadow' : 'text-white/80 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Đăng Nhập</span>
            </button>
            <button
              onClick={() => {
                setTab('register');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                tab === 'register' ? 'bg-white text-denim-900 shadow' : 'text-white/80 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Đăng Ký Tài Khoản</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center space-x-2 text-xs font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center space-x-2 text-xs font-medium">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {tab === 'login' && (
            <div className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Công Việc</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="planner@denimflow.vn"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-denim-500 font-medium text-slate-800"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mật Khẩu</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-denim-500 font-medium text-slate-800"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-denim-600 hover:bg-denim-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition flex items-center justify-center space-x-1.5"
                >
                  <span>{loading ? 'Đang xác thực...' : 'Đăng Nhập'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick Login Pill Grid */}
              <div className="pt-3 border-t border-slate-100">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Đăng Nhập Nhanh Theo Từng Bộ Phận (Thử Nghiệm 1-Click)
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {allUsers.slice(0, 6).map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleQuickLogin(u.id)}
                      className="text-left p-2 rounded-xl border border-slate-200 hover:border-denim-400 hover:bg-denim-50/50 transition bg-white group"
                    >
                      <div className="font-bold text-slate-800 text-xs group-hover:text-denim-700">{u.fullName}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{u.role}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REGISTER */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Họ và Tên Nhân Sự</label>
                <input
                  type="text"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-denim-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Công Việc</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="nhansu@denimflow.vn"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-denim-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mật Khẩu</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Tối thiểu 4 ký tự"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-denim-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Chọn Bộ Phận / Vị Trí Công Tác</label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-denim-500 font-bold text-slate-800"
                >
                  {ROLES_LIST.map((r) => (
                    <option key={r.role} value={r.role}>
                      {r.title} — {r.desc}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition flex items-center justify-center space-x-1.5 mt-2"
              >
                <span>{loading ? 'Đang khởi tạo tài khoản...' : 'Hoàn Tất Đăng Ký & Vào Hệ Thống'}</span>
                <CheckCircle className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
