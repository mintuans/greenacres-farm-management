import React, { useState } from 'react';

interface JobType {
    id: string;
    job_code: string;
    job_name: string;
    base_rate: number;
    description?: string;
}

const JobTypes: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const [jobs] = useState<JobType[]>([
        { id: '1', job_code: 'JOB-HAI-TRAI', job_name: 'Hái trái', base_rate: 200000, description: 'Hái trái cây' },
        { id: '2', job_code: 'JOB-BON-PHAN', job_name: 'Bón phân', base_rate: 180000, description: 'Bón phân cho cây' },
        { id: '3', job_code: 'JOB-TUOI-NUOC', job_name: 'Tưới nước', base_rate: 150000, description: 'Tưới nước cho vườn' },
        { id: '4', job_code: 'JOB-XAT-THUOC', job_name: 'Xịt thuốc', base_rate: 170000, description: 'Xịt thuốc trừ sâu' },
        { id: '5', job_code: 'JOB-LAM-CO', job_name: 'Làm cỏ', base_rate: 160000, description: 'Làm cỏ vườn' },
    ]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-[1440px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                        Quản lý Công việc
                    </h1>
                    <p className="text-slate-500 mt-2">Danh sách các loại công việc và đơn giá</p>
                </div>
                <button className="flex items-center gap-2 bg-[#13ec49] hover:bg-[#13ec49]/90 text-black font-bold h-11 px-6 rounded-xl shadow-lg shadow-[#13ec49]/20 transition-all active:scale-95">
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    <span>Thêm công việc</span>
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
                            placeholder="Tìm kiếm công việc..."
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-xs font-bold text-slate-500 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Mã công việc</th>
                                <th className="px-6 py-4">Tên công việc</th>
                                <th className="px-6 py-4">Đơn giá</th>
                                <th className="px-6 py-4">Mô tả</th>
                                <th className="px-6 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {jobs.map((job) => (
                                <tr key={job.id} className="group hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                                            {job.job_code}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-900">{job.job_name}</td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-green-600">{formatCurrency(job.base_rate)}</span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{job.description || '-'}</td>
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

export default JobTypes;
