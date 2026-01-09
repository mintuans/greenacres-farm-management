import React, { useState } from 'react';

type TabType = 'categories' | 'shifts' | 'jobs' | 'workers' | 'units';

interface Category {
  id: string;
  category_code: string;
  category_name: string;
  scope: 'FARM' | 'PERSONAL' | 'BOTH';
}

interface WorkShift {
  id: string;
  shift_code: string;
  shift_name: string;
  start_time: string;
  end_time: string;
}

interface JobType {
  id: string;
  job_code: string;
  job_name: string;
  base_rate: number;
  description?: string;
}

interface Worker {
  id: string;
  partner_code: string;
  partner_name: string;
  phone?: string;
  address?: string;
}

interface ProductionUnit {
  id: string;
  unit_code: string;
  unit_name: string;
  type: 'CROP' | 'LIVESTOCK';
  area_size?: number;
  description?: string;
}

const MasterData: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('categories');
  const [searchTerm, setSearchTerm] = useState('');

  // Sample data - Sau này sẽ lấy từ API
  const [categories] = useState<Category[]>([
    { id: '1', category_code: 'CAT-PHAN-BON', category_name: 'Phân bón', scope: 'FARM' },
    { id: '2', category_code: 'CAT-THUOC-TRAI', category_name: 'Thuốc trừ sâu', scope: 'FARM' },
    { id: '3', category_code: 'CAT-DIEN-NUOC', category_name: 'Điện nước', scope: 'BOTH' },
  ]);

  const [shifts] = useState<WorkShift[]>([
    { id: '1', shift_code: 'SHIFT-SANG', shift_name: 'Ca sáng', start_time: '06:00', end_time: '12:00' },
    { id: '2', shift_code: 'SHIFT-CHIEU', shift_name: 'Ca chiều', start_time: '13:00', end_time: '17:00' },
    { id: '3', shift_code: 'SHIFT-FULL', shift_name: 'Ca ngày', start_time: '06:00', end_time: '17:00' },
  ]);

  const [jobs] = useState<JobType[]>([
    { id: '1', job_code: 'JOB-HAI-TRAI', job_name: 'Hái trái', base_rate: 200000, description: 'Hái trái cây' },
    { id: '2', job_code: 'JOB-BON-PHAN', job_name: 'Bón phân', base_rate: 180000, description: 'Bón phân cho cây' },
    { id: '3', job_code: 'JOB-TUOI-NUOC', job_name: 'Tưới nước', base_rate: 150000, description: 'Tưới nước cho vườn' },
  ]);

  const [workers] = useState<Worker[]>([
    { id: '1', partner_code: 'NV-001', partner_name: 'Nguyễn Văn A', phone: '0901234567', address: 'Cần Thơ' },
    { id: '2', partner_code: 'NV-002', partner_name: 'Trần Thị B', phone: '0912345678', address: 'Tiền Giang' },
    { id: '3', partner_code: 'NV-003', partner_name: 'Lê Văn C', phone: '0923456789', address: 'Vĩnh Long' },
  ]);

  const [units] = useState<ProductionUnit[]>([
    { id: '1', unit_code: 'UNIT-VU-A', unit_name: 'Vườn mận A', type: 'CROP', area_size: 2.5, description: 'Vườn mận chính' },
    { id: '2', unit_code: 'UNIT-VU-B', unit_name: 'Vườn cam B', type: 'CROP', area_size: 1.8, description: 'Vườn cam mới' },
    { id: '3', unit_code: 'UNIT-CHUONG-GA', unit_name: 'Chuồng gà', type: 'LIVESTOCK', area_size: 0.5, description: 'Chăn nuôi gà' },
  ]);

  const tabs = [
    { id: 'categories', label: 'Thể loại', icon: 'category' },
    { id: 'shifts', label: 'Ca làm việc', icon: 'schedule' },
    { id: 'jobs', label: 'Công việc', icon: 'work' },
    { id: 'workers', label: 'Nhân viên', icon: 'group' },
    { id: 'units', label: 'Đơn vị sản xuất', icon: 'agriculture' },
  ];

  const getScopeLabel = (scope: string) => {
    switch (scope) {
      case 'FARM': return 'Nông trại';
      case 'PERSONAL': return 'Cá nhân';
      case 'BOTH': return 'Cả hai';
      default: return scope;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'CROP': return 'Trồng trọt';
      case 'LIVESTOCK': return 'Chăn nuôi';
      default: return type;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Danh mục hệ thống
          </h1>
          <p className="text-slate-500 mt-2">Quản lý dữ liệu cơ bản cho hệ thống</p>
        </div>
        <button className="flex items-center gap-2 bg-[#13ec49] hover:bg-[#13ec49]/90 text-black font-bold h-11 px-6 rounded-xl shadow-lg shadow-[#13ec49]/20 transition-all active:scale-95">
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span>Thêm mới</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${activeTab === tab.id
                  ? 'text-slate-900 border-[#13ec49]'
                  : 'text-slate-400 border-transparent hover:text-slate-700'
                }`}
            >
              <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
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
              placeholder="Tìm kiếm..."
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {/* Categories Table */}
          {activeTab === 'categories' && (
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
                {categories.map((cat) => (
                  <tr key={cat.id} className="group hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                        {cat.category_code}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">{cat.category_name}</td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold">
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
          )}

          {/* Work Shifts Table */}
          {activeTab === 'shifts' && (
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-xs font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Mã ca</th>
                  <th className="px-6 py-4">Tên ca làm việc</th>
                  <th className="px-6 py-4">Giờ bắt đầu</th>
                  <th className="px-6 py-4">Giờ kết thúc</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {shifts.map((shift) => (
                  <tr key={shift.id} className="group hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                        {shift.shift_code}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">{shift.shift_name}</td>
                    <td className="px-6 py-4 text-slate-600">{shift.start_time}</td>
                    <td className="px-6 py-4 text-slate-600">{shift.end_time}</td>
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
          )}

          {/* Job Types Table */}
          {activeTab === 'jobs' && (
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
          )}

          {/* Workers Table */}
          {activeTab === 'workers' && (
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-xs font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Mã nhân viên</th>
                  <th className="px-6 py-4">Tên nhân viên</th>
                  <th className="px-6 py-4">Số điện thoại</th>
                  <th className="px-6 py-4">Địa chỉ</th>
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
                    <td className="px-6 py-4 font-bold text-slate-900">{worker.partner_name}</td>
                    <td className="px-6 py-4 text-slate-600">{worker.phone || '-'}</td>
                    <td className="px-6 py-4 text-slate-600">{worker.address || '-'}</td>
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
          )}

          {/* Production Units Table */}
          {activeTab === 'units' && (
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
                    <td className="px-6 py-4 font-bold text-slate-900">{unit.unit_name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold ${unit.type === 'CROP'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-orange-50 text-orange-700'
                        }`}>
                        {getTypeLabel(unit.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{unit.area_size || '-'}</td>
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
          )}
        </div>
      </div>
    </div>
  );
};

export default MasterData;
