'use client';

import React, { useState, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { animateStaggerCards } from '@/lib/animations';
import { User, FabricType, ColorOption, FabricColorRule } from '@/types';
import { Shield, Users, Grid, FileText, Check, X, Plus, AlertCircle, CheckCircle } from 'lucide-react';

interface AdminViewProps {
  catalog: any;
  auditLogs: any[];
  onRefresh: () => void;
  initialSubTab?: 'matrix' | 'users' | 'audit';
}

export const AdminView: React.FC<AdminViewProps> = ({
  catalog,
  auditLogs,
  onRefresh,
  initialSubTab,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSubTab, setActiveSubTab] = useState<'matrix' | 'users' | 'audit'>(initialSubTab || 'matrix');

  React.useEffect(() => {
    if (initialSubTab) setActiveSubTab(initialSubTab);
  }, [initialSubTab]);
  const [matrixRules, setMatrixRules] = useState<FabricColorRule[]>(catalog?.fabricColorRules || []);
  const [savingRuleId, setSavingRuleId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  useGSAP(
    () => {
      animateStaggerCards(containerRef.current, '.admin-card');
    },
    { scope: containerRef, dependencies: [activeSubTab] }
  );

  const toggleMatrixRule = (fabricTypeId: string, colorId: string) => {
    const existingRule = matrixRules.find(
      (r) => r.fabricTypeId === fabricTypeId && r.colorId === colorId
    );

    let updatedRules: FabricColorRule[];
    if (existingRule) {
      updatedRules = matrixRules.map((r) =>
        r.id === existingRule.id ? { ...r, isAllowed: !r.isAllowed } : r
      );
    } else {
      updatedRules = [
        ...matrixRules,
        {
          id: `fcr-${Date.now()}`,
          fabricTypeId,
          colorId,
          isAllowed: true,
        },
      ];
    }

    setMatrixRules(updatedRules);
    // Persist in catalog locally
    if (catalog) {
      catalog.fabricColorRules = updatedRules;
    }
    setNotification('Cập nhật quy tắc vải và màu nhuộm thành công! Các đơn hàng tiếp theo sẽ áp dụng theo quy tắc này.');
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-denim-800 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 text-white px-2.5 py-1 rounded-full">
              Khu Vực Quản Trị Nhà Máy
            </span>
            <span className="text-xs text-blue-200">• Toàn quyền Quản trị & Danh mục</span>
          </div>
          <h2 className="text-2xl font-bold mt-2">Quản Trị Vận Hành Xưởng May DenimFlow</h2>
          <p className="text-sm text-blue-100 mt-1 max-w-xl">
            Cấu hình quy tắc kết hợp vải và màu nhuộm, phân quyền nhân sự các bộ phận và tra cứu nhật ký sản xuất.
          </p>
        </div>

        {/* Subtabs */}
        <div className="flex bg-white/10 p-1 rounded-xl backdrop-blur-sm border border-white/20">
          <button
            onClick={() => setActiveSubTab('matrix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'matrix' ? 'bg-white text-indigo-900 shadow' : 'text-white hover:bg-white/10'
            }`}
          >
            Quy Tắc Phối Vải & Màu
          </button>
          <button
            onClick={() => setActiveSubTab('users')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'users' ? 'bg-white text-indigo-900 shadow' : 'text-white hover:bg-white/10'
            }`}
          >
            Nhân Sự & Bộ Phận
          </button>
          <button
            onClick={() => setActiveSubTab('audit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'audit' ? 'bg-white text-indigo-900 shadow' : 'text-white hover:bg-white/10'
            }`}
          >
            Sổ Nhật Ký Xưởng May
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center space-x-2 text-xs font-semibold shadow-sm">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* SUBTAB 1: Fabric-Color Matrix */}
      {activeSubTab === 'matrix' && (
        <div className="admin-card bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Grid className="w-5 h-5 text-indigo-600" />
                <span>Bảng Quy Tắc Phối Vải & Màu Nhuộm</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Quy tắc xuất xưởng: Ngăn chặn tuyệt đối việc chọn sai loại vải và màu nhuộm không tương thích gây loang màu hoặc hỏng vải.
              </p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center space-x-1 text-emerald-700 font-semibold">
                <span className="w-3 h-3 bg-emerald-500 rounded-sm inline-block"></span>
                <span>Cho phép may</span>
              </span>
              <span className="flex items-center space-x-1 text-slate-400 font-semibold">
                <span className="w-3 h-3 bg-slate-200 rounded-sm inline-block"></span>
                <span>Không tương thích</span>
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700">
                  <th className="p-3 text-left font-bold border border-slate-200">Loại Vải Denim (FabricType)</th>
                  {catalog?.colors?.map((color: ColorOption) => (
                    <th key={color.id} className="p-3 font-bold border border-slate-200">
                      <div>{color.name}</div>
                      <span className="text-[10px] text-slate-400 font-normal">({color.code})</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {catalog?.fabrics?.map((fabric: FabricType) => (
                  <tr key={fabric.id} className="hover:bg-slate-50/50">
                    <td className="p-3 text-left font-semibold text-slate-800 border border-slate-200 bg-slate-50/30">
                      <div className="font-bold text-slate-900">{fabric.code}</div>
                      <div className="text-[11px] text-slate-500">{fabric.weightOz}oz • {fabric.stretchType} • {fabric.composition}</div>
                    </td>
                    {catalog?.colors?.map((color: ColorOption) => {
                      const rule = matrixRules.find(
                        (r) => r.fabricTypeId === fabric.id && r.colorId === color.id
                      );
                      const isAllowed = rule ? rule.isAllowed : true;

                      return (
                        <td key={color.id} className="p-3 border border-slate-200">
                          <button
                            onClick={() => toggleMatrixRule(fabric.id, color.id)}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center mx-auto font-bold transition-all ${
                              isAllowed
                                ? 'bg-emerald-500 text-white shadow-sm hover:bg-emerald-600 scale-100'
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            }`}
                            title={isAllowed ? 'Bấm để cấm cặp vải-màu này' : 'Bấm để cho phép cặp vải-màu này'}
                          >
                            {isAllowed ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 2: Users List */}
      {activeSubTab === 'users' && (
        <div className="admin-card bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <span>Danh Sách Nhân Sự & Vị Trí Đảm Nhiệm Trong Xưởng</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Mỗi vị trí có thẩm quyền riêng biệt, thợ may và KCS độc lập nhằm đảm bảo chất lượng khách quan.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {catalog?.users?.map((u: User) => (
              <div
                key={u.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 text-sm">{u.fullName}</div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {u.role}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono">{u.email}</div>
                {u.stationId && (
                  <div className="text-xs text-slate-600">
                    Trạm phụ trách: <strong>{u.stationId}</strong>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: Full Audit Log */}
      {activeSubTab === 'audit' && (
        <div className="admin-card bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <span>Sổ Nhật Ký Hoạt Động & Lịch Sử Đơn Hàng Toàn Xưởng</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Mọi hoạt động duyệt đơn, xuất vải, nghiệm thu số lượng và kiểm định chất lượng đều được lưu trữ minh bạch, chính xác.
            </p>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse font-mono">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Thời Điểm</th>
                  <th className="p-3">Đối Tượng</th>
                  <th className="p-3">Hành Động</th>
                  <th className="p-3">Giá Trị Cũ</th>
                  <th className="p-3">Giá Trị Mới</th>
                  <th className="p-3">Nhân Sự</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs?.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="p-3 text-slate-500 font-sans">{new Date(log.createdAt).toLocaleString('vi-VN')}</td>
                    <td className="p-3 font-bold text-slate-800 font-sans">{log.entityType}: {log.entityId}</td>
                    <td className="p-3 font-bold text-indigo-700">{log.action}</td>
                    <td className="p-3 text-slate-400 truncate max-w-xs">{log.oldValue || '—'}</td>
                    <td className="p-3 text-slate-700 truncate max-w-xs">{log.newValue || '—'}</td>
                    <td className="p-3 font-medium text-slate-800 font-sans">{log.actorId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
