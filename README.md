# DenimFlow BO — Hệ Thống Back Office May Quần Jean với Dynamic Workflow

> **Phiên bản**: 2.0  
> **Tech Stack**: Frontend React (Next.js 14) + Tailwind CSS, Backend TypeScript, Database PostgreSQL (Prisma ORM), Deploy Vercel.

---

## 📖 1. Giới Thiệu & Bài Toán Nghiệp Vụ
DenimFlow BO là hệ thống Back Office nội bộ của xưởng gia công may quần Jean, số hóa toàn bộ vòng đời đơn hàng gia công:
$$\text{Tiếp nhận đơn} \to \text{Chọn vải-màu} \to \text{Cấp vật tư} \to \text{Cắt} \to \text{May} \to \text{Nhuộm/Wash} \to \text{Giặt sạch} \to \text{Hoàn thiện} \to \text{QC} \to \text{Bàn giao}$$

### Vấn Đề Thực Tế
- **Mã hàng Jean đa dạng**: Jean trơn, Jean wash, Jean rách/thêu, đơn custom có chuỗi công đoạn khác nhau. Thay vì viết cứng quy trình trong code, hệ thống quản lý quy trình dưới dạng **Dynamic Workflow** (dữ liệu có thể cấu hình, publish version mà không cần sửa code).
- **Lỗi chọn cặp vải – màu**: Vải denim có trọng lượng (oz), độ co giãn (Rigid / Stretch). Chọn sai gây hỏng cả lô $\to$ Hệ thống áp dụng **Fabric–Color Matrix (BR-04)**.
- **Mất kiểm soát WIP (Work In Progress)**: Theo dõi tiến độ theo từng bó bán thành phẩm (Bundle) qua các trạm.
- **Chốt chặn (Gatekeeper)**: Công đoạn sau chỉ mở khi công đoạn trước đạt số lượng, minh chứng và QC.

---

## 🏛️ 2. Kiến Trúc 5 Design Patterns Cốt Lõi
1. **State Pattern** (`src/core/patterns/state.ts`):
   - `ProductionOrder`: `DRAFT` $\to$ `CONFIRMED` $\to$ `IN_PRODUCTION` $\to$ `COMPLETED` / `ON_HOLD` / `CANCELLED`.
   - `StepInstance`: `PENDING` $\to$ `READY` $\to$ `IN_PROGRESS` $\to$ `WAITING_QC` $\to$ `DONE` / `REWORK` / `SKIPPED`.
2. **Chain of Responsibility** (`src/core/patterns/chain.ts`):
   - Chuỗi kiểm soát Gatekeeper: `PredecessorGate` $\to$ `CuttingMaterialGate` (BR-06) $\to$ `EvidenceGate` (BR-15) $\to$ `QuantityConservationGate` (BR-08).
3. **Strategy Pattern** (`src/core/patterns/strategy.ts`):
   - Đánh giá biểu thức điều kiện rẽ nhánh (`washType != 'NONE'`, `dyeRequired == true`, `isCustom == true`).
   - Tính toán định mức BOM vải và phụ liệu theo size run.
   - Đánh giá ngưỡng co rút & phai màu theo **QC Profile** (`FULL_PROCESS` vs `SKIP_CLEAN_WASH` - BR-19).
4. **Factory Method** (`src/core/patterns/factory.ts`):
   - Khởi tạo Step Handler theo 5 loại step: `SELECTION`, `MATERIAL`, `PRODUCTION`, `QC`, `APPROVAL`.
5. **Observer Pattern** (`src/core/patterns/observer.ts`):
   - Bắn Domain Events (`STEP_COMPLETED`, `STEP_BLOCKED`, `QC_FAILED`, `WORKFLOW_CHANGED`) tự động ghi nhận vào `AuditLog` bất biến (BR-16).

---

## 👥 3. Phân Quyền 7 Vai Trò (RBAC)
- **Admin**: Quản trị tài khoản, danh mục, xem Audit Log toàn hệ thống.
- **Process Engineer**: Thiết kế, validate & publish Workflow Version, duyệt đổi workflow khi đang chạy (BR-13), thẩm định đơn custom (BR-17).
- **Production Planner**: Tiếp nhận đơn, chọn vải-màu, tính BOM, snapshot workflow version (BR-03), chia bundle, xử lý ngoại lệ.
- **Warehouse Keeper**: Quản lý kho vải theo lô (`FabricLot`), allocate vật tư theo BOM (BR-06).
- **Station Operator**: Tổ trưởng công đoạn (Cắt, May, Nhuộm, Wash, Hoàn thiện, Đóng gói) nhận việc, start/complete, nhập số lượng đạt/lỗi (BR-08), đính kèm minh chứng (BR-15).
- **QC Inspector**: Kiểm định chất lượng AQL, đánh giá co rút/phai màu theo QC Profile, điều hướng Rework (tối đa 3 lần - BR-10).
- **Manager**: Xem Dashboard WIP, báo cáo tỷ lệ lỗi, tiến độ các trạm.

---

## ⚙️ 4. Quy Trình 14 Công Đoạn Chuẩn & Nhánh Custom
1. `ORDER_CONFIRM`: Tiếp nhận & xác nhận đơn (Bắt buộc).
2. `CUSTOM_REVIEW`: Đánh giá khả thi & tạo workflow riêng (Nhánh custom - BR-17).
3. `FABRIC_COLOR_SELECT`: Chọn vải & màu theo ma trận (BR-04).
4. `BOM_ALLOCATE`: Tính định mức BOM & cấp vật tư (BR-06).
5. `FABRIC_INSPECT`: Kiểm tra vải đầu vào & thử co rút (Tuỳ chọn).
6. `PP_SAMPLE`: Duyệt mẫu tiền sản xuất (Bắt buộc với đơn custom).
7. `CUTTING`: Cắt vải, khóa vải-màu (BR-05), sinh mã Bundle.
8. `EMBROIDERY`: Thêu/In chi tiết (Tuỳ chọn).
9. `SEWING`: May ráp thành phẩm (Bảo toàn số lượng BR-08).
10. `DYEING`: Nhuộm thành phẩm (Tổng thể / Cục bộ).
11. `EFFECT_WASH`: Wash hiệu ứng (Stone, Enzyme, Acid wash).
12. `CLEAN_WASH`: Giặt sạch ổn định (Mặc định chạy; nếu bỏ qua phải có văn bản khách ký BR-18, BR-19).
13. `FINISHING`: Hoàn thiện (cắt chỉ, ủi, gắn tag, đính kèm minh chứng BR-15).
14. `FINAL_QC`: Kiểm định cuối kỳ theo QC Profile áp dụng.
15. `PACK_HANDOVER`: Đóng gói & lập biên bản bàn giao.

---

## 🚀 5. Hướng Dẫn Cài Đặt & Chạy Cục Bộ

### Yêu Cầu Môi Trường
- Node.js 18+ hoặc 20+
- PostgreSQL database (hoặc Neon / Supabase / Vercel Postgres)

### Các Bước Thực Hiện
```bash
# 1. Cài đặt dependencies
npm install

# 2. Cấu hình biến môi trường
cp .env.example .env
# Chỉnh sửa DATABASE_URL trong .env trỏ tới PostgreSQL của bạn

# 3. Tạo Schema & Seed dữ liệu vào PostgreSQL
npx prisma db push
npm run prisma:seed

# 4. Khởi chạy ứng dụng ở chế độ Development
npm run dev
```
Mở trình duyệt tại: [http://localhost:3000](http://localhost:3000)

---

## ☁️ 6. Hướng Dẫn Deploy Lên Vercel

Dự án được tối ưu hóa sẵn cho Vercel với file `vercel.json`:

### Cách 1: Deploy Bằng Vercel CLI
```bash
npx vercel
```
Làm theo các bước trên terminal để liên kết tài khoản Vercel.

### Cách 2: Deploy Bằng Git (Khuyên Dùng)
1. Đẩy mã nguồn lên GitHub / GitLab / Bitbucket:
```bash
git add .
git commit -m "feat: complete DenimFlow-BO system"
git remote add origin https://github.com/YOUR_USERNAME/denimflow-bo.git
git push -u origin main
```
2. Truy cập [vercel.com](https://vercel.com), bấm **Add New Project** $\to$ Chọn repository `denimflow-bo`.
3. Trong phần **Environment Variables**, thêm:
   - `DATABASE_URL`: Đường dẫn kết nối PostgreSQL của bạn (Ví dụ từ Vercel Storage Postgres, Neon, hoặc Supabase).
4. Bấm **Deploy**. Vercel sẽ tự động build và chạy ứng dụng chỉ sau 1 phút!

---

## 📁 7. Cấu Trúc Mã Nguồn
```
d:\etoai
├── docs/                             # Tài liệu đề xuất gốc & Kiến trúc đặc tả
│   ├── DenimFlow-BO_Proposal_V2.0_VI.docx
│   └── DENIMFLOW_ARCHITECTURE.md
├── prisma/
│   ├── schema.prisma                 # PostgreSQL Schema 20+ bảng dữ liệu
│   └── seed.ts                       # Dữ liệu khởi tạo chuẩn cho PostgreSQL
├── src/
│   ├── app/                          # Next.js App Router (React + Tailwind)
│   │   ├── api/                      # TypeScript REST API Route Handlers
│   │   │   ├── catalog/route.ts
│   │   │   ├── orders/route.ts
│   │   │   ├── orders/[id]/route.ts
│   │   │   ├── execution/step/route.ts
│   │   │   ├── execution/qc/route.ts
│   │   │   ├── workflow/route.ts
│   │   │   └── audit/route.ts
│   │   ├── globals.css               # Tailwind CSS styles
│   │   ├── layout.tsx
│   │   └── page.tsx                  # Main Interactive Dashboard
│   ├── components/                   # React UI Components
│   │   ├── Header.tsx                # Role switcher (7 RBAC roles) & DB status
│   │   ├── Sidebar.tsx               # Navigation menu
│   │   └── tabs/                     # Dashboard, Orders, Workflow, Worklist, QC, Inventory, Audit
│   ├── core/                         # Clean Architecture & 5 Design Patterns
│   │   └── patterns/
│   │       ├── state.ts              # State Pattern
│   │       ├── chain.ts              # Chain of Responsibility (Gatekeeper)
│   │       ├── strategy.ts           # Strategy Pattern (Condition, BOM, QC Profile)
│   │       ├── factory.ts            # Factory Method (Step Handlers)
│   │       └── observer.ts           # Observer Pattern (Domain EventBus & Audit)
│   ├── lib/
│   │   ├── prisma.ts                 # Prisma Client Singleton
│   │   ├── db.ts                     # Hybrid Data & Rule Engine
│   │   └── mockData.ts               # Default Seed Dataset
│   └── types/                        # Core TypeScript Domain Types
├── .env.example                      # Template cấu hình PostgreSQL
├── package.json                      # Next.js, React, Tailwind, Prisma dependencies
├── tsconfig.json                     # TypeScript strict configuration
└── vercel.json                       # Cấu hình tự động deploy Vercel
```
