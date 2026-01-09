import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    unit: string;
    image: string;
    description: string;
    inStock: boolean;
    origin: string;
}

const ShowcaseProducts: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const products: Product[] = [
        {
            id: '1',
            name: 'Mận Hậu Giang',
            category: 'Trái cây',
            price: 45000,
            unit: 'kg',
            image: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=400',
            description: 'Mận chín vàng, ngọt tự nhiên, không hóa chất',
            inStock: true,
            origin: 'Vườn Mận Lê Minh Tuấn'
        },
        {
            id: '2',
            name: 'Cam Sành',
            category: 'Trái cây',
            price: 35000,
            unit: 'kg',
            image: 'https://images.unsplash.com/photo-1587049352846-4a222e784acc?w=400',
            description: 'Cam sành ngọt mát, nhiều nước',
            inStock: true,
            origin: 'Vườn Cam Cần Thơ'
        },
        {
            id: '3',
            name: 'Rau Cải Xanh',
            category: 'Rau củ',
            price: 15000,
            unit: 'kg',
            image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400',
            description: 'Rau sạch, hữu cơ, không thuốc trừ sâu',
            inStock: true,
            origin: 'Vườn Rau Hữu Cơ'
        },
        {
            id: '4',
            name: 'Cà Chua Bi',
            category: 'Rau củ',
            price: 25000,
            unit: 'kg',
            image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400',
            description: 'Cà chua bi ngọt, giòn, tươi mỗi ngày',
            inStock: true,
            origin: 'Vườn Rau Sạch'
        },
        {
            id: '5',
            name: 'Xoài Cát Chu',
            category: 'Trái cây',
            price: 55000,
            unit: 'kg',
            image: 'https://images.unsplash.com/photo-1605664515998-c0fc2fabc5ab?w=400',
            description: 'Xoài cát ngọt thơm, thịt dày',
            inStock: false,
            origin: 'Vườn Xoài Đồng Tháp'
        },
        {
            id: '6',
            name: 'Dưa Leo',
            category: 'Rau củ',
            price: 12000,
            unit: 'kg',
            image: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=400',
            description: 'Dưa leo tươi, giòn, không đắng',
            inStock: true,
            origin: 'Vườn Rau Hữu Cơ'
        },
    ];

    const categories = ['all', 'Trái cây', 'Rau củ'];

    const filteredProducts = products.filter(product => {
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f8f6]">
            {/* Top Navigation Bar */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e5e9e6] bg-white px-10 py-3 sticky top-0 z-50">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-4 text-[#111813]">
                        <div className="size-8 rounded bg-[#13ec49]/20 flex items-center justify-center text-[#13ec49]">
                            <span className="material-symbols-outlined">agriculture</span>
                        </div>
                        <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">GreenAcres</h2>
                    </div>
                    <div className="hidden md:flex items-center gap-9">
                        <Link to="/showcase" className="text-[#111813] text-sm font-medium leading-normal hover:text-[#13ec49] transition-colors">Trang chủ</Link>
                        <Link to="/showcase/products" className="text-[#13ec49] text-sm font-bold leading-normal">Sản phẩm</Link>
                        <Link to="/showcase/blog" className="text-[#111813] text-sm font-medium leading-normal hover:text-[#13ec49] transition-colors">Tin tức</Link>
                    </div>
                </div>
                <div className="flex flex-1 justify-end gap-8">
                    <label className="hidden md:flex flex-col min-w-40 !h-10 max-w-64">
                        <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
                            <div className="text-[#61896b] flex border-none bg-[#f0f4f1] items-center justify-center pl-4 rounded-l-xl border-r-0">
                                <span className="material-symbols-outlined text-[20px]">search</span>
                            </div>
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111813] focus:outline-0 focus:ring-0 border-none bg-[#f0f4f1] focus:border-none h-full placeholder:text-[#61896b] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                                placeholder="Tìm sản phẩm..."
                            />
                        </div>
                    </label>
                    <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-[#13ec49]/20" style={{ backgroundImage: 'url("https://picsum.photos/seed/farmer/100/100")' }}></div>
                </div>
            </header>

            <div className="layout-container flex h-full grow flex-col">
                <div className="px-4 md:px-10 lg:px-40 flex flex-1 justify-center py-8">
                    <div className="layout-content-container flex flex-col max-w-[1200px] flex-1 gap-8">

                        {/* Page Header */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#13ec49]/10 rounded-lg text-[#13ec49]">
                                    <span className="material-symbols-outlined text-3xl">shopping_bag</span>
                                </div>
                                <div>
                                    <h1 className="text-4xl md:text-5xl font-black text-[#111813] tracking-tight">Sản phẩm</h1>
                                    <p className="text-[#61896b] text-lg mt-1">Tươi ngon mỗi ngày từ vườn đến bàn</p>
                                </div>
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-6 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${selectedCategory === cat
                                            ? 'bg-[#13ec49] text-[#102215] shadow-lg shadow-[#13ec49]/20'
                                            : 'bg-white text-[#111813] border border-gray-200 hover:border-[#13ec49]'
                                        }`}
                                >
                                    {cat === 'all' ? 'Tất cả' : cat}
                                </button>
                            ))}
                        </div>

                        {/* Products Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProducts.map(product => (
                                <div key={product.id} className="bg-white rounded-2xl border border-[#dbe6de] shadow-sm overflow-hidden hover:shadow-lg hover:border-[#13ec49]/50 transition-all group">
                                    {/* Product Image */}
                                    <div className="relative h-48 overflow-hidden">
                                        <div
                                            className="w-full h-full bg-center bg-cover transition-transform duration-500 group-hover:scale-110"
                                            style={{ backgroundImage: `url("${product.image}")` }}
                                        ></div>
                                        {!product.inStock && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-sm">Hết hàng</span>
                                            </div>
                                        )}
                                        {product.inStock && (
                                            <div className="absolute top-3 right-3 bg-[#13ec49] text-[#102215] px-3 py-1 rounded-full text-xs font-bold">
                                                Còn hàng
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-5 flex flex-col gap-3">
                                        <div>
                                            <span className="text-xs font-bold text-[#61896b] uppercase tracking-wider">{product.category}</span>
                                            <h3 className="text-xl font-black text-[#111813] mt-1">{product.name}</h3>
                                            <p className="text-sm text-[#61896b] mt-2 line-clamp-2">{product.description}</p>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-[#61896b]">
                                            <span className="material-symbols-outlined text-[16px]">location_on</span>
                                            <span>{product.origin}</span>
                                        </div>

                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                            <div>
                                                <p className="text-2xl font-black text-[#13ec49]">{formatPrice(product.price)}</p>
                                                <p className="text-xs text-[#61896b]">/{product.unit}</p>
                                            </div>
                                            <button
                                                disabled={!product.inStock}
                                                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${product.inStock
                                                        ? 'bg-[#13ec49] text-[#102215] hover:brightness-110 active:scale-95'
                                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                    }`}
                                            >
                                                {product.inStock ? 'Đặt hàng' : 'Hết hàng'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Empty State */}
                        {filteredProducts.length === 0 && (
                            <div className="text-center py-20">
                                <span className="material-symbols-outlined text-6xl text-gray-300">search_off</span>
                                <p className="text-xl font-bold text-gray-400 mt-4">Không tìm thấy sản phẩm</p>
                                <p className="text-gray-400 mt-2">Thử tìm kiếm với từ khóa khác</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShowcaseProducts;
