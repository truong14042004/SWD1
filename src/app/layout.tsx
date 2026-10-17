import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DenimFlow — Hệ Thống Quản Lý Sản Xuất May Quần Jean',
  description: 'Hệ thống điều hành sản xuất và gia công may quần Jean chuyên nghiệp cho nhà máy và xưởng may',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-slate-50 antialiased">{children}</body>
    </html>
  );
}
