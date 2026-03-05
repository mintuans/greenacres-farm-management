import React, { useEffect, useRef } from 'react';

export interface ConfirmDeleteModalProps {
    /** Có hiện modal không */
    open: boolean;
    /** Đóng / hủy */
    onClose: () => void;
    /** Xác nhận xóa */
    onConfirm: () => void;
    /** Đang xử lý xóa */
    isDeleting?: boolean;
    /** Tên item đang xóa — hiển thị trong modal */
    itemName?: string;
    /** Mô tả cảnh báo thêm (tùy chọn) */
    description?: string;
    /** Nhãn nút xác nhận */
    confirmLabel?: string;
    /** Nhãn nút hủy */
    cancelLabel?: string;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
    open,
    onClose,
    onConfirm,
    isDeleting = false,
    itemName,
    description,
    confirmLabel = 'Xóa',
    cancelLabel = 'Hủy',
}) => {
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [open, onClose]);

    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    if (!open) return null;

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
            onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
        >
            <div className="bg-white w-full max-w-sm rounded-[24px] sm:rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 p-5 md:p-8">

                {/* Icon cảnh báo */}
                <div className="flex justify-center mb-4 md:mb-5">
                    <div className="size-14 md:size-16 rounded-2xl md:rounded-3xl bg-red-50 flex items-center justify-center shadow-inner">
                        <span className="material-symbols-outlined text-red-500 text-3xl md:text-4xl">delete_forever</span>
                    </div>
                </div>

                {/* Nội dung */}
                <div className="text-center mb-5 md:mb-6">
                    <h3 className="text-lg md:text-xl font-black text-slate-900 mb-1.5 md:mb-2">
                        Xác nhận xóa
                    </h3>
                    {itemName ? (
                        <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
                            Bạn có chắc muốn xóa{' '}
                            <span className="font-black text-slate-900">"{itemName}"</span>?
                            <br />
                            Hành động này{' '}
                            <span className="text-red-600 font-bold">không thể hoàn tác</span>.
                        </p>
                    ) : (
                        <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
                            Bạn có chắc muốn xóa mục này?{' '}
                            <span className="text-red-600 font-bold">Không thể hoàn tác</span>.
                        </p>
                    )}
                    {description && (
                        <p className="mt-2.5 md:mt-3 text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 rounded-xl px-4 py-2">
                            {description}
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2.5 md:gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isDeleting}
                        className="flex-1 py-3 md:py-3.5 rounded-xl md:rounded-2xl font-black text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all text-[11px] md:text-sm uppercase tracking-widest disabled:opacity-50"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="flex-[1.5] py-3 md:py-3.5 rounded-xl md:rounded-2xl font-black text-white bg-red-500 hover:bg-red-600 transition-all text-[11px] md:text-sm uppercase tracking-widest shadow-lg shadow-red-500/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        {isDeleting ? (
                            <>
                                <span className="material-symbols-outlined animate-spin text-[16px] md:text-[18px]">autorenew</span>
                                Đang xóa...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[16px] md:text-[18px]">delete</span>
                                {confirmLabel}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDeleteModal;
