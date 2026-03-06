import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────

export interface ActionToolbarProps {
    onAdd?: () => void;
    addLabel?: string;
    hideAdd?: boolean;

    onEdit?: () => void;
    editLabel?: string;
    editDisabled?: boolean;

    onDelete?: () => void;
    deleteLabel?: string;
    deleteDisabled?: boolean;

    onRefresh?: () => void;
    refreshLabel?: string;
    isRefreshing?: boolean;

    onExport?: () => void;
    exportLabel?: string;

    onImport?: (file: File) => void;
    importLabel?: string;
    importAccept?: string;

    onDownloadTemplate?: () => void;
    templateLabel?: string;

    extra?: React.ReactNode;
    className?: string;
}

type Variant = 'primary' | 'default' | 'danger' | 'warning';

interface BtnDef {
    id: string;
    icon: string;
    label: string;
    onClick: () => void;
    disabled?: boolean;
    variant: Variant;
    loading?: boolean;
    title?: string;
}

// ─────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────

const variantCls: Record<Variant, string> = {
    primary: 'bg-[#13ec49] text-black border-transparent hover:bg-[#10d63f] shadow-md shadow-[#13ec49]/20',
    default: 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm',
    danger: 'bg-white text-red-600  border-red-200  hover:bg-red-50  shadow-sm',
    warning: 'bg-white text-amber-600 border-amber-200 hover:bg-amber-50 shadow-sm',
};

const dropdownCls: Record<Variant, string> = {
    primary: 'text-emerald-700',
    default: 'text-slate-700 font-semibold',
    danger: 'text-red-600 font-semibold',
    warning: 'text-amber-600 font-semibold',
};

const BASE =
    'flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs ' +
    'transition-all active:scale-95 select-none border whitespace-nowrap shrink-0 ' +
    'disabled:opacity-40 disabled:cursor-not-allowed';

// ─────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────

const Divider: React.FC = () => (
    <div className="w-px h-6 bg-slate-200 self-center shrink-0 mx-0.5" />
);

interface DropdownItemProps {
    icon: string; label: string; onClick: () => void;
    disabled?: boolean; variant?: Variant; loading?: boolean; title?: string;
}
const DropdownItem: React.FC<DropdownItemProps> = ({
    icon, label, onClick, disabled = false, variant = 'default', loading = false, title
}) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled || loading}
        title={title || label}
        className={`group w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl
            hover:bg-slate-50 active:bg-slate-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed
            whitespace-nowrap ${dropdownCls[variant]}`}
    >
        <span className={`material-symbols-outlined text-[20px] shrink-0 opacity-60 group-hover:opacity-100 transition-opacity ${loading ? 'animate-spin' : ''}`}>
            {loading ? 'autorenew' : icon}
        </span>
        <span className="flex-1 text-left">{label}</span>
    </button>
);

// ─────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────

const MORE_W = 46;
const GAP = 8;

export const ActionToolbar: React.FC<ActionToolbarProps> = ({
    onAdd, addLabel = 'Thêm mới', hideAdd = false,
    onEdit, editLabel = 'Sửa', editDisabled = false,
    onDelete, deleteLabel = 'Xóa', deleteDisabled = false,
    onRefresh, refreshLabel = 'Làm mới', isRefreshing = false,
    onExport, exportLabel = 'Xuất Excel',
    onImport, importLabel = 'Nhập liệu', importAccept = '.csv,.xlsx',
    onDownloadTemplate, templateLabel = 'Tải mẫu',
    extra, className = '',
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const outerRef = useRef<HTMLDivElement>(null);
    const measureRef = useRef<HTMLDivElement>(null);
    const moreBtnRef = useRef<HTMLDivElement>(null);
    const primaryRef = useRef<HTMLDivElement>(null);

    const [visCount, setVisCount] = useState<number>(Infinity);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const secondary: BtnDef[] = [];
    if (onRefresh) secondary.push({ id: 'refresh', icon: 'refresh', label: refreshLabel, onClick: onRefresh, variant: 'default', loading: isRefreshing });
    if (onExport) secondary.push({ id: 'export', icon: 'download', label: exportLabel, onClick: onExport, variant: 'default' });
    if (onImport) secondary.push({ id: 'import', icon: 'upload', label: importLabel, onClick: () => fileInputRef.current?.click(), variant: 'default' });
    if (onDownloadTemplate) secondary.push({ id: 'template', icon: 'file_download', label: templateLabel, onClick: onDownloadTemplate, variant: 'warning', title: 'Tải tệp CSV / Excel mẫu' });

    const primaryDefs: BtnDef[] = [];
    if (onAdd && !hideAdd) primaryDefs.push({ id: 'add', icon: 'add', label: addLabel, onClick: onAdd, variant: 'primary' });
    if (onEdit) primaryDefs.push({ id: 'edit', icon: 'edit', label: editLabel, onClick: onEdit, disabled: editDisabled, variant: 'default' });
    if (onDelete) primaryDefs.push({ id: 'delete', icon: 'delete', label: deleteLabel, onClick: onDelete, disabled: deleteDisabled, variant: 'danger' });

    const totalSec = secondary.length;
    const cut = Math.min(visCount, totalSec);
    const visible = secondary.slice(0, cut);
    const collapsed = secondary.slice(cut);

    const measure = () => {
        const outer = outerRef.current;
        const ghost = measureRef.current;
        const parent = outer?.parentElement;
        if (!outer || !ghost || !parent) return;

        const style = window.getComputedStyle(parent);
        const paddingLeft = parseFloat(style.paddingLeft) || 0;
        const paddingRight = parseFloat(style.paddingRight) || 0;
        const parentWidth = parent.clientWidth - paddingLeft - paddingRight;

        let siblingsWidth = 0;
        Array.from(parent.children).forEach(child => {
            if (child !== outer && (child as HTMLElement).offsetParent !== null) {
                siblingsWidth += (child as HTMLElement).offsetWidth + GAP;
            }
        });

        const avail = parentWidth - siblingsWidth;
        const primaryW = primaryRef.current?.offsetWidth || 0;
        const dividerW = (primaryDefs.length > 0 && totalSec > 0) ? (1 + GAP * 2) : 0;
        const secAvail = avail - primaryW - dividerW - 10;

        const ghosts = Array.from(ghost.children) as HTMLElement[];
        const widths = ghosts.map(el => el.offsetWidth);

        const totalNeeded = widths.reduce((acc, w, i) => acc + w + (i > 0 ? GAP : 0), 0);
        if (totalNeeded <= secAvail) {
            setVisCount(totalSec);
            return;
        }

        let used = 0;
        let count = 0;
        const limitWithMore = secAvail - MORE_W - GAP;

        for (let i = 0; i < widths.length; i++) {
            const needed = used + (i > 0 ? GAP : 0) + widths[i];
            if (needed <= limitWithMore) {
                used = needed;
                count = i + 1;
            } else {
                break;
            }
        }
        setVisCount(count);
    };

    useEffect(() => {
        const outer = outerRef.current;
        const parent = outer?.parentElement;
        if (!outer || !parent) return;
        const ro = new ResizeObserver(() => requestAnimationFrame(measure));
        ro.observe(parent);
        requestAnimationFrame(measure);
        return () => ro.disconnect();
    }, []);

    useLayoutEffect(() => {
        requestAnimationFrame(measure);
    }, [primaryDefs.length, totalSec, isRefreshing, editDisabled, deleteDisabled]);

    useEffect(() => {
        if (!dropdownOpen) return;
        const h = (e: MouseEvent) => {
            if (moreBtnRef.current && !moreBtnRef.current.contains(e.target as Node))
                setDropdownOpen(false);
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, [dropdownOpen]);

    const showDivider = primaryDefs.length > 0 && totalSec > 0;

    return (
        <div
            ref={outerRef}
            className={`relative flex justify-start sm:justify-end flex-1 ${className}`}
            style={{ minWidth: 0 }}
        >
            <div
                ref={measureRef}
                aria-hidden
                style={{
                    position: 'absolute', visibility: 'hidden', pointerEvents: 'none',
                    top: -9999, left: 0, display: 'flex', gap: GAP, flexWrap: 'nowrap', zIndex: -1,
                }}
            >
                {secondary.map(btn => (
                    <button key={btn.id} type="button" tabIndex={-1} className={`${BASE} ${variantCls[btn.variant]}`}>
                        <span className="material-symbols-outlined text-[18px] shrink-0">{btn.icon}</span>
                        <span>{btn.label}</span>
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-2 flex-nowrap">
                <div ref={primaryRef} className="flex items-center gap-2 flex-nowrap shrink-0">
                    {primaryDefs.map(btn => (
                        <button
                            key={btn.id}
                            type="button"
                            onClick={btn.onClick}
                            disabled={!!btn.disabled}
                            title={btn.label}
                            className={`${BASE} ${variantCls[btn.variant]}`}
                        >
                            <span className="material-symbols-outlined text-[18px] shrink-0">{btn.icon}</span>
                            <span>{btn.label}</span>
                        </button>
                    ))}
                </div>

                {showDivider && <Divider />}

                {visible.map(btn => (
                    <button
                        key={btn.id}
                        type="button"
                        onClick={btn.onClick}
                        disabled={!!btn.disabled || !!btn.loading}
                        title={btn.title || btn.label}
                        className={`${BASE} ${variantCls[btn.variant]}`}
                    >
                        <span className={`material-symbols-outlined text-[18px] shrink-0 ${btn.loading ? 'animate-spin' : ''}`}>
                            {btn.loading ? 'autorenew' : btn.icon}
                        </span>
                        <span>{btn.label}</span>
                    </button>
                ))}

                {collapsed.length > 0 && (
                    <div ref={moreBtnRef} className="relative shrink-0" style={{ zIndex: 40 }}>
                        <button
                            type="button"
                            onClick={() => setDropdownOpen(v => !v)}
                            title="Thêm công cụ"
                            className={`flex items-center justify-center w-9 h-9 rounded-xl border shrink-0
                                transition-all active:scale-95 select-none
                                ${dropdownOpen
                                    ? 'bg-slate-100 border-slate-300 text-slate-900 shadow-inner'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 shadow-sm'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">more_vert</span>
                        </button>

                        {/* Dropdown Menu List */}
                        {dropdownOpen && (
                            <div className="absolute right-0 top-full mt-2 bg-white border border-slate-200
                                rounded-2xl shadow-2xl z-[50] p-1.5 min-w-[220px]
                                animate-in fade-in zoom-in-95 duration-100 origin-top-right ring-1 ring-black/5">
                                <div className="flex flex-col gap-0.5">
                                    {collapsed.map(btn => (
                                        <DropdownItem
                                            key={btn.id}
                                            icon={btn.icon}
                                            label={btn.label}
                                            variant={btn.variant}
                                            loading={btn.loading}
                                            title={btn.title}
                                            disabled={btn.disabled || btn.loading}
                                            onClick={() => {
                                                btn.onClick();
                                                setDropdownOpen(false);
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {extra && (
                    <>
                        <Divider />
                        {extra}
                    </>
                )}
            </div>

            {onImport && (
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={importAccept}
                    className="hidden"
                    onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) onImport(file);
                        e.target.value = '';
                    }}
                />
            )}
        </div>
    );
};

export default ActionToolbar;
