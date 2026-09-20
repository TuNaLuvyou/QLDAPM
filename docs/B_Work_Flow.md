# Work_flow_QLDAPM_B.md — Thành viên B — Môn Quản lý dự án phần mềm

> File này dành cho AI agent. Đọc hết trước khi sửa code hoặc tạo file. Nguồn: `QLDAPM_PhanCong.docx`.
> Mục có nhãn **(suy ra)** hoặc **(chưa quy định)** không có trong tài liệu phân công gốc. Không coi đó là yêu cầu chắc chắn; hỏi lại khi cần.
> Cùng codebase với môn PTPMDV (xem các file `Work_flow_PTPMDV_*.md`). Không đổi cổng, envelope, tên trường hay cấu trúc thư mục chung.

---

## 0. Tóm tắt nhanh

| Mục | Nội dung |
|---|---|
| Môn | Quản lý dự án phần mềm |
| Thành viên nhóm | A (nhóm trưởng), B, C |
| Phần B sở hữu | `backend/organization-service` (4002) + `backend/payroll-service` (4004) |
| Chức năng chính | Chi nhánh, phòng ban, nhân sự; tài khoản công ty, lệnh chi, phiếu lương |

---

## 1. Phạm vi: được sửa và không được sửa

### Được sửa (thuộc B)
- `backend/organization-service/` (cổng 4002): Chi nhánh, phòng ban, nhân sự
- `backend/payroll-service/` (cổng 4004): Tài khoản công ty, lệnh chi, phiếu lương

### Không sửa (thuộc thành viên khác)
| Thư mục | Cổng | Chủ sở hữu | Chức năng chính |
|---|---|---|---|
| `backend/api-gateway/`, `backend/identity-service/`, `mobile/`, `docker-compose.yml` | 4000, 4001 | A | Gateway, xác thực, mobile, compose |
| `backend/work-service/` | 4003 | C | Ca làm việc, chấm công, tác vụ |
| `backend/integration-service/` | 4005 | C | SOAP ngân hàng, yêu cầu, thông báo, bảng tin, nội quy, Wi-Fi |

Nếu cần thay đổi ở phần của người khác (thiếu endpoint, sai schema, sai envelope), không tự sửa. Ghi lại vấn đề, nêu rõ service, endpoint, kỳ vọng và thực tế, rồi báo cho B để trao đổi với chủ phần đó.

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
- Tạo nhánh theo mẫu `feat/<service>-<tên>` (ví dụ `feat/organization-employees`, `feat/payroll-payouts`).
- Xong thì tạo PR về `dev`.
- **Không commit thẳng vào `dev` hoặc `main`.**
- Mỗi PR nên gọn theo một service hoặc một chức năng.

---

## 4. Danh sách việc của B

### Task 1 — organization-service (cổng 4002)
- [ ] CRUD **branches**: `GET /api/branches`, `GET /api/branches/:slug`, `POST`, `PUT`, `DELETE`.
- [ ] **departments**: `GET`, `POST`.
- [ ] CRUD **employees**: `GET /api/employees?branchSlug=`, `GET /api/employees/:id`, `POST`, `PUT`, `DELETE`.
- [ ] Validate email không trùng.
- [ ] Validate `role` thuộc `admin` / `manager` / `staff`.
- [ ] Phân quyền theo vai trò.
- [ ] `GET /health`.

### Task 2 — payroll-service (cổng 4004)
- [ ] `GET /api/payroll/bank-accounts`.
- [ ] `GET /api/payroll/payouts` và `POST /api/payroll/payouts` với `idempotencyKey`:
  - Trùng key: trả bản ghi cũ kèm `deduped: true`.
  - Sinh `id` dạng `TXN-xxxxxx` và `bankReference` dạng `BANK-xxxxxxxx`.
  - Hết số dư: trả HTTP `422`.
- [ ] `GET /api/payroll/payslips`.
- [ ] `POST /api/payroll/payslips/generate`: `netSalary = baseSalary - totalPenalty`; chống trùng cặp `employeeId` + `month`.
- [ ] `GET /health`.

---

## 5. Schema dữ liệu liên quan (phải khớp)

Mục "Dữ liệu và khuôn mẫu thống nhất" của tài liệu phân công là chuẩn chung. Không tự đổi tên trường.

- **Employee:** `id, name, email, phone, cccd, address, role, roleTitle, branchSlug, departmentId, baseSalary, bankName, bankAccount, startDate, status`
- **Payout:** `id (TXN-xxxxxx), bankReference (BANK-xxxxxxxx), debitAccount, totalAmount, content, beneficiaryCount, idempotencyKey, status, createdAt`
- **Payslip:** `id, employeeId, month (MM-YYYY), baseSalary, totalPenalty, netSalary (= baseSalary - totalPenalty), payoutId, status, issuedAt`
- **Khuôn SOAP:** `POST /soap/payroll` nhận `PayoutRequest (idempotencyKey, debitAccount, content, totalAmount, beneficiaryCount)`, trả `PayoutResponse (transactionId (TXN-xxxxxx), bankReference (BANK-xxxxxxxx), status)`. Lỗi trả `soap:Fault` với `faultcode = soap:Client` và `faultstring` mô tả lỗi (ví dụ: Số dư không đủ).

Ghi chú: schema của Branch, Department và tài khoản công ty không có trong mục chung (xem mục 9).

Ghi chú định dạng ngày: `Attendance.date` dùng `DD-MM-YYYY`, `Payslip.month` dùng `MM-YYYY`, query attendance dùng `month=YYYY-MM`. Ba định dạng này khác nhau, chú ý khi parse và sinh dữ liệu.

---

## 6. Phụ thuộc và phối hợp

- Mọi request từ web và mobile đi qua `api-gateway` (4000) của A. Client không gọi thẳng vào service của bạn.
- Đăng nhập và phiên `hrm-session` do `identity-service` (4001) của A xử lý.
- **C (work-service, 4003):** dữ liệu chấm công và phạt (`penaltyAmount`) nằm ở work-service. Việc sinh phiếu lương cần `totalPenalty` theo tháng. Nguồn dữ liệu này **(suy ra)** lấy từ `GET /api/attendance?employeeId=&month=YYYY-MM` của C qua HTTP. Xác nhận với C trước khi làm.
- **C (integration-service, 4005):** SOAP `POST /soap/payroll` của C trả `transactionId` và `bankReference`, khớp với payout của payroll-service. Cách C tạo lệnh chi qua payroll-service (gọi REST payout của bạn) **(suy ra)**. Giữ hành vi idempotent của payout nhất quán với SOAP.
- **A:** cần route `/api/branches`, `/api/departments`, `/api/employees`, `/api/payroll/*` cấu hình trên gateway.

---

## 7. Mốc kiểm tra

| Mốc | Việc của B |
|---|---|
| 1 | Xong organization-service |
| 2 | Xong payroll-service |

Mốc đầu tiên của A là gateway + identity. Cần bám sát để chạy được qua gateway khi tích hợp.

---

## 8. Nghiệm thu (Definition of Done)

- CRUD danh mục và nhân sự đúng envelope.
- Lệnh chi chống trùng đúng (`deduped: true`, hết số dư trả 422).
- Sinh phiếu lương đúng công thức, không trùng cặp `employeeId` + `month`.

### Checklist trước khi mở PR
- [ ] Đúng cấu trúc thư mục service (mục 2.1).
- [ ] Response đúng envelope `{data}` hoặc `{error: {code, message}}`.
- [ ] Có `GET /health`.
- [ ] Có `.env.example` và `Dockerfile`.
- [ ] Email trùng bị từ chối, `role` chỉ nhận `admin`/`manager`/`staff`.
- [ ] Payout trùng `idempotencyKey` trả bản ghi cũ kèm `deduped: true`.
- [ ] Payslip có `netSalary = baseSalary - totalPenalty`.
- [ ] Nhánh đặt tên `feat/<service>-<tên>`, PR về `dev`.
- [ ] Không sửa file thuộc phần của người khác.

---

## 9. Điểm chưa quy định

Các mục sau không có trong tài liệu phân công. Không tự quyết định rồi coi như đã chốt. Hỏi A (nhóm trưởng) hoặc ghi rõ giả định trong PR.

- **Cơ sở dữ liệu và ORM:** tài liệu không nhắc Prisma, ORM hay loại CSDL nào. Lớp lưu trữ đặt trong `src/infrastructure`. Hỏi A trước khi chọn.
- **Cách service nhận danh tính người dùng (vai trò `admin`/`manager`/`staff`):** tài liệu chỉ nêu middleware `hrm-session` gắn `req.user` ở identity-service. Cách các service khác lấy được danh tính và vai trò chưa được quy định. Hỏi A trước khi làm phần phân quyền.
- **Schema Branch và Department:** không có trong mục schema chung. Chỉ biết `branchSlug` (Employee) và `departmentId` (Employee). Hỏi A trước khi chốt trường.
- **Schema tài khoản công ty (bank-accounts):** không được nêu. Chỉ biết payout có `debitAccount` và hết số dư trả 422.
- **Giá trị `status` của Payout và Payslip:** không được nêu.
- **Phương thức lấy `totalPenalty` khi sinh phiếu:** xem mục 6.
- **Ma trận phân quyền chi tiết theo vai trò cho từng endpoint:** không được nêu.

---

## 10. Quy tắc làm việc cho agent

1. Đọc mục 1 trước. Chỉ sửa trong phạm vi của B.
2. Không tự bịa endpoint, tên trường hay hành vi. Nếu tài liệu không nêu, dùng nhãn **(suy ra)** và hỏi lại.
3. Bám đúng envelope, tên trường và định dạng ngày ở mục 5.
4. Không commit thẳng vào `dev` hoặc `main`. Mỗi thay đổi đi qua nhánh `feat/...` và PR về `dev`.
5. Không import chéo mã nguồn giữa các service. Muốn dùng dữ liệu của service khác thì gọi qua HTTP.
6. Sau mỗi thay đổi, kiểm tra `GET /health` và chạy test của service (`tests/`).
7. Khi báo kết quả, nói rõ đã chạy lệnh nào và kết quả ra sao. Không báo "pass" khi chưa chạy.
8. Ưu tiên theo thứ tự: organization-service (mốc 1) trước, rồi payroll-service (mốc 2).
