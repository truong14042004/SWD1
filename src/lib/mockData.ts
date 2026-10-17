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
} from '../types';

export const INITIAL_USERS: User[] = [
  { id: 'u-admin', fullName: 'Nguyễn Văn Quản Trị', email: 'admin@denimflow.vn', role: 'ADMIN' },
  { id: 'u-pe', fullName: 'Trần Kỹ Sư Quy Trình', email: 'pe@denimflow.vn', role: 'PROCESS_ENGINEER' },
  { id: 'u-planner', fullName: 'Lê Kế Hoạch Sản Xuất', email: 'planner@denimflow.vn', role: 'PRODUCTION_PLANNER' },
  { id: 'u-wh', fullName: 'Phạm Thủ Kho Vải', email: 'warehouse@denimflow.vn', role: 'WAREHOUSE_KEEPER' },
  { id: 'u-operator', fullName: 'Hoàng Tổ Trưởng May', email: 'operator@denimflow.vn', role: 'STATION_OPERATOR', stationId: 'st-sewing' },
  { id: 'u-qc', fullName: 'Đặng Kiểm Định QC', email: 'qc@denimflow.vn', role: 'QC_INSPECTOR' },
  { id: 'u-manager', fullName: 'Vũ Giám Đốc Xưởng', email: 'manager@denimflow.vn', role: 'MANAGER' },
];

export const INITIAL_STATIONS: Station[] = [
  { id: 'st-cutting', name: 'Tổ Trải & Cắt', stationType: 'CUTTING', isOutsourced: false },
  { id: 'st-sewing', name: 'Chuyền May Chính', stationType: 'SEWING', isOutsourced: false },
  { id: 'st-embroidery', name: 'Tổ Thêu / In Vi Tính', stationType: 'EMBROIDERY', isOutsourced: false },
  { id: 'st-dyeing', name: 'Xưởng Nhuộm', stationType: 'DYEING', isOutsourced: true },
  { id: 'st-wash', name: 'Xưởng Wash & Giặt Mài', stationType: 'WASH', isOutsourced: false },
  { id: 'st-finishing', name: 'Tổ Hoàn Thiện (Ủi, Tag)', stationType: 'FINISHING', isOutsourced: false },
  { id: 'st-qc', name: 'Trạm Kiểm Soát QC Cuối', stationType: 'QC', isOutsourced: false },
  { id: 'st-packing', name: 'Khu Vực Đóng Gói & Xuất Hàng', stationType: 'PACKING', isOutsourced: false },
];

export const INITIAL_FABRICS: FabricType[] = [
  { id: 'fab-14oz-rigid', code: 'DENIM-14OZ-RIGID', weightOz: 14.0, composition: '100% Cotton Selvedge', stretchType: 'RIGID' },
  { id: 'fab-11oz-stretch', code: 'DENIM-11OZ-STRETCH', weightOz: 11.5, composition: '98% Cotton, 2% Spandex', stretchType: 'STRETCH' },
  { id: 'fab-12oz-rigid', code: 'DENIM-12OZ-RIGID', weightOz: 12.0, composition: '100% Organic Cotton', stretchType: 'RIGID' },
];

export const INITIAL_COLORS: ColorOption[] = [
  { id: 'col-indigo-raw', code: 'IND-RAW', name: 'Raw Indigo Đậm', colorFamily: 'Indigo' },
  { id: 'col-black-mineral', code: 'BLK-MIN', name: 'Đen Khoáng (Mineral Black)', colorFamily: 'Black' },
  { id: 'col-vintage-blue', code: 'BLU-VIN', name: 'Xanh Cổ Điển (Vintage Blue)', colorFamily: 'Blue' },
  { id: 'col-acid-grey', code: 'GRY-ACD', name: 'Xám Khói Acid (Acid Grey)', colorFamily: 'Grey' },
];

// Fabric-Color Matrix (BR-04)
export const INITIAL_FABRIC_COLOR_RULES: FabricColorRule[] = [
  { id: 'fcr-1', fabricTypeId: 'fab-14oz-rigid', colorId: 'col-indigo-raw', isAllowed: true },
  { id: 'fcr-2', fabricTypeId: 'fab-14oz-rigid', colorId: 'col-black-mineral', isAllowed: true },
  { id: 'fcr-3', fabricTypeId: 'fab-14oz-rigid', colorId: 'col-vintage-blue', isAllowed: false }, // Heavy rigid not recommended for vintage wash
  { id: 'fcr-4', fabricTypeId: 'fab-14oz-rigid', colorId: 'col-acid-grey', isAllowed: false },
  { id: 'fcr-5', fabricTypeId: 'fab-11oz-stretch', colorId: 'col-indigo-raw', isAllowed: true },
  { id: 'fcr-6', fabricTypeId: 'fab-11oz-stretch', colorId: 'col-black-mineral', isAllowed: true },
  { id: 'fcr-7', fabricTypeId: 'fab-11oz-stretch', colorId: 'col-vintage-blue', isAllowed: true },
  { id: 'fcr-8', fabricTypeId: 'fab-11oz-stretch', colorId: 'col-acid-grey', isAllowed: true },
  { id: 'fcr-9', fabricTypeId: 'fab-12oz-rigid', colorId: 'col-indigo-raw', isAllowed: true },
  { id: 'fcr-10', fabricTypeId: 'fab-12oz-rigid', colorId: 'col-vintage-blue', isAllowed: true },
];

export const INITIAL_FABRIC_LOTS: FabricLot[] = [
  { id: 'lot-101', fabricTypeId: 'fab-14oz-rigid', colorId: 'col-indigo-raw', lotNo: 'LOT-2026-IND01', availableMeters: 4500, shrinkagePercent: 2.8 },
  { id: 'lot-102', fabricTypeId: 'fab-14oz-rigid', colorId: 'col-black-mineral', lotNo: 'LOT-2026-BLK01', availableMeters: 2800, shrinkagePercent: 2.4 },
  { id: 'lot-201', fabricTypeId: 'fab-11oz-stretch', colorId: 'col-vintage-blue', lotNo: 'LOT-2026-BLU02', availableMeters: 6200, shrinkagePercent: 3.2 },
  { id: 'lot-202', fabricTypeId: 'fab-11oz-stretch', colorId: 'col-black-mineral', lotNo: 'LOT-2026-BLK02', availableMeters: 3100, shrinkagePercent: 3.5 },
];

export const INITIAL_STYLES: Style[] = [
  { id: 'sty-straight', styleCode: 'JN-STR-01', name: 'Quần Jean Straight Regular', fitType: 'Straight Fit', defaultTemplateId: 'tmpl-jean-std' },
  { id: 'sty-slim-wash', styleCode: 'JN-SLM-02', name: 'Quần Jean Slim Fit Wash Mài', fitType: 'Slim Fit', defaultTemplateId: 'tmpl-jean-std' },
  { id: 'sty-wide-distressed', styleCode: 'JN-WID-03', name: 'Quần Jean Ống Rộng Rách & Thêu', fitType: 'Wide-Leg', defaultTemplateId: 'tmpl-jean-std' },
];

// QC Profiles (BR-19)
export const INITIAL_QC_PROFILES: QCProfile[] = [
  { id: 'qc-prof-straight-full', styleId: 'sty-straight', profileType: 'FULL_PROCESS', maxShrinkagePercent: 3.0, maxColorFadingLevel: 2.0, isActive: true },
  { id: 'qc-prof-straight-skip', styleId: 'sty-straight', profileType: 'SKIP_CLEAN_WASH', maxShrinkagePercent: 6.5, maxColorFadingLevel: 4.5, isActive: true },
  { id: 'qc-prof-slim-full', styleId: 'sty-slim-wash', profileType: 'FULL_PROCESS', maxShrinkagePercent: 3.5, maxColorFadingLevel: 2.5, isActive: true },
  { id: 'qc-prof-slim-skip', styleId: 'sty-slim-wash', profileType: 'SKIP_CLEAN_WASH', maxShrinkagePercent: 7.0, maxColorFadingLevel: 5.0, isActive: true },
  { id: 'qc-prof-wide-full', styleId: 'sty-wide-distressed', profileType: 'FULL_PROCESS', maxShrinkagePercent: 3.5, maxColorFadingLevel: 2.5, isActive: true },
  { id: 'qc-prof-wide-skip', styleId: 'sty-wide-distressed', profileType: 'SKIP_CLEAN_WASH', maxShrinkagePercent: 7.0, maxColorFadingLevel: 5.0, isActive: true },
];

export const INITIAL_WORKFLOW_TEMPLATE: WorkflowTemplate = {
  id: 'tmpl-jean-std',
  name: 'Quy trình sản xuất Jean Chuẩn (14 Công đoạn & Nhánh Custom)',
  status: 'ACTIVE',
  currentVersionId: 'ver-jean-std-v1',
};

export const INITIAL_WORKFLOW_VERSION: WorkflowVersion = {
  id: 'ver-jean-std-v1',
  templateId: 'tmpl-jean-std',
  versionNo: 1,
  status: 'PUBLISHED',
  publishedAt: '2026-10-17T08:00:00Z',
  steps: [
    { id: 's1', versionId: 'ver-jean-std-v1', code: 'ORDER_CONFIRM', name: 'Tiếp nhận & Xác nhận đơn', stepType: 'APPROVAL', stationType: 'PACKING', isMandatory: true, requiresEvidence: false, maxRework: 0, sequenceOrder: 1 },
    { id: 'sc', versionId: 'ver-jean-std-v1', code: 'CUSTOM_REVIEW', name: 'Thẩm định Khả thi & Tạo Workflow Riêng', stepType: 'APPROVAL', stationType: 'PACKING', isMandatory: false, requiresEvidence: false, conditionExpr: 'isCustom == true', maxRework: 0, sequenceOrder: 2 },
    { id: 's2', versionId: 'ver-jean-std-v1', code: 'FABRIC_COLOR_SELECT', name: 'Chọn Vải & Màu', stepType: 'SELECTION', stationType: 'CUTTING', isMandatory: true, requiresEvidence: false, maxRework: 0, sequenceOrder: 3 },
    { id: 's3', versionId: 'ver-jean-std-v1', code: 'BOM_ALLOCATE', name: 'Tính BOM & Cấp phát Vật tư', stepType: 'MATERIAL', stationType: 'CUTTING', isMandatory: true, requiresEvidence: false, maxRework: 0, sequenceOrder: 4 },
    { id: 's4', versionId: 'ver-jean-std-v1', code: 'FABRIC_INSPECT', name: 'Kiểm Vải Đầu Vào / Thử Co Rút', stepType: 'QC', stationType: 'QC', isMandatory: false, requiresEvidence: true, maxRework: 1, sequenceOrder: 5 },
    { id: 's5', versionId: 'ver-jean-std-v1', code: 'PP_SAMPLE', name: 'Duyệt Mẫu Tiền Sản Xuất', stepType: 'APPROVAL', stationType: 'SEWING', isMandatory: false, requiresEvidence: true, maxRework: 2, sequenceOrder: 6 },
    { id: 's6', versionId: 'ver-jean-std-v1', code: 'CUTTING', name: 'Trải Vải & Cắt', stepType: 'PRODUCTION', stationType: 'CUTTING', isMandatory: true, requiresEvidence: false, maxRework: 0, sequenceOrder: 7 },
    { id: 's7', versionId: 'ver-jean-std-v1', code: 'EMBROIDERY', name: 'Thêu / In Chi Tiết', stepType: 'PRODUCTION', stationType: 'EMBROIDERY', isMandatory: false, requiresEvidence: false, conditionExpr: 'isCustom == true', maxRework: 1, sequenceOrder: 8 },
    { id: 's8', versionId: 'ver-jean-std-v1', code: 'SEWING', name: 'May Ráp Hoàn Chỉnh', stepType: 'PRODUCTION', stationType: 'SEWING', isMandatory: true, requiresEvidence: false, maxRework: 3, sequenceOrder: 9 },
    { id: 's9', versionId: 'ver-jean-std-v1', code: 'DYEING', name: 'Nhuộm Thành Phẩm', stepType: 'PRODUCTION', stationType: 'DYEING', isMandatory: false, requiresEvidence: true, conditionExpr: 'dyeRequired == true', maxRework: 1, sequenceOrder: 10 },
    { id: 's10', versionId: 'ver-jean-std-v1', code: 'EFFECT_WASH', name: 'Wash Hiệu Ứng (Giặt Mài)', stepType: 'PRODUCTION', stationType: 'WASH', isMandatory: false, requiresEvidence: false, conditionExpr: "washType != 'NONE'", maxRework: 2, sequenceOrder: 11 },
    { id: 's11', versionId: 'ver-jean-std-v1', code: 'CLEAN_WASH', name: 'Giặt Sạch Ổn Định', stepType: 'PRODUCTION', stationType: 'WASH', isMandatory: false, requiresEvidence: false, conditionExpr: 'skipCleanWash == false', maxRework: 1, sequenceOrder: 12 },
    { id: 's12', versionId: 'ver-jean-std-v1', code: 'FINISHING', name: 'Hoàn Thiện (Cắt Chỉ, Ủi, Tag)', stepType: 'PRODUCTION', stationType: 'FINISHING', isMandatory: true, requiresEvidence: true, maxRework: 2, sequenceOrder: 13 },
    { id: 's13', versionId: 'ver-jean-std-v1', code: 'FINAL_QC', name: 'Kiểm Định QC Cuối (AQL & Co Rút)', stepType: 'QC', stationType: 'QC', isMandatory: true, requiresEvidence: true, maxRework: 3, sequenceOrder: 14 },
    { id: 's14', versionId: 'ver-jean-std-v1', code: 'PACK_HANDOVER', name: 'Đóng Gói & Bàn Giao', stepType: 'PRODUCTION', stationType: 'PACKING', isMandatory: true, requiresEvidence: true, maxRework: 0, sequenceOrder: 15 },
  ],
  transitions: [
    { id: 't1', versionId: 'ver-jean-std-v1', fromStepCode: 'ORDER_CONFIRM', toStepCode: 'CUSTOM_REVIEW', conditionExpr: 'isCustom == true', kind: 'NORMAL' },
    { id: 't2', versionId: 'ver-jean-std-v1', fromStepCode: 'ORDER_CONFIRM', toStepCode: 'FABRIC_COLOR_SELECT', kind: 'NORMAL' },
    { id: 't3', versionId: 'ver-jean-std-v1', fromStepCode: 'CUSTOM_REVIEW', toStepCode: 'FABRIC_COLOR_SELECT', kind: 'NORMAL' },
    { id: 't4', versionId: 'ver-jean-std-v1', fromStepCode: 'FABRIC_COLOR_SELECT', toStepCode: 'BOM_ALLOCATE', kind: 'NORMAL' },
    { id: 't5', versionId: 'ver-jean-std-v1', fromStepCode: 'BOM_ALLOCATE', toStepCode: 'FABRIC_INSPECT', kind: 'NORMAL' },
    { id: 't6', versionId: 'ver-jean-std-v1', fromStepCode: 'FABRIC_INSPECT', toStepCode: 'PP_SAMPLE', kind: 'NORMAL' },
    { id: 't7', versionId: 'ver-jean-std-v1', fromStepCode: 'PP_SAMPLE', toStepCode: 'CUTTING', kind: 'NORMAL' },
    { id: 't8', versionId: 'ver-jean-std-v1', fromStepCode: 'CUTTING', toStepCode: 'EMBROIDERY', conditionExpr: 'isCustom == true', kind: 'NORMAL' },
    { id: 't9', versionId: 'ver-jean-std-v1', fromStepCode: 'CUTTING', toStepCode: 'SEWING', kind: 'NORMAL' },
    { id: 't10', versionId: 'ver-jean-std-v1', fromStepCode: 'EMBROIDERY', toStepCode: 'SEWING', kind: 'NORMAL' },
    { id: 't11', versionId: 'ver-jean-std-v1', fromStepCode: 'SEWING', toStepCode: 'DYEING', conditionExpr: 'dyeRequired == true', kind: 'NORMAL' },
    { id: 't12', versionId: 'ver-jean-std-v1', fromStepCode: 'SEWING', toStepCode: 'EFFECT_WASH', kind: 'NORMAL' },
    { id: 't13', versionId: 'ver-jean-std-v1', fromStepCode: 'DYEING', toStepCode: 'EFFECT_WASH', kind: 'NORMAL' },
    { id: 't14', versionId: 'ver-jean-std-v1', fromStepCode: 'EFFECT_WASH', toStepCode: 'CLEAN_WASH', conditionExpr: 'skipCleanWash == false', kind: 'NORMAL' },
    { id: 't15', versionId: 'ver-jean-std-v1', fromStepCode: 'EFFECT_WASH', toStepCode: 'FINISHING', conditionExpr: 'skipCleanWash == true', kind: 'NORMAL' },
    { id: 't16', versionId: 'ver-jean-std-v1', fromStepCode: 'CLEAN_WASH', toStepCode: 'FINISHING', kind: 'NORMAL' },
    { id: 't17', versionId: 'ver-jean-std-v1', fromStepCode: 'FINISHING', toStepCode: 'FINAL_QC', kind: 'NORMAL' },
    { id: 't18', versionId: 'ver-jean-std-v1', fromStepCode: 'FINAL_QC', toStepCode: 'PACK_HANDOVER', kind: 'NORMAL' },
    // Rework transition (BR-10)
    { id: 't-rew-1', versionId: 'ver-jean-std-v1', fromStepCode: 'FINAL_QC', toStepCode: 'SEWING', kind: 'REWORK' },
    { id: 't-rew-2', versionId: 'ver-jean-std-v1', fromStepCode: 'FINAL_QC', toStepCode: 'FINISHING', kind: 'REWORK' },
  ],
};

export const INITIAL_ORDERS: ProductionOrder[] = [
  {
    id: 'ord-001',
    orderNumber: 'PO-2026-001',
    styleId: 'sty-straight',
    fabricTypeId: 'fab-14oz-rigid',
    colorId: 'col-indigo-raw',
    washType: 'NONE',
    dyeRequired: false,
    dyeMode: 'TOTAL',
    dyeSource: 'INTERNAL',
    skipCleanWash: false,
    qcProfileId: 'qc-prof-straight-full',
    isCustom: false,
    status: 'IN_PRODUCTION',
    dueDate: '2026-11-15T00:00:00Z',
    createdBy: 'u-planner',
    createdAt: '2026-10-15T09:00:00Z',
    sizeLines: [
      { size: '29', plannedQty: 100, actualCutQty: 100 },
      { size: '30', plannedQty: 250, actualCutQty: 252 },
      { size: '31', plannedQty: 250, actualCutQty: 250 },
      { size: '32', plannedQty: 150, actualCutQty: 151 },
    ],
    bomLines: [
      { id: 'bom-1', materialType: 'FABRIC', requiredQty: 1140, unit: 'mét' },
      { id: 'bom-2', materialType: 'BUTTON', requiredQty: 750, unit: 'cái' },
      { id: 'bom-3', materialType: 'ZIPPER', requiredQty: 750, unit: 'cái' },
    ],
    allocations: [
      { id: 'al-1', bomLineId: 'bom-1', fabricLotId: 'lot-101', allocatedQty: 1140 },
    ],
    totalAmount: 112500000, // 750 pcs * 150,000 VND
    depositAmount: 56250000, // 50% cọc
    paidAmount: 56250000,
    paymentStatus: 'DEPOSIT_PAID',
    paymentTransactions: [
      {
        id: 'tx-001',
        stage: 'DEPOSIT',
        amount: 56250000,
        orderCode: 2026001,
        transactionTime: '2026-10-15T09:15:00Z',
        method: 'PAYOS_VIETQR',
        status: 'PAID',
        reference: 'MB-REF-992182',
        accountNumber: '03456789999',
        bankName: 'MBBank',
      },
    ],
  },
  {
    id: 'ord-002',
    orderNumber: 'PO-2026-002',
    styleId: 'sty-slim-wash',
    fabricTypeId: 'fab-11oz-stretch',
    colorId: 'col-vintage-blue',
    washType: 'STONE_ENZYME_WASH',
    dyeRequired: false,
    dyeMode: 'TOTAL',
    dyeSource: 'INTERNAL',
    skipCleanWash: true, // Special test case for BR-18 & BR-19
    qcProfileId: 'qc-prof-slim-skip',
    isCustom: false,
    status: 'CONFIRMED',
    dueDate: '2026-11-20T00:00:00Z',
    createdBy: 'u-planner',
    createdAt: '2026-10-16T14:30:00Z',
    sizeLines: [
      { size: '30', plannedQty: 150 },
      { size: '32', plannedQty: 150 },
    ],
    bomLines: [
      { id: 'bom-10', materialType: 'FABRIC', requiredQty: 456, unit: 'mét' },
    ],
    allocations: [
      { id: 'al-10', bomLineId: 'bom-10', fabricLotId: 'lot-201', allocatedQty: 456 },
    ],
    totalAmount: 48000000, // 300 pcs * 160,000 VND
    depositAmount: 24000000, // 50% cọc
    paidAmount: 24000000,
    paymentStatus: 'DEPOSIT_PAID',
    paymentTransactions: [
      {
        id: 'tx-002',
        stage: 'DEPOSIT',
        amount: 24000000,
        orderCode: 2026002,
        transactionTime: '2026-10-16T14:45:00Z',
        method: 'PAYOS_VIETQR',
        status: 'PAID',
        reference: 'MB-REF-448291',
        accountNumber: '03456789999',
        bankName: 'MBBank',
      },
    ],
    acknowledgement: {
      id: 'ack-002',
      orderId: 'ord-002',
      ackType: 'SKIP_CLEAN_WASH',
      qcProfileId: 'qc-prof-slim-skip',
      fileUrl: '/uploads/acknowledgements/PO-2026-002-signed-cleanwash-waiver.pdf',
      acknowledgedBy: 'Brand Buyer (DenimLab Ltd)',
      acknowledgedAt: '2026-10-16T15:00:00Z',
      recordedBy: 'u-planner',
    },
  },
  {
    id: 'ord-003',
    orderNumber: 'PO-2026-003',
    styleId: 'sty-slim-wash',
    fabricTypeId: 'fab-11oz-stretch',
    colorId: 'col-vintage-blue',
    washType: 'ENZYME_WASH',
    dyeRequired: false,
    dyeMode: 'TOTAL',
    dyeSource: 'INTERNAL',
    skipCleanWash: false,
    qcProfileId: 'qc-prof-slim-full',
    isCustom: false,
    status: 'DRAFT',
    dueDate: '2026-11-28T00:00:00Z',
    createdBy: 'u-planner',
    createdAt: '2026-10-17T08:00:00Z',
    sizeLines: [
      { size: '29', plannedQty: 100 },
      { size: '30', plannedQty: 150 },
      { size: '31', plannedQty: 150 },
      { size: '32', plannedQty: 100 },
    ],
    bomLines: [
      { id: 'bom-20', materialType: 'FABRIC', requiredQty: 760, unit: 'mét' },
      { id: 'bom-21', materialType: 'BUTTON', requiredQty: 500, unit: 'cái' },
      { id: 'bom-22', materialType: 'ZIPPER', requiredQty: 500, unit: 'cái' },
    ],
    allocations: [],
    totalAmount: 75000000, // 500 pcs * 150,000 VND
    depositAmount: 37500000, // 50% cọc
    paidAmount: 0,
    paymentStatus: 'UNPAID',
    paymentTransactions: [],
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-001',
    entityType: 'ORDER',
    entityId: 'PO-2026-001',
    action: 'ORDER_CREATED',
    oldValue: '',
    newValue: JSON.stringify({ orderNumber: 'PO-2026-001', style: 'JN-STR-01', totalQty: 750 }),
    actorId: 'u-planner',
    createdAt: '2026-10-15T09:00:00Z',
  },
  {
    id: 'aud-002',
    entityType: 'ORDER',
    entityId: 'PO-2026-001',
    action: 'ORDER_STATUS_CHANGED',
    oldValue: 'DRAFT',
    newValue: 'CONFIRMED',
    actorId: 'u-planner',
    createdAt: '2026-10-15T09:30:00Z',
  },
  {
    id: 'aud-003',
    entityType: 'STEP',
    entityId: 'CUTTING',
    action: 'STEP_COMPLETED',
    oldValue: 'IN_PROGRESS',
    newValue: 'DONE (753 pcs)',
    actorId: 'u-operator',
    createdAt: '2026-10-16T11:00:00Z',
  },
  {
    id: 'aud-004',
    entityType: 'ORDER',
    entityId: 'PO-2026-002',
    action: 'SKIP_CLEAN_WASH_ACKNOWLEDGED',
    oldValue: '',
    newValue: 'Đã đính kèm văn bản khách ký xác nhận bỏ giặt sạch -> Profile SKIP_CLEAN_WASH',
    actorId: 'u-planner',
    createdAt: '2026-10-16T15:00:00Z',
  },
];
