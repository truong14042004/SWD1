import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');
    const orderCode = searchParams.get('orderCode');

    let order = null;
    if (orderId) {
      order = db.getOrderById(orderId);
    } else if (orderCode) {
      order = db.getOrderByOrderCode(Number(orderCode));
    }

    if (!order) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy đơn hàng' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus || 'UNPAID',
        totalAmount: order.totalAmount || 0,
        depositAmount: order.depositAmount || 0,
        paidAmount: order.paidAmount || 0,
        payosOrderCode: order.payosOrderCode,
        paymentTransactions: order.paymentTransactions || [],
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
