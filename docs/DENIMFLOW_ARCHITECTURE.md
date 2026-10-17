# DenimFlow BO — Kiến Trúc Hệ Thống & Đặc Tả Nghiệp Vụ (V2.0)

Hệ thống **Back Office (BO)** nội bộ của xưởng gia công may quần Jean ứng dụng kiến trúc **Dynamic Workflow Engine** (động, theo hướng dữ liệu).

---

## 1. Mục Tiêu & Vấn Đề Giải Quyết
- **Quy trình may linh hoạt (Dynamic Workflow)**: Mỗi mã hàng (Jean trơn, Jean wash, Jean rách, thêu, custom...) có quy trình khác nhau. Quy trình được lưu dưới dạng dữ liệu (`WorkflowTemplate`, `WorkflowVersion`, `StepDefinition`, `StepTransition`), thay đổi bằng cấu hình mà không cần deploy lại code.
- **Kiểm soát Fabric–Color Matrix (BR-04)**: Ngăn ngừa lỗi chọn sai cặp vải - màu (độ co giãn, trọng lượng oz, thành phần sợi) làm hỏng cả lô hàng.
- **Kiểm soát WIP (Work In Progress)**: Theo dõi chặt chẽ tiến độ theo từng bó bán thành phẩm (Bundle) qua các trạm.
- **Bảo toàn số lượng (BR-08)**: $Số\_vào\_step\_sau \le Số\_đạt\_step\_trước$. Chênh lệch phải khớp với số lượng lỗi hoặc hao hụt.
- **Chốt chặn (Gatekeeper - BR-14)**: Công đoạn sau chỉ mở khi công đoạn trước hoàn thành, đủ số lượng, có minh chứng (ảnh/phiếu) và QC đạt.
- **Audit Log bất biến (BR-16)**: Lưu vết mọi chuyển trạng thái, đổi workflow, cập nhật số lượng.

---

## 2. Các Vai Trò (7 RBAC Roles)
1. **Admin**: Quản trị tài khoản, danh mục vải, màu, Fabric-Color Matrix, xem Audit Log toàn hệ thống.
2. **Process Engineer (Workflow Designer)**: Thiết kế và công bố Workflow Template, duyệt yêu cầu đổi workflow khi đang chạy (BR-13), thẩm định đơn custom (BR-17).
3. **Production Planner**: Tiếp nhận đơn, chọn vải - màu, tính BOM, snapshot workflow, chia lô/bundle, quản lý tiến độ, xử lý ngoại lệ (Hold, Cancel, Custom Review).
4. **Warehouse Keeper**: Quản lý kho vải theo lô (`FabricLot`) & phụ liệu, kiểm tra tồn kho, giữ chỗ (allocate) theo BOM.
5. **Station Operator**: Tổ trưởng công đoạn (Cắt, May, Thêu, Nhuộm, Wash, Hoàn thiện). Nhận việc theo Station Worklist, bấm Bắt đầu/Hoàn tất, nhập số lượng Đạt/Lỗi theo Bundle, đính kèm minh chứng.
6. **QC Inspector**: Kiểm định chất lượng theo checklist/AQL, quyết định Pass / Rework / Reject, ghi nhận Defect theo Bundle. Đánh giá co rút/phai màu theo QC Profile.
7. **Manager**: Xem Dashboard WIP, báo cáo tiến độ, tỷ lệ lỗi, thời gian chu kỳ các trạm.

---

## 3. Quy Trình 14 Công Đoạn Chuẩn & Nhánh Custom
| STT | Mã Step | Tên Công Đoạn | Phụ Trách | Loại | Điều Kiện & Gate |
|---|---|---|---|---|---|
| 1 | `ORDER_CONFIRM` | Tiếp nhận & Xác nhận đơn | Planner | APPROVAL | Đủ thông tin size run, Style. Nếu bỏ giặt sạch thì bắt buộc đính kèm văn bản khách ký (BR-19). |
| C | `CUSTOM_REVIEW` | Đánh giá khả thi & tạo workflow riêng | Planner + Process Eng | APPROVAL | Chỉ chạy khi đơn có yêu cầu custom. Bất khả thi thì Cancel; khả thi thì clone workflow riêng và bắt buộc duyệt mẫu (BR-17). |
| 2 | `FABRIC_COLOR_SELECT`| Chọn vải & màu | Planner | SELECTION | Cặp vải–màu phải hợp lệ theo Fabric-Color Matrix (BR-04). |
| 3 | `BOM_ALLOCATE` | Tính BOM & Cấp vật tư | Planner + Thủ kho | MATERIAL | Vật tư được allocate đủ từ các FabricLot (BR-06). |
| 4 | `FABRIC_INSPECT` | Kiểm vải đầu vào / Thử co rút | QC Inspector | QC | Tuỳ chọn. Độ co rút trong ngưỡng cho phép. |
| 5 | `PP_SAMPLE` | Duyệt mẫu tiền sản xuất | Planner + QC | APPROVAL | Tuỳ chọn (bắt buộc với đơn custom). |
| 6 | `CUTTING` | Trải vải & Cắt | Tổ Cắt | PRODUCTION | Khóa vải-màu-wash (BR-05). Số lượng cắt theo dung sai (BR-07). Sinh mã Bundle. |
| 7 | `EMBROIDERY` | Thêu / In | Tổ Thêu | PRODUCTION | Có điều kiện (chỉ chạy nếu Style có yêu cầu thêu). |
| 8 | `SEWING` | May | Tổ May | PRODUCTION | Có thể chia sub-workflow (may túi, ráp thân, ráp đáy, gắn lưng). Bảo toàn số lượng (BR-08). |
| 9 | `DYEING` | Nhuộm | Tổ Nhuộm | PRODUCTION | Có điều kiện (`dyeRequired=true`). Chế độ: TOTAL (tổng thể) hoặc PARTIAL (cục bộ). Đối chiếu số lượng gửi/nhận (BR-09). |
| 10 | `EFFECT_WASH` | Wash hiệu ứng (giặt mài) | Tổ Wash | PRODUCTION | Có điều kiện (`washType != 'NONE'`). Đối chiếu số lượng gửi/nhận nếu thuê ngoài. |
| 11 | `CLEAN_WASH` | Giặt sạch | Tổ Wash | PRODUCTION | **Mặc định chạy**. Nếu khách bỏ qua để giảm giá thành (BR-18): chuyển SKIPPED, áp dụng QC Profile `SKIP_CLEAN_WASH` (BR-19). |
| 12 | `FINISHING` | Hoàn thiện (cắt chỉ, ủi, tag) | Tổ Hoàn thiện | PRODUCTION | Cần minh chứng hình ảnh/phiếu (BR-15). |
| 13 | `FINAL_QC` | QC cuối | QC Inspector | QC | Kiểm tra theo AQL và ngưỡng của QC Profile (`FULL_PROCESS` hoặc `SKIP_CLEAN_WASH`). Pass, Rework (về step trước) hoặc Reject. |
| 14 | `PACK_HANDOVER` | Đóng gói & Bàn giao | Planner / Đóng gói | PRODUCTION | Lập Packing list & Biên bản bàn giao có ghi rõ QC Profile đã áp dụng. |

---

## 4. 19 Quy Tắc Nghiệp Vụ Bắt Buộc (Business Rules)
- **BR-01**: Validate Workflow Template trước khi publish: đúng 1 step bắt đầu, có step kết thúc, không có step mồ côi, rework có giới hạn số lần.
- **BR-02**: Workflow Version là bất biến (`IMMUTABLE`). Sửa template sinh version mới.
- **BR-03**: Khi Confirm đơn, chụp snapshot version đang `PUBLISHED`.
- **BR-04**: Chọn màu bắt buộc theo `Fabric–Color Matrix`.
- **BR-05**: Khi step `CUTTING` bắt đầu, vải–màu–wash bị khóa chặt.
- **BR-06**: Không bắt đầu `CUTTING` nếu vải chưa được allocate đủ theo BOM.
- **BR-07**: Số lượng cắt không vượt kế hoạch + dung sai cho phép.
- **BR-08**: Bảo toàn số lượng: $Số\_vào\_step\_sau \le Số\_đạt\_step\_trước$.
- **BR-09**: Wash/Nhuộm thuê ngoài phải đối chiếu số gửi và số nhận về.
- **BR-10**: QC Fail hoặc Rework bắt buộc chọn step quay lại và ghi lý do. Giới hạn `maxRework`.
- **BR-11**: Phân tách trách nhiệm: người thực hiện step không được tự QC cho chính step đó.
- **BR-12**: Hủy đơn (Cancel) bắt buộc có lý do. Từ CUTTING trở đi phải ghi nhận chi phí chìm.
- **BR-13**: Đổi workflow khi đang chạy chỉ áp dụng cho step chưa bắt đầu, không được bỏ step bắt buộc, cần Process Engineer duyệt.
- **BR-14**: Gatekeeper: Step chỉ mở khi toàn bộ step tiền nhiệm hoàn thành và Gate đạt.
- **BR-15**: Step yêu cầu minh chứng bắt buộc có file đính kèm.
- **BR-16**: Mọi chuyển trạng thái, thay đổi workflow, nhập số lượng đều ghi `AuditLog` bất biến.
- **BR-17**: Đơn custom phải qua `CUSTOM_REVIEW` đánh giá khả thi, clone workflow riêng và bắt buộc duyệt mẫu `PP_SAMPLE`.
- **BR-18**: Giặt sạch mặc định chạy. Khách bỏ qua phải có lý do & chuyển QC Profile sang `SKIP_CLEAN_WASH`.
- **BR-19**: Quản lý 2 QC Profile (`FULL_PROCESS`, `SKIP_CLEAN_WASH`). Đơn bỏ giặt sạch phải đính kèm văn bản khách ký xác nhận trước khi Confirm.

---

## 5. Design Patterns Ứng Dụng
1. **State Pattern**: Quản lý vòng đời `ProductionOrder` (`DRAFT` $\to$ `CONFIRMED` $\to$ `IN_PRODUCTION` $\to$ `COMPLETED` / `ON_HOLD` / `CANCELLED`) và `StepInstance` (`PENDING` $\to$ `READY` $\to$ `IN_PROGRESS` $\to$ `WAITING_QC` $\to$ `DONE` / `REWORK` / `SKIPPED`).
2. **Chain of Responsibility**: Chuỗi chốt chặn `Gatekeeper` (PredecessorGate $\to$ QuantityGate $\to$ EvidenceGate $\to$ QCGate).
3. **Strategy Pattern**: Đánh giá Condition của Step Transition và tính toán định mức BOM & áp dụng ngưỡng kiểm định QC Profile.
4. **Factory Method**: Tạo các `StepHandler` theo từng `stepType` (SELECTION, MATERIAL, PRODUCTION, QC, APPROVAL).
5. **Observer Pattern**: Bắn Domain Events (`StepCompleted`, `StepBlocked`, `QcFailed`, `WorkflowChanged`) tự động kích hoạt tạo `AuditLog` và bắn thông báo.
