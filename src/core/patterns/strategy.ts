import { OrderSizeLine, BomLine, QCProfile, ProductionOrder } from '../../types';

/**
 * Strategy Pattern 1: Transition Condition Evaluation Strategy
 */
export interface ConditionEvaluationStrategy {
  evaluate(conditionExpr: string | undefined, context: Record<string, any>): boolean;
}

export class SimpleConditionEvaluatorStrategy implements ConditionEvaluationStrategy {
  public evaluate(conditionExpr: string | undefined, context: Record<string, any>): boolean {
    if (!conditionExpr || conditionExpr.trim() === '') {
      return true; // No condition means unconditional transition
    }

    try {
      // Safe parsing of simple expressions
      const expr = conditionExpr.trim();

      // Example: washType != 'NONE'
      if (expr.includes('washType != \'NONE\'') || expr.includes('washType != "NONE"')) {
        return context.washType && context.washType !== 'NONE';
      }

      // Example: dyeRequired == true
      if (expr.includes('dyeRequired == true')) {
        return Boolean(context.dyeRequired);
      }

      // Example: isCustom == true
      if (expr.includes('isCustom == true')) {
        return Boolean(context.isCustom);
      }

      // Example: skipCleanWash == false
      if (expr.includes('skipCleanWash == false')) {
        return !context.skipCleanWash;
      }

      return true;
    } catch {
      return true;
    }
  }
}

/**
 * Strategy Pattern 2: BOM Calculation Strategy
 */
export interface BomCalculationStrategy {
  calculateBom(sizeLines: OrderSizeLine[], order: Partial<ProductionOrder>): BomLine[];
}

export class StandardJeanBomStrategy implements BomCalculationStrategy {
  public calculateBom(sizeLines: OrderSizeLine[], _order: Partial<ProductionOrder>): BomLine[] {
    const totalQty = sizeLines.reduce((sum, line) => sum + line.plannedQty, 0);

    // Standard denim consumption: approx 1.45 meters per jean + 5% scrap/loss
    const fabricPerUnit = 1.45 * 1.05;
    const requiredFabricMeters = Math.round(totalQty * fabricPerUnit * 10) / 10;

    return [
      {
        id: 'bom-fabric',
        materialType: 'FABRIC',
        requiredQty: requiredFabricMeters,
        unit: 'mét',
      },
      {
        id: 'bom-thread',
        materialType: 'THREAD',
        requiredQty: Math.ceil(totalQty * 120), // 120m thread per jean
        unit: 'mét',
      },
      {
        id: 'bom-button',
        materialType: 'BUTTON',
        requiredQty: totalQty * 1, // 1 shank button per jean
        unit: 'cái',
      },
      {
        id: 'bom-rivet',
        materialType: 'RIVET',
        requiredQty: totalQty * 6, // 6 rivets per jean
        unit: 'cái',
      },
      {
        id: 'bom-zipper',
        materialType: 'ZIPPER',
        requiredQty: totalQty * 1, // 1 metal zipper per jean
        unit: 'cái',
      },
      {
        id: 'bom-label',
        materialType: 'LABEL',
        requiredQty: totalQty * 2, // main label + care label
        unit: 'cái',
      },
      {
        id: 'bom-packaging',
        materialType: 'PACKAGING',
        requiredQty: totalQty * 1, // polybag per jean
        unit: 'túi',
      },
    ];
  }
}

/**
 * Strategy Pattern 3: QC Threshold Evaluation Strategy (BR-19)
 */
export interface QCThresholdStrategy {
  evaluateThresholds(
    qcProfile: QCProfile,
    shrinkageMeasured?: number,
    fadingLevelMeasured?: number
  ): { passed: boolean; reason?: string };
}

export class ProfileThresholdStrategy implements QCThresholdStrategy {
  public evaluateThresholds(
    qcProfile: QCProfile,
    shrinkageMeasured?: number,
    fadingLevelMeasured?: number
  ): { passed: boolean; reason?: string } {
    if (shrinkageMeasured !== undefined && shrinkageMeasured > qcProfile.maxShrinkagePercent) {
      return {
        passed: false,
        reason: `Độ co rút đo được (${shrinkageMeasured}%) vượt quá ngưỡng tối đa cho phép của Profile ${qcProfile.profileType} (${qcProfile.maxShrinkagePercent}%).`,
      };
    }

    if (fadingLevelMeasured !== undefined && fadingLevelMeasured > qcProfile.maxColorFadingLevel) {
      return {
        passed: false,
        reason: `Độ phai màu đo được (${fadingLevelMeasured}) vượt quá cấp độ cho phép của Profile ${qcProfile.profileType} (${qcProfile.maxColorFadingLevel}).`,
      };
    }

    return { passed: true };
  }
}
