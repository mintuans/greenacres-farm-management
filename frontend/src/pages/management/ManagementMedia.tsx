import React, { useEffect, useState, useRef } from 'react';
import { getMediaFiles, uploadMedia, deleteMedia, getMediaById, MediaFile } from '../../services/media.service';
import { getMediaUrl } from '../../services/products.service';

const ManagementMedia: React.FC = () => {
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [categories, setCategories] = useState<string[]>(['gallery', 'product', 'blog', 'avatar', 'images_farm', 'household', 'electronics', 'plants']);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [uploadCategory, setUploadCategory] = useState('gallery');
    const [newCategoryName, setNewCategoryName] = useState('');
    const [showCategoryManager, setShowCategoryManager] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadMedia();
    }, [searchQuery, selectedCategory]);

    const loadMedia = async () => {
        try {
            setLoading(true);
            const response = await getMediaFiles({
                search: searchQuery || undefined,
                category: selectedCategory || undefined
            });
            setMediaFiles(response.data);
        } catch (error) {
            console.error('Error loading media:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setPendingFiles(Array.from(files));
        setShowUploadModal(true);
    };

    const handleConfirmUpload = async () => {
        if (pendingFiles.length === 0) return;

        setUploading(true);
        try {
            for (const file of pendingFiles) {
                await uploadMedia(file, uploadCategory);
            }
            alert('Upload media thành công!');
            setShowUploadModal(false);
            setPendingFiles([]);
            loadMedia();
        } catch (error) {
            console.error('Error uploading:', error);
            alert('Có lỗi khi upload media!');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleAddCategory = () => {
        if (!newCategoryName.trim()) return;
        if (categories.includes(newCategoryName.trim())) {
            alert('Thể loại này đã tồn tại!');
            return;
        }
        setCategories([...categories, newCategoryName.trim()]);
        setNewCategoryName('');
    };

    const handleDelete = async (id: string) => {
        if (confirm('Bạn có chắc muốn xóa ảnh này?')) {
            try {
                await deleteMedia(id);
                alert('Xóa ảnh thành công!');
                loadMedia();
                setSelectedMedia(null);
            } catch (error: any) {
                console.error('Error deleting:', error);
                alert(error.response?.data?.message || 'Có lỗi khi xóa ảnh!');
            }
        }
    };

    const handleViewDetail = async (media: MediaFile) => {
        try {
            const response = await getMediaById(media.id);
            setSelectedMedia(response.data);
        } catch (error) {
            console.error('Error loading media detail:', error);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-[#111813]">Quản lý Media</h1>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-4 py-2 bg-[#13ec49] text-[#102215] font-bold rounded-lg hover:bg-[#10d63f] transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">cloud_upload</span>
                    {uploading ? 'Đang upload...' : '+ Upload file'}
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleFileSelect}
                />
            </div>

            {/* Category Filter - Always Visible */}
            <div className="mb-6 bg-white p-4 md:p-6 rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${selectedCategory === null
                            ? 'bg-slate-900 text-white'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                            }`}
                    >
                        <span className="material-symbols-outlined text-[20px]">apps</span>
                        Tất cả
                    </button>

                    {categories.map((cat, index) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`group px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap flex-shrink-0 ${selectedCategory === cat
                                ? 'bg-[#13ec49] text-white'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">label</span>
                            <span className="capitalize">{cat}</span>
                            <div
                                role="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCategories(categories.filter(c => c !== cat));
                                    if (selectedCategory === cat) setSelectedCategory(null);
                                }}
                                className="ml-1 p-0.5 rounded hover:bg-black/10 transition-all duration-200 cursor-pointer"
                                title="Xóa thể loại"
                            >
                                <span className="material-symbols-outlined text-sm">close</span>
                            </div>
                        </button>
                    ))}

                    {/* Add New Category Inline */}
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            placeholder="Tên thể loại mới..."
                            className="text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13ec49] focus:border-[#13ec49] outline-none transition-all duration-200 w-40"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                        />
                        <button
                            onClick={handleAddCategory}
                            className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all duration-200"
                            title="Thêm thể loại"
                        >
                            <span className="material-symbols-outlined text-xl">add</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Tìm kiếm ảnh..."
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#13ec49] w-full max-w-md"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Grid */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                {loading ? (
                    <div className="text-center py-12 text-gray-500">Đang tải...</div>
                ) : mediaFiles.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        Chưa có ảnh nào. Click "Upload ảnh" để thêm!
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {mediaFiles.map((media) => (
                            <div
                                key={media.id}
                                className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                                onClick={() => handleViewDetail(media)}
                            >
                                {media.mime_type?.startsWith('video/') ? (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-white">
                                        <span className="material-symbols-outlined text-4xl mb-1">movie</span>
                                        <span className="text-[10px] opacity-70">VIDEO</span>
                                    </div>
                                ) : (
                                    <img
                                        src={getMediaUrl(media.id)}
                                        alt={media.image_name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = 'https://placehold.co/300x300?text=Image+Error';
                                        }}
                                    />
                                )}
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-center p-2">
                                        <p className="text-xs font-medium truncate">{media.image_name}</p>
                                        <p className="text-xs mt-1">{formatFileSize(media.file_size)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedMedia && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setSelectedMedia(null)}>
                    <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h2 className="text-xl font-bold">{selectedMedia.image_name}</h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {formatFileSize(selectedMedia.file_size)} • {selectedMedia.mime_type}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        ID: {selectedMedia.id}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedMedia(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            {/* Media Preview */}
                            <div className="mb-4 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center min-h-[300px]">
                                {selectedMedia.mime_type?.startsWith('video/') ? (
                                    <video
                                        src={selectedMedia.image_data || getMediaUrl(selectedMedia.id)}
                                        controls
                                        className="w-full max-h-[60vh]"
                                    >
                                        Trình duyệt của bạn không hỗ trợ file video.
                                    </video>
                                ) : (
                                    <img
                                        src={selectedMedia.image_data || getMediaUrl(selectedMedia.id)}
                                        alt={selectedMedia.image_name}
                                        className="w-full h-auto max-h-[60vh] object-contain"
                                    />
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(selectedMedia.id);
                                        alert('Đã copy ID!');
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Copy ID
                                </button>
                                <button
                                    onClick={() => handleDelete(selectedMedia.id)}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                >
                                    Xóa ảnh
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Modal (Category Selection) */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                                <span className="material-symbols-outlined text-[#13ec49]">category</span>
                                Chọn thể loại trước khi lưu
                            </h2>

                            <p className="text-gray-500 text-sm mb-6">
                                Bạn đang chuẩn bị tải lên <strong>{pendingFiles.length}</strong> tệp tin. Vui lòng chọn danh mục phù hợp.
                            </p>

                            <div className="space-y-4 mb-8">
                                <label className="block text-sm font-bold text-gray-700">Thể loại</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {categories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setUploadCategory(cat)}
                                            className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${uploadCategory === cat
                                                ? 'border-[#13ec49] bg-[#13ec49]/10 text-[#13ec49]'
                                                : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowUploadModal(false);
                                        setPendingFiles([]);
                                    }}
                                    className="flex-1 py-3 rounded-xl font-bold text-gray-500 border border-gray-200 hover:bg-gray-50 transition-all"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    onClick={handleConfirmUpload}
                                    disabled={uploading}
                                    className="flex-1 py-3 rounded-xl font-bold bg-[#13ec49] text-[#102215] hover:bg-[#10d63f] transition-all disabled:opacity-50"
                                >
                                    {uploading ? 'Đang thực hiện...' : 'Bắt đầu lưu'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagementMedia;
