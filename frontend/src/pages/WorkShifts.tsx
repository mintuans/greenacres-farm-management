import React, { useState } from 'react';

interface WorkShift {
    id: string;
    shift_code: string;
    shift_name: string;
    start_time: string;
    end_time: string;
}

const WorkShifts: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const [shifts] = useState<WorkShift[]>([
        { id: '1', shift_code: 'SHIFT-SANG', shift_name: 'Ca sáng', start_time: '06:00', end_time: '12:00' },
        { id: '2', shift_code: 'SHIFT-CHIEU', shift_name: 'Ca chiều', start_time: '13:00', end_time: '17:00' },
        { id: '3', shift_code: 'SHIFT-FULL', shift_name: 'Ca ngày', start_time: '06:00', end_time: '17:00' },
        { id: '4', shift_code: 'SHIFT-TOI', shift_name: 'Ca tối', start_time: '18:00', end_time: '22:00' },
    ]);

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-[1440px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                        Quản lý Ca làm việc
                    </h1>
                    <p className="text-slate-500 mt-2">Danh sách các ca làm việc trong ngày</p>
                </div>
                <button className="flex items-center gap-2 bg-[#13ec49] hover:bg-[#13ec49]/90 text-black font-bold h-11 px-6 rounded-xl shadow-lg shadow-[#13ec49]/20 transition-all active:scale-95">
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    <span>Thêm ca làm việc</span>
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
                            placeholder="Tìm kiếm ca làm việc..."
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-xs font-bold text-slate-500 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Mã ca</th>
                                <th className="px-6 py-4">Tên ca làm việc</th>
                                <th className="px-6 py-4">Giờ bắt đầu</th>
                                <th className="px-6 py-4">Giờ kết thúc</th>
                                <th className="px-6 py-4">Thời lượng</th>
                                <th className="px-6 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {shifts.map((shift) => {
                                const start = new Date(`2000-01-01 ${shift.start_time}`);
                                const end = new Date(`2000-01-01 ${shift.end_time}`);
                                const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

                                return (
                                    <tr key={shift.id} className="group hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                                                {shift.shift_code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900">{shift.shift_name}</td>
                                        <td className="px-6 py-4 text-slate-600">{shift.start_time}</td>
                                        <td className="px-6 py-4 text-slate-600">{shift.end_time}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                                                {duration} giờ
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
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default WorkShifts;
