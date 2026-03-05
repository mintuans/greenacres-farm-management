import React, { useRef, useState, useEffect } from 'react';

export interface ImportDataModalProps {
    /** Có hiện modal không */
    open: boolean;
    /** Đóng modal */
    onClose: () => void;
    /**
     * Callback khi chọn file xong.
     * Component sẽ đọc file và trả về đối tượng File.
     * Gọi hàm xử lý import (parse CSV/Excel, gọi API…) bên trong callback này.
     */
    onImport: (file: File) => Promise<void> | void;

    /** Đuôi file chấp nhận — mặc định '.csv,.xlsx' */
    accept?: string;
    /** Tên entity đang import — VD: 'vật tư', 'giao dịch' */
    entityName?: string;
    /**
     * Callback tải file mẫu (tùy chọn).
     * Nếu truyền vào sẽ hiện nút "Tải file mẫu".
     */
    onDownloadTemplate?: () => void;
    /**
     * Hướng dẫn định dạng cột (tùy chọn).
     * Truyền mảng tên cột theo thứ tự.
     * VD: ['SKU', 'Tên vật tư', 'Số lượng', ...]
     */
    columnGuide?: string[];
}

export const ImportDataModal: React.FC<ImportDataModalProps> = ({
    open,
    onClose,
    onImport,
    accept = '.csv,.xlsx',
    entityName = 'dữ liệu',
    onDownloadTemplate,
    columnGuide,
}) => {
    const overlayRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

    // Reset state mỗi lần mở modal
    useEffect(() => {
        if (open) {
            setSelectedFile(null);
            setResult(null);
            setIsImporting(false);
        }
    }, [open]);

    // Escape key
    useEffect(() => {
        if (!open) return;
        const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [open, onClose]);

    // Body scroll lock
    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    if (!open) return null;

    const handleSelectFile = (file: File) => {
        setSelectedFile(file);
        setResult(null);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleSelectFile(file);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleSelectFile(file);
        e.target.value = '';
    };

    const handleConfirmImport = async () => {
        if (!selectedFile) return;
        try {
            setIsImporting(true);
            setResult(null);
            await onImport(selectedFile);
            setResult({ success: true, message: `Nhập ${entityName} thành công!` });
            // Tự đóng sau 1.5s
            setTimeout(() => onClose(), 1500);
        } catch (err: any) {
            setResult({
                success: false,
                message: err?.message || 'Có lỗi xảy ra khi nhập dữ liệu. Kiểm tra lại định dạng file.',
            });
        } finally {
            setIsImporting(false);
        }
    };

    const acceptExtensions = accept
        .split(',')
        .map((s) => s.trim().replace('.', '').toUpperCase())
        .join(', ');

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
            onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
        >
            <div className="bg-white w-full max-w-lg rounded-[24px] sm:rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90dvh] overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-5 md:px-8 pt-5 md:pt-6 pb-3 md:pb-4 shrink-0">
                    <div className="flex items-center gap-2.5 md:gap-3">
                        <div className="size-9 md:size-10 rounded-xl md:rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                            <span className="material-symbols-outlined text-lg md:text-xl">upload_file</span>
                        </div>
                        <div>
                            <h2 className="text-lg md:text-xl font-black text-slate-900">Nhập dữ liệu</h2>
                            <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                {entityName} · {acceptExtensions}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="size-8 md:size-9 flex items-center justify-center rounded-lg md:rounded-xl bg-slate-50 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                    >
                        <span className="material-symbols-outlined text-[18px] md:text-[20px]">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-5 md:px-8 pb-5 md:pb-8 space-y-4 custom-scrollbar">

                    {/* Drop zone */}
                    <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative border-2 border-dashed rounded-xl md:rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center gap-2 md:gap-3 cursor-pointer transition-all select-none ${isDragging
                            ? 'border-[#13ec49] bg-[#13ec49]/5 scale-[1.01]'
                            : selectedFile
                                ? 'border-[#13ec49] bg-[#13ec49]/5'
                                : 'border-slate-200 bg-slate-50/50 hover:border-[#13ec49]/50 hover:bg-slate-50'
                            }`}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept={accept}
                            className="hidden"
                            onChange={handleFileInputChange}
                        />
                        {selectedFile ? (
                            <>
                                <div className="size-14 rounded-2xl bg-[#13ec49]/10 flex items-center justify-center text-[#13ec49]">
                                    <span className="material-symbols-outlined text-3xl">check_circle</span>
                                </div>
                                <div className="text-center">
                                    <p className="font-black text-slate-900 text-sm">{selectedFile.name}</p>
                                    <p className="text-[11px] text-slate-400 font-bold mt-0.5">
                                        {(selectedFile.size / 1024).toFixed(1)} KB · Nhấn để thay đổi file
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="size-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                                    <span className="material-symbols-outlined text-3xl">cloud_upload</span>
                                </div>
                                <div className="text-center">
                                    <p className="font-black text-slate-900 text-sm">Kéo thả file vào đây</p>
                                    <p className="text-[11px] text-slate-400 font-bold mt-0.5">
                                        hoặc nhấn để chọn file · {acceptExtensions}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Result message */}
                    {result && (
                        <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold ${result.success
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                            <span className="material-symbols-outlined text-[20px]">
                                {result.success ? 'check_circle' : 'error'}
                            </span>
                            {result.message}
                        </div>
                    )}

                    {/* Column guide */}
                    {columnGuide && columnGuide.length > 0 && (
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[14px]">table_chart</span>
                                Định dạng cột (theo thứ tự)
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {columnGuide.map((col, idx) => (
                                    <span
                                        key={idx}
                                        className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-600 shadow-sm"
                                    >
                                        <span className="text-slate-300 font-black">{idx + 1}.</span> {col}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Download template button */}
                    {onDownloadTemplate && (
                        <button
                            type="button"
                            onClick={onDownloadTemplate}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-amber-200 text-amber-600 hover:bg-amber-50 font-bold text-sm transition-all"
                        >
                            <span className="material-symbols-outlined text-[18px]">file_download</span>
                            Tải file mẫu
                        </button>
                    )}
                </div>

                {/* Footer */}
                <div className="flex gap-2.5 px-5 md:px-8 pb-5 md:pb-8 pt-3 border-t border-slate-100 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isImporting}
                        className="flex-1 py-3 md:py-3.5 rounded-xl md:rounded-2xl font-black text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all text-[11px] md:text-sm uppercase tracking-widest disabled:opacity-50"
                    >
                        Hủy
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirmImport}
                        disabled={!selectedFile || isImporting}
                        className="flex-[2] py-3 md:py-3.5 rounded-xl md:rounded-2xl font-black text-black bg-[#13ec49] hover:bg-[#10d63f] transition-all text-[11px] md:text-sm uppercase tracking-widest shadow-lg shadow-[#13ec49]/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {isImporting ? (
                            <>
                                <span className="material-symbols-outlined animate-spin text-[18px]">autorenew</span>
                                Đang nhập...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[18px]">upload</span>
                                Xác nhận nhập
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImportDataModal;
