'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useGSAP } from '@gsap/react';
import { animateFadeIn } from '@/lib/animations';
import { Header } from '@/components/Header';
import { Sidebar, MainViewType } from '@/components/Sidebar';
import { AuthPortal } from '@/components/auth/AuthPortal';

// Dedicated Role Workspaces
import { AdminView } from '@/components/roles/AdminView';
import { ProcessEngineerView } from '@/components/roles/ProcessEngineerView';
import { ProductionPlannerView } from '@/components/roles/ProductionPlannerView';
import { WarehouseKeeperView } from '@/components/roles/WarehouseKeeperView';
import { StationOperatorView } from '@/components/roles/StationOperatorView';
import { QCInspectorView } from '@/components/roles/QCInspectorView';
import { ManagerView } from '@/components/roles/ManagerView';

// Standard Tabs
import { OrdersTab } from '@/components/tabs/OrdersTab';
import { WorkflowTab } from '@/components/tabs/WorkflowTab';
import { WorklistTab } from '@/components/tabs/WorklistTab';
import { QcTab } from '@/components/tabs/QcTab';
import { InventoryTab } from '@/components/tabs/InventoryTab';
import { AuditTab } from '@/components/tabs/AuditTab';

function AppContent() {
  const { currentUser, isAuthenticated, isReady } = useAuth();
  const [activeView, setActiveView] = useState<MainViewType>('role-workspace');
  const [orders, setOrders] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<any>(null);
  const [workflowData, setWorkflowData] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const mainContentRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    try {
      const [ordersRes, catalogRes, wfRes, auditRes] = await Promise.all([
        fetch('/api/orders').then((r) => r.json()),
        fetch('/api/catalog').then((r) => r.json()),
        fetch('/api/workflow').then((r) => r.json()),
        fetch('/api/audit').then((r) => r.json()),
      ]);

      if (ordersRes?.success) setOrders(ordersRes.data || []);
      if (catalogRes?.success) setCatalog(catalogRes.data);
      if (wfRes?.success) setWorkflowData(wfRes.data);
      if (auditRes?.success) setAuditLogs(auditRes.data || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  // GSAP animation when switching views or roles
  useGSAP(
    () => {
      if (mainContentRef.current) {
        animateFadeIn(mainContentRef.current);
      }
    },
    { scope: mainContentRef, dependencies: [activeView, currentUser?.role] }
  );

  // Still checking localStorage
  if (!isReady) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-slate-500 font-semibold text-sm">
          <span className="w-5 h-5 border-2 border-denim-600 border-t-transparent rounded-full animate-spin"></span>
          <span>Khởi tạo hệ thống DenimFlow...</span>
        </div>
      </div>
    );
  }

  // Not authenticated -> Display Auth Portal with 7 role account cards & login/register
  if (!isAuthenticated || !currentUser) {
    return <AuthPortal />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Header />

      <div className="flex flex-1">
        <Sidebar
          activeView={activeView}
          onViewChange={setActiveView}
          orderCount={orders.length}
        />

        <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-slate-400 text-xs font-semibold">
              <span className="w-4 h-4 border-2 border-denim-600 border-t-transparent rounded-full animate-spin mr-2"></span>
              Đang tải dữ liệu DenimFlow BO...
            </div>
          ) : (
            <div ref={mainContentRef}>
              {/* PRIMARY ROLE WORKSPACE */}
              {activeView === 'role-workspace' && (
                <>
                  {currentUser?.role === 'ADMIN' && (
                    <AdminView catalog={catalog} auditLogs={auditLogs} onRefresh={fetchData} />
                  )}
                  {currentUser?.role === 'PROCESS_ENGINEER' && (
                    <ProcessEngineerView
                      workflowData={workflowData}
                      catalog={catalog}
                      onRefresh={fetchData}
                    />
                  )}
                  {currentUser?.role === 'PRODUCTION_PLANNER' && (
                    <ProductionPlannerView
                      orders={orders}
                      catalog={catalog}
                      onRefresh={fetchData}
                    />
                  )}
                  {currentUser?.role === 'WAREHOUSE_KEEPER' && (
                    <WarehouseKeeperView
                      catalog={catalog}
                      orders={orders}
                      onRefresh={fetchData}
                    />
                  )}
                  {currentUser?.role === 'STATION_OPERATOR' && (
                    <StationOperatorView orders={orders} onRefresh={fetchData} />
                  )}
                  {currentUser?.role === 'QC_INSPECTOR' && (
                    <QCInspectorView
                      orders={orders}
                      catalog={catalog}
                      onRefresh={fetchData}
                    />
                  )}
                  {currentUser?.role === 'MANAGER' && <ManagerView orders={orders} />}
                </>
              )}

              {/* GLOBAL SUB-VIEWS */}
              {activeView === 'orders' && (
                <OrdersTab
                  orders={orders}
                  catalog={catalog}
                  currentRole={currentUser?.role || 'PRODUCTION_PLANNER'}
                  onRefresh={fetchData}
                />
              )}
              {activeView === 'workflow' && <WorkflowTab workflowData={workflowData} />}
              {activeView === 'worklist' && (
                <WorklistTab
                  orders={orders}
                  currentRole={currentUser?.role || 'STATION_OPERATOR'}
                  onRefresh={fetchData}
                />
              )}
              {activeView === 'qc' && (
                <QcTab
                  orders={orders}
                  catalog={catalog}
                  currentRole={currentUser?.role || 'QC_INSPECTOR'}
                  onRefresh={fetchData}
                />
              )}
              {activeView === 'inventory' && <InventoryTab catalog={catalog} />}
              {activeView === 'audit' && <AuditTab auditLogs={auditLogs} />}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
