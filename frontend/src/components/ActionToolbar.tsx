import React, { useRef } from 'react';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface ActionToolbarProps {
    /** Hiện nút "Thêm mới" */
    onAdd?: () => void;
    addLabel?: string;

    /** Hiện nút "Sửa" — thường chỉ active khi có item đang chọn */
    onEdit?: () => void;
    editLabel?: string;
    editDisabled?: boolean;

    /** Hiện nút "Xóa" — thường chỉ active khi có item đang chọn */
    onDelete?: () => void;
    deleteLabel?: string;
    deleteDisabled?: boolean;

    /** Hiện nút "Làm mới" */
    onRefresh?: () => void;
    refreshLabel?: string;
    isRefreshing?: boolean;

    /** Hiện nút "Xuất dữ liệu" */
    onExport?: () => void;
    exportLabel?: string;

    /** Hiện nút "Nhập dữ liệu" (file upload) */
    onImport?: (file: File) => void;
    importLabel?: string;
    importAccept?: string; // default: '.csv,.xlsx'

    /** Hiện nút "Tải tệp mẫu" */
    onDownloadTemplate?: () => void;
    templateLabel?: string;

    /** Thêm phần tử tùy chỉnh bên phải */
    extra?: React.ReactNode;

    /** className bổ sung cho wrapper */
    className?: string;
}

// ──────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────

interface ToolButtonProps {
    icon: string;
    label: string;
    onClick?: () => void;
    disabled?: boolean;
    variant?: 'default' | 'primary' | 'danger' | 'warning';
    loading?: boolean;
    title?: string;
}

const ToolButton: React.FC<ToolButtonProps> = ({
    icon, label, onClick, disabled = false, variant = 'default', loading = false, title
}) => {
    const base =
        'flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs transition-all active:scale-95 select-none border whitespace-nowrap';

    const variants: Record<string, string> = {
        default:
            'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed',
        primary:
            'bg-[#13ec49] text-black border-transparent hover:bg-[#10d63f] shadow-md shadow-[#13ec49]/20 disabled:opacity-40 disabled:cursor-not-allowed',
        danger:
            'bg-white text-red-600 border-red-200 hover:bg-red-50 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed',
        warning:
            'bg-white text-amber-600 border-amber-200 hover:bg-amber-50 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed',
    };

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled || loading}
            title={title || label}
            className={`${base} ${variants[variant]}`}
        >
            <span
                className={`material-symbols-outlined text-[18px] ${loading ? 'animate-spin' : ''}`}
            >
                {loading ? 'autorenew' : icon}
            </span>
            {/* Label ẩn trên màn hình rất nhỏ, hiện từ sm */}
            <span className="hidden sm:inline">{label}</span>
        </button>
    );
};

// ──────────────────────────────────────────────
// Divider
// ──────────────────────────────────────────────
const Divider: React.FC = () => (
    <div className="w-px h-6 bg-slate-200 self-center shrink-0" />
);

// ──────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────

export const ActionToolbar: React.FC<ActionToolbarProps> = ({
    // Add
    onAdd, addLabel = 'Thêm mới',
    // Edit
    onEdit, editLabel = 'Sửa', editDisabled = false,
    // Delete
    onDelete, deleteLabel = 'Xóa', deleteDisabled = false,
    // Refresh
    onRefresh, refreshLabel = 'Làm mới', isRefreshing = false,
    // Export
    onExport, exportLabel = 'Xuất dữ liệu',
    // Import
    onImport, importLabel = 'Nhập dữ liệu', importAccept = '.csv,.xlsx',
    // Template
    onDownloadTemplate, templateLabel = 'Tải tệp mẫu',
    // Extra
    extra,
    className = '',
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && onImport) {
            onImport(file);
        }
        // Reset input so same file can be re-selected
        e.target.value = '';
    };

    // Groups: primary actions | data actions | file actions
    const hasPrimaryGroup = onAdd || onEdit || onDelete;
    const hasRefresh = !!onRefresh;
    const hasDataGroup = onExport || onImport || onDownloadTemplate;

    return (
        <div
            className={`flex items-center gap-2 flex-wrap ${className}`}
            role="toolbar"
            aria-label="Thanh công cụ"
        >
            {/* ── Primary Actions ── */}
            {hasPrimaryGroup && (
                <div className="flex items-center gap-1.5">
                    {onAdd && (
                        <ToolButton
                            icon="add"
                            label={addLabel}
                            onClick={onAdd}
                            variant="primary"
                        />
                    )}
                    {onEdit && (
                        <ToolButton
                            icon="edit"
                            label={editLabel}
                            onClick={onEdit}
                            disabled={editDisabled}
                            variant="default"
                        />
                    )}
                    {onDelete && (
                        <ToolButton
                            icon="delete"
                            label={deleteLabel}
                            onClick={onDelete}
                            disabled={deleteDisabled}
                            variant="danger"
                        />
                    )}
                </div>
            )}

            {/* ── Refresh ── */}
            {hasRefresh && (hasPrimaryGroup ? <Divider /> : null)}
            {onRefresh && (
                <ToolButton
                    icon="refresh"
                    label={refreshLabel}
                    onClick={onRefresh}
                    loading={isRefreshing}
                    variant="default"
                />
            )}

            {/* ── Data Actions ── */}
            {hasDataGroup && (hasPrimaryGroup || hasRefresh) && <Divider />}
            {hasDataGroup && (
                <div className="flex items-center gap-1.5">
                    {onExport && (
                        <ToolButton
                            icon="download"
                            label={exportLabel}
                            onClick={onExport}
                            variant="default"
                        />
                    )}
                    {onImport && (
                        <>
                            <ToolButton
                                icon="upload"
                                label={importLabel}
                                onClick={() => fileInputRef.current?.click()}
                                variant="default"
                            />
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept={importAccept}
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </>
                    )}
                    {onDownloadTemplate && (
                        <ToolButton
                            icon="file_download"
                            label={templateLabel}
                            onClick={onDownloadTemplate}
                            variant="warning"
                            title="Tải tệp CSV/Excel mẫu để nhập liệu"
                        />
                    )}
                </div>
            )}

            {/* ── Extra slot ── */}
            {extra && (
                <>
                    <Divider />
                    {extra}
                </>
            )}
        </div>
    );
};

export default ActionToolbar;
