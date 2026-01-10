import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ShowcaseHeader from '../../templates/ShowcaseHeader';

interface BlogPost {
    id: string;
    title: string;
    excerpt: string;
    category: string;
    author: string;
    date: string;
    image: string;
    readTime: string;
}

const ShowcaseBlog: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const posts: BlogPost[] = [
        {
            id: '1',
            title: 'Mùa mận 2026: Năng suất vượt kỳ vọng',
            excerpt: 'Năm nay vườn mận của chúng tôi đạt năng suất cao kỷ lục nhờ áp dụng kỹ thuật chăm sóc mới và thời tiết thuận lợi. Cùng tìm hiểu bí quyết...',
            category: 'Mùa vụ',
            author: 'Lê Minh Tuấn',
            date: '2026-01-05',
            image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600',
            readTime: '5 phút đọc'
        },
        {
            id: '2',
            title: 'Cách chọn mận ngon, tươi và an toàn',
            excerpt: 'Nhiều người thắc mắc làm sao để chọn được mận ngon, không hóa chất. Hôm nay tôi sẽ chia sẻ những kinh nghiệm chọn mận từ người trồng...',
            category: 'Hướng dẫn',
            author: 'Lê Minh Tuấn',
            date: '2026-01-03',
            image: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=600',
            readTime: '3 phút đọc'
        },
        {
            id: '3',
            title: 'Công thức mứt mận tự làm tại nhà',
            excerpt: 'Mùa mận về, đừng bỏ lỡ cơ hội làm mứt mận ngon tại nhà. Công thức đơn giản, dễ làm, giữ được hương vị tự nhiên của mận...',
            category: 'Công thức',
            author: 'Trần Thị Mai',
            date: '2025-12-28',
            image: 'https://images.unsplash.com/photo-1587049352846-4a222e784acc?w=600',
            readTime: '7 phút đọc'
        },
        {
            id: '4',
            title: 'Hành trình 25 năm xây dựng vườn mận',
            excerpt: 'Từ một mảnh đất hoang, chúng tôi đã biến nó thành vườn mận xanh tươi. Đây là câu chuyện về sự kiên trì, đam mê và tình yêu với nghề nông...',
            category: 'Câu chuyện',
            author: 'Lê Minh Tuấn',
            date: '2025-12-20',
            image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600',
            readTime: '10 phút đọc'
        },
        {
            id: '5',
            title: 'Kỹ thuật trồng rau sạch không cần thuốc',
            excerpt: 'Trồng rau sạch không khó như bạn nghĩ. Với phương pháp canh tác hữu cơ, bạn hoàn toàn có thể có vườn rau xanh mướt mà không cần hóa chất...',
            category: 'Kỹ thuật',
            author: 'Nguyễn Văn An',
            date: '2025-12-15',
            image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600',
            readTime: '6 phút đọc'
        },
        {
            id: '6',
            title: 'Lợi ích của việc ăn trái cây theo mùa',
            excerpt: 'Ăn trái cây theo mùa không chỉ ngon hơn mà còn tốt cho sức khỏe và môi trường. Cùng tìm hiểu tại sao bạn nên chọn trái cây theo mùa...',
            category: 'Sức khỏe',
            author: 'Trần Thị Mai',
            date: '2025-12-10',
            image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600',
            readTime: '4 phút đọc'
        },
    ];

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const getCategoryColor = (category: string) => {
        const colors: { [key: string]: string } = {
            'Mùa vụ': 'bg-green-50 text-green-700',
            'Hướng dẫn': 'bg-blue-50 text-blue-700',
            'Công thức': 'bg-orange-50 text-orange-700',
            'Câu chuyện': 'bg-purple-50 text-purple-700',
            'Kỹ thuật': 'bg-teal-50 text-teal-700',
            'Sức khỏe': 'bg-pink-50 text-pink-700',
        };
        return colors[category] || 'bg-gray-50 text-gray-700';
    };

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f8f6]">
            <ShowcaseHeader
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                placeholder="Tìm bài viết..."
            />

            <div className="layout-container flex h-full grow flex-col">
                <div className="px-4 md:px-10 lg:px-40 flex flex-1 justify-center py-8">
                    <div className="layout-content-container flex flex-col max-w-[1200px] flex-1 gap-8">

                        {/* Page Header */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#13ec49]/10 rounded-lg text-[#13ec49]">
                                    <span className="material-symbols-outlined text-3xl">article</span>
                                </div>
                                <div>
                                    <h1 className="text-4xl md:text-5xl font-black text-[#111813] tracking-tight">Tin tức</h1>
                                    <p className="text-[#61896b] text-lg mt-1">Chia sẻ kinh nghiệm, câu chuyện và kiến thức nông nghiệp</p>
                                </div>
                            </div>
                        </div>

                        {/* Featured Post */}
                        {filteredPosts.length > 0 && (
                            <div className="bg-white rounded-2xl border border-[#dbe6de] shadow-sm overflow-hidden hover:shadow-lg transition-all group cursor-pointer">
                                <div className="grid md:grid-cols-2 gap-0">
                                    <div className="relative h-64 md:h-auto overflow-hidden">
                                        <div
                                            className="w-full h-full bg-center bg-cover transition-transform duration-700 group-hover:scale-110"
                                            style={{ backgroundImage: `url("${filteredPosts[0].image}")` }}
                                        ></div>
                                        <div className="absolute top-4 left-4">
                                            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getCategoryColor(filteredPosts[0].category)}`}>
                                                {filteredPosts[0].category}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-8 flex flex-col justify-center">
                                        <span className="text-xs font-bold text-[#13ec49] uppercase tracking-wider">Bài viết nổi bật</span>
                                        <h2 className="text-3xl font-black text-[#111813] mt-3 mb-4">{filteredPosts[0].title}</h2>
                                        <p className="text-[#61896b] text-base leading-relaxed mb-6">{filteredPosts[0].excerpt}</p>
                                        <div className="flex items-center gap-4 text-sm text-[#61896b] mb-6">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[18px]">person</span>
                                                <span>{filteredPosts[0].author}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                                                <span>{formatDate(filteredPosts[0].date)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[18px]">schedule</span>
                                                <span>{filteredPosts[0].readTime}</span>
                                            </div>
                                        </div>
                                        <button className="bg-[#13ec49] text-[#102215] px-6 py-3 rounded-xl font-bold text-sm hover:brightness-110 transition-all w-fit">
                                            Đọc tiếp →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Blog Posts Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                            {filteredPosts.slice(1).map(post => (
                                <div key={post.id} className="bg-white rounded-2xl border border-[#dbe6de] shadow-sm overflow-hidden hover:shadow-lg hover:border-[#13ec49]/50 transition-all group cursor-pointer">
                                    {/* Post Image */}
                                    <div className="relative h-48 overflow-hidden">
                                        <div
                                            className="w-full h-full bg-center bg-cover transition-transform duration-500 group-hover:scale-110"
                                            style={{ backgroundImage: `url("${post.image}")` }}
                                        ></div>
                                        <div className="absolute top-3 left-3">
                                            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getCategoryColor(post.category)}`}>
                                                {post.category}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Post Content */}
                                    <div className="p-5 flex flex-col gap-3">
                                        <h3 className="text-lg font-black text-[#111813] line-clamp-2 group-hover:text-[#13ec49] transition-colors">
                                            {post.title}
                                        </h3>
                                        <p className="text-sm text-[#61896b] line-clamp-3">{post.excerpt}</p>

                                        <div className="flex flex-col gap-2 pt-3 border-t border-gray-100 text-xs text-[#61896b]">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[16px]">person</span>
                                                <span>{post.author}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                                                    <span>{formatDate(post.date)}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                                                    <span>{post.readTime}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Empty State */}
                        {filteredPosts.length === 0 && (
                            <div className="text-center py-20">
                                <span className="material-symbols-outlined text-6xl text-gray-300">search_off</span>
                                <p className="text-xl font-bold text-gray-400 mt-4">Không tìm thấy bài viết</p>
                                <p className="text-gray-400 mt-2">Thử tìm kiếm với từ khóa khác</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShowcaseBlog;
