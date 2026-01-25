import React from 'react';
import ShowcaseHeader from '../../templates/ShowcaseHeader';
import { Link } from 'react-router-dom';

const TermsOfService: React.FC = () => {
    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f8f6]">
            {/* Top Navigation Bar */}
            <ShowcaseHeader />

            <div className="layout-container flex h-full grow flex-col text-left">
                <div className="px-4 md:px-10 lg:px-40 flex flex-1 justify-center py-12">
                    <div className="layout-content-container flex flex-col max-w-[950px] flex-1 gap-12">

                        {/* Title Section */}
                        <div className="flex flex-col gap-6 text-center animate-in fade-in slide-in-from-top-4 duration-700">
                            <h1 className="text-[#111813] text-4xl md:text-6xl font-black tracking-tight">Điều khoản dịch vụ</h1>
                            <div className="h-1.5 w-24 bg-[#13ec49] mx-auto rounded-full"></div>
                        </div>

                        {/* Acceptance Card */}
                        <div className="bg-white rounded-[2.5rem] border border-[#dbe6de] shadow-sm p-8 md:p-12">
                            <h2 className="text-2xl font-black text-[#111813] mb-6 flex items-center gap-3">
                                <span className="material-symbols-outlined text-[#13ec49] text-3xl">task_alt</span>
                                1. Chấp nhận điều khoản
                            </h2>
                            <p className="text-[#3c4740] text-lg leading-relaxed">
                                Bằng việc truy cập, đăng ký hoặc sử dụng bất kỳ tính năng nào của hệ thống quản lý và dịch vụ <strong>GreenAcres</strong>, bạn xác nhận rằng mình đã đọc, hiểu và hoàn toàn đồng ý tuân thủ các điều khoản và điều kiện được nêu tại đây. Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, vui lòng ngừng sử dụng dịch vụ của chúng tôi ngay lập tức.
                            </p>
                        </div>

                        {/* Detailed Content Grid */}
                        <div className="grid grid-cols-1 gap-10">

                            {/* Registration & Security */}
                            <section className="bg-white rounded-3xl border border-[#dbe6de] p-8 shadow-sm">
                                <h2 className="text-2xl font-black text-[#111813] mb-4 flex items-center gap-3">
                                    <span className="material-symbols-outlined text-[#13ec49] text-3xl">security</span>
                                    2. Đăng ký & Bảo mật tài khoản
                                </h2>
                                <div className="space-y-4 text-[#3c4740] leading-relaxed">
                                    <p>Khi tạo tài khoản tại GreenAcres, bạn cam kết cung cấp thông tin chính xác, đầy đủ và cập nhật. Bạn chịu trách nhiệm hoàn toàn về việc bảo mật mật khẩu và tất cả các hoạt động diễn ra dưới tài khoản của mình.</p>
                                    <p>Bạn phải thông báo ngay cho chúng tôi nếu phát hiện bất kỳ hành vi truy cập trái phép hoặc vi phạm bảo mật nào. Chúng tôi không chịu trách nhiệm cho bất kỳ tổn thất hoặc thiệt hại nào phát sinh từ việc bạn không tuân thủ quy định bảo mật này.</p>
                                </div>
                            </section>

                            {/* Prohibited Behaviors */}
                            <section className="bg-white rounded-3xl border border-[#dbe6de] p-8 shadow-sm">
                                <h2 className="text-2xl font-black text-[#111813] mb-4 flex items-center gap-3">
                                    <span className="material-symbols-outlined text-[#13ec49] text-3xl">block</span>
                                    3. Hành vi bị cấm
                                </h2>
                                <p className="text-[#3c4740] mb-4 leading-relaxed">
                                    Để đảm bảo môi trường quản lý nông nghiệp minh bạch và an toàn, bạn cam kết KHÔNG thực hiện các hành vi sau:
                                </p>
                                <ul className="space-y-3 ml-4">
                                    <li className="flex gap-3 text-[#3c4740]">
                                        <span className="text-[#13ec49] font-bold">•</span>
                                        <span>Cố ý nhập liệu các thông tin sai lệch, gian lận về sản lượng, mùa vụ hoặc thông tin tài chính.</span>
                                    </li>
                                    <li className="flex gap-3 text-[#3c4740]">
                                        <span className="text-[#13ec49] font-bold">•</span>
                                        <span>Tìm cách can thiệp, phá hoại hệ thống (hack), spam hoặc phát tán mã độc.</span>
                                    </li>
                                    <li className="flex gap-3 text-[#3c4740]">
                                        <span className="text-[#13ec49] font-bold">•</span>
                                        <span>Sử dụng dịch vụ cho bất kỳ mục đích bất hợp pháp nào hoặc vi phạm pháp luật hiện hành.</span>
                                    </li>
                                </ul>
                            </section>

                            {/* Intellectual Property */}
                            <section className="bg-white rounded-3xl border border-[#dbe6de] p-8 shadow-sm">
                                <h2 className="text-2xl font-black text-[#111813] mb-4 flex items-center gap-3">
                                    <span className="material-symbols-outlined text-[#13ec49] text-3xl">verified</span>
                                    4. Sở hữu trí tuệ
                                </h2>
                                <div className="space-y-4 text-[#3c4740] leading-relaxed">
                                    <p>Tất cả nội dung bao gồm nhưng không giới hạn ở: logo, mã nguồn, thiết kế giao diện, hình ảnh, văn bản và các tài sản kỹ thuật số khác trên hệ thống đều thuộc quyền sở hữu độc quyền của <strong>GreenAcres - Vườn Mận Lê Minh Tuấn</strong>.</p>
                                    <p>Mọi hành vi sao chép, trích dẫn hoặc sử dụng các tài sản này cho mục đích thương mại mà không có sự đồng ý bằng văn bản của chúng tôi đều bị coi là vi phạm bản quyền và sẽ được xử lý theo quy định của pháp luật.</p>
                                </div>
                            </section>

                            {/* Limitation of Liability */}
                            <section className="bg-white rounded-3xl border border-[#dbe6de] p-8 shadow-sm">
                                <h2 className="text-2xl font-black text-[#111813] mb-4 flex items-center gap-3">
                                    <span className="material-symbols-outlined text-[#13ec49] text-3xl">gavel</span>
                                    5. Giới hạn trách nhiệm
                                </h2>
                                <p className="text-[#3c4740] leading-relaxed">
                                    GreenAcres nỗ lực hết mình để duy trì dịch vụ ổn định. Tuy nhiên, chúng tôi không chịu trách nhiệm trong trường hợp gián đoạn dịch vụ do các nguyên nhân bất khả kháng như sự cố mạng, thiên tai hoặc các lỗi kỹ thuật ngoài tầm kiểm soát. Chúng tôi có quyền tạm ngưng cung cấp dịch vụ để bảo trì hoặc nâng cấp hệ thống bất kỳ lúc nào.
                                </p>
                            </section>

                        </div>

                        {/* Back Button */}
                        <div className="flex justify-center pt-8">
                            <Link
                                to="/showcase"
                                className="flex items-center gap-2 bg-[#111813] text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-transform shadow-xl"
                            >
                                <span className="material-symbols-outlined">arrow_back</span>
                                Quay lại trang chủ
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Footer Copy */}
                <footer className="mt-auto border-t border-[#e5e9e6] bg-white py-8 px-10">
                    <div className="max-w-[1200px] mx-auto flex justify-center items-center gap-4 text-[#61896b] text-sm">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#13ec49]">agriculture</span>
                            <span className="font-bold text-[#111813]">GreenAcres</span>
                            <span className="mx-2">|</span>
                            <span>© {new Date().getFullYear()} Vườn Mận Lê Minh Tuấn. Đã đăng ký bản quyền.</span>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default TermsOfService;
