# Work_flow_QLDAPM_C.md — Thành viên C — Môn Quản lý dự án phần mềm

> File này dành cho AI agent. Đọc hết trước khi sửa code hoặc tạo file. Nguồn: `QLDAPM_PhanCong.docx`.
> Mục có nhãn **(suy ra)** hoặc **(chưa quy định)** không có trong tài liệu phân công gốc. Không coi đó là yêu cầu chắc chắn; hỏi lại khi cần.
> Cùng codebase với môn PTPMDV (xem các file `Work_flow_PTPMDV_*.md`). Không đổi cổng, envelope, tên trường hay cấu trúc thư mục chung.

---

## 0. Tóm tắt nhanh

| Mục | Nội dung |
|---|---|
| Môn | Quản lý dự án phần mềm |
| Thành viên nhóm | A (nhóm trưởng), B, C |
| Phần C sở hữu | `backend/work-service` (4003) + `backend/integration-service` (4005) |
| Chức năng chính | Ca làm việc, chấm công, tác vụ; SOAP ngân hàng, yêu cầu, thông báo, bảng tin, nội quy, Wi-Fi |

---

## 1. Phạm vi: được sửa và không được sửa

### Được sửa (thuộc C)
- `backend/work-service/` (cổng 4003): Ca làm việc, chấm công, tác vụ
- `backend/integration-service/` (cổng 4005): SOAP ngân hàng, yêu cầu, thông báo, bảng tin, nội quy, Wi-Fi

### Không sửa (thuộc thành viên khác)
| Thư mục | Cổng | Chủ sở hữu | Chức năng chính |
|---|---|---|---|
| `backend/api-gateway/`, `backend/identity-service/`, `mobile/`, `docker-compose.yml` | 4000, 4001 | A | Gateway, xác thực, mobile, compose |
| `backend/organization-service/` | 4002 | B | Chi nhánh, phòng ban, nhân sự |
| `backend/payroll-service/` | 4004 | B | Tài khoản công ty, lệnh chi, phiếu lương |

Nếu cần thay đổi ở phần của người khác (thiếu endpoint, sai schema, sai envelope), không tự sửa. Ghi lại vấn đề, nêu rõ service, endpoint, kỳ vọng và thực tế, rồi báo cho C để trao đổi với chủ phần đó.

---

## 2. Chuẩn kỹ thuật bắt buộc

### 2.1 Cấu trúc service
Mỗi service nằm trong `backend/<service-name>/` gồm:

```
config/
src/api/
src/domain/
src/services/
src/infrastructure/
tests/
.env.example
Dockerfile
server.js
```

### 2.2 Định dạng response
- Thành công: `{ "data": ... }`
- Lỗi: `{ "error": { "code": "...", "message": "..." } }`

### 2.3 Health check
Mỗi service có `GET /health`, trả:

```json
{ "status": "ok", "service": "<service-name>", "time": "<thời gian hiện tại>" }
```

### 2.4 Gọi liên service
Tài liệu QLDAPM không nêu ràng buộc riêng. Vì cùng codebase với môn PTPMDV, nên tuân thủ **(suy ra)**: gọi liên service qua HTTP, timeout tối đa 5000ms, không import chéo mã nguồn giữa các service.

---

## 3. Git workflow

- Nhánh gốc làm việc: `dev`.
- Tạo nhánh theo mẫu `feat/<service>-<tên>` (ví dụ `feat/work-attendance`, `feat/integration-soap`).
- Xong thì tạo PR về `dev`.
- **Không commit thẳng vào `dev` hoặc `main`.**
- Mỗi PR nên gọn theo một service hoặc một chức năng.

---

## 4. Danh sách việc của C

### Task 1 — work-service (cổng 4003)
- [ ] **Shifts:** `GET /api/shifts`, `POST /api/shifts`.
- [ ] **Attendance:** `GET /api/attendance?employeeId=&month=YYYY-MM`, `POST` checkin và checkout kèm tính phạt (`penaltyAmount`, `penaltyNote`, `status` là `present`/`absent`/`late`/`early_leave`).
- [ ] **Tasks:** `GET`, `POST`, `PUT`, `DELETE`.
- [ ] `GET /health`.

### Task 2 — integration-service (cổng 4005)
- [ ] **Requests:** `GET`, `POST`, `PUT` approve/reject (duyệt hoặc từ chối tự sinh thông báo), `DELETE` khi đang `pending`.
- [ ] **Notifications:** `GET` (gồm cả broadcast), `POST`, `PUT` read, `DELETE`.
- [ ] **SOAP:** `GET /soap/payroll?wsdl` và `POST /soap/payroll` (nhận `PayoutRequest`, trả `PayoutResponse`, lỗi trả `soap:Fault`).
- [ ] **Bảng tin:** `GET /api/news`, `GET /api/news/:id`, `POST /api/news`, `PUT /api/news/:id`, `DELETE /api/news/:id` (tạo/sửa/xóa: `admin`/`manager`).
- [ ] **Nội quy:** `GET /api/regulations`, `GET /api/regulations/:id`, `POST`, `PUT`, `DELETE`.
- [ ] **Wi-Fi chấm công:** `GET /api/wifi-configs?branch=`, `POST`, `PUT /api/wifi-configs/:id`, `DELETE`.
- [ ] `GET /health`.

---

## 5. Schema dữ liệu liên quan (phải khớp)

Mục "Dữ liệu và khuôn mẫu thống nhất" của tài liệu phân công là chuẩn chung. Không tự đổi tên trường.

- **Attendance:** `id, employeeId, shiftId, date (DD-MM-YYYY), checkIn, checkOut, penaltyAmount, penaltyNote, status (present/absent/late/early_leave)`
- **Yêu cầu nội bộ:** `id, type (leave/overtime/advance/other), employeeId, branchSlug, title, content, attachmentUrl, status (pending/approved/rejected), reviewedBy, reviewNote, createdAt, updatedAt`
- **Thông báo:** `id, targetEmployeeId (null là gửi toàn hệ thống), branchSlug, title, body, isRead, createdAt`
- **Bảng tin:** `id, title, summary, content, author, date, tag, tagTone (danger/warning/success/primary/gray), pinned`
- **Nội quy:** `id, code, title, category, summary, content, status, scope (Toàn công ty hoặc mã chi nhánh), effectiveDate, expiryDate, author, createdAt`
- **Wi-Fi chấm công:** `id, ssid, bssid, branch (mã chi nhánh), status`
- **Khuôn SOAP:** `POST /soap/payroll` nhận `PayoutRequest (idempotencyKey, debitAccount, content, totalAmount, beneficiaryCount)`, trả `PayoutResponse (transactionId (TXN-xxxxxx), bankReference (BANK-xxxxxxxx), status)`. Lỗi trả `soap:Fault` với `faultcode = soap:Client` và `faultstring` mô tả lỗi (ví dụ: Số dư không đủ).

Ghi chú: schema của Shift và Task không có trong mục chung (xem mục 9).

Ghi chú định dạng ngày: `Attendance.date` dùng `DD-MM-YYYY`, `Payslip.month` dùng `MM-YYYY`, query attendance dùng `month=YYYY-MM`. Ba định dạng này khác nhau, chú ý khi parse và sinh dữ liệu.

---

## 6. Phụ thuộc và phối hợp

- Mọi request từ web và mobile đi qua `api-gateway` (4000) của A. Client không gọi thẳng vào service của bạn.
- Đăng nhập và phiên `hrm-session` do `identity-service` (4001) của A xử lý.
- **B (payroll-service, 4004):** SOAP của bạn trả `transactionId` và `bankReference` dạng `TXN-xxxxxx`, `BANK-xxxxxxxx`, trùng với payout của B. Cách tạo lệnh chi là gọi REST payout của B qua HTTP **(suy ra)**. Lỗi hết số dư của B (422) cần được chuyển thành `soap:Fault` với `faultcode = soap:Client`.
- **B (payroll-service):** dữ liệu chấm công của bạn (`penaltyAmount`) là đầu vào để B sinh phiếu lương. Giữ `GET /api/attendance?employeeId=&month=YYYY-MM` ổn định.
- **A:** cần route `/api/shifts`, `/api/attendance`, `/api/tasks`, `/api/requests`, `/api/notifications`, `/api/news`, `/api/regulations`, `/api/wifi-configs` và `/soap/payroll` cấu hình trên gateway. Đường dẫn tasks, requests, notifications là **(suy ra)**, cần thống nhất với A.

---

## 7. Mốc kiểm tra

| Mốc | Việc của C |
|---|---|
| 1 | Xong work-service |
| 2 | Xong requests, notifications, SOAP, bảng tin, nội quy, Wi-Fi |

Mốc đầu tiên của A là gateway + identity. Cần bám sát để chạy được qua gateway khi tích hợp.

---

## 8. Nghiệm thu (Definition of Done)

- Chấm công tính phạt đúng.
- Tác vụ, yêu cầu, thông báo đầy đủ.
- WSDL và SOAP chạy được.
- CRUD bảng tin, nội quy, Wi-Fi đúng envelope.

### Checklist trước khi mở PR
- [ ] Đúng cấu trúc thư mục service (mục 2.1).
- [ ] Response đúng envelope `{data}` hoặc `{error: {code, message}}`.
- [ ] Có `GET /health`.
- [ ] Có `.env.example` và `Dockerfile`.
- [ ] Duyệt/từ chối yêu cầu tự sinh thông báo; chỉ xóa yêu cầu khi `pending`.
- [ ] `GET /soap/payroll?wsdl` trả WSDL; lỗi trả `soap:Fault` với `faultcode = soap:Client`.
- [ ] Tạo/sửa/xóa bảng tin chỉ cho `admin`/`manager`.
- [ ] Nhánh đặt tên `feat/<service>-<tên>`, PR về `dev`.
- [ ] Không sửa file thuộc phần của người khác.

---

## 9. Điểm chưa quy định

Các mục sau không có trong tài liệu phân công. Không tự quyết định rồi coi như đã chốt. Hỏi A (nhóm trưởng) hoặc ghi rõ giả định trong PR.

- **Cơ sở dữ liệu và ORM:** tài liệu không nhắc Prisma, ORM hay loại CSDL nào. Lớp lưu trữ đặt trong `src/infrastructure`. Hỏi A trước khi chọn.
- **Cách service nhận danh tính người dùng (vai trò `admin`/`manager`/`staff`):** tài liệu chỉ nêu middleware `hrm-session` gắn `req.user` ở identity-service. Cách các service khác lấy được danh tính và vai trò chưa được quy định. Hỏi A trước khi làm phần phân quyền.
- **Luật tính phạt chấm công:** ngưỡng đi muộn, về sớm, vắng mặt và mức phạt không được nêu.
- **Schema Shift và Task:** không có trong mục schema chung.
- **Có bắt buộc kiểm tra Wi-Fi khi check-in hay không:** tài liệu chỉ nêu CRUD `wifi-configs`, không nêu cách dùng khi chấm công.
- **Đường dẫn chính xác của tasks, requests, notifications và thao tác approve/reject/read:** không được nêu.
- **Cấu trúc WSDL:** không được nêu chi tiết, chỉ cần `GET /soap/payroll?wsdl` chạy được.

---

## 10. Quy tắc làm việc cho agent

1. Đọc mục 1 trước. Chỉ sửa trong phạm vi của C.
2. Không tự bịa endpoint, tên trường hay hành vi. Nếu tài liệu không nêu, dùng nhãn **(suy ra)** và hỏi lại.
3. Bám đúng envelope, tên trường và định dạng ngày ở mục 5.
4. Không commit thẳng vào `dev` hoặc `main`. Mỗi thay đổi đi qua nhánh `feat/...` và PR về `dev`.
5. Không import chéo mã nguồn giữa các service. Muốn dùng dữ liệu của service khác thì gọi qua HTTP.
6. Sau mỗi thay đổi, kiểm tra `GET /health` và chạy test của service (`tests/`).
7. Khi báo kết quả, nói rõ đã chạy lệnh nào và kết quả ra sao. Không báo "pass" khi chưa chạy.
8. Ưu tiên theo thứ tự: work-service (mốc 1) trước, rồi integration-service (mốc 2).
