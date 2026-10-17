import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import db from '@/lib/db';
import { z } from 'zod';

const LoginSchema = z.object({
  email: z.string().email('Email không đúng định dạng'),
  password: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Dữ liệu đăng nhập không hợp lệ', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // Check Prisma PostgreSQL first if connected
    let user = null;
    try {
      user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
    } catch {
      // Fallback to in-memory store
      user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Tài khoản không tồn tại trong hệ thống. Vui lòng kiểm tra lại email hoặc đăng ký.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        stationId: user.stationId,
      },
      message: `Đăng nhập thành công với vai trò ${user.role}!`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
