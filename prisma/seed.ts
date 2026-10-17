import { PrismaClient } from '@prisma/client';
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
  INITIAL_AUDIT_LOGS,
} from '../src/lib/mockData';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding DenimFlow BO PostgreSQL database...');

  // 1. Users
  for (const u of INITIAL_USERS) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        role: u.role,
        stationId: u.stationId,
      },
    });
  }

  // 2. Stations
  for (const st of INITIAL_STATIONS) {
    await prisma.station.upsert({
      where: { id: st.id },
      update: {},
      create: {
        id: st.id,
        name: st.name,
        stationType: st.stationType,
        isOutsourced: st.isOutsourced,
      },
    });
  }

  // 3. Fabrics
  for (const fab of INITIAL_FABRICS) {
    await prisma.fabricType.upsert({
      where: { code: fab.code },
      update: {},
      create: {
        id: fab.id,
        code: fab.code,
        weightOz: fab.weightOz,
        composition: fab.composition,
        stretchType: fab.stretchType,
      },
    });
  }

  // 4. Colors
  for (const col of INITIAL_COLORS) {
    await prisma.colorOption.upsert({
      where: { code: col.code },
      update: {},
      create: {
        id: col.id,
        code: col.code,
        name: col.name,
        colorFamily: col.colorFamily,
      },
    });
  }

  // 5. Fabric-Color Matrix (BR-04)
  for (const rule of INITIAL_FABRIC_COLOR_RULES) {
    await prisma.fabricColorRule.upsert({
      where: {
        fabricTypeId_colorId: {
          fabricTypeId: rule.fabricTypeId,
          colorId: rule.colorId,
        },
      },
      update: { isAllowed: rule.isAllowed },
      create: {
        id: rule.id,
        fabricTypeId: rule.fabricTypeId,
        colorId: rule.colorId,
        isAllowed: rule.isAllowed,
      },
    });
  }

  // 6. Fabric Lots
  for (const lot of INITIAL_FABRIC_LOTS) {
    await prisma.fabricLot.upsert({
      where: { lotNo: lot.lotNo },
      update: {},
      create: {
        id: lot.id,
        fabricTypeId: lot.fabricTypeId,
        colorId: lot.colorId,
        lotNo: lot.lotNo,
        availableMeters: lot.availableMeters,
        shrinkagePercent: lot.shrinkagePercent,
      },
    });
  }

  // 7. Styles
  for (const s of INITIAL_STYLES) {
    await prisma.style.upsert({
      where: { styleCode: s.styleCode },
      update: {},
      create: {
        id: s.id,
        styleCode: s.styleCode,
        name: s.name,
        fitType: s.fitType,
        defaultTemplateId: s.defaultTemplateId,
      },
    });
  }

  // 8. QC Profiles (BR-19)
  for (const qp of INITIAL_QC_PROFILES) {
    await prisma.qCProfile.upsert({
      where: {
        styleId_profileType: {
          styleId: qp.styleId,
          profileType: qp.profileType,
        },
      },
      update: {},
      create: {
        id: qp.id,
        styleId: qp.styleId,
        profileType: qp.profileType,
        maxShrinkagePercent: qp.maxShrinkagePercent,
        maxColorFadingLevel: qp.maxColorFadingLevel,
        isActive: qp.isActive,
      },
    });
  }

  // 9. Workflow Template & Version
  await prisma.workflowTemplate.upsert({
    where: { id: INITIAL_WORKFLOW_TEMPLATE.id },
    update: {},
    create: {
      id: INITIAL_WORKFLOW_TEMPLATE.id,
      name: INITIAL_WORKFLOW_TEMPLATE.name,
      status: INITIAL_WORKFLOW_TEMPLATE.status,
      currentVersionId: INITIAL_WORKFLOW_TEMPLATE.currentVersionId,
    },
  });

  await prisma.workflowVersion.upsert({
    where: {
      templateId_versionNo: {
        templateId: INITIAL_WORKFLOW_VERSION.templateId,
        versionNo: INITIAL_WORKFLOW_VERSION.versionNo,
      },
    },
    update: {},
    create: {
      id: INITIAL_WORKFLOW_VERSION.id,
      templateId: INITIAL_WORKFLOW_VERSION.templateId,
      versionNo: INITIAL_WORKFLOW_VERSION.versionNo,
      status: INITIAL_WORKFLOW_VERSION.status,
      publishedAt: new Date(),
    },
  });

  // Steps
  for (const step of INITIAL_WORKFLOW_VERSION.steps) {
    await prisma.stepDefinition.upsert({
      where: {
        versionId_code: {
          versionId: step.versionId,
          code: step.code,
        },
      },
      update: {},
      create: {
        id: step.id,
        versionId: step.versionId,
        code: step.code,
        name: step.name,
        stepType: step.stepType,
        stationType: step.stationType,
        isMandatory: step.isMandatory,
        requiresEvidence: step.requiresEvidence,
        conditionExpr: step.conditionExpr,
        maxRework: step.maxRework,
        sequenceOrder: step.sequenceOrder,
      },
    });
  }

  // Transitions
  for (const tr of INITIAL_WORKFLOW_VERSION.transitions) {
    await prisma.stepTransition.create({
      data: {
        id: tr.id,
        versionId: tr.versionId,
        fromStepCode: tr.fromStepCode,
        toStepCode: tr.toStepCode,
        conditionExpr: tr.conditionExpr,
        kind: tr.kind,
      },
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
