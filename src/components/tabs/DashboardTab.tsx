'use client';

import React from 'react';
import { ProductionOrder } from '@/types';
import { Activity, Clock, CheckCircle, AlertTriangle, Layers, ArrowRight } from 'lucide-react';

interface DashboardTabProps {
  orders: ProductionOrder[];
  onSelectTab: (tab: any) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({ orders, onSelectTab }) => {
  const inProductionOrders = orders.filter((o) => o.status === 'IN_PRODUCTION');
  const confirmedOrders = orders.filter((o) => o.status === 'CONFIRMED');
  const completedOrders = orders.filter((o) => o.status === 'COMPLETED');
  const draftOrders = orders.filter((o) => o.status === 'DRAFT');

  const totalQty = orders.reduce(
    (sum, o) => sum + o.sizeLines.reduce((s, l) => s + l.plannedQty, 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-denim-800 to-denim-950 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider bg-denim-700/60 text-denim-200 px-2.5 py-1 rounded-full">
            Realtime WIP Dashboard
          </span>
          <h2 className="text-2xl font-bold mt-2">Xưởng Gia Công Quần Jean DenimFlow</h2>
          <p className="text-sm text-denim-200 mt-1 max-w-xl">
            Theo dõi tiến độ đơn hàng trên Dynamic Workflow, kiểm soát cổng chặn Gatekeeper, số lượng bán thành phẩm và tỷ lệ đạt chất lượng.
          </p>
        </div>
        <button
          onClick={() => onSelectTab('orders')}
          className="bg-white text-denim-900 hover:bg-denim-50 font-semibold px-4 py-2.5 rounded-xl shadow transition flex items-center space-x-2 text-sm flex-shrink-0"
        >
          <span>Quản lý đơn hàng</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase">Đang sản xuất (WIP)</div>
            <div className="text-3xl font-extrabold text-denim-600 mt-1">{inProductionOrders.length}</div>
            <div className="text-xs text-slate-500 mt-1">Đang chạy trên các trạm</div>
          </div>
          <div className="p-3 bg-denim-50 text-denim-600 rounded-xl">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase">Đã xác nhận (Chờ cắt)</div>
            <div className="text-3xl font-extrabold text-blue-600 mt-1">{confirmedOrders.length}</div>
            <div className="text-xs text-slate-500 mt-1">Đã snapshot workflow</div>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase">Hoàn thành & Bàn giao</div>
            <div className="text-3xl font-extrabold text-emerald-600 mt-1">{completedOrders.length}</div>
            <div className="text-xs text-slate-500 mt-1">Đã qua kiểm định Final QC</div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase">Tổng sản lượng kế hoạch</div>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">{totalQty.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-1">Chiếc quần jean</div>
          </div>
          <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Orders List Snapshot */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-base">Trạng Thái Đơn Hàng Mới Nhất</h3>
          <button
            onClick={() => onSelectTab('orders')}
            className="text-xs font-semibold text-denim-600 hover:text-denim-800"
          >
            Xem tất cả ({orders.length}) →
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {orders.map((order) => {
            const plannedQty = order.sizeLines.reduce((s, l) => s + l.plannedQty, 0);
            return (
              <div key={order.id} className="p-5 flex flex-wrap items-center justify-between gap-4 hover:bg-slate-50 transition">
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-slate-900">{order.orderNumber}</span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                        order.status === 'IN_PRODUCTION'
                          ? 'bg-amber-100 text-amber-800'
                          : order.status === 'CONFIRMED'
                          ? 'bg-blue-100 text-blue-800'
                          : order.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {order.status}
                    </span>
                    {order.skipCleanWash && (
                      <span className="text-xs px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-medium">
                        Bỏ giặt sạch (BR-19)
                      </span>
                    )}
                    {order.isCustom && (
                      <span className="text-xs px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-medium">
                        Custom Đơn (BR-17)
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center space-x-4">
                    <span>Số lượng: <strong>{plannedQty} chiếc</strong></span>
                    <span>Hạn giao: <strong>{new Date(order.dueDate).toLocaleDateString('vi-VN')}</strong></span>
                    <span>Profile QC: <strong>{order.qcProfileId || 'FULL_PROCESS'}</strong></span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onSelectTab('worklist')}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium px-3 py-1.5 rounded-lg transition"
                  >
                    Xem trạm gia công
                  </button>
                  <button
                    onClick={() => onSelectTab('workflow')}
                    className="text-xs bg-denim-50 hover:bg-denim-100 text-denim-700 font-medium px-3 py-1.5 rounded-lg transition"
                  >
                    Xem tiến trình Dynamic Workflow
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
