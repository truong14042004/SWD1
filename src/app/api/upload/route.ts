import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'waivers';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy tệp tải lên' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename and create timestamped name
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const savedFileName = `${timestamp}_${cleanFileName}`;

    let fileUrl = '';

    // Attempt to write to public/uploads directory if writable (local dev/server)
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
      const filePath = path.join(uploadDir, savedFileName);
      await writeFile(filePath, buffer);
      fileUrl = `/uploads/${folder}/${savedFileName}`;
    } catch {
      // In serverless environments (like Vercel read-only filesystem), encode as base64 Data URL
      const base64 = buffer.toString('base64');
      fileUrl = `data:${file.type || 'application/octet-stream'};base64,${base64}`;
    }

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: file.name,
      size: file.size,
      mimeType: file.type,
      message: 'Tải tệp lên thành công!',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
