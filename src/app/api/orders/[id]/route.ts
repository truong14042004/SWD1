import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const order = db.getOrderById(params.id);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy đơn hàng' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const action = body.action;

    if (action === 'CONFIRM') {
      const result = db.confirmOrder(params.id, body.actorId || 'u-planner');
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 422 });
      }
      return NextResponse.json({ success: true, message: 'Đơn hàng đã được xác nhận và snapshot workflow thành công!' });
    }

    if (action === 'ALLOCATE_MATERIAL') {
      const result = db.allocateMaterial(
        params.id,
        body.bomLineId,
        body.fabricLotId,
        body.allocatedQty,
        body.actorId || 'u-wh'
      );
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 422 });
      }
      return NextResponse.json({ success: true, message: 'Đã giữ chỗ và cấp phát vật tư thành công!' });
    }

    return NextResponse.json({ success: false, error: 'Hành động không hợp lệ' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
