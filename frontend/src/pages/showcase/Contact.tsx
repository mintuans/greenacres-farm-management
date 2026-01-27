import React, { useState } from 'react';
import ShowcaseHeader from '../../templates/ShowcaseHeader';
import logoWeb from '../../assets/logo_web.png';
import { Link } from 'react-router-dom';

const Contact: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate API call
        console.log('Form data:', formData);
        setSubmitted(true);
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });

        // Reset success message after 5 seconds
        setTimeout(() => setSubmitted(false), 5000);
    };

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f8f6]">
            {/* Top Navigation Bar */}
            <ShowcaseHeader />

            <div className="layout-container flex h-full grow flex-col text-left">
                <div className="px-4 md:px-10 lg:px-40 flex flex-1 justify-center py-12">
                    <div className="layout-content-container flex flex-col max-w-[1200px] flex-1 gap-12">

                        {/* Heading Section */}
                        <div className="flex flex-col gap-4 text-center animate-in fade-in slide-in-from-top-4 duration-700">
                            <h1 className="text-[#111813] text-4xl md:text-6xl font-black tracking-tight">Liên hệ với chúng tôi</h1>
                            <p className="text-[#61896b] text-lg max-w-2xl mx-auto">
                                Chúng tôi luôn sẵn lòng lắng nghe ý kiến đóng góp, giải đáp thắc mắc hoặc hỗ trợ bạn trải nghiệm các sản phẩm từ Vườn Nhà Mình.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

                            {/* Left: Contact Info */}
                            <div className="lg:col-span-2 flex flex-col gap-6">
                                <div className="bg-white rounded-[2.5rem] border border-[#dbe6de] shadow-sm p-8 flex flex-col gap-8 h-full">
                                    <h2 className="text-2xl font-black text-[#111813]">Thông tin liên lạc</h2>

                                    <div className="space-y-8">
                                        <div className="flex gap-4">
                                            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                <span className="material-symbols-outlined text-3xl">location_on</span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-[#111813]">Địa chỉ vườn</h4>
                                                <p className="text-[#61896b] text-sm mt-1 leading-relaxed">Đông Hòa, Thành phố Mỹ Tho, Tiền Giang, Việt Nam</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                <span className="material-symbols-outlined text-3xl">call</span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-[#111813]">Số điện thoại</h4>
                                                <p className="text-[#61896b] text-sm mt-1">0384 396 100</p>
                                                <p className="text-[#61896b] text-sm mt-1">0908 987 654</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                <span className="material-symbols-outlined text-3xl">mail</span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-[#111813]">Email hỗ trợ</h4>
                                                <p className="text-[#61896b] text-sm mt-1">lmtuan21082003@gmail.com</p>
                                                <p className="text-[#61896b] text-sm mt-1">support@greenacres.farm</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                <span className="material-symbols-outlined text-3xl">schedule</span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-[#111813]">Giờ mở cửa</h4>
                                                <p className="text-[#61896b] text-sm mt-1">Sáng: 08:00 - 12:00</p>
                                                <p className="text-[#61896b] text-sm mt-1">Chiều: 13:30 - 17:30 (T2 - T7)</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Social Links */}
                                    <div className="pt-8 border-t border-gray-100">
                                        <h4 className="font-bold text-[#111813] mb-4">Theo dõi chúng tôi</h4>
                                        <div className="flex gap-3">
                                            <a href="#" className="size-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors">
                                                <span className="material-symbols-outlined text-xl">facebook</span>
                                            </a>
                                            <a href="#" className="size-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors">
                                                <span className="material-symbols-outlined text-xl">public</span>
                                            </a>
                                            <a href="#" className="size-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors">
                                                <span className="material-symbols-outlined text-xl">videocam</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Contact Form */}
                            <div className="lg:col-span-3">
                                <div className="bg-white rounded-[2.5rem] border border-[#dbe6de] shadow-sm p-8 md:p-12 h-full">
                                    <h2 className="text-2xl font-black text-[#111813] mb-8">Gửi tin nhắn cho chúng tôi</h2>

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-[#111813] ml-1">Họ và tên *</label>
                                                <input
                                                    required
                                                    type="text"
                                                    placeholder="VD: Nguyễn Văn A"
                                                    value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full bg-[#f8faf8] border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-[#111813] ml-1">Địa chỉ Email *</label>
                                                <input
                                                    required
                                                    type="email"
                                                    placeholder="email@example.com"
                                                    value={formData.email}
                                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                    className="w-full bg-[#f8faf8] border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-[#111813] ml-1">Số điện thoại</label>
                                                <input
                                                    type="tel"
                                                    placeholder="09xx xxx xxx"
                                                    value={formData.phone}
                                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                    className="w-full bg-[#f8faf8] border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-[#111813] ml-1">Chủ đề</label>
                                                <select
                                                    value={formData.subject}
                                                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                                    className="w-full bg-[#f8faf8] border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all appearance-none cursor-pointer"
                                                >
                                                    <option value="">-- Chọn chủ đề --</option>
                                                    <option value="Hợp tác kinh doanh">Hợp tác kinh doanh</option>
                                                    <option value="Hỗ trợ kỹ thuật">Hỗ trợ kỹ thuật</option>
                                                    <option value="Phản hồi sản phẩm">Phản hồi sản phẩm</option>
                                                    <option value="Khác">Khác</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-[#111813] ml-1">Nội dung tin nhắn *</label>
                                            <textarea
                                                required
                                                rows={5}
                                                placeholder="Bạn cần chúng tôi hỗ trợ điều gì?"
                                                value={formData.message}
                                                onChange={e => setFormData({ ...formData, message: e.target.value })}
                                                className="w-full bg-[#f8faf8] border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all resize-none"
                                            ></textarea>
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full bg-[#111813] text-white py-5 rounded-2xl font-black text-lg hover:bg-[#13ec49] hover:text-black transition-all shadow-xl active:scale-[0.98]"
                                        >
                                            Gửi tin nhắn liên hệ
                                        </button>

                                        {submitted && (
                                            <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-100 flex items-center gap-3 animate-in zoom-in duration-300">
                                                <span className="material-symbols-outlined">verified</span>
                                                <p className="font-bold text-sm">Cảm ơn bạn! Tin nhắn của bạn đã được gửi thành công. Chúng tôi sẽ phản hồi sớm nhất có thể.</p>
                                            </div>
                                        )}
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* Map Section */}
                        <div className="bg-white rounded-[2.5rem] border border-[#dbe6de] shadow-sm overflow-hidden h-[400px]">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15701.325997424578!2d106.31427181335277!3d10.32334006132049!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x310a9072cc945893%3A0xbd7a602758f1f7d5!2zVGjDoG5oIHBo4buRIE3hu7kgVGhvLCBUaeG7gW4gR2lhbmcsIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen={true}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>

                    </div>
                </div>

                {/* Footer Copy */}
                <footer className="mt-auto border-t border-[#e5e9e6] bg-white py-8 px-10">
                    <div className="max-w-[1200px] mx-auto flex justify-center items-center gap-4 text-[#61896b] text-sm">
                        <div className="flex items-center gap-2">
                            <img src={logoWeb} alt="Logo" className="size-6 object-contain" />
                            <span className="font-bold text-[#111813]">Vườn Nhà Mình</span>
                            <span className="mx-2">|</span>
                            <span>© {new Date().getFullYear()} Vườn Nhà Mình. Đã đăng ký bản quyền.</span>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default Contact;
