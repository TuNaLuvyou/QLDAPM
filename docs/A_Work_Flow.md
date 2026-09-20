# Work_flow_QLDAPM.md — Người A (nhóm trưởng) — Môn Quản lý dự án phần mềm

> File này dành cho AI agent. Đọc hết trước khi sửa code hoặc tạo file. Nguồn: `QLDAPM_PhanCong.docx`.
> Mục có nhãn **(suy ra)** hoặc **(chưa quy định)** không có trong tài liệu phân công gốc. Không coi đó là yêu cầu chắc chắn; hỏi lại người A khi cần.
> Cùng codebase với môn PTPMDV (xem `Work_flow_PTPMDV.md`). Khi làm cho môn này, không đổi cổng, envelope, tên trường hay cấu trúc thư mục chung.

---

## 0. Tóm tắt nhanh

| Mục | Nội dung |
|---|---|
| Môn | Quản lý dự án phần mềm (QLDAPM) |
| Đề tài | Hệ thống quản trị nhân sự và vận hành ca kíp (HRM Enterprise) |
| Thành viên | A (nhóm trưởng), B, C |
| Phần A sở hữu | `backend/api-gateway` (4000), `backend/identity-service` (4001), `mobile/` (Flutter) |
| Nhiệm vụ cuối | Đấu nối toàn hệ thống, test end-to-end (web + mobile), optimize |

---

## 1. Phạm vi: được sửa và không được sửa

### Được sửa (thuộc A)
- `backend/api-gateway/`
- `backend/identity-service/`
- `mobile/`
- `docker-compose.yml` (ở gốc dự án)

### Không sửa (thuộc thành viên khác)
| Thư mục | Cổng | Chủ sở hữu | Chức năng chính |
|---|---|---|---|
| `backend/organization-service/` | 4002 | B | Chi nhánh, phòng ban, nhân sự |
| `backend/work-service/` | 4003 | C | Ca làm việc, chấm công, tác vụ |
| `backend/payroll-service/` | 4004 | B | Tài khoản công ty, lệnh chi, phiếu lương |
| `backend/integration-service/` | 4005 | C | SOAP ngân hàng, yêu cầu, thông báo, bảng tin, nội quy, Wi-Fi |

Nếu cần thay đổi ở service của người khác (thiếu endpoint, sai schema, sai envelope), không tự sửa. Ghi lại vấn đề, nêu rõ service, endpoint, kỳ vọng và thực tế, rồi báo cho người A để trao đổi với chủ service.

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

Áp dụng cho `api-gateway` và `identity-service`.

### 2.2 Định dạng response
- Thành công: `{ "data": ... }`
- Lỗi: `{ "error": { "code": "...", "message": "..." } }`

### 2.3 Health check
Mỗi service (kể cả gateway) có `GET /health`, trả:

```json
{ "status": "ok", "service": "<service-name>", "time": "<thời gian hiện tại>" }
```

Nghiệm thu yêu cầu `GET /health` chạy được ở đủ **6 điểm**: gateway + 5 service.

### 2.4 Mobile (Flutter)
- Điều hướng: `go_router`.
- Màu: `AppColors`.
- Font: Public Sans.
- **Không dùng `withOpacity`.**

---

## 3. Git workflow

- Nhánh gốc làm việc: `dev`.
- Tạo nhánh theo mẫu `feat/<service>-<tên>` (ví dụ `feat/api-gateway-proxy`, `feat/identity-auth`, `feat/mobile-auth-repository`).
- Xong thì tạo PR về `dev`.
- **Không commit thẳng vào `dev` hoặc `main`.**
- Mỗi PR nên gọn theo một service hoặc một chức năng.

---

## 4. Danh sách việc của A

### Task 1 — api-gateway (cổng 4000)
- [ ] Dựng gateway proxy về các service 4001–4005.
- [ ] Cấu hình CORS.
- [ ] Xử lý lỗi tập trung, trả đúng envelope `{error: {code, message}}`.
- [ ] `GET /health` cho gateway.
- [ ] Viết `docker-compose` chạy đủ 6 thành phần (gateway + 5 service).
- [ ] Gateway là **cổng duy nhất** cho Web và Mobile: client không gọi thẳng vào các service.

Gợi ý kỹ thuật **(suy ra)**: phiên dùng cookie `hrm-session`, nên CORS cần cho phép credentials và chỉ định origin cụ thể, không dùng `*`.

### Task 2 — identity-service (cổng 4001)
- [ ] `POST /api/auth/login`
- [ ] `POST /api/auth/logout`
- [ ] `GET /api/auth/me`
- [ ] Middleware đọc cookie `hrm-session` và gắn `req.user`.
- [ ] Phân quyền theo vai trò: `admin`, `manager`, `staff`.
- [ ] Seed 3 tài khoản: `admin`, `manager`, `staff`.
- [ ] `GET /health`.

### Task 3 — Mobile (Flutter, thư mục `mobile/`)
- [ ] Đồng bộ models mobile `user` và `branch` với schema backend (mục 6).
- [ ] Đấu `auth_repository` về gateway.
- [ ] Đấu các service `schedule` và `tasks` về gateway.
- [ ] Cấu hình base URL và company, trỏ về gateway.
- [ ] Build và kiểm thử bản iOS.
- [ ] `flutter analyze` pass.
- [ ] `flutter test` pass.

### Task 4 — Đấu nối và optimize (làm cuối)
- [ ] Đấu nối toàn hệ thống khi các service khác đã xong.
- [ ] Test end-to-end trên **web và mobile**.
- [ ] Chạy full luồng **chấm công → sinh phiếu lương → chi lương (REST và SOAP)** trên cả web và mobile.
- [ ] Optimize sau khi luồng chạy đúng.

---

## 5. Bảng route qua gateway

Gateway proxy các đường dẫn sau về service tương ứng. Đường dẫn ghi trong tài liệu gốc được đánh dấu ✔. Đường dẫn còn lại là **(suy ra)** từ tên chức năng, cần xác nhận với chủ service trước khi cấu hình.

| Đường dẫn | Service (cổng) | Nguồn |
|---|---|---|
| `/api/auth/*` | identity (4001) | ✔ |
| `/api/branches`, `/api/departments`, `/api/employees` | organization (4002) | ✔ |
| `/api/shifts`, `/api/attendance` | work (4003) | ✔ |
| `/api/tasks` | work (4003) | (suy ra) |
| `/api/payroll/*` (`bank-accounts`, `payouts`, `payslips`) | payroll (4004) | ✔ |
| `/soap/payroll` (`?wsdl` và POST) | integration (4005) | ✔ |
| `/api/news`, `/api/regulations`, `/api/wifi-configs` | integration (4005) | ✔ |
| `/api/requests` | integration (4005) | (suy ra) |
| `/api/notifications` | integration (4005) | (suy ra) |

Lưu ý: `/soap/payroll` nhận và trả XML, và trả `soap:Fault` khi lỗi. Gateway phải chuyển tiếp nguyên vẹn body, header và status của SOAP, không bọc lại thành `{data}` hay `{error}`.

---

## 6. Schema dữ liệu thống nhất (mobile phải khớp)

Mục 4 của tài liệu phân công là chuẩn chung. Models mobile phải khớp các trường sau. Không tự đổi tên trường.

- **Employee:** `id, name, email, phone, cccd, address, role, roleTitle, branchSlug, departmentId, baseSalary, bankName, bankAccount, startDate, status`
- **Attendance:** `id, employeeId, shiftId, date (DD-MM-YYYY), checkIn, checkOut, penaltyAmount, penaltyNote, status (present/absent/late/early_leave)`
- **Payout:** `id (TXN-xxxxxx), bankReference (BANK-xxxxxxxx), debitAccount, totalAmount, content, beneficiaryCount, idempotencyKey, status, createdAt`
- **Payslip:** `id, employeeId, month (MM-YYYY), baseSalary, totalPenalty, netSalary (= baseSalary - totalPenalty), payoutId, status, issuedAt`
- **Yêu cầu nội bộ:** `id, type (leave/overtime/advance/other), employeeId, branchSlug, title, content, attachmentUrl, status (pending/approved/rejected), reviewedBy, reviewNote, createdAt, updatedAt`
- **Thông báo:** `id, targetEmployeeId (null là gửi toàn hệ thống), branchSlug, title, body, isRead, createdAt`
- **Bảng tin:** `id, title, summary, content, author, date, tag, tagTone (danger/warning/success/primary/gray), pinned`
- **Nội quy:** `id, code, title, category, summary, content, status, scope (Toàn công ty hoặc mã chi nhánh), effectiveDate, expiryDate, author, createdAt`
- **Wi-Fi chấm công:** `id, ssid, bssid, branch (mã chi nhánh), status`
- **SOAP:** `POST /soap/payroll` nhận `PayoutRequest (idempotencyKey, debitAccount, content, totalAmount, beneficiaryCount)`, trả `PayoutResponse (transactionId, bankReference, status)`. Lỗi trả `soap:Fault` với `faultcode = soap:Client`.

Ghi chú định dạng ngày: `Attendance.date` dùng `DD-MM-YYYY`, `Payslip.month` dùng `MM-YYYY`, query attendance dùng `month=YYYY-MM`. Ba định dạng này khác nhau, chú ý khi parse và hiển thị trên mobile.

Quy tắc lỗi cần biết khi đấu mobile:
- Payout trùng `idempotencyKey` trả lại bản ghi cũ kèm `deduped: true`.
- Payout hết số dư trả HTTP `422`.
- Chấm công tính phạt qua `penaltyAmount` và `penaltyNote`, với `status` là `present`, `absent`, `late` hoặc `early_leave`.

---

## 7. Mốc kiểm tra

| Mốc | Việc của A | Việc của người khác (phụ thuộc) |
|---|---|---|
| 1 | Xong gateway + identity + đấu API mobile | B xong organization; C xong work |
| 2 | Xong build và kiểm thử bản iOS | B xong payroll; C xong requests, notifications, SOAP, bảng tin, nội quy, Wi-Fi |
| 3 | Đấu nối, chạy full luồng chấm công – sinh phiếu – chi lương REST/SOAP trên cả web và mobile, rồi optimize | — |

Thứ tự ưu tiên: hoàn thành gateway và identity trước, vì các thành viên khác và mobile phụ thuộc vào chúng.

---

## 8. Nghiệm thu (Definition of Done)

- Đăng nhập và phiên chạy được.
- `GET /health` pass ở cả 6 điểm.
- `docker-compose up` thành công.
- App mobile đăng nhập được, gọi API thật pass.
- `flutter analyze` và `flutter test` pass.
- Luồng end-to-end pass.

### Checklist trước khi mở PR
- [ ] Đúng cấu trúc thư mục service (mục 2.1).
- [ ] Response đúng envelope `{data}` hoặc `{error: {code, message}}`.
- [ ] Có `GET /health` đúng định dạng.
- [ ] Có `.env.example` và `Dockerfile`.
- [ ] Nhánh đặt tên `feat/<service>-<tên>`, PR về `dev`.
- [ ] Mobile không dùng `withOpacity`, dùng `AppColors`, `go_router`, Public Sans.
- [ ] Không sửa file thuộc service của người khác.

---

## 9. Điểm chưa quy định

Các mục sau không có trong tài liệu phân công. Không tự quyết định rồi coi như đã chốt. Hỏi người A hoặc ghi rõ giả định trong PR.

- **Cơ sở dữ liệu và ORM:** tài liệu không nhắc Prisma, ORM hay loại CSDL nào. Lớp lưu trữ đặt trong `src/infrastructure`. Nếu cần chọn cho `identity-service`, hỏi trước.
- **Ai soạn schema chung:** không có người được giao riêng việc thiết kế dữ liệu. Mỗi người tự lo model của service mình, còn mục 6 là chuẩn chung.
- **Body request và response của `/api/auth/login`, `/api/auth/me`:** không được quy định chi tiết, chỉ bắt buộc đúng envelope.
- **Mật khẩu và thông tin 3 tài khoản seed:** không được nêu.
- **Đường dẫn chính xác của tasks, requests, notifications:** xem mục 5, cần xác nhận.
- **Ứng dụng web:** tài liệu nhắc test end-to-end trên web nhưng không giao ai làm web trong phần phân công. Hỏi người A trước khi động vào.

---

## 10. Quy tắc làm việc cho agent

1. Đọc mục 1 trước. Chỉ sửa trong phạm vi của A.
2. Không tự bịa endpoint, tên trường hay hành vi. Nếu tài liệu không nêu, dùng nhãn **(suy ra)** và hỏi lại.
3. Bám đúng envelope, tên trường và định dạng ngày ở mục 6.
4. Không commit thẳng vào `dev` hoặc `main`. Mỗi thay đổi đi qua nhánh `feat/...` và PR về `dev`.
5. Sau mỗi thay đổi ở mobile, chạy `flutter analyze` và `flutter test`. Sau mỗi thay đổi ở backend, kiểm tra `GET /health` và chạy test của service.
6. Khi báo kết quả, nói rõ đã chạy lệnh nào và kết quả ra sao. Không báo "pass" khi chưa chạy.
7. Ưu tiên theo thứ tự: gateway + identity, đến đấu API mobile, đến build iOS, cuối cùng là đấu nối end-to-end và optimize.
