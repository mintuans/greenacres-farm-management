import React, { useState, useEffect } from 'react';
import { sendNotification, getSentHistory, revokeNotification } from '../api/notification.api';
import { getPublicUsers, PublicUser } from '../api/user.api';
import { useTranslation } from 'react-i18next';

const Notifications: React.FC = () => {
    const { t } = useTranslation();
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
            alert(t('notifications.messages.select_recipient_req'));
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
            alert(t('notifications.messages.send_success'));
            // Reset form
            setTitle('');
            setContent('');
            setRecipientIds([]);
        } catch (error: any) {
            console.error('Error sending notification:', error);
            alert(error.response?.data?.message || t('notifications.messages.send_error'));
        } finally {
            setSending(false);
        }
    };

    const handleRevoke = async (notifId: string) => {
        if (!window.confirm(t('notifications.messages.revoke_confirm'))) return;

        try {
            await revokeNotification(notifId);
            alert(t('notifications.messages.revoke_success'));
            loadHistory();
        } catch (error) {
            console.error('Error revoking notification:', error);
            alert(t('notifications.messages.revoke_error'));
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
                        {t('notifications.title')}
                    </h1>
                    <p className="text-slate-500 mt-2">{t('notifications.subtitle')}</p>
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
                        {t('notifications.tab_send')}
                    </button>
                    <button
                        onClick={() => setActiveTab('HISTORY')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'HISTORY'
                                ? 'bg-[#13ec49] text-black shadow-lg shadow-[#13ec49]/20'
                                : 'text-slate-500 hover:bg-slate-50'
                            }`}
                    >
                        <span className="material-symbols-outlined text-[20px]">history</span>
                        {t('notifications.tab_history')}
                    </button>
                </div>
            </div>

            {activeTab === 'SEND' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Form Section */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-6">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#13ec49]">edit_note</span>
                            {t('notifications.compose')}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">{t('notifications.form.title_label')}</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#13ec49]/30 transition-all outline-none text-slate-700"
                                    placeholder={t('notifications.form.title_placeholder')}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">{t('notifications.form.content_label')}</label>
                                <textarea
                                    required
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    rows={4}
                                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#13ec49]/30 transition-all outline-none resize-none text-slate-600"
                                    placeholder={t('notifications.form.content_placeholder')}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">{t('notifications.form.type_label')}</label>
                                    <select
                                        value={type}
                                        onChange={(e) => setType(e.target.value as any)}
                                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#13ec49]/30 transition-all outline-none text-slate-600 font-medium"
                                    >
                                        <option value="INFO">{t('notifications.types.info')}</option>
                                        <option value="SUCCESS">{t('notifications.types.success')}</option>
                                        <option value="WARNING">{t('notifications.types.warning')}</option>
                                        <option value="ERROR">{t('notifications.types.error')}</option>
                                        <option value="ALERT">{t('notifications.types.alert')}</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">{t('notifications.form.category_label')}</label>
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
                                <label className="text-sm font-bold text-slate-700 ml-1">{t('notifications.form.link_label')}</label>
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
                                        <span>{t('notifications.form.send_btn')}</span>
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
                                {t('notifications.recipient.title')}
                            </h2>
                            <span className="text-xs font-black px-3 py-1 bg-slate-100 text-slate-500 rounded-lg">
                                {t('notifications.recipient.selected', { count: recipientIds.length })}
                            </span>
                        </div>

                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#13ec49]/30 transition-all outline-none"
                                placeholder={t('notifications.recipient.search')}
                            />
                        </div>

                        <div className="flex items-center justify-between px-2">
                            <button
                                onClick={handleSelectAll}
                                className="text-xs font-bold text-[#13ec49] hover:underline"
                            >
                                {recipientIds.length === filteredUsers.length ? t('notifications.recipient.deselect_all') : t('notifications.recipient.select_all')}
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto min-h-[400px] max-h-[500px] pr-2 space-y-2 no-scrollbar">
                            {loadingUsers ? (
                                <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
                                    <div className="size-12 border-4 border-slate-200 border-t-[#13ec49] rounded-full animate-spin" />
                                    <p className="mt-4 text-xs font-bold uppercase tracking-widest">{t('notifications.recipient.loading')}</p>
                                </div>
                            ) : filteredUsers.length === 0 ? (
                                <div className="text-center py-20 text-slate-400 italic text-sm">
                                    {t('notifications.recipient.not_found')}
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
                        <h2 className="text-xl font-bold text-slate-800">{t('notifications.history.title')}</h2>
                        <span className="text-xs font-black px-4 py-2 bg-slate-50 text-slate-400 rounded-xl border border-slate-100">
                            {t('notifications.history.total', { count: history.length })}
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
                                <p className="text-sm font-bold">{t('notifications.history.empty')}</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50">
                                            <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">{t('notifications.history.columns.content')}</th>
                                            <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">{t('notifications.history.columns.type_category')}</th>
                                            <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">{t('notifications.history.columns.recipient')}</th>
                                            <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">{t('notifications.history.columns.date')}</th>
                                            <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">{t('notifications.history.columns.actions')}</th>
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
                                                            <span className="text-[10px] font-bold text-emerald-500">{t('notifications.history.read_count', { count: notif.read_count })}</span>
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
                                                        {t('notifications.history.revoke')}
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
