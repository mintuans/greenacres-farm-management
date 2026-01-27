import React, { useState, useEffect } from 'react';
import { sendNotification, getSentHistory, revokeNotification } from '../api/notification.api';
import { getPublicUsers, PublicUser } from '../api/user.api';

const Notifications: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'SEND' | 'HISTORY'>('SEND');

    // Form States
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [type, setType] = useState<'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'ALERT'>('INFO');
    const [category, setCategory] = useState('SYSTEM');
    const [link, setLink] = useState('');
    const [recipientIds, setRecipientIds] = useState<string[]>([]);
    const [users, setUsers] = useState<PublicUser[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [sending, setSending] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // History States
    const [history, setHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        if (activeTab === 'SEND') {
            loadUsers();
        } else {
            loadHistory();
        }
    }, [activeTab]);

    const loadUsers = async () => {
        try {
            setLoadingUsers(true);
            const data = await getPublicUsers();
            setUsers(data);
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const loadHistory = async () => {
        try {
            setLoadingHistory(true);
            const data = await getSentHistory();
            setHistory(data);
        } catch (error) {
            console.error('Error loading history:', error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleToggleRecipient = (userId: string) => {
        if (recipientIds.includes(userId)) {
            setRecipientIds(recipientIds.filter(id => id !== userId));
        } else {
            setRecipientIds([...recipientIds, userId]);
        }
    };

    const handleSelectAll = () => {
        if (recipientIds.length === filteredUsers.length) {
            setRecipientIds([]);
        } else {
            setRecipientIds(filteredUsers.map(u => u.id));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (recipientIds.length === 0) {
            alert('Vui lòng chọn ít nhất một người nhận');
            return;
        }

        try {
            setSending(true);
            await sendNotification({
                title,
                content,
                type,
                category,
                link,
                recipient_ids: recipientIds
            });
            alert('Gửi thông báo thành công!');
            // Reset form
            setTitle('');
            setContent('');
            setRecipientIds([]);
        } catch (error: any) {
            console.error('Error sending notification:', error);
            alert(error.response?.data?.message || 'Không thể gửi thông báo');
        } finally {
            setSending(false);
        }
    };

    const handleRevoke = async (notifId: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn thu hồi thông báo này không? Nó sẽ bị xóa khỏi tất cả người nhận.')) return;

        try {
            await revokeNotification(notifId);
            alert('Đã thu hồi thông báo thành công');
            loadHistory();
        } catch (error) {
            console.error('Error revoking notification:', error);
            alert('Không thể thu hồi thông báo');
        }
    };

    const filteredUsers = users.filter(user =>
        (user.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'SUCCESS': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'WARNING': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'ERROR': return 'bg-rose-50 text-rose-600 border-rose-100';
            case 'ALERT': return 'bg-purple-50 text-purple-600 border-purple-100';
            default: return 'bg-blue-50 text-blue-600 border-blue-100';
        }
    };

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-[1200px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                        Quản lý Thông báo
                    </h1>
                    <p className="text-slate-500 mt-2">Hệ thống gửi tin và quản lý thông báo nội bộ</p>
                </div>

                <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm self-start">
                    <button
                        onClick={() => setActiveTab('SEND')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'SEND'
                                ? 'bg-[#13ec49] text-black shadow-lg shadow-[#13ec49]/20'
                                : 'text-slate-500 hover:bg-slate-50'
                            }`}
                    >
                        <span className="material-symbols-outlined text-[20px]">send</span>
                        Gửi mới
                    </button>
                    <button
                        onClick={() => setActiveTab('HISTORY')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'HISTORY'
                                ? 'bg-[#13ec49] text-black shadow-lg shadow-[#13ec49]/20'
                                : 'text-slate-500 hover:bg-slate-50'
                            }`}
                    >
                        <span className="material-symbols-outlined text-[20px]">history</span>
                        Lịch sử đã gửi
                    </button>
                </div>
            </div>

            {activeTab === 'SEND' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Form Section */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-6">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#13ec49]">edit_note</span>
                            Soạn thông báo
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Tiêu đề *</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#13ec49]/30 transition-all outline-none text-slate-700"
                                    placeholder="Nhập tiêu đề thông báo..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Nội dung *</label>
                                <textarea
                                    required
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    rows={4}
                                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#13ec49]/30 transition-all outline-none resize-none text-slate-600"
                                    placeholder="Nhập nội dung chi tiết thông báo..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Loại</label>
                                    <select
                                        value={type}
                                        onChange={(e) => setType(e.target.value as any)}
                                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#13ec49]/30 transition-all outline-none text-slate-600 font-medium"
                                    >
                                        <option value="INFO">Thông tin (Info)</option>
                                        <option value="SUCCESS">Thành công (Success)</option>
                                        <option value="WARNING">Cảnh báo (Warning)</option>
                                        <option value="ERROR">Lỗi (Error)</option>
                                        <option value="ALERT">Khẩn cấp (Alert)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Danh mục</label>
                                    <input
                                        type="text"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#13ec49]/30 transition-all outline-none uppercase text-slate-600"
                                        placeholder="SYSTEM, PAYROLL..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Đường dẫn chuyển hướng (Link)</label>
                                <input
                                    type="text"
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#13ec49]/30 transition-all outline-none text-slate-600"
                                    placeholder="/dashboard, /master-data/payroll..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={sending}
                                className={`w-full py-4 rounded-2xl font-black text-lg transition-all shadow-xl flex items-center justify-center gap-3 ${sending
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        : 'bg-[#13ec49] hover:bg-[#13ec49]/90 text-black shadow-[#13ec49]/20 hover:scale-[1.02] active:scale-95'
                                    }`}
                            >
                                {sending ? (
                                    <div className="size-6 border-4 border-slate-300 border-t-[#13ec49] rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">send</span>
                                        <span>Gửi thông báo ngay</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Recipient Selection Section */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 flex flex-col space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#13ec49]">person_add</span>
                                Chọn người nhận
                            </h2>
                            <span className="text-xs font-black px-3 py-1 bg-slate-100 text-slate-500 rounded-lg">
                                ĐÃ CHỌN: {recipientIds.length}
                            </span>
                        </div>

                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#13ec49]/30 transition-all outline-none"
                                placeholder="Tìm tên hoặc email..."
                            />
                        </div>

                        <div className="flex items-center justify-between px-2">
                            <button
                                onClick={handleSelectAll}
                                className="text-xs font-bold text-[#13ec49] hover:underline"
                            >
                                {recipientIds.length === filteredUsers.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả lọc được'}
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto min-h-[400px] max-h-[500px] pr-2 space-y-2 no-scrollbar">
                            {loadingUsers ? (
                                <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
                                    <div className="size-12 border-4 border-slate-200 border-t-[#13ec49] rounded-full animate-spin" />
                                    <p className="mt-4 text-xs font-bold uppercase tracking-widest">Đang tải danh sách...</p>
                                </div>
                            ) : filteredUsers.length === 0 ? (
                                <div className="text-center py-20 text-slate-400 italic text-sm">
                                    Không tìm thấy người dùng nào phù hợp
                                </div>
                            ) : (
                                filteredUsers.map(user => {
                                    const isSelected = recipientIds.includes(user.id);
                                    return (
                                        <div
                                            key={user.id}
                                            onClick={() => handleToggleRecipient(user.id)}
                                            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group ${isSelected
                                                    ? 'border-[#13ec49] bg-green-50'
                                                    : 'border-slate-50 bg-slate-50/50 hover:bg-white hover:border-slate-200'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="size-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-xs font-black text-slate-400">
                                                    {user.full_name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-bold ${isSelected ? 'text-green-900' : 'text-slate-700'}`}>
                                                        {user.full_name}
                                                    </p>
                                                    <p className="text-[11px] text-slate-400">{user.email || user.phone}</p>
                                                </div>
                                            </div>
                                            <div className={`size-6 rounded-lg flex items-center justify-center transition-all ${isSelected ? 'bg-[#13ec49] text-black scale-110 shadow-lg shadow-[#13ec49]/30' : 'bg-white border border-slate-200 text-transparent'
                                                }`}>
                                                <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-800">Thông báo đã gửi</h2>
                        <span className="text-xs font-black px-4 py-2 bg-slate-50 text-slate-400 rounded-xl border border-slate-100">
                            TỔNG SỐ: {history.length}
                        </span>
                    </div>

                    <div className="min-h-[500px]">
                        {loadingHistory ? (
                            <div className="py-20 flex flex-col items-center justify-center opacity-50">
                                <div className="size-12 border-4 border-slate-100 border-t-[#13ec49] rounded-full animate-spin" />
                            </div>
                        ) : history.length === 0 ? (
                            <div className="py-32 flex flex-col items-center justify-center text-slate-400 grayscale">
                                <span className="material-symbols-outlined text-[64px] opacity-20 mb-4">history</span>
                                <p className="text-sm font-bold">Chưa có thông báo nào được gửi</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50">
                                            <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Nội dung</th>
                                            <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Loại & Danh mục</th>
                                            <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Người nhận</th>
                                            <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Ngày gửi</th>
                                            <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {history.map((notif) => (
                                            <tr key={notif.id} className="hover:bg-slate-50/30 transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-start gap-4 max-w-[400px]">
                                                        <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 border ${getTypeColor(notif.type)}`}>
                                                            <span className="material-symbols-outlined text-[20px]">
                                                                {notif.type === 'SUCCESS' ? 'check_circle' :
                                                                    notif.type === 'WARNING' ? 'warning' :
                                                                        notif.type === 'ERROR' ? 'error' :
                                                                            notif.type === 'ALERT' ? 'notifications_active' : 'info'}
                                                            </span>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-bold text-slate-800 truncate mb-1">{notif.title}</p>
                                                            <p className="text-xs text-slate-500 line-clamp-1">{notif.content}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <div className="flex flex-col gap-1.5">
                                                        <span className={`text-[10px] w-fit font-black px-2 py-0.5 rounded-lg border ${getTypeColor(notif.type)}`}>
                                                            {notif.type}
                                                        </span>
                                                        <span className="text-[10px] font-black text-slate-400 uppercase">
                                                            {notif.category}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-sm font-black text-slate-700">{notif.total_recipients}</span>
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <span className="size-1.5 rounded-full bg-emerald-400"></span>
                                                            <span className="text-[10px] font-bold text-emerald-500">{notif.read_count} đã đọc</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <p className="text-xs font-bold text-slate-500">
                                                        {new Date(notif.created_at).toLocaleDateString('vi-VN')}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                                        {new Date(notif.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <button
                                                        onClick={() => handleRevoke(notif.id)}
                                                        className="px-4 py-2 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 ml-auto"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">cancel</span>
                                                        Thu hồi
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notifications;
