'use client';

import React, { useState, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { animateStaggerCards } from '@/lib/animations';
import { FabricLot, ProductionOrder } from '@/types';
import { Package, CheckCircle, AlertTriangle, Layers, ArrowUpRight, Scissors } from 'lucide-react';

interface WarehouseKeeperViewProps {
  catalog: any;
  orders: ProductionOrder[];
  onRefresh: () => void;
}

export const WarehouseKeeperView: React.FC<WarehouseKeeperViewProps> = ({
  catalog,
  orders,
  onRefresh,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [allocatingOrderId, setAllocatingOrderId] = useState<string | null>(null);

  useGSAP(
    () => {
      animateStaggerCards(containerRef.current, '.wh-card');
    },
    { scope: containerRef, dependencies: [orders] }
  );

  const awaitingOrders = orders.filter((o) => o.status === 'CONFIRMED' || o.status === 'DRAFT');

  const handleAllocate = async (orderId: string, bomLineId: string, fabricLotId: string, qty: number) => {
    setAllocatingOrderId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ALLOCATE_MATERIAL',
          bomLineId,
          fabricLotId,
          allocatedQty: qty,
          actorId: 'u-wh',
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setNotification(`Lỗi: ${data.error}`);
        return;
      }

      setNotification('Xuất vải thành công! Đơn hàng đã có đủ vải để bàn giao cho tổ cắt.');
      setTimeout(() => setNotification(null), 3500);
      onRefresh();
    } catch (err: any) {
      setNotification(`Lỗi kết nối: ${err.message}`);
    } finally {
      setAllocatingOrderId(null);
    }
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-denim-800 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 text-white px-2.5 py-1 rounded-full">
              Khu Vực Thủ Kho
            </span>
            <span className="text-xs text-emerald-100">• Quản lý kho vải & Xuất vật tư</span>
          </div>
          <h2 className="text-2xl font-bold mt-2">Kho Vải Denim & Phụ Liệu May</h2>
          <p className="text-sm text-emerald-100 mt-1 max-w-xl">
            Theo dõi tồn kho theo từng cuộn vải, xuất vải theo định mức may và hoàn trả vải vào kho khi đơn bị hủy.
          </p>
        </div>
      </div>

      {notification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center space-x-2 text-xs font-semibold shadow-sm">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Orders awaiting fabric allocation */}
      <div className="wh-card bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
            <Scissors className="w-5 h-5 text-emerald-600" />
            <span>Yêu Cầu Xuất Vải Bàn Giao Cho Tổ Cắt</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Lưu ý: Tổ Cắt chỉ được nhận việc và trải vải sau khi kho đã xuất đủ số mét vải theo kế hoạch.
          </p>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 font-semibold text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-3">Mã Đơn Hàng</th>
                <th className="p-3">Trạng Thái Đơn</th>
                <th className="p-3">Vải Cần Xuất Theo Định Mức</th>
                <th className="p-3">Đã Xuất / Kế Hoạch</th>
                <th className="p-3 text-right">Hành Động Của Thủ Kho</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {awaitingOrders.map((order) => {
                const fabricBom = order.bomLines?.find((b) => b.materialType === 'FABRIC');
                const totalAllocated = order.allocations
                  ?.filter((a) => a.bomLineId === fabricBom?.id)
                  .reduce((sum, a) => sum + a.allocatedQty, 0) || 0;

                const isFullyAllocated = fabricBom && totalAllocated >= fabricBom.requiredQty;
                const defaultLot = catalog?.fabricLots?.[0];

                const getStatusText = (status: string) => {
                  switch (status) {
                    case 'DRAFT': return 'Chờ đặt cọc';
                    case 'CONFIRMED': return 'Đã duyệt may';
                    case 'IN_PRODUCTION': return 'Đang may';
                    case 'COMPLETED': return 'Hoàn thành';
                    default: return status;
                  }
                };

                return (
                  <tr key={order.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-900">{order.orderNumber}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 text-[10px]">
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-800">{fabricBom?.requiredQty || 0} mét</div>
                      <div className="text-[10px] text-slate-500">Mã vải: {order.fabricTypeId}</div>
                    </td>
                    <td className="p-3">
                      <span className={`font-bold ${isFullyAllocated ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {totalAllocated} / {fabricBom?.requiredQty || 0} mét
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {isFullyAllocated ? (
                        <span className="text-emerald-700 font-bold flex items-center justify-end space-x-1">
                          <CheckCircle className="w-4 h-4" />
                          <span>Đã đủ vải (Sẵn sàng cắt)</span>
                        </span>
                      ) : (
                        <button
                          disabled={allocatingOrderId === order.id || !fabricBom || !defaultLot}
                          onClick={() =>
                            handleAllocate(
                              order.id,
                              fabricBom!.id,
                              defaultLot.id,
                              (fabricBom?.requiredQty || 0) - totalAllocated
                            )
                          }
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg shadow-sm transition text-xs"
                        >
                          {allocatingOrderId === order.id ? 'Đang cấp...' : 'Xuất Vải Cho Đơn Hàng'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fabric Lots Inventory */}
      <div className="wh-card bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
            <Package className="w-5 h-5 text-emerald-600" />
            <span>Quản Lý Tồn Kho Vải Denim Theo Cuộn / Lô</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Mỗi cuộn vải được theo dõi số lô, mét khả dụng và kết quả thử co rút ban đầu.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {catalog?.fabricLots?.map((lot: FabricLot) => {
            const fabric = catalog?.fabrics?.find((f: any) => f.id === lot.fabricTypeId);
            const color = catalog?.colors?.find((c: any) => c.id === lot.colorId);

            return (
              <div key={lot.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900 text-sm">{lot.lotNo}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Khả dụng
                  </span>
                </div>
                <div className="font-semibold text-slate-800">{fabric?.code}</div>
                <div className="text-slate-500">{color?.name}</div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase">Mét tồn</div>
                    <div className="text-sm font-extrabold text-emerald-700">{lot.availableMeters.toLocaleString()} m</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase">Độ co rút</div>
                    <div className="text-xs font-bold text-slate-700">{lot.shrinkagePercent}%</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
