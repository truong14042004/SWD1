'use client';

import React, { useState } from 'react';
import { ProductionOrder, UserRole } from '@/types';
import { Plus, CheckCircle, FileText, AlertCircle, PackageCheck, Eye, Layers, FileCheck } from 'lucide-react';
import { FileUpload } from '@/components/ui/FileUpload';
import { FilePreviewModal } from '@/components/ui/FilePreviewModal';

interface OrdersTabProps {
  orders: ProductionOrder[];
  catalog: any;
  currentRole: UserRole;
  onRefresh: () => void;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({
  orders,
  catalog,
  currentRole,
  onRefresh,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<{
    isOpen: boolean;
    fileUrl: string;
    fileName?: string;
    title?: string;
  } | null>(null);

  // Form State for New Order
  const [styleId, setStyleId] = useState(catalog?.styles[0]?.id || '');
  const [fabricTypeId, setFabricTypeId] = useState(catalog?.fabrics[0]?.id || '');
  const [colorId, setColorId] = useState(catalog?.colors[0]?.id || '');
  const [washType, setWashType] = useState('NONE');
  const [dyeRequired, setDyeRequired] = useState(false);
  const [skipCleanWash, setSkipCleanWash] = useState(false);
  const [isCustom, setIsCustom] = useState(false);
  const [dueDate, setDueDate] = useState('2026-11-30');
  const [ackFileUrl, setAckFileUrl] = useState('');
  const [ackBy, setAckBy] = useState('');

  const [sizes, setSizes] = useState([
    { size: '29', plannedQty: 100 },
    { size: '30', plannedQty: 200 },
    { size: '31', plannedQty: 200 },
    { size: '32', plannedQty: 100 },
  ]);

  // BR-04: Filter valid colors based on selected FabricType
  const allowedColorIds = catalog?.fabricColorRules
    ? catalog.fabricColorRules
        .filter((r: any) => r.fabricTypeId === fabricTypeId && r.isAllowed)
        .map((r: any) => r.colorId)
    : [];

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // BR-19: Validation for skip clean wash
    if (skipCleanWash && !ackFileUrl.trim()) {
      setErrorMessage('BR-19: Khách hàng bỏ Giặt sạch bắt buộc phải đính kèm đường dẫn văn bản khách ký xác nhận!');
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
          actorId: currentRole.toLowerCase(),
          acknowledgementFileUrl: skipCleanWash ? ackFileUrl : undefined,
          acknowledgementBy: skipCleanWash ? ackBy || 'Brand Buyer' : undefined,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setErrorMessage(data.error);
        return;
      }

      setSuccessMessage('Tạo đơn hàng gia công mới thành công (trạng thái DRAFT)!');
      setShowCreateModal(false);
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi kết nối máy chủ');
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
      setSuccessMessage('Đơn hàng đã được xác nhận và snapshot workflow thành công!');
      onRefresh();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: 'CONFIRMED' });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi kết nối');
    }
  };

  const handleAllocate = async (orderId: string, bomLineId: string, fabricLotId: string, qty: number) => {
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
        setErrorMessage(data.error);
        return;
      }
      setSuccessMessage('Đã giữ chỗ và cấp phát vật tư thành công (BR-06)!');
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi');
    }
  };

  return (
    <div className="space-y-6">
      {/* Messages */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center space-x-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center space-x-3 text-sm">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Danh Sách Đơn Hàng Gia Công Quần Jean</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Mỗi đơn chạy theo một Workflow Version xác định (BR-03), áp dụng Ma Trận Vải–Màu (BR-04) và QC Profile (BR-19).
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-denim-600 hover:bg-denim-700 text-white font-semibold px-4 py-2 rounded-xl text-sm shadow flex items-center space-x-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Đơn Hàng Mới</span>
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-semibold">
                <th className="py-3 px-4">Mã Đơn</th>
                <th className="py-3 px-4">Style Quần</th>
                <th className="py-3 px-4">Vải & Màu (BR-04)</th>
                <th className="py-3 px-4">Số Lượng</th>
                <th className="py-3 px-4">Hạn Giao</th>
                <th className="py-3 px-4">Quy Trình & QC Profile</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => {
                const style = catalog?.styles?.find((s: any) => s.id === order.styleId);
                const fabric = catalog?.fabrics?.find((f: any) => f.id === order.fabricTypeId);
                const color = catalog?.colors?.find((c: any) => c.id === order.colorId);
                const totalQty = order.sizeLines.reduce((s, l) => s + l.plannedQty, 0);

                return (
                  <tr key={order.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{order.orderNumber}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{style?.name || order.styleId}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      <div>{fabric?.code || order.fabricTypeId}</div>
                      <div className="text-slate-500 font-semibold">{color?.name || order.colorId}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{totalQty} pcs</td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {new Date(order.dueDate).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      {order.skipCleanWash ? (
                        <span className="inline-block px-2 py-0.5 rounded font-semibold bg-purple-100 text-purple-800">
                          Profile: SKIP_CLEAN_WASH (BR-19)
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded font-semibold bg-blue-100 text-blue-800">
                          Profile: FULL_PROCESS
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-bold ${
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
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded font-medium transition"
                      >
                        Chi tiết
                      </button>

                      {order.status === 'DRAFT' && (
                        <button
                          onClick={() => handleConfirmOrder(order.id)}
                          className="text-xs bg-denim-600 hover:bg-denim-700 text-white px-2.5 py-1 rounded font-medium transition"
                        >
                          Confirm (BR-03)
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

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Tiếp Nhận Đơn Hàng Gia Công Jean Mới</h3>
            <p className="text-xs text-slate-500 mb-4">
              Hệ thống tự động lọc cặp Vải-Màu hợp lệ theo Ma Trận (BR-04) và áp dụng QC Profile phù hợp (BR-19).
            </p>

            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Style Quần Jean</label>
                  <select
                    value={styleId}
                    onChange={(e) => setStyleId(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-denim-500"
                  >
                    {catalog?.styles?.map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.styleCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Loại Vải Denim</label>
                  <select
                    value={fabricTypeId}
                    onChange={(e) => setFabricTypeId(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-denim-500"
                  >
                    {catalog?.fabrics?.map((f: any) => (
                      <option key={f.id} value={f.id}>
                        {f.code} ({f.weightOz}oz - {f.stretchType})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Màu Sắc (Lọc theo Fabric–Color Matrix - BR-04)
                </label>
                <select
                  value={colorId}
                  onChange={(e) => setColorId(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-denim-500"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hiệu Ứng Wash</label>
                  <select
                    value={washType}
                    onChange={(e) => setWashType(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-denim-500"
                  >
                    <option value="NONE">Không Wash (Jean Trơn / Raw Denim)</option>
                    <option value="ENZYME_WASH">Enzyme Wash</option>
                    <option value="STONE_WASH">Stone Wash (Mài Đá)</option>
                    <option value="ACID_WASH">Acid Wash (Mài Hiệu Ứng)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày Bàn Giao (Due Date)</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-denim-500"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dyeRequired}
                    onChange={(e) => setDyeRequired(e.target.checked)}
                    className="rounded text-denim-600 focus:ring-denim-500"
                  />
                  <span>Yêu cầu Nhuộm Thành Phẩm (Dyeing Required)</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCustom}
                    onChange={(e) => setIsCustom(e.target.checked)}
                    className="rounded text-denim-600 focus:ring-denim-500"
                  />
                  <span>Đơn Custom Riêng (BR-17: Kích hoạt CUSTOM_REVIEW và bắt buộc duyệt mẫu PP_SAMPLE)</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-semibold text-purple-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={skipCleanWash}
                    onChange={(e) => setSkipCleanWash(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span>Khách yêu cầu BỎ GIẶT SẠCH để giảm giá thành (BR-18, BR-19)</span>
                </label>

                {skipCleanWash && (
                  <div className="p-4 bg-purple-50/80 border border-purple-200 rounded-2xl space-y-3 text-xs">
                    <FileUpload
                      label="Ràng buộc BR-19: Tệp Văn Bản Khách Ký Xác Nhận (Waiver)"
                      helperText="Do bỏ giặt sạch, sản phẩm chưa ổn định co rút. Bắt buộc tệp khách ký để áp dụng Profile SKIP_CLEAN_WASH."
                      accept=".pdf,.png,.jpg,.jpeg,.docx"
                      value={ackFileUrl}
                      onChange={(fileUrl) => setAckFileUrl(fileUrl)}
                      sampleTemplateUrl="/docs/waiver-raw-denim-signed.pdf"
                      sampleTemplateName="Bien_Ban_Thoa_Thuan_Mien_Tru_Co_Rut_Denim_Signed.pdf"
                      required
                    />

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Người đại diện khách hàng ký (VD: Brand Buyer DenimLab)
                      </label>
                      <input
                        type="text"
                        placeholder="Họ tên người ký"
                        value={ackBy}
                        onChange={(e) => setAckBy(e.target.value)}
                        className="w-full bg-white border border-purple-300 rounded-xl p-2 focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Size Run */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kế Hoạch Số Lượng Theo Size (Size Run)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {sizes.map((s, idx) => (
                    <div key={s.size} className="bg-slate-50 p-2 rounded border border-slate-200 text-center">
                      <div className="text-xs font-bold text-slate-700">Size {s.size}</div>
                      <input
                        type="number"
                        min="0"
                        value={s.plannedQty}
                        onChange={(e) => {
                          const updated = [...sizes];
                          updated[idx].plannedQty = Number(e.target.value) || 0;
                          setSizes(updated);
                        }}
                        className="w-full text-center text-sm border border-slate-300 rounded mt-1 p-1 font-semibold"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-denim-600 hover:bg-denim-700 text-white rounded-lg text-xs font-semibold shadow transition"
                >
                  Tạo Đơn Hàng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Chi Tiết Đơn Hàng: {selectedOrder.orderNumber}</h3>
                <span className="text-xs font-semibold text-denim-600">Trạng thái: {selectedOrder.status}</span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕ Đóng
              </button>
            </div>

            {/* BOM and Allocations */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">Định Mức Vật Tư (BOM & Allocations - BR-06)</h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                    <tr>
                      <th className="p-2">Loại Vật Tư</th>
                      <th className="p-2">Định Mức Cần</th>
                      <th className="p-2">Đã Giữ Chỗ (Allocated)</th>
                      <th className="p-2 text-right">Thao Tác Thủ Kho</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedOrder.bomLines?.map((bom) => {
                      const totalAllocated = selectedOrder.allocations
                        ?.filter((a) => a.bomLineId === bom.id)
                        .reduce((sum, a) => sum + a.allocatedQty, 0) || 0;
                      const isComplete = totalAllocated >= bom.requiredQty;

                      return (
                        <tr key={bom.id}>
                          <td className="p-2 font-bold text-slate-800">{bom.materialType}</td>
                          <td className="p-2">{bom.requiredQty} {bom.unit}</td>
                          <td className="p-2">
                            <span className={`font-semibold ${isComplete ? 'text-emerald-700' : 'text-amber-700'}`}>
                              {totalAllocated} / {bom.requiredQty} {bom.unit}
                            </span>
                          </td>
                          <td className="p-2 text-right">
                            {!isComplete && bom.materialType === 'FABRIC' && (
                              <button
                                onClick={() =>
                                  handleAllocate(
                                    selectedOrder.id,
                                    bom.id,
                                    catalog?.fabricLots[0]?.id,
                                    bom.requiredQty - totalAllocated
                                  )
                                }
                                className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs font-medium"
                              >
                                Cấp Vải từ Kho (BR-06)
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

            {/* Customer Acknowledgement if Skip Clean Wash */}
            {selectedOrder.acknowledgement && (
              <div className="p-3.5 bg-purple-50/90 border border-purple-200 rounded-2xl text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-extrabold text-purple-900 flex items-center space-x-1.5">
                    <FileCheck className="w-4 h-4 text-purple-600" />
                    <span>Văn Bản Khách Hàng Xác Nhận Bỏ Giặt Sạch (BR-19)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewData({
                        isOpen: true,
                        fileUrl:
                          selectedOrder.acknowledgement?.fileUrl ||
                          '/docs/waiver-raw-denim-signed.pdf',
                        fileName: `Waiver_${selectedOrder.orderNumber}_Signed.pdf`,
                        title: `Văn Bản Khách Ký Xác Nhận Bỏ Giặt Sạch (BR-19) — Đơn ${selectedOrder.orderNumber}`,
                      })
                    }
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-2xs transition flex items-center space-x-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Xem Tệp Đính Kèm</span>
                  </button>
                </div>
                <div>Đại diện ký: <strong>{selectedOrder.acknowledgement.acknowledgedBy}</strong></div>
                <div>Áp dụng Profile: <strong className="text-purple-700">SKIP_CLEAN_WASH (Ngưỡng co rút riêng)</strong></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {previewData && (
        <FilePreviewModal
          isOpen={previewData.isOpen}
          onClose={() => setPreviewData(null)}
          fileUrl={previewData.fileUrl}
          fileName={previewData.fileName}
          title={previewData.title}
        />
      )}
    </div>
  );
};
