# 📐 Hướng dẫn cấu trúc dự án GreenAcres

## 🎯 Nguyên tắc tổ chức code

Dự án được tổ chức theo kiến trúc **Feature-Based** kết hợp với **Separation of Concerns**.

## 📂 Chi tiết từng thư mục

### `src/@types/`
**Mục đích**: Chứa tất cả TypeScript type definitions và interfaces

**Quy tắc**:
- Mỗi domain có thể có file types riêng (vd: `user.types.ts`, `product.types.ts`)
- File `index.ts` export tất cả types để dễ import
- Không chứa logic, chỉ chứa type definitions

**Ví dụ**:
```typescript
// src/@types/user.types.ts
export interface User {
  id: string;
  name: string;
  email: string;
}

// src/@types/index.ts
export * from './user.types';
export * from './product.types';
```

---

### `src/api/`
**Mục đích**: Chứa tất cả logic gọi API tới backend

**Quy tắc**:
- `client.ts`: API client chung với fetch wrapper
- Mỗi resource có file riêng (vd: `users.api.ts`, `products.api.ts`)
- Sử dụng TypeScript generics cho type safety
- Handle errors một cách nhất quán

**Ví dụ**:
```typescript
// src/api/users.api.ts
import { api } from './client';
import type { User } from '@/src/@types';

export const usersAPI = {
  getAll: () => api.get<User[]>('/users'),
  getById: (id: string) => api.get<User>(`/users/${id}`),
  create: (data: Omit<User, 'id'>) => api.post<User>('/users', data),
  update: (id: string, data: Partial<User>) => api.put<User>(`/users/${id}`, data),
  delete: (id: string) => api.delete<void>(`/users/${id}`),
};
```

---

### `src/assets/`
**Mục đích**: Chứa tài nguyên tĩnh

**Cấu trúc**:
```
assets/
├── images/       # Hình ảnh (logo, banners, illustrations)
├── icons/        # Icon files (SVG, PNG)
├── fonts/        # Custom fonts
└── videos/       # Video files
```

**Quy tắc**:
- Tối ưu hóa kích thước file trước khi commit
- Sử dụng SVG cho icons khi có thể
- Đặt tên file rõ ràng, không dấu, lowercase

---

### `src/components/`
**Mục đích**: Chứa các UI components tái sử dụng

**Cấu trúc đề xuất**:
```
components/
├── common/           # Components dùng chung (Button, Input, Card)
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.types.ts
│   │   └── index.ts
│   └── Input/
├── forms/            # Form-related components
├── layout/           # Layout components (Container, Grid)
└── feedback/         # Toast, Modal, Alert
```

**Quy tắc**:
- Mỗi component có folder riêng
- Component phải có props interface rõ ràng
- Export qua `index.ts` để clean imports
- Viết component nhỏ, tập trung vào một nhiệm vụ

**Ví dụ**:
```typescript
// src/components/common/Button/Button.types.ts
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

// src/components/common/Button/Button.tsx
import type { ButtonProps } from './Button.types';

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md',
  children,
  ...props 
}) => {
  return <button className={`btn btn-${variant} btn-${size}`} {...props}>{children}</button>;
};

// src/components/common/Button/index.ts
export { Button } from './Button';
export type { ButtonProps } from './Button.types';
```

---

### `src/hooks/`
**Mục đích**: Custom React hooks để tái sử dụng logic

**Quy tắc**:
- Tên hook bắt đầu bằng `use` (vd: `useAuth`, `useFetch`)
- Mỗi hook có file riêng
- Document rõ ràng params và return values

**Ví dụ**:
```typescript
// src/hooks/useFetch.ts
import { useState, useEffect } from 'react';

export const useFetch = <T>(url: string) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [url]);

  return { data, loading, error };
};
```

---

### `src/pages/`
**Mục đích**: Các trang chính của ứng dụng

**Quy tắc**:
- Mỗi route có một page component
- Page components orchestrate các components nhỏ hơn
- Không chứa business logic phức tạp (đưa vào hooks hoặc utils)
- Có thể có folder con cho pages lớn

**Cấu trúc**:
```
pages/
├── Dashboard.tsx
├── Inventory/
│   ├── Inventory.tsx
│   ├── InventoryList.tsx
│   └── InventoryDetail.tsx
└── Seasons.tsx
```

---

### `src/routes/`
**Mục đích**: Cấu hình routing của ứng dụng

**Ví dụ**:
```typescript
// src/routes/index.tsx
import { Routes, Route } from 'react-router-dom';
import Dashboard from '@/src/pages/Dashboard';
import Inventory from '@/src/pages/Inventory';

export const AppRoutes = () => (
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/inventory" element={<Inventory />} />
  </Routes>
);
```

---

### `src/templates/`
**Mục đích**: Layout templates (Sidebar, Header, Footer)

**Quy tắc**:
- Chứa các layout components lớn
- Không chứa business logic
- Có thể compose nhiều layout khác nhau

---

### `src/themes/`
**Mục đích**: Cấu hình theme, colors, typography

**Ví dụ**:
```typescript
// src/themes/colors.ts
export const colors = {
  primary: '#13ec49',
  secondary: '#64748b',
  success: '#22c55e',
  danger: '#ef4444',
  warning: '#f59e0b',
};

// src/themes/typography.ts
export const typography = {
  fontFamily: 'Inter, sans-serif',
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
  },
};
```

---

### `src/utils/`
**Mục đích**: Utility functions không phụ thuộc vào React

**Quy tắc**:
- Pure functions
- Có unit tests
- Document rõ ràng

**Các file thường có**:
- `format.ts`: Định dạng số, ngày, tiền tệ
- `validation.ts`: Validate dữ liệu
- `storage.ts`: LocalStorage/SessionStorage helpers
- `constants.ts`: Hằng số dùng chung

---

### `src/validators/`
**Mục đích**: Schema validation cho forms và data

**Ví dụ với Zod**:
```typescript
// src/validators/user.validator.ts
import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  age: z.number().min(18, 'Phải trên 18 tuổi'),
});

export type UserFormData = z.infer<typeof userSchema>;
```

---

## 🔗 Import Paths

Sử dụng alias `@/` để import:

```typescript
// ❌ Không nên
import { Button } from '../../../components/common/Button';

// ✅ Nên
import { Button } from '@/src/components/common/Button';
```

---

## 📝 Naming Conventions

### Files
- **Components**: PascalCase (`Button.tsx`, `UserCard.tsx`)
- **Hooks**: camelCase với prefix `use` (`useAuth.ts`, `useFetch.ts`)
- **Utils**: camelCase (`format.ts`, `validation.ts`)
- **Types**: camelCase với suffix `.types` (`user.types.ts`)
- **API**: camelCase với suffix `.api` (`users.api.ts`)

### Variables & Functions
- **Variables**: camelCase (`userName`, `isLoading`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`, `MAX_RETRY`)
- **Functions**: camelCase (`fetchUsers`, `calculateTotal`)
- **Components**: PascalCase (`Button`, `UserProfile`)

### Types & Interfaces
- **Interfaces**: PascalCase (`User`, `ProductData`)
- **Types**: PascalCase (`UserRole`, `ApiResponse`)
- **Props**: PascalCase với suffix `Props` (`ButtonProps`, `CardProps`)

---

## 🎨 Best Practices

1. **Single Responsibility**: Mỗi file/function chỉ làm một việc
2. **DRY (Don't Repeat Yourself)**: Tái sử dụng code thông qua components/hooks/utils
3. **Type Safety**: Luôn define types cho props, functions, API responses
4. **Error Handling**: Handle errors một cách nhất quán
5. **Code Documentation**: Comment cho logic phức tạp
6. **Performance**: Sử dụng React.memo, useMemo, useCallback khi cần thiết

---

## 🚀 Workflow phát triển tính năng mới

1. **Define Types** trong `src/@types/`
2. **Create API functions** trong `src/api/`
3. **Build Components** trong `src/components/`
4. **Create Custom Hooks** nếu cần trong `src/hooks/`
5. **Compose Page** trong `src/pages/`
6. **Add Route** trong `src/routes/`
7. **Test & Refine**

---

## 📚 Tài liệu tham khảo

- [React Best Practices](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
