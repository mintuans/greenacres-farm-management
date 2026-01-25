import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/src/contexts/AuthContext';
import { uploadMedia } from '../services/media.service';
import { updateMyProfile } from '../services/profile.service';
import { getMediaUrl } from '../services/products.service';

const UserProfile: React.FC = () => {
    const { user, login, logout } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = React.useState(false);

    // Edit state
    const [isEditing, setIsEditing] = React.useState(false);
    const [formData, setFormData] = React.useState({
        full_name: '',
        phone: '',
        bio: '',
        address: ''
    });
    const [isSaving, setIsSaving] = React.useState(false);

    // Sync form data when user changes or edit mode enters
    React.useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || user.name || '',
                phone: user.phone || '',
                bio: user.bio || '',
                address: user.address || ''
            });
        }
    }, [user, isEditing]);

    // Default values if data is missing
    const displayName = user?.full_name || user?.name || 'Cây mận của bạn';
    const email = user?.email || 'user@example.com';
    const role = user?.role || 'Du khách';

    // Determine avatar URL
    const avatarUrl = user?.avatar_id
        ? getMediaUrl(user.avatar_id)
        : (user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=13ec49&color=fff&size=128`);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const uploadResult: any = await uploadMedia(file, 'avatar');
            const newAvatarId = uploadResult.data.id;

            const updateResult = await updateMyProfile({ avatar_id: newAvatarId });

            if (updateResult.success) {
                login({ ...user!, avatar_id: newAvatarId });
                alert('Thay đổi ảnh đại diện thành công!');
            }
        } catch (error) {
            console.error('Lỗi khi thay đổi avatar:', error);
            alert('Không thể thay đổi ảnh đại diện. Vui lòng thử lại.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveProfile = async () => {
        try {
            setIsSaving(true);
            const result = await updateMyProfile(formData);
            if (result.success) {
                login({ ...user!, ...formData });
                setIsEditing(false);
                alert('Cập nhật thông tin thành công!');
            }
        } catch (error) {
            console.error('Save profile error:', error);
            alert('Có lỗi xảy ra khi lưu thông tin.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-[#f6f8f6] min-h-screen flex flex-col font-['Plus_Jakarta_Sans',_sans-serif]">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
            />

            <div className="flex flex-1 justify-center py-8 px-4 md:px-10 lg:px-40">
                <div className="layout-content-container flex flex-col max-w-[1024px] flex-1 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Breadcrumbs */}
                    <div className="flex flex-wrap gap-2 items-center">
                        <Link to="/showcase" className="text-slate-500 text-sm font-medium leading-normal hover:underline">Trang chủ</Link>
                        <span className="text-slate-400 text-sm font-medium leading-normal">/</span>
                        <span className="text-slate-900 text-sm font-medium leading-normal">Hồ sơ cá nhân</span>
                    </div>

                    {/* Profile Header Card */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 w-full">
                                <div className="relative group">
                                    <div className="aspect-square rounded-full h-32 w-32 ring-4 ring-[#13ec49]/20 overflow-hidden border-4 border-white shadow-lg shadow-[#13ec49]/10 transition-transform duration-500 hover:scale-105">
                                        {isUploading ? (
                                            <div className="w-full h-full flex items-center justify-center bg-slate-100 animate-pulse">
                                                <span className="material-symbols-outlined animate-spin text-[#13ec49]">sync</span>
                                            </div>
                                        ) : (
                                            <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                    <button
                                        onClick={handleAvatarClick}
                                        disabled={isUploading}
                                        className="absolute bottom-0 right-0 bg-[#13ec49] text-slate-900 p-2.5 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all flex items-center justify-center border-4 border-white disabled:opacity-50"
                                    >
                                        <span className="material-symbols-outlined text-base">photo_camera</span>
                                    </button>
                                </div>
                                <div className="flex flex-col justify-center text-center md:text-left grow">
                                    {isEditing ? (
                                        <input
                                            name="full_name"
                                            value={formData.full_name}
                                            onChange={handleInputChange}
                                            className="text-slate-900 text-3xl font-bold leading-tight tracking-[-0.015em] bg-slate-50 border-b-2 border-[#13ec49] focus:outline-none w-full"
                                            placeholder="Họ và tên"
                                        />
                                    ) : (
                                        <h1 className="text-slate-900 text-3xl font-bold leading-tight tracking-[-0.015em]">{displayName}</h1>
                                    )}
                                    <p className="text-slate-500 text-base font-normal leading-normal">{role}</p>
                                    <div className="flex items-center justify-center md:justify-start gap-2 mt-1 text-slate-500">
                                        <span className="material-symbols-outlined text-sm">location_on</span>
                                        {isEditing ? (
                                            <input
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                className="text-sm bg-transparent border-b border-slate-200 focus:border-[#13ec49] focus:outline-none"
                                                placeholder="Địa chỉ của bạn"
                                            />
                                        ) : (
                                            <span className="text-sm">{formData.address || 'Chưa cập nhật địa chỉ'}</span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                                        <span className="bg-[#13ec49]/10 text-slate-900 text-xs font-bold px-3 py-1 rounded-full border border-[#13ec49]/20 uppercase tracking-tighter">Verified Member</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex w-full md:w-auto gap-3 flex-col sm:flex-row shrink-0 mt-4 md:mt-0">
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={isSaving}
                                            className="flex min-w-[120px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl h-12 px-5 bg-[#13ec49] text-slate-900 text-sm font-bold leading-normal tracking-[0.015em] hover:shadow-lg hover:shadow-[#13ec49]/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                                        >
                                            <span className="material-symbols-outlined">{isSaving ? 'sync' : 'save'}</span>
                                            <span className="truncate">{isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                                        </button>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="flex min-w-[120px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl h-12 px-5 bg-slate-100 text-slate-600 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-slate-200 transition-all"
                                        >
                                            <span className="material-symbols-outlined">close</span>
                                            <span className="truncate">Hủy</span>
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex min-w-[120px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl h-12 px-5 bg-[#13ec49] text-slate-900 text-sm font-bold leading-normal tracking-[0.015em] hover:shadow-lg hover:shadow-[#13ec49]/30 transition-all hover:scale-[1.02] active:scale-95"
                                    >
                                        <span className="material-symbols-outlined">edit</span>
                                        <span className="truncate">Chỉnh sửa hồ sơ</span>
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        logout();
                                        navigate('/showcase');
                                    }}
                                    className="flex min-w-[120px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl h-12 px-5 bg-rose-50 text-rose-600 text-sm font-bold leading-normal tracking-[0.015em] border border-rose-100 hover:bg-rose-100 hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    <span className="material-symbols-outlined">logout</span>
                                    <span className="truncate">Đăng xuất</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Details Container */}
                    <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
                        <div className="flex flex-col gap-6">
                            {/* Personal Information Section */}
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                <h2 className="text-slate-900 text-xl font-bold mb-6 flex items-center gap-2">
                                    <span className="w-1.5 h-6 bg-[#13ec49] rounded-full"></span>
                                    Thông tin cá nhân
                                </h2>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="flex flex-col gap-1.5 group">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider group-focus-within:text-[#13ec49] transition-colors">Họ và tên</label>
                                            {isEditing ? (
                                                <input
                                                    name="full_name"
                                                    value={formData.full_name}
                                                    onChange={handleInputChange}
                                                    className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-slate-900 font-medium focus:ring-2 focus:ring-[#13ec49]/30 focus:border-[#13ec49] outline-none transition-all"
                                                />
                                            ) : (
                                                <div className="text-slate-900 text-base font-medium p-3.5 bg-slate-50 rounded-xl border border-slate-100 group-hover:border-[#13ec49]/30 transition-colors shadow-inner">
                                                    {displayName}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-1.5 group">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider group-focus-within:text-[#13ec49] transition-colors">Số điện thoại</label>
                                            {isEditing ? (
                                                <input
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-slate-900 font-medium focus:ring-2 focus:ring-[#13ec49]/30 focus:border-[#13ec49] outline-none transition-all"
                                                />
                                            ) : (
                                                <div className="text-slate-900 text-base font-medium p-3.5 bg-slate-50 rounded-xl border border-slate-100 group-hover:border-[#13ec49]/30 transition-colors shadow-inner">
                                                    {formData.phone || 'Chưa cập nhật'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5 group">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider group-focus-within:text-[#13ec49] transition-colors">Địa chỉ Email</label>
                                        <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100 group-hover:border-[#13ec49]/30 transition-colors shadow-inner">
                                            <span className="text-slate-900 text-base font-medium">{email}</span>
                                            <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                                                <span className="material-symbols-outlined text-base">verified</span>
                                                <span className="text-[10px] font-bold uppercase tracking-tight">Đã xác thực</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5 group">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider group-focus-within:text-[#13ec49] transition-colors">Tiểu sử / Ghi chú</label>
                                        {isEditing ? (
                                            <textarea
                                                name="bio"
                                                value={formData.bio}
                                                onChange={handleInputChange}
                                                rows={4}
                                                className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-slate-900 font-medium focus:ring-2 focus:ring-[#13ec49]/30 focus:border-[#13ec49] outline-none transition-all resize-none"
                                            />
                                        ) : (
                                            <div className="text-slate-600 text-sm leading-relaxed p-3.5 bg-slate-50 rounded-xl border border-slate-100 min-h-[100px] group-hover:border-[#13ec49]/30 transition-colors shadow-inner">
                                                {formData.bio || 'Hãy chia sẻ đôi chút về bạn...'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Branding */}
            <footer className="mt-auto py-10 text-center border-t border-slate-100 bg-white">
                <div className="flex items-center justify-center gap-2 text-slate-400 mb-1">
                    <span className="material-symbols-outlined text-[18px]">agriculture</span>
                    <p className="text-sm font-medium">© 2024 FarmTrack Management Systems</p>
                </div>
                <p className="text-slate-300 text-xs">Empowering farmers with smart digital tools.</p>
            </footer>
        </div>
    );
};

export default UserProfile;
