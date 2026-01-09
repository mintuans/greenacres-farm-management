# 📚 Ví dụ sử dụng các thư mục

Tài liệu này cung cấp ví dụ cụ thể về cách sử dụng từng thư mục trong dự án.

---

## 🎨 **src/components/** - UI Components

### Mục đích
Chứa các UI components tái sử dụng trong toàn bộ ứng dụng.

### Ví dụ sử dụng

```typescript
// Trong một page component
import { Button } from '@/src/components/Button';
import { Card } from '@/src/components/Card';
import { Input } from '@/src/components/Input';

const MyPage = () => {
  return (
    <Card title="Thêm sản phẩm mới">
      <Input 
        label="Tên sản phẩm"
        placeholder="Nhập tên sản phẩm"
        fullWidth
      />
      
      <Button variant="primary" size="lg">
        Lưu sản phẩm
      </Button>
    </Card>
  );
};
```

### Khi nào sử dụng?
- ✅ Khi cần component tái sử dụng nhiều nơi
- ✅ Khi muốn UI nhất quán trong toàn app
- ❌ Không dùng cho logic phức tạp (dùng hooks thay thế)

---

## 🪝 **src/hooks/** - Custom Hooks

### Mục đích
Tái sử dụng logic React giữa các components.

### Ví dụ sử dụng

```typescript
import { useFetch } from '@/src/hooks/useFetch';
import { useDebounce } from '@/src/hooks/useDebounce';
import { useLocalStorage } from '@/src/hooks/useLocalStorage';

const ProductList = () => {
  // Fetch data từ API
  const { data, loading, error } = useFetch<Product[]>('/api/products');
  
  // Debounce search input
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  
  // Lưu settings vào localStorage
  const [settings, setSettings] = useLocalStorage('app-settings', {
    theme: 'light',
    language: 'vi',
  });

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi: {error.message}</div>;

  return (
    <div>
      <input 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Tìm kiếm..."
      />
      {/* Render products */}
    </div>
  );
};
```

### Khi nào sử dụng?
- ✅ Khi có logic được dùng lại ở nhiều components
- ✅ Khi muốn tách logic ra khỏi UI
- ✅ Khi cần quản lý side effects phức tạp

---

## 🔌 **src/api/** - API Calls

### Mục đích
Tập trung tất cả logic gọi API ở một nơi.

### Ví dụ tạo API module mới

```typescript
// src/api/products.api.ts
import { api } from './client';
import type { Product } from '@/src/@types';

export const productsAPI = {
  // GET tất cả products
  getAll: () => api.get<Product[]>('/products'),
  
  // GET product theo ID
  getById: (id: string) => api.get<Product>(`/products/${id}`),
  
  // POST tạo product mới
  create: (data: Omit<Product, 'id'>) => 
    api.post<Product>('/products', data),
  
  // PUT cập nhật product
  update: (id: string, data: Partial<Product>) => 
    api.put<Product>(`/products/${id}`, data),
  
  // DELETE xóa product
  delete: (id: string) => 
    api.delete<void>(`/products/${id}`),
};
```

### Sử dụng trong component

```typescript
import { productsAPI } from '@/src/api/products.api';

const AddProduct = () => {
  const handleSubmit = async (formData) => {
    try {
      const newProduct = await productsAPI.create(formData);
      console.log('Tạo thành công:', newProduct);
    } catch (error) {
      console.error('Lỗi:', error);
    }
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
};
```

### Khi nào sử dụng?
- ✅ Mọi lần gọi API tới backend
- ✅ Khi cần type safety cho API responses
- ✅ Khi muốn centralize error handling

---

## ✅ **src/validators/** - Form Validation

### Mục đích
Validate dữ liệu đầu vào từ forms.

### Ví dụ sử dụng

```typescript
import { 
  validateEmail, 
  validatePhone, 
  validateRequired 
} from '@/src/validators';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setErrors({ email: emailValidation.error });
      return;
    }
    
    // Submit form...
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
      />
      <Button type="submit">Đăng nhập</Button>
    </form>
  );
};
```

### Khi nào sử dụng?
- ✅ Validate form inputs
- ✅ Kiểm tra dữ liệu trước khi gửi API
- ✅ Hiển thị error messages cho users

---

## 🎨 **src/themes/** - Design Tokens

### Mục đích
Centralize tất cả design tokens (colors, spacing, typography).

### Ví dụ sử dụng

```typescript
import { colors, spacing, typography } from '@/src/themes';

const StyledComponent = () => {
  return (
    <div 
      style={{
        backgroundColor: colors.primary[500],
        padding: spacing[4],
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
      }}
    >
      Styled với theme tokens
    </div>
  );
};
```

### Hoặc với Tailwind CSS

```typescript
// tailwind.config.ts đã import từ src/themes/
// Sử dụng trực tiếp trong className

<div className="bg-primary-500 p-4 text-lg font-bold">
  Styled với Tailwind
</div>
```

### Khi nào sử dụng?
- ✅ Khi cần colors, spacing, typography nhất quán
- ✅ Khi muốn dễ dàng thay đổi theme
- ✅ Khi làm dark mode

---

## 🛣️ **src/routes/** - Routing

### Mục đích
Quản lý routing configuration.

### Ví dụ sử dụng

```typescript
// src/app.tsx
import { routes } from '@/src/routes';
import { useRoutes } from 'react-router-dom';

const App = () => {
  const routing = useRoutes(routes);
  
  return (
    <div>
      <Sidebar />
      <Header />
      {routing}
    </div>
  );
};
```

### Thêm route mới

```typescript
// src/routes/index.tsx
import NewPage from '@/src/pages/NewPage';

export const routes = [
  // ... existing routes
  {
    path: '/new-page',
    element: <NewPage />,
  },
];
```

---

## 🛠️ **src/utils/** - Utility Functions

### Mục đích
Chứa pure functions không phụ thuộc React.

### Ví dụ sử dụng

```typescript
import { 
  formatCurrency, 
  formatDate, 
  calculatePercentage 
} from '@/src/utils';

const ProductCard = ({ product }) => {
  return (
    <div>
      <h3>{product.name}</h3>
      <p>Giá: {formatCurrency(product.price)}</p>
      <p>Ngày tạo: {formatDate(product.createdAt, 'long')}</p>
      <p>Giảm giá: {calculatePercentage(product.discount, product.price)}%</p>
    </div>
  );
};
```

### Khi nào sử dụng?
- ✅ Format dữ liệu hiển thị
- ✅ Tính toán đơn giản
- ✅ String manipulation
- ❌ Không dùng cho React-specific logic (dùng hooks)

---

## 📦 **src/assets/** - Static Resources

### Mục đích
Chứa images, icons, fonts, videos.

### Ví dụ sử dụng

```typescript
// Import image
import logo from '@/src/assets/images/logo.png';
import bannerImg from '@/src/assets/images/banner.webp';

const Header = () => {
  return (
    <header>
      <img src={logo} alt="Logo" className="w-32" />
      <img src={bannerImg} alt="Banner" className="w-full" />
    </header>
  );
};
```

### Với SVG icons

```typescript
// Nếu có SVG loader
import { ReactComponent as PlantIcon } from '@/src/assets/icons/plant.svg';

<PlantIcon className="w-6 h-6 text-green-500" />
```

---

## 📋 **src/@types/** - Type Definitions

### Mục đích
Centralize tất cả TypeScript types và interfaces.

### Ví dụ tạo types mới

```typescript
// src/@types/product.types.ts
export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  createdAt: string;
}

export interface ProductFormData {
  name: string;
  price: number;
  category: string;
}

export type ProductStatus = 'in-stock' | 'out-of-stock' | 'discontinued';
```

### Sử dụng trong components

```typescript
import type { Product, ProductFormData } from '@/src/@types';

const ProductForm: React.FC = () => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    price: 0,
    category: '',
  });
  
  const handleSubmit = async (data: ProductFormData) => {
    const product: Product = await productsAPI.create(data);
  };
};
```

---

## 🎯 Workflow hoàn chỉnh - Tạo tính năng mới

### Ví dụ: Tạo tính năng "Quản lý nhân viên"

#### 1. Tạo Types
```typescript
// src/@types/employee.types.ts
export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  salary: number;
}
```

#### 2. Tạo API
```typescript
// src/api/employees.api.ts
import { api } from './client';
import type { Employee } from '@/src/@types';

export const employeesAPI = {
  getAll: () => api.get<Employee[]>('/employees'),
  create: (data: Omit<Employee, 'id'>) => api.post<Employee>('/employees', data),
};
```

#### 3. Tạo Validators
```typescript
// src/validators/employee.validator.ts
export const validateEmployeeForm = (data) => {
  // Validation logic
};
```

#### 4. Tạo Custom Hook (nếu cần)
```typescript
// src/hooks/useEmployees.ts
export const useEmployees = () => {
  const { data, loading } = useFetch<Employee[]>('/api/employees');
  // Additional logic
  return { employees: data, loading };
};
```

#### 5. Tạo Components
```typescript
// src/components/EmployeeCard.tsx
export const EmployeeCard = ({ employee }: { employee: Employee }) => {
  return <Card>...</Card>;
};
```

#### 6. Tạo Page
```typescript
// src/pages/Employees.tsx
import { useEmployees } from '@/src/hooks/useEmployees';
import { EmployeeCard } from '@/src/components/EmployeeCard';

const Employees = () => {
  const { employees, loading } = useEmployees();
  
  return (
    <div>
      {employees?.map(emp => <EmployeeCard key={emp.id} employee={emp} />)}
    </div>
  );
};
```

#### 7. Thêm Route
```typescript
// src/routes/index.tsx
import Employees from '@/src/pages/Employees';

export const routes = [
  // ...
  { path: '/employees', element: <Employees /> },
];
```

---

## 💡 Best Practices

1. **Import paths**: Luôn dùng alias `@/src/` thay vì relative paths
2. **Type safety**: Luôn define types cho props, functions, API responses
3. **Reusability**: Tách logic ra hooks, components nhỏ
4. **Single responsibility**: Mỗi file/function chỉ làm một việc
5. **Naming**: Đặt tên rõ ràng, mô tả đúng chức năng

---

Hy vọng tài liệu này giúp bạn hiểu rõ cách sử dụng từng thư mục! 🚀
