import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ShowcaseHeader from '../../templates/ShowcaseHeader';
import { getBlogPosts, BlogPost } from '../../services/blog.service';
import { getMediaUrl } from '../../services/products.service';

const ShowcaseBlog: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    useEffect(() => {
        loadPosts();
    }, [searchTerm, page]);

    const loadPosts = async () => {
        try {
            setLoading(true);
            const response = await getBlogPosts({
                search: searchTerm || undefined,
                page,
                limit: 10
            });
            setPosts(response.data);
        } catch (error) {
            console.error('Error loading blog posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const getCategoryColor = (category?: string) => {
        const colors: { [key: string]: string } = {
            'Mùa vụ': 'bg-green-50 text-green-700',
            'Hướng dẫn': 'bg-blue-50 text-blue-700',
            'Công thức': 'bg-orange-50 text-orange-700',
            'Câu chuyện': 'bg-purple-50 text-purple-700',
            'Kỹ thuật': 'bg-teal-50 text-teal-700',
            'Sức khỏe': 'bg-pink-50 text-pink-700',
        };
        return category ? (colors[category] || 'bg-gray-50 text-gray-700') : 'bg-gray-50 text-gray-700';
    };

    const getReadTime = (content?: string) => {
        if (!content) return '5 phút đọc';
        const wordsPerMinute = 200;
        const wordCount = content.split(/\s+/).length;
        const minutes = Math.ceil(wordCount / wordsPerMinute);
        return `${minutes} phút đọc`;
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

                        {/* Loading State */}
                        {loading && (
                            <div className="text-center py-20">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#13ec49]"></div>
                                <p className="text-gray-500 mt-4">Đang tải bài viết...</p>
                            </div>
                        )}

                        {/* Featured Post */}
                        {!loading && posts.length > 0 && (
                            <div className="bg-white rounded-2xl border border-[#dbe6de] shadow-sm overflow-hidden hover:shadow-lg transition-all group cursor-pointer">
                                <div className="grid md:grid-cols-2 gap-0">
                                    <div className="relative h-64 md:h-auto overflow-hidden">
                                        <div
                                            className="w-full h-full bg-center bg-cover transition-transform duration-700 group-hover:scale-110"
                                            style={{
                                                backgroundImage: posts[0].thumbnail_id
                                                    ? `url("${getMediaUrl(posts[0].thumbnail_id)}")`
                                                    : 'url("https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600")'
                                            }}
                                        ></div>
                                        {posts[0].category_name && (
                                            <div className="absolute top-4 left-4">
                                                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getCategoryColor(posts[0].category_name)}`}>
                                                    {posts[0].category_name}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-8 flex flex-col justify-center">
                                        <span className="text-xs font-bold text-[#13ec49] uppercase tracking-wider">Bài viết nổi bật</span>
                                        <h2 className="text-3xl font-black text-[#111813] mt-3 mb-4">{posts[0].title}</h2>
                                        <p className="text-[#61896b] text-base leading-relaxed mb-6">{posts[0].excerpt}</p>
                                        <div className="flex items-center gap-4 text-sm text-[#61896b] mb-6">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                                                <span>{formatDate(posts[0].published_at)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[18px]">schedule</span>
                                                <span>{getReadTime(posts[0].content)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[18px]">visibility</span>
                                                <span>{posts[0].view_count || 0} lượt xem</span>
                                            </div>
                                        </div>
                                        <Link
                                            to={`/showcase/blog/${posts[0].slug}`}
                                            className="bg-[#13ec49] text-[#102215] px-6 py-3 rounded-xl font-bold text-sm hover:brightness-110 transition-all w-fit"
                                        >
                                            Đọc tiếp →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Blog Posts Grid */}
                        {!loading && posts.length > 1 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                                {posts.slice(1).map(post => (
                                    <Link
                                        key={post.id}
                                        to={`/showcase/blog/${post.slug}`}
                                        className="bg-white rounded-2xl border border-[#dbe6de] shadow-sm overflow-hidden hover:shadow-lg hover:border-[#13ec49]/50 transition-all group cursor-pointer"
                                    >
                                        {/* Post Image */}
                                        <div className="relative h-48 overflow-hidden">
                                            <div
                                                className="w-full h-full bg-center bg-cover transition-transform duration-500 group-hover:scale-110"
                                                style={{
                                                    backgroundImage: post.thumbnail_id
                                                        ? `url("${getMediaUrl(post.thumbnail_id)}")`
                                                        : 'url("https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600")'
                                                }}
                                            ></div>
                                            {post.category_name && (
                                                <div className="absolute top-3 left-3">
                                                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getCategoryColor(post.category_name)}`}>
                                                        {post.category_name}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Post Content */}
                                        <div className="p-5 flex flex-col gap-3">
                                            <h3 className="text-lg font-black text-[#111813] line-clamp-2 group-hover:text-[#13ec49] transition-colors">
                                                {post.title}
                                            </h3>
                                            <p className="text-sm text-[#61896b] line-clamp-3">{post.excerpt}</p>

                                            <div className="flex flex-col gap-2 pt-3 border-t border-gray-100 text-xs text-[#61896b]">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                                                        <span>{formatDate(post.published_at)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[16px]">schedule</span>
                                                        <span>{getReadTime(post.content)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && posts.length === 0 && (
                            <div className="text-center py-20">
                                <span className="material-symbols-outlined text-6xl text-gray-300">search_off</span>
                                <p className="text-xl font-bold text-gray-400 mt-4">Không tìm thấy bài viết</p>
                                <p className="text-gray-400 mt-2">Thử tìm kiếm với từ khóa khác hoặc kiểm tra lại sau</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShowcaseBlog;
