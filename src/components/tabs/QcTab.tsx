'use client';

import React, { useState } from 'react';
import { ProductionOrder, UserRole } from '@/types';
import { CheckCircle, AlertTriangle, XCircle, RotateCcw, AlertCircle } from 'lucide-react';

interface QcTabProps {
  orders: ProductionOrder[];
  catalog: any;
  currentRole: UserRole;
  onRefresh: () => void;
}

export const QcTab: React.FC<QcTabProps> = ({ orders, catalog, currentRole, onRefresh }) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0]?.id || '');
  const [stepCode, setStepCode] = useState('FINAL_QC');
  const [result, setResult] = useState<'PASS' | 'REWORK' | 'REJECT'>('PASS');
  const [targetStepCodeForRework, setTargetStepCodeForRework] = useState('SEWING');
  const [shrinkageMeasured, setShrinkageMeasured] = useState(2.8);
  const [fadingLevelMeasured, setFadingLevelMeasured] = useState(2.0);
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);
  const profileType = selectedOrder?.skipCleanWash ? 'SKIP_CLEAN_WASH' : 'FULL_PROCESS';
  const qcProfile = catalog?.qcProfiles?.find(
    (qp: any) => qp.styleId === selectedOrder?.styleId && qp.profileType === profileType
  );

  const handleSubmitQc = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/execution/qc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrderId,
          stepCode,
          inspectorId: 'u-qc',
          result,
          targetStepCodeForRework: result === 'REWORK' ? targetStepCodeForRework : undefined,
          shrinkageMeasured: Number(shrinkageMeasured),
          fadingLevelMeasured: Number(fadingLevelMeasured),
          notes,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setErrorMessage(data.error);
        return;
      }

      setSuccessMessage('Đã lưu kết quả kiểm định QC thành công!');
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Kiểm Định Chất Lượng Sản Phẩm (Độ Co Rút & Phai Màu)</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Kiểm tra theo đúng tiêu chuẩn chất lượng của từng mã hàng, giới hạn sửa lại tối đa 3 lần và đảm bảo kiểm định độc lập.
        </p>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: QC Form */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 text-base mb-4">Phiếu Kiểm Định Chất Lượng Sản Phẩm</h3>

          <form onSubmit={handleSubmitQc} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chọn Đơn Hàng Kiểm Định</label>
                <select
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-denim-500"
                >
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.orderNumber} ({o.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Công Đoạn Kiểm Tra</label>
                <select
                  value={stepCode}
                  onChange={(e) => setStepCode(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-denim-500"
                >
                  <option value="FINAL_QC">Kiểm tra thành phẩm trước đóng thùng</option>
                  <option value="FABRIC_INSPECT">Kiểm tra vải mộc nhập kho</option>
                </select>
              </div>
            </div>

            {/* Threshold Measurements */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="font-bold text-slate-800">Thông Số Đo Lường Thực Tế (So với Tiêu Chuẩn)</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 mb-1">Độ Co Rút Đo Được (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={shrinkageMeasured}
                    onChange={(e) => setShrinkageMeasured(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-sm font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Độ Phai Màu Đo Được (Level 1-5)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="5"
                    value={fadingLevelMeasured}
                    onChange={(e) => setFadingLevelMeasured(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-sm font-bold"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Decision */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kết Luận Kiểm Định Chất Lượng</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setResult('PASS')}
                  className={`p-3 rounded-xl border text-center font-bold flex flex-col items-center space-y-1 transition ${
                    result === 'PASS'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span>ĐẠT CHUẨN</span>
                </button>

                <button
                  type="button"
                  onClick={() => setResult('REWORK')}
                  className={`p-3 rounded-xl border text-center font-bold flex flex-col items-center space-y-1 transition ${
                    result === 'REWORK'
                      ? 'bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-500'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <RotateCcw className="w-5 h-5 text-amber-600" />
                  <span>SỬA LẠI</span>
                </button>

                <button
                  type="button"
                  onClick={() => setResult('REJECT')}
                  className={`p-3 rounded-xl border text-center font-bold flex flex-col items-center space-y-1 transition ${
                    result === 'REJECT'
                      ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-500'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <XCircle className="w-5 h-5 text-rose-600" />
                  <span>PHẾ PHẨM</span>
                </button>
              </div>
            </div>

            {/* Target Step for Rework */}
            {result === 'REWORK' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                <label className="block font-bold text-amber-900">Chuyển về công đoạn để sửa lại</label>
                <select
                  value={targetStepCodeForRework}
                  onChange={(e) => setTargetStepCodeForRework(e.target.value)}
                  className="w-full bg-white border border-amber-300 rounded p-2 text-sm"
                >
                  <option value="SEWING">May Ráp (Tổ May)</option>
                  <option value="FINISHING">Hoàn Thiện (Cắt Chỉ, Ủi)</option>
                  <option value="EFFECT_WASH">Wash Hiệu Ứng</option>
                </select>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ghi Chú Biên Bản QC</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Nhập ghi chú chi tiết kết quả kiểm tra..."
                className="w-full border border-slate-300 rounded-lg p-2 text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-denim-600 hover:bg-denim-700 text-white font-bold rounded-xl shadow transition text-sm"
            >
              Lưu Kết Quả Kiểm Định QC
            </button>
          </form>
        </div>

        {/* Right: Active QC Profile Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Tiêu Chuẩn Chất Lượng Áp Dụng</h3>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 text-xs">
            <div>
              <div className="text-slate-400 font-semibold uppercase">Tên Tiêu Chuẩn</div>
              <div className="text-sm font-bold text-slate-800 mt-0.5">{profileType === 'SKIP_CLEAN_WASH' ? 'Bỏ Qua Giặt Sạch' : 'Quy Trình Chuẩn (Đầy Đủ)'}</div>
              <div className="text-slate-500 mt-0.5">
                {selectedOrder?.skipCleanWash
                  ? 'Áp dụng cho đơn bỏ qua bước Giặt Sạch (có văn bản khách ký)'
                  : 'Áp dụng cho đơn đi qua đầy đủ chu trình Giặt Sạch'}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <div className="text-slate-400 font-semibold uppercase">Ngưỡng Co Rút Tối Đa</div>
              <div className="text-base font-extrabold text-denim-700 mt-0.5">
                ≤ {qcProfile?.maxShrinkagePercent || 3.5}%
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <div className="text-slate-400 font-semibold uppercase">Ngưỡng Phai Màu Tối Đa</div>
              <div className="text-base font-extrabold text-denim-700 mt-0.5">
                Cấp {qcProfile?.maxColorFadingLevel || 2.5}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
