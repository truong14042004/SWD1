import { StepInstance, ProductionOrder, StepTransition } from '../../types';

export interface GateContext {
  order: ProductionOrder;
  currentStep: StepInstance;
  allSteps: StepInstance[];
  transitions: StepTransition[];
}

export interface GateResult {
  passed: boolean;
  gateName: string;
  message?: string;
}

export abstract class GateHandler {
  protected nextHandler: GateHandler | null = null;

  public setNext(handler: GateHandler): GateHandler {
    this.nextHandler = handler;
    return handler;
  }

  public abstract handle(context: GateContext): GateResult;

  protected passNext(context: GateContext): GateResult {
    if (this.nextHandler) {
      return this.nextHandler.handle(context);
    }
    return { passed: true, gateName: 'AllGatesPassed' };
  }
}

/**
 * Gate 1: Check all predecessor steps are completed (DONE or SKIPPED)
 */
export class PredecessorGateHandler extends GateHandler {
  public handle(context: GateContext): GateResult {
    const { currentStep, allSteps, transitions } = context;

    // Find all step codes that point to currentStep
    const incomingTransitions = transitions.filter(
      (t) => t.toStepCode === currentStep.stepCode && t.kind === 'NORMAL'
    );

    for (const transition of incomingTransitions) {
      const predStep = allSteps.find((s) => s.stepCode === transition.fromStepCode);
      if (predStep && predStep.status !== 'DONE' && predStep.status !== 'SKIPPED') {
        return {
          passed: false,
          gateName: 'PredecessorGate',
          message: `Công đoạn tiền nhiệm "${predStep.name}" (${predStep.stepCode}) chưa hoàn thành (trạng thái: ${predStep.status}).`,
        };
      }
    }

    return this.passNext(context);
  }
}

/**
 * Gate 2: Material Allocation Check before CUTTING (BR-06)
 */
export class CuttingMaterialGateHandler extends GateHandler {
  public handle(context: GateContext): GateResult {
    const { currentStep, order } = context;

    if (currentStep.stepCode === 'CUTTING') {
      const fabricBom = order.bomLines.find((b) => b.materialType === 'FABRIC');
      if (fabricBom) {
        const totalAllocated = order.allocations
          .filter((a) => a.bomLineId === fabricBom.id)
          .reduce((sum, a) => sum + a.allocatedQty, 0);

        if (totalAllocated < fabricBom.requiredQty) {
          return {
            passed: false,
            gateName: 'CuttingMaterialGate',
            message: `BR-06: Không thể bắt đầu Cắt! Vải chưa được cấp đủ theo BOM (Cần: ${fabricBom.requiredQty}m, Đã giữ: ${totalAllocated}m).`,
          };
        }
      }
    }

    return this.passNext(context);
  }
}

/**
 * Gate 3: Evidence Requirement Check (BR-15)
 */
export class EvidenceGateHandler extends GateHandler {
  public handle(context: GateContext): GateResult {
    const { currentStep } = context;

    if (currentStep.requiresEvidence && (!currentStep.evidences || currentStep.evidences.length === 0)) {
      return {
        passed: false,
        gateName: 'EvidenceGate',
        message: `BR-15: Công đoạn "${currentStep.name}" bắt buộc đính kèm tối thiểu 01 minh chứng (ảnh/phiếu nghiệm thu).`,
      };
    }

    return this.passNext(context);
  }
}

/**
 * Gate 4: Quantity Preservation Check (BR-08)
 */
export class QuantityConservationGateHandler extends GateHandler {
  public handle(context: GateContext): GateResult {
    const { currentStep } = context;

    if (currentStep.qtyIn > 0) {
      if (currentStep.qtyGood + currentStep.qtyDefect > currentStep.qtyIn) {
        return {
          passed: false,
          gateName: 'QuantityConservationGate',
          message: `BR-08: Số lượng không hợp lệ! Tổng số đạt (${currentStep.qtyGood}) và số lỗi (${currentStep.qtyDefect}) vượt quá số lượng đầu vào (${currentStep.qtyIn}).`,
        };
      }
    }

    return this.passNext(context);
  }
}

/**
 * Factory builder for the Gatekeeper Chain
 */
export function buildGatekeeperChain(): GateHandler {
  const predecessorGate = new PredecessorGateHandler();
  const materialGate = new CuttingMaterialGateHandler();
  const evidenceGate = new EvidenceGateHandler();
  const quantityGate = new QuantityConservationGateHandler();

  predecessorGate
    .setNext(materialGate)
    .setNext(evidenceGate)
    .setNext(quantityGate);

  return predecessorGate;
}
