'use client';

import React, { useState, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { animateStaggerCards } from '@/lib/animations';
import { WorkflowVersion, StepDefinition, QCProfile } from '@/types';
import { Workflow, CheckCircle, ShieldCheck, GitFork, Sliders, AlertCircle, Plus, Eye } from 'lucide-react';

interface ProcessEngineerViewProps {
  workflowData: any;
  catalog: any;
  onRefresh: () => void;
}

export const ProcessEngineerView: React.FC<ProcessEngineerViewProps> = ({
  workflowData,
  catalog,
  onRefresh,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const version: WorkflowVersion = workflowData?.versions?.[0];

  const [activeTab, setActiveTab] = useState<'designer' | 'qcProfiles' | 'customReview'>('designer');
  const [selectedStep, setSelectedStep] = useState<StepDefinition | null>(null);
  const [validationResult, setValidationResult] = useState<{ valid: boolean; message: string } | null>(null);
  const [qcProfiles, setQcProfiles] = useState<QCProfile[]>(catalog?.qcProfiles || []);
  const [notification, setNotification] = useState<string | null>(null);

  useGSAP(
    () => {
      animateStaggerCards(containerRef.current, '.pe-card');
    },
    { scope: containerRef, dependencies: [activeTab] }
  );

  // BR-01: Workflow Template Validation
  const handleValidateTemplate = () => {
    if (!version || !version.steps) return;

    // Check exactly 1 start step (ORDER_CONFIRM)
    const startStep = version.steps.find((s) => s.code === 'ORDER_CONFIRM');
    if (!startStep) {
      setValidationResult({ valid: false, message: 'BR-01 Lỗi: Thiếu công đoạn bắt đầu (ORDER_CONFIRM).' });
      return;
    }

    // Check end step
    const endStep = version.steps.find((s) => s.code === 'PACK_HANDOVER');
    if (!endStep) {
      setValidationResult({ valid: false, message: 'BR-01 Lỗi: Thiếu công đoạn kết thúc (PACK_HANDOVER).' });
      return;
    }

    // Check rework limits
    const unlimitedRework = version.steps.some((s) => s.stepType === 'QC' && s.maxRework === 0);
    if (unlimitedRework) {
      setValidationResult({ valid: false, message: 'BR-01 Lỗi: Mọi vòng rework phải có giới hạn số lần (maxRework > 0).' });
      return;
    }

    setValidationResult({
      valid: true,
      message: 'BR-01 Hợp lệ: Workflow Template thỏa mãn mọi tiêu chuẩn kiểm định! Sẵn sàng công bố version mới.',
    });
  };

  const handleUpdateQcThreshold = (profileId: string, field: 'maxShrinkagePercent' | 'maxColorFadingLevel', value: number) => {
    const updated = qcProfiles.map((qp) =>
      qp.id === profileId ? { ...qp, [field]: value } : qp
    );
    setQcProfiles(updated);
    if (catalog) catalog.qcProfiles = updated;
    setNotification('Đã cập nhật ngưỡng kiểm định QC Profile (BR-19) thành công!');
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-denim-800 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 text-white px-2.5 py-1 rounded-full">
              Process Engineer Workspace
            </span>
            <span className="text-xs text-purple-200">• Người thiết kế quy trình (Workflow Designer)</span>
          </div>
          <h2 className="text-2xl font-bold mt-2">Thiết Kế & Cấu Hình Dynamic Workflow</h2>
          <p className="text-sm text-purple-100 mt-1 max-w-xl">
            Toàn quyền thêm/bớt công đoạn, cấu hình Gatekeeper (BR-14), thẩm định đơn custom (BR-17) và thiết lập ngưỡng QC Profile (BR-19).
          </p>
        </div>

        {/* Subtabs */}
        <div className="flex bg-white/10 p-1 rounded-xl backdrop-blur-sm border border-white/20">
          <button
            onClick={() => setActiveTab('designer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'designer' ? 'bg-white text-purple-900 shadow' : 'text-white hover:bg-white/10'
            }`}
          >
            Sơ Đồ Workflow (14 Step)
          </button>
          <button
            onClick={() => setActiveTab('qcProfiles')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'qcProfiles' ? 'bg-white text-purple-900 shadow' : 'text-white hover:bg-white/10'
            }`}
          >
            QC Profiles (BR-19)
          </button>
          <button
            onClick={() => setActiveTab('customReview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'customReview' ? 'bg-white text-purple-900 shadow' : 'text-white hover:bg-white/10'
            }`}
          >
            Nhánh Custom (BR-17)
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center space-x-2 text-xs font-semibold shadow-sm">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* SUBTAB 1: WORKFLOW DESIGNER */}
      {activeTab === 'designer' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                Phiên Bản Hiện Tại: {version?.versionNo ? `v${version.versionNo}` : 'v1.0'} ({version?.status})
              </h3>
              <p className="text-xs text-slate-500">
                BR-02: Version đã PUBLISHED là bất biến. Chỉnh sửa sẽ tạo bản sao version mới.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleValidateTemplate}
                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3 py-1.5 rounded-lg text-xs transition border border-indigo-200 flex items-center space-x-1"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Chạy Kiểm Định BR-01</span>
              </button>
              <button
                onClick={() => {
                  setNotification('Đã công bố (Publish) Version mới thành công (BR-02)! Các đơn mới sẽ snapshot version này.');
                  setTimeout(() => setNotification(null), 3000);
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition shadow flex items-center space-x-1"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Publish Version Mới</span>
              </button>
            </div>
          </div>

          {validationResult && (
            <div
              className={`p-4 rounded-xl border text-xs font-semibold flex items-center space-x-2 ${
                validationResult.valid
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {validationResult.valid ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
              <span>{validationResult.message}</span>
            </div>
          )}

          {/* 14 Steps Visual Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {version?.steps?.map((step) => (
              <div
                key={step.id}
                onClick={() => setSelectedStep(step)}
                className={`pe-card p-4 rounded-xl border bg-white cursor-pointer transition shadow-sm hover:shadow-md ${
                  selectedStep?.code === step.code
                    ? 'border-purple-600 ring-2 ring-purple-600'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-slate-400">#{step.sequenceOrder} {step.code}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    {step.stepType}
                  </span>
                </div>
                <div className="font-bold text-slate-900 text-sm">{step.name}</div>
                <div className="text-xs text-slate-500 mt-1">Trạm: <strong>{step.stationType}</strong></div>

                <div className="flex flex-wrap gap-1 mt-2 text-[10px]">
                  {step.requiresEvidence && (
                    <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-semibold">Minh chứng (BR-15)</span>
                  )}
                  {step.conditionExpr && (
                    <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono">Guard: {step.conditionExpr}</span>
                  )}
                  {step.maxRework > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700">Rework max: {step.maxRework}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 2: QC PROFILES MANAGER (BR-19) */}
      {activeTab === 'qcProfiles' && (
        <div className="pe-card bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-purple-600" />
              <span>Cấu Hình Ngưỡng Kiểm Định QC Profiles (BR-19)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Mỗi Style có 2 profile: <strong>FULL_PROCESS</strong> (chạy giặt sạch, ngưỡng chuẩn ổn định) và <strong>SKIP_CLEAN_WASH</strong> (khách bỏ giặt sạch, ngưỡng nới lỏng).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {qcProfiles.map((qp) => {
              const style = catalog?.styles?.find((s: any) => s.id === qp.styleId);
              const isSkip = qp.profileType === 'SKIP_CLEAN_WASH';

              return (
                <div
                  key={qp.id}
                  className={`p-4 rounded-xl border ${
                    isSkip ? 'bg-purple-50/50 border-purple-200' : 'bg-slate-50 border-slate-200'
                  } space-y-3`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{style?.name || qp.styleId}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        isSkip ? 'bg-purple-200 text-purple-900' : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {qp.profileType}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 mb-1 font-semibold">Độ co rút tối đa (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={qp.maxShrinkagePercent}
                        onChange={(e) => handleUpdateQcThreshold(qp.id, 'maxShrinkagePercent', Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded p-1.5 font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1 font-semibold">Độ phai màu tối đa (Cấp 1-5)</label>
                      <input
                        type="number"
                        step="0.5"
                        min="1"
                        max="5"
                        value={qp.maxColorFadingLevel}
                        onChange={(e) => handleUpdateQcThreshold(qp.id, 'maxColorFadingLevel', Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded p-1.5 font-bold text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 italic">
                    {isSkip
                      ? 'Áp dụng khi khách yêu cầu bỏ giặt sạch (kèm văn bản khách ký xác nhận).'
                      : 'Áp dụng cho chu trình gia công chuẩn đầy đủ.'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 3: CUSTOM REVIEW (BR-17) */}
      {activeTab === 'customReview' && (
        <div className="pe-card bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
              <GitFork className="w-5 h-5 text-purple-600" />
              <span>Hội Đồng Thẩm Định Đơn Gia Công Custom Riêng (BR-17)</span>
            </h3>
            <p className="text-slate-500 mt-0.5">
              Đơn custom yêu cầu thay đổi công đoạn hoặc kỹ thuật đặc biệt. Process Engineer đánh giá khả thi: nếu bất khả thi thì từ chối đơn (CANCELLED), nếu khả thi thì clone workflow riêng và bắt buộc duyệt mẫu (PP_SAMPLE).
            </p>
          </div>

          <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-2">
            <div className="font-bold text-purple-900 text-sm">Quy Trình Xử Lý Đơn Custom:</div>
            <ol className="list-decimal list-inside space-y-1 text-purple-800">
              <li>Production Planner đánh dấu <code>isCustom = true</code> khi tiếp nhận đơn.</li>
              <li>Đơn đi vào bước <code>CUSTOM_REVIEW</code> ngay sau <code>ORDER_CONFIRM</code>.</li>
              <li>Process Engineer thẩm định năng lực máy móc & thiết bị xưởng.</li>
              <li>Clone template chuẩn thành workflow riêng cho đúng 01 đơn hàng này.</li>
              <li>Bắt buộc duyệt mẫu tiền sản xuất <code>PP_SAMPLE</code> trước khi cho phép Cắt vải.</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};
