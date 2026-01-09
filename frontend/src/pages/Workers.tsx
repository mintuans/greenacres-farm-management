import React, { useState } from 'react';

interface Worker {
    id: string;
    partner_code: string;
    partner_name: string;
    phone?: string;
    address?: string;
    current_balance: number;
}

const Workers: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const [workers] = useState<Worker[]>([
        { id: '1', partner_code: 'NV-001', partner_name: 'Nguyễn Văn A', phone: '0901234567', address: 'Cần Thơ', current_balance: 0 },
        { id: '2', partner_code: 'NV-002', partner_name: 'Trần Thị B', phone: '0912345678', address: 'Tiền Giang', current_balance: -500000 },
        { id: '3', partner_code: 'NV-003', partner_name: 'Lê Văn C', phone: '0923456789', address: 'Vĩnh Long', current_balance: 200000 },
        { id: '4', partner_code: 'NV-004', partner_name: 'Phạm Thị D', phone: '0934567890', address: 'An Giang', current_balance: 0 },
        { id: '5', partner_code: 'NV-005', partner_name: 'Hoàng Văn E', phone: '0945678901', address: 'Đồng Tháp', current_balance: -300000 },
    ]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-[1440px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                        Quản lý Nhân viên
                    </h1>
                    <p className="text-slate-500 mt-2">Danh sách nhân viên và công nhân</p>
                </div>
                <button className="flex items-center gap-2 bg-[#13ec49] hover:bg-[#13ec49]/90 text-black font-bold h-11 px-6 rounded-xl shadow-lg shadow-[#13ec49]/20 transition-all active:scale-95">
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    <span>Thêm nhân viên</span>
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
                            placeholder="Tìm kiếm nhân viên..."
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-xs font-bold text-slate-500 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Mã nhân viên</th>
                                <th className="px-6 py-4">Tên nhân viên</th>
                                <th className="px-6 py-4">Số điện thoại</th>
                                <th className="px-6 py-4">Địa chỉ</th>
                                <th className="px-6 py-4">Số dư</th>
                                <th className="px-6 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {workers.map((worker) => (
                                <tr key={worker.id} className="group hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                                            {worker.partner_code}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-full bg-gradient-to-br from-[#13ec49] to-green-600 flex items-center justify-center text-white font-bold">
                                                {worker.partner_name.charAt(0)}
                                            </div>
                                            <span className="font-bold text-slate-900">{worker.partner_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{worker.phone || '-'}</td>
                                    <td className="px-6 py-4 text-slate-600">{worker.address || '-'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`font-bold ${worker.current_balance > 0
                                                ? 'text-green-600'
                                                : worker.current_balance < 0
                                                    ? 'text-red-600'
                                                    : 'text-slate-600'
                                            }`}>
                                            {formatCurrency(worker.current_balance)}
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

export default Workers;
