import React, { useState, useEffect } from 'react';
import { getMyNotifications, markAsRead, markAllAsRead, Notification } from '../api/notification.api';
import { useAuth } from '../contexts/AuthContext';

interface NotificationDropdownProps {
    isOpen: boolean;
    onClose: () => void;
    onUnreadCountChange?: (count: number) => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose, onUnreadCountChange }) => {
    const { isAuthenticated } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Initial load when component mounts (or to periodically check)
    useEffect(() => {
        if (isAuthenticated) {
            loadNotifications(false); // Silent load just for count
        }
    }, [isAuthenticated]);

    // Lift unreadCount change to parent
    useEffect(() => {
        if (onUnreadCountChange) {
            onUnreadCountChange(unreadCount);
        }
    }, [unreadCount, onUnreadCountChange]);

    useEffect(() => {
        if (isOpen && isAuthenticated) {
            loadNotifications(true);
        }
    }, [isOpen, isAuthenticated]);

    const loadNotifications = async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            const data = await getMyNotifications(10);
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    const handleMarkAsRead = async (id: string, isAlreadyRead: boolean) => {
        if (isAlreadyRead) return;
        try {
            await markAsRead(id);
            // Optimistic update
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.round(diffMs / 60000);
        const diffHours = Math.round(diffMs / 3600000);
        const diffDays = Math.round(diffMs / 86400000);

        if (diffMins < 1) return 'Vừa xong';
        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        if (diffDays < 7) return `${diffDays} ngày trước`;
        return date.toLocaleDateString('vi-VN');
    };

    if (!isOpen) return null;

    const getTypeStyles = (type: string) => {
        switch (type) {
            case 'SUCCESS': return { bg: 'bg-emerald-50 text-emerald-500', icon: 'check_circle' };
            case 'WARNING': return { bg: 'bg-amber-50 text-amber-500', icon: 'warning' };
            case 'ERROR': return { bg: 'bg-rose-50 text-rose-500', icon: 'error' };
            case 'ALERT': return { bg: 'bg-purple-50 text-purple-500', icon: 'notifications_active' };
            default: return { bg: 'bg-blue-50 text-blue-500', icon: 'info' };
        }
    };

    return (
        <>
            {/* Overlay to close when clicking outside */}
            <div className="fixed inset-0 z-[25]" onClick={onClose} />

            <div className="absolute top-14 -right-2 sm:right-0 w-[340px] max-w-[calc(100vw-40px)] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden z-[30] animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Header */}
                <div className="px-4 md:px-6 py-3 md:py-5 border-b border-slate-50 flex items-center justify-between bg-white">
                    <div>
                        <h3 className="text-sm md:text-lg font-bold text-slate-800 leading-tight">Thông báo</h3>
                        <p className="text-[9px] md:text-[11px] text-slate-400 font-medium">Bạn có {unreadCount} thông báo mới</p>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="text-[8px] md:text-[11px] font-bold text-[#13ec49] hover:text-[#0fbc3a] px-2 py-0.5 md:py-1 bg-[#13ec49]/10 rounded-lg transition-all"
                        >
                            Đánh dấu tất cả
                        </button>
                    )}
                </div>

                {/* List */}
                <div className="max-h-[380px] md:max-h-[480px] overflow-y-auto no-scrollbar bg-slate-50/20">
                    {loading ? (
                        <div className="py-12 md:py-20 flex flex-col items-center justify-center">
                            <div className="size-6 md:size-8 border-3 md:border-4 border-slate-200 border-t-[#13ec49] rounded-full animate-spin" />
                            <p className="mt-3 md:mt-4 text-[9px] md:text-xs font-bold text-slate-400">ĐANG TẢI...</p>
                        </div>
                    ) : notifications.length > 0 ? (
                        <div className="flex flex-col">
                            {notifications.map((notif) => {
                                const styles = getTypeStyles(notif.type);
                                return (
                                    <div
                                        key={notif.id}
                                        onClick={() => handleMarkAsRead(notif.id, notif.is_read)}
                                        className={`p-3 md:p-5 transition-all cursor-pointer relative group border-l-4 border-transparent hover:bg-white hover:shadow-[0_4px_12px_rgba(0,0,0,0.03)] ${!notif.is_read ? 'bg-white border-l-[#13ec49]' : 'opacity-80'}`}
                                    >
                                        {!notif.is_read && (
                                            <div className="absolute top-4 right-3 md:top-6 md:right-5 size-1 md:size-2 bg-[#13ec49] rounded-full shadow-[0_0_8px_rgba(19,236,73,0.5)]" />
                                        )}
                                        <div className="flex gap-2.5 md:gap-4">
                                            <div className={`size-8 md:size-12 rounded-lg md:rounded-2xl ${styles.bg} flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105`}>
                                                <span className="material-symbols-outlined text-[16px] md:text-[24px]">{styles.icon}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-0.5 md:mb-1">
                                                    <h4 className={`text-xs md:text-sm font-bold truncate pr-4 ${!notif.is_read ? 'text-slate-900' : 'text-slate-500'}`}>
                                                        {notif.title}
                                                    </h4>
                                                </div>
                                                <p className="text-[11px] md:text-xs text-slate-500 line-clamp-2 leading-relaxed mb-2 md:mb-3">
                                                    {notif.content}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100/80 text-slate-500 font-bold tracking-tight uppercase">
                                                            {notif.category}
                                                        </span>
                                                    </div>
                                                    <span className="text-[9px] font-bold text-slate-400 italic">{formatTime(notif.created_at)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-8 md:py-20 flex flex-col items-center justify-center text-slate-400">
                            <div className="size-12 md:size-20 bg-slate-100 rounded-full flex items-center justify-center mb-2 md:mb-4">
                                <span className="material-symbols-outlined text-[24px] md:text-[40px] opacity-30">notifications_off</span>
                            </div>
                            <p className="text-[11px] md:text-sm font-bold">Tuyệt vời! Không có thông báo mới</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 md:p-4 bg-white border-t border-slate-50">
                    <button className="w-full py-2 md:py-3 text-[10px] md:text-xs font-bold text-slate-600 hover:text-white hover:bg-[#13ec49] rounded-xl transition-all shadow-sm border border-slate-100 flex items-center justify-center gap-2 group">
                        Xem tất cả thông báo
                        <span className="material-symbols-outlined text-[14px] md:text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default NotificationDropdown;
