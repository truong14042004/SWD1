'use client';

import React from 'react';
import { Package, Layers, ShieldCheck } from 'lucide-react';

interface InventoryTabProps {
  catalog: any;
}

export const InventoryTab: React.FC<InventoryTabProps> = ({ catalog }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Quản Lý Kho Vải Denim & Phụ Liệu May</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Theo dõi tồn kho theo từng cuộn vải, số mét còn trong kho và tỷ lệ co rút sau thử nghiệm.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 font-bold text-slate-800 text-sm">
          Danh Sách Cuộn Vải Denim Tại Kho
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Mã Cuộn / Số Lô Vải</th>
                <th className="py-3 px-4">Loại Vải</th>
                <th className="py-3 px-4">Màu Sắc</th>
                <th className="py-3 px-4">Mét Khả Dụng</th>
                <th className="py-3 px-4">Độ Co Rút (%)</th>
                <th className="py-3 px-4">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {catalog?.fabricLots?.map((lot: any) => {
                const fabric = catalog.fabrics?.find((f: any) => f.id === lot.fabricTypeId);
                const color = catalog.colors?.find((c: any) => c.id === lot.colorId);

                return (
                  <tr key={lot.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{lot.lotNo}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{fabric?.code}</div>
                      <div className="text-xs text-slate-500">{fabric?.weightOz}oz - {fabric?.stretchType}</div>
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold text-slate-700">{color?.name}</td>
                    <td className="py-3 px-4 font-bold text-emerald-700">{lot.availableMeters.toLocaleString()} m</td>
                    <td className="py-3 px-4 text-xs text-slate-600 font-medium">{lot.shrinkagePercent}%</td>
                    <td className="py-3 px-4">
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                        Sẵn sàng cấp phát
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
