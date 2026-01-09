import React from 'react';
import { Link } from 'react-router-dom';

const FarmShowcase: React.FC = () => {
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
                        <Link to="/showcase" className="text-[#13ec49] text-sm font-bold leading-normal">Trang chủ</Link>
                        <Link to="/showcase/products" className="text-[#111813] text-sm font-medium leading-normal hover:text-[#13ec49] transition-colors">Sản phẩm</Link>
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
                                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111813] focus:outline-0 focus:ring-0 border-none bg-[#f0f4f1] focus:border-none h-full placeholder:text-[#61896b] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                                placeholder="Search"
                            />
                        </div>
                    </label>
                    <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-[#13ec49]/20" style={{ backgroundImage: 'url("https://picsum.photos/seed/farmer/100/100")' }}></div>
                </div>
            </header>

            <div className="layout-container flex h-full grow flex-col">
                <div className="px-4 md:px-10 lg:px-40 flex flex-1 justify-center py-8">
                    <div className="layout-content-container flex flex-col max-w-[1200px] flex-1 gap-8">

                        {/* Page Heading & Hero Section */}
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-wrap justify-between items-end gap-4 p-4 border-b border-gray-100 pb-6">
                                <div className="flex min-w-72 flex-col gap-2">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="bg-[#13ec49]/20 text-[#13ec49] text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">Premium Plan</span>
                                    </div>
                                    <h1 className="text-[#111813] text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em]">Vườn Mận Lê Minh Tuấn</h1>
                                    <div className="flex items-center gap-2 text-[#61896b]">
                                        <span className="material-symbols-outlined text-[20px]">location_on</span>
                                        <p className="text-base font-normal leading-normal">Cần Thơ, Việt Nam</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-white border border-gray-200 text-[#111813] text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors">
                                        <span className="truncate">Chia sẻ</span>
                                    </button>
                                    <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#13ec49] text-[#102215] text-sm font-bold shadow-md hover:brightness-110 transition-all">
                                        <span className="material-symbols-outlined text-[20px] mr-2">edit</span>
                                        <span className="truncate">Quản lý Gallery</span>
                                    </button>
                                </div>
                            </div>

                            {/* Featured Image (Hero) */}
                            <div className="w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden relative group cursor-pointer">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                                <div className="absolute bottom-6 left-6 z-20 text-white">
                                    <h3 className="text-2xl font-bold">Mùa Thu hoạch 2026</h3>
                                    <p className="opacity-90">Vườn mận chín vàng rộm vào mùa hè</p>
                                </div>
                                <div
                                    className="w-full h-full bg-center bg-no-repeat bg-cover transition-transform duration-700 group-hover:scale-105"
                                    style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200")' }}
                                ></div>
                                <button className="absolute top-4 right-4 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-md p-2 rounded-full text-white transition-colors">
                                    <span className="material-symbols-outlined">fullscreen</span>
                                </button>
                            </div>
                        </div>

                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4">

                            {/* Left Column: Info & Stats */}
                            <div className="lg:col-span-2 flex flex-col gap-10">

                                {/* About Section */}
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-[#13ec49]/10 rounded-lg text-[#13ec49]">
                                            <span className="material-symbols-outlined">info</span>
                                        </div>
                                        <h2 className="text-2xl font-bold text-[#111813]">Giới thiệu Vườn</h2>
                                    </div>
                                    <p className="text-[#3c4740] text-lg font-normal leading-relaxed">
                                        Được thành lập từ năm 1998, Vườn Mận Lê Minh Tuấn đã trở thành một trong những vườn mận hàng đầu tại khu vực Đồng bằng Sông Cửu Long. Chúng tôi chuyên canh tác mận theo phương pháp hữu cơ, tập trung vào các giống mận chất lượng cao và bền vững với môi trường.
                                    </p>
                                    <p className="text-[#3c4740] text-lg font-normal leading-relaxed">
                                        Vườn trải rộng trên địa hình đa dạng, tạo nên vi khí hậu độc đáo giúp cây mận phát triển tốt quanh năm. Từ những ngày đầu là một mảnh vườn gia đình nhỏ đến quy mô hiện tại, chúng tôi luôn cam kết mang đến sản phẩm tươi ngon nhất cho cộng đồng.
                                    </p>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="flex flex-col gap-3 rounded-xl border border-[#dbe6de] bg-white p-5 shadow-sm hover:border-[#13ec49]/50 transition-colors cursor-default group">
                                        <div className="text-[#13ec49] bg-[#13ec49]/10 w-fit p-3 rounded-full mb-1 group-hover:bg-[#13ec49] group-hover:text-[#102215] transition-colors">
                                            <span className="material-symbols-outlined text-[28px]">verified</span>
                                        </div>
                                        <div>
                                            <h3 className="text-[#111813] text-lg font-bold">Chứng nhận VietGAP</h3>
                                            <p className="text-[#61896b] text-sm">Từ năm 2010</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 rounded-xl border border-[#dbe6de] bg-white p-5 shadow-sm hover:border-[#13ec49]/50 transition-colors cursor-default group">
                                        <div className="text-[#13ec49] bg-[#13ec49]/10 w-fit p-3 rounded-full mb-1 group-hover:bg-[#13ec49] group-hover:text-[#102215] transition-colors">
                                            <span className="material-symbols-outlined text-[28px]">landscape</span>
                                        </div>
                                        <div>
                                            <h3 className="text-[#111813] text-lg font-bold">2.5 Hecta</h3>
                                            <p className="text-[#61896b] text-sm">Diện tích canh tác</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 rounded-xl border border-[#dbe6de] bg-white p-5 shadow-sm hover:border-[#13ec49]/50 transition-colors cursor-default group">
                                        <div className="text-[#13ec49] bg-[#13ec49]/10 w-fit p-3 rounded-full mb-1 group-hover:bg-[#13ec49] group-hover:text-[#102215] transition-colors">
                                            <span className="material-symbols-outlined text-[28px]">history</span>
                                        </div>
                                        <div>
                                            <h3 className="text-[#111813] text-lg font-bold">Thành lập 1998</h3>
                                            <p className="text-[#61896b] text-sm">Gia đình sở hữu</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Seasonal Highlights */}
                                <div className="flex flex-col gap-4 mt-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xl font-bold text-[#111813]">Sản phẩm nổi bật</h3>
                                        <a className="text-[#13ec49] text-sm font-bold hover:underline cursor-pointer">Xem kho hàng →</a>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                                        {/* Crop Card 1 */}
                                        <div className="relative group overflow-hidden rounded-xl aspect-[4/3] cursor-pointer">
                                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors z-10"></div>
                                            <div
                                                className="w-full h-full bg-center bg-cover transition-transform duration-500 group-hover:scale-110"
                                                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=400")' }}
                                            ></div>
                                            <div className="absolute bottom-3 left-3 z-20">
                                                <p className="text-white font-bold text-lg">Mận Hậu Giang</p>
                                                <p className="text-white/80 text-xs">Mùa hè</p>
                                            </div>
                                        </div>

                                        {/* Crop Card 2 */}
                                        <div className="relative group overflow-hidden rounded-xl aspect-[4/3] cursor-pointer">
                                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors z-10"></div>
                                            <div
                                                className="w-full h-full bg-center bg-cover transition-transform duration-500 group-hover:scale-110"
                                                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1587049352846-4a222e784acc?w=400")' }}
                                            ></div>
                                            <div className="absolute bottom-3 left-3 z-20">
                                                <p className="text-white font-bold text-lg">Cam Sành</p>
                                                <p className="text-white/80 text-xs">Thu đông</p>
                                            </div>
                                        </div>

                                        {/* Crop Card 3 */}
                                        <div className="relative group overflow-hidden rounded-xl aspect-[4/3] cursor-pointer">
                                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors z-10"></div>
                                            <div
                                                className="w-full h-full bg-center bg-cover transition-transform duration-500 group-hover:scale-110"
                                                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400")' }}
                                            ></div>
                                            <div className="absolute bottom-3 left-3 z-20">
                                                <p className="text-white font-bold text-lg">Rau Sạch</p>
                                                <p className="text-white/80 text-xs">Quanh năm</p>
                                            </div>
                                        </div>

                                        {/* Add New Card */}
                                        <div className="flex flex-col items-center justify-center bg-white border-2 border-dashed border-gray-300 rounded-xl aspect-[4/3] cursor-pointer hover:border-[#13ec49] transition-colors group">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-[#13ec49] group-hover:text-[#102215] transition-colors mb-2">
                                                <span className="material-symbols-outlined">add</span>
                                            </div>
                                            <p className="text-sm font-medium text-gray-500 group-hover:text-[#13ec49]">Thêm sản phẩm</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Gallery Grid & Contact */}
                            <div className="flex flex-col gap-6">

                                {/* Mini Gallery Grid */}
                                <div className="bg-white p-5 rounded-2xl border border-[#dbe6de] shadow-sm">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold text-[#111813]">Hình ảnh gần đây</h3>
                                        <button className="text-[#13ec49] hover:bg-[#13ec49]/10 p-1 rounded transition-colors">
                                            <span className="material-symbols-outlined">arrow_forward</span>
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
                                            <div className="w-full h-full bg-center bg-cover" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=300")' }}></div>
                                        </div>
                                        <div className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
                                            <div className="w-full h-full bg-center bg-cover" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=300")' }}></div>
                                        </div>
                                        <div className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
                                            <div className="w-full h-full bg-center bg-cover" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=300")' }}></div>
                                        </div>
                                        <div className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity relative">
                                            <div className="w-full h-full bg-center bg-cover" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1560493676-04071c5f467b?w=300")' }}></div>
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <span className="text-white font-bold text-lg">+12</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Location & Contact */}
                                <div className="bg-white p-0 rounded-2xl border border-[#dbe6de] shadow-sm overflow-hidden flex flex-col">
                                    <div className="h-40 bg-gray-200 relative">
                                        <div
                                            className="w-full h-full bg-cover bg-center"
                                            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600")' }}
                                        ></div>
                                        <div className="absolute bottom-3 right-3 bg-white text-xs font-bold px-2 py-1 rounded shadow">
                                            Bản đồ
                                        </div>
                                    </div>
                                    <div className="p-5 flex flex-col gap-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-[#111813] mb-1">Ghé thăm chúng tôi</h3>
                                            <p className="text-[#61896b] text-sm">123 Đường Mận, Phường 4, Cần Thơ</p>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 text-sm">
                                                <span className="material-symbols-outlined text-[#13ec49]">call</span>
                                                <span className="text-[#111813]">0901 234 567</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <span className="material-symbols-outlined text-[#13ec49]">mail</span>
                                                <span className="text-[#111813]">contact@vuonman.vn</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <span className="material-symbols-outlined text-[#13ec49]">schedule</span>
                                                <span className="text-[#111813]">T2 - T7: 8:00 - 17:00</span>
                                            </div>
                                        </div>
                                        <button className="w-full mt-2 py-2 rounded-lg bg-[#f0f4f1] text-[#111813] font-bold text-sm hover:bg-gray-200 transition-colors">
                                            Chỉ đường
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FarmShowcase;
