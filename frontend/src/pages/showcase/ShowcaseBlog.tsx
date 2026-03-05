import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ShowcaseHeader from '../../templates/ShowcaseHeader';
import { getBlogPosts, BlogPost, getExternalNews, ExternalNewsItem } from '../../services/blog.service';
import { getMediaUrl } from '../../services/products.service';

interface DisplayPost {
    id: string;
    title: string;
    excerpt: string;
    published_at: string;
    thumbnail?: string;
    category?: string;
    slug?: string;
    link?: string;
    source: 'INTERNAL' | 'VNExpress';
    view_count?: number;
    content?: string;
}

const ShowcaseBlog: React.FC = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [displayPosts, setDisplayPosts] = useState<DisplayPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    useEffect(() => {
        loadData();
    }, [searchTerm, page]);

    const loadData = async () => {
        try {
            setLoading(true);

            // Fetch internal posts
            const internalResponse = await getBlogPosts({
                search: searchTerm || undefined,
                page,
                limit: 15
            });

            const internalDisplayPosts: DisplayPost[] = internalResponse.data.map((post: BlogPost) => ({
                id: post.id,
                title: post.title,
                excerpt: post.excerpt,
                published_at: post.published_at,
                thumbnail: post.thumbnail_id ? getMediaUrl(post.thumbnail_id) : undefined,
                category: post.category_name,
                slug: post.slug,
                source: 'INTERNAL',
                view_count: post.view_count,
                content: post.content
            }));

            // Fetch external news (only on first page for now to keep it fresh)
            let externalDisplayPosts: DisplayPost[] = [];
            if (page === 1) {
                const externalResponse = await getExternalNews();
                if (externalResponse.success) {
                    externalDisplayPosts = externalResponse.data.map((item: ExternalNewsItem) => ({
                        id: item.id,
                        title: item.title,
                        excerpt: item.contentSnippet,
                        published_at: item.pubDate,
                        thumbnail: item.thumbnail,
                        category: 'Tin tức mới',
                        link: item.link,
                        source: 'VNExpress',
                        content: item.content
                    }));
                }
            }

            // Merge and sort
            const merged = [...internalDisplayPosts, ...externalDisplayPosts].sort((a, b) =>
                new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
            );

            // Filter by search locally if external news is present
            const filtered = searchTerm
                ? merged.filter(p =>
                    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
                )
                : merged;

            setDisplayPosts(filtered);
        } catch (error) {
            console.error('Error loading news:', error);
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
                        {!loading && displayPosts.length > 0 && (
                            <div className="bg-white rounded-2xl border border-[#dbe6de] shadow-sm overflow-hidden hover:shadow-lg transition-all group cursor-pointer">
                                <div className="grid md:grid-cols-2 gap-0" onClick={() => {
                                    if (displayPosts[0].source === 'INTERNAL') {
                                        navigate(`/showcase/blog/${displayPosts[0].slug}`);
                                    } else {
                                        window.open(displayPosts[0].link, '_blank');
                                    }
                                }}>
                                    <div className="relative h-64 md:h-auto overflow-hidden">
                                        <div
                                            className="w-full h-full bg-center bg-cover transition-transform duration-700 group-hover:scale-110"
                                            style={{
                                                backgroundImage: displayPosts[0].thumbnail
                                                    ? `url("${displayPosts[0].thumbnail}")`
                                                    : 'url("https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600")'
                                            }}
                                        ></div>
                                        {displayPosts[0].category && (
                                            <div className="absolute top-4 left-4">
                                                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getCategoryColor(displayPosts[0].category)}`}>
                                                    {displayPosts[0].category}
                                                </span>
                                            </div>
                                        )}
                                        <div className="absolute top-4 right-4">
                                            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${displayPosts[0].source === 'INTERNAL' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}`}>
                                                {displayPosts[0].source === 'INTERNAL' ? 'Vườn Nhà' : 'VNExpress'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-8 flex flex-col justify-center">
                                        <span className="text-xs font-bold text-[#13ec49] uppercase tracking-wider">Bài viết nổi bật</span>
                                        <h2 className="text-3xl font-black text-[#111813] mt-3 mb-4 line-clamp-2">{displayPosts[0].title}</h2>
                                        <p className="text-[#61896b] text-base leading-relaxed mb-6 line-clamp-3">{displayPosts[0].excerpt}</p>
                                        <div className="flex items-center gap-4 text-sm text-[#61896b] mb-6">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                                                <span>{formatDate(displayPosts[0].published_at)}</span>
                                            </div>
                                            {displayPosts[0].source === 'INTERNAL' && (
                                                <>
                                                    <div className="flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-[18px]">schedule</span>
                                                        <span>{getReadTime(displayPosts[0].content)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                                                        <span>{displayPosts[0].view_count || 0} lượt xem</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        {displayPosts[0].source === 'INTERNAL' ? (
                                            <Link
                                                to={`/showcase/blog/${displayPosts[0].slug}`}
                                                className="bg-[#13ec49] text-[#102215] px-6 py-3 rounded-xl font-bold text-sm hover:brightness-110 transition-all w-fit"
                                            >
                                                Đọc tiếp →
                                            </Link>
                                        ) : (
                                            <a
                                                href={displayPosts[0].link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold text-sm hover:brightness-110 transition-all w-fit"
                                            >
                                                Xem tại VNExpress ↗
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Blog Posts Grid */}
                        {!loading && displayPosts.length > 1 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                                {displayPosts.slice(1).map(post => (
                                    post.source === 'INTERNAL' ? (
                                        <Link
                                            key={post.id}
                                            to={`/showcase/blog/${post.slug}`}
                                            className="bg-white rounded-2xl border border-[#dbe6de] shadow-sm overflow-hidden hover:shadow-lg hover:border-[#13ec49]/50 transition-all group cursor-pointer"
                                        >
                                            <div className="relative h-48 overflow-hidden">
                                                <div
                                                    className="w-full h-full bg-center bg-cover transition-transform duration-500 group-hover:scale-110"
                                                    style={{
                                                        backgroundImage: post.thumbnail
                                                            ? `url("${post.thumbnail}")`
                                                            : 'url("https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600")'
                                                    }}
                                                ></div>
                                                <div className="absolute top-3 right-3">
                                                    <span className="bg-green-500 text-white px-2 py-0.5 rounded-md text-[10px] font-bold">Vườn Nhà</span>
                                                </div>
                                                {post.category && (
                                                    <div className="absolute top-3 left-3">
                                                        <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${getCategoryColor(post.category)}`}>
                                                            {post.category}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-5 flex flex-col gap-3">
                                                <h3 className="text-lg font-black text-[#111813] line-clamp-2 group-hover:text-[#13ec49] transition-colors">
                                                    {post.title}
                                                </h3>
                                                <p className="text-sm text-[#61896b] line-clamp-3">{post.excerpt}</p>
                                                <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-[#61896b]">
                                                    <div className="flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                                                        <span>{formatDate(post.published_at)}</span>
                                                    </div>
                                                    <span className="font-bold text-[#13ec49]">Xem chi tiết →</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ) : (
                                        <a
                                            key={post.id}
                                            href={post.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-white rounded-2xl border border-[#dbe6de] shadow-sm overflow-hidden hover:shadow-lg hover:border-orange-200 transition-all group cursor-pointer"
                                        >
                                            <div className="relative h-48 overflow-hidden">
                                                <div
                                                    className="w-full h-full bg-center bg-cover transition-transform duration-500 group-hover:scale-110"
                                                    style={{
                                                        backgroundImage: post.thumbnail
                                                            ? `url("${post.thumbnail}")`
                                                            : 'url("https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600")'
                                                    }}
                                                ></div>
                                                <div className="absolute top-3 right-3">
                                                    <span className="bg-orange-500 text-white px-2 py-0.5 rounded-md text-[10px] font-bold">VNExpress</span>
                                                </div>
                                                <div className="absolute top-3 left-3">
                                                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-orange-50 text-orange-700">
                                                        Tin thời sự
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p-5 flex flex-col gap-3">
                                                <h3 className="text-lg font-black text-[#111813] line-clamp-2 group-hover:text-orange-600 transition-colors">
                                                    {post.title}
                                                </h3>
                                                <p className="text-sm text-[#61896b] line-clamp-3">{post.excerpt}</p>
                                                <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-[#61896b]">
                                                    <div className="flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                                                        <span>{formatDate(post.published_at)}</span>
                                                    </div>
                                                    <span className="font-bold text-orange-500">Xem tại báo ↗</span>
                                                </div>
                                            </div>
                                        </a>
                                    )
                                ))}
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && displayPosts.length === 0 && (
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
