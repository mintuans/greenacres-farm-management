import React, { useEffect, useState, useRef } from 'react';
import { getMediaFiles, uploadMedia, deleteMedia, getMediaById, MediaFile } from '../../services/media.service';
import { getMediaUrl } from '../../services/products.service';

const ManagementMedia: React.FC = () => {
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadMedia();
    }, [searchQuery]);

    const loadMedia = async () => {
        try {
            setLoading(true);
            const response = await getMediaFiles({ search: searchQuery || undefined });
            setMediaFiles(response.data);
        } catch (error) {
            console.error('Error loading media:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        try {
            for (let i = 0; i < files.length; i++) {
                await uploadMedia(files[i]);
            }
            alert('Upload ảnh thành công!');
            loadMedia();
        } catch (error) {
            console.error('Error uploading:', error);
            alert('Có lỗi khi upload ảnh!');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
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
                <h1 className="text-2xl font-bold text-[#111813]">Quản lý Ảnh</h1>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-4 py-2 bg-[#13ec49] text-[#102215] font-bold rounded-lg hover:bg-[#10d63f] transition-colors disabled:opacity-50"
                >
                    {uploading ? 'Đang upload...' : '+ Upload ảnh'}
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                />
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
                                <img
                                    src={getMediaUrl(media.id)}
                                    alt={media.image_name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                        // Ngăn chặn loop vô tận nếu placeholder cũng lỗi
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = 'https://placehold.co/300x300?text=Image+Error';
                                    }}
                                />
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

                            {/* Image Preview */}
                            <div className="mb-4 bg-gray-100 rounded-lg overflow-hidden">
                                <img
                                    src={selectedMedia.image_data || getMediaUrl(selectedMedia.id)}
                                    alt={selectedMedia.image_name}
                                    className="w-full h-auto max-h-[60vh] object-contain"
                                />
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
        </div>
    );
};

export default ManagementMedia;
