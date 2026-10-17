'use client';

import React, { useState, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { animateStaggerCards } from '@/lib/animations';
import { ProductionOrder } from '@/types';
import { Plus, CheckCircle, Clock, AlertCircle, FileText, ChevronRight, Play, Pause, XCircle } from 'lucide-react';
import { FileUpload } from '@/components/ui/FileUpload';

interface ProductionPlannerViewProps {
  orders: ProductionOrder[];
  catalog: any;
  onRefresh: () => void;
  initialAction?: 'pipeline' | 'create' | 'bom';
}

export const ProductionPlannerView: React.FC<ProductionPlannerViewProps> = ({
  orders,
  catalog,
  onRefresh,
  initialAction,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showCreateModal, setShowCreateModal] = useState(initialAction === 'create');
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null);

  React.useEffect(() => {
    if (initialAction === 'create') {
      setShowCreateModal(true);
    }
  }, [initialAction]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // New order form fields
  const [styleId, setStyleId] = useState(catalog?.styles?.[0]?.id || '');
  const [fabricTypeId, setFabricTypeId] = useState(catalog?.fabrics?.[0]?.id || '');
  const [colorId, setColorId] = useState(catalog?.colors?.[0]?.id || '');
  const [washType, setWashType] = useState('NONE');
  const [dyeRequired, setDyeRequired] = useState(false);
  const [skipCleanWash, setSkipCleanWash] = useState(false);
  const [isCustom, setIsCustom] = useState(false);
  const [dueDate, setDueDate] = useState('2026-11-30');
  const [ackFileUrl, setAckFileUrl] = useState('');
  const [ackBy, setAckBy] = useState('');

  const [sizes, setSizes] = useState([
    { size: '29', plannedQty: 100 },
    { size: '30', plannedQty: 250 },
    { size: '31', plannedQty: 250 },
    { size: '32', plannedQty: 150 },
  ]);

  useGSAP(
    () => {
      animateStaggerCards(containerRef.current, '.order-card');
    },
    { scope: containerRef, dependencies: [orders] }
  );

  // BR-04: Allowed colors for selected fabric
  const allowedColorIds = catalog?.fabricColorRules
    ? catalog.fabricColorRules
        .filter((r: any) => r.fabricTypeId === fabricTypeId && r.isAllowed)
        .map((r: any) => r.colorId)
    : [];

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // BR-19: Skip clean wash check
    if (skipCleanWash && !ackFileUrl.trim()) {
      setErrorMessage('BR-19: Đơn hàng bỏ giặt sạch bắt buộc phải đính kèm văn bản khách ký xác nhận!');
      return;
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: `PO-${Date.now().toString().slice(-5)}`,
          styleId,
          fabricTypeId,
          colorId,
          washType,
          dyeRequired,
          dyeMode: 'TOTAL',
          dyeSource: 'INTERNAL',
          skipCleanWash,
          isCustom,
          dueDate: new Date(dueDate).toISOString(),
          sizeLines: sizes.filter((s) => s.plannedQty > 0),
          actorId: 'u-planner',
          acknowledgementFileUrl: skipCleanWash ? ackFileUrl : undefined,
          acknowledgementBy: skipCleanWash ? ackBy || 'Brand Buyer' : undefined,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setErrorMessage(data.error);
        return;
      }

      setSuccessMessage('Tiếp nhận đơn gia công mới thành công (trạng thái DRAFT)!');
      setShowCreateModal(false);
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi');
    }
  };

  const handleConfirmOrder = async (orderId: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CONFIRM', actorId: 'u-planner' }),
      });
      const data = await res.json();
      if (!data.success) {
        setErrorMessage(data.error);
        return;
      }
      setSuccessMessage('Xác nhận đơn thành công! Đã snapshot Workflow Version (BR-03) và mở step đầu tiên.');
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi');
    }
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-denim-600 to-indigo-700 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 text-white px-2.5 py-1 rounded-full">
              Production Planner Workspace
            </span>
            <span className="text-xs text-blue-100">• Lập kế hoạch sản xuất & Quản lý vòng đời đơn</span>
          </div>
          <h2 className="text-2xl font-bold mt-2">Điều Hành Kế Hoạch Sản Xuất Jean</h2>
          <p className="text-sm text-blue-100 mt-1 max-w-xl">
            Tạo đơn theo Ma Trận Vải–Màu (BR-04), snapshot workflow khi Confirm (BR-03), xử lý miễn trừ giặt sạch (BR-18, BR-19) và cấp vật tư.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-white text-denim-900 hover:bg-blue-50 font-bold px-4 py-2.5 rounded-xl text-xs shadow-lg transition flex items-center space-x-1.5 flex-shrink-0"
        >
          <Plus className="w-4 h-4 text-denim-700" />
          <span>Tạo Đơn Hàng Mới</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center space-x-2 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center space-x-2 text-xs font-semibold">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Orders Pipeline Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map((order) => {
          const totalQty = order.sizeLines.reduce((s, l) => s + l.plannedQty, 0);
          const style = catalog?.styles?.find((s: any) => s.id === order.styleId);
          const fabric = catalog?.fabrics?.find((f: any) => f.id === order.fabricTypeId);
          const color = catalog?.colors?.find((c: any) => c.id === order.colorId);

          return (
            <div
              key={order.id}
              className="order-card bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900 text-base">{order.orderNumber}</span>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
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
              </div>

              <div>
                <h4 className="font-bold text-slate-800 text-sm">{style?.name || order.styleId}</h4>
                <div className="text-xs text-slate-500 mt-0.5">
                  Vải: <strong>{fabric?.code}</strong> • Màu: <strong>{color?.name}</strong>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Sản lượng kế hoạch:</span>
                  <span className="font-bold text-slate-800">{totalQty} chiếc</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Hạn bàn giao:</span>
                  <span className="font-medium text-slate-700">{new Date(order.dueDate).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">QC Profile:</span>
                  <span className={`font-bold ${order.skipCleanWash ? 'text-purple-700' : 'text-blue-700'}`}>
                    {order.skipCleanWash ? 'SKIP_CLEAN_WASH (BR-19)' : 'FULL_PROCESS'}
                  </span>
                </div>
              </div>

              {order.skipCleanWash && (
                <div className="p-2 bg-purple-50 border border-purple-200 rounded-lg text-[11px] text-purple-800 font-medium">
                  ✓ Đã đính kèm văn bản khách ký xác nhận bỏ giặt sạch (BR-19)
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="text-xs font-semibold text-slate-600 hover:text-denim-600"
                >
                  Xem định mức BOM →
                </button>

                {order.status === 'DRAFT' && (
                  <button
                    onClick={() => handleConfirmOrder(order.id)}
                    className="bg-denim-600 hover:bg-denim-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow transition flex items-center space-x-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Confirm (BR-03)</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">Lập Đơn Hàng Gia Công Quần Jean Mới</h3>
                <p className="text-xs text-slate-500">Hệ thống áp dụng Fabric–Color Matrix (BR-04) và QC Profile (BR-19).</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Style Quần Jean</label>
                  <select
                    value={styleId}
                    onChange={(e) => setStyleId(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2 bg-slate-50 focus:bg-white font-medium"
                  >
                    {catalog?.styles?.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.styleCode})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Loại Vải Denim</label>
                  <select
                    value={fabricTypeId}
                    onChange={(e) => setFabricTypeId(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2 bg-slate-50 focus:bg-white font-medium"
                  >
                    {catalog?.fabrics?.map((f: any) => (
                      <option key={f.id} value={f.id}>{f.code} ({f.weightOz}oz - {f.stretchType})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Màu Sắc (Chỉ màu hợp lệ theo Fabric–Color Matrix - BR-04)
                </label>
                <select
                  value={colorId}
                  onChange={(e) => setColorId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2 bg-slate-50 focus:bg-white font-bold text-slate-800"
                >
                  {catalog?.colors?.map((c: any) => {
                    const isAllowed = allowedColorIds.includes(c.id);
                    return (
                      <option key={c.id} value={c.id} disabled={!isAllowed}>
                        {c.name} {isAllowed ? '✓ (Hợp lệ)' : '✗ (Không tương thích theo BR-04)'}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kiểu Giặt Mài (Wash Type)</label>
                  <select
                    value={washType}
                    onChange={(e) => setWashType(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2 bg-slate-50"
                  >
                    <option value="NONE">Không Wash (Jean Trơn)</option>
                    <option value="STONE_WASH">Stone Wash (Mài Đá)</option>
                    <option value="ENZYME_WASH">Enzyme Wash</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hạn Giao Hàng</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2 bg-slate-50"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <label className="flex items-center space-x-2 font-bold text-purple-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={skipCleanWash}
                    onChange={(e) => setSkipCleanWash(e.target.checked)}
                    className="rounded text-purple-600"
                  />
                  <span>Khách yêu cầu BỎ GIẶT SẠCH (BR-18 & BR-19)</span>
                </label>

                {skipCleanWash && (
                  <div className="p-4 bg-purple-50/80 border border-purple-200/90 rounded-2xl space-y-3 text-xs">
                    <FileUpload
                      label="BR-19: Tệp Văn Bản Khách Ký Xác Nhận (Waiver Bỏ Giặt Sạch)"
                      helperText="Bấm để chọn tệp từ máy tính (PDF, Scan ảnh, Word) hoặc kéo thả vào đây"
                      accept=".pdf,.png,.jpg,.jpeg,.docx"
                      value={ackFileUrl}
                      onChange={(fileUrl) => setAckFileUrl(fileUrl)}
                      sampleTemplateUrl="/docs/waiver-raw-denim-signed.pdf"
                      sampleTemplateName="Bien_Ban_Thoa_Thuan_Mien_Tru_Co_Rut_Denim_Signed.pdf"
                      required
                    />

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Họ tên người đại diện khách hàng ký xác nhận
                      </label>
                      <input
                        type="text"
                        placeholder="VD: Nguyễn Văn Đại Diện - Giám Đốc Nhãn Hàng"
                        value={ackBy}
                        onChange={(e) => setAckBy(e.target.value)}
                        className="w-full bg-white border border-purple-300 rounded-xl p-2 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Size Run */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Số Lượng Theo Size (Size Run)</label>
                <div className="grid grid-cols-4 gap-2">
                  {sizes.map((s, idx) => (
                    <div key={s.size} className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-center">
                      <div className="font-bold text-slate-700">Size {s.size}</div>
                      <input
                        type="number"
                        min="0"
                        value={s.plannedQty}
                        onChange={(e) => {
                          const updated = [...sizes];
                          updated[idx].plannedQty = Number(e.target.value) || 0;
                          setSizes(updated);
                        }}
                        className="w-full text-center border border-slate-300 rounded mt-1 p-1 font-bold"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-denim-600 hover:bg-denim-700 text-white rounded-xl font-bold shadow-md"
                >
                  Tiếp Nhận Đơn Hàng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Chi Tiết Đơn: {selectedOrder.orderNumber}</h3>
                <span className="text-slate-500">Trạng thái: <strong>{selectedOrder.status}</strong></span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕ Đóng</button>
            </div>

            <div>
              <div className="font-bold text-slate-800 mb-2">Định Mức Vật Tư Dự Tính (BOM):</div>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 font-semibold text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Vật Tư</th>
                      <th className="p-2.5">Định Mức Cần</th>
                      <th className="p-2.5">Đã Giữ Chỗ (Allocated)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedOrder.bomLines?.map((b) => (
                      <tr key={b.id}>
                        <td className="p-2.5 font-bold text-slate-800">{b.materialType}</td>
                        <td className="p-2.5">{b.requiredQty} {b.unit}</td>
                        <td className="p-2.5 text-emerald-700 font-semibold">Đã kiểm tra kho</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
