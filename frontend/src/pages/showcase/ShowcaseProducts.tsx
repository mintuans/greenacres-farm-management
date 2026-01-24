import React, { useEffect, useState } from 'react';
import { getProducts, getProductCategories, getMediaUrl, Product, ProductCategory } from '../../services/products.service';
import ShowcaseHeader from '../../templates/ShowcaseHeader';

const ShowcaseProducts: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadCategories();
        loadProducts();
    }, [selectedCategory, searchQuery]);

    const loadCategories = async () => {
        try {
            const response = await getProductCategories();
            setCategories(response.data);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const loadProducts = async () => {
        try {
            setLoading(true);
            const response = await getProducts({
                category_id: selectedCategory || undefined,
                search: searchQuery || undefined,
                page: 1,
                limit: 12
            });
            setProducts(response.data);
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f6f8f6]">
            <ShowcaseHeader
                searchTerm={searchQuery}
                setSearchTerm={setSearchQuery}
                placeholder="Tìm sản phẩm..."
            />

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar - Categories */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <h2 className="text-lg font-bold mb-4">Danh mục</h2>
                            <div className="space-y-2">
                                <button
                                    onClick={() => setSelectedCategory('')}
                                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${selectedCategory === ''
                                        ? 'bg-[#13ec49] text-[#102215] font-bold'
                                        : 'hover:bg-gray-100'
                                        }`}
                                >
                                    Tất cả
                                </button>
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => setSelectedCategory(category.id)}
                                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${selectedCategory === category.id
                                            ? 'bg-[#13ec49] text-[#102215] font-bold'
                                            : 'hover:bg-gray-100'
                                            }`}
                                    >
                                        {category.category_name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="lg:col-span-3">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
                                        <div className="w-full h-64 bg-gray-200"></div>
                                        <div className="p-4 space-y-3">
                                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div className="bg-white rounded-xl p-12 text-center">
                                <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm nào</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map((product) => (
                                    <div
                                        key={product.id}
                                        className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow cursor-pointer group"
                                    >
                                        {/* Product Image */}
                                        <div className="relative w-full h-64 bg-gray-100 overflow-hidden">
                                            {product.thumbnail_id ? (
                                                <img
                                                    src={getMediaUrl(product.thumbnail_id)}
                                                    alt={product.product_name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    onError={(e) => {
                                                        e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image';
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <span className="material-symbols-outlined text-6xl">image</span>
                                                </div>
                                            )}

                                            {/* Badge */}
                                            {product.is_featured && (
                                                <span className="absolute top-3 left-3 bg-[#13ec49] text-[#102215] text-xs font-bold px-3 py-1 rounded-full">
                                                    Nổi bật
                                                </span>
                                            )}
                                        </div>

                                        {/* Product Info */}
                                        <div className="p-4">
                                            <h3 className="text-lg font-bold text-[#111813] mb-2 line-clamp-2 group-hover:text-[#13ec49] transition-colors">
                                                {product.product_name}
                                            </h3>

                                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                {product.short_description}
                                            </p>

                                            {/* Price */}
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-2xl font-bold text-[#13ec49]">
                                                    {Number(product.price).toLocaleString('vi-VN')}đ
                                                </span>
                                                {product.original_price && product.original_price > product.price && (
                                                    <span className="text-sm text-gray-400 line-through">
                                                        {Number(product.original_price).toLocaleString('vi-VN')}đ
                                                    </span>
                                                )}
                                            </div>

                                            {/* Rating & Stock */}
                                            <div className="flex items-center justify-between text-sm text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-yellow-500">⭐</span>
                                                    <span>{product.avg_rating ? Number(product.avg_rating).toFixed(1) : '0.0'}</span>
                                                    <span>({product.review_count || 0})</span>
                                                </div>
                                                <span className={product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                                                    {product.stock_quantity > 0 ? `Còn ${product.stock_quantity} ${product.unit_of_measure}` : 'Hết hàng'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShowcaseProducts;
