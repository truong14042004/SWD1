'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useGSAP } from '@gsap/react';
import { animateStaggerCards, animateFadeIn } from '@/lib/animations';
import { UserRole } from '@/types';
import {
  Layers,
  Shield,
  Workflow,
  ClipboardList,
  Package,
  Scissors,
  CheckCircle2,
  TrendingUp,
  Lock,
  Mail,
  UserPlus,
  LogIn,
  ArrowRight,
  Check,
  AlertCircle,
  KeyRound,
} from 'lucide-react';

interface RoleAccountCard {
  role: UserRole;
  name: string;
  email: string;
  passwordDefault: string;
  title: string;
  badge: { bg: string; text: string; border: string };
  icon: any;
  responsibilities: string[];
}

const DEMO_ACCOUNTS: RoleAccountCard[] = [
  {
    role: 'ADMIN',
    name: 'Nguyễn Văn Quản Trị',
    email: 'admin@denimflow.vn',
    passwordDefault: 'admin123',
    title: 'Quản Trị Hệ Thống (System Admin)',
    badge: { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300' },
    icon: Shield,
    responsibilities: [
      'Cấu hình Ma Trận Vải–Màu (BR-04: chặn chọn sai cặp vải-màu)',
      'Quản lý danh sách tài khoản & phân quyền 7 vai trò',
      'Tra cứu toàn bộ Audit Log kiểm toán bất biến (BR-16)',
    ],
  },
  {
    role: 'PROCESS_ENGINEER',
    name: 'Trần Kỹ Sư Quy Trình',
    email: 'pe@denimflow.vn',
    passwordDefault: 'pe123',
    title: 'Kỹ Sư Quy Trình (Workflow Designer)',
    badge: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
    icon: Workflow,
    responsibilities: [
      'Thiết kế 14 công đoạn Dynamic Workflow & các nhánh điều kiện',
      'Chạy kiểm định tính hợp lệ BR-01 & Publish Version mới (BR-02)',
      'Cấu hình ngưỡng co rút / phai màu QC Profiles cho từng Style (BR-19)',
      'Thẩm định & phê duyệt đơn hàng gia công Custom (BR-17)',
    ],
  },
  {
    role: 'PRODUCTION_PLANNER',
    name: 'Lê Kế Hoạch Sản Xuất',
    email: 'planner@denimflow.vn',
    passwordDefault: 'planner123',
    title: 'Kế Hoạch Sản Xuất (Production Planner)',
    badge: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
    icon: ClipboardList,
    responsibilities: [
      'Lập đơn hàng mới lọc theo Ma Trận Vải–Màu (BR-04)',
      'Xác nhận đơn Confirm -> Chụp Snapshot Workflow Version (BR-03)',
      'Đính kèm văn bản khách ký xác nhận khi bỏ Giặt Sạch (BR-18, BR-19)',
      'Tính toán định mức BOM vải/phụ liệu và kích hoạt cấp vật tư',
    ],
  },
  {
    role: 'WAREHOUSE_KEEPER',
    name: 'Phạm Thủ Kho Vải',
    email: 'warehouse@denimflow.vn',
    passwordDefault: 'warehouse123',
    title: 'Thủ Kho Vải & Vật Tư (Warehouse Keeper)',
    badge: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
    icon: Package,
    responsibilities: [
      'Quản lý tồn kho từng cuộn/lô vải (FabricLot) & kết quả thử co rút',
      'Thực hiện Giữ chỗ và Cấp phát vải cho đơn hàng theo BOM (BR-06)',
      'Mở khóa điều kiện Gatekeeper cho phép Tổ Cắt bắt đầu làm việc',
    ],
  },
  {
    role: 'STATION_OPERATOR',
    name: 'Hoàng Tổ Trưởng May',
    email: 'operator@denimflow.vn',
    passwordDefault: 'operator123',
    title: 'Tổ Trưởng Công Đoạn (Station Operator)',
    badge: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
    icon: Scissors,
    responsibilities: [
      'Shopfloor terminal cho 7 trạm: Cắt, May, Thêu, Nhuộm, Wash, Hoàn thiện, Đóng gói',
      'Kiểm tra chốt chặn Gatekeeper tự động trước khi bấm Bắt đầu (BR-14)',
      'Nghiệm thu kiểm tra Bảo toàn số lượng (BR-08: Số vào = Số đạt + Số lỗi)',
      'Đính kèm tối thiểu 01 tệp minh chứng hình ảnh/phiếu (BR-15)',
    ],
  },
  {
    role: 'QC_INSPECTOR',
    name: 'Đặng Kiểm Định QC',
    email: 'qc@denimflow.vn',
    passwordDefault: 'qc123',
    title: 'Kiểm Soát Chất Lượng (QC Inspector)',
    badge: { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200' },
    icon: CheckCircle2,
    responsibilities: [
      'Kiểm tra theo đúng ngưỡng co rút & phai màu của QC Profile áp dụng (BR-19)',
      'Đưa ra kết luận: Pass, Rework (chọn trạm sửa, tối đa 3 lần - BR-10) hoặc Reject',
      'Tuân thủ nguyên tắc phân tách trách nhiệm không tự QC step mình làm (BR-11)',
    ],
  },
  {
    role: 'MANAGER',
    name: 'Vũ Giám Đốc Xưởng',
    email: 'manager@denimflow.vn',
    passwordDefault: 'manager123',
    title: 'Giám Đốc Xưởng (Factory Manager)',
    badge: { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200' },
    icon: TrendingUp,
    responsibilities: [
      'Bảng điều khiển điều hành WIP thời gian thực toàn bộ các trạm gia công',
      'Phát hiện điểm nghẽn chu kỳ sản xuất (Bottleneck detector)',
      'Phân tích biểu đồ sản lượng, tỷ lệ đạt/lỗi và dự báo thời gian giao hàng',
    ],
  },
];

export const AuthPortal: React.FC = () => {
  const { login, register, switchUser } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register form
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('PRODUCTION_PLANNER');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      animateFadeIn(containerRef.current);
      animateStaggerCards(containerRef.current, '.role-account-card');
    },
    { scope: containerRef, dependencies: [tab] }
  );

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const res = await login(email, password);
    if (!res.success) {
      setErrorMessage(res.error || 'Đăng nhập không thành công');
    }
  };

  const handleManualRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const res = await register({
      fullName: regFullName,
      email: regEmail,
      password: regPassword,
      role: regRole,
    });
    if (!res.success) {
      setErrorMessage(res.error || 'Đăng ký không thành công');
    }
  };

  const handleQuickAccountLogin = async (account: RoleAccountCard) => {
    setLoadingRole(account.role);
    setErrorMessage(null);
    const res = await login(account.email, account.passwordDefault);
    setLoadingRole(null);
    if (!res.success) {
      setErrorMessage(res.error || 'Đăng nhập không thành công');
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-50 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto w-full space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2.5 px-3 py-1 rounded-full bg-denim-50 border border-denim-200 text-denim-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Layers className="w-4 h-4 text-denim-600" />
            <span>DenimFlow BO — Dynamic Workflow Platform</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Cổng Đăng Nhập & Phân Quyền 7 Vai Trò
          </h1>
          <p className="text-sm text-slate-500 max-w-2xl mx-auto font-medium">
            Hệ thống quản lý gia công may quần Jean theo vòng đời thực tế. Chọn tài khoản vai trò bên dưới để trải nghiệm ngay không gian làm việc chuyên biệt hoặc đăng nhập bằng tài khoản cá nhân.
          </p>
        </div>

        {errorMessage && (
          <div className="max-w-md mx-auto p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center space-x-3 text-xs font-semibold shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* SECTION 1: 7 DEDICATED ROLE ACCOUNTS (1-Click Instant Login) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                <KeyRound className="w-5 h-5 text-denim-600" />
                <span>Tài Khoản Đã Khởi Tạo Cho Từng Vai Trò (7 Roles)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Bấm nút <strong>Đăng Nhập Vai Trò Này</strong> để lập tức truy cập giao diện chuyên biệt của vai trò tương ứng.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {DEMO_ACCOUNTS.map((acc) => {
              const Icon = acc.icon;
              const isLoading = loadingRole === acc.role;

              return (
                <div
                  key={acc.role}
                  className="role-account-card bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 hover:border-denim-400 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-denim-50 group-hover:text-denim-700 transition">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${acc.badge.bg} ${acc.badge.text} ${acc.badge.border}`}>
                        {acc.role}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-denim-700 transition">
                        {acc.title}
                      </h3>
                      <div className="text-xs font-bold text-slate-700 mt-0.5">{acc.name}</div>
                    </div>

                    {/* Account credentials box */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-mono text-[11px] space-y-1">
                      <div className="text-slate-500 truncate">
                        Email: <strong className="text-slate-800">{acc.email}</strong>
                      </div>
                      <div className="text-slate-500">
                        Pass: <strong className="text-slate-800">{acc.passwordDefault}</strong>
                      </div>
                    </div>

                    {/* Core duties */}
                    <ul className="text-[11px] text-slate-500 space-y-1 leading-snug">
                      {acc.responsibilities.map((r, i) => (
                        <li key={i} className="flex items-start space-x-1.5">
                          <Check className="w-3.5 h-3.5 text-denim-600 flex-shrink-0 mt-0.5" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    disabled={isLoading}
                    onClick={() => handleQuickAccountLogin(acc)}
                    className="w-full py-2 px-3 bg-denim-600 hover:bg-denim-700 text-white font-bold rounded-xl text-xs shadow-xs hover:shadow transition flex items-center justify-center space-x-1.5 group-hover:scale-[1.01]"
                  >
                    <span>{isLoading ? 'Đang xác thực...' : 'Đăng Nhập Vai Trò Này'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: MANUAL LOGIN OR REGISTER (Card Box) */}
        <div className="max-w-md mx-auto bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
          {/* Tab Selector */}
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setTab('login')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                tab === 'login' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Đăng Nhập Thủ Công
            </button>
            <button
              onClick={() => setTab('register')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                tab === 'register' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Đăng Ký Tài Khoản Mới
            </button>
          </div>

          {tab === 'login' ? (
            <form onSubmit={handleManualLogin} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Công Việc</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="planner@denimflow.vn"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-denim-500 font-medium"
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu (VD: planner123)"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-denim-500 font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-denim-600 hover:bg-denim-700 text-white rounded-xl font-bold shadow-xs transition flex items-center justify-center space-x-1"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng Nhập</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleManualRegister} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Họ Và Tên</label>
                <input
                  type="text"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="Nguyễn Văn B"
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
                  placeholder="nhanvien@denimflow.vn"
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
                <label className="block font-bold text-slate-700 mb-1">Vai Trò Đảm Nhiệm (Role)</label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-denim-500 font-bold text-slate-800"
                >
                  <option value="PRODUCTION_PLANNER">Production Planner (Kế hoạch sản xuất)</option>
                  <option value="PROCESS_ENGINEER">Process Engineer (Kỹ sư quy trình)</option>
                  <option value="STATION_OPERATOR">Station Operator (Tổ trưởng trạm)</option>
                  <option value="QC_INSPECTOR">QC Inspector (Kiểm định chất lượng)</option>
                  <option value="WAREHOUSE_KEEPER">Warehouse Keeper (Thủ kho)</option>
                  <option value="MANAGER">Factory Manager (Giám đốc xưởng)</option>
                  <option value="ADMIN">System Admin (Quản trị hệ thống)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs transition flex items-center justify-center space-x-1 mt-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Hoàn Tất Đăng Ký Tài Khoản</span>
              </button>
            </form>
          )}
        </div>
      </div>

      <footer className="text-center text-xs text-slate-400 py-4 mt-8">
        DenimFlow BO v2.0 • Dynamic Workflow Jean Manufacturing Platform • Clean Architecture
      </footer>
    </div>
  );
};
