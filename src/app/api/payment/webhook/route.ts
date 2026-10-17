import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPayOSWebhook } from '@/lib/payos';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Verify webhook payload
    const verification = await verifyPayOSWebhook(body);
    if (!verification.isValid || !verification.data) {
      return NextResponse.json(
        { success: false, error: verification.error || 'Xác thực chữ ký webhook không hợp lệ' },
        { status: 400 }
      );
    }

    const { orderCode, amount, reference, description } = verification.data;

    // Detect if this is deposit or final settlement based on description or existing order status
    let stage: 'DEPOSIT' | 'FINAL_SETTLEMENT' = 'DEPOSIT';
    if (description && (description.toUpperCase().includes('TT') || description.toUpperCase().includes('FINAL'))) {
      stage = 'FINAL_SETTLEMENT';
    }

    // Process payment success in DB
    const result = db.processPaymentSuccess(
      Number(orderCode),
      Number(amount),
      reference || `PAYOS-${Date.now().toString().slice(-6)}`,
      stage,
      'PayOS Webhook'
    );

    if (!result.success) {
      console.warn('[PayOS Webhook] Order not matched:', result.error);
      return NextResponse.json({ success: false, error: result.error }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Xử lý thanh toán PayOS thành công!',
      order: {
        id: result.order?.id,
        orderNumber: result.order?.orderNumber,
        status: result.order?.status,
        paymentStatus: result.order?.paymentStatus,
        paidAmount: result.order?.paidAmount,
      },
    });
  } catch (error: any) {
    console.error('Error handling PayOS webhook:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
