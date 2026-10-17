import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const CreateOrderSchema = z.object({
  orderNumber: z.string().min(1),
  styleId: z.string().min(1),
  fabricTypeId: z.string().min(1),
  colorId: z.string().min(1),
  washType: z.string().optional(),
  dyeRequired: z.boolean().optional(),
  dyeMode: z.enum(['TOTAL', 'PARTIAL']).optional(),
  dyeSource: z.enum(['INTERNAL', 'OUTSOURCED']).optional(),
  skipCleanWash: z.boolean().optional(),
  isCustom: z.boolean().optional(),
  dueDate: z.string(),
  sizeLines: z.array(
    z.object({
      size: z.string(),
      plannedQty: z.number().int().positive(),
    })
  ).min(1),
  actorId: z.string(),
  acknowledgementFileUrl: z.string().optional(),
  acknowledgementBy: z.string().optional(),
});

export async function GET() {
  try {
    const orders = db.getOrders();
    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Dữ liệu không hợp lệ', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const result = db.createOrder(parsed.data);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 422 });
    }

    return NextResponse.json({ success: true, data: result.order });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
