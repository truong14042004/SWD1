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
  const [activeView, setActiveView] = useState<MainViewType>('planner-pipeline');
  const [orders, setOrders] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<any>(null);
  const [workflowData, setWorkflowData] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const mainContentRef = useRef<HTMLDivElement>(null);

  // Set default view on login/role change
  useEffect(() => {
    if (currentUser) {
      switch (currentUser.role) {
        case 'ADMIN':
          setActiveView('admin-matrix');
          break;
        case 'PROCESS_ENGINEER':
          setActiveView('pe-designer');
          break;
        case 'PRODUCTION_PLANNER':
          setActiveView('planner-pipeline');
          break;
        case 'WAREHOUSE_KEEPER':
          setActiveView('warehouse-allocation');
          break;
        case 'STATION_OPERATOR':
          setActiveView('operator-terminal');
          break;
        case 'QC_INSPECTOR':
          setActiveView('qc-dashboard');
          break;
        case 'MANAGER':
          setActiveView('manager-wip');
          break;
        default:
          setActiveView('orders');
      }
    }
  }, [currentUser?.role]);

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

  const role = currentUser.role;

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
              Đang tải dữ liệu DenimFlow...
            </div>
          ) : (
            <div ref={mainContentRef}>
              {/* ADMIN ROLE FUNCTIONAL SCREENS */}
              {role === 'ADMIN' && (
                <>
                  {(activeView === 'admin-matrix' || activeView === 'role-workspace') && (
                    <AdminView
                      catalog={catalog}
                      auditLogs={auditLogs}
                      onRefresh={fetchData}
                      initialSubTab="matrix"
                    />
                  )}
                  {activeView === 'admin-users' && (
                    <AdminView
                      catalog={catalog}
                      auditLogs={auditLogs}
                      onRefresh={fetchData}
                      initialSubTab="users"
                    />
                  )}
                  {activeView === 'audit' && (
                    <AuditTab auditLogs={auditLogs} />
                  )}
                </>
              )}

              {/* PROCESS ENGINEER FUNCTIONAL SCREENS */}
              {role === 'PROCESS_ENGINEER' && (
                <>
                  {(activeView === 'pe-designer' || activeView === 'role-workspace') && (
                    <ProcessEngineerView
                      workflowData={workflowData}
                      catalog={catalog}
                      onRefresh={fetchData}
                      initialTab="designer"
                    />
                  )}
                  {activeView === 'pe-qc-profiles' && (
                    <ProcessEngineerView
                      workflowData={workflowData}
                      catalog={catalog}
                      onRefresh={fetchData}
                      initialTab="qcProfiles"
                    />
                  )}
                  {activeView === 'pe-custom-review' && (
                    <ProcessEngineerView
                      workflowData={workflowData}
                      catalog={catalog}
                      onRefresh={fetchData}
                      initialTab="customReview"
                    />
                  )}
                </>
              )}

              {/* PRODUCTION PLANNER FUNCTIONAL SCREENS */}
              {role === 'PRODUCTION_PLANNER' && (
                <>
                  {(activeView === 'planner-pipeline' || activeView === 'role-workspace') && (
                    <ProductionPlannerView
                      orders={orders}
                      catalog={catalog}
                      onRefresh={fetchData}
                      initialAction="pipeline"
                    />
                  )}
                  {activeView === 'planner-create' && (
                    <ProductionPlannerView
                      orders={orders}
                      catalog={catalog}
                      onRefresh={fetchData}
                      initialAction="create"
                    />
                  )}
                  {activeView === 'planner-bom' && (
                    <ProductionPlannerView
                      orders={orders}
                      catalog={catalog}
                      onRefresh={fetchData}
                      initialAction="bom"
                    />
                  )}
                </>
              )}

              {/* WAREHOUSE KEEPER FUNCTIONAL SCREENS */}
              {role === 'WAREHOUSE_KEEPER' && (
                <>
                  {(activeView === 'warehouse-allocation' || activeView === 'role-workspace') && (
                    <WarehouseKeeperView
                      catalog={catalog}
                      orders={orders}
                      onRefresh={fetchData}
                    />
                  )}
                  {activeView === 'inventory' && (
                    <InventoryTab catalog={catalog} />
                  )}
                </>
              )}

              {/* STATION OPERATOR FUNCTIONAL SCREENS */}
              {role === 'STATION_OPERATOR' && (
                <>
                  {(activeView === 'operator-terminal' || activeView === 'role-workspace') && (
                    <StationOperatorView orders={orders} onRefresh={fetchData} />
                  )}
                  {activeView === 'worklist' && (
                    <WorklistTab
                      orders={orders}
                      currentRole={role}
                      onRefresh={fetchData}
                    />
                  )}
                  {activeView === 'operator-cutting' && (
                    <StationOperatorView orders={orders} onRefresh={fetchData} initialStation="CUTTING" />
                  )}
                  {activeView === 'operator-sewing' && (
                    <StationOperatorView orders={orders} onRefresh={fetchData} initialStation="SEWING" />
                  )}
                  {activeView === 'operator-wash' && (
                    <StationOperatorView orders={orders} onRefresh={fetchData} initialStation="WASH" />
                  )}
                  {activeView === 'operator-finishing' && (
                    <StationOperatorView orders={orders} onRefresh={fetchData} initialStation="FINISHING" />
                  )}
                </>
              )}

              {/* QC INSPECTOR FUNCTIONAL SCREENS */}
              {role === 'QC_INSPECTOR' && (
                <>
                  {(activeView === 'qc-dashboard' || activeView === 'role-workspace') && (
                    <QCInspectorView
                      orders={orders}
                      catalog={catalog}
                      onRefresh={fetchData}
                      initialResult="PASS"
                    />
                  )}
                  {activeView === 'qc' && (
                    <QcTab
                      orders={orders}
                      catalog={catalog}
                      currentRole={role}
                      onRefresh={fetchData}
                    />
                  )}
                  {activeView === 'qc-rework' && (
                    <QCInspectorView
                      orders={orders}
                      catalog={catalog}
                      onRefresh={fetchData}
                      initialResult="REWORK"
                    />
                  )}
                  {activeView === 'pe-qc-profiles' && (
                    <ProcessEngineerView
                      workflowData={workflowData}
                      catalog={catalog}
                      onRefresh={fetchData}
                      initialTab="qcProfiles"
                    />
                  )}
                </>
              )}

              {/* MANAGER FUNCTIONAL SCREENS */}
              {role === 'MANAGER' && (
                <>
                  {(activeView === 'manager-wip' ||
                    activeView === 'manager-bottleneck' ||
                    activeView === 'manager-analytics' ||
                    activeView === 'role-workspace') && (
                    <ManagerView orders={orders} />
                  )}
                  {activeView === 'audit' && (
                    <AuditTab auditLogs={auditLogs} />
                  )}
                </>
              )}

              {/* GLOBAL LOOKUPS PERMITTED BY ROLE */}
              {activeView === 'orders' && (
                <OrdersTab
                  orders={orders}
                  catalog={catalog}
                  currentRole={role}
                  onRefresh={fetchData}
                />
              )}
              {activeView === 'workflow' && (
                <WorkflowTab workflowData={workflowData} />
              )}
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
