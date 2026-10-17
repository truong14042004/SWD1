// DenimFlow BO - Domain Types

export type UserRole =
  | 'ADMIN'
  | 'PROCESS_ENGINEER'
  | 'PRODUCTION_PLANNER'
  | 'WAREHOUSE_KEEPER'
  | 'STATION_OPERATOR'
  | 'QC_INSPECTOR'
  | 'MANAGER';

export type StationType =
  | 'CUTTING'
  | 'SEWING'
  | 'EMBROIDERY'
  | 'DYEING'
  | 'WASH'
  | 'FINISHING'
  | 'QC'
  | 'PACKING';

export type StretchType = 'RIGID' | 'STRETCH';

export type StepType =
  | 'SELECTION'
  | 'MATERIAL'
  | 'PRODUCTION'
  | 'QC'
  | 'APPROVAL';

export type OrderStatus =
  | 'DRAFT'
  | 'CONFIRMED'
  | 'IN_PRODUCTION'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'CANCELLED';

export type StepStatus =
  | 'PENDING'
  | 'READY'
  | 'IN_PROGRESS'
  | 'WAITING_QC'
  | 'DONE'
  | 'REWORK'
  | 'SKIPPED';

export type WorkflowVersionStatus = 'DRAFT' | 'PUBLISHED' | 'RETIRED';

export type QCResult = 'PASS' | 'REWORK' | 'REJECT';

export type QCProfileType = 'FULL_PROCESS' | 'SKIP_CLEAN_WASH';

export type DyeMode = 'TOTAL' | 'PARTIAL';
export type DyeSource = 'INTERNAL' | 'OUTSOURCED';

export type TransitionKind = 'NORMAL' | 'REWORK';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  stationId?: string;
}

export interface Station {
  id: string;
  name: string;
  stationType: StationType;
  isOutsourced: boolean;
}

export interface Style {
  id: string;
  styleCode: string;
  name: string;
  fitType: string;
  defaultTemplateId: string;
}

export interface FabricType {
  id: string;
  code: string;
  weightOz: number;
  composition: string;
  stretchType: StretchType;
}

export interface ColorOption {
  id: string;
  code: string;
  name: string;
  colorFamily: string;
}

export interface FabricColorRule {
  id: string;
  fabricTypeId: string;
  colorId: string;
  isAllowed: boolean;
}

export interface FabricLot {
  id: string;
  fabricTypeId: string;
  colorId: string;
  lotNo: string;
  availableMeters: number;
  shrinkagePercent: number;
}

export interface QCProfile {
  id: string;
  styleId: string;
  profileType: QCProfileType;
  maxShrinkagePercent: number;
  maxColorFadingLevel: number;
  isActive: boolean;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  status: 'ACTIVE' | 'ARCHIVED';
  currentVersionId: string;
}

export interface StepDefinition {
  id: string;
  versionId: string;
  code: string;
  name: string;
  stepType: StepType;
  stationType: StationType;
  isMandatory: boolean;
  requiresEvidence: boolean;
  conditionExpr?: string;
  maxRework: number;
  sequenceOrder: number;
}

export interface StepTransition {
  id: string;
  versionId: string;
  fromStepCode: string;
  toStepCode: string;
  conditionExpr?: string;
  kind: TransitionKind;
}

export interface WorkflowVersion {
  id: string;
  templateId: string;
  versionNo: number;
  status: WorkflowVersionStatus;
  publishedAt?: string;
  steps: StepDefinition[];
  transitions: StepTransition[];
}

export interface OrderSizeLine {
  size: string;
  plannedQty: number;
  actualCutQty?: number;
}

export interface BomLine {
  id: string;
  materialType: 'FABRIC' | 'THREAD' | 'BUTTON' | 'RIVET' | 'ZIPPER' | 'LABEL' | 'PACKAGING';
  requiredQty: number;
  unit: string;
}

export interface MaterialAllocation {
  id: string;
  bomLineId: string;
  fabricLotId: string;
  allocatedQty: number;
}

export interface CustomerAcknowledgement {
  id: string;
  orderId: string;
  ackType: 'SKIP_CLEAN_WASH';
  qcProfileId: string;
  fileUrl: string;
  acknowledgedBy: string;
  acknowledgedAt: string;
  recordedBy: string;
}

export interface ProductionOrder {
  id: string;
  orderNumber: string;
  styleId: string;
  fabricTypeId: string;
  colorId: string;
  washType: string;
  dyeRequired: boolean;
  dyeMode: DyeMode;
  dyeSource: DyeSource;
  skipCleanWash: boolean;
  qcProfileId: string;
  isCustom: boolean;
  status: OrderStatus;
  dueDate: string;
  createdBy: string;
  createdAt: string;
  sizeLines: OrderSizeLine[];
  bomLines: BomLine[];
  allocations: MaterialAllocation[];
  acknowledgement?: CustomerAcknowledgement;
}

export interface Evidence {
  id: string;
  stepInstanceId: string;
  fileUrl: string;
  note: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface StepInstance {
  id: string;
  instanceId: string;
  stepCode: string;
  name: string;
  stepType: StepType;
  stationType: StationType;
  isMandatory: boolean;
  requiresEvidence: boolean;
  status: StepStatus;
  assignedTo?: string;
  startedAt?: string;
  completedAt?: string;
  qtyIn: number;
  qtyGood: number;
  qtyDefect: number;
  reworkCount: number;
  evidences: Evidence[];
}

export interface WorkflowInstance {
  id: string;
  orderId: string;
  versionId: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  stepInstances: StepInstance[];
}

export interface Bundle {
  id: string;
  orderId: string;
  bundleCode: string;
  size: string;
  qty: number;
  currentStepCode: string;
}

export interface Defect {
  id: string;
  inspectionId: string;
  bundleId?: string;
  defectType: string;
  qty: number;
}

export interface QCInspection {
  id: string;
  stepInstanceId: string;
  inspectorId: string;
  qcProfileId: string;
  sampleSize: number;
  result: QCResult;
  targetStepCodeForRework?: string;
  shrinkageMeasured?: number;
  fadingLevelMeasured?: number;
  notes: string;
  defects: Defect[];
  inspectedAt: string;
}

export interface WorkflowChangeRequest {
  id: string;
  instanceId: string;
  orderId: string;
  requestedBy: string;
  action: 'INSERT_STEP' | 'SKIP_STEP';
  stepCode: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  reviewedAt?: string;
}

export interface AuditLog {
  id: string;
  entityType: 'ORDER' | 'WORKFLOW' | 'STEP' | 'QC' | 'ALLOCATION';
  entityId: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  actorId: string;
  createdAt: string;
}
