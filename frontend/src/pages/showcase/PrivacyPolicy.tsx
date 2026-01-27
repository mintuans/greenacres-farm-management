import React from 'react';
import ShowcaseHeader from '../../templates/ShowcaseHeader';
import { Link } from 'react-router-dom';
import logoWeb from '../../assets/logo_web.png';

const PrivacyPolicy: React.FC = () => {
    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f8f6]">
            {/* Top Navigation Bar */}
            <ShowcaseHeader />

            <div className="layout-container flex h-full grow flex-col text-left">
                <div className="px-4 md:px-10 lg:px-40 flex flex-1 justify-center py-12">
                    <div className="layout-content-container flex flex-col max-w-[950px] flex-1 gap-12">

                        {/* Title Section */}
                        <div className="flex flex-col gap-6 text-center animate-in fade-in slide-in-from-top-4 duration-700">
                            <h1 className="text-[#111813] text-4xl md:text-6xl font-black tracking-tight">Chính sách bảo mật thông tin</h1>
                            <div className="h-1.5 w-24 bg-[#13ec49] mx-auto rounded-full"></div>
                        </div>

                        {/* Introduction Card */}
                        <div className="bg-white rounded-[2.5rem] border border-[#dbe6de] shadow-sm p-8 md:p-12">
                            <p className="text-[#3c4740] text-lg leading-relaxed mb-6 italic">
                                Vườn Nhà Mình luôn tôn trọng sự riêng tư của khách hàng, và đó là lý do chúng tôi luôn cam kết bảo vệ những thông tin cá nhân của khách hàng.
                            </p>
                            <p className="text-[#3c4740] leading-relaxed">
                                Trong tài liệu này, khái niệm "thông tin cá nhân" được hiểu bao gồm tên, địa chỉ, địa chỉ email, số điện thoại hay bất kỳ thông tin cá nhân nào khác mà khách hàng cung cấp, hoặc bất kỳ thông tin nào về khách hàng được thu thập theo luật định hiện hành. Mong rằng tài liệu sẽ giúp bạn hiểu rõ những thông tin cá nhân nào mà Vườn Nhà Mình sẽ thu thập, cũng như cách chúng tôi sử dụng những thông tin này sau đó.
                            </p>
                            <p className="text-[#3c4740] mt-4 leading-relaxed font-bold">
                                Khi bạn truy cập và sử dụng trang web (bao gồm cả việc đăng ký dịch vụ trực tuyến), chúng tôi hiểu rằng bạn hoàn toàn đồng ý với những điều khoản của chính sách này.
                            </p>
                        </div>

                        {/* Main Policy Content */}
                        <div className="grid grid-cols-1 gap-10">

                            {/* Section 1 */}
                            <section className="bg-white rounded-3xl border border-[#dbe6de] p-8 shadow-sm">
                                <h2 className="text-2xl font-black text-[#111813] mb-4 flex items-center gap-3">
                                    <span className="size-8 bg-[#13ec49]/10 text-[#13ec49] flex items-center justify-center rounded-lg text-lg">1</span>
                                    Khai báo khi sử dụng
                                </h2>
                                <p className="text-[#3c4740] leading-relaxed">
                                    Tất cả nội dung bạn xem được trên trang web nhằm phục vụ nhu cầu thông tin của bạn và giúp bạn lựa chọn dịch vụ. Vì thế, bạn được sử dụng trang web mà không cần cung cấp bất kỳ thông tin cá nhân nào. Tuy nhiên, trong một số trường hợp liên quan đến việc đăng ký dịch vụ, chúng tôi có thể yêu cầu bạn cung cấp thông tin cá nhân.
                                </p>
                            </section>

                            {/* Section 2 */}
                            <section className="bg-white rounded-3xl border border-[#dbe6de] p-8 shadow-sm">
                                <h2 className="text-2xl font-black text-[#111813] mb-4 flex items-center gap-3">
                                    <span className="size-8 bg-[#13ec49]/10 text-[#13ec49] flex items-center justify-center rounded-lg text-lg">2</span>
                                    Thông tin cá nhân do bạn cung cấp
                                </h2>
                                <div className="space-y-4 text-[#3c4740] leading-relaxed">
                                    <p>Khi bạn cung cấp các thông tin cần thiết, chúng tôi sẽ sử dụng chúng để đáp ứng yêu cầu của bạn, hoặc chúng tôi có thể liên lạc với bạn qua thư từ, email, tin nhắn hay điện thoại; hoặc tuân theo luật định hiện hành, Vườn Nhà Mình sử dụng các phương tiện trên để giới thiệu đến bạn những sản phẩm, dịch vụ hay chương trình khuyến mãi mới từ Vườn Nhà Mình. Khi cung cấp thông tin cho chúng tôi qua trang web này, bạn hiểu rõ và chấp thuận việc thu thập, sử dụng và tiết lộ những thông tin cá nhân nêu trên cho một số mục đích được quy định trong trang này.</p>
                                    <p>Bạn hoàn toàn đồng ý và chấp thuận rằng những thông tin cá nhân bạn cung cấp khi sử dụng trang web có thể được bảo lưu tại trụ sở hay chi nhánh của Vườn Nhà Mình có thể được lưu trữ tại một số máy chủ hiện có hay chưa biết trước cho mục đích vận hành và phát triển trang web cũng như các dịch vụ của Vườn Nhà Mình.</p>
                                    <p>Nếu bạn đặt hàng một sản phẩm, yêu cầu một dịch vụ hoặc gởi thư phản hồi lên trang web, chúng tôi có thể liên hệ với bạn để có những thông tin bổ sung cần thiết cho việc xử lý hoặc hoàn thành đơn đặt hàng hoặc yêu cầu của bạn. Tuy nhiên, chúng tôi sẽ không cung cấp thông tin này cho một bên thứ ba mà không được sự cho phép của bạn, trừ trường hợp bị pháp luật hiện hành bắt buộc hoặc trường hợp cần thiết để xử lý đơn đặt hàng.</p>
                                </div>
                            </section>

                            {/* Section 3 */}
                            <section className="bg-white rounded-3xl border border-[#dbe6de] p-8 shadow-sm">
                                <h2 className="text-2xl font-black text-[#111813] mb-4 flex items-center gap-3">
                                    <span className="size-8 bg-[#13ec49]/10 text-[#13ec49] flex items-center justify-center rounded-lg text-lg">3</span>
                                    Cung cấp cho các đơn vị khác
                                </h2>
                                <p className="text-[#3c4740] leading-relaxed">
                                    Chúng tôi có thể sử dụng một số đơn vị khác để cung cấp sản phẩm hay dịch vụ cho bạn. Chúng tôi cũng cần trao đổi thông tin cá nhân của bạn đến các đơn vị này để họ hoàn thành yêu cầu của bạn. Những đơn vị này cũng không được phép sử dụng thông tin cá nhân của bạn cho các mục đích khác và chúng tôi đồng thời yêu cầu họ tuân theo quy định bảo mật khi tiến hành cung cấp dịch vụ.
                                </p>
                            </section>

                            {/* Section 4 */}
                            <section className="bg-white rounded-3xl border border-[#dbe6de] p-8 shadow-sm">
                                <h2 className="text-2xl font-black text-[#111813] mb-4 flex items-center gap-3">
                                    <span className="size-8 bg-[#13ec49]/10 text-[#13ec49] flex items-center justify-center rounded-lg text-lg">4</span>
                                    Ghi nhận thông tin trình duyệt
                                </h2>
                                <div className="space-y-4 text-[#3c4740] leading-relaxed">
                                    <p>Đôi khi, thông tin có thể được đưa vào máy tính của bạn để giúp chúng tôi nâng cấp trang web hay cải thiện chất lượng dịch vụ cho bạn. Những thông tin này thường được biết đến dưới dạng các "cookies" mà nhiều trang web hiện cũng đang sử dụng. "Cookies" là những mẩu thông tin lưu trữ trong đĩa cứng hay trình duyệt trên máy tính của bạn, không phải trên trang web. Chúng cho phép thu thập một số thông tin về máy tính của bạn như địa chỉ IP, hệ điều hành, chế độ trình duyệt và địa chỉ của các trang web liên quan.</p>
                                    <p>Nếu bạn không muốn nhận các cookies này, hoặc muốn được thông báo khi các cookies này được đặt vào, bạn có thể cài đặt chế độ trình duyệt của bạn thực hiện điều này nếu trình duyệt của bạn hỗ trợ. Vui lòng lưu ý, nếu bạn tắt chế độ nhận cookies, bạn sẽ không thể truy cập hay sử dụng một số tiện ích trên trang web mà không được xác định trước. Chúng tôi không cố ý hạn chế việc sử dụng của bạn trong tình huống này, đây chỉ là giới hạn trong việc lập trình và xây dựng trang web.</p>
                                </div>
                            </section>

                            {/* Section 5 */}
                            <section className="bg-white rounded-3xl border border-[#dbe6de] p-8 shadow-sm">
                                <h2 className="text-2xl font-black text-[#111813] mb-4 flex items-center gap-3">
                                    <span className="size-8 bg-[#13ec49]/10 text-[#13ec49] flex items-center justify-center rounded-lg text-lg">5</span>
                                    Sự an toàn
                                </h2>
                                <div className="space-y-4 text-[#3c4740] leading-relaxed">
                                    <p>Khi lập trình trang web, chúng tôi có thể đặt những luật định hợp lý mang tính thương mại để ngăn chặn hành vi truy cập bất hợp pháp và việc sử dụng không thích đáng các thông tin cá nhân của bạn đã gửi cho Vườn Nhà Mình thông qua việc sử dụng trang web này. Nếu trang web này hỗ trợ việc giao dịch trực tuyến, nó sẽ được áp dụng một tiêu chuẩn công nghệ được gọi là SSL (Secure Sockets Layer), để bảo vệ tính bảo mật và an toàn trên đường truyền dữ liệu.</p>
                                    <p>Vì luôn có những rủi ro liên quan đến vấn đề cung cấp dữ liệu cá nhân, cho dù là cung cấp trực tiếp, qua điện thoại hay qua mạng internet, hay qua các phương tiện kỹ thuật khác; và không có hệ thống kỹ thuật nào an toàn tuyệt đối hay chống được tất cả các "hacker" và "tamper", Vườn Nhà Mình luôn nỗ lực tiến hành những biện pháp đề phòng thích hợp đối với từng đặc tính của thông tin để ngăn chặn và giảm thiểu tối đa các rủi ro có thể khi bạn sử dụng trang web này.</p>
                                </div>
                            </section>

                            {/* Section 6 */}
                            <section className="bg-white rounded-3xl border border-[#dbe6de] p-8 shadow-sm">
                                <h2 className="text-2xl font-black text-[#111813] mb-4 flex items-center gap-3">
                                    <span className="size-8 bg-[#13ec49]/10 text-[#13ec49] flex items-center justify-center rounded-lg text-lg">6</span>
                                    Thông tin qua E-mail
                                </h2>
                                <p className="text-[#3c4740] leading-relaxed">
                                    Khi bạn đăng ký dịch vụ, địa chỉ e-mail của bạn cung cấp sẽ dùng làm công cụ trao đổi thông tin với bạn. Trước hết bạn hãy chắc rằng bạn cung cấp địa chỉ e-mail hữu dụng đối với bạn trong suốt quá trình sử dụng dịch vụ. Chúng tôi có thể gởi những thông tin bí mật qua e-mail hay tiếp nhận yêu cầu hỗ trợ của bạn. Trong trường hợp bạn không còn sử dụng e-mail đã cung cấp, bạn phải báo cho chúng tôi để về việc thay đổi này. Để bảo vệ bạn, Vườn Nhà Mình có thể tạm thời ngưng tiếp nhận yêu cầu qua e-mail bạn đã cung cấp nếu nhận thấy có sự gian lận hoặc thông tin bất thường – cho đến khi chúng tôi liên hệ được với bạn để xác nhận.
                                </p>
                            </section>

                            {/* Section 7 */}
                            <section className="bg-white rounded-3xl border border-[#dbe6de] p-8 shadow-sm">
                                <h2 className="text-2xl font-black text-[#111813] mb-4 flex items-center gap-3">
                                    <span className="size-8 bg-[#13ec49]/10 text-[#13ec49] flex items-center justify-center rounded-lg text-lg">7</span>
                                    Điều chỉnh thông tin thu thập
                                </h2>
                                <p className="text-[#3c4740] leading-relaxed">
                                    Vườn Nhà Mình sẽ chủ động hoặc theo yêu cầu của bạn bổ sung, hiệu chỉnh hay tẩy xóa các dữ liệu thông tin cá nhân không chính xác, không đầy đủ hoặc không cập nhật khi bạn còn liên kết với hoạt động của chúng tôi.
                                </p>
                            </section>

                            {/* Section 8 */}
                            <section className="bg-white rounded-3xl border border-[#dbe6de] p-8 shadow-sm">
                                <h2 className="text-2xl font-black text-[#111813] mb-4 flex items-center gap-3">
                                    <span className="size-8 bg-[#13ec49]/10 text-[#13ec49] flex items-center justify-center rounded-lg text-lg">8</span>
                                    Đối tượng “Trẻ vị thành niên”
                                </h2>
                                <p className="text-[#3c4740] leading-relaxed">
                                    Vườn Nhà Mình từ chối phục vụ cá nhân còn ở độ tuổi Trẻ vị thành niên (do luật pháp địa phương mà bạn cư ngụ quy định) không được quyền mua hay tìm cách sử dụng dựa trên điều lệ hợp pháp khác trên trang web này nếu không có sự chấp thuận của ba/mẹ hay người giám hộ hợp pháp, trừ khi luật pháp địa phương có áp dụng hay cho phép.
                                </p>
                            </section>

                            {/* Section 9 */}
                            <section className="bg-white rounded-3xl border border-[#dbe6de] p-8 shadow-sm">
                                <h2 className="text-2xl font-black text-[#111813] mb-4 flex items-center gap-3">
                                    <span className="size-8 bg-[#13ec49]/10 text-[#13ec49] flex items-center justify-center rounded-lg text-lg">9</span>
                                    Các đường liên kết ngoài trang web
                                </h2>
                                <p className="text-[#3c4740] leading-relaxed">
                                    Trang web này có thể chứa các đường liên kết đến các trang web khác được đặt vào nhằm mục đích giới thiệu hoặc bổ sung thông tin liên quan để bạn tham khảo. Vườn Nhà Mình không chịu trách nhiệm về nội dung hay các hành vi của bất kỳ trang web nào khác.
                                </p>
                            </section>

                            {/* Section 10 */}
                            <section className="bg-white rounded-3xl border border-[#dbe6de] p-8 shadow-sm">
                                <h2 className="text-2xl font-black text-[#111813] mb-4 flex items-center gap-3">
                                    <span className="size-8 bg-[#13ec49]/10 text-[#13ec49] flex items-center justify-center rounded-lg text-lg">10</span>
                                    Việc thay đổi quy định
                                </h2>
                                <p className="text-[#3c4740] leading-relaxed">
                                    Vườn Nhà Mình có thể thay đổi quy định này một cách không thường xuyên, bao gồm việc bổ sung, loại bỏ một phần nội dung hoặc tạm ngưng trang web mà không cần báo trước. Tuy nhiên, nếu quy định này được thay đổi theo hướng có thể gây bất lợi cho bạn, Vườn Nhà Mình sẽ cố gắng thông báo về sự thay đổi qua e-mail bạn đã cung cấp hoặc ngay trên trang chủ.
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

export default PrivacyPolicy;
