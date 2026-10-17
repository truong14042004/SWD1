import { StepType, StepInstance, UserRole } from '../../types';

export interface StepExecutionResult {
  success: boolean;
  message: string;
}

export interface IStepHandler {
  readonly stepType: StepType;
  allowedRoles(): UserRole[];
  validateExecution(step: StepInstance, userRole: UserRole): StepExecutionResult;
}

export class SelectionStepHandler implements IStepHandler {
  readonly stepType: StepType = 'SELECTION';

  allowedRoles(): UserRole[] {
    return ['PRODUCTION_PLANNER', 'ADMIN'];
  }

  validateExecution(step: StepInstance, userRole: UserRole): StepExecutionResult {
    if (!this.allowedRoles().includes(userRole)) {
      return { success: false, message: `Vai trò ${userRole} không được thực hiện bước Lựa chọn (${step.name}).` };
    }
    return { success: true, message: 'Hợp lệ.' };
  }
}

export class MaterialStepHandler implements IStepHandler {
  readonly stepType: StepType = 'MATERIAL';

  allowedRoles(): UserRole[] {
    return ['WAREHOUSE_KEEPER', 'PRODUCTION_PLANNER', 'ADMIN'];
  }

  validateExecution(step: StepInstance, userRole: UserRole): StepExecutionResult {
    if (!this.allowedRoles().includes(userRole)) {
      return { success: false, message: `Vai trò ${userRole} không có quyền cấp phát vật tư cho (${step.name}).` };
    }
    return { success: true, message: 'Hợp lệ.' };
  }
}

export class ProductionStepHandler implements IStepHandler {
  readonly stepType: StepType = 'PRODUCTION';

  allowedRoles(): UserRole[] {
    return ['STATION_OPERATOR', 'ADMIN'];
  }

  validateExecution(step: StepInstance, userRole: UserRole): StepExecutionResult {
    if (!this.allowedRoles().includes(userRole)) {
      return { success: false, message: `Vai trò ${userRole} không thể thao tác công đoạn sản xuất (${step.name}).` };
    }
    return { success: true, message: 'Hợp lệ.' };
  }
}

export class QCStepHandler implements IStepHandler {
  readonly stepType: StepType = 'QC';

  allowedRoles(): UserRole[] {
    return ['QC_INSPECTOR', 'ADMIN'];
  }

  validateExecution(step: StepInstance, userRole: UserRole): StepExecutionResult {
    if (!this.allowedRoles().includes(userRole)) {
      return { success: false, message: `Chỉ QC Inspector mới được thực hiện công đoạn kiểm định (${step.name}).` };
    }
    return { success: true, message: 'Hợp lệ.' };
  }
}

export class ApprovalStepHandler implements IStepHandler {
  readonly stepType: StepType = 'APPROVAL';

  allowedRoles(): UserRole[] {
    return ['PRODUCTION_PLANNER', 'PROCESS_ENGINEER', 'ADMIN'];
  }

  validateExecution(step: StepInstance, userRole: UserRole): StepExecutionResult {
    if (!this.allowedRoles().includes(userRole)) {
      return { success: false, message: `Vai trò ${userRole} không có quyền phê duyệt bước (${step.name}).` };
    }
    return { success: true, message: 'Hợp lệ.' };
  }
}

/**
 * Factory Method: Step Handler Factory
 */
export class StepHandlerFactory {
  private static handlers: Map<StepType, IStepHandler> = new Map([
    ['SELECTION', new SelectionStepHandler()],
    ['MATERIAL', new MaterialStepHandler()],
    ['PRODUCTION', new ProductionStepHandler()],
    ['QC', new QCStepHandler()],
    ['APPROVAL', new ApprovalStepHandler()],
  ]);

  public static getHandler(stepType: StepType): IStepHandler {
    const handler = this.handlers.get(stepType);
    if (!handler) {
      throw new Error(`Không tìm thấy Handler cho loại step: ${stepType}`);
    }
    return handler;
  }
}
