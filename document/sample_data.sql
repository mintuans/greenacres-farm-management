-- =================================================================================
-- SAMPLE DATA - GREENACRES FARM SHOWCASE
-- Chạy file này sau khi đã tạo database schema
-- =================================================================================

-- =================================================================================
-- 1. DANH MỤC SẢN PHẨM
-- =================================================================================

INSERT INTO product_categories (category_code, category_name, slug, description, display_order, is_active)
VALUES 
    ('CAT-TRAI-CAY', 'Trái cây', 'trai-cay', 'Các loại trái cây tươi ngon', 1, TRUE),
    ('CAT-RAU-CU', 'Rau củ', 'rau-cu', 'Rau củ sạch, an toàn', 2, TRUE),
    ('CAT-ORGANIC', 'Sản phẩm Organic', 'organic', 'Sản phẩm hữu cơ 100%', 3, TRUE)
ON CONFLICT (category_code) DO NOTHING;

-- =================================================================================
-- 2. SẢN PHẨM
-- =================================================================================

-- Sản phẩm 1: Mận Hậu Giang
INSERT INTO products (
    product_code, product_name, slug, category_id,
    short_description, full_description,
    price, original_price, stock_quantity, unit_of_measure,
    status, is_featured
)
SELECT 
    'PROD-MAN-001', 
    'Mận Hậu Giang Organic', 
    'man-hau-giang-organic',
    id,
    'Mận tươi ngon, trồng theo phương pháp hữu cơ',
    '<h2>Giới thiệu</h2>
     <p>Mận Hậu Giang được trồng tại vườn của chúng tôi theo phương pháp hữu cơ 100%. Không sử dụng thuốc trừ sâu hóa học.</p>
     <h2>Đặc điểm</h2>
     <ul>
        <li>Trái to, đều, màu vàng đẹp</li>
        <li>Vị ngọt thanh, thơm mát</li>
        <li>Giàu vitamin C</li>
     </ul>',
    150000, 
    180000, 
    100, 
    'Kg',
    'PUBLISHED', 
    TRUE
FROM product_categories WHERE category_code = 'CAT-TRAI-CAY'
ON CONFLICT (product_code) DO NOTHING;

-- Sản phẩm 2: Cam Sành
INSERT INTO products (
    product_code, product_name, slug, category_id,
    short_description, full_description,
    price, stock_quantity, unit_of_measure,
    status, is_featured
)
SELECT 
    'PROD-CAM-001', 
    'Cam Sành Cao Lãnh', 
    'cam-sanh-cao-lanh',
    id,
    'Cam sành ngọt, mọng nước',
    '<h2>Giới thiệu</h2>
     <p>Cam sành Cao Lãnh nổi tiếng với vị ngọt thanh, mọng nước.</p>
     <h2>Công dụng</h2>
     <ul>
        <li>Bổ sung vitamin C</li>
        <li>Tăng cường sức đề kháng</li>
        <li>Làm đẹp da</li>
     </ul>',
    80000, 
    200, 
    'Kg',
    'PUBLISHED', 
    TRUE
FROM product_categories WHERE category_code = 'CAT-TRAI-CAY'
ON CONFLICT (product_code) DO NOTHING;

-- Sản phẩm 3: Rau cải xanh
INSERT INTO products (
    product_code, product_name, slug, category_id,
    short_description, full_description,
    price, stock_quantity, unit_of_measure,
    status, is_featured
)
SELECT 
    'PROD-RAU-001', 
    'Rau cải xanh hữu cơ', 
    'rau-cai-xanh-huu-co',
    id,
    'Rau cải xanh tươi, sạch, an toàn',
    '<h2>Giới thiệu</h2>
     <p>Rau cải xanh được trồng theo tiêu chuẩn VietGAP, không sử dụng hóa chất.</p>',
    25000, 
    50, 
    'Bó',
    'PUBLISHED', 
    FALSE
FROM product_categories WHERE category_code = 'CAT-RAU-CU'
ON CONFLICT (product_code) DO NOTHING;

-- =================================================================================
-- 3. DANH MỤC BLOG
-- =================================================================================

INSERT INTO blog_categories (category_code, category_name, slug, description, display_order, is_active)
VALUES 
    ('BLOG-HUONG-DAN', 'Hướng dẫn', 'huong-dan', 'Hướng dẫn trồng trọt', 1, TRUE),
    ('BLOG-TIN-TUC', 'Tin tức', 'tin-tuc', 'Tin tức nông nghiệp', 2, TRUE),
    ('BLOG-KINH-NGHIEM', 'Kinh nghiệm', 'kinh-nghiem', 'Chia sẻ kinh nghiệm', 3, TRUE)
ON CONFLICT (category_code) DO NOTHING;

-- =================================================================================
-- 4. TAGS
-- =================================================================================

INSERT INTO blog_tags (tag_name, slug)
VALUES 
    ('Trồng trọt', 'trong-trot'),
    ('Chăm sóc', 'cham-soc'),
    ('Thu hoạch', 'thu-hoach'),
    ('Organic', 'organic'),
    ('Mẹo hay', 'meo-hay')
ON CONFLICT (tag_name) DO NOTHING;

-- =================================================================================
-- 5. BÀI VIẾT BLOG
-- =================================================================================

-- Bài viết 1
INSERT INTO blog_posts (
    title, slug, category_id,
    excerpt, content,
    author_name, status, published_at
)
SELECT 
    'Cách trồng mận hiệu quả cho năng suất cao',
    'cach-trong-man-hieu-qua',
    id,
    'Hướng dẫn chi tiết từ A-Z cách trồng mận để đạt năng suất cao nhất. Chia sẻ kinh nghiệm thực tế từ nông dân.',
    '<h2>Chuẩn bị đất</h2>
     <p>Đất trồng mận cần tơi xốp, thoát nước tốt. pH từ 5.5-6.5 là thích hợp nhất.</p>
     
     <h2>Chọn giống</h2>
     <p>Nên chọn giống mận phù hợp với khí hậu địa phương. Ở miền Nam, mận Hậu Giang cho năng suất cao.</p>
     
     <h2>Trồng và chăm sóc</h2>
     <ul>
        <li>Khoảng cách trồng: 4m x 4m</li>
        <li>Bón phân định kỳ 3 tháng/lần</li>
        <li>Tưới nước đều đặn</li>
        <li>Tỉa cành, tạo tán</li>
     </ul>
     
     <h2>Thu hoạch</h2>
     <p>Mận chín sau 3-4 tháng kể từ khi ra hoa. Thu hoạch vào buổi sáng sớm để giữ được độ tươi.</p>',
    'Lê Minh Tuấn',
    'PUBLISHED',
    CURRENT_TIMESTAMP
FROM blog_categories WHERE category_code = 'BLOG-HUONG-DAN'
ON CONFLICT (slug) DO NOTHING;

-- Bài viết 2
INSERT INTO blog_posts (
    title, slug, category_id,
    excerpt, content,
    author_name, status, published_at
)
SELECT 
    'Mùa thu hoạch mận 2026 - Năng suất vượt kỳ vọng',
    'mua-thu-hoach-man-2026',
    id,
    'Năm nay, vườn mận của chúng tôi đạt năng suất kỷ lục với hơn 10 tấn mận chất lượng cao.',
    '<h2>Tổng quan mùa vụ</h2>
     <p>Mùa thu hoạch mận năm 2026 đã kết thúc với kết quả vượt mong đợi. Tổng sản lượng đạt 10.5 tấn, tăng 30% so với năm ngoái.</p>
     
     <h2>Bí quyết thành công</h2>
     <ul>
        <li>Áp dụng công nghệ tưới nhỏ giọt</li>
        <li>Sử dụng phân hữu cơ</li>
        <li>Chăm sóc kỹ lưỡng</li>
     </ul>',
    'Lê Minh Tuấn',
    'PUBLISHED',
    CURRENT_TIMESTAMP
FROM blog_categories WHERE category_code = 'BLOG-TIN-TUC'
ON CONFLICT (slug) DO NOTHING;

-- =================================================================================
-- 6. NGƯỜI DÙNG MẪU (để test bình luận)
-- =================================================================================

INSERT INTO public_users (email, full_name, is_verified, is_active)
VALUES 
    ('user1@example.com', 'Nguyễn Văn A', TRUE, TRUE),
    ('user2@example.com', 'Trần Thị B', TRUE, TRUE)
ON CONFLICT (email) DO NOTHING;

-- =================================================================================
-- 7. ĐÁNH GIÁ SẢN PHẨM MẪU
-- =================================================================================

-- Đánh giá cho Mận Hậu Giang
INSERT INTO product_reviews (
    product_id, reviewer_name, reviewer_email,
    rating, title, content
)
SELECT 
    p.id,
    'Nguyễn Văn A',
    'user1@example.com',
    5,
    'Sản phẩm tuyệt vời!',
    'Mận rất ngon, tươi, giao hàng nhanh. Tôi sẽ mua lại lần sau.'
FROM products p
WHERE p.product_code = 'PROD-MAN-001';

INSERT INTO product_reviews (
    product_id, reviewer_name, reviewer_email,
    rating, title, content
)
SELECT 
    p.id,
    'Trần Thị B',
    'user2@example.com',
    4,
    'Chất lượng tốt',
    'Mận ngon, giá hợp lý. Chỉ có điều hơi nhỏ một chút.'
FROM products p
WHERE p.product_code = 'PROD-MAN-001';

-- =================================================================================
-- 8. BÌNH LUẬN MẪU
-- =================================================================================

-- Bình luận cho sản phẩm
INSERT INTO comments (
    commentable_type, commentable_id,
    commenter_name, commenter_email,
    content
)
SELECT 
    'product',
    p.id,
    'Lê Văn C',
    'user3@example.com',
    'Sản phẩm này có ship toàn quốc không ạ?'
FROM products p
WHERE p.product_code = 'PROD-MAN-001';

-- Bình luận cho blog
INSERT INTO comments (
    commentable_type, commentable_id,
    commenter_name, commenter_email,
    content
)
SELECT 
    'blog_post',
    bp.id,
    'Phạm Thị D',
    'user4@example.com',
    'Bài viết rất hữu ích, cảm ơn tác giả!'
FROM blog_posts bp
WHERE bp.slug = 'cach-trong-man-hieu-qua';

-- =================================================================================
-- HẾT
-- =================================================================================

-- Kiểm tra dữ liệu đã insert
SELECT 'Product Categories' as table_name, COUNT(*) as count FROM product_categories
UNION ALL
SELECT 'Products', COUNT(*) FROM products
UNION ALL
SELECT 'Blog Categories', COUNT(*) FROM blog_categories
UNION ALL
SELECT 'Blog Posts', COUNT(*) FROM blog_posts
UNION ALL
SELECT 'Blog Tags', COUNT(*) FROM blog_tags
UNION ALL
SELECT 'Users', COUNT(*) FROM public_users
UNION ALL
SELECT 'Reviews', COUNT(*) FROM product_reviews
UNION ALL
SELECT 'Comments', COUNT(*) FROM comments;
