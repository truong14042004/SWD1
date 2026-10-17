import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import db from '@/lib/db';
import { z } from 'zod';
import { UserRole } from '@/types';

const RegisterSchema = z.object({
  fullName: z.string().min(2, 'Họ và tên tối thiểu 2 ký tự'),
  email: z.string().email('Email không đúng định dạng'),
  password: z.string().min(4, 'Mật khẩu tối thiểu 4 ký tự').optional(),
  role: z.enum([
    'ADMIN',
    'PROCESS_ENGINEER',
    'PRODUCTION_PLANNER',
    'WAREHOUSE_KEEPER',
    'STATION_OPERATOR',
    'QC_INSPECTOR',
    'MANAGER',
  ]),
  stationId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Dữ liệu đăng ký không hợp lệ', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { fullName, email, role, stationId } = parsed.data;
    const lowerEmail = email.toLowerCase();

    // Check if user already exists
    let existing = null;
    try {
      existing = await prisma.user.findUnique({ where: { email: lowerEmail } });
    } catch {
      existing = db.users.find((u) => u.email.toLowerCase() === lowerEmail);
    }

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác.' },
        { status: 409 }
      );
    }

    const newUser = {
      id: `u-${Date.now()}`,
      fullName,
      email: lowerEmail,
      role: role as UserRole,
      stationId: stationId || (role === 'STATION_OPERATOR' ? 'st-cutting' : undefined),
    };

    // Save to PostgreSQL if connected
    try {
      await prisma.user.create({
        data: {
          id: newUser.id,
          fullName: newUser.fullName,
          email: newUser.email,
          role: newUser.role,
          stationId: newUser.stationId,
        },
      });
    } catch (dbErr) {
      console.warn('Prisma create failed, saving to local store:', dbErr);
    }

    // Save to in-memory store
    db.users.push(newUser);

    return NextResponse.json({
      success: true,
      data: newUser,
      message: 'Đăng ký tài khoản thành công! Bạn có thể sử dụng ngay.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
