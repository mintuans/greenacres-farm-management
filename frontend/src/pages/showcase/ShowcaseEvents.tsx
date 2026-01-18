import React from 'react';
import { Link } from 'react-router-dom';
import ShowcaseHeader from '../../templates/ShowcaseHeader';

const ShowcaseEvents: React.FC = () => {
    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f8f6]">
            <ShowcaseHeader />

            <main className="max-w-[1200px] mx-auto px-4 py-8 w-full">
                {/* Breadcrumb */}
                <div className="flex flex-wrap gap-2 items-center mb-6">
                    <Link to="/showcase" className="text-[#61896b] hover:text-[#13ec49] text-sm font-medium hover:underline transition-colors">
                        Trang chủ
                    </Link>
                    <span className="material-symbols-outlined text-sm text-[#61896b]">chevron_right</span>
                    <span className="text-[#111813] text-sm font-semibold">Sự kiện</span>
                </div>

                {/* Wall of Fame Section */}
                <section className="mb-10 overflow-hidden">
                    <div className="flex items-center justify-between mb-6 px-2">
                        <div>
                            <h2 className="text-2xl font-black text-[#111813] flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#13ec49] text-3xl">groups</span>
                                Danh sách tham gia
                            </h2>
                            <p className="text-[#61896b] text-sm font-medium">Gặp gỡ những người nông dân và nhân viên tham gia sự kiện!</p>
                        </div>
                        <button className="bg-[#13ec49] hover:bg-[#13ec49]/90 text-[#111813] px-6 py-2.5 rounded-full font-bold shadow-lg shadow-[#13ec49]/20 transition-all flex items-center gap-2">
                            Tham gia ngay <span className="material-symbols-outlined text-lg">celebration</span>
                        </button>
                    </div>

                    {/* Scrollable Attendees */}
                    <div className="flex gap-6 overflow-x-auto pb-6 hide-scrollbar px-2 -mx-2">
                        {/* Attendee 1 */}
                        <div className="flex-none group">
                            <div className="relative">
                                <div className="absolute inset-0 bg-[#13ec49]/20 rounded-full scale-110 blur-md group-hover:bg-[#13ec49]/40 transition-all"></div>
                                <div className="relative size-28 rounded-full border-4 border-[#13ec49] p-1 bg-white">
                                    <div className="size-full rounded-full bg-cover bg-center" style={{ backgroundImage: 'url("https://i.pravatar.cc/150?img=1")' }}></div>
                                </div>
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#13ec49] text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm uppercase tracking-tighter">Tham gia</div>
                            </div>
                            <div className="mt-4 text-center">
                                <p className="font-bold text-sm leading-tight">Nguyễn Văn A</p>
                                <p className="text-[10px] text-[#61896b] uppercase font-bold tracking-widest mt-0.5">Quản lý vườn</p>
                            </div>
                        </div>

                        {/* Attendee 2 - VIP */}
                        <div className="flex-none group">
                            <div className="relative">
                                <div className="absolute inset-0 bg-[#D4AF37]/20 rounded-full scale-110 blur-md group-hover:bg-[#D4AF37]/40 transition-all"></div>
                                <div className="relative size-28 rounded-full border-4 border-[#D4AF37] p-1 bg-white">
                                    <div className="size-full rounded-full bg-cover bg-center" style={{ backgroundImage: 'url("https://i.pravatar.cc/150?img=2")' }}></div>
                                </div>
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm uppercase tracking-tighter">VIP</div>
                            </div>
                            <div className="mt-4 text-center">
                                <p className="font-bold text-sm leading-tight">Trần Thị B</p>
                                <p className="text-[10px] text-[#61896b] uppercase font-bold tracking-widest mt-0.5">Chuyên gia</p>
                            </div>
                        </div>

                        {/* Attendee 3 */}
                        <div className="flex-none group">
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-400/20 rounded-full scale-110 blur-md group-hover:bg-blue-400/40 transition-all"></div>
                                <div className="relative size-28 rounded-full border-4 border-blue-400 p-1 bg-white">
                                    <div className="size-full rounded-full bg-cover bg-center" style={{ backgroundImage: 'url("https://i.pravatar.cc/150?img=3")' }}></div>
                                </div>
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-blue-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm uppercase tracking-tighter">Tham gia</div>
                            </div>
                            <div className="mt-4 text-center">
                                <p className="font-bold text-sm leading-tight">Lê Văn C</p>
                                <p className="text-[10px] text-[#61896b] uppercase font-bold tracking-widest mt-0.5">Kỹ thuật viên</p>
                            </div>
                        </div>

                        {/* Attendee 4 */}
                        <div className="flex-none group">
                            <div className="relative">
                                <div className="absolute inset-0 bg-purple-400/20 rounded-full scale-110 blur-md group-hover:bg-purple-400/40 transition-all"></div>
                                <div className="relative size-28 rounded-full border-4 border-purple-400 p-1 bg-white">
                                    <div className="size-full rounded-full bg-cover bg-center" style={{ backgroundImage: 'url("https://i.pravatar.cc/150?img=4")' }}></div>
                                </div>
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-purple-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm uppercase tracking-tighter">Tham gia</div>
                            </div>
                            <div className="mt-4 text-center">
                                <p className="font-bold text-sm leading-tight">Phạm Thị D</p>
                                <p className="text-[10px] text-[#61896b] uppercase font-bold tracking-widest mt-0.5">Nhân viên</p>
                            </div>
                        </div>

                        {/* Attendee 5 */}
                        <div className="flex-none group">
                            <div className="relative">
                                <div className="absolute inset-0 bg-pink-400/20 rounded-full scale-110 blur-md group-hover:bg-pink-400/40 transition-all"></div>
                                <div className="relative size-28 rounded-full border-4 border-pink-400 p-1 bg-white">
                                    <div className="size-full rounded-full bg-cover bg-center" style={{ backgroundImage: 'url("https://i.pravatar.cc/150?img=5")' }}></div>
                                </div>
                            </div>
                            <div className="mt-4 text-center">
                                <p className="font-bold text-sm leading-tight">Hoàng Văn E</p>
                                <p className="text-[10px] text-[#61896b] uppercase font-bold tracking-widest mt-0.5">Bảo vệ</p>
                            </div>
                        </div>

                        {/* More button */}
                        <div className="flex-none flex items-center justify-center pl-4">
                            <button className="size-20 rounded-full bg-[#f0f4f1] border-2 border-dashed border-[#61896b] text-[#61896b] hover:border-[#13ec49] hover:text-[#13ec49] transition-all flex flex-col items-center justify-center">
                                <span className="text-lg font-bold">+36</span>
                                <span className="text-[8px] font-bold uppercase">Thêm</span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* Main Event Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Event Details */}
                    <div className="lg:col-span-2 flex flex-col gap-8">
                        {/* Hero Image */}
                        <div className="relative overflow-hidden rounded-xl bg-[#102215] min-h-[400px] flex flex-col justify-end group">
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                                style={{
                                    backgroundImage: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.8) 100%), url("https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200")'
                                }}
                            ></div>
                            <div className="relative p-8">
                                <span className="inline-block px-3 py-1 bg-[#D4AF37] text-black text-xs font-bold rounded-full mb-3 uppercase tracking-wider">Sự kiện hàng năm</span>
                                <h1 className="text-white text-4xl md:text-5xl font-bold leading-tight mb-2">Lễ hội Thu hoạch Năm mới 2024</h1>
                                <div className="flex flex-wrap gap-4 text-white/90 items-center">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[#13ec49]">calendar_today</span>
                                        <span className="text-sm">31 Tháng 12, 2024</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[#13ec49]">schedule</span>
                                        <span className="text-sm">18:00 - 02:00</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Event Description */}
                        <div className="bg-white p-8 rounded-xl border border-[#dbe6de] shadow-sm">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-[#111813]">
                                <span className="material-symbols-outlined text-[#13ec49]">description</span>
                                Mô tả sự kiện
                            </h2>
                            <p className="text-[#4b6b53] leading-relaxed mb-6">
                                Tham gia cùng chúng tôi trong sự kiện lớn nhất trong năm! Chúng tôi đang kỷ niệm một mùa vụ thu hoạch thành công khác và chào đón năm mới cùng toàn bộ cộng đồng GreenAcres. Hãy mong đợi các món ăn hữu cơ từ nguồn địa phương, nhạc sống từ 'The Rolling Bales', và thưởng thức rượu táo đặc trưng của chúng tôi.
                            </p>
                            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-[#dbe6de] pt-8">
                                <div>
                                    <h3 className="text-sm font-bold text-[#61896b] uppercase tracking-wider mb-4">Địa điểm</h3>
                                    <div className="flex gap-4">
                                        <div className="bg-[#13ec49]/10 p-3 rounded-lg flex items-center justify-center">
                                            <span className="material-symbols-outlined text-[#13ec49]">location_on</span>
                                        </div>
                                        <div>
                                            <p className="font-semibold">Nhà kho chính & Cánh đồng Bắc</p>
                                            <p className="text-sm text-[#61896b]">Trang trại hữu cơ Green Valley, Mỹ Tho</p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-[#61896b] uppercase tracking-wider mb-4">Dress Code</h3>
                                    <div className="flex gap-4">
                                        <div className="bg-[#D4AF37]/10 p-3 rounded-lg flex items-center justify-center">
                                            <span className="material-symbols-outlined text-[#D4AF37]">apparel</span>
                                        </div>
                                        <div>
                                            <p className="font-semibold">Phong cách nông trại / Lễ hội</p>
                                            <p className="text-sm text-[#61896b]">Khuyến nghị mặc ấm</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Event Gallery */}
                        <div className="bg-white p-8 rounded-xl border border-[#dbe6de] shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold flex items-center gap-2 text-[#111813]">
                                    <span className="material-symbols-outlined text-[#13ec49]">photo_library</span>
                                    Thư viện ảnh sự kiện
                                </h2>
                                <button className="text-[#13ec49] text-sm font-bold flex items-center gap-2 hover:bg-[#13ec49]/10 px-4 py-2 rounded-lg transition-all">
                                    <span className="material-symbols-outlined">upload</span>
                                    TẢI ẢNH LÊN
                                </button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {/* Gallery Images */}
                                {[1, 2, 3, 4].map((idx) => (
                                    <div key={idx} className="aspect-square rounded-lg overflow-hidden relative group cursor-pointer">
                                        <img
                                            alt={`Gallery image ${idx}`}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            src={`https://images.unsplash.com/photo-${1530103862676 + idx * 1000}-de8c9debad1d?w=400&h=400&fit=crop`}
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="material-symbols-outlined text-white text-3xl">zoom_in</span>
                                        </div>
                                    </div>
                                ))}

                                {/* Add Photo Button */}
                                <div className="aspect-square rounded-lg overflow-hidden relative group cursor-pointer border-2 border-dashed border-[#dbe6de] flex flex-col items-center justify-center hover:bg-[#f6f8f6] transition-colors">
                                    <span className="material-symbols-outlined text-[#61896b] text-4xl mb-2">add_photo_alternate</span>
                                    <span className="text-xs font-bold text-[#61896b]">THÊM ẢNH</span>
                                </div>

                                {/* More Photos */}
                                <div className="aspect-square rounded-lg bg-[#13ec49]/10 flex items-center justify-center">
                                    <p className="text-[#13ec49] font-bold text-center px-4">+12 Ảnh khác</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - RSVP & Info */}
                    <div className="flex flex-col gap-6">
                        {/* RSVP Card */}
                        <div className="bg-white p-6 rounded-xl border-2 border-[#13ec49] shadow-xl shadow-[#13ec49]/5 sticky top-24">
                            <h3 className="text-xl font-bold mb-2">Đăng ký ngay!</h3>
                            <p className="text-[#61896b] text-sm mb-6">Tham gia cùng 42 người khác cho một đêm đáng nhớ!</p>
                            <button className="w-full bg-[#13ec49] hover:bg-[#13ec49]/90 text-[#111813] font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 group mb-3 shadow-lg shadow-[#13ec49]/20">
                                Tham gia ngay
                                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">celebration</span>
                            </button>
                            <button className="w-full bg-[#f6f8f6] hover:bg-[#dbe6de] border border-[#dbe6de] text-[#111813] font-semibold py-3 rounded-xl transition-all">
                                Tôi quan tâm
                            </button>
                        </div>

                        {/* Location Map */}
                        <div className="bg-white p-2 rounded-xl border border-[#dbe6de] overflow-hidden shadow-sm">
                            <div
                                className="h-48 w-full rounded-lg bg-cover bg-center"
                                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&h=400&fit=crop")' }}
                            >
                                <div className="w-full h-full bg-black/10 flex items-center justify-center">
                                    <div className="size-10 bg-[#13ec49] rounded-full flex items-center justify-center border-4 border-white shadow-lg animate-bounce">
                                        <span className="material-symbols-outlined text-white text-xl">location_on</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-3">
                                <p className="text-xs font-bold uppercase tracking-widest text-[#61896b]">Cổng vào A</p>
                                <p className="text-xs text-[#61896b]">Mã cổng sẽ được gửi trước 24h.</p>
                            </div>
                        </div>

                        {/* Pro Tip */}
                        <div className="bg-[#D4AF37]/10 p-6 rounded-xl border border-[#D4AF37]/20">
                            <h4 className="font-bold text-[#D4AF37] flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined">stars</span>
                                Mẹo hay
                            </h4>
                            <p className="text-sm text-[#4b6b53]">
                                Mang theo cốc của riêng bạn để thưởng thức rượu táo. Cốc được trang trí đẹp nhất sẽ nhận được giải thưởng!
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Toast Notification */}
            <style>
                {`
                    .hide-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                    .hide-scrollbar {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                `}
            </style>
        </div>
    );
};

export default ShowcaseEvents;
