import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createPayOSPaymentLink, isPayOSConfigured } from '@/lib/payos';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, stage = 'DEPOSIT' } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Thiếu mã đơn hàng (orderId)' }, { status: 400 });
    }

    const order = db.getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy đơn hàng' }, { status: 404 });
    }

    // Calculate required amount
    const totalOrderAmount =
      order.totalAmount ||
      order.sizeLines.reduce((s, l) => s + l.plannedQty, 0) * 150000;
    
    let amount = 0;
    let descPrefix = 'COC';
    if (stage === 'FINAL_SETTLEMENT') {
      descPrefix = 'TT';
      const remaining = totalOrderAmount - (order.paidAmount || 0);
      amount = remaining > 0 ? remaining : totalOrderAmount;
    } else {
      // Deposit stage (50%)
      amount = order.depositAmount || Math.round(totalOrderAmount * 0.5);
    }

    // Format description strictly: alphanumeric, <= 25 chars (PayOS restriction)
    const cleanOrderNumber = order.orderNumber.replace(/[^a-zA-Z0-9]/g, '');
    const description = `${descPrefix} ${cleanOrderNumber}`.slice(0, 25);

    // Call PayOS or Sandbox VietQR generator
    const linkResult = await createPayOSPaymentLink({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount,
      description,
      stage,
      buyerName: 'Brand Buyer (DenimLab Ltd)',
      buyerEmail: 'buyer@denimlab.vn',
      buyerPhone: '0908889999',
    });

    // Update DB with generated payment code and QR
    db.setOrderPaymentInfo(order.id, {
      orderCode: linkResult.orderCode,
      paymentLinkId: linkResult.paymentLinkId,
      paymentQrUrl: linkResult.qrCode,
      paymentCheckoutUrl: linkResult.checkoutUrl,
    });

    return NextResponse.json({
      success: true,
      data: {
        ...linkResult,
        orderId: order.id,
        orderNumber: order.orderNumber,
        stage,
        totalOrderAmount,
        paidAmount: order.paidAmount || 0,
        isConfigured: isPayOSConfigured(),
      },
    });
  } catch (error: any) {
    console.error('Error creating PayOS payment link:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
