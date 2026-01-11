import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBlogPost, getBlogCategoriesForManagement, BlogCategory } from '../../services/blog.service';
import { getMediaFiles, MediaFile } from '../../services/media.service';
import { getMediaUrl } from '../../services/products.service';

const AddBlog: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
    const [showMediaModal, setShowMediaModal] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        thumbnail_id: '',
        category_id: '',
        status: 'DRAFT' as 'DRAFT' | 'PUBLISHED'
    });

    useEffect(() => {
        loadCategories();
        loadMedia();
    }, []);

    const loadCategories = async () => {
        try {
            const response = await getBlogCategoriesForManagement();
            setCategories(response.data || []);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const loadMedia = async () => {
        try {
            const response = await getMediaFiles({ category: 'blog', limit: 100 });
            setMediaFiles(response.data || []);
        } catch (error) {
            console.error('Error loading media:', error);
        }
    };

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    };

    const handleTitleChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            title: value,
            slug: generateSlug(value)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.slug || !formData.excerpt || !formData.content) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
            return;
        }

        try {
            setLoading(true);
            await createBlogPost(formData);
            alert('Tạo bài viết thành công!');
            navigate('/master-data/showcase-blog');
        } catch (error: any) {
            console.error('Error creating blog post:', error);
            alert(error.response?.data?.message || 'Có lỗi khi tạo bài viết!');
        } finally {
            setLoading(false);
        }
    };

    const selectedMedia = mediaFiles.find(m => m.id === formData.thumbnail_id);

    return (
        <div className="p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <button
                        onClick={() => navigate('/master-data/showcase-blog')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-2xl font-bold text-[#111813]">Tạo bài viết mới</h1>
                </div>
                <p className="text-sm text-gray-500 ml-14">Điền thông tin để tạo bài viết tin tức mới</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Main Content Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Tiêu đề <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#13ec49]"
                            placeholder="Nhập tiêu đề bài viết..."
                            required
                        />
                    </div>

                    {/* Slug */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Slug (URL) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#13ec49] font-mono text-sm"
                            placeholder="tieu-de-bai-viet"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            URL: /showcase/blog/{formData.slug || 'slug-cua-ban'}
                        </p>
                    </div>

                    {/* Excerpt */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Mô tả ngắn <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={formData.excerpt}
                            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#13ec49] resize-none"
                            rows={3}
                            placeholder="Nhập mô tả ngắn gọn về bài viết..."
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {formData.excerpt.length}/200 ký tự
                        </p>
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Nội dung <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#13ec49] resize-none font-mono text-sm"
                            rows={15}
                            placeholder="Nhập nội dung bài viết (hỗ trợ Markdown)..."
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Hỗ trợ định dạng Markdown
                        </p>
                    </div>
                </div>

                {/* Sidebar Settings */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                    <h3 className="text-lg font-bold text-gray-900">Cài đặt</h3>

                    {/* Thumbnail */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Ảnh đại diện
                        </label>
                        {selectedMedia ? (
                            <div className="relative group">
                                <img
                                    src={getMediaUrl(selectedMedia.id)}
                                    alt="Thumbnail"
                                    className="w-full h-48 object-cover rounded-lg"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowMediaModal(true)}
                                        className="px-4 py-2 bg-white text-gray-900 rounded-lg font-bold hover:bg-gray-100"
                                    >
                                        Thay đổi
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, thumbnail_id: '' })}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700"
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setShowMediaModal(true)}
                                className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-[#13ec49] hover:bg-[#13ec49]/5 transition-colors"
                            >
                                <span className="material-symbols-outlined text-4xl text-gray-400">add_photo_alternate</span>
                                <span className="text-sm font-bold text-gray-600">Chọn ảnh đại diện</span>
                            </button>
                        )}
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Danh mục
                        </label>
                        <select
                            value={formData.category_id}
                            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#13ec49]"
                        >
                            <option value="">-- Chọn danh mục --</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.category_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Trạng thái
                        </label>
                        <div className="space-y-2">
                            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                <input
                                    type="radio"
                                    name="status"
                                    value="DRAFT"
                                    checked={formData.status === 'DRAFT'}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'DRAFT' })}
                                    className="w-4 h-4 text-[#13ec49]"
                                />
                                <div>
                                    <p className="font-bold text-sm">Bản nháp</p>
                                    <p className="text-xs text-gray-500">Chỉ admin có thể xem</p>
                                </div>
                            </label>
                            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                <input
                                    type="radio"
                                    name="status"
                                    value="PUBLISHED"
                                    checked={formData.status === 'PUBLISHED'}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'PUBLISHED' })}
                                    className="w-4 h-4 text-[#13ec49]"
                                />
                                <div>
                                    <p className="font-bold text-sm">Xuất bản</p>
                                    <p className="text-xs text-gray-500">Hiển thị công khai</p>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/master-data/showcase-blog')}
                        className="px-6 py-3 border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-[#13ec49] text-[#102215] rounded-lg font-bold hover:bg-[#10d63f] transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-[#102215] border-t-transparent rounded-full animate-spin"></div>
                                Đang lưu...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">save</span>
                                Lưu bài viết
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Media Selection Modal */}
            {showMediaModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold">Chọn ảnh đại diện</h3>
                            <button
                                onClick={() => setShowMediaModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                                {mediaFiles.filter(m => m.mime_type?.startsWith('image/')).map(media => (
                                    <div
                                        key={media.id}
                                        onClick={() => {
                                            setFormData({ ...formData, thumbnail_id: media.id });
                                            setShowMediaModal(false);
                                        }}
                                        className={`aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all hover:scale-105 ${formData.thumbnail_id === media.id
                                            ? 'border-[#13ec49] ring-2 ring-[#13ec49]/50'
                                            : 'border-transparent hover:border-gray-300'
                                            }`}
                                    >
                                        <img
                                            src={getMediaUrl(media.id)}
                                            alt={media.image_name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddBlog;
