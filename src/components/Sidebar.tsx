'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import {
  Shield,
  Workflow,
  ClipboardList,
  Package,
  Scissors,
  CheckCircle2,
  TrendingUp,
  FileText,
  Layers,
  Sparkles,
  Sliders,
  Users,
  Grid,
  FileCheck,
  RotateCcw,
  AlertTriangle,
  PlayCircle,
  BarChart3,
  Flame,
  Shirt,
  Box,
  KeyRound,
} from 'lucide-react';

export type MainViewType =
  // Universal or lookup views
  | 'role-workspace'
  | 'orders'
  | 'workflow'
  | 'worklist'
  | 'qc'
  | 'inventory'
  | 'audit'
  // Admin sub-views
  | 'admin-matrix'
  | 'admin-users'
  // Process Engineer sub-views
  | 'pe-designer'
  | 'pe-validator'
  | 'pe-qc-profiles'
  | 'pe-custom-review'
  // Production Planner sub-views
  | 'planner-pipeline'
  | 'planner-create'
  | 'planner-bom'
  // Warehouse Keeper sub-views
  | 'warehouse-allocation'
  // Station Operator sub-views
  | 'operator-terminal'
  | 'operator-cutting'
  | 'operator-sewing'
  | 'operator-wash'
  | 'operator-finishing'
  // QC Inspector sub-views
  | 'qc-dashboard'
  | 'qc-rework'
  // Manager sub-views
  | 'manager-wip'
  | 'manager-bottleneck'
  | 'manager-analytics';

interface SidebarProps {
  activeView: MainViewType;
  onViewChange: (view: MainViewType) => void;
  orderCount: number;
}

interface MenuItem {
  id: MainViewType;
  label: string;
  icon: any;
  badge?: number;
  highlight?: boolean;
}

interface RoleMenuConfig {
  roleTitle: string;
  roleIcon: any;
  rulesBadge: string;
  coreItems: MenuItem[];
  lookupItems: MenuItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onViewChange,
  orderCount,
}) => {
  const { currentUser } = useAuth();
  const role: UserRole = currentUser?.role || 'PRODUCTION_PLANNER';

  const getRoleConfig = (): RoleMenuConfig => {
    switch (role) {
      case 'ADMIN':
        return {
          roleTitle: 'Quản Trị Hệ Thống',
          roleIcon: Shield,
          rulesBadge: 'Quản trị & Phân quyền',
          coreItems: [
            { id: 'admin-matrix', label: 'Quy Tắc Phối Vải & Màu', icon: Grid, highlight: true },
            { id: 'admin-users', label: 'Quản Lý Người Dùng & Vai Trò', icon: Users },
            { id: 'audit', label: 'Nhật Ký Hoạt Động Xưởng', icon: FileText },
          ],
          lookupItems: [
            { id: 'orders', label: 'Toàn Bộ Đơn Hàng', icon: ClipboardList, badge: orderCount },
            { id: 'workflow', label: 'Sơ Đồ Quy Trình Sản Xuất', icon: Workflow },
          ],
        };

      case 'PROCESS_ENGINEER':
        return {
          roleTitle: 'Kỹ Sư Quy Trình',
          roleIcon: Workflow,
          rulesBadge: 'Quy trình & Tiêu chuẩn',
          coreItems: [
            { id: 'pe-designer', label: 'Thiết Kế 14 Công Đoạn May', icon: Workflow, highlight: true },
            { id: 'pe-qc-profiles', label: 'Tiêu Chuẩn Co Rút & Kiểm Phẩm', icon: Sliders },
            { id: 'pe-custom-review', label: 'Thẩm Định Đơn May Mẫu Riêng', icon: FileCheck },
          ],
          lookupItems: [
            { id: 'workflow', label: 'Xem Lưu Đồ Sản Xuất', icon: Layers },
            { id: 'orders', label: 'Đơn Hàng Đang Áp Dụng', icon: ClipboardList, badge: orderCount },
          ],
        };

      case 'PRODUCTION_PLANNER':
        return {
          roleTitle: 'Kế Hoạch Sản Xuất',
          roleIcon: ClipboardList,
          rulesBadge: 'Kế hoạch & Tiến độ',
          coreItems: [
            { id: 'planner-pipeline', label: 'Tiến Độ Các Đơn Hàng', icon: ClipboardList, highlight: true },
            { id: 'planner-create', label: 'Tiếp Nhận Đơn Hàng Mới', icon: Sparkles },
            { id: 'planner-bom', label: 'Bóc Tách Định Mức Vật Tư', icon: Layers },
          ],
          lookupItems: [
            { id: 'orders', label: 'Tất Cả Đơn Gia Công', icon: Box, badge: orderCount },
            { id: 'workflow', label: 'Quy Trình 14 Bước May Chuẩn', icon: Workflow },
          ],
        };

      case 'WAREHOUSE_KEEPER':
        return {
          roleTitle: 'Thủ Kho Vải & Vật Tư',
          roleIcon: Package,
          rulesBadge: 'Quản lý & Xuất kho',
          coreItems: [
            { id: 'warehouse-allocation', label: 'Xuất Cấp Vải Cho Xưởng Cắt', icon: Scissors, highlight: true },
            { id: 'inventory', label: 'Tồn Kho Các Lô Vải', icon: Package },
          ],
          lookupItems: [
            { id: 'orders', label: 'Đơn Hàng Chờ Cấp Vải', icon: ClipboardList, badge: orderCount },
          ],
        };

      case 'STATION_OPERATOR':
        return {
          roleTitle: 'Tổ Trưởng Công Đoạn',
          roleIcon: Scissors,
          rulesBadge: 'May & Xử lý bó hàng',
          coreItems: [
            { id: 'operator-terminal', label: 'Bảng Điều Khiển Xưởng May', icon: PlayCircle, highlight: true },
            { id: 'worklist', label: 'Danh Sách Bó Hàng Chờ May', icon: Scissors },
            { id: 'operator-cutting', label: 'Trạm Cắt Vải', icon: Scissors },
            { id: 'operator-sewing', label: 'Chuyền May Lắp Ráp', icon: Shirt },
            { id: 'operator-wash', label: 'Xưởng Giặt & Xử Lý Wash', icon: Flame },
            { id: 'operator-finishing', label: 'Hoàn Thiện & Đóng Gói', icon: Box },
          ],
          lookupItems: [
            { id: 'workflow', label: 'Quy Chuẩn Kỹ Thuật May', icon: Workflow },
          ],
        };

      case 'QC_INSPECTOR':
        return {
          roleTitle: 'Kiểm Định Chất Lượng',
          roleIcon: CheckCircle2,
          rulesBadge: 'Kiểm tra chất lượng',
          coreItems: [
            { id: 'qc-dashboard', label: 'Bàn Kiểm Nghiệm Thu Sản Phẩm', icon: CheckCircle2, highlight: true },
            { id: 'qc', label: 'Hàng Đợi Chờ Kiểm Phẩm', icon: FileCheck },
            { id: 'qc-rework', label: 'Điều Phối Hàng Sửa Chữa', icon: RotateCcw },
          ],
          lookupItems: [
            { id: 'pe-qc-profiles', label: 'Tiêu Chuẩn Đo Độ Co Rút', icon: Sliders },
            { id: 'orders', label: 'Tra Cứu Đơn & Bó Hàng', icon: ClipboardList, badge: orderCount },
          ],
        };

      case 'MANAGER':
        return {
          roleTitle: 'Giám Đốc Xưởng',
          roleIcon: TrendingUp,
          rulesBadge: 'Điều hành & Năng suất',
          coreItems: [
            { id: 'manager-wip', label: 'Giám Sát Sản Lượng Đang May', icon: TrendingUp, highlight: true },
            { id: 'manager-bottleneck', label: 'Cảnh Báo Chuyền Bị Ứ Đọng', icon: AlertTriangle },
            { id: 'manager-analytics', label: 'Báo Cáo Năng Suất & Tỷ Lệ Đạt', icon: BarChart3 },
          ],
          lookupItems: [
            { id: 'orders', label: 'Tiến Độ Đơn Toàn Xưởng', icon: ClipboardList, badge: orderCount },
            { id: 'audit', label: 'Nhật Ký Hoạt Động Xưởng', icon: FileText },
          ],
        };
    }
  };

  const config = getRoleConfig();
  const RoleIcon = config.roleIcon;

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 text-slate-700 flex flex-col justify-between p-4 flex-shrink-0 min-h-[calc(100vh-65px)]">
      <div>
        {/* Role Identity Card */}
        <div className="p-3 bg-gradient-to-br from-slate-50 to-denim-50/60 rounded-2xl border border-slate-200/90 mb-4 shadow-2xs">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
            <RoleIcon className="w-4 h-4 text-denim-600 flex-shrink-0" />
            <span className="truncate">{config.roleTitle}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] pt-2 border-t border-slate-200/80">
            <span className="text-slate-500 font-medium">Phạm vi phụ trách:</span>
            <span className="font-semibold text-denim-700 bg-white px-2 py-0.5 rounded-md border border-denim-200/60 text-[10px]">
              {config.rulesBadge}
            </span>
          </div>
        </div>

        {/* Section 1: Core Functions for this Role */}
        <div className="space-y-1">
          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-3 mb-1.5 flex items-center justify-between">
            <span>Chức Năng Vai Trò</span>
            <span className="w-1.5 h-1.5 rounded-full bg-denim-600"></span>
          </div>

          <nav className="space-y-1">
            {config.coreItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-denim-600 text-white shadow-sm shadow-denim-600/20'
                      : item.highlight
                      ? 'bg-denim-50/60 text-denim-800 hover:bg-denim-100/80 border border-denim-100/80 font-extrabold'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 ${
                        isActive ? 'text-white' : item.highlight ? 'text-denim-600' : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                        isActive ? 'bg-white text-denim-700' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Section 2: Lookups & Reference Permitted for this Role */}
        {config.lookupItems.length > 0 && (
          <div className="mt-5 space-y-1">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-3 mb-1.5">
              Tra Cứu & Liên Quan
            </div>

            <nav className="space-y-1">
              {config.lookupItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-denim-600 text-white shadow-sm shadow-denim-600/20'
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                          isActive ? 'bg-white text-denim-700' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Bottom Info Card */}
      <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 text-xs space-y-1.5">
        <div className="flex items-center space-x-1.5 font-bold text-slate-800">
          <Layers className="w-3.5 h-3.5 text-denim-600" />
          <span>DenimFlow v2.0</span>
        </div>
        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
          Phân định trách nhiệm rõ ràng giữa các bộ phận may và kiểm định chất lượng.
        </p>
      </div>
    </aside>
  );
};
