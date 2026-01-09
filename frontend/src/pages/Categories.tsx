import React, { useState } from 'react';

interface Category {
    id: string;
    category_code: string;
    category_name: string;
    scope: 'FARM' | 'PERSONAL' | 'BOTH';
}

const Categories: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    // Sample data
    const [categories] = useState<Category[]>([
        { id: '1', category_code: 'CAT-PHAN-BON', category_name: 'Phân bón', scope: 'FARM' },
        { id: '2', category_code: 'CAT-THUOC-TRAI', category_name: 'Thuốc trừ sâu', scope: 'FARM' },
        { id: '3', category_code: 'CAT-DIEN-NUOC', category_name: 'Điện nước', scope: 'BOTH' },
        { id: '4', category_code: 'CAT-NHAN-CONG', category_name: 'Nhân công', scope: 'FARM' },
        { id: '5', category_code: 'CAT-AN-UONG', category_name: 'Ăn uống', scope: 'PERSONAL' },
    ]);

    const getScopeLabel = (scope: string) => {
        switch (scope) {
            case 'FARM': return 'Nông trại';
            case 'PERSONAL': return 'Cá nhân';
            case 'BOTH': return 'Cả hai';
            default: return scope;
        }
    };

    const getScopeColor = (scope: string) => {
        switch (scope) {
            case 'FARM': return 'bg-green-50 text-green-700';
            case 'PERSONAL': return 'bg-purple-50 text-purple-700';
            case 'BOTH': return 'bg-blue-50 text-blue-700';
            default: return 'bg-gray-50 text-gray-700';
        }
    };

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-[1440px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                        Quản lý Thể loại
                    </h1>
                    <p className="text-slate-500 mt-2">Danh mục các hạng mục thu chi</p>
                </div>
                <button className="flex items-center gap-2 bg-[#13ec49] hover:bg-[#13ec49]/90 text-black font-bold h-11 px-6 rounded-xl shadow-lg shadow-[#13ec49]/20 transition-all active:scale-95">
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    <span>Thêm thể loại</span>
                </button>
            </div>

            {/* Content Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Search Bar */}
                <div className="p-4 border-b border-slate-200">
                    <div className="relative max-w-md">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            search
                        </span>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-lg py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-[#13ec49]/30 transition-all outline-none"
                            placeholder="Tìm kiếm thể loại..."
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-xs font-bold text-slate-500 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Mã thể loại</th>
                                <th className="px-6 py-4">Tên thể loại</th>
                                <th className="px-6 py-4">Phạm vi</th>
                                <th className="px-6 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {categories
                                .filter(cat =>
                                    cat.category_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    cat.category_code.toLowerCase().includes(searchTerm.toLowerCase())
                                )
                                .map((cat) => (
                                    <tr key={cat.id} className="group hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                                                {cat.category_code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900">{cat.category_name}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getScopeColor(cat.scope)}`}>
                                                {getScopeLabel(cat.scope)}
                                            </span>
                                        </td>
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

export default Categories;
