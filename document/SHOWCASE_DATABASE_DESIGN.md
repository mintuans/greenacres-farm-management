# 📊 Thiết Kế CSDL Trang Showcase - GreenAcres Farm

## 🎯 Tổng Quan

Thiết kế này hỗ trợ đầy đủ các tính năng cho trang showcase công khai:
- ✅ Quản lý sản phẩm với hình ảnh
- ✅ Hệ thống blog/tin tức
- ✅ Thư viện hình ảnh tập trung
- ✅ Đánh giá sản phẩm (rating + review)
- ✅ Bình luận có thể trả lời (nested comments)
- ✅ Thả cảm xúc (reactions) cho bình luận
- ✅ Hỗ trợ người dùng không đăng nhập và đã đăng nhập

---

## 📦 Cấu Trúc Database

### 1️⃣ **QUẢN LÝ HÌNH ẢNH** (`media_files`)

**Mục đích**: Lưu trữ tập trung tất cả hình ảnh/video

```
media_files
├── id (UUID)
├── file_name, file_path, file_url
├── file_type, file_size
├── alt_text, caption (SEO)
├── width, height
├── category ('product', 'blog', 'gallery', 'avatar')
└── uploaded_at, is_public
```

**Ưu điểm**:
- ✅ Tái sử dụng hình ảnh cho nhiều mục đích
- ✅ Dễ quản lý và backup
- ✅ Hỗ trợ cả local storage và cloud (S3, Cloudinary)

**Cách sử dụng**:
```sql
-- Upload ảnh mới
INSERT INTO media_files (file_name, file_path, file_url, category)
VALUES ('man-hau-giang.jpg', '/uploads/products/man-hau-giang.jpg', 
        'https://cdn.example.com/man-hau-giang.jpg', 'product');

-- Lấy tất cả ảnh sản phẩm
SELECT * FROM media_files WHERE category = 'product' AND is_public = TRUE;
```

---

### 2️⃣ **QUẢN LÝ SẢN PHẨM**

#### A. `product_categories` - Danh mục sản phẩm
```
product_categories
├── id, category_code, category_name
├── slug (URL-friendly: 'trai-cay-tuoi')
├── parent_id (hỗ trợ danh mục con)
├── thumbnail_id → media_files
└── display_order, is_active
```

**Ví dụ cấu trúc danh mục**:
```
Trái cây (parent_id = NULL)
├── Trái cây nhiệt đới (parent_id = Trái cây)
├── Trái cây ôn đới (parent_id = Trái cây)

Rau củ (parent_id = NULL)
├── Rau ăn lá
└── Củ quả
```

#### B. `products` - Sản phẩm chính
```
products
├── id, product_code, product_name
├── slug ('man-hau-giang-organic')
├── category_id → product_categories
├── short_description, full_description
├── price, original_price (để hiển thị giảm giá)
├── stock_quantity, unit_of_measure
├── thumbnail_id → media_files
├── status ('DRAFT', 'PUBLISHED', 'OUT_OF_STOCK')
├── is_featured (sản phẩm nổi bật)
├── meta_title, meta_description (SEO)
└── view_count, sold_count
```

#### C. `product_media` - Nhiều ảnh cho 1 sản phẩm
```
product_media
├── product_id → products
├── media_id → media_files
├── display_order
└── is_primary (ảnh chính)
```

**Cách sử dụng**:
```sql
-- Tạo sản phẩm mới
INSERT INTO products (product_code, product_name, slug, category_id, price, stock_quantity)
VALUES ('MAN-HG-001', 'Mận Hậu Giang Organic', 'man-hau-giang-organic', 
        'uuid-danh-muc', 150000, 100);

-- Thêm nhiều ảnh cho sản phẩm
INSERT INTO product_media (product_id, media_id, display_order, is_primary)
VALUES 
    ('product-uuid', 'media-uuid-1', 1, TRUE),
    ('product-uuid', 'media-uuid-2', 2, FALSE),
    ('product-uuid', 'media-uuid-3', 3, FALSE);

-- Lấy sản phẩm với tất cả ảnh
SELECT p.*, 
       json_agg(json_build_object('url', m.file_url, 'order', pm.display_order)) as images
FROM products p
LEFT JOIN product_media pm ON p.id = pm.product_id
LEFT JOIN media_files m ON pm.media_id = m.id
WHERE p.id = 'product-uuid'
GROUP BY p.id;
```

#### D. `product_variants` - Biến thể sản phẩm
```
product_variants
├── product_id → products
├── variant_name ('Size L', 'Hộp 500g')
├── sku (mã riêng)
├── price, stock_quantity
└── is_active
```

---

### 3️⃣ **QUẢN LÝ BLOG/TIN TỨC**

#### A. `blog_categories` - Danh mục blog
```
blog_categories
├── id, category_code, category_name
├── slug
└── display_order, is_active
```

#### B. `blog_posts` - Bài viết
```
blog_posts
├── id, title, slug
├── category_id → blog_categories
├── excerpt (tóm tắt), content (nội dung đầy đủ)
├── featured_image_id → media_files
├── author_name, author_id
├── status ('DRAFT', 'PUBLISHED', 'ARCHIVED')
├── meta_title, meta_description (SEO)
├── view_count
└── created_at, published_at
```

#### C. `blog_tags` + `blog_post_tags` - Tags
```
blog_tags: id, tag_name, slug
blog_post_tags: blog_post_id ↔ tag_id (many-to-many)
```

**Cách sử dụng**:
```sql
-- Tạo bài viết mới
INSERT INTO blog_posts (title, slug, category_id, excerpt, content, status)
VALUES ('Cách trồng mận hiệu quả', 'cach-trong-man-hieu-qua', 
        'category-uuid', 'Hướng dẫn chi tiết...', 'Nội dung đầy đủ...', 'PUBLISHED');

-- Thêm tags
INSERT INTO blog_post_tags (blog_post_id, tag_id)
VALUES ('post-uuid', 'tag-uuid-1'), ('post-uuid', 'tag-uuid-2');

-- Lấy bài viết với tags
SELECT bp.*, 
       json_agg(bt.tag_name) as tags
FROM blog_posts bp
LEFT JOIN blog_post_tags bpt ON bp.id = bpt.blog_post_id
LEFT JOIN blog_tags bt ON bpt.tag_id = bt.id
WHERE bp.id = 'post-uuid'
GROUP BY bp.id;
```

---

### 4️⃣ **HỆ THỐNG NGƯỜI DÙNG CÔNG KHAI**

#### `public_users` - Khách hàng/Người dùng
```
public_users
├── id
├── email, phone (unique)
├── password_hash (bcrypt)
├── full_name, avatar_id
├── google_id, facebook_id (đăng nhập mạng xã hội)
├── is_verified, is_active
└── created_at, last_login_at
```

**3 Cách Người Dùng Có Thể Bình Luận**:

1. **Đã đăng nhập** → `user_id` có giá trị
2. **Chưa đăng nhập nhưng nhập tên/email** → `commenter_name`, `commenter_email` có giá trị
3. **Dùng session/IP** → Lưu `session_id` để tránh spam

---

### 5️⃣ **HỆ THỐNG ĐÁNH GIÁ & BÌNH LUẬN**

#### A. `product_reviews` - Đánh giá sản phẩm
```
product_reviews
├── id, product_id → products
├── user_id → public_users (hoặc NULL)
├── reviewer_name, reviewer_email (nếu không đăng nhập)
├── rating (1-5 sao)
├── title, content
├── images (JSONB - array các media_id)
├── status ('PENDING', 'APPROVED', 'REJECTED')
├── is_verified_purchase (đã mua hàng chưa)
└── helpful_count (số người thấy hữu ích)
```

**Cách sử dụng**:
```sql
-- Người dùng đã đăng nhập đánh giá
INSERT INTO product_reviews (product_id, user_id, rating, title, content)
VALUES ('product-uuid', 'user-uuid', 5, 'Sản phẩm tuyệt vời!', 'Mận rất ngon...');

-- Người dùng chưa đăng nhập đánh giá
INSERT INTO product_reviews (product_id, reviewer_name, reviewer_email, rating, content)
VALUES ('product-uuid', 'Nguyễn Văn A', 'a@example.com', 4, 'Chất lượng tốt');

-- Lấy đánh giá trung bình
SELECT product_id, 
       AVG(rating) as avg_rating, 
       COUNT(*) as review_count
FROM product_reviews
WHERE status = 'APPROVED'
GROUP BY product_id;
```

#### B. `comments` - Bình luận (Polymorphic)
```
comments
├── id
├── commentable_type ('product', 'blog_post')
├── commentable_id (ID của sản phẩm hoặc bài viết)
├── user_id → public_users (hoặc NULL)
├── commenter_name, commenter_email (nếu không đăng nhập)
├── content
├── parent_id → comments (để trả lời bình luận)
├── status ('PENDING', 'APPROVED', 'REJECTED', 'SPAM')
└── created_at
```

**Cấu trúc Nested Comments**:
```
Comment 1 (parent_id = NULL)
├── Reply 1.1 (parent_id = Comment 1)
│   └── Reply 1.1.1 (parent_id = Reply 1.1)
└── Reply 1.2 (parent_id = Comment 1)

Comment 2 (parent_id = NULL)
```

**Cách sử dụng**:
```sql
-- Bình luận gốc cho sản phẩm
INSERT INTO comments (commentable_type, commentable_id, user_id, content)
VALUES ('product', 'product-uuid', 'user-uuid', 'Sản phẩm này có ship toàn quốc không?');

-- Trả lời bình luận
INSERT INTO comments (commentable_type, commentable_id, parent_id, commenter_name, content)
VALUES ('product', 'product-uuid', 'comment-uuid-1', 'Admin', 'Có ạ, shop ship toàn quốc!');

-- Lấy tất cả bình luận với replies (recursive)
WITH RECURSIVE comment_tree AS (
    -- Bình luận gốc
    SELECT c.*, 0 as level
    FROM comments c
    WHERE c.commentable_type = 'product' 
      AND c.commentable_id = 'product-uuid'
      AND c.parent_id IS NULL
      AND c.status = 'APPROVED'
    
    UNION ALL
    
    -- Replies
    SELECT c.*, ct.level + 1
    FROM comments c
    INNER JOIN comment_tree ct ON c.parent_id = ct.id
    WHERE c.status = 'APPROVED'
)
SELECT * FROM comment_tree ORDER BY created_at;
```

#### C. `comment_reactions` - Thả cảm xúc
```
comment_reactions
├── id, comment_id → comments
├── user_id → public_users (hoặc NULL)
├── session_id (nếu không đăng nhập)
├── reaction_type ('like', 'love', 'haha', 'wow', 'sad', 'angry')
└── created_at
```

**Constraint**: Một người chỉ được thả 1 cảm xúc cho 1 bình luận

**Cách sử dụng**:
```sql
-- Người dùng đã đăng nhập thả like
INSERT INTO comment_reactions (comment_id, user_id, reaction_type)
VALUES ('comment-uuid', 'user-uuid', 'like')
ON CONFLICT (comment_id, user_id) 
DO UPDATE SET reaction_type = 'like';

-- Người dùng chưa đăng nhập (dùng session)
INSERT INTO comment_reactions (comment_id, session_id, reaction_type)
VALUES ('comment-uuid', 'session-xyz', 'love')
ON CONFLICT (comment_id, session_id) 
DO UPDATE SET reaction_type = 'love';

-- Đếm reactions cho bình luận
SELECT comment_id, 
       reaction_type, 
       COUNT(*) as count
FROM comment_reactions
WHERE comment_id = 'comment-uuid'
GROUP BY comment_id, reaction_type;
```

#### D. `review_helpful` - Đánh dấu đánh giá hữu ích
```
review_helpful
├── review_id → product_reviews
├── user_id (hoặc session_id)
└── is_helpful (TRUE/FALSE)
```

---

## 🎨 Views Để Truy Vấn Nhanh

### 1. `v_products_full` - Sản phẩm với rating
```sql
SELECT * FROM v_products_full WHERE status = 'PUBLISHED' ORDER BY avg_rating DESC;
```

### 2. `v_blog_posts_full` - Blog với số bình luận
```sql
SELECT * FROM v_blog_posts_full WHERE status = 'PUBLISHED' ORDER BY published_at DESC;
```

### 3. `v_comments_with_reactions` - Bình luận với reactions
```sql
SELECT * FROM v_comments_with_reactions 
WHERE commentable_type = 'product' AND commentable_id = 'product-uuid';
```

---

## 🔐 Xử Lý Người Dùng Không Đăng Nhập

### Phương án 1: Session-based (Khuyến nghị)
```javascript
// Backend tạo session ID khi người dùng truy cập
const sessionId = req.session.id || generateSessionId();

// Lưu bình luận với session_id
await db.comments.create({
    commentable_type: 'product',
    commentable_id: productId,
    session_id: sessionId,
    commenter_name: 'Khách',
    content: 'Bình luận...'
});
```

### Phương án 2: Email-based
```javascript
// Yêu cầu nhập email để bình luận
await db.comments.create({
    commentable_type: 'product',
    commentable_id: productId,
    commenter_email: 'user@example.com',
    commenter_name: 'Nguyễn Văn A',
    content: 'Bình luận...'
});
```

### Phương án 3: IP-based (Không khuyến nghị - dễ bị spam)
```javascript
const ipAddress = req.ip;
// Lưu IP vào session_id
```

---

## 🚀 Luồng Hoạt Động

### 1️⃣ Người dùng xem sản phẩm
```
1. GET /api/products/:slug
2. Tăng view_count
3. Lấy thông tin sản phẩm từ v_products_full
4. Lấy danh sách ảnh từ product_media
5. Lấy đánh giá từ product_reviews (status = APPROVED)
6. Lấy bình luận từ comments (với reactions)
```

### 2️⃣ Người dùng đánh giá sản phẩm
```
1. POST /api/products/:id/reviews
2. Kiểm tra user_id hoặc yêu cầu email
3. Insert vào product_reviews với status = PENDING
4. Admin duyệt → status = APPROVED
5. Hiển thị trên trang sản phẩm
```

### 3️⃣ Người dùng bình luận
```
1. POST /api/comments
   Body: {
       commentable_type: 'product',
       commentable_id: 'uuid',
       content: 'Bình luận...',
       parent_id: null (hoặc uuid nếu trả lời)
   }
2. Kiểm tra user_id hoặc session_id
3. Insert vào comments với status = PENDING
4. Admin duyệt → status = APPROVED
5. Hiển thị real-time (WebSocket) hoặc reload
```

### 4️⃣ Người dùng thả cảm xúc
```
1. POST /api/comments/:id/reactions
   Body: { reaction_type: 'like' }
2. Kiểm tra user_id hoặc session_id
3. Upsert vào comment_reactions
4. Cập nhật UI real-time
```

---

## 📊 Queries Thường Dùng

### Lấy sản phẩm nổi bật
```sql
SELECT * FROM v_products_full 
WHERE is_featured = TRUE AND status = 'PUBLISHED'
ORDER BY sold_count DESC
LIMIT 10;
```

### Lấy sản phẩm theo danh mục
```sql
SELECT * FROM v_products_full 
WHERE category_id = 'category-uuid' AND status = 'PUBLISHED'
ORDER BY created_at DESC;
```

### Lấy bài viết mới nhất
```sql
SELECT * FROM v_blog_posts_full 
WHERE status = 'PUBLISHED'
ORDER BY published_at DESC
LIMIT 5;
```

### Lấy bình luận có nhiều reactions nhất
```sql
SELECT * FROM v_comments_with_reactions
WHERE commentable_type = 'product' AND commentable_id = 'product-uuid'
ORDER BY reaction_count DESC;
```

---

## 🛡️ Bảo Mật & Chống Spam

### 1. Rate Limiting
```javascript
// Giới hạn số lần bình luận/đánh giá trong 1 giờ
const rateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 giờ
    max: 5, // Tối đa 5 bình luận
    message: 'Bạn đã bình luận quá nhiều, vui lòng thử lại sau'
});
```

### 2. Content Moderation
```javascript
// Kiểm tra nội dung spam/toxic
const badWords = ['spam', 'scam', ...];
const containsBadWords = badWords.some(word => content.includes(word));

if (containsBadWords) {
    status = 'REJECTED';
}
```

### 3. Email Verification
```javascript
// Gửi email xác nhận trước khi hiển thị bình luận
await sendVerificationEmail(commenter_email);
```

---

## 🎯 Kết Luận

Thiết kế này cung cấp:
- ✅ **Linh hoạt**: Hỗ trợ cả người dùng đã/chưa đăng nhập
- ✅ **Mở rộng**: Dễ thêm tính năng mới (wishlist, cart, orders...)
- ✅ **Hiệu năng**: Có indexes và views tối ưu
- ✅ **Bảo mật**: Có moderation và rate limiting
- ✅ **SEO-friendly**: Có slug, meta tags

**Next Steps**:
1. Chạy file `database_showcase.sql` để tạo tables
2. Tạo API endpoints cho frontend
3. Implement UI cho trang showcase
4. Thêm authentication (JWT, OAuth)
5. Deploy và test
