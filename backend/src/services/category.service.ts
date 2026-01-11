import pool from '../config/database';

export interface Category {
    id: string;
    category_code: string;
    category_name: string;
    parent_id?: string;
    scope: 'FARM' | 'PERSONAL' | 'BOTH';
    parent_name?: string; // Join field
    children?: Category[]; // For tree structure
}

export interface CreateCategoryInput {
    category_code: string;
    category_name: string;
    parent_id?: string;
    scope: 'FARM' | 'PERSONAL' | 'BOTH';
}

export interface UpdateCategoryInput {
    category_name?: string;
    parent_id?: string;
    scope?: 'FARM' | 'PERSONAL' | 'BOTH';
}

// Tạo danh mục mới
export const createCategory = async (data: CreateCategoryInput): Promise<Category> => {
    const query = `
        INSERT INTO categories (category_code, category_name, parent_id, scope)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `;
    const values = [data.category_code, data.category_name, data.parent_id || null, data.scope];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Lấy danh sách danh mục
export const getCategories = async (scope?: string, parentId?: string | null): Promise<Category[]> => {
    let query = `
        SELECT c.*, p.category_name as parent_name
        FROM categories c
        LEFT JOIN categories p ON c.parent_id = p.id
        WHERE 1=1
    `;
    const values: any[] = [];
    let paramIndex = 1;

    if (scope) {
        query += ` AND (c.scope = $${paramIndex++} OR c.scope = 'BOTH')`;
        values.push(scope);
    }

    if (parentId !== undefined) {
        if (parentId === null) {
            query += ` AND c.parent_id IS NULL`;
        } else {
            query += ` AND c.parent_id = $${paramIndex++}`;
            values.push(parentId);
        }
    }

    query += ' ORDER BY c.category_name ASC';

    const result = await pool.query(query, values);
    return result.rows;
};

// Lấy cây danh mục (hierarchical)
export const getCategoryTree = async (scope?: string): Promise<Category[]> => {
    // Lấy tất cả danh mục gốc
    const rootCategories = await getCategories(scope, null);

    // Đệ quy lấy con
    const buildTree = async (category: Category): Promise<Category> => {
        const children = await getCategories(scope, category.id);
        if (children.length > 0) {
            category.children = await Promise.all(children.map(child => buildTree(child)));
        }
        return category;
    };

    return Promise.all(rootCategories.map(cat => buildTree(cat)));
};

// Lấy danh mục theo ID
export const getCategoryById = async (id: string): Promise<Category | null> => {
    const query = `
        SELECT c.*, p.category_name as parent_name
        FROM categories c
        LEFT JOIN categories p ON c.parent_id = p.id
        WHERE c.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
};

// Cập nhật danh mục
export const updateCategory = async (id: string, data: UpdateCategoryInput): Promise<Category | null> => {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.category_name !== undefined) {
        fields.push(`category_name = $${paramIndex++}`);
        values.push(data.category_name);
    }
    if (data.parent_id !== undefined) {
        fields.push(`parent_id = $${paramIndex++}`);
        values.push(data.parent_id);
    }
    if (data.scope !== undefined) {
        fields.push(`scope = $${paramIndex++}`);
        values.push(data.scope);
    }

    if (fields.length === 0) {
        return getCategoryById(id);
    }

    values.push(id);
    const query = `
        UPDATE categories 
        SET ${fields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
};

// Xóa danh mục
export const deleteCategory = async (id: string): Promise<boolean> => {
    // Kiểm tra xem có danh mục con không
    const childrenQuery = 'SELECT COUNT(*) as count FROM categories WHERE parent_id = $1';
    const childrenResult = await pool.query(childrenQuery, [id]);

    if (parseInt(childrenResult.rows[0].count) > 0) {
        throw new Error('Cannot delete category with children');
    }

    const query = 'DELETE FROM categories WHERE id = $1';
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
};

// Thống kê danh mục
export const getCategoryStats = async (): Promise<any> => {
    const query = `
        SELECT 
            scope,
            COUNT(*) as count,
            COUNT(CASE WHEN parent_id IS NULL THEN 1 END) as root_count,
            COUNT(CASE WHEN parent_id IS NOT NULL THEN 1 END) as child_count
        FROM categories
        GROUP BY scope
    `;
    const result = await pool.query(query);
    return result.rows;
};
