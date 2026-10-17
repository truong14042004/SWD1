import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DenimFlow BO — Hệ Thống May Jean Dynamic Workflow',
  description: 'Back Office gia công may quần Jean với Dynamic Workflow, PostgreSQL, Clean Architecture & RBAC',
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
