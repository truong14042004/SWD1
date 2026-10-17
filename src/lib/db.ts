import {
  User,
  Station,
  Style,
  FabricType,
  ColorOption,
  FabricColorRule,
  FabricLot,
  QCProfile,
  WorkflowTemplate,
  WorkflowVersion,
  ProductionOrder,
  AuditLog,
  WorkflowInstance,
  StepInstance,
  Bundle,
  Evidence,
  QCInspection,
  CustomerAcknowledgement,
  WorkflowChangeRequest,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_STATIONS,
  INITIAL_FABRICS,
  INITIAL_COLORS,
  INITIAL_FABRIC_COLOR_RULES,
  INITIAL_FABRIC_LOTS,
  INITIAL_STYLES,
  INITIAL_QC_PROFILES,
  INITIAL_WORKFLOW_TEMPLATE,
  INITIAL_WORKFLOW_VERSION,
  INITIAL_ORDERS,
  INITIAL_AUDIT_LOGS,
} from './mockData';
import { OrderStateMachine, StepStateMachine } from '../core/patterns/state';
import { buildGatekeeperChain, GateContext } from '../core/patterns/chain';
import { StandardJeanBomStrategy, SimpleConditionEvaluatorStrategy } from '../core/patterns/strategy';
import { EventBus, AuditLogObserver } from '../core/patterns/observer';

// In-Memory Data Store (Active during development / Vercel preview when PostgreSQL DB is connecting)
class DatabaseStore {
  public users: User[] = [...INITIAL_USERS];
  public stations: Station[] = [...INITIAL_STATIONS];
  public styles: Style[] = [...INITIAL_STYLES];
  public fabrics: FabricType[] = [...INITIAL_FABRICS];
  public colors: ColorOption[] = [...INITIAL_COLORS];
  public fabricColorRules: FabricColorRule[] = [...INITIAL_FABRIC_COLOR_RULES];
  public fabricLots: FabricLot[] = [...INITIAL_FABRIC_LOTS];
  public qcProfiles: QCProfile[] = [...INITIAL_QC_PROFILES];
  public templates: WorkflowTemplate[] = [{ ...INITIAL_WORKFLOW_TEMPLATE }];
  public versions: WorkflowVersion[] = [{ ...INITIAL_WORKFLOW_VERSION }];
  public orders: ProductionOrder[] = [...INITIAL_ORDERS];
  public auditLogs: AuditLog[] = [...INITIAL_AUDIT_LOGS];
  public workflowInstances: Map<string, WorkflowInstance> = new Map();
  public bundles: Bundle[] = [];
  public changeRequests: WorkflowChangeRequest[] = [];

  private eventBus = EventBus.getInstance();
  private auditObserver: AuditLogObserver;

  constructor() {
    this.auditObserver = new AuditLogObserver((log) => {
      this.auditLogs.unshift(log);
    });

    this.eventBus.subscribe('ORDER_CREATED', this.auditObserver);
    this.eventBus.subscribe('ORDER_STATUS_CHANGED', this.auditObserver);
    this.eventBus.subscribe('STEP_COMPLETED', this.auditObserver);
    this.eventBus.subscribe('STEP_BLOCKED', this.auditObserver);
    this.eventBus.subscribe('QC_FAILED', this.auditObserver);
    this.eventBus.subscribe('WORKFLOW_CHANGED', this.auditObserver);

    // Initialize workflow instance for default order 1
    this.initDefaultOrderInstance();
  }

  private initDefaultOrderInstance() {
    const order1 = this.orders.find((o) => o.id === 'ord-001');
    if (!order1) return;

    const version = this.versions.find((v) => v.id === INITIAL_WORKFLOW_TEMPLATE.currentVersionId);
    if (!version) return;

    const conditionEvaluator = new SimpleConditionEvaluatorStrategy();
    const stepInstances: StepInstance[] = version.steps.map((def, idx) => {
      const isCondValid = conditionEvaluator.evaluate(def.conditionExpr, order1);
      let status: StepInstance['status'] = 'PENDING';

      if (!isCondValid) {
        status = 'SKIPPED';
      } else if (idx === 0) {
        status = 'DONE';
      } else if (def.code === 'CUTTING') {
        status = 'DONE';
      } else if (def.code === 'SEWING') {
        status = 'IN_PROGRESS';
      }

      return {
        id: `si-${order1.id}-${def.code}`,
        instanceId: `wi-${order1.id}`,
        stepCode: def.code,
        name: def.name,
        stepType: def.stepType,
        stationType: def.stationType,
        isMandatory: def.isMandatory,
        requiresEvidence: def.requiresEvidence,
        status,
        qtyIn: 750,
        qtyGood: def.code === 'CUTTING' ? 753 : 0,
        qtyDefect: 0,
        reworkCount: 0,
        evidences: [],
      };
    });

    const instance: WorkflowInstance = {
      id: `wi-${order1.id}`,
      orderId: order1.id,
      versionId: version.id,
      status: 'ACTIVE',
      stepInstances,
    };

    this.workflowInstances.set(order1.id, instance);

    // Create bundles for cutting
    this.bundles.push(
      { id: 'bd-1', orderId: order1.id, bundleCode: 'BD-001-S30', size: '30', qty: 50, currentStepCode: 'SEWING' },
      { id: 'bd-2', orderId: order1.id, bundleCode: 'BD-002-S30', size: '30', qty: 50, currentStepCode: 'SEWING' },
      { id: 'bd-3', orderId: order1.id, bundleCode: 'BD-003-S31', size: '31', qty: 50, currentStepCode: 'SEWING' }
    );
  }

  // --- CATALOG METHODS ---
  public getCatalog() {
    return {
      users: this.users,
      stations: this.stations,
      styles: this.styles,
      fabrics: this.fabrics,
      colors: this.colors,
      fabricColorRules: this.fabricColorRules,
      fabricLots: this.fabricLots,
      qcProfiles: this.qcProfiles,
    };
  }

  // --- ORDER METHODS ---
  public getOrders() {
    return this.orders.map((o) => {
      const instance = this.workflowInstances.get(o.id);
      return {
        ...o,
        workflowInstance: instance,
      };
    });
  }

  public getOrderById(id: string) {
    const order = this.orders.find((o) => o.id === id);
    if (!order) return null;
    const instance = this.workflowInstances.get(order.id);
    return { ...order, workflowInstance: instance };
  }

  /**
   * Create Production Order with BR-04, BR-18, BR-19 validation
   */
  public createOrder(data: {
    orderNumber: string;
    styleId: string;
    fabricTypeId: string;
    colorId: string;
    washType?: string;
    dyeRequired?: boolean;
    dyeMode?: 'TOTAL' | 'PARTIAL';
    dyeSource?: 'INTERNAL' | 'OUTSOURCED';
    skipCleanWash?: boolean;
    isCustom?: boolean;
    dueDate: string;
    sizeLines: { size: string; plannedQty: number }[];
    actorId: string;
    acknowledgementFileUrl?: string;
    acknowledgementBy?: string;
  }): { success: boolean; order?: ProductionOrder; error?: string } {
    // BR-04: Validate Fabric–Color Matrix
    const rule = this.fabricColorRules.find(
      (r) => r.fabricTypeId === data.fabricTypeId && r.colorId === data.colorId
    );
    if (!rule || !rule.isAllowed) {
      return {
        success: false,
        error: 'BR-04: Cặp Vải và Màu đã chọn không tương thích theo Ma Trận Vải–Màu (Fabric–Color Matrix)!',
      };
    }

    // Determine QC Profile (BR-19)
    const profileType = data.skipCleanWash ? 'SKIP_CLEAN_WASH' : 'FULL_PROCESS';
    const qcProfile = this.qcProfiles.find(
      (qp) => qp.styleId === data.styleId && qp.profileType === profileType
    );

    // BR-19: If skip clean wash, customer signed waiver is required
    let acknowledgement: CustomerAcknowledgement | undefined;
    if (data.skipCleanWash) {
      if (!data.acknowledgementFileUrl) {
        return {
          success: false,
          error: 'BR-19: Khách hàng bỏ Giặt sạch bắt buộc phải đính kèm văn bản khách ký xác nhận trước khi tiếp nhận đơn!',
        };
      }
      acknowledgement = {
        id: `ack-${Date.now()}`,
        orderId: `ord-${Date.now()}`,
        ackType: 'SKIP_CLEAN_WASH',
        qcProfileId: qcProfile ? qcProfile.id : 'default-skip',
        fileUrl: data.acknowledgementFileUrl,
        acknowledgedBy: data.acknowledgementBy || 'Khách Hàng',
        acknowledgedAt: new Date().toISOString(),
        recordedBy: data.actorId,
      };
    }

    // Compute BOM using Strategy
    const bomStrategy = new StandardJeanBomStrategy();
    const bomLines = bomStrategy.calculateBom(data.sizeLines, {});

    const newOrder: ProductionOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: data.orderNumber || `PO-${Date.now().toString().slice(-4)}`,
      styleId: data.styleId,
      fabricTypeId: data.fabricTypeId,
      colorId: data.colorId,
      washType: data.washType || 'NONE',
      dyeRequired: Boolean(data.dyeRequired),
      dyeMode: data.dyeMode || 'TOTAL',
      dyeSource: data.dyeSource || 'INTERNAL',
      skipCleanWash: Boolean(data.skipCleanWash),
      qcProfileId: qcProfile ? qcProfile.id : '',
      isCustom: Boolean(data.isCustom),
      status: 'DRAFT',
      dueDate: data.dueDate,
      createdBy: data.actorId,
      createdAt: new Date().toISOString(),
      sizeLines: data.sizeLines,
      bomLines,
      allocations: [],
      acknowledgement,
    };

    this.orders.unshift(newOrder);

    this.eventBus.publish({
      type: 'ORDER_CREATED',
      actorId: data.actorId,
      timestamp: new Date().toISOString(),
      payload: newOrder,
    });

    return { success: true, order: newOrder };
  }

  /**
   * Confirm Order (BR-03: Snapshot published template into WorkflowInstance)
   */
  public confirmOrder(orderId: string, actorId: string): { success: boolean; error?: string } {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return { success: false, error: 'Không tìm thấy đơn hàng' };

    const transitionCheck = OrderStateMachine.canTransition(order.status, 'CONFIRMED');
    if (!transitionCheck.allowed) {
      return { success: false, error: transitionCheck.error };
    }

    // Find style's template & published version
    const style = this.styles.find((s) => s.id === order.styleId);
    const template = this.templates.find((t) => t.id === style?.defaultTemplateId) || this.templates[0];
    const version = this.versions.find((v) => v.id === template?.currentVersionId && v.status === 'PUBLISHED');

    if (!version) {
      return {
        success: false,
        error: 'BR-03: Không thể xác nhận đơn hàng vì Style chưa có phiên bản Workflow nào được PUBLISHED!',
      };
    }

    // Snapshot version into WorkflowInstance
    const conditionEvaluator = new SimpleConditionEvaluatorStrategy();
    const stepInstances: StepInstance[] = version.steps.map((def, idx) => {
      const conditionMatches = conditionEvaluator.evaluate(def.conditionExpr, order);
      return {
        id: `si-${order.id}-${def.code}`,
        instanceId: `wi-${order.id}`,
        stepCode: def.code,
        name: def.name,
        stepType: def.stepType,
        stationType: def.stationType,
        isMandatory: def.isMandatory,
        requiresEvidence: def.requiresEvidence,
        status: !conditionMatches ? 'SKIPPED' : idx === 0 ? 'READY' : 'PENDING',
        qtyIn: order.sizeLines.reduce((sum, l) => sum + l.plannedQty, 0),
        qtyGood: 0,
        qtyDefect: 0,
        reworkCount: 0,
        evidences: [],
      };
    });

    const instance: WorkflowInstance = {
      id: `wi-${order.id}`,
      orderId: order.id,
      versionId: version.id,
      status: 'ACTIVE',
      stepInstances,
    };

    this.workflowInstances.set(order.id, instance);

    const oldStatus = order.status;
    order.status = 'CONFIRMED';

    this.eventBus.publish({
      type: 'ORDER_STATUS_CHANGED',
      actorId,
      timestamp: new Date().toISOString(),
      payload: { id: order.id, orderNumber: order.orderNumber, oldValue: oldStatus, newValue: 'CONFIRMED' },
    });

    return { success: true };
  }

  /**
   * Allocate Material (BR-06)
   */
  public allocateMaterial(
    orderId: string,
    bomLineId: string,
    fabricLotId: string,
    allocatedQty: number,
    actorId: string
  ): { success: boolean; error?: string } {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return { success: false, error: 'Không tìm thấy đơn hàng' };

    const lot = this.fabricLots.find((l) => l.id === fabricLotId);
    if (!lot) return { success: false, error: 'Không tìm thấy cuộn/lô vải' };

    if (lot.availableMeters < allocatedQty) {
      return {
        success: false,
        error: `Kho không đủ vải! Lô ${lot.lotNo} chỉ còn ${lot.availableMeters}m (yêu cầu: ${allocatedQty}m).`,
      };
    }

    lot.availableMeters -= allocatedQty;
    order.allocations.push({
      id: `al-${Date.now()}`,
      bomLineId,
      fabricLotId,
      allocatedQty,
    });

    this.eventBus.publish({
      type: 'WORKFLOW_CHANGED',
      actorId,
      timestamp: new Date().toISOString(),
      payload: { orderId, action: 'ALLOCATED_FABRIC', lotNo: lot.lotNo, allocatedQty },
    });

    return { success: true };
  }

  /**
   * Start Step Execution (Gatekeeper validation BR-14, BR-05, BR-06)
   */
  public startStep(
    orderId: string,
    stepCode: string,
    actorId: string
  ): { success: boolean; error?: string } {
    const order = this.orders.find((o) => o.id === orderId);
    const instance = this.workflowInstances.get(orderId);
    if (!order || !instance) return { success: false, error: 'Không tìm thấy đơn hàng hoặc tiến trình workflow' };

    const step = instance.stepInstances.find((s) => s.stepCode === stepCode);
    if (!step) return { success: false, error: 'Không tìm thấy công đoạn' };

    const version = this.versions.find((v) => v.id === instance.versionId) || INITIAL_WORKFLOW_VERSION;

    // Run Gatekeeper Chain of Responsibility
    const gateChain = buildGatekeeperChain();
    const gateContext: GateContext = {
      order,
      currentStep: step,
      allSteps: instance.stepInstances,
      transitions: version.transitions,
    };

    const gateResult = gateChain.handle(gateContext);
    if (!gateResult.passed) {
      return { success: false, error: gateResult.message };
    }

    // Transition state
    step.status = 'IN_PROGRESS';
    step.startedAt = new Date().toISOString();
    step.assignedTo = actorId;

    // BR-05: If CUTTING starts, order transitions to IN_PRODUCTION and locking fabric/color
    if (stepCode === 'CUTTING' && order.status === 'CONFIRMED') {
      order.status = 'IN_PRODUCTION';
    }

    return { success: true };
  }

  /**
   * Complete Step Execution (BR-08, BR-15)
   */
  public completeStep(
    orderId: string,
    stepCode: string,
    data: {
      qtyGood: number;
      qtyDefect: number;
      evidenceUrl?: string;
      evidenceNote?: string;
      actorId: string;
    }
  ): { success: boolean; error?: string } {
    const order = this.orders.find((o) => o.id === orderId);
    const instance = this.workflowInstances.get(orderId);
    if (!order || !instance) return { success: false, error: 'Không tìm thấy dữ liệu' };

    const step = instance.stepInstances.find((s) => s.stepCode === stepCode);
    if (!step) return { success: false, error: 'Không tìm thấy công đoạn' };

    // Attach evidence if provided
    if (data.evidenceUrl) {
      step.evidences.push({
        id: `ev-${Date.now()}`,
        stepInstanceId: step.id,
        fileUrl: data.evidenceUrl,
        note: data.evidenceNote || '',
        uploadedBy: data.actorId,
        uploadedAt: new Date().toISOString(),
      });
    }

    // BR-15: Check evidence requirement
    if (step.requiresEvidence && step.evidences.length === 0) {
      return {
        success: false,
        error: `BR-15: Công đoạn ${step.name} bắt buộc phải có ít nhất 01 tệp minh chứng trước khi hoàn thành!`,
      };
    }

    // Update quantities
    step.qtyGood = data.qtyGood;
    step.qtyDefect = data.qtyDefect;
    step.completedAt = new Date().toISOString();
    step.status = 'DONE';

    // If CUTTING completed, generate bundles
    if (stepCode === 'CUTTING') {
      order.sizeLines.forEach((line) => {
        line.actualCutQty = line.plannedQty;
        this.bundles.push({
          id: `bd-${Date.now()}-${line.size}`,
          orderId: order.id,
          bundleCode: `BD-${order.orderNumber}-${line.size}`,
          size: line.size,
          qty: line.plannedQty,
          currentStepCode: 'SEWING',
        });
      });
    }

    // Find and unlock next steps in transition graph
    const version = this.versions.find((v) => v.id === instance.versionId) || INITIAL_WORKFLOW_VERSION;
    const nextTransitions = version.transitions.filter(
      (t) => t.fromStepCode === stepCode && t.kind === 'NORMAL'
    );

    const conditionEvaluator = new SimpleConditionEvaluatorStrategy();
    for (const transition of nextTransitions) {
      const nextStep = instance.stepInstances.find((s) => s.stepCode === transition.toStepCode);
      if (nextStep && nextStep.status === 'PENDING') {
        const condOk = conditionEvaluator.evaluate(transition.conditionExpr, order);
        if (condOk) {
          nextStep.status = 'READY';
          nextStep.qtyIn = data.qtyGood;
        } else {
          nextStep.status = 'SKIPPED';
        }
      }
    }

    // Check if entire order is complete
    const allMandatoryDone = instance.stepInstances
      .filter((s) => s.isMandatory)
      .every((s) => s.status === 'DONE');

    if (allMandatoryDone) {
      order.status = 'COMPLETED';
    }

    this.eventBus.publish({
      type: 'STEP_COMPLETED',
      actorId: data.actorId,
      timestamp: new Date().toISOString(),
      payload: { orderId, stepCode, qtyGood: data.qtyGood, qtyDefect: data.qtyDefect },
    });

    return { success: true };
  }

  /**
   * Submit QC Inspection (BR-10, BR-11, BR-19)
   */
  public submitQc(data: {
    orderId: string;
    stepCode: string;
    inspectorId: string;
    result: 'PASS' | 'REWORK' | 'REJECT';
    targetStepCodeForRework?: string;
    shrinkageMeasured?: number;
    fadingLevelMeasured?: number;
    notes?: string;
    defects?: { defectType: string; qty: number; bundleId?: string }[];
  }): { success: boolean; error?: string } {
    const order = this.orders.find((o) => o.id === data.orderId);
    const instance = this.workflowInstances.get(data.orderId);
    if (!order || !instance) return { success: false, error: 'Không tìm thấy đơn hàng' };

    const step = instance.stepInstances.find((s) => s.stepCode === data.stepCode);
    if (!step) return { success: false, error: 'Không tìm thấy công đoạn' };

    // BR-11: Separation of Duties (Operator cannot QC their own step)
    if (step.assignedTo === data.inspectorId) {
      return {
        success: false,
        error: 'BR-11: Phân tách nhiệm vụ! Người thực hiện công đoạn không được phép tự làm QC cho chính công đoạn của mình.',
      };
    }

    if (data.result === 'PASS') {
      step.status = 'DONE';
    } else if (data.result === 'REWORK') {
      // BR-10: Rework routing with maxRework check
      if (step.reworkCount >= 3) {
        return {
          success: false,
          error: 'BR-10: Công đoạn đã vượt quá số vòng Rework tối đa (3 lần)! Vui lòng chuyển Production Planner xử lý ngoại lệ.',
        };
      }
      step.reworkCount += 1;
      step.status = 'REWORK';

      // Route target step back to IN_PROGRESS
      if (data.targetStepCodeForRework) {
        const reworkTarget = instance.stepInstances.find(
          (s) => s.stepCode === data.targetStepCodeForRework
        );
        if (reworkTarget) {
          reworkTarget.status = 'IN_PROGRESS';
        }
      }

      this.eventBus.publish({
        type: 'QC_FAILED',
        actorId: data.inspectorId,
        timestamp: new Date().toISOString(),
        payload: { orderId: data.orderId, stepCode: data.stepCode, reworkTo: data.targetStepCodeForRework },
      });
    }

    return { success: true };
  }

  // --- WORKFLOW TEMPLATE METHODS ---
  public getTemplates() {
    return {
      templates: this.templates,
      versions: this.versions,
    };
  }

  public getAuditLogs() {
    return this.auditLogs;
  }
}

// Global Singleton for in-memory DB
const globalForDb = global as unknown as { denimFlowDb: DatabaseStore };
export const db = globalForDb.denimFlowDb || new DatabaseStore();
if (process.env.NODE_ENV !== 'production') globalForDb.denimFlowDb = db;

export default db;
