import React, { useState } from 'react';

interface HouseholdItem {
    id: string;
    item_code: string;
    item_name: string;
    category: string;
    quantity: number;
    unit: string;
    price: number;
    location: string;
}

const HouseholdWarehouse: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const [items] = useState<HouseholdItem[]>([
        { id: '1', item_code: 'GD-001', item_name: 'Bàn ghế gỗ', category: 'Nội thất', quantity: 5, unit: 'Bộ', price: 3500000, location: 'Kho A' },
        { id: '2', item_code: 'GD-002', item_name: 'Tủ lạnh', category: 'Điện lạnh', quantity: 2, unit: 'Cái', price: 8000000, location: 'Kho B' },
        { id: '3', item_code: 'GD-003', item_name: 'Quạt điện', category: 'Điện gia dụng', quantity: 10, unit: 'Cái', price: 500000, location: 'Kho A' },
        { id: '4', item_code: 'GD-004', item_name: 'Nồi cơm điện', category: 'Nhà bếp', quantity: 8, unit: 'Cái', price: 800000, location: 'Kho C' },
    ]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-[1440px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                        Kho Gia dụng
                    </h1>
                    <p className="text-slate-500 mt-2">Quản lý đồ gia dụng và nội thất</p>
                </div>
                <button className="flex items-center gap-2 bg-[#13ec49] hover:bg-[#13ec49]/90 text-black font-bold h-11 px-6 rounded-xl shadow-lg shadow-[#13ec49]/20 transition-all active:scale-95">
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    <span>Thêm mặt hàng</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-slate-500 text-xs font-bold uppercase">Tổng số mặt hàng</p>
                    <h3 className="text-3xl font-black mt-2">{items.length}</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-slate-500 text-xs font-bold uppercase">Tổng số lượng</p>
                    <h3 className="text-3xl font-black mt-2">{items.reduce((sum, item) => sum + item.quantity, 0)}</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-slate-500 text-xs font-bold uppercase">Tổng giá trị</p>
                    <h3 className="text-2xl font-black mt-2 text-green-600">{formatCurrency(totalValue)}</h3>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200">
                    <div className="relative max-w-md">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-lg py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-[#13ec49]/30 transition-all outline-none"
                            placeholder="Tìm kiếm đồ gia dụng..."
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-xs font-bold text-slate-500 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Mã hàng</th>
                                <th className="px-6 py-4">Tên mặt hàng</th>
                                <th className="px-6 py-4">Danh mục</th>
                                <th className="px-6 py-4">Số lượng</th>
                                <th className="px-6 py-4">Đơn giá</th>
                                <th className="px-6 py-4">Vị trí</th>
                                <th className="px-6 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {items.map((item) => (
                                <tr key={item.id} className="group hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">{item.item_code}</span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-900">{item.item_name}</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold">{item.category}</span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-900">{item.quantity} {item.unit}</td>
                                    <td className="px-6 py-4 font-bold text-green-600">{formatCurrency(item.price)}</td>
                                    <td className="px-6 py-4 text-slate-600">{item.location}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-all">
                                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                            </button>
                                            <button className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all">
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default HouseholdWarehouse;
