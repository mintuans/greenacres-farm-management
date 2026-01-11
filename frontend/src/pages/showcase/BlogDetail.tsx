import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ShowcaseHeader from '../../templates/ShowcaseHeader';
import { getBlogPostBySlug, getBlogPosts, BlogPost } from '../../services/blog.service';
import { getMediaUrl } from '../../services/products.service';

const BlogDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (slug) {
            loadPost();
        }
    }, [slug]);

    const loadPost = async () => {
        try {
            setLoading(true);
            const response = await getBlogPostBySlug(slug!);
            setPost(response.data);

            // Load related posts
            if (response.data.category_id) {
                loadRelatedPosts(response.data.category_id, response.data.id);
            }
        } catch (error) {
            console.error('Error loading post:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadRelatedPosts = async (categoryId: string, currentPostId: string) => {
        try {
            const response = await getBlogPosts({
                category_id: categoryId,
                limit: 4
            });
            // Filter out current post and take only 3
            const filtered = response.data.filter((p: BlogPost) => p.id !== currentPostId).slice(0, 3);
            setRelatedPosts(filtered);
        } catch (error) {
            console.error('Error loading related posts:', error);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getReadTime = (content?: string) => {
        if (!content) return '5 phút đọc';
        const wordsPerMinute = 200;
        const wordCount = content.split(/\s+/).length;
        const minutes = Math.ceil(wordCount / wordsPerMinute);
        return `${minutes} phút đọc`;
    };

    if (loading) {
        return (
            <div className="relative flex h-screen w-full flex-col overflow-x-hidden bg-[#f6f8f6]">
                <ShowcaseHeader
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    placeholder="Tìm bài viết..."
                />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#13ec49]"></div>
                        <p className="text-gray-500 mt-4">Đang tải bài viết...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="relative flex h-screen w-full flex-col overflow-x-hidden bg-[#f6f8f6]">
                <ShowcaseHeader
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    placeholder="Tìm bài viết..."
                />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <span className="material-symbols-outlined text-6xl text-gray-300">article_shortcut</span>
                        <p className="text-xl font-bold text-gray-400 mt-4">Không tìm thấy bài viết</p>
                        <Link to="/showcase/blog" className="text-[#13ec49] font-bold hover:underline mt-2 inline-block">
                            Quay lại danh sách
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f8f6]">
            <ShowcaseHeader
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                placeholder="Tìm bài viết..."
            />

            <div className="layout-container flex h-full grow flex-col">
                <div className="px-4 md:px-10 lg:px-40 flex flex-1 justify-center py-8">
                    <div className="layout-content-container flex flex-col lg:flex-row max-w-[1200px] flex-1 gap-8">

                        {/* Main Content */}
                        <div className="flex-1">
                            {/* Breadcrumb */}
                            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                                <Link to="/showcase/blog" className="hover:text-[#13ec49]">Tin tức</Link>
                                <span className="material-symbols-outlined text-xs">chevron_right</span>
                                {post.category_name && (
                                    <>
                                        <span className="hover:text-[#13ec49]">{post.category_name}</span>
                                        <span className="material-symbols-outlined text-xs">chevron_right</span>
                                    </>
                                )}
                                <span className="text-gray-900 font-medium truncate">{post.title}</span>
                            </nav>

                            {/* Article */}
                            <article className="bg-white rounded-2xl border border-[#dbe6de] shadow-sm overflow-hidden p-8 md:p-12">
                                {/* Header */}
                                <header className="mb-8">
                                    {post.category_name && (
                                        <span className="inline-block px-3 py-1 bg-[#13ec49]/10 text-[#13ec49] text-xs font-bold rounded-full mb-4 uppercase tracking-wider">
                                            {post.category_name}
                                        </span>
                                    )}
                                    <h1 className="text-4xl md:text-5xl font-black text-[#111813] mb-6 leading-tight">
                                        {post.title}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm">calendar_today</span>
                                            <span>{formatDate(post.published_at)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm">schedule</span>
                                            <span>{getReadTime(post.content)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm">visibility</span>
                                            <span>{post.view_count || 0} lượt xem</span>
                                        </div>
                                    </div>
                                </header>

                                {/* Featured Image */}
                                {post.featured_image_id && (
                                    <div className="relative rounded-2xl overflow-hidden mb-10 shadow-lg">
                                        <img
                                            src={getMediaUrl(post.featured_image_id)}
                                            alt={post.title}
                                            className="w-full h-[450px] object-cover"
                                        />
                                    </div>
                                )}

                                {/* Excerpt */}
                                {post.excerpt && (
                                    <div className="mb-8 p-6 bg-gray-50 rounded-xl border-l-4 border-[#13ec49]">
                                        <p className="text-lg text-gray-700 leading-relaxed italic">
                                            {post.excerpt}
                                        </p>
                                    </div>
                                )}

                                {/* Content */}
                                <div className="prose prose-slate max-w-none prose-lg prose-headings:font-bold prose-a:text-[#13ec49] prose-img:rounded-xl">
                                    <div
                                        className="whitespace-pre-wrap"
                                        dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/>') }}
                                    />
                                </div>

                                {/* Footer */}
                                <footer className="mt-12 pt-8 border-t border-gray-200">
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-semibold">Chia sẻ bài viết:</span>
                                            <div className="flex gap-2">
                                                <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-[#13ec49] hover:text-white hover:border-[#13ec49] transition-all">
                                                    <span className="material-symbols-outlined text-lg">share</span>
                                                </button>
                                            </div>
                                        </div>
                                        {post.tags && post.tags.length > 0 && (
                                            <div className="flex gap-2">
                                                {post.tags.map(tag => (
                                                    <span key={tag.id} className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-medium">
                                                        #{tag.tag_name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </footer>
                            </article>

                            {/* Back to list */}
                            <div className="mt-8 text-center">
                                <Link
                                    to="/showcase/blog"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <span className="material-symbols-outlined">arrow_back</span>
                                    Quay lại danh sách tin tức
                                </Link>
                            </div>
                        </div>

                        {/* Sidebar - Related Posts */}
                        {relatedPosts.length > 0 && (
                            <aside className="lg:w-80 shrink-0">
                                <div className="sticky top-24">
                                    <div className="bg-white rounded-2xl border border-[#dbe6de] shadow-sm p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-lg font-bold text-[#111813]">Bài viết liên quan</h3>
                                            {post.category_id && (
                                                <Link
                                                    to={`/showcase/blog?category=${post.category_id}`}
                                                    className="text-[#13ec49] text-sm font-bold hover:underline"
                                                >
                                                    Xem tất cả
                                                </Link>
                                            )}
                                        </div>
                                        <div className="space-y-6">
                                            {relatedPosts.map(relatedPost => {
                                                const imageId = relatedPost.featured_image_id || relatedPost.thumbnail_id;
                                                return (
                                                    <Link
                                                        key={relatedPost.id}
                                                        to={`/showcase/blog/${relatedPost.slug}`}
                                                        className="group flex gap-4 cursor-pointer"
                                                    >
                                                        <div className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden shadow-sm bg-gray-100">
                                                            {imageId ? (
                                                                <img
                                                                    src={getMediaUrl(imageId)}
                                                                    alt={relatedPost.title}
                                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                                                    <span className="material-symbols-outlined text-4xl text-gray-400">article</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col justify-center min-w-0">
                                                            <h4 className="font-bold text-[#111813] line-clamp-2 leading-snug group-hover:text-[#13ec49] transition-colors text-sm">
                                                                {relatedPost.title}
                                                            </h4>
                                                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                                                <span className="flex items-center gap-1">
                                                                    <span className="material-symbols-outlined text-xs">calendar_today</span>
                                                                    {new Date(relatedPost.published_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <span className="material-symbols-outlined text-xs">visibility</span>
                                                                    {relatedPost.view_count || 0}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </aside>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogDetail;
