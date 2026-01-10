import pool from '../config/database';
import fs from 'fs';
import path from 'path';

const runSchema = async () => {
    try {
        console.log('🔄 Running database schema...');

        const schemaPath = path.join(__dirname, '../../document/database_showcase.sql');
        const schema = fs.readFileSync(schemaPath, 'utf-8');

        await pool.query(schema);

        console.log('✅ Database schema created successfully!');

        // Insert sample data
        await insertSampleData();

        process.exit(0);
    } catch (error) {
        console.error('❌ Error running schema:', error);
        process.exit(1);
    }
};

const insertSampleData = async () => {
    try {
        console.log('🔄 Inserting sample data...');

        // 1. Tạo danh mục sản phẩm
        await pool.query(`
            INSERT INTO product_categories (category_code, category_name, slug, display_order)
            VALUES 
                ('CAT-TRAI-CAY', 'Trái cây', 'trai-cay', 1),
                ('CAT-RAU-CU', 'Rau củ', 'rau-cu', 2),
                ('CAT-ORGANIC', 'Sản phẩm Organic', 'organic', 3)
            ON CONFLICT (category_code) DO NOTHING
        `);

        // 2. Tạo sản phẩm mẫu
        await pool.query(`
            INSERT INTO products (
                product_code, product_name, slug, category_id, 
                short_description, full_description, 
                price, original_price, stock_quantity, unit_of_measure, 
                status, is_featured
            )
            SELECT 
                'PROD-MAN-001', 'Mận Hậu Giang Organic', 'man-hau-giang-organic',
                id, 
                'Mận tươi ngon, trồng theo phương pháp hữu cơ',
                '<p>Mận Hậu Giang được trồng tại vườn của chúng tôi theo phương pháp hữu cơ 100%. Không sử dụng thuốc trừ sâu hóa học.</p>',
                150000, 180000, 100, 'Kg',
                'PUBLISHED', TRUE
            FROM product_categories WHERE category_code = 'CAT-TRAI-CAY'
            ON CONFLICT (product_code) DO NOTHING
        `);

        await pool.query(`
            INSERT INTO products (
                product_code, product_name, slug, category_id,
                short_description, full_description,
                price, stock_quantity, unit_of_measure,
                status, is_featured
            )
            SELECT 
                'PROD-CAM-001', 'Cam Sành Cao Lãnh', 'cam-sanh-cao-lanh',
                id,
                'Cam sành ngọt, mọng nước',
                '<p>Cam sành Cao Lãnh nổi tiếng với vị ngọt thanh, mọng nước.</p>',
                80000, 200, 'Kg',
                'PUBLISHED', TRUE
            FROM product_categories WHERE category_code = 'CAT-TRAI-CAY'
            ON CONFLICT (product_code) DO NOTHING
        `);

        console.log('✅ Sample data inserted successfully!');

    } catch (error) {
        console.error('❌ Error inserting sample data:', error);
    }
};

runSchema();
