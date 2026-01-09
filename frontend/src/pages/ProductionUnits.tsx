import React, { useState } from 'react';

interface ProductionUnit {
    id: string;
    unit_code: string;
    unit_name: string;
    type: 'CROP' | 'LIVESTOCK';
    area_size?: number;
    description?: string;
}

const ProductionUnits: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const [units] = useState<ProductionUnit[]>([
        { id: '1', unit_code: 'UNIT-VU-A', unit_name: 'Vườn mận A', type: 'CROP', area_size: 2.5, description: 'Vườn mận chính' },
        { id: '2', unit_code: 'UNIT-VU-B', unit_name: 'Vườn cam B', type: 'CROP', area_size: 1.8, description: 'Vườn cam mới' },
        { id: '3', unit_code: 'UNIT-CHUONG-GA', unit_name: 'Chuồng gà', type: 'LIVESTOCK', area_size: 0.5, description: 'Chăn nuôi gà' },
        { id: '4', unit_code: 'UNIT-VU-C', unit_name: 'Vườn xoài C', type: 'CROP', area_size: 3.2, description: 'Vườn xoài lớn' },
        { id: '5', unit_code: 'UNIT-AO-CA', unit_name: 'Ao cá', type: 'LIVESTOCK', area_size: 1.0, description: 'Nuôi cá tra' },
    ]);

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

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-[1440px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                        Quản lý Đơn vị sản xuất
                    </h1>
                    <p className="text-slate-500 mt-2">Danh sách các vườn, chuồng trại và khu vực sản xuất</p>
                </div>
                <button className="flex items-center gap-2 bg-[#13ec49] hover:bg-[#13ec49]/90 text-black font-bold h-11 px-6 rounded-xl shadow-lg shadow-[#13ec49]/20 transition-all active:scale-95">
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    <span>Thêm đơn vị</span>
                </button>
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
                            placeholder="Tìm kiếm đơn vị sản xuất..."
                        />
                    </div>
                </div>

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
                            {units.map((unit) => (
                                <tr key={unit.id} className="group hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                                            {unit.unit_code}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <span className={`material-symbols-outlined text-2xl ${unit.type === 'CROP' ? 'text-green-600' : 'text-orange-600'
                                                }`}>
                                                {unit.type === 'CROP' ? 'agriculture' : 'pets'}
                                            </span>
                                            <span className="font-bold text-slate-900">{unit.unit_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getTypeColor(unit.type)}`}>
                                            {getTypeLabel(unit.type)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-bold">{unit.area_size || '-'}</td>
                                    <td className="px-6 py-4 text-slate-600">{unit.description || '-'}</td>
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

export default ProductionUnits;
