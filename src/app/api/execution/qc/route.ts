import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, stepCode, inspectorId, result, targetStepCodeForRework, shrinkageMeasured, fadingLevelMeasured, notes, defects } = body;

    const qcResponse = db.submitQc({
      orderId,
      stepCode,
      inspectorId: inspectorId || 'u-qc',
      result,
      targetStepCodeForRework,
      shrinkageMeasured,
      fadingLevelMeasured,
      notes,
      defects,
    });

    if (!qcResponse.success) {
      return NextResponse.json({ success: false, error: qcResponse.error }, { status: 422 });
    }

    return NextResponse.json({ success: true, message: 'Đã lưu kết quả kiểm định QC thành công!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
