# Assets Directory

Thư mục này chứa tất cả tài nguyên tĩnh của ứng dụng.

## 📁 Cấu trúc

```
assets/
├── images/       # Hình ảnh (logo, banners, illustrations)
├── icons/        # Icon files (SVG, PNG)
├── fonts/        # Custom fonts
└── videos/       # Video files
```

## 📝 Quy tắc

### Images
- Sử dụng format WebP cho hình ảnh hiện đại
- Fallback sang PNG/JPG cho trình duyệt cũ
- Tối ưu hóa kích thước trước khi commit
- Đặt tên: `feature-name-description.webp`

### Icons
- Ưu tiên SVG cho icons
- Đặt tên rõ ràng: `icon-name.svg`
- Sử dụng Material Symbols cho icons hệ thống

### Fonts
- Chỉ import fonts cần thiết
- Sử dụng Google Fonts khi có thể
- Format: WOFF2 (modern), WOFF (fallback)

## 💡 Ví dụ sử dụng

```typescript
// Import image
import logo from '@/src/assets/images/logo.png';

// Sử dụng trong component
<img src={logo} alt="GreenAcres Logo" />

// Import SVG as component
import { ReactComponent as IconPlant } from '@/src/assets/icons/plant.svg';

<IconPlant className="w-6 h-6" />
```

## 🎨 Tối ưu hóa

- **Images**: Sử dụng tools như TinyPNG, ImageOptim
- **SVG**: Sử dụng SVGO để minify
- **Lazy loading**: Sử dụng React.lazy() cho assets lớn
