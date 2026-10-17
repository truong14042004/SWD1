'use client';

import React, { useState } from 'react';
import { WorkflowVersion, StepDefinition } from '@/types';
import { GitBranch, Shield, ArrowDown, FileText, CheckCircle2, RotateCcw } from 'lucide-react';

interface WorkflowTabProps {
  workflowData: any;
}

export const WorkflowTab: React.FC<WorkflowTabProps> = ({ workflowData }) => {
  const version: WorkflowVersion = workflowData?.versions?.[0];
  const [selectedStep, setSelectedStep] = useState<StepDefinition | null>(null);

  if (!version) {
    return <div className="p-8 text-center text-slate-500">Đang tải cấu trúc Dynamic Workflow...</div>;
  }

  const stepTypeBadges: Record<string, string> = {
    APPROVAL: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    SELECTION: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    MATERIAL: 'bg-amber-100 text-amber-800 border-amber-200',
    QC: 'bg-rose-100 text-rose-800 border-rose-200',
    PRODUCTION: 'bg-blue-100 text-blue-800 border-blue-200',
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900">Dynamic Workflow Engine — Sơ Đồ Quy Trình May Jean</h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Version {version.versionNo} (PUBLISHED - BR-02)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Chuỗi 14 công đoạn và các nhánh rẽ điều kiện (Nhuộm, Wash, Thêu, Giặt Sạch, Custom Review). Mọi chuyển tiếp được kiểm soát bởi Gatekeeper (BR-14).
          </p>
        </div>
      </div>

      {/* Visual Workflow Steps Flow */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {version.steps.map((step, index) => {
          const badgeClass = stepTypeBadges[step.stepType] || 'bg-slate-100 text-slate-800';
          const isSelected = selectedStep?.code === step.code;

          return (
            <div
              key={step.id}
              onClick={() => setSelectedStep(step)}
              className={`p-4 rounded-xl border transition-all cursor-pointer bg-white shadow-sm hover:shadow-md ${
                isSelected ? 'ring-2 ring-denim-600 border-denim-600' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold font-mono text-slate-400">
                  #{step.sequenceOrder} {step.code}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${badgeClass}`}>
                  {step.stepType}
                </span>
              </div>

              <h4 className="font-bold text-slate-800 text-sm mb-1">{step.name}</h4>
              <div className="text-xs text-slate-500 mb-2">Trạm: <strong>{step.stationType}</strong></div>

              <div className="flex flex-wrap gap-1 text-[11px]">
                {step.isMandatory ? (
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">Bắt buộc</span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-medium">Tùy chọn/Điều kiện</span>
                )}

                {step.requiresEvidence && (
                  <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-medium flex items-center space-x-1">
                    <FileText className="w-3 h-3" />
                    <span>Cần minh chứng (BR-15)</span>
                  </span>
                )}

                {step.conditionExpr && (
                  <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono font-medium">
                    Guard: {step.conditionExpr}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Step Detail Panel */}
      {selectedStep && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-base">
              Chi Tiết Công Đoạn: {selectedStep.name} ({selectedStep.code})
            </h3>
            <button
              onClick={() => setSelectedStep(null)}
              className="text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              Đóng
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <div className="text-slate-400 font-semibold uppercase">Loại Step & Trạm</div>
              <div className="text-sm font-bold text-slate-800 mt-1">{selectedStep.stepType}</div>
              <div className="text-slate-600 mt-0.5">Trạm: {selectedStep.stationType}</div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <div className="text-slate-400 font-semibold uppercase">Quy Tắc Gatekeeper (BR-14)</div>
              <div className="text-slate-700 mt-1">
                {selectedStep.requiresEvidence ? '✓ Bắt buộc tối thiểu 01 tệp minh chứng' : '• Không yêu cầu minh chứng'}
              </div>
              <div className="text-slate-700">
                • Tiền nhiệm phải hoàn thành (DONE hoặc SKIPPED)
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <div className="text-slate-400 font-semibold uppercase">Giới Hạn Rework (BR-10)</div>
              <div className="text-sm font-bold text-slate-800 mt-1">
                {selectedStep.maxRework > 0 ? `Tối đa ${selectedStep.maxRework} vòng rework` : 'Không áp dụng'}
              </div>
              <div className="text-slate-500 mt-0.5">Vượt quá sẽ chuyển Planner xử lý</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
