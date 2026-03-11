import React, { useEffect, useState } from 'react';
import { getProducts, getProductCategories, getMediaUrl, Product, ProductCategory } from '../../services/products.service';
import ShowcaseHeader from '../../templates/ShowcaseHeader';
import { useTranslation } from 'react-i18next';

const ShowcaseProducts: React.FC = () => {
    const { t } = useTranslation();
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
                placeholder={t('showcase_products.search_placeholder')}
            />

            <div className="max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-8">
                {/* Mobile: flex row (categories left | products right), Desktop: grid */}
                <div className="flex gap-3 md:grid md:grid-cols-4 md:gap-8 items-start">

                    {/* Sidebar - Categories */}
                    <div className="shrink-0 w-[90px] md:w-auto md:col-span-1">
                        <div className="bg-white rounded-xl p-2 md:p-6 shadow-sm sticky top-[52px] md:top-[68px]">
                            <h2 className="text-xs md:text-lg font-bold mb-2 md:mb-4 text-center md:text-left">{t('showcase_products.categories')}</h2>
                            <div className="flex flex-col gap-1">
                                <button
                                    onClick={() => setSelectedCategory('')}
                                    className={`w-full text-left px-2 md:px-4 py-1.5 md:py-2 rounded-lg transition-colors text-xs md:text-sm ${selectedCategory === ''
                                        ? 'bg-[#13ec49] text-[#102215] font-bold'
                                        : 'hover:bg-gray-100 text-gray-700'
                                        }`}
                                >
                                    {t('showcase_products.all')}
                                </button>
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => setSelectedCategory(category.id)}
                                        className={`w-full text-left px-2 md:px-4 py-1.5 md:py-2 rounded-lg transition-colors text-xs md:text-sm leading-tight ${selectedCategory === category.id
                                            ? 'bg-[#13ec49] text-[#102215] font-bold'
                                            : 'hover:bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        {category.category_name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="flex-1 min-w-0 md:col-span-3">
                        {loading ? (
                            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
                                        <div className="w-full h-32 md:h-64 bg-gray-200"></div>
                                        <div className="p-3 md:p-4 space-y-2">
                                            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div className="bg-white rounded-xl p-8 text-center">
                                <p className="text-gray-500 text-sm md:text-lg">{t('showcase_products.no_products')}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                                {products.map((product) => (
                                    <div
                                        key={product.id}
                                        className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow cursor-pointer group"
                                    >
                                        {/* Product Image */}
                                        <div className="relative w-full h-32 md:h-64 bg-gray-100 overflow-hidden">
                                            {product.thumbnail_id ? (
                                                <img
                                                    src={getMediaUrl(product.thumbnail_id)}
                                                    alt={product.product_name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    onError={(e) => {
                                                        const target = e.currentTarget;
                                                        if (target.getAttribute('data-error-handled')) return;
                                                        target.setAttribute('data-error-handled', 'true');
                                                        target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20400%20300%22%20preserveAspectRatio%3D%22none%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23eee%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20fill%3D%22%23aaa%22%20dy%3D%22.3em%22%20font-family%3D%22Arial%2C%20sans-serif%22%20font-size%3D%2220%22%20text-anchor%3D%22middle%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E';
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <span className="material-symbols-outlined text-4xl md:text-6xl">image</span>
                                                </div>
                                            )}

                                            {/* Badge */}
                                            {product.is_featured && (
                                                <span className="absolute top-2 left-2 bg-[#13ec49] text-[#102215] text-[9px] md:text-xs font-bold px-1.5 md:px-3 py-0.5 md:py-1 rounded-full">
                                                    {t('showcase_products.featured')}
                                                </span>
                                            )}
                                        </div>

                                        {/* Product Info */}
                                        <div className="p-2.5 md:p-4">
                                            <h3 className="text-xs md:text-lg font-bold text-[#111813] mb-1 md:mb-2 line-clamp-2 group-hover:text-[#13ec49] transition-colors leading-tight">
                                                {product.product_name}
                                            </h3>

                                            <p className="hidden md:block text-sm text-gray-600 mb-3 line-clamp-2">
                                                {product.short_description}
                                            </p>

                                            {/* Price */}
                                            <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-3 flex-wrap">
                                                <span className="text-sm md:text-2xl font-bold text-[#13ec49]">
                                                    {Number(product.price).toLocaleString('vi-VN')}đ
                                                </span>
                                                {product.original_price && product.original_price > product.price && (
                                                    <span className="text-[10px] md:text-sm text-gray-400 line-through">
                                                        {Number(product.original_price).toLocaleString('vi-VN')}đ
                                                    </span>
                                                )}
                                            </div>

                                            {/* Rating & Stock */}
                                            <div className="flex items-center justify-between text-[10px] md:text-sm text-gray-600">
                                                <div className="flex items-center gap-0.5">
                                                    <span className="text-yellow-500 text-xs">⭐</span>
                                                    <span>{product.avg_rating ? Number(product.avg_rating).toFixed(1) : '0.0'}</span>
                                                </div>
                                                <span className={`text-[9px] md:text-sm ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {product.stock_quantity > 0 ? t('showcase_products.in_stock', { count: product.stock_quantity }) : t('showcase_products.out_of_stock')}
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
