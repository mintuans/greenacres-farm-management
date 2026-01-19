import React, { useState, useEffect } from 'react';
import { getSeasons, Season, getSeasonStats, createSeason, getNextSeasonCode, updateSeason } from '../api/season.api';
import { getProductionUnits, ProductionUnit } from '../api/production-unit.api';
import { getTransactions, Transaction } from '../api/transaction.api';
import { getMedicineUsageStats, logUsage, InventoryUsage } from '../api/inventory-usage.api';
import { getInventory, InventoryItem } from '../api/inventory.api';
import { getPayrollsBySeason, Payroll } from '../api/payroll.api';

interface CleanSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; sublabel?: string }[];
  placeholder?: string;
  required?: boolean;
}

const CleanSelect: React.FC<CleanSelectProps> = ({ value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-slate-50 border-2 rounded-2xl px-6 py-4 flex items-center justify-between transition-all ${isOpen ? 'border-[#13ec49] bg-white ring-4 ring-[#13ec49]/10' : 'border-transparent hover:bg-slate-100'
          }`}
      >
        <span className={`font-bold ${selectedOption ? 'text-slate-900' : 'text-slate-400'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className={`material-symbols-outlined transition-transform duration-200 text-[#13ec49] ${isOpen ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-2 bg-white border border-slate-100 rounded-[24px] shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-150 max-h-60 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-3.5 rounded-[18px] transition-all flex flex-col gap-0.5 group ${value === opt.value ? 'bg-[#13ec49] text-black' : 'hover:bg-slate-50 text-slate-700'
                }`}
            >
              <span className="font-extrabold text-sm">{opt.label}</span>
              {opt.sublabel && (
                <span className={`text-[10px] font-bold uppercase tracking-wider ${value === opt.value ? 'text-black/60' : 'text-slate-400'}`}>
                  {opt.sublabel}
                </span>
              )}
            </button>
          ))}
          {options.length === 0 && (
            <div className="py-8 text-center text-slate-400 text-xs italic font-bold">Không có dữ liệu</div>
          )}
        </div>
      )}
    </div>
  );
};

const Seasons: React.FC = () => {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [units, setUnits] = useState<ProductionUnit[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [medicineStats, setMedicineStats] = useState<any[]>([]);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);

  // Form state for new season
  const [formData, setFormData] = useState({
    unit_id: '',
    season_code: '',
    season_name: '',
    start_date: new Date().toISOString().split('T')[0],
    expected_revenue: 0
  });

  const [usageData, setUsageData] = useState<any>({
    inventory_id: '',
    quantity: 0,
    purpose: '',
    usage_date: new Date().toISOString().split('T')[0]
  });

  const [editFormData, setEditFormData] = useState<any>({
    unit_id: '',
    season_name: '',
    start_date: '',
    status: '',
    expected_revenue: 0
  });

  const activeSeason = seasons.find(s => s.status === 'ACTIVE') || seasons[0];

  useEffect(() => {
    fetchData();
    loadUnits();
    loadInventory();
  }, [activeSeason?.id]);

  const loadInventory = async () => {
    try {
      const data = await getInventory();
      setInventory(data || []);
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [seasonsData, statsData, transactionsData] = await Promise.all([
        getSeasons(),
        getSeasonStats(),
        getTransactions()
      ]);
      setSeasons(seasonsData || []);
      setStats(statsData);
      setTransactions(transactionsData || []);

      const currentSeason = seasonsData.find((s: any) => s.status === 'ACTIVE') || seasonsData[0];
      if (currentSeason) {
        const [usageStats, payrollsData] = await Promise.all([
          getMedicineUsageStats(currentSeason.id),
          getPayrollsBySeason(currentSeason.id)
        ]);
        setMedicineStats(usageStats || []);
        setPayrolls(payrollsData || []);
      }
    } catch (error) {
      console.error('Error fetching seasons data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnits = async () => {
    try {
      const unitsData = await getProductionUnits();
      setUnits(unitsData || []);
    } catch (error) {
      console.error('Error loading units:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSeason(formData);
      setShowModal(false);
      fetchData();
      // Reset form
      setFormData({
        unit_id: '',
        season_code: '',
        season_name: '',
        start_date: new Date().toISOString().split('T')[0],
        expected_revenue: 0
      });
    } catch (error) {
      console.error('Error creating season:', error);
    }
  };

  const handleEditClick = (season: Season) => {
    setSelectedSeason(season);
    setEditFormData({
      unit_id: season.unit_id,
      season_name: season.season_name,
      start_date: season.start_date.split('T')[0],
      status: season.status,
      expected_revenue: season.expected_revenue || 0
    });
    setShowEditModal(true);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeason) return;
    try {
      await updateSeason(selectedSeason.id, editFormData);
      setShowEditModal(false);
      fetchData();
    } catch (error) {
      console.error('Error updating season:', error);
    }
  };

  const handleUsageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSeason) return;
    try {
      await logUsage({
        ...usageData,
        season_id: activeSeason.id
      });
      setShowUsageModal(false);
      fetchData();
      // Reset
      setUsageData({
        inventory_id: '',
        quantity: 0,
        purpose: '',
        usage_date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error logging usage:', error);
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-10 max-w-6xl mx-auto bg-slate-50/30 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#13ec49] text-xs font-black uppercase tracking-widest">
            <span className="material-symbols-outlined text-[18px]">home</span>
            Trang chủ / Mùa vụ
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Quản lý mùa vụ</h1>
          <p className="text-slate-500 text-lg max-w-xl">Theo dõi chu kỳ cây trồng, giám sát sức khỏe tài chính và truy cập báo cáo năng suất.</p>
        </div>
        <button
          onClick={async () => {
            const nextCode = await getNextSeasonCode();
            setFormData(prev => ({ ...prev, season_code: nextCode }));
            setShowModal(true);
          }}
          className="bg-[#13ec49] text-black px-8 py-4 rounded-2xl text-base font-black shadow-xl shadow-[#13ec49]/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
        >
          <span className="material-symbols-outlined text-[24px]">add_circle</span>
          Bắt đầu vụ mới
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-[#13ec49] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Active Season Highlight */}
          {activeSeason && (
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden group transition-all hover:shadow-3xl">
              <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-white to-slate-50/50">
                <div className="flex items-center gap-6">
                  <div className="size-20 rounded-3xl bg-[#13ec49]/10 flex items-center justify-center text-[#13ec49] group-hover:scale-110 transition-transform shadow-inner">
                    <span className="material-symbols-outlined text-5xl">grass</span>
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">{activeSeason.season_name}</h2>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${activeSeason.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                        <span className={`size-2 rounded-full ${activeSeason.status === 'ACTIVE' ? 'bg-green-600 animate-pulse' : 'bg-slate-400'}`}></span>
                        {activeSeason.status === 'ACTIVE' ? 'Đang diễn ra' : 'Đã kết thúc'}
                      </span>
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                        • Từ {new Date(activeSeason.start_date).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                  <button
                    onClick={() => handleEditClick(activeSeason)}
                    className="flex-1 md:flex-none bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-sm hover:bg-black transition-all shadow-xl shadow-slate-900/20 active:scale-95"
                  >
                    Chỉnh sửa vụ mùa
                  </button>
                  <button
                    onClick={() => setShowUsageModal(true)}
                    className="flex-1 md:flex-none bg-white border border-slate-200 text-slate-900 px-6 py-4 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[20px]">vaccines</span>
                    Ghi nhận dùng thuốc
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                <div className="p-8 hover:bg-slate-50/50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Dự kiến thu</p>
                    <span className="material-symbols-outlined text-green-500 bg-green-50 p-2 rounded-xl text-[20px]">payments</span>
                  </div>
                  <h3 className="text-3xl font-black text-slate-900">
                    {(activeSeason.expected_revenue || 0).toLocaleString('vi-VN')}đ
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3">Mục tiêu tài chính vụ này</p>
                </div>
                <div className="p-8 hover:bg-slate-50/50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Đơn vị canh tác</p>
                    <span className="material-symbols-outlined text-blue-500 bg-blue-50 p-2 rounded-xl text-[20px]">agriculture</span>
                  </div>
                  <h3 className="text-3xl font-black text-slate-900">{activeSeason.unit_name || 'N/A'}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3">Khu vực sản xuất chính</p>
                </div>
                <div className="p-8 bg-[#13ec49]/5 relative overflow-hidden">
                  <div className="absolute -top-4 -right-4 opacity-5">
                    <span className="material-symbols-outlined text-[120px]">analytics</span>
                  </div>
                  <div className="relative z-10">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-3">Hiệu quả đầu tư</p>
                    <h3 className="text-4xl font-black text-slate-900">Chưa có số liệu</h3>
                    <div className="w-full bg-slate-200/50 rounded-full h-2.5 mt-5 overflow-hidden shadow-inner">
                      <div className="bg-[#13ec49] h-full rounded-full shadow-lg" style={{ width: '0%' }}></div>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 text-right mt-2 uppercase tracking-widest italic">Cập nhật sau khi có giao dịch</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Secondary Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left Column (Stack) */}
            <div className="lg:col-span-2 space-y-10">
              {/* History List */}
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Danh sách mùa vụ</h3>
                  <div className="flex gap-2">
                    <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><span className="material-symbols-outlined">filter_list</span></button>
                  </div>
                </div>
                <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <th className="px-8 py-5">Tên mùa vụ</th>
                        <th className="px-8 py-5">Đơn vị</th>
                        <th className="px-8 py-5">Thời gian</th>
                        <th className="px-8 py-5 text-right">Dự kiến thu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-sm font-bold text-slate-600">
                      {seasons.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/80 transition-all group cursor-pointer">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className={`size-8 rounded-xl flex items-center justify-center text-[18px] ${s.status === 'ACTIVE' ? 'bg-[#13ec49]/10 text-[#13ec49]' : 'bg-slate-100 text-slate-400'
                                }`}>
                                <span className="material-symbols-outlined">grass</span>
                              </div>
                              <span className="text-slate-900 font-extrabold">{s.season_name}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-slate-500">{s.unit_name}</td>
                          <td className="px-8 py-5">{new Date(s.start_date).toLocaleDateString('vi-VN')}</td>
                          <td className="px-8 py-5 text-right font-black text-slate-900">
                            <div className="flex items-center justify-end gap-3">
                              <span>{(s.expected_revenue || 0).toLocaleString('vi-VN')}đ</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditClick(s);
                                }}
                                className="size-8 rounded-lg bg-slate-50 text-slate-400 hover:text-[#13ec49] hover:bg-[#13ec49]/10 transition-all flex items-center justify-center"
                              >
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Transactions Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Giao dịch gần đây</h3>
                  <button className="text-[#13ec49] font-black text-sm uppercase tracking-widest hover:underline">Xem tất cả</button>
                </div>
                <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <th className="px-8 py-5">Ngày</th>
                        <th className="px-8 py-5">Nội dung</th>
                        <th className="px-8 py-5">Loại</th>
                        <th className="px-8 py-5 text-right">Số tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-sm font-bold text-slate-600">
                      {transactions.slice(0, 5).map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50/80 transition-all">
                          <td className="px-8 py-5 text-slate-500 font-medium">
                            {new Date(t.transaction_date).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="px-8 py-5 font-black text-slate-900">{t.note || 'Không có ghi chú'}</td>
                          <td className="px-8 py-5">
                            <span className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black uppercase text-slate-500">
                              {t.category_name || 'Khác'}
                            </span>
                          </td>
                          <td className={`px-8 py-5 text-right font-black ${t.type === 'EXPENSE' ? 'text-red-500' : 'text-green-600'}`}>
                            {t.type === 'EXPENSE' ? '-' : '+'}{Number(t.amount).toLocaleString('vi-VN')}đ
                          </td>
                        </tr>
                      ))}
                      {transactions.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-8 py-10 text-center text-slate-300 italic">Chưa có giao dịch nào được ghi lại</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Recent Stats or Quick Actions */}
            <div className="space-y-8">
              <div className="px-2">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Thống kê tổng quát</h3>
                <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest">Toàn bộ quá trình canh tác</p>
              </div>

              <div className="grid gap-4">
                <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex items-center gap-5">
                  <div className="size-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl">deployed_code</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng số vụ</p>
                    <h4 className="text-3xl font-black text-slate-900">{seasons.length}</h4>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex items-center gap-5">
                  <div className="size-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl">task_alt</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đang hoạt động</p>
                    <h4 className="text-3xl font-black text-slate-900">
                      {seasons.filter(s => s.status === 'ACTIVE').length}
                    </h4>
                  </div>
                </div>

                {/* Medicine Usage Card */}
                <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vật tư đã dùng</p>
                      <h4 className="text-xl font-black text-slate-900 mt-1">Sử dụng trong vụ</h4>
                    </div>
                    <div className="size-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <span className="material-symbols-outlined">science</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {medicineStats.length > 0 ? (
                      medicineStats.map((stat, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-blue-500">
                              <span className="material-symbols-outlined text-[18px]">prescriptions</span>
                            </div>
                            <span className="text-sm font-bold text-slate-700">{stat.inventory_name}</span>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-black text-slate-900">{stat.total_quantity}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">{stat.unit_of_measure}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-6 text-center">
                        <p className="text-slate-400 text-xs italic">Chưa ghi nhận sử dụng thuốc</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Employee Payrolls List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Chi phí nhân công</h3>
              <p className="text-[#13ec49] text-xs font-black uppercase tracking-widest">Phiếu lương trong vụ</p>
            </div>
            <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <th className="px-8 py-5">Mã phiếu</th>
                    <th className="px-8 py-5">Nhân viên</th>
                    <th className="px-8 py-5">Ngày lập</th>
                    <th className="px-8 py-5">Trạng thái</th>
                    <th className="px-8 py-5 text-right">Thực nhận</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm font-bold text-slate-600">
                  {payrolls.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-all">
                      <td className="px-8 py-5 font-mono text-[11px] text-[#13ec49] font-black">{p.payroll_code}</td>
                      <td className="px-8 py-5 font-black text-slate-900">{p.partner_name}</td>
                      <td className="px-8 py-5 text-slate-500">
                        {new Date(p.created_at).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${p.status === 'PAID' ? 'bg-green-100 text-green-700' :
                          p.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-100 text-slate-500'
                          }`}>
                          {p.status === 'PAID' ? 'Đã trả' : p.status === 'APPROVED' ? 'Đã duyệt' : 'Dự thảo'}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right font-black text-slate-900">
                        {Number(p.final_amount).toLocaleString('vi-VN')}đ
                      </td>
                    </tr>
                  ))}
                  {payrolls.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-8 py-10 text-center text-slate-300 italic">Chưa có phiếu lương nào cho vụ này</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Add Season Modal */}
      {
        showModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[40px] p-10 max-w-xl w-full shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Thiết lập vụ mới</h2>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Khởi tạo chu kỳ canh tác</p>
                </div>
                <button onClick={() => setShowModal(false)} className="size-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-full">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Tên mùa vụ</label>
                    <input
                      required
                      value={formData.season_name}
                      onChange={e => setFormData({ ...formData, season_name: e.target.value })}
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[#13ec49]/20 outline-none font-bold text-slate-900 transition-all"
                      placeholder="VD: Lúa Đông Xuân 2025"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Mã vụ mùa</label>
                    <input
                      required
                      value={formData.season_code}
                      onChange={e => setFormData({ ...formData, season_code: e.target.value })}
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[#13ec49]/20 outline-none font-bold text-slate-900 transition-all uppercase"
                      placeholder="VD: DX2025"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Khu vực sản xuất</label>
                    <CleanSelect
                      placeholder="Chọn đơn vị..."
                      value={formData.unit_id}
                      onChange={val => setFormData({ ...formData, unit_id: val })}
                      options={units.map(u => ({ value: u.id, label: u.unit_name }))}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Ngày bắt đầu</label>
                    <input
                      type="date"
                      required
                      value={formData.start_date}
                      onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[#13ec49]/20 outline-none font-bold text-slate-900 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Dự thu (VNĐ)</label>
                    <input
                      type="number"
                      value={formData.expected_revenue}
                      onChange={e => setFormData({ ...formData, expected_revenue: Number(e.target.value) })}
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[#13ec49]/20 outline-none font-bold text-slate-900 transition-all"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="pt-6 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-5 font-black text-slate-400 hover:bg-slate-50 rounded-2xl transition-all uppercase tracking-widest text-xs"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] bg-[#13ec49] text-black font-black rounded-2xl hover:bg-[#10d63f] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[#13ec49]/30 uppercase tracking-widest text-xs py-5"
                  >
                    Khởi tạo vụ mùa
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* Edit Season Modal */}
      {
        showEditModal && selectedSeason && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[40px] p-10 max-w-xl w-full shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Chỉnh sửa vụ mùa</h2>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Cập nhật thông tin {selectedSeason.season_code}</p>
                </div>
                <button onClick={() => setShowEditModal(false)} className="size-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleUpdateSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-full">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Tên mùa vụ</label>
                    <input
                      required
                      value={editFormData.season_name}
                      onChange={e => setEditFormData({ ...editFormData, season_name: e.target.value })}
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[#13ec49]/20 outline-none font-bold text-slate-900 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Khu vực sản xuất</label>
                    <CleanSelect
                      value={editFormData.unit_id}
                      onChange={val => setEditFormData({ ...editFormData, unit_id: val })}
                      options={units.map(u => ({ value: u.id, label: u.unit_name }))}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Trạng thái</label>
                    <CleanSelect
                      value={editFormData.status}
                      onChange={val => setEditFormData({ ...editFormData, status: val })}
                      options={[
                        { value: 'ACTIVE', label: 'Đang diễn ra' },
                        { value: 'CLOSED', label: 'Đã kết thúc' }
                      ]}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Ngày bắt đầu</label>
                    <input
                      type="date"
                      required
                      value={editFormData.start_date}
                      onChange={e => setEditFormData({ ...editFormData, start_date: e.target.value })}
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[#13ec49]/20 outline-none font-bold text-slate-900 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Dự thu (VNĐ)</label>
                    <input
                      type="number"
                      value={editFormData.expected_revenue}
                      onChange={e => setEditFormData({ ...editFormData, expected_revenue: Number(e.target.value) })}
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[#13ec49]/20 outline-none font-bold text-slate-900 transition-all"
                    />
                  </div>
                </div>

                <div className="pt-6 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 py-5 font-black text-slate-400 hover:bg-slate-50 rounded-2xl transition-all uppercase tracking-widest text-xs"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] bg-[#13ec49] text-black font-black rounded-2xl hover:bg-[#10d63f] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[#13ec49]/30 uppercase tracking-widest text-xs py-5"
                  >
                    Lưu thay đổi
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* Log Usage Modal */}
      {
        showUsageModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[40px] p-10 max-w-xl w-full shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Ghi nhận sử dụng</h2>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Xuất kho vật tư cho mùa vụ</p>
                </div>
                <button onClick={() => setShowUsageModal(false)} className="size-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleUsageSubmit} className="space-y-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Chọn loại vật tư / thuốc</label>
                    <CleanSelect
                      placeholder="Chọn thuốc hoặc phân bón..."
                      value={usageData.inventory_id}
                      onChange={val => setUsageData({ ...usageData, inventory_id: val })}
                      options={inventory.map(item => ({
                        value: item.id,
                        label: item.inventory_name,
                        sublabel: `Tồn kho: ${item.stock_quantity} ${item.unit_of_measure}`
                      }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Số lượng sử dụng</label>
                      <input
                        type="number"
                        required
                        step="0.1"
                        value={usageData.quantity}
                        onChange={e => setUsageData({ ...usageData, quantity: Number(e.target.value) })}
                        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[#13ec49]/20 outline-none font-bold text-slate-900 transition-all"
                        placeholder="0.0"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Ngày sử dụng</label>
                      <input
                        type="date"
                        required
                        value={usageData.usage_date}
                        onChange={e => setUsageData({ ...usageData, usage_date: e.target.value })}
                        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[#13ec49]/20 outline-none font-bold text-slate-900 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Mục đích sử dụng</label>
                    <textarea
                      value={usageData.purpose}
                      onChange={e => setUsageData({ ...usageData, purpose: e.target.value })}
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[#13ec49]/20 outline-none font-bold text-slate-900 transition-all resize-none h-24"
                      placeholder="VD: Phun thuốc trị nấm lần 1, bón lót..."
                    />
                  </div>
                </div>

                <div className="pt-6 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowUsageModal(false)}
                    className="flex-1 py-5 font-black text-slate-400 hover:bg-slate-50 rounded-2xl transition-all uppercase tracking-widest text-xs"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] bg-slate-900 text-white font-black rounded-2xl hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-slate-900/30 uppercase tracking-widest text-xs py-5"
                  >
                    Xác nhận sử dụng
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default Seasons;
