import React, { useState, useEffect } from 'react';
import { ProductionUnit, getProductionUnits, createProductionUnit, updateProductionUnit, deleteProductionUnit, CreateProductionUnitInput } from '../api/production-unit.api';
import { ActionToolbar, ConfirmDeleteModal, ImportDataModal } from '../components';

const ProductionUnits: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [units, setUnits] = useState<ProductionUnit[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUnit, setEditingUnit] = useState<ProductionUnit | null>(null);
    const [formData, setFormData] = useState<CreateProductionUnitInput>({
        unit_code: '',
        unit_name: '',
        type: 'CROP',
        area_size: undefined,
        description: ''
    });
    const [selectedUnit, setSelectedUnit] = useState<ProductionUnit | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<ProductionUnit | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);

    useEffect(() => {
        loadUnits();
    }, []);

    const loadUnits = async () => {
        try {
            setLoading(true);
            const data = await getProductionUnits();
            setUnits(data);
        } catch (error) {
            console.error('Error loading production units:', error);
            alert('Không thể tải danh sách đơn vị sản xuất');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingUnit) {
                await updateProductionUnit(editingUnit.id, formData);
            } else {
                await createProductionUnit(formData);
            }
            setShowModal(false);
            resetForm();
            loadUnits();
        } catch (error: any) {
            console.error('Error saving production unit:', error);
            alert(error.response?.data?.message || 'Không thể lưu đơn vị sản xuất');
        }
    };

    const handleEdit = (unit: ProductionUnit) => {
        setEditingUnit(unit);
        setFormData({
            unit_code: unit.unit_code,
            unit_name: unit.unit_name,
            type: unit.type,
            area_size: unit.area_size,
            description: unit.description || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        try {
            setIsDeleting(true);
            await deleteProductionUnit(id);
            setDeleteTarget(null);
            setSelectedUnit(null);
            loadUnits();
        } catch (error) {
            console.error('Error deleting production unit:', error);
            alert('Không thể xóa đơn vị sản xuất');
        } finally {
            setIsDeleting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            unit_code: '',
            unit_name: '',
            type: 'CROP',
            area_size: undefined,
            description: ''
        });
        setEditingUnit(null);
    };

    const handleImport = async (file: File) => {
        // Mock implementation or real API call if exists
        console.log('Importing file:', file.name);
        return new Promise<void>((resolve) => setTimeout(resolve, 1500));
    };

    const handleExport = () => {
        console.log('Exporting data...');
        alert('Đang trích xuất dữ liệu ra file Excel...');
    };

    const handleDownloadTemplate = () => {
        console.log('Downloading template...');
        alert('Đang tải tệp mẫu...');
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'CROP': return 'Trồng trọt';
            case 'LIVESTOCK': return 'Chăn nuôi';
            default: return type;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'CROP': return 'bg-green-50 text-green-700';
            case 'LIVESTOCK': return 'bg-orange-50 text-orange-700';
            default: return 'bg-gray-50 text-gray-700';
        }
    };

    const filteredUnits = (units || []).filter(unit =>
        unit.unit_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.unit_code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-3 md:p-4 space-y-4 w-full">
            <div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                    Quản lý Đơn vị Sản xuất
                </h1>
                <p className="text-slate-500 mt-2">Danh sách các vườn, chuồng trại và khu vực sản xuất</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-3 md:p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-lg py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-[#13ec49]/30 transition-all outline-none font-medium"
                            placeholder="Tìm kiếm đơn vị sản xuất..."
                        />
                    </div>
                    <ActionToolbar
                        onAdd={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                        addLabel="Thêm đơn vị"
                        onEdit={() => selectedUnit && handleEdit(selectedUnit)}
                        editDisabled={!selectedUnit}
                        onDelete={() => selectedUnit && setDeleteTarget(selectedUnit)}
                        deleteDisabled={!selectedUnit}
                        onRefresh={loadUnits}
                        isRefreshing={loading}
                        onImport={() => setShowImportModal(true)}
                        onExport={handleExport}
                        onDownloadTemplate={handleDownloadTemplate}
                    />
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#13ec49]"></div>
                        <p className="mt-4 text-slate-600">Đang tải...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-xs font-bold text-slate-500 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">Mã đơn vị</th>
                                    <th className="px-6 py-4">Tên đơn vị</th>
                                    <th className="px-6 py-4">Loại hình</th>
                                    <th className="px-6 py-4">Diện tích (ha)</th>
                                    <th className="px-6 py-4">Mô tả</th>
                                    <th className="px-6 py-4 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {filteredUnits.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                            {searchTerm ? 'Không tìm thấy đơn vị sản xuất nào' : 'Chưa có đơn vị sản xuất nào'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUnits.map((unit) => (
                                        <tr
                                            key={unit.id}
                                            onClick={() => setSelectedUnit(prev => prev?.id === unit.id ? null : unit)}
                                            className={`group transition-all cursor-pointer ${selectedUnit?.id === unit.id ? 'bg-[#13ec49]/5 ring-1 ring-inset ring-[#13ec49]/30' : 'hover:bg-slate-50'}`}
                                        >
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                                                    {unit.unit_code}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <span className={`material-symbols-outlined text-2xl ${unit.type === 'CROP' ? 'text-green-600' : 'text-orange-600'}`}>
                                                        {unit.type === 'CROP' ? 'agriculture' : 'pets'}
                                                    </span>
                                                    <span className="font-bold text-slate-900">{unit.unit_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getTypeColor(unit.type || '')}`}>
                                                    {getTypeLabel(unit.type || '')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 font-bold">{unit.area_size || '-'}</td>
                                            <td className="px-6 py-4 text-slate-600">{unit.description || '-'}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleEdit(unit); }}
                                                        className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-all"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">edit</span>
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(unit); }}
                                                        className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
                        <h2 className="text-2xl font-bold mb-6 text-slate-900">
                            {editingUnit ? 'Sửa đơn vị sản xuất' : 'Thêm đơn vị sản xuất mới'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Mã đơn vị *</label>
                                <input
                                    type="text"
                                    required
                                    disabled={!!editingUnit}
                                    value={formData.unit_code}
                                    onChange={(e) => setFormData({ ...formData, unit_code: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 disabled:bg-slate-100 focus:ring-2 focus:ring-[#13ec49]/30 outline-none"
                                    placeholder="VD: UNIT-VU-A"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tên đơn vị *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.unit_name}
                                    onChange={(e) => setFormData({ ...formData, unit_name: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#13ec49]/30 outline-none"
                                    placeholder="Nhập tên đơn vị"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Loại hình *</label>
                                <select
                                    required
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#13ec49]/30 outline-none"
                                >
                                    <option value="CROP">Trồng trọt</option>
                                    <option value="LIVESTOCK">Chăn nuôi</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Diện tích (ha)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={formData.area_size || ''}
                                    onChange={(e) => setFormData({ ...formData, area_size: e.target.value ? parseFloat(e.target.value) : undefined })}
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#13ec49]/30 outline-none"
                                    placeholder="VD: 2.5"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#13ec49]/30 outline-none"
                                    rows={3}
                                    placeholder="Nhập mô tả"
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="px-6 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium transition-all"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-[#13ec49] text-black font-bold rounded-lg hover:bg-[#13ec49]/90 transition-all active:scale-95"
                                >
                                    {editingUnit ? 'Cập nhật' : 'Tạo mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <ConfirmDeleteModal
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
                isDeleting={isDeleting}
                itemName={deleteTarget?.unit_name}
            />
            <ImportDataModal
                open={showImportModal}
                onClose={() => setShowImportModal(false)}
                onImport={handleImport}
                entityName="đơn vị sản xuất"
                columnGuide={['Mã đơn vị', 'Tên đơn vị', 'Loại hình (CROP/LIVESTOCK)', 'Diện tích', 'Mô tả']}
                onDownloadTemplate={handleDownloadTemplate}
            />
        </div>
    );
};

export default ProductionUnits;
