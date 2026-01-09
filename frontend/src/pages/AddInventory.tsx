
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/src/components/Input';
import { Button } from '@/src/components/Button';
import { Card } from '@/src/components/Card';

const AddInventory: React.FC = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        category: '',
        quantity: '',
        unit: '',
        cost: '',
        supplier: '',
        minStock: '',
        description: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const categories = [
        'Phân bón',
        'Thuốc BVTV',
        'Thức ăn chăn nuôi',
        'Thiết bị',
        'Công cụ',
        'Khác',
    ];

    const units = ['kg', 'L', 'm', 'cái', 'bao', 'thùng'];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error khi user bắt đầu nhập
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Tên vật tư không được để trống';
        }

        if (!formData.sku.trim()) {
            newErrors.sku = 'Mã SKU không được để trống';
        }

        if (!formData.category) {
            newErrors.category = 'Vui lòng chọn danh mục';
        }

        if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
            newErrors.quantity = 'Số lượng phải lớn hơn 0';
        }

        if (!formData.unit) {
            newErrors.unit = 'Vui lòng chọn đơn vị';
        }

        if (!formData.cost || parseFloat(formData.cost) <= 0) {
            newErrors.cost = 'Giá nhập phải lớn hơn 0';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // TODO: Gọi API để lưu vật tư
        console.log('Form data:', formData);

        // Hiển thị thông báo thành công (tạm thời dùng alert)
        alert('Thêm vật tư thành công!');

        // Quay lại trang Inventory
        navigate('/inventory');
    };

    const handleCancel = () => {
        navigate('/inventory');
    };

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={handleCancel}
                    className="size-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900">Thêm vật tư mới</h1>
                    <p className="text-slate-500 font-medium">Nhập thông tin vật tư vào kho</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Thông tin cơ bản */}
                <Card title="Thông tin cơ bản">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Tên vật tư"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Vd: Phân Urea 46-0-0"
                            error={errors.name}
                            fullWidth
                            icon={<span className="material-symbols-outlined text-[20px]">inventory_2</span>}
                        />

                        <Input
                            label="Mã SKU"
                            name="sku"
                            value={formData.sku}
                            onChange={handleChange}
                            placeholder="Vd: FRT-001"
                            error={errors.sku}
                            fullWidth
                            icon={<span className="material-symbols-outlined text-[20px]">qr_code</span>}
                        />

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-slate-700">Danh mục</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                                    category
                                </span>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-offset-0 ${errors.category ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-[#13ec49]'
                                        }`}
                                >
                                    <option value="">Chọn danh mục</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            {errors.category && (
                                <p className="text-sm text-red-500 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-base">error</span>
                                    {errors.category}
                                </p>
                            )}
                        </div>

                        <Input
                            label="Nhà cung cấp"
                            name="supplier"
                            value={formData.supplier}
                            onChange={handleChange}
                            placeholder="Vd: Công ty TNHH ABC"
                            fullWidth
                            icon={<span className="material-symbols-outlined text-[20px]">business</span>}
                        />
                    </div>
                </Card>

                {/* Số lượng và giá */}
                <Card title="Số lượng & Giá cả">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Input
                            label="Số lượng"
                            name="quantity"
                            type="number"
                            value={formData.quantity}
                            onChange={handleChange}
                            placeholder="0"
                            error={errors.quantity}
                            fullWidth
                            icon={<span className="material-symbols-outlined text-[20px]">numbers</span>}
                        />

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-slate-700">Đơn vị</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                                    straighten
                                </span>
                                <select
                                    name="unit"
                                    value={formData.unit}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-offset-0 ${errors.unit ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-[#13ec49]'
                                        }`}
                                >
                                    <option value="">Chọn đơn vị</option>
                                    {units.map(unit => (
                                        <option key={unit} value={unit}>{unit}</option>
                                    ))}
                                </select>
                            </div>
                            {errors.unit && (
                                <p className="text-sm text-red-500 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-base">error</span>
                                    {errors.unit}
                                </p>
                            )}
                        </div>

                        <Input
                            label="Giá nhập (VNĐ)"
                            name="cost"
                            type="number"
                            value={formData.cost}
                            onChange={handleChange}
                            placeholder="0"
                            error={errors.cost}
                            fullWidth
                            icon={<span className="material-symbols-outlined text-[20px]">payments</span>}
                        />

                        <Input
                            label="Mức tồn kho tối thiểu"
                            name="minStock"
                            type="number"
                            value={formData.minStock}
                            onChange={handleChange}
                            placeholder="0"
                            helperText="Cảnh báo khi số lượng dưới mức này"
                            fullWidth
                            icon={<span className="material-symbols-outlined text-[20px]">warning</span>}
                        />
                    </div>
                </Card>

                {/* Mô tả */}
                <Card title="Thông tin bổ sung">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-700">Mô tả</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Nhập mô tả chi tiết về vật tư..."
                            rows={4}
                            className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 transition-all focus:outline-none focus:ring-2 focus:ring-[#13ec49] focus:ring-offset-0 resize-none"
                        />
                    </div>
                </Card>

                {/* Action buttons */}
                <div className="flex items-center justify-end gap-3 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={handleCancel}
                    >
                        Hủy bỏ
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        icon={<span className="material-symbols-outlined text-[20px]">check_circle</span>}
                    >
                        Lưu vật tư
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AddInventory;
