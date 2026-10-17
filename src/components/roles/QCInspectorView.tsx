'use client';

import React, { useState, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { animateStaggerCards } from '@/lib/animations';
import { ProductionOrder } from '@/types';
import { CheckCircle, AlertTriangle, XCircle, RotateCcw, AlertCircle, ShieldCheck, FileCheck } from 'lucide-react';

interface QCInspectorViewProps {
  orders: ProductionOrder[];
  catalog: any;
  onRefresh: () => void;
}

export const QCInspectorView: React.FC<QCInspectorViewProps> = ({
  orders,
  catalog,
  onRefresh,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0]?.id || '');
  const [stepCode, setStepCode] = useState('FINAL_QC');
  const [result, setResult] = useState<'PASS' | 'REWORK' | 'REJECT'>('PASS');
  const [targetStepCodeForRework, setTargetStepCodeForRework] = useState('SEWING');
  const [shrinkageMeasured, setShrinkageMeasured] = useState(2.8);
  const [fadingLevelMeasured, setFadingLevelMeasured] = useState(2.0);
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useGSAP(
    () => {
      animateStaggerCards(containerRef.current, '.qc-card');
    },
    { scope: containerRef, dependencies: [selectedOrderId] }
  );

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

      setSuccessMessage('Lưu kết quả kiểm định QC thành công! Dữ liệu đã ghi nhận vào Audit Log (BR-16).');
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi');
    }
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-rose-700 via-pink-700 to-indigo-800 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 text-white px-2.5 py-1 rounded-full">
              QC Inspector Workspace
            </span>
            <span className="text-xs text-rose-100">• Kiểm định chất lượng độc lập & Phê duyệt nghiệm thu</span>
          </div>
          <h2 className="text-2xl font-bold mt-2">Trạm Kiểm Định Chất Lượng Quần Jean (AQL & Co Rút)</h2>
          <p className="text-sm text-rose-100 mt-1 max-w-xl">
            Đánh giá theo QC Profile của từng đơn (BR-19), kiểm soát vòng rework tối đa 3 lần (BR-10) và tuân thủ phân tách trách nhiệm (BR-11).
          </p>
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inspection Form */}
        <div className="qc-card lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4 text-xs">
          <h3 className="font-extrabold text-slate-900 text-base">Biên Bản Kiểm Định Nghiệm Thu Chất Lượng</h3>

          <form onSubmit={handleSubmitQc} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Chọn Đơn Hàng Kiểm Tra</label>
                <select
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2 bg-slate-50 font-bold text-slate-900"
                >
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>{o.orderNumber} ({o.status})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Công Đoạn Kiểm Tra</label>
                <select
                  value={stepCode}
                  onChange={(e) => setStepCode(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2 bg-slate-50 font-bold"
                >
                  <option value="FINAL_QC">FINAL_QC (Kiểm định cuối kỳ trước đóng gói)</option>
                  <option value="FABRIC_INSPECT">FABRIC_INSPECT (Kiểm vải đầu vào)</option>
                </select>
              </div>
            </div>

            {/* Threshold Inputs */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="font-bold text-slate-800">Thông Số Đo Kiểm Thực Tế:</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Độ Co Rút Đo Được (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={shrinkageMeasured}
                    onChange={(e) => setShrinkageMeasured(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2 font-extrabold text-sm text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Độ Phai Màu Sau Giặt (Cấp 1-5)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="5"
                    value={fadingLevelMeasured}
                    onChange={(e) => setFadingLevelMeasured(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2 font-extrabold text-sm text-slate-900"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Decision Buttons */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Quyết Định Của QC Inspector</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setResult('PASS')}
                  className={`p-3 rounded-2xl border font-bold flex flex-col items-center space-y-1 transition ${
                    result === 'PASS'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span>PASS (Đạt)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setResult('REWORK')}
                  className={`p-3 rounded-2xl border font-bold flex flex-col items-center space-y-1 transition ${
                    result === 'REWORK'
                      ? 'bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-500 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <RotateCcw className="w-5 h-5 text-amber-600" />
                  <span>REWORK (Sửa Lại)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setResult('REJECT')}
                  className={`p-3 rounded-2xl border font-bold flex flex-col items-center space-y-1 transition ${
                    result === 'REJECT'
                      ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-500 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <XCircle className="w-5 h-5 text-rose-600" />
                  <span>REJECT (Hủy Lô)</span>
                </button>
              </div>
            </div>

            {/* Rework Routing Selection (BR-10) */}
            {result === 'REWORK' && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
                <label className="block font-bold text-amber-900">
                  Điều Hướng Trả Về Công Đoạn Khắc Phục (BR-10):
                </label>
                <select
                  value={targetStepCodeForRework}
                  onChange={(e) => setTargetStepCodeForRework(e.target.value)}
                  className="w-full bg-white border border-amber-300 rounded-xl p-2 font-bold text-slate-800"
                >
                  <option value="SEWING">May Ráp (Tổ May sửa đường may / bọ)</option>
                  <option value="FINISHING">Hoàn Thiện (Cắt chỉ / ủi lại / thay nút)</option>
                  <option value="EFFECT_WASH">Wash Hiệu Ứng (Wash mài lại)</option>
                </select>
                <div className="text-[11px] text-amber-800">
                  * BR-10: Hệ thống giới hạn tối đa 3 vòng Rework. Nếu vượt quá, đơn hàng sẽ chuyển sang cho Planner xử lý ngoại lệ.
                </div>
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">Ghi Chú Biên Bản Nghiệm Thu</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Nhập nhận xét lỗi, vị trí phát hiện, bundling liên quan..."
                className="w-full border border-slate-300 rounded-xl p-2 text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md transition"
            >
              Phê Duyệt Biên Bản QC
            </button>
          </form>
        </div>

        {/* Applied QC Profile Card */}
        <div className="qc-card bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4 text-xs">
          <h3 className="font-extrabold text-slate-900 text-base">Hồ Sơ QC Áp Dụng (BR-19)</h3>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
            <div>
              <div className="text-slate-400 font-semibold uppercase text-[10px]">Tên Profile</div>
              <div className="text-base font-extrabold text-slate-900 mt-0.5">{profileType}</div>
              <p className="text-slate-500 mt-1">
                {selectedOrder?.skipCleanWash
                  ? 'Đơn hàng bỏ qua bước Giặt Sạch, áp dụng ngưỡng co rút nới lỏng theo thỏa thuận văn bản khách ký (BR-19).'
                  : 'Đơn hàng chạy đầy đủ chu trình giặt sạch ổn định sợi.'}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <div className="text-slate-400 font-semibold uppercase text-[10px]">Ngưỡng Co Rút Chuẩn Cho Phép</div>
              <div className="text-xl font-extrabold text-rose-600 mt-0.5">
                ≤ {qcProfile?.maxShrinkagePercent || 3.5}%
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <div className="text-slate-400 font-semibold uppercase text-[10px]">Ngưỡng Phai Màu Chuẩn Cho Phép</div>
              <div className="text-xl font-extrabold text-rose-600 mt-0.5">
                Cấp {qcProfile?.maxColorFadingLevel || 2.5}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
