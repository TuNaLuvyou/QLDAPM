# Tech.md — Danh Mục Công Nghệ (Technology Stack) — QLDAPM

> **Hệ thống Quản trị Nhân sự & Vận hành Doanh nghiệp (HRM Enterprise)**  
> **Kiến trúc**: On-Premises Service-Oriented Architecture (SOA)  
> **Môn học**: Quản lý dự án phần mềm (QLDAPM)

---

## 1. Bảng tổng hợp công nghệ chính

| Thành phần / Tầng | Công nghệ chính | Chi tiết & Thư viện bổ trợ | Vai trò trong hệ thống |
|---|---|---|---|
| **Frontend (Web Portal)** | **Next.js** | React 19, Next.js 16 App Router, Tailwind CSS v4, Font Awesome | Cổng quản trị web trực quan cho Ban giám đốc, HR, Quản lý chi nhánh, Kế toán |
| **Backend Services** | **Express (Node.js)** | Express 4.x, Node.js >= 18, Clean Architecture, RESTful API & SOAP | Cung cấp các micro-service nghiệp vụ độc lập (Identity, Organization, Work, Payroll, Integration, Gateway) |
| **Authentication** | **JWT native** | JSON Web Token (Access Token & Refresh Token) | Cơ chế xác thực phi tập trung, phân quyền Role-Based Access Control (RBAC) |
| **Database** | **PostgreSQL** | Relational Database (RDBMS), ACID compliant | Lưu trữ dữ liệu quan hệ doanh nghiệp, cam kết toàn vẹn dữ liệu, hỗ trợ transaction |
| **ORM** | **Prisma** | Prisma Client, Prisma Migrate, Type-safe Query Builder | Khai báo schema tập trung, tự động migration, ánh xạ quan hệ cơ sở dữ liệu |
| **Mobile App** | **Flutter (Đạt)**, **React-Native (Hoàng)** | - **Flutter (Đạt)**: Dart 3.x, Material 3, `go_router`<br>- **React-Native (Hoàng)**: Nền tảng do Hoàng phụ trách | Ứng dụng di động đa nền tảng cho nhân viên chấm công, xem ca, duyệt đơn, nhận phiếu lương |

---

## 2. Chi tiết từng tầng công nghệ

### 2.1. Frontend Web: Next.js
- **Framework & Runtime**: Next.js 16 (App Router), React 19.
- **Styling & UI**: Tailwind CSS v4, Font Awesome SVG icons.
- **Design System & Nhận diện**:
  - Mã màu chủ đạo: `#8E1B2F` (Deep Burgundy / Đỏ đô).
  - Ngôn ngữ giao diện: 100% Tiếng Việt chuẩn hóa doanh nghiệp.
  - Phân tách giao diện theo vai trò (Admin, Branch Manager, Accountant, HR).
- **Trách nhiệm**:
  - Quản lý cơ cấu phòng ban, chức vụ, nhân sự toàn công ty.
  - Xếp ca, theo dõi bảng chấm công, phê duyệt đơn từ.
  - Tính toán bảng lương, lập lệnh chi lương qua tài khoản công ty.
  - Quản lý bảng tin nội bộ, nội quy lao động, cấu hình Wi-Fi chấm công.

### 2.2. Backend Services: Express (Node.js)
- **Kiến trúc**: Service-Oriented Architecture (SOA) / Clean Architecture (Domain-Driven Design).
- **Phân tách các dịch vụ độc lập**:
  - `api-gateway` (Port 4000): Định tuyến tập trung, rate-limiting, xác thực token đầu vào.
  - `identity-service` (Port 4001): Quản lý tài khoản, đăng nhập, cấp phát và thu hồi JWT token.
  - `organization-service` (Port 4002): Cơ cấu tổ chức, chi nhánh, phòng ban, hồ sơ nhân sự.
  - `work-service` (Port 4003): Ca kíp, phân ca, ghi nhận vào/ra ca, phạt vi phạm đi trễ.
  - `payroll-service` (Port 4004): Quản lý số dư doanh nghiệp, lệnh chi tiền, phiếu lương nhân viên.
  - `integration-service` (Port 4005): Tích hợp cổng SOAP mô phỏng ngân hàng, hệ thống yêu cầu/đề xuất, thông báo, bảng tin.
- **Giao thức liên lạc**: RESTful JSON HTTP APIs và SOAP XML cho các giao dịch tài chính ngân hàng.

### 2.3. Authentication: JWT native
- **Cơ chế xác thực**: Sử dụng thư viện JWT chuẩn (JSON Web Token) độc lập, không phụ thuộc dịch vụ bên thứ ba (Auth0, Firebase).
- **Đặc điểm**:
  - Payload mã hóa: `userId`, `username`, `role`, `branchId` (nếu có).
  - Cấu chế Token kép: Access Token (thời hạn ngắn) và Refresh Token để làm mới phiên làm việc.
  - Stateless Verification: API Gateway và các Service nội bộ xác thực chữ ký số bằng khóa bí mật (`JWT_SECRET`) mà không cần truy vấn DB liên tục.
  - Cookie Session: Web Frontend lưu trữ session cookie an toàn (`hrm-session`).

### 2.4. Database: PostgreSQL
- **Hệ quản trị**: PostgreSQL (bản mới nhất).
- **Mô hình triển khai**: Single-tenant On-Premises (hệ thống cài đặt nội bộ cho một doanh nghiệp duy nhất, không dùng `tenantId`).
- **Ưu điểm**:
  - Tuân thủ nghiêm ngặt chuẩn ACID, bảo đảm an toàn dữ liệu số dư và các giao dịch lương.
  - Hỗ trợ transaction cấp cao, khóa bi quan/lạc quan (pessimistic/optimistic locking) khi giải ngân chi lương.
  - Khả năng mở rộng tốt, index phong phú, hỗ trợ JSONB cho cấu hình linh hoạt.

### 2.5. ORM: Prisma
- **Công cụ**: Prisma ORM (Prisma Client + Prisma Migrate).
- **Đặc trưng**:
  - Định nghĩa cấu trúc bảng thông qua tệp `schema.prisma`.
  - Hỗ trợ sinh migration tự động, bảo đảm tính đồng bộ giữa code và cơ sở dữ liệu.
  - Truy vấn hướng đối tượng type-safe, hạn chế tối đa lỗi runtime và lỗi cú pháp SQL.
  - Khả năng seed dữ liệu mẫu nhanh chóng phục vụ quá trình kiểm thử và phát triển.

### 2.6. Mobile Application: Flutter (Đạt) & React-Native (Hoàng)
Phần ứng dụng di động trong môn QLDAPM được triển khai/nghiên cứu với các nền tảng:

1. **Flutter (Phụ trách: Đạt - Client chính)**:
   - Công nghệ: Flutter 3.x, Dart 3.x, Material 3, Font Public Sans, `go_router`.
   - Tính năng: Chấm công định vị / Wi-Fi, xem bảng phân ca, theo dõi duyệt phép/đơn từ, tra cứu phiếu lương cá nhân.
2. **React-Native (Phụ trách: Hoàng)**:
   - Module/phiên bản ứng dụng di động do Hoàng phụ trách phát triển và tích hợp trong khuôn khổ dự án môn QLDAPM.
   - Giao tiếp với hệ thống backend thông qua hệ thống RESTful API chuẩn hóa của API Gateway.

---

## 3. Tiêu chuẩn giao tiếp & Quy tắc hệ thống

1. **Chuẩn hóa Envelope HTTP API**:
   - Thành công: `{ "data": <payload>, "message": "Thao tác thành công" }`
   - Lỗi: `{ "error": { "code": "<ERROR_CODE>", "message": "<Mô tả lỗi tiếng Việt>", "details": null } }`
2. **Nguyên tắc Idempotency**:
   - Tất cả giao dịch chi tiền và duyệt thanh toán lương bắt buộc có `idempotencyKey` để chống trừ tiền trùng lặp.
3. **Môi trường & Container hóa**:
   - Sử dụng `docker-compose.yml` để đóng gói và vận hành các service kèm cơ sở dữ liệu PostgreSQL.

---

## 4. Các mẫu kiến trúc áp dụng (Architectural Patterns)

> Phần này đối chiếu trực tiếp với nội dung giảng dạy môn **INT1448 — Phát triển phần mềm hướng dịch vụ** (CLO1, CLO2).

### 4.1. IPC — Giao tiếp giữa các dịch vụ (Tuần 6)
- Tất cả giao tiếp cross-service đi qua `src/infrastructure/external-clients/` bằng **HTTP REST** (timeout tối đa 5000ms).
- Không import trực tiếp code giữa các service — tuân thủ nguyên tắc decoupled networking.
- `integration-service` sử dụng **SOAP XML** để mô phỏng giao tiếp với cổng ngân hàng bên ngoài.

### 4.2. SAGA Pattern — Quản lý giao dịch phân tán (Tuần 7)
- Áp dụng **Choreography-based SAGA** cho luồng chi lương: `payroll-service` → `integration-service` (SOAP bank gateway) → phát sinh compensating transaction nếu giao dịch thất bại.
- Mỗi bước trong SAGA đều ghi log trạng thái (PENDING → SUCCESS / COMPENSATED) để đảm bảo khả năng rollback và audit trail.

### 4.3. DDD & Event Sourcing — Thiết kế logic nghiệp vụ (Tuần 8)
- **Domain-Driven Design (DDD)**: Phân tách domain rõ ràng theo từng service — `domain/entities/`, `domain/value-objects/`, `domain/errors/` trong mỗi service.
- **Event Sourcing** (tham khảo): Các sự kiện nghiệp vụ quan trọng (checkout ca, duyệt đơn, tạo phiếu lương) được thiết kế dưới dạng event để có thể tái hiện trạng thái hệ thống.

### 4.4. CQRS & API Composition — Triển khai truy vấn (Tuần 9)
- **API Composition**: `api-gateway` tổng hợp dữ liệu từ nhiều service (vd: trang dashboard nhân sự lấy thông tin từ `organization-service` + `work-service` + `payroll-service`) thành một response duy nhất cho frontend.
- **CQRS** (tham khảo): Tách biệt luồng đọc (GET) và luồng ghi (POST/PUT/DELETE) tại controller layer — read endpoints không trigger use case mutation.

### 4.5. API Gateway & BFF (Tuần 11)
- **API Gateway** (`api-gateway`, Port 4000):
  - Là điểm vào duy nhất cho toàn bộ hệ thống.
  - Xác thực JWT, rate-limiting, routing đến đúng service nội bộ.
  - Không chứa business logic.
- **BFF — Backend For Frontend**:
  - Web Portal (`frontend/`) giao tiếp qua Gateway với các endpoint tối ưu cho giao diện quản trị.
  - Mobile App (`mobile/`) gọi cùng Gateway nhưng nhận payload gọn nhẹ hơn phù hợp băng thông di động.

### 4.6. Triển khai Production-Ready (Tuần 12)
- **Containerization**: Mỗi service có `Dockerfile` riêng. `docker-compose.yml` gốc dự án orchestrate toàn bộ stack (PostgreSQL + 6 services).
- **Quản lý phiên bản API**: URL versioning theo prefix `/api/v1/` để hỗ trợ backward compatibility.
- **Health Check**: Mỗi service expose `GET /health` → `{ "status": "ok", "service": "...", "time": "..." }` phục vụ container orchestration monitoring.

