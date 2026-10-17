import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, orderId, stepCode, actorId } = body;

    if (action === 'START') {
      const result = db.startStep(orderId, stepCode, actorId || 'u-operator');
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 422 });
      }
      return NextResponse.json({ success: true, message: 'Đã bắt đầu công đoạn!' });
    }

    if (action === 'COMPLETE') {
      const { qtyGood, qtyDefect, evidenceUrl, evidenceNote } = body;
      const result = db.completeStep(orderId, stepCode, {
        qtyGood: Number(qtyGood) || 0,
        qtyDefect: Number(qtyDefect) || 0,
        evidenceUrl,
        evidenceNote,
        actorId: actorId || 'u-operator',
      });

      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 422 });
      }
      return NextResponse.json({ success: true, message: 'Công đoạn đã hoàn thành và mở step kế tiếp!' });
    }

    return NextResponse.json({ success: false, error: 'Hành động không hợp lệ' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
