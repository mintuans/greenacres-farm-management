import React, { useState, useEffect } from 'react';
import { getWarehouseItems, createWarehouseItem, updateWarehouseItem, deleteWarehouseItem, WarehouseItem, getNextWarehouseCode } from '../api/warehouse.api';
import { getWarehouseTypes, WarehouseType } from '../api/warehouse-type.api';
import { getMediaFiles, MediaFile } from '../services/media.service';
import { getMediaUrl } from '../services/products.service';
import { ActionToolbar, ConfirmDeleteModal, ImportDataModal } from '../components';
import { useTranslation } from 'react-i18next';


const WarehouseManagement: React.FC = () => {
    const [warehouseTypes, setWarehouseTypes] = useState<WarehouseType[]>([]);
    const [selectedTypeId, setSelectedTypeId] = useState<string>('ALL');
    const [items, setItems] = useState<WarehouseItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { t, i18n } = useTranslation();
    const [showModal, setShowModal] = useState(false);

    const [editingItem, setEditingItem] = useState<WarehouseItem | null>(null);
    const [selectedItem, setSelectedItem] = useState<WarehouseItem | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<WarehouseItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const units = ['Cái', 'Bộ', 'Chiếc', 'Hộp', 'Gói', 'Kg', 'Mét'];

    // Media Picker States
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
    const [loadingMedia, setLoadingMedia] = useState(false);

    const [formData, setFormData] = useState({
        warehouse_type_id: '',
        item_code: '',
        sku: '',
        item_name: '',
        quantity: 0,
        unit: '',
        price: 0,
        location: '',
        thumbnail_id: '',
        note: ''
    });

    useEffect(() => {
        loadMetadata();
    }, []);

    useEffect(() => {
        loadItems();
    }, [selectedTypeId, searchTerm]);

    const loadMetadata = async () => {
        try {
            const types = await getWarehouseTypes();
            setWarehouseTypes(types || []);
            if (types && types.length > 0) {
                // Keep selectedTypeId as 'ALL' or set to first type if preferred
            }
        } catch (error) {
            console.error('Error loading warehouse types:', error);
        }
    };

    const loadItems = async () => {
        try {
            setLoading(true);
            const typeId = selectedTypeId === 'ALL' ? undefined : selectedTypeId;
            const data = await getWarehouseItems(typeId, searchTerm);
            setItems(data || []);
        } catch (error) {
            console.error('Error loading warehouse items:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = async (item?: WarehouseItem) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                warehouse_type_id: item.warehouse_type_id,
                item_code: item.item_code,
                sku: item.sku || '',
                item_name: item.item_name,
                quantity: Number(item.quantity),
                unit: item.unit || '',
                price: Number(item.price),
                location: item.location || '',
                thumbnail_id: item.thumbnail_id || '',
                note: item.note || ''
            });
        } else {
            setEditingItem(null);
            const initialTypeId = selectedTypeId === 'ALL' ? (warehouseTypes[0]?.id || '') : selectedTypeId;
            let nextCode = '';
            if (initialTypeId) {
                try {
                    nextCode = await getNextWarehouseCode(initialTypeId);
                } catch (e) { }
            }

            setFormData({
                warehouse_type_id: initialTypeId,
                item_code: nextCode,
                sku: '',
                item_name: '',
                quantity: 1,
                unit: units[0],
                price: 0,
                location: '',
                thumbnail_id: '',
                note: ''
            });
        }
        setShowModal(true);
    };

    const handleTypeChangeInForm = async (typeId: string) => {
        const nextCode = await getNextWarehouseCode(typeId);
        setFormData(prev => ({ ...prev, warehouse_type_id: typeId, item_code: nextCode }));
    };

    const handleOpenMediaPicker = async () => {
        setShowMediaPicker(true);
        setLoadingMedia(true);
        try {
            const response = await getMediaFiles();
            setMediaFiles(response.data);
        } catch (error) {
            console.error('Error loading media:', error);
        } finally {
            setLoadingMedia(false);
        }
    };

    const handleSelectMedia = (mediaId: string) => {
        setFormData({ ...formData, thumbnail_id: mediaId });
        setShowMediaPicker(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await updateWarehouseItem(editingItem.id, formData);
            } else {
                await createWarehouseItem(formData);
            }
            setShowModal(false);
            loadItems();
        } catch (error) {
            console.error('Error saving item:', error);
            alert(t('warehouse_management.messages.save_error'));
        }

    };

    const handleDelete = async (id: string) => {
        try {
            setIsDeleting(true);
            await deleteWarehouseItem(id);
            setDeleteTarget(null);
            setSelectedItem(null);
            loadItems();
        } catch (error) {
            console.error('Error deleting item:', error);
            alert(t('warehouse_management.messages.delete_error'));
        } finally {

            setIsDeleting(false);
        }
    };

    const handleImport = async (file: File) => {
        console.log('Importing warehouse items from:', file.name);
        return new Promise<void>((resolve) => setTimeout(resolve, 1500));
    };

    const handleExport = () => {
        console.log('Exporting warehouse items...');
        alert(t('common.exporting'));
    };


    const handleDownloadTemplate = () => {
        console.log('Downloading warehouse template...');
        alert(t('common.downloading_template'));
    };


    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(i18n.language === 'vi' ? 'vi-VN' : 'en-US', { style: 'currency', currency: 'VND' }).format(amount);
    };


    const totalValue = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.price)), 0);

    return (
        <div className="p-3 md:p-4 space-y-4 w-full bg-slate-50/50 min-h-screen">
            {/* Header */}
            <div>
                <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                    {t('warehouse_management.title')}
                </h1>
                <p className="text-slate-500 mt-2 font-medium">{t('warehouse_management.subtitle')}</p>
            </div>


            {/* Warehouse Type Filter Tabs */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-[24px] w-fit border border-slate-200">
                <button
                    onClick={() => setSelectedTypeId('ALL')}
                    className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${selectedTypeId === 'ALL' ? 'bg-white text-[#13ec49] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    {t('warehouse_management.filter_all')}
                </button>

                {warehouseTypes.map(type => (
                    <button
                        key={type.id}
                        onClick={() => setSelectedTypeId(type.id)}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${selectedTypeId === type.id ? 'bg-white text-[#13ec49] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {type.warehouse_name}
                    </button>
                ))}
            </div>

            {/* Stats - 3 cards per row on Mobile */}
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-4">
                <div className="bg-white p-2.5 md:p-6 rounded-xl md:rounded-2xl border border-slate-200 shadow-sm border-b-4 border-b-blue-500 flex flex-col items-center md:items-start text-center md:text-left">
                    <p className="text-slate-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest truncate w-full">{t('warehouse_management.stats.types_count')}</p>
                    <h3 className="text-sm md:text-3xl font-black mt-1 md:mt-2 text-slate-900 truncate w-full">{items.length}</h3>
                </div>

                <div className="bg-white p-2.5 md:p-6 rounded-xl md:rounded-2xl border border-slate-200 shadow-sm border-b-4 border-b-[#13ec49] flex flex-col items-center md:items-start text-center md:text-left">
                    <p className="text-slate-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest truncate w-full">{t('warehouse_management.stats.quantity')}</p>
                    <h3 className="text-sm md:text-3xl font-black mt-1 md:mt-2 text-slate-900 truncate w-full">{items.reduce((sum, item) => sum + Number(item.quantity), 0)}</h3>
                </div>

                <div className="bg-white p-2.5 md:p-6 rounded-xl md:rounded-2xl border border-slate-200 shadow-sm border-b-4 border-b-orange-500 flex flex-col items-center md:items-start text-center md:text-left col-span-1 md:col-span-2">
                    <p className="text-slate-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest truncate w-full">{t('warehouse_management.stats.total_value')}</p>
                    <h3 className="text-sm md:text-3xl font-black mt-1 md:mt-2 text-green-600 truncate w-full">{formatCurrency(totalValue)}</h3>
                </div>

            </div>

            {/* Table Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden border-t-4 border-t-[#13ec49]">
                <div className="p-3 md:p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                    <div className="relative w-full sm:max-w-xs">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-[#13ec49]/30 transition-all outline-none"
                            placeholder={t('warehouse_management.search_placeholder')}
                        />

                    </div>
                    <ActionToolbar
                        onAdd={() => handleOpenModal()}
                        addLabel={t('warehouse_management.add_btn')}

                        onEdit={() => selectedItem && handleOpenModal(selectedItem)}
                        editDisabled={!selectedItem}
                        onDelete={() => selectedItem && setDeleteTarget(selectedItem)}
                        deleteDisabled={!selectedItem}
                        onRefresh={loadItems}
                        isRefreshing={loading}
                        onImport={() => setShowImportModal(true)}
                        onExport={handleExport}
                        onDownloadTemplate={handleDownloadTemplate}
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="whitespace-nowrap">
                            <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                                <th className="px-8 py-5">{t('warehouse_management.table.info')}</th>
                                <th className="px-8 py-5">{t('warehouse_management.table.code_sku')}</th>
                                <th className="px-8 py-5">{t('warehouse_management.table.warehouse')}</th>
                                <th className="px-8 py-5 text-right">{t('warehouse_management.table.quantity')}</th>
                                <th className="px-8 py-5 text-right">{t('warehouse_management.table.price')}</th>
                                <th className="px-8 py-5">{t('warehouse_management.table.location')}</th>
                                <th className="px-8 py-5 text-right">{t('warehouse_management.table.actions')}</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-50 text-sm font-medium">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-10 h-10 border-4 border-[#13ec49] border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Đang tải...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-8 py-20 text-center text-slate-300 italic font-bold">
                                        {searchTerm ? t('warehouse_management.messages.empty') : t('warehouse_management.messages.empty')}
                                    </td>

                                </tr>
                            ) : (
                                (items || []).map((item) => (
                                    <tr
                                        key={item.id}
                                        onClick={() => setSelectedItem(prev => prev?.id === item.id ? null : item)}
                                        className={`group transition-all cursor-pointer ${selectedItem?.id === item.id ? 'bg-[#13ec49]/5 ring-1 ring-inset ring-[#13ec49]/20' : 'hover:bg-slate-50'}`}
                                    >
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200 shadow-sm">
                                                    {item.thumbnail_id ? (
                                                        <img src={getMediaUrl(item.thumbnail_id)} className="w-full h-full object-cover" alt="" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                            <span className="material-symbols-outlined text-[24px]">inventory_2</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-extrabold text-slate-900 group-hover:text-[#13ec49] transition-colors">{item.item_name}</div>
                                                    <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-black">{item.category || t('warehouse_management.table.unclassified')}</div>
                                                </div>

                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="space-y-1">
                                                <div className="font-mono text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded w-fit border border-slate-200">{item.item_code}</div>
                                                {item.sku && <div className="text-[10px] text-slate-400 font-bold tracking-tight">SKU: {item.sku}</div>}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="bg-[#13ec49]/10 text-slate-900 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-[#13ec49]/20">
                                                {item.warehouse_name}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="text-base font-black text-slate-900">{item.quantity}</div>
                                            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-black">{item.unit}</div>
                                        </td>
                                        <td className="px-8 py-5 text-right font-black text-green-600">
                                            {formatCurrency(item.price)}
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <span className="material-symbols-outlined text-[16px]">location_on</span>
                                                <span className="text-xs font-bold">{item.location || t('common.na')}</span>
                                            </div>

                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleOpenModal(item); }}
                                                    className="size-10 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(item); }}
                                                    className="size-10 flex items-center justify-center rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[40px] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300 flex flex-col">
                        <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{editingItem ? t('warehouse_management.modal.edit_title') : t('warehouse_management.modal.add_title')}</h2>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">{t('warehouse_management.modal.subtitle')}</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="size-12 rounded-2xl hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-all">

                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 overflow-y-auto custom-scrollbar flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="md:col-span-1 space-y-6">
                                    {/* Thumbnail Selection */}
                                    <div className="p-8 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200 group cursor-pointer hover:border-[#13ec49] transition-all" onClick={handleOpenMediaPicker}>
                                        <div className="aspect-square bg-white rounded-[32px] shadow-sm flex items-center justify-center overflow-hidden mb-4 border border-slate-100">
                                            {formData.thumbnail_id ? (
                                                <img src={getMediaUrl(formData.thumbnail_id)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Preview" />
                                            ) : (
                                                <span className="material-symbols-outlined text-slate-300 text-5xl">add_photo_alternate</span>
                                            )}
                                        </div>
                                        <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-[#13ec49] transition-colors">{t('warehouse_management.modal.upload_image')}</p>
                                    </div>


                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('warehouse_management.modal.warehouse_type')}</label>
                                        <select

                                            required
                                            value={formData.warehouse_type_id}
                                            onChange={e => handleTypeChangeInForm(e.target.value)}
                                            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[#13ec49]/20 outline-none font-bold text-slate-900 transition-all appearance-none"
                                        >
                                            {warehouseTypes.map(type => <option key={type.id} value={type.id}>{type.warehouse_name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 content-start">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('warehouse_management.modal.item_code')}</label>
                                        <input

                                            required
                                            type="text"
                                            disabled={!!editingItem}
                                            value={formData.item_code}
                                            onChange={e => setFormData({ ...formData, item_code: e.target.value })}
                                            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[#13ec49]/20 outline-none font-bold text-slate-900 transition-all disabled:opacity-50"
                                            placeholder="VD: GD-001"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('warehouse_management.modal.sku')}</label>
                                        <input

                                            type="text"
                                            value={formData.sku}
                                            onChange={e => setFormData({ ...formData, sku: e.target.value })}
                                            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[#13ec49]/20 outline-none font-bold text-slate-900 transition-all"
                                            placeholder={t('warehouse_management.modal.sku_placeholder')}
                                        />

                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('warehouse_management.modal.item_name')}</label>
                                        <input

                                            required
                                            type="text"
                                            value={formData.item_name}
                                            onChange={e => setFormData({ ...formData, item_name: e.target.value })}
                                            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[#13ec49]/20 outline-none font-bold text-slate-900 transition-all"
                                            placeholder={t('warehouse_management.modal.item_name_placeholder')}
                                        />

                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('warehouse_management.modal.location')}</label>
                                        <input

                                            type="text"
                                            value={formData.location}
                                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                                            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[#13ec49]/20 outline-none font-bold text-slate-900 transition-all"
                                            placeholder="VD: Kệ A1, Tầng 2"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('warehouse_management.modal.unit')}</label>
                                        <select

                                            value={formData.unit}
                                            onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[#13ec49]/20 outline-none font-bold text-slate-900 transition-all appearance-none"
                                        >
                                            {units.map(u => <option key={u} value={u}>{u}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('warehouse_management.modal.quantity')}</label>
                                        <input

                                            required
                                            type="number"
                                            value={formData.quantity}
                                            onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
                                            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[#13ec49]/20 outline-none font-bold text-slate-900 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('warehouse_management.modal.price')}</label>
                                        <input

                                            required
                                            type="number"
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[#13ec49]/20 outline-none font-bold text-slate-900 transition-all"
                                        />
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('warehouse_management.modal.note')}</label>
                                        <textarea

                                            rows={3}
                                            value={formData.note}
                                            onChange={e => setFormData({ ...formData, note: e.target.value })}
                                            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[#13ec49]/20 outline-none font-bold text-slate-900 transition-all resize-none"
                                            placeholder={t('warehouse_management.modal.note_placeholder')}
                                        />

                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full mt-12 bg-[#13ec49] text-black py-6 rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-[#13ec49]/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-4"
                            >
                                <span className="material-symbols-outlined font-black">save</span>
                                {editingItem ? t('warehouse_management.modal.save_edit') : t('warehouse_management.modal.save_new')}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Media Picker Modal */}
            {showMediaPicker && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-[60px] w-full max-w-5xl h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in slide-in-from-bottom-12 duration-500">
                        <div className="p-10 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                 <h3 className="text-3xl font-black text-slate-900 tracking-tight">{t('warehouse_management.media.title')}</h3>
                                <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest mt-2">{t('warehouse_management.media.subtitle')}</p>

                            </div>
                            <button onClick={() => setShowMediaPicker(false)} className="size-14 rounded-[20px] bg-slate-50 hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-slate-400 transition-all">
                                <span className="material-symbols-outlined text-3xl">close</span>
                            </button>
                        </div>
                        <div className="p-10 flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30">
                            {loadingMedia ? (
                                <div className="flex flex-col items-center justify-center h-full gap-4">
                                    <div className="size-12 border-4 border-[#13ec49]/20 border-t-[#13ec49] rounded-full animate-spin"></div>
                                    <p className="font-black text-slate-400 uppercase text-[11px] tracking-widest">Đang tải tài nguyên...</p>
                                </div>
                            ) : mediaFiles.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-300">
                                    <span className="material-symbols-outlined text-[100px]">filter_hdr</span>
                                    <p className="font-black uppercase text-sm tracking-widest">{t('warehouse_management.media.no_data')}</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                    {mediaFiles.map((media) => (
                                        <div
                                            key={media.id}
                                            onClick={() => handleSelectMedia(media.id)}
                                            className="group relative aspect-square bg-white rounded-[32px] overflow-hidden cursor-pointer border-4 border-transparent hover:border-[#13ec49] shadow-md hover:shadow-2xl hover:shadow-[#13ec49]/20 transition-all"
                                        >
                                            <img
                                                src={getMediaUrl(media.id)}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                alt={media.image_name}
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-all">
                                                <div className="bg-[#13ec49] text-black size-12 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all shadow-2xl">
                                                    <span className="material-symbols-outlined font-black">check</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            <ConfirmDeleteModal
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
                isDeleting={isDeleting}
                itemName={deleteTarget?.item_name}
            />
            <ImportDataModal
                open={showImportModal}
                onClose={() => setShowImportModal(false)}
                onImport={handleImport}
                entityName={t('sidebar.warehouse_items').toLowerCase()}
                columnGuide={[
                    t('warehouse_management.modal.item_code'),
                    t('warehouse_management.modal.item_name'),
                    t('warehouse_management.modal.sku'),
                    t('warehouse_management.modal.warehouse_type'),
                    t('warehouse_management.modal.quantity'),
                    t('warehouse_management.modal.unit'),
                    t('warehouse_management.modal.price'),
                    t('warehouse_management.modal.location'),
                    t('warehouse_management.modal.note')
                ]}

                onDownloadTemplate={handleDownloadTemplate}
            />
        </div>
    );
};

export default WarehouseManagement;
