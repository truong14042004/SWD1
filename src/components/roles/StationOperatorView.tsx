'use client';

import React, { useState, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { animateStaggerCards } from '@/lib/animations';
import { ProductionOrder, StationType } from '@/types';
import { Scissors, Play, Check, AlertCircle, FileUp, CheckCircle, ShieldAlert, Lock, Unlock } from 'lucide-react';
import { FileUpload } from '@/components/ui/FileUpload';

interface StationOperatorViewProps {
  orders: ProductionOrder[];
  onRefresh: () => void;
  initialStation?: StationType;
}

const STATIONS: { type: StationType; label: string; desc: string }[] = [
  { type: 'CUTTING', label: 'Tổ Trải & Cắt', desc: 'Trải vải, cắt rập, chia bundle bán thành phẩm' },
  { type: 'SEWING', label: 'Chuyền May', desc: 'May túi, ráp thân, ráp đáy, gắn lưng' },
  { type: 'EMBROIDERY', label: 'Thêu / In', desc: 'Thêu logo hoặc in chi tiết theo yêu cầu' },
  { type: 'DYEING', label: 'Xưởng Nhuộm', desc: 'Nhuộm thành phẩm tổng thể hoặc cục bộ' },
  { type: 'WASH', label: 'Xưởng Wash & Giặt', desc: 'Wash mài hiệu ứng và giặt sạch ổn định co rút' },
  { type: 'FINISHING', label: 'Tổ Hoàn Thiện', desc: 'Cắt chỉ, ủi hoàn thiện, gắn nhãn mác & nút' },
  { type: 'PACKING', label: 'Đóng Gói & Xuất', desc: 'Đóng thùng, lập packing list & biên bản giao' },
];

export const StationOperatorView: React.FC<StationOperatorViewProps> = ({
  orders,
  onRefresh,
  initialStation,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStation, setActiveStation] = useState<StationType>(initialStation || 'CUTTING');

  React.useEffect(() => {
    if (initialStation) setActiveStation(initialStation);
  }, [initialStation]);

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

  useGSAP(
    () => {
      animateStaggerCards(containerRef.current, '.op-card');
    },
    { scope: containerRef, dependencies: [activeStation, orders] }
  );

  // Extract all step tasks matching active station across all orders
  const tasks: { order: ProductionOrder; step: any }[] = [];
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
      setSuccessMessage('Bắt đầu công đoạn thành công! Trạng thái chuyển sang IN_PROGRESS.');
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

      setSuccessMessage('Hoàn thành công đoạn! Số lượng hợp lệ (BR-08) và đã mở công đoạn kế tiếp.');
      setCompleteModalData(null);
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi');
    }
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-denim-800 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 text-white px-2.5 py-1 rounded-full">
              Station Operator Workspace
            </span>
            <span className="text-xs text-amber-100">• Tổ trưởng các trạm sản xuất trực tiếp</span>
          </div>
          <h2 className="text-2xl font-bold mt-2">Bàn Làm Việc Trạm Gia Công (Shopfloor Terminal)</h2>
          <p className="text-sm text-amber-100 mt-1 max-w-xl">
            Nhận lệnh sản xuất, kích hoạt Gatekeeper Chain (BR-14), nhập sản lượng đạt/lỗi theo bundle (BR-08) và tải minh chứng (BR-15).
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

      {/* Station Selector Bar */}
      <div className="flex flex-wrap gap-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        {STATIONS.map((st) => (
          <button
            key={st.type}
            onClick={() => setActiveStation(st.type)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              activeStation === st.type
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>{st.label}</span>
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasks.length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 text-xs">
            Hiện không có nhiệm vụ nào đang chờ tại trạm {activeStation}.
          </div>
        ) : (
          tasks.map(({ order, step }) => {
            const isReady = step.status === 'READY';
            const isInProgress = step.status === 'IN_PROGRESS';
            const isDone = step.status === 'DONE';
            const isRework = step.status === 'REWORK';

            return (
              <div
                key={`${order.id}-${step.stepCode}`}
                className="op-card bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-base">{order.orderNumber}</span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      isDone
                        ? 'bg-emerald-100 text-emerald-800'
                        : isInProgress
                        ? 'bg-amber-100 text-amber-800'
                        : isReady
                        ? 'bg-blue-100 text-blue-800'
                        : isRework
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {step.status}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{step.name}</h4>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Số lượng giao vào trạm: <strong>{step.qtyIn || 0} chiếc</strong>
                  </div>
                </div>

                {step.requiresEvidence && (
                  <div className="p-2 bg-purple-50 border border-purple-200 rounded-lg text-[11px] text-purple-800 font-medium flex items-center space-x-1">
                    <FileUp className="w-3.5 h-3.5" />
                    <span>BR-15: Bắt buộc đính kèm tối thiểu 01 tệp minh chứng khi hoàn thành</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="text-[11px] text-slate-500">
                    {isReady && <span className="text-blue-700 font-bold flex items-center space-x-1"><Unlock className="w-3 h-3" /><span>Gatekeeper Đạt: Sẵn sàng làm</span></span>}
                    {isInProgress && <span className="text-amber-700 font-bold">Đang thao tác tại trạm</span>}
                    {isDone && <span className="text-emerald-700 font-bold flex items-center space-x-1"><CheckCircle className="w-3.5 h-3.5" /><span>Đạt {step.qtyGood} cái</span></span>}
                    {step.status === 'PENDING' && <span className="text-slate-400 flex items-center space-x-1"><Lock className="w-3 h-3" /><span>Đang chờ trạm trước</span></span>}
                  </div>

                  <div className="space-x-2">
                    {isReady && (
                      <button
                        onClick={() => handleStartStep(order.id, step.stepCode)}
                        className="bg-denim-600 hover:bg-denim-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow transition flex items-center space-x-1"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Bắt Đầu (Start)</span>
                      </button>
                    )}

                    {isInProgress && (
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
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow transition flex items-center space-x-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Hoàn Thành (BR-08)</span>
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
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="text-base font-extrabold text-slate-900">
              Nghiệm Thu: {completeModalData.stepName}
            </h3>
            <p className="text-slate-500">
              BR-08 Bảo toàn số lượng: $Số\_vào ({completeModalData.qtyIn}) = Số\_đạt + Số\_lỗi$.
            </p>

            <form onSubmit={handleCompleteStep} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số Đạt (Good)</label>
                  <input
                    type="number"
                    min="0"
                    value={qtyGood}
                    onChange={(e) => setQtyGood(Number(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded-xl p-2 font-bold text-emerald-700 bg-slate-50"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số Lỗi (Defect)</label>
                  <input
                    type="number"
                    min="0"
                    value={qtyDefect}
                    onChange={(e) => setQtyDefect(Number(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded-xl p-2 font-bold text-rose-700 bg-slate-50"
                    required
                  />
                </div>
              </div>

              {completeModalData.requiresEvidence && (
                <div className="p-3 bg-purple-50/80 border border-purple-200 rounded-2xl space-y-2">
                  <FileUpload
                    label="BR-15: Minh Chứng Hình Ảnh / Phiếu Nghiệm Thu"
                    helperText="Chọn ảnh chụp thực tế hoặc phiếu nghiệm thu từ thiết bị"
                    accept=".png,.jpg,.jpeg,.pdf,.webp"
                    uploadFolder="evidences"
                    value={evidenceUrl}
                    onChange={(url) => setEvidenceUrl(url)}
                    sampleTemplateUrl="/docs/waiver-raw-denim-signed.pdf"
                    sampleTemplateName="Anh_Chup_Nghiem_Thu_Cong_Doan.jpg"
                    required
                  />

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Ghi chú công đoạn</label>
                    <input
                      type="text"
                      placeholder="Ghi chú thêm về thông số, tình trạng máy..."
                      value={evidenceNote}
                      onChange={(e) => setEvidenceNote(e.target.value)}
                      className="w-full bg-white border border-purple-300 rounded-xl p-2 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCompleteModalData(null)}
                  className="px-3 py-1.5 border border-slate-300 rounded-xl font-bold text-slate-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow"
                >
                  Xác Nhận & Mở Step Kế Tiếp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
