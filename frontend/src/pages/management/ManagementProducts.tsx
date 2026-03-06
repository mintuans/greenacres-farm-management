import React, { useEffect, useState } from 'react';
import { getManagementProducts, createManagementProduct, updateManagementProduct, deleteManagementProduct, ManagementProduct } from '../../services/management-products.service';
import { getProductCategories, ProductCategory, getMediaUrl } from '../../services/products.service';
import { getMediaFiles, MediaFile } from '../../services/media.service';
import { ActionToolbar, ConfirmDeleteModal, ImportDataModal } from '../../components';

const ManagementProducts: React.FC = () => {
    const [products, setProducts] = useState<ManagementProduct[]>([]);
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ManagementProduct | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<ManagementProduct | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<ManagementProduct | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);

    // States cho Media Picker
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
    const [loadingMedia, setLoadingMedia] = useState(false);

    const [formData, setFormData] = useState({
        product_code: '',
        product_name: '',
        slug: '',
        category_id: '',
        short_description: '',
        full_description: '',
        price: 0,
        original_price: 0,
        stock_quantity: 0,
        unit_of_measure: 'Kg',
        status: 'DRAFT',
        is_featured: false,
        thumbnail_id: ''
    });

    useEffect(() => {
        loadProducts();
        loadCategories();
    }, [searchQuery]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const response = await getManagementProducts({ search: searchQuery || undefined });
            setProducts(response.data);
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const response = await getProductCategories();
            setCategories(response.data);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const handleOpenModal = (product?: ManagementProduct) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                product_code: product.product_code,
                product_name: product.product_name,
                slug: product.slug,
                category_id: product.category_id,
                short_description: product.short_description,
                full_description: product.full_description,
                price: product.price,
                original_price: product.original_price || 0,
                stock_quantity: product.stock_quantity,
                unit_of_measure: product.unit_of_measure,
                status: product.status,
                is_featured: product.is_featured,
                thumbnail_id: product.thumbnail_id || ''
            });
        } else {
            setEditingProduct(null);
            setFormData({
                product_code: '',
                product_name: '',
                slug: '',
                category_id: '',
                short_description: '',
                full_description: '',
                price: 0,
                original_price: 0,
                stock_quantity: 0,
                unit_of_measure: 'Kg',
                status: 'DRAFT',
                is_featured: false,
                thumbnail_id: ''
            });
        }
        setShowModal(true);
    };

    const handleOpenMediaPicker = async () => {
        setShowMediaPicker(true);
        setLoadingMedia(true);
        try {
            const response = await getMediaFiles({ category: 'product' });
            setMediaFiles(response.data);
        } catch (error) {
            console.error('Error loading media:', error);
        } finally {
            setLoadingMedia(false);
        }
    };

    const handleSelectMedia = (mediaId: string) => {
        setFormData({ ...formData, thumbnail_id: mediaId });
        setShowMediaPicker(false);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingProduct(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                await updateManagementProduct(editingProduct.id, formData);
                alert('Cập nhật sản phẩm thành công!');
            } else {
                await createManagementProduct(formData);
                alert('Tạo sản phẩm thành công!');
            }
            handleCloseModal();
            loadProducts();
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Có lỗi xảy ra!');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            setIsDeleting(true);
            await deleteManagementProduct(id);
            setDeleteTarget(null);
            setSelectedProduct(null);
            loadProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Có lỗi xảy ra!');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleImport = async (file: File) => {
        console.log('Importing products from:', file.name);
        return new Promise<void>((resolve) => setTimeout(resolve, 1500));
    };

    const handleExport = () => {
        console.log('Exporting products...');
        alert('Đang trích xuất danh sách sản phẩm ra file Excel...');
    };

    const handleDownloadTemplate = () => {
        console.log('Downloading product template...');
        alert('Đang tải tệp mẫu sản phẩm...');
    };

    return (
        <div className="p-3 md:p-4 w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">Quản lý Sản phẩm</h1>
                    <p className="text-slate-500 mt-2 font-medium">Hệ thống quản lý thông tin sản phẩm trên cửa hàng</p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
                <div className="p-3 md:p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
                            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#13ec49]/30 outline-none font-medium transition-all text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <ActionToolbar
                        onAdd={() => handleOpenModal()}
                        addLabel="Thêm sản phẩm"
                        onEdit={() => selectedProduct && handleOpenModal(selectedProduct)}
                        editDisabled={!selectedProduct}
                        onDelete={() => selectedProduct && setDeleteTarget(selectedProduct)}
                        deleteDisabled={!selectedProduct}
                        onRefresh={loadProducts}
                        isRefreshing={loading}
                        onImport={() => setShowImportModal(true)}
                        onExport={handleExport}
                        onDownloadTemplate={handleDownloadTemplate}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200 whitespace-nowrap">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Mã SP</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Tên sản phẩm</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Danh mục</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Giá</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Tồn kho</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Trạng thái</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                                    Đang tải...
                                </td>
                            </tr>
                        ) : products.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                                    Không có sản phẩm nào
                                </td>
                            </tr>
                        ) : (
                            products.map((product) => (
                                <tr
                                    key={product.id}
                                    onClick={() => setSelectedProduct(prev => prev?.id === product.id ? null : product)}
                                    className={`group transition-all cursor-pointer ${selectedProduct?.id === product.id ? 'bg-[#13ec49]/5 ring-1 ring-inset ring-[#13ec49]/30' : 'hover:bg-gray-50'}`}
                                >
                                    <td className="px-6 py-4 text-sm text-gray-900">{product.product_code}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                        <div className="flex items-center gap-3">
                                            {product.thumbnail_id && (
                                                <img
                                                    src={getMediaUrl(product.thumbnail_id)}
                                                    className="w-10 h-10 rounded object-cover bg-gray-100"
                                                    alt=""
                                                />
                                            )}
                                            {product.product_name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{product.category_name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{Number(product.price).toLocaleString('vi-VN')}đ</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{product.stock_quantity} {product.unit_of_measure}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${product.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {product.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleOpenModal(product); }}
                                                className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-all font-medium"
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setDeleteTarget(product); }}
                                                className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all font-medium"
                                            >
                                                Xóa
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h2 className="text-xl font-bold mb-4">
                                {editingProduct ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Mã sản phẩm</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#13ec49]"
                                            value={formData.product_code}
                                            onChange={(e) => setFormData({ ...formData, product_code: e.target.value })}
                                            disabled={!!editingProduct}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#13ec49]"
                                            value={formData.product_name}
                                            onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#13ec49]"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                                    <select
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#13ec49]"
                                        value={formData.category_id}
                                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                    >
                                        <option value="">-- Chọn danh mục --</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn</label>
                                    <textarea
                                        rows={2}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#13ec49]"
                                        value={formData.short_description}
                                        onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán</label>
                                        <input
                                            type="number"
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#13ec49]"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Giá gốc</label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#13ec49]"
                                            value={formData.original_price}
                                            onChange={(e) => setFormData({ ...formData, original_price: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tồn kho</label>
                                        <input
                                            type="number"
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#13ec49]"
                                            value={formData.stock_quantity}
                                            onChange={(e) => setFormData({ ...formData, stock_quantity: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#13ec49]"
                                            value={formData.unit_of_measure}
                                            onChange={(e) => setFormData({ ...formData, unit_of_measure: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                                        <select
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#13ec49]"
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        >
                                            <option value="DRAFT">DRAFT</option>
                                            <option value="PUBLISHED">PUBLISHED</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_featured"
                                        className="mr-2"
                                        checked={formData.is_featured}
                                        onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                                    />
                                    <label htmlFor="is_featured" className="text-sm font-medium text-gray-700">Sản phẩm nổi bật</label>
                                </div>

                                {/* Thumbnail Selection */}
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Ảnh đại diện (Thumbnail)</label>
                                    <div className="flex items-start gap-4">
                                        <div className="w-24 h-24 bg-white border border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {formData.thumbnail_id ? (
                                                <img
                                                    src={getMediaUrl(formData.thumbnail_id)}
                                                    className="w-full h-full object-cover"
                                                    alt="Preview"
                                                />
                                            ) : (
                                                <span className="text-gray-400 text-xs text-center p-1">Chưa chọn ảnh</span>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex gap-2 mb-2">
                                                <input
                                                    type="text"
                                                    placeholder="Dán Media ID..."
                                                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none"
                                                    value={formData.thumbnail_id}
                                                    onChange={(e) => setFormData({ ...formData, thumbnail_id: e.target.value })}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleOpenMediaPicker}
                                                    className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 whitespace-nowrap"
                                                >
                                                    Chọn từ thư viện
                                                </button>
                                            </div>
                                            <p className="text-[11px] text-gray-500">ID ảnh được lấy từ mục Quản lý Ảnh.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-[#13ec49] text-[#102215] font-bold rounded-lg hover:bg-[#10d63f]"
                                    >
                                        {editingProduct ? 'Cập nhật' : 'Tạo mới'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Media Picker Modal */}
            {showMediaPicker && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col">
                        <div className="p-4 border-b flex items-center justify-between">
                            <h3 className="font-bold text-lg">Chọn ảnh từ thư viện</h3>
                            <button onClick={() => setShowMediaPicker(false)} className="text-gray-500 hover:text-black">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-4 flex-1 overflow-y-auto">
                            {loadingMedia ? (
                                <div className="text-center py-10">Đang tải...</div>
                            ) : mediaFiles.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">Thư viện trống. Hãy upload ảnh trước!</div>
                            ) : (
                                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                    {mediaFiles.map((media) => (
                                        <div
                                            key={media.id}
                                            onClick={() => handleSelectMedia(media.id)}
                                            className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:ring-4 hover:ring-blue-500 transition-all"
                                        >
                                            <img
                                                src={getMediaUrl(media.id)}
                                                className="w-full h-full object-cover"
                                                alt={media.image_name}
                                            />
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center">
                                                <span className="bg-white text-blue-600 px-2 py-1 rounded text-[10px] font-bold opacity-0 group-hover:opacity-100">CHỌN</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Confirm Delete Modal */}
            <ConfirmDeleteModal
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
                isDeleting={isDeleting}
                itemName={deleteTarget?.product_name}
            />
            <ImportDataModal
                open={showImportModal}
                onClose={() => setShowImportModal(false)}
                onImport={handleImport}
                entityName="sản phẩm"
                columnGuide={['Mã sản phẩm', 'Tên sản phẩm', 'Slug', 'Mã danh mục', 'Mô tả ngắn', 'Giá bán', 'Giá gốc', 'Tồn kho', 'Đơn vị', 'Trạng thái (DRAFT/PUBLISHED)']}
                onDownloadTemplate={handleDownloadTemplate}
            />
        </div>
    );
};

export default ManagementProducts;
