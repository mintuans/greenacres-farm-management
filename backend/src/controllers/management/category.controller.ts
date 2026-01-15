import { Request, Response } from 'express';
import * as categoryService from '../../services/category.service';
import { logActivity } from '../../services/audit-log.service';

// Tạo danh mục mới
export const createCategory = async (req: Request, res: Response): Promise<any> => {
    try {
        const category = await categoryService.createCategory(req.body);

        await logActivity(req, 'CREATE_CATEGORY', 'product_categories', category.id, null, req.body);

        return res.status(201).json({
            success: true,
            data: category,
            message: 'Category created successfully'
        });
    } catch (error: any) {
        console.error('Create category error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to create category'
        });
    }
};

// Lấy danh sách danh mục
export const getCategories = async (req: Request, res: Response): Promise<any> => {
    try {
        const { scope, parentId } = req.query;
        const categories = await categoryService.getCategories(
            scope as string,
            parentId === 'null' ? null : parentId as string
        );
        return res.json({
            success: true,
            data: categories
        });
    } catch (error: any) {
        console.error('Get categories error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get categories'
        });
    }
};

// Lấy cây danh mục
export const getCategoryTree = async (req: Request, res: Response): Promise<any> => {
    try {
        const { scope } = req.query;
        const tree = await categoryService.getCategoryTree(scope as string);
        return res.json({
            success: true,
            data: tree
        });
    } catch (error: any) {
        console.error('Get category tree error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get category tree'
        });
    }
};

// Lấy danh mục theo ID
export const getCategoryById = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const category = await categoryService.getCategoryById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        return res.json({
            success: true,
            data: category
        });
    } catch (error: any) {
        console.error('Get category error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get category'
        });
    }
};

// Cập nhật danh mục
export const updateCategory = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const oldCategory = await categoryService.getCategoryById(id);
        const category = await categoryService.updateCategory(id, req.body);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        await logActivity(req, 'UPDATE_CATEGORY', 'product_categories', id, oldCategory, req.body);

        return res.json({
            success: true,
            data: category,
            message: 'Category updated successfully'
        });
    } catch (error: any) {
        console.error('Update category error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to update category'
        });
    }
};

// Xóa danh mục
export const deleteCategory = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const oldCategory = await categoryService.getCategoryById(id);
        const deleted = await categoryService.deleteCategory(id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        await logActivity(req, 'DELETE_CATEGORY', 'product_categories', id, oldCategory, null);

        return res.json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error: any) {
        console.error('Delete category error:', error);

        if (error.message === 'Cannot delete category with children') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete category with children'
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete category'
        });
    }
};

// Lấy thống kê
export const getCategoryStats = async (_req: Request, res: Response): Promise<any> => {
    try {
        const stats = await categoryService.getCategoryStats();
        return res.json({
            success: true,
            data: stats
        });
    } catch (error: any) {
        console.error('Get stats error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get stats'
        });
    }
};
