import { OrderStatus, StepStatus } from '../../types';

export interface StateTransitionResult {
  allowed: boolean;
  error?: string;
}

/**
 * State Pattern: Production Order State Machine
 */
export class OrderStateMachine {
  private static readonly transitions: Record<OrderStatus, OrderStatus[]> = {
    DRAFT: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['IN_PRODUCTION', 'ON_HOLD', 'CANCELLED'],
    IN_PRODUCTION: ['COMPLETED', 'ON_HOLD', 'CANCELLED'],
    ON_HOLD: ['CONFIRMED', 'IN_PRODUCTION', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: [],
  };

  public static canTransition(current: OrderStatus, target: OrderStatus): StateTransitionResult {
    const allowedTargets = this.transitions[current] || [];
    if (!allowedTargets.includes(target)) {
      return {
        allowed: false,
        error: `Không thể chuyển trạng thái đơn hàng từ ${current} sang ${target}.`,
      };
    }
    return { allowed: true };
  }
}

/**
 * State Pattern: Step Instance State Machine
 */
export class StepStateMachine {
  private static readonly transitions: Record<StepStatus, StepStatus[]> = {
    PENDING: ['READY', 'SKIPPED'],
    READY: ['IN_PROGRESS'],
    IN_PROGRESS: ['WAITING_QC', 'DONE'],
    WAITING_QC: ['DONE', 'REWORK'],
    REWORK: ['IN_PROGRESS'],
    DONE: [],
    SKIPPED: [],
  };

  public static canTransition(current: StepStatus, target: StepStatus): StateTransitionResult {
    const allowedTargets = this.transitions[current] || [];
    if (!allowedTargets.includes(target)) {
      return {
        allowed: false,
        error: `Không thể chuyển trạng thái công đoạn từ ${current} sang ${target}.`,
      };
    }
    return { allowed: true };
  }
}
