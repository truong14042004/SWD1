'use client';

import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { animateStaggerCards } from '@/lib/animations';
import { ProductionOrder } from '@/types';
import { TrendingUp, Clock, AlertTriangle, CheckCircle, BarChart3, Layers, ArrowUpRight } from 'lucide-react';

interface ManagerViewProps {
  orders: ProductionOrder[];
}

export const ManagerView: React.FC<ManagerViewProps> = ({ orders }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      animateStaggerCards(containerRef.current, '.mgr-card');
    },
    { scope: containerRef, dependencies: [orders] }
  );

  const inProd = orders.filter((o) => o.status === 'IN_PRODUCTION');
  const completed = orders.filter((o) => o.status === 'COMPLETED');
  const confirmed = orders.filter((o) => o.status === 'CONFIRMED');

  const totalPlannedQty = orders.reduce(
    (sum, o) => sum + o.sizeLines.reduce((s, l) => s + l.plannedQty, 0),
    0
  );

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-denim-950 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 text-white px-2.5 py-1 rounded-full">
              Khu Vực Giám Đốc Xưởng
            </span>
            <span className="text-xs text-slate-300">• Giám đốc xưởng (Chỉ xem số liệu & phân tích điều hành)</span>
          </div>
          <h2 className="text-2xl font-bold mt-2">Báo Cáo Điều Hành & Năng Suất Xưởng May Jean</h2>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Theo dõi sản lượng may trực tiếp, phát hiện chậm chuyền và kiểm soát chất lượng thành phẩm.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="mgr-card bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase">Lô Đang May Gia Công</div>
            <div className="text-3xl font-extrabold text-denim-600 mt-1">{inProd.length}</div>
            <div className="text-xs text-slate-500 mt-1">Chạy trên chuyền may & wash</div>
          </div>
          <div className="p-3 bg-denim-50 text-denim-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="mgr-card bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase">Đơn Đã Bàn Giao</div>
            <div className="text-3xl font-extrabold text-emerald-600 mt-1">{completed.length}</div>
            <div className="text-xs text-slate-500 mt-1">Đạt chuẩn kiểm định & xuất kho</div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="mgr-card bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase">Đơn Chờ Vào Chuyền</div>
            <div className="text-3xl font-extrabold text-blue-600 mt-1">{confirmed.length}</div>
            <div className="text-xs text-slate-500 mt-1">Đã duyệt kế hoạch may</div>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="mgr-card bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase">Tổng Kế Hoạch Sản Lượng</div>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">{totalPlannedQty.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-1">Sản phẩm quần jean</div>
          </div>
          <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Production Status Breakdown */}
      <div className="mgr-card bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 text-base flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
          <span>Theo Dõi Tiến Độ May Thực Tế Theo Từng Đơn Hàng</span>
        </h3>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Mã Đơn Hàng</th>
                <th className="p-3">Mẫu Mã</th>
                <th className="p-3">Sản Lượng</th>
                <th className="p-3">Hạn Giao Hàng</th>
                <th className="p-3">Tiến Độ Thực Hiện</th>
                <th className="p-3">Tỷ Lệ Hoàn Thành</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {orders.map((o) => {
                const total = o.sizeLines.reduce((s, l) => s + l.plannedQty, 0);
                const steps = (o as any).workflowInstance?.stepInstances || [];
                const doneCount = steps.filter((s: any) => s.status === 'DONE').length;
                const totalSteps = steps.length || 14;
                const percent = Math.round((doneCount / totalSteps) * 100);

                const getStatusText = (status: string) => {
                  switch (status) {
                    case 'DRAFT': return 'Chờ đặt cọc';
                    case 'CONFIRMED': return 'Đã duyệt may';
                    case 'IN_PRODUCTION': return 'Đang may';
                    case 'COMPLETED': return 'Hoàn thành';
                    case 'CANCELLED': return 'Đã hủy';
                    default: return status;
                  }
                };

                return (
                  <tr key={o.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-900">{o.orderNumber}</td>
                    <td className="p-3 text-slate-700">{o.styleId}</td>
                    <td className="p-3 font-bold text-slate-900">{total} cái</td>
                    <td className="p-3 text-slate-600">{new Date(o.dueDate).toLocaleDateString('vi-VN')}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-slate-100 text-slate-800">
                        {getStatusText(o.status)}
                      </span>
                    </td>
                    <td className="p-3 w-48">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-denim-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                        <span className="font-mono font-bold text-slate-700 text-[11px]">{percent}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
