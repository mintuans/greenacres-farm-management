import React, { useEffect, useRef } from 'react';

export interface FormModalProps {
    /** Có hiện modal không */
    open: boolean;
    /** Đóng modal */
    onClose: () => void;
    /** Tiêu đề modal */
    title: string;
    /** Phụ đề nhỏ bên dưới title (tùy chọn) */
    subtitle?: string;
    /** Icon Material Symbol bên cạnh title (tùy chọn) */
    icon?: string;
    /** Nội dung / form fields — render prop */
    children: React.ReactNode;
    /** Nhãn nút submit chính */
    submitLabel?: string;
    /** Nhãn nút hủy */
    cancelLabel?: string;
    /** Hàm submit — nếu bỏ qua thì nút submit không hiển thị (tự xử lý bên trong form) */
    onSubmit?: (e: React.FormEvent) => void;
    /** Đang loading / submitting */
    isSubmitting?: boolean;
    /** Màu nút submit: 'primary' | 'danger' */
    submitVariant?: 'primary' | 'danger';
    /** Kích thước modal: 'sm' | 'md' | 'lg' | 'xl' */
    size?: 'sm' | 'md' | 'lg' | 'xl';
    /** Footer tùy chỉnh thay thế nút mặc định */
    footer?: React.ReactNode;
}

const sizeMap = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
};

export const FormModal: React.FC<FormModalProps> = ({
    open,
    onClose,
    title,
    subtitle,
    icon,
    children,
    submitLabel = 'Lưu',
    cancelLabel = 'Hủy bỏ',
    onSubmit,
    isSubmitting = false,
    submitVariant = 'primary',
    size = 'md',
    footer,
}) => {
    const overlayRef = useRef<HTMLDivElement>(null);

    // Đóng khi nhấn Escape
    useEffect(() => {
        if (!open) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [open, onClose]);

    // Khóa scroll body khi modal mở
    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    if (!open) return null;

    const submitClasses =
        submitVariant === 'danger'
            ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20'
            : 'bg-[#13ec49] hover:bg-[#10d63f] text-black shadow-[#13ec49]/20';

    const content = onSubmit ? (
        <form onSubmit={onSubmit} className="flex flex-col gap-0">
            <div className="flex-1 overflow-y-auto p-5 md:p-8 space-y-4 md:space-y-5 custom-scrollbar">
                {children}
            </div>
            {footer !== undefined ? footer : (
                <div className="flex gap-2.5 px-5 md:px-8 pb-5 md:pb-8 pt-3 md:pt-4 border-t border-slate-100 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-2.5 md:py-3 font-black text-slate-500 hover:bg-slate-50 rounded-xl transition-all text-[11px] md:text-sm uppercase tracking-widest"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`flex-[2] py-2.5 md:py-3 rounded-xl font-black text-[11px] md:text-sm uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60 ${submitClasses}`}
                    >
                        {isSubmitting ? (
                            <span className="material-symbols-outlined animate-spin text-[18px]">autorenew</span>
                        ) : (
                            <span className="material-symbols-outlined text-[18px]">save</span>
                        )}
                        {isSubmitting ? 'Đang lưu...' : submitLabel}
                    </button>
                </div>
            )}
        </form>
    ) : (
        <div className="flex flex-col gap-0">
            <div className="flex-1 overflow-y-auto p-5 md:p-8 space-y-4 md:space-y-5 custom-scrollbar">
                {children}
            </div>
            {footer !== undefined ? footer : (
                <div className="flex gap-2.5 px-5 md:px-8 pb-5 md:pb-8 pt-3 border-t border-slate-100 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-2.5 md:py-3 font-black text-slate-500 hover:bg-slate-50 rounded-xl transition-all text-[11px] md:text-sm uppercase tracking-widest"
                    >
                        {cancelLabel}
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
        >
            <div
                className={`bg-white w-full ${sizeMap[size]} rounded-[24px] sm:rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90dvh] overflow-hidden`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 md:px-8 pt-5 md:pt-6 pb-3 md:pb-4 shrink-0">
                    <div className="flex items-center gap-2.5 md:gap-3 min-w-0">
                        {icon && (
                            <div className="size-9 md:size-10 rounded-xl md:rounded-2xl bg-[#13ec49]/10 flex items-center justify-center text-[#13ec49] shrink-0">
                                <span className="material-symbols-outlined text-lg md:text-xl">{icon}</span>
                            </div>
                        )}
                        <div className="min-w-0">
                            <h2 className="text-lg md:text-2xl font-black text-slate-900 tracking-tight truncate">
                                {title}
                            </h2>
                            {subtitle && (
                                <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="size-8 md:size-9 flex items-center justify-center rounded-lg md:rounded-xl bg-slate-50 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all shrink-0 ml-3"
                    >
                        <span className="material-symbols-outlined text-[18px] md:text-[20px]">close</span>
                    </button>
                </div>

                {/* Body */}
                {content}
            </div>
        </div>
    );
};

export default FormModal;
