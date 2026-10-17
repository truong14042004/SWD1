'use client';

import React, { useState, useEffect } from 'react';
import { UserRole, ProductionOrder } from '@/types';
import { Header } from '@/components/Header';
import { Sidebar, TabType } from '@/components/Sidebar';
import { DashboardTab } from '@/components/tabs/DashboardTab';
import { OrdersTab } from '@/components/tabs/OrdersTab';
import { WorkflowTab } from '@/components/tabs/WorkflowTab';
import { WorklistTab } from '@/components/tabs/WorklistTab';
import { QcTab } from '@/components/tabs/QcTab';
import { InventoryTab } from '@/components/tabs/InventoryTab';
import { AuditTab } from '@/components/tabs/AuditTab';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>('PRODUCTION_PLANNER');

  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [catalog, setCatalog] = useState<any>(null);
  const [workflowData, setWorkflowData] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [ordersRes, catalogRes, wfRes, auditRes] = await Promise.all([
        fetch('/api/orders').then((r) => r.json()),
        fetch('/api/catalog').then((r) => r.json()),
        fetch('/api/workflow').then((r) => r.json()),
        fetch('/api/audit').then((r) => r.json()),
      ]);

      if (ordersRes.success) setOrders(ordersRes.data);
      if (catalogRes.success) setCatalog(catalogRes.data);
      if (wfRes.success) setWorkflowData(wfRes.data);
      if (auditRes.success) setAuditLogs(auditRes.data);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute ready tasks for sidebar badge
  const readyTaskCount = orders.reduce((sum, order: any) => {
    const readySteps = order.workflowInstance?.stepInstances?.filter(
      (s: any) => s.status === 'READY' || s.status === 'IN_PROGRESS'
    ) || [];
    return sum + readySteps.length;
  }, 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header currentRole={currentRole} onRoleChange={setCurrentRole} />

      <div className="flex flex-1">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          orderCount={orders.length}
          readyTaskCount={readyTaskCount}
        />

        <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
              Đang tải dữ liệu DenimFlow BO...
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardTab orders={orders} onSelectTab={setActiveTab} />
              )}
              {activeTab === 'orders' && (
                <OrdersTab
                  orders={orders}
                  catalog={catalog}
                  currentRole={currentRole}
                  onRefresh={fetchData}
                />
              )}
              {activeTab === 'workflow' && <WorkflowTab workflowData={workflowData} />}
              {activeTab === 'worklist' && (
                <WorklistTab
                  orders={orders}
                  currentRole={currentRole}
                  onRefresh={fetchData}
                />
              )}
              {activeTab === 'qc' && (
                <QcTab
                  orders={orders}
                  catalog={catalog}
                  currentRole={currentRole}
                  onRefresh={fetchData}
                />
              )}
              {activeTab === 'inventory' && <InventoryTab catalog={catalog} />}
              {activeTab === 'audit' && <AuditTab auditLogs={auditLogs} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
