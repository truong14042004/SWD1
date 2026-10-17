'use client';

import React, { useState } from 'react';
import { AuditLog } from '@/types';
import { Search, ShieldAlert, Clock } from 'lucide-react';

interface AuditTabProps {
  auditLogs: AuditLog[];
}

export const AuditTab: React.FC<AuditTabProps> = ({ auditLogs }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = auditLogs.filter(
    (log) =>
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actorId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Sổ Nhật Ký Hoạt Động Xưởng May</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Lưu vết toàn bộ hoạt động duyệt đơn, may gia công, xuất vải và kiểm tra chất lượng. Dữ liệu được bảo toàn minh bạch.
          </p>
        </div>

        <div className="relative w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo mã đơn, hành động, nhân sự..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-denim-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Thời Điểm</th>
                <th className="py-3 px-4">Đối Tượng</th>
                <th className="py-3 px-4">Mã Hồ Sơ / Đơn Hàng</th>
                <th className="py-3 px-4">Hoạt Động Thực Hiện</th>
                <th className="py-3 px-4">Giá Trị Cũ</th>
                <th className="py-3 px-4">Giá Trị Mới</th>
                <th className="py-3 px-4">Người Thực Hiện</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 text-slate-500 font-sans">
                    {new Date(log.createdAt).toLocaleString('vi-VN')}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold font-sans">
                      {log.entityType}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800">{log.entityId}</td>
                  <td className="py-3 px-4 font-bold text-denim-700">{log.action}</td>
                  <td className="py-3 px-4 text-slate-400 max-w-xs truncate">{log.oldValue || '—'}</td>
                  <td className="py-3 px-4 text-slate-700 max-w-xs truncate font-sans">{log.newValue || '—'}</td>
                  <td className="py-3 px-4 text-slate-600 font-sans font-medium">{log.actorId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
