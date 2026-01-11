# Hướng dẫn sử dụng Module Quản lý Nông trại

## 📦 Các Module đã tạo

### Backend
1. **Partners** - Quản lý đối tác (Nhà cung cấp, Người mua, Nhân viên)
2. **Production Units** - Quản lý đơn vị sản xuất (Vườn trồng, Chuồng nuôi)
3. **Seasons** - Quản lý mùa vụ/lứa nuôi
4. **Categories** - Quản lý danh mục thu/chi

### Frontend
- API Services cho tất cả 4 modules
- Trang demo quản lý đối tác (PartnersPage.tsx)

## 🚀 API Endpoints

### Partners
```
GET    /api/management/partners              - Lấy danh sách (query: type)
GET    /api/management/partners/:id          - Lấy chi tiết
POST   /api/management/partners              - Tạo mới
PUT    /api/management/partners/:id          - Cập nhật
DELETE /api/management/partners/:id          - Xóa
GET    /api/management/partners/:id/balance  - Lấy số dư
```

### Production Units
```
GET    /api/management/production-units       - Lấy danh sách (query: type)
GET    /api/management/production-units/stats - Thống kê
GET    /api/management/production-units/:id   - Lấy chi tiết
POST   /api/management/production-units       - Tạo mới
PUT    /api/management/production-units/:id   - Cập nhật
DELETE /api/management/production-units/:id   - Xóa
```

### Seasons
```
GET    /api/management/seasons              - Lấy danh sách (query: status, unitId)
GET    /api/management/seasons/stats        - Thống kê
GET    /api/management/seasons/:id          - Lấy chi tiết
POST   /api/management/seasons              - Tạo mới
PUT    /api/management/seasons/:id          - Cập nhật
DELETE /api/management/seasons/:id          - Xóa
POST   /api/management/seasons/:id/close    - Đóng mùa vụ
```

### Categories
```
GET    /api/management/categories           - Lấy danh sách (query: scope, parentId)
GET    /api/management/categories/tree      - Lấy cây danh mục
GET    /api/management/categories/stats     - Thống kê
GET    /api/management/categories/:id       - Lấy chi tiết
POST   /api/management/categories           - Tạo mới
PUT    /api/management/categories/:id       - Cập nhật
DELETE /api/management/categories/:id       - Xóa
```

## 📝 Ví dụ sử dụng

### 1. Tạo đối tác mới
```typescript
import { createPartner } from '../api/partner.api';

const newPartner = await createPartner({
    partner_code: 'NCC001',
    partner_name: 'Công ty TNHH ABC',
    type: 'SUPPLIER',
    phone: '0123456789',
    address: 'Hà Nội'
});
```

### 2. Lấy danh sách mùa vụ đang hoạt động
```typescript
import { getSeasons } from '../api/season.api';

const activeSeasons = await getSeasons('ACTIVE');
```

### 3. Tạo danh mục thu/chi
```typescript
import { createCategory } from '../api/category.api';

const category = await createCategory({
    category_code: 'CAT-PHAN-BON',
    category_name: 'Phân bón',
    scope: 'FARM',
    parent_id: null // Danh mục gốc
});
```

## 🎨 Tích hợp Frontend

### Thêm route vào app.tsx
```typescript
import PartnersPage from './pages/PartnersPage';

// Trong routes:
{
    path: '/management/partners',
    element: <PartnersPage />
}
```

### Tạo các trang tương tự cho modules khác
Bạn có thể copy `PartnersPage.tsx` và chỉnh sửa để tạo:
- `ProductionUnitsPage.tsx`
- `SeasonsPage.tsx`
- `CategoriesPage.tsx`

## 🔧 Cấu trúc File

```
backend/
├── src/
│   ├── services/
│   │   ├── partner.service.ts
│   │   ├── production-unit.service.ts
│   │   ├── season.service.ts
│   │   └── category.service.ts
│   ├── controllers/management/
│   │   ├── partner.controller.ts
│   │   ├── production-unit.controller.ts
│   │   ├── season.controller.ts
│   │   └── category.controller.ts
│   └── routes/
│       ├── partner.routes.ts
│       ├── production-unit.routes.ts
│       ├── season.routes.ts
│       ├── category.routes.ts
│       └── management/index.ts

frontend/
├── src/
│   ├── api/
│   │   ├── partner.api.ts
│   │   ├── production-unit.api.ts
│   │   ├── season.api.ts
│   │   └── category.api.ts
│   └── pages/
│       └── PartnersPage.tsx
```

## ✅ Checklist triển khai

- [x] Backend Services
- [x] Backend Controllers
- [x] Backend Routes
- [x] Frontend API Services
- [x] Frontend Demo Page (Partners)
- [ ] Frontend Pages cho Production Units
- [ ] Frontend Pages cho Seasons
- [ ] Frontend Pages cho Categories
- [ ] Thêm routes vào app.tsx
- [ ] Test API endpoints
- [ ] Thêm validation
- [ ] Thêm error handling

## 🎯 Bước tiếp theo

1. **Tạo database tables**: Chạy script SQL trong `document/database.txt`
2. **Thêm routes**: Cập nhật `frontend/src/app.tsx` để thêm routes
3. **Tạo các trang còn lại**: Copy PartnersPage.tsx và chỉnh sửa
4. **Test**: Kiểm tra tất cả CRUD operations
5. **Tích hợp**: Kết nối với các module khác (Transactions, Inventory, etc.)

## 📚 Tài liệu tham khảo

- Database Schema: `document/database.txt`
- Payroll Workflow: `document/payroll_workflow_example.sql`
- Migration: `document/payroll_transaction_migration.sql`
