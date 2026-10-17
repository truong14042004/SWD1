'use client';

import React, { useState } from 'react';
import { ProductionOrder, StationType, UserRole } from '@/types';
import { Play, Check, AlertCircle, FileUp, ShieldCheck } from 'lucide-react';

interface WorklistTabProps {
  orders: ProductionOrder[];
  currentRole: UserRole;
  onRefresh: () => void;
}

const STATIONS: { type: StationType; label: string }[] = [
  { type: 'CUTTING', label: 'Tổ Cắt' },
  { type: 'SEWING', label: 'Tổ May' },
  { type: 'EMBROIDERY', label: 'Thêu / In' },
  { type: 'DYEING', label: 'Nhuộm' },
  { type: 'WASH', label: 'Wash & Giặt' },
  { type: 'FINISHING', label: 'Hoàn Thiện' },
  { type: 'PACKING', label: 'Đóng Gói' },
];

export const WorklistTab: React.FC<WorklistTabProps> = ({ orders, currentRole, onRefresh }) => {
  const [activeStation, setActiveStation] = useState<StationType>('CUTTING');
  const [completeModalData, setCompleteModalData] = useState<{
    orderId: string;
    stepCode: string;
    stepName: string;
    qtyIn: number;
    requiresEvidence: boolean;
  } | null>(null);

  const [qtyGood, setQtyGood] = useState(0);
  const [qtyDefect, setQtyDefect] = useState(0);
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidenceNote, setEvidenceNote] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Extract all step tasks matching active station across all orders
  const tasks: {
    order: ProductionOrder;
    step: any;
  }[] = [];

  orders.forEach((order: any) => {
    if (order.workflowInstance?.stepInstances) {
      order.workflowInstance.stepInstances.forEach((step: any) => {
        if (step.stationType === activeStation) {
          tasks.push({ order, step });
        }
      });
    }
  });

  const handleStartStep = async (orderId: string, stepCode: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await fetch('/api/execution/step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'START', orderId, stepCode, actorId: 'u-operator' }),
      });
      const data = await res.json();
      if (!data.success) {
        setErrorMessage(data.error);
        return;
      }
      setSuccessMessage('Đã bắt đầu thực hiện công đoạn!');
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi');
    }
  };

  const handleCompleteStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completeModalData) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/execution/step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'COMPLETE',
          orderId: completeModalData.orderId,
          stepCode: completeModalData.stepCode,
          qtyGood,
          qtyDefect,
          evidenceUrl: evidenceUrl.trim() ? evidenceUrl : undefined,
          evidenceNote,
          actorId: 'u-operator',
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setErrorMessage(data.error);
        return;
      }
      setSuccessMessage('Công đoạn hoàn thành! Đã mở khóa các công đoạn kế tiếp theo quy trình.');
      setCompleteModalData(null);
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
          <Check className="w-5 h-5 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Worklist Trạm Gia Công (Station Operator)</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Tổ trưởng công đoạn nhận việc, thực hiện kiểm tra Gatekeeper (BR-14) và bảo toàn số lượng (BR-08).
        </p>
      </div>

      {/* Station Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {STATIONS.map((st) => (
          <button
            key={st.type}
            onClick={() => setActiveStation(st.type)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeStation === st.type
                ? 'bg-denim-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasks.length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-400 bg-white rounded-xl border border-slate-200 text-sm">
            Hiện không có công việc nào thuộc trạm {activeStation}.
          </div>
        ) : (
          tasks.map(({ order, step }) => {
            const canStart = step.status === 'READY';
            const canComplete = step.status === 'IN_PROGRESS';

            return (
              <div
                key={`${order.id}-${step.stepCode}`}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-base">{order.orderNumber}</span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      step.status === 'DONE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : step.status === 'IN_PROGRESS'
                        ? 'bg-amber-100 text-amber-800'
                        : step.status === 'READY'
                        ? 'bg-blue-100 text-blue-800'
                        : step.status === 'REWORK'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {step.status}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{step.name}</h4>
                  <div className="text-xs text-slate-500 mt-1">
                    Số lượng vào trạm: <strong>{step.qtyIn || 0} chiếc</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <div className="text-slate-500">
                    {step.requiresEvidence && (
                      <span className="text-purple-700 font-medium">Bắt buộc minh chứng (BR-15)</span>
                    )}
                  </div>

                  <div className="space-x-2">
                    {canStart && (
                      <button
                        onClick={() => handleStartStep(order.id, step.stepCode)}
                        className="bg-denim-600 hover:bg-denim-700 text-white font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 shadow transition"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Bắt đầu (Start)</span>
                      </button>
                    )}

                    {canComplete && (
                      <button
                        onClick={() => {
                          setCompleteModalData({
                            orderId: order.id,
                            stepCode: step.stepCode,
                            stepName: step.name,
                            qtyIn: step.qtyIn || 0,
                            requiresEvidence: step.requiresEvidence,
                          });
                          setQtyGood(step.qtyIn || 0);
                          setQtyDefect(0);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 shadow transition"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Hoàn thành (Complete)</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Completion Modal */}
      {completeModalData && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Nghiệm Thu Công Đoạn: {completeModalData.stepName}
            </h3>
            <p className="text-xs text-slate-500">
              Nhập số lượng đạt và lỗi để kiểm tra bảo toàn số lượng (BR-08: Số vào = Số đạt + Số lỗi).
            </p>

            <form onSubmit={handleCompleteStep} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Số lượng Đạt (Good Qty)</label>
                  <input
                    type="number"
                    min="0"
                    value={qtyGood}
                    onChange={(e) => setQtyGood(Number(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-bold text-emerald-700"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Số lượng Lỗi (Defect Qty)</label>
                  <input
                    type="number"
                    min="0"
                    value={qtyDefect}
                    onChange={(e) => setQtyDefect(Number(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-bold text-rose-700"
                    required
                  />
                </div>
              </div>

              {completeModalData.requiresEvidence && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-2">
                  <div className="font-bold text-purple-900">Bắt buộc minh chứng (BR-15)</div>
                  <input
                    type="text"
                    placeholder="Đường dẫn ảnh/phiếu nghiệm thu (VD: /uploads/evidence/step-done.jpg)"
                    value={evidenceUrl}
                    onChange={(e) => setEvidenceUrl(e.target.value)}
                    className="w-full bg-white border border-purple-300 rounded p-1.5"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Ghi chú minh chứng..."
                    value={evidenceNote}
                    onChange={(e) => setEvidenceNote(e.target.value)}
                    className="w-full bg-white border border-purple-300 rounded p-1.5"
                  />
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setCompleteModalData(null)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg font-semibold text-slate-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow"
                >
                  Xác Nhận Hoàn Thành
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
