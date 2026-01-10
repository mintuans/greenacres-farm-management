# 🖼️ Hướng Dẫn Lưu Trữ Hình Ảnh trong Database

## 📋 Tổng Quan

Thay vì lưu hình ảnh dưới dạng file trên filesystem, chúng ta lưu **trực tiếp trong database** dưới dạng **BYTEA** (binary data). 

### ✅ Ưu điểm:
- **Portable**: Database độc lập, mang đi đâu cũng có ảnh
- **Backup dễ dàng**: Chỉ cần backup database là có cả ảnh
- **Không lo mất file**: Không bị mất ảnh khi move server
- **Atomic transactions**: Insert/Update ảnh cùng lúc với data
- **Security**: Kiểm soát quyền truy cập tốt hơn

### ❌ Nhược điểm:
- **Database size lớn**: BYTEA chiếm nhiều dung lượng
- **Performance**: Query chậm hơn khi load nhiều ảnh
- **Memory**: Tốn RAM khi load ảnh vào memory
- **CDN**: Không thể dùng CDN trực tiếp

---

## 🗄️ Cấu Trúc Bảng `media_files`

```sql
CREATE TABLE media_files (
    id UUID PRIMARY KEY,
    
    -- 3 CỘT QUAN TRỌNG:
    image_data BYTEA,              -- Dữ liệu binary của ảnh
    image_name VARCHAR(255),       -- Tên file: 'man-hau-giang.jpg'
    image_type VARCHAR(100),       -- MIME type: 'image/jpeg'
    
    -- Metadata
    file_size BIGINT,              -- Kích thước (bytes)
    width INTEGER,                 -- Chiều rộng (px)
    height INTEGER,                -- Chiều cao (px)
    alt_text VARCHAR(255),         -- Mô tả (SEO)
    category VARCHAR(50),          -- 'product', 'blog', 'avatar'
    
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 💻 Backend: Upload & Lưu Ảnh

### 1. Upload API (Express.js + Multer)

```typescript
import express from 'express';
import multer from 'multer';
import sharp from 'sharp'; // Để resize/optimize ảnh

const router = express.Router();

// Cấu hình Multer để lưu vào memory (không lưu file)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // Giới hạn 5MB
    },
    fileFilter: (req, file, cb) => {
        // Chỉ cho phép ảnh
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Chỉ chấp nhận file ảnh!'));
        }
    }
});

/**
 * POST /api/media/upload
 * Upload ảnh và lưu vào database
 */
router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Không có file được upload' });
        }

        const { category, alt_text, caption } = req.body;
        
        // Optimize ảnh trước khi lưu (resize, compress)
        const optimizedImage = await sharp(req.file.buffer)
            .resize(1200, 1200, { 
                fit: 'inside',
                withoutEnlargement: true 
            })
            .jpeg({ quality: 85 })
            .toBuffer();

        // Lấy metadata
        const metadata = await sharp(optimizedImage).metadata();

        // Lưu vào database
        const result = await db.query(`
            INSERT INTO media_files 
            (image_data, image_name, image_type, file_size, width, height, 
             category, alt_text, caption)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id, image_name, file_size, width, height
        `, [
            optimizedImage,                    // BYTEA
            req.file.originalname,             // Tên file
            'image/jpeg',                      // MIME type (sau khi convert)
            optimizedImage.length,             // Kích thước
            metadata.width,                    // Chiều rộng
            metadata.height,                   // Chiều cao
            category || 'general',
            alt_text,
            caption
        ]);

        res.status(201).json({
            success: true,
            message: 'Upload thành công',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
```

### 2. Serve Ảnh từ Database

```typescript
/**
 * GET /api/media/:id
 * Lấy ảnh từ database và trả về
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(`
            SELECT image_data, image_name, image_type 
            FROM media_files 
            WHERE id = $1 AND deleted_at IS NULL
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy ảnh' });
        }

        const { image_data, image_name, image_type } = result.rows[0];

        // Set headers
        res.setHeader('Content-Type', image_type);
        res.setHeader('Content-Disposition', `inline; filename="${image_name}"`);
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache 1 năm

        // Trả về binary data
        res.send(image_data);

    } catch (error) {
        console.error('Serve image error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/media/:id/thumbnail
 * Tạo thumbnail on-the-fly
 */
router.get('/:id/thumbnail', async (req, res) => {
    try {
        const { id } = req.params;
        const { width = 200, height = 200 } = req.query;

        const result = await db.query(`
            SELECT image_data, image_type 
            FROM media_files 
            WHERE id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy ảnh' });
        }

        // Resize ảnh
        const thumbnail = await sharp(result.rows[0].image_data)
            .resize(Number(width), Number(height), { fit: 'cover' })
            .jpeg({ quality: 80 })
            .toBuffer();

        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        res.send(thumbnail);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

---

## 🎨 Frontend: Upload & Hiển Thị

### 1. Upload Component (React)

```tsx
import React, { useState } from 'react';
import axios from 'axios';

const ImageUploader: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>('');
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            
            // Preview local
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);
        formData.append('category', 'product');
        formData.append('alt_text', 'Mô tả ảnh');

        try {
            const response = await axios.post('/api/media/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log('Upload success:', response.data);
            alert('Upload thành công!');
            
        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload thất bại!');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Upload Hình Ảnh</h2>
            
            {/* Preview */}
            {preview && (
                <div className="mb-4">
                    <img 
                        src={preview} 
                        alt="Preview" 
                        className="w-64 h-64 object-cover rounded-lg"
                    />
                </div>
            )}
            
            {/* File Input */}
            <input 
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                className="mb-4"
            />
            
            {/* Upload Button */}
            <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="px-6 py-2 bg-green-500 text-white rounded-lg
                           disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
                {uploading ? 'Đang upload...' : 'Upload'}
            </button>
        </div>
    );
};

export default ImageUploader;
```

### 2. Hiển Thị Ảnh từ Database

```tsx
interface ImageProps {
    imageId: string;
    alt?: string;
    className?: string;
    thumbnail?: boolean;
}

const DatabaseImage: React.FC<ImageProps> = ({ 
    imageId, 
    alt = '', 
    className = '',
    thumbnail = false 
}) => {
    const imageUrl = thumbnail 
        ? `/api/media/${imageId}/thumbnail?width=300&height=300`
        : `/api/media/${imageId}`;

    return (
        <img 
            src={imageUrl}
            alt={alt}
            className={className}
            loading="lazy"
        />
    );
};

// Sử dụng:
<DatabaseImage 
    imageId="uuid-cua-anh" 
    alt="Mận Hậu Giang"
    className="w-full h-64 object-cover rounded-lg"
    thumbnail={true}
/>
```

---

## 🔧 Tối Ưu Performance

### 1. Lazy Loading với React

```tsx
import { useState, useEffect } from 'react';

const LazyImage: React.FC<{ imageId: string }> = ({ imageId }) => {
    const [imageSrc, setImageSrc] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadImage = async () => {
            try {
                const response = await fetch(`/api/media/${imageId}`);
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                setImageSrc(url);
            } catch (error) {
                console.error('Load image error:', error);
            } finally {
                setLoading(false);
            }
        };

        loadImage();

        // Cleanup
        return () => {
            if (imageSrc) {
                URL.revokeObjectURL(imageSrc);
            }
        };
    }, [imageId]);

    if (loading) {
        return <div className="w-full h-64 bg-gray-200 animate-pulse rounded-lg" />;
    }

    return <img src={imageSrc} className="w-full h-64 object-cover rounded-lg" />;
};
```

### 2. Caching với Redis (Optional)

```typescript
import Redis from 'ioredis';
const redis = new Redis();

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    
    // Check cache
    const cached = await redis.getBuffer(`image:${id}`);
    if (cached) {
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('X-Cache', 'HIT');
        return res.send(cached);
    }

    // Load from database
    const result = await db.query(`
        SELECT image_data, image_type FROM media_files WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Not found' });
    }

    const { image_data, image_type } = result.rows[0];

    // Cache for 1 hour
    await redis.setex(`image:${id}`, 3600, image_data);

    res.setHeader('Content-Type', image_type);
    res.setHeader('X-Cache', 'MISS');
    res.send(image_data);
});
```

---

## 📊 Ví Dụ Sử Dụng Thực Tế

### 1. Upload Ảnh Sản Phẩm

```typescript
// Tạo sản phẩm với ảnh
const createProduct = async (productData: any, imageFile: File) => {
    // 1. Upload ảnh trước
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('category', 'product');
    
    const uploadResponse = await axios.post('/api/media/upload', formData);
    const imageId = uploadResponse.data.data.id;

    // 2. Tạo sản phẩm với thumbnail_id
    const productResponse = await axios.post('/api/products', {
        ...productData,
        thumbnail_id: imageId
    });

    return productResponse.data;
};
```

### 2. Lấy Sản Phẩm với Ảnh

```typescript
// Backend API
router.get('/products/:id', async (req, res) => {
    const product = await db.query(`
        SELECT 
            p.*,
            m.id as image_id,
            m.image_name,
            m.alt_text
        FROM products p
        LEFT JOIN media_files m ON p.thumbnail_id = m.id
        WHERE p.id = $1
    `, [req.params.id]);

    res.json({
        ...product.rows[0],
        image_url: `/api/media/${product.rows[0].image_id}`
    });
});
```

---

## ⚠️ Lưu Ý Quan Trọng

### 1. Giới Hạn Kích Thước
```typescript
// Luôn resize ảnh trước khi lưu
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1920;
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const optimizedImage = await sharp(buffer)
    .resize(MAX_WIDTH, MAX_HEIGHT, { 
        fit: 'inside',
        withoutEnlargement: true 
    })
    .jpeg({ quality: 85 })
    .toBuffer();

if (optimizedImage.length > MAX_SIZE) {
    throw new Error('Ảnh quá lớn sau khi optimize');
}
```

### 2. Backup Database
```bash
# Backup PostgreSQL với BYTEA
pg_dump -U postgres -d greenacres -F c -b -v -f backup.dump

# Restore
pg_restore -U postgres -d greenacres_new -v backup.dump
```

### 3. Migration từ File sang BYTEA
```typescript
// Script để migrate ảnh từ filesystem vào database
import fs from 'fs';
import path from 'path';

const migrateImages = async () => {
    const imageDir = './uploads';
    const files = fs.readdirSync(imageDir);

    for (const file of files) {
        const filePath = path.join(imageDir, file);
        const imageBuffer = fs.readFileSync(filePath);
        const mimeType = `image/${path.extname(file).slice(1)}`;

        await db.query(`
            INSERT INTO media_files (image_data, image_name, image_type, file_size)
            VALUES ($1, $2, $3, $4)
        `, [imageBuffer, file, mimeType, imageBuffer.length]);

        console.log(`Migrated: ${file}`);
    }
};
```

---

## 🎯 Kết Luận

**Cách lưu BYTEA phù hợp khi**:
- ✅ Database nhỏ, vừa (< 100GB)
- ✅ Số lượng ảnh không quá nhiều (< 10,000 ảnh)
- ✅ Cần portable, dễ backup
- ✅ Không cần CDN

**Nên chuyển sang File Storage khi**:
- ❌ Database quá lớn (> 100GB)
- ❌ Nhiều ảnh (> 10,000 ảnh)
- ❌ Cần CDN để tăng tốc
- ❌ Cần serve ảnh cho nhiều user đồng thời

Bạn đang ở giai đoạn đầu nên **BYTEA là lựa chọn tốt**! 🎉
