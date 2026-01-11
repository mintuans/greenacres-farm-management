import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllBlogPostsForManagement, deleteBlogPost, BlogPost } from '../../services/blog.service';
import { getMediaUrl } from '../../services/products.service';

const ManagementBlog: React.FC = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadPosts();
    }, [searchQuery]);

    const loadPosts = async () => {
        try {
            setLoading(true);
            const response = await getAllBlogPostsForManagement({
                search: searchQuery || undefined,
                limit: 100
            });
            setPosts(response.data);
        } catch (error) {
            console.error('Error loading posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status: string) => {
        return status === 'PUBLISHED'
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-700';
    };

    const getStatusText = (status: string) => {
        return status === 'PUBLISHED' ? 'Đã xuất bản' : 'Bản nháp';
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[#111813]">Quản lý Tin tức</h1>
                    <p className="text-sm text-gray-500 mt-1">Quản lý các bài viết tin tức trên trang Showcase</p>
                </div>
                <button
                    onClick={() => navigate('/master-data/showcase-blog/add')}
                    className="px-4 py-2 bg-[#13ec49] text-[#102215] font-bold rounded-lg hover:bg-[#10d63f] transition-colors flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">add</span>
                    Tạo bài viết mới
                </button>
            </div>

            {/* Search */}
            <div className="mb-4">
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        search
                    </span>
                    <input
                        type="text"
                        placeholder="Tìm kiếm bài viết..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#13ec49]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#13ec49]"></div>
                        <p className="text-gray-500 mt-2">Đang tải...</p>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-12">
                        <span className="material-symbols-outlined text-6xl text-gray-300">article</span>
                        <p className="text-gray-500 mt-2">Chưa có bài viết nào</p>
                        <button
                            onClick={() => navigate('/master-data/showcase-blog/add')}
                            className="mt-4 text-[#13ec49] font-bold hover:underline"
                        >
                            Tạo bài viết đầu tiên
                        </button>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Bài viết
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Danh mục
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Lượt xem
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Ngày xuất bản
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {posts.map((post) => (
                                <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {post.thumbnail_id && (
                                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                                    <img
                                                        src={getMediaUrl(post.thumbnail_id)}
                                                        alt={post.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="font-bold text-gray-900 truncate">{post.title}</p>
                                                <p className="text-sm text-gray-500 truncate">{post.excerpt}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-600">
                                            {post.category_name || '—'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusBadge(post.status)}`}>
                                            {getStatusText(post.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                            <span className="material-symbols-outlined text-sm">visibility</span>
                                            {post.view_count || 0}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-600">
                                            {formatDate(post.published_at)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => navigate(`/master-data/showcase-blog/edit/${post.id}`)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Chỉnh sửa"
                                            >
                                                <span className="material-symbols-outlined text-sm">edit</span>
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    if (confirm('Bạn có chắc muốn xóa bài viết này?')) {
                                                        try {
                                                            await deleteBlogPost(post.id);
                                                            alert('Xóa bài viết thành công!');
                                                            loadPosts();
                                                        } catch (error: any) {
                                                            console.error('Error deleting post:', error);
                                                            alert(error.response?.data?.message || 'Có lỗi khi xóa bài viết!');
                                                        }
                                                    }
                                                }}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Xóa"
                                            >
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ManagementBlog;
