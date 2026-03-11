import React, { useState, useEffect } from 'react';
import { getSeasons, Season, getSeasonStats, createSeason, getNextSeasonCode, updateSeason } from '../api/season.api';
import { getProductionUnits, ProductionUnit } from '../api/production-unit.api';
import { getTransactions, Transaction } from '../api/transaction.api';
import { getMedicineUsageStats, logUsage, InventoryUsage } from '../api/inventory-usage.api';
import { getInventory, InventoryItem } from '../api/inventory.api';
import { getPayrollsBySeason, Payroll } from '../api/payroll.api';
import { useTranslation } from 'react-i18next';

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
            <div className="py-8 text-center text-slate-400 text-xs italic font-bold">Chưa có dữ liệu</div>
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
  const { t, i18n } = useTranslation();

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

  const [activeSeasonId, setActiveSeasonId] = useState<string | null>(null);

  const currentSeason = seasons.find(s => s.id === activeSeasonId) || seasons.find(s => s.status === 'ACTIVE') || seasons[0];

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        const seasonsData = await getSeasons();
        setSeasons(seasonsData || []);

        // Luôn ưu tiên chọn vụ đang ACTIVE đầu tiên nếu chưa chọn gì
        if (!activeSeasonId && seasonsData && seasonsData.length > 0) {
          const active = seasonsData.find((s: any) => s.status === 'ACTIVE') || seasonsData[0];
          setActiveSeasonId(active.id);
        }
      } catch (error) {
        console.error('Error in initial load:', error);
      } finally {
        setLoading(false);
      }
    };
    initData();
    loadUnits();
    loadInventory();
  }, []);

  useEffect(() => {
    if (currentSeason?.id) {
      fetchSeasonDetails(currentSeason.id);
    }
  }, [currentSeason?.id]);

  const fetchSeasonDetails = async (id: string) => {
    try {
      const [statsData, transactionsData, usageStats, payrollsData] = await Promise.all([
        getSeasonStats(),
        getTransactions(undefined, undefined, id),
        getMedicineUsageStats(id),
        getPayrollsBySeason(id)
      ]);
      setStats(statsData);
      setTransactions(transactionsData || []);
      setMedicineStats(usageStats || []);
      setPayrolls(payrollsData || []);
    } catch (error) {
      console.error('Error fetching season details:', error);
    }
  };

  const fetchData = async () => {
    try {
      const seasonsData = await getSeasons();
      setSeasons(seasonsData || []);
      if (currentSeason?.id) {
        fetchSeasonDetails(currentSeason.id);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
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

  const loadInventory = async () => {
    try {
      const data = await getInventory();
      setInventory(data || []);
    } catch (error) {
      console.error('Error loading inventory:', error);
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
    if (!currentSeason) return;
    try {
      await logUsage({
        ...usageData,
        season_id: currentSeason.id
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
    <div className="p-3 md:p-4 space-y-4 w-full bg-slate-50/30 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#13ec49] text-[10px] font-black uppercase tracking-widest">
            <span className="material-symbols-outlined text-[14px]">home</span>
            {t('seasons.breadcrumb')}
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter">{t('seasons.title')}</h1>
          <p className="text-slate-500 text-sm max-w-xl">{t('seasons.subtitle')}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="w-full sm:w-72">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">{t('seasons.select_label')}</label>
            <CleanSelect
              value={currentSeason?.id || ''}
              onChange={(val) => setActiveSeasonId(val)}
              options={seasons.map(s => ({
                value: s.id,
                label: s.season_name,
                sublabel: s.status === 'ACTIVE' ? t('seasons.status.active') : t('seasons.status.ended')
              }))}
              placeholder={t('seasons.select_label') + "..."}
            />
          </div>

          <button
            onClick={async () => {
              const nextCode = await getNextSeasonCode();
              setFormData(prev => ({ ...prev, season_code: nextCode }));
              setShowModal(true);
            }}
            className="w-full sm:w-auto bg-[#13ec49] text-black px-4 py-2 rounded-xl text-sm font-black shadow-lg shadow-[#13ec49]/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 h-10"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            {t('seasons.start_new')}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-[#13ec49] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Active Season Highlight */}
          {currentSeason && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden group transition-all hover:shadow-2xl">
              <div className="p-4 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-white to-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-2xl bg-[#13ec49]/10 flex items-center justify-center text-[#13ec49] group-hover:scale-110 transition-transform shadow-inner">
                    <span className="material-symbols-outlined text-2xl">grass</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">{currentSeason.season_name}</h2>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${currentSeason.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                        <span className={`size-2 rounded-full ${currentSeason.status === 'ACTIVE' ? 'bg-green-600 animate-pulse' : 'bg-slate-400'}`}></span>
                        {currentSeason.status === 'ACTIVE' ? t('seasons.status.ongoing') : t('seasons.status.ended')}
                      </span>
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                        • {t('seasons.table.time')} {new Date(currentSeason.start_date).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <button
                    onClick={() => currentSeason && handleEditClick(currentSeason)}
                    className="flex-1 md:flex-none bg-white border border-slate-200 text-slate-900 px-4 py-2 rounded-xl font-black text-xs hover:bg-slate-50 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                    {t('seasons.edit_season')}
                  </button>
                  <button
                    onClick={() => setShowUsageModal(true)}
                    className="flex-1 md:flex-none bg-white border border-slate-200 text-slate-900 px-4 py-2 rounded-xl font-black text-xs hover:bg-slate-50 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">vaccines</span>
                    {t('seasons.record_usage')}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 font-bold">
                <div className="p-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">{t('seasons.expected_revenue')}</p>
                    <span className="material-symbols-outlined text-green-500 bg-green-50 p-1.5 rounded-lg text-[16px]">payments</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900">
                    {Number(currentSeason.expected_revenue || 0).toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')}đ
                  </h3>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">{t('seasons.financial_goal')}</p>
                </div>
                <div className="p-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">{t('seasons.production_unit')}</p>
                    <span className="material-symbols-outlined text-blue-500 bg-blue-50 p-1.5 rounded-lg text-[16px]">agriculture</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900">{currentSeason.unit_name || 'N/A'}</h3>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">{t('seasons.primary_unit')}</p>
                </div>

                <div className="p-4 bg-[#13ec49]/5 relative overflow-hidden">
                  <div className="relative z-10">
                    <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-2">{t('seasons.investment_efficiency')}</p>
                    <h3 className="text-xl font-black text-slate-900">{t('seasons.no_data')}</h3>
                    <div className="w-full bg-slate-200/50 rounded-full h-1.5 mt-3 overflow-hidden shadow-inner">
                      <div className="bg-[#13ec49] h-full rounded-full shadow-lg" style={{ width: '0%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats Overview - moved to top */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">{t('seasons.general_stats')}</h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{t('seasons.entire_process')}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 md:gap-5">
                <div className="size-10 md:size-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xl md:text-2xl">deployed_code</span>
                </div>
                <div>
                  <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('seasons.total_seasons')}</p>
                  <h4 className="text-2xl md:text-3xl font-black text-slate-900">{seasons.length}</h4>
                </div>
              </div>

              <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 md:gap-5">
                <div className="size-10 md:size-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xl md:text-2xl">task_alt</span>
                </div>
                <div>
                  <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('seasons.status.active')}</p>
                  <h4 className="text-2xl md:text-3xl font-black text-slate-900">
                    {seasons.filter(s => s.status === 'ACTIVE').length}
                  </h4>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column (Stack) */}
            <div className="lg:col-span-2 space-y-6">
              {/* History List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">{t('seasons.list_title')}</h3>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-400">
                        <th className="px-4 py-3">{t('seasons.table.name')}</th>
                        <th className="px-4 py-3">{t('seasons.table.unit')}</th>
                        <th className="px-4 py-3">{t('seasons.table.time')}</th>
                        <th className="px-4 py-3 text-right whitespace-nowrap">{t('seasons.expected_revenue')}</th>
                        <th className="px-4 py-3 text-right">{t('seasons.table.actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-[13px] font-bold text-slate-600">
                      {seasons.map((s) => (
                        <tr key={s.id} onClick={() => setActiveSeasonId(s.id)} className={`hover:bg-slate-50/80 transition-all group cursor-pointer ${activeSeasonId === s.id ? 'bg-[#13ec49]/5' : ''}`}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className={`size-7 rounded-lg flex items-center justify-center text-[16px] ${s.status === 'ACTIVE' ? 'bg-[#13ec49]/10 text-[#13ec49]' : 'bg-slate-100 text-slate-400'
                                }`}>
                                <span className="material-symbols-outlined text-[16px]">grass</span>
                              </div>
                              <span className="text-slate-900 font-extrabold">{s.season_name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-500">{s.unit_name}</td>
                          <td className="px-4 py-3">{new Date(s.start_date).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')}</td>
                          <td className="px-4 py-3 text-right font-black text-slate-900 whitespace-nowrap">
                            {Number(s.expected_revenue || 0).toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')}đ
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditClick(s);
                              }}
                              className="p-1.5 text-slate-400 hover:text-[#13ec49] hover:bg-[#13ec49]/10 rounded-lg transition-all"
                              title="Chỉnh sửa"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
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
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t('seasons.recent_transactions')}</h3>
                  <button className="text-[#13ec49] font-black text-sm uppercase tracking-widest hover:underline">{t('seasons.view_all')}</button>
                </div>
                 <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <th className="px-8 py-5">{t('seasons.transactions_table.date')}</th>
                        <th className="px-8 py-5">{t('seasons.transactions_table.content')}</th>
                        <th className="px-8 py-5">{t('seasons.transactions_table.type')}</th>
                        <th className="px-8 py-5 text-right">{t('seasons.transactions_table.amount')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-sm font-bold text-slate-600">
                      {transactions.slice(0, 5).map((tItem) => (
                        <tr key={tItem.id} className="hover:bg-slate-50/80 transition-all">
                          <td className="px-8 py-5 text-slate-500 font-medium">
                            {new Date(tItem.transaction_date).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')}
                          </td>
                          <td className="px-8 py-5 font-black text-slate-900">{tItem.note || t('seasons.transactions_table.no_notes')}</td>
                          <td className="px-8 py-5">
                            <span className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black uppercase text-slate-500">
                              {tItem.category_name || t('seasons.transactions_table.other')}
                            </span>
                          </td>
                          <td className={`px-8 py-5 text-right font-black ${tItem.type === 'EXPENSE' ? 'text-red-500' : 'text-green-600'}`}>
                            {tItem.type === 'EXPENSE' ? '-' : '+'}{Number(tItem.amount).toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')}đ
                          </td>
                        </tr>
                      ))}
                      {transactions.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-8 py-10 text-center text-slate-300 italic">{t('seasons.transactions_table.empty')}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column — Medicine Usage only */}
            <div className="space-y-8">
              {/* Medicine Usage Card */}
              <div className="bg-white p-6 md:p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('seasons.materials_used')}</p>
                    <h4 className="text-xl font-black text-slate-900 mt-1">{t('seasons.usage_in_season')}</h4>
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
                      <p className="text-slate-400 text-xs italic">{t('seasons.no_medicine')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Employee Payrolls List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t('seasons.labor_costs')}</h3>
              <p className="text-[#13ec49] text-xs font-black uppercase tracking-widest">{t('seasons.payrolls_in_season')}</p>
            </div>
            <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <th className="px-8 py-5">{t('seasons.payrolls_table.code')}</th>
                    <th className="px-8 py-5">{t('seasons.payrolls_table.employee')}</th>
                    <th className="px-8 py-5">{t('seasons.payrolls_table.date')}</th>
                    <th className="px-8 py-5">{t('seasons.payrolls_table.status')}</th>
                    <th className="px-8 py-5 text-right">{t('seasons.payrolls_table.amount')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm font-bold text-slate-600">
                  {payrolls.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-all">
                      <td className="px-8 py-5 font-mono text-[11px] text-[#13ec49] font-black">{p.payroll_code}</td>
                      <td className="px-8 py-5 font-black text-slate-900">{p.partner_name}</td>
                      <td className="px-8 py-5 text-slate-500">
                        {new Date(p.created_at).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')}
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${p.status === 'PAID' ? 'bg-green-100 text-green-700' :
                          p.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-100 text-slate-500'
                          }`}>
                          {p.status === 'PAID' ? t('seasons.status.paid') : p.status === 'APPROVED' ? t('seasons.status.approved') : t('seasons.status.draft')}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right font-black text-slate-900">
                        {Number(p.final_amount).toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')}đ
                      </td>
                    </tr>
                  ))}
                  {payrolls.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-8 py-10 text-center text-slate-300 italic">{t('seasons.payrolls_table.empty')}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )
      }

      {/* Add Season Modal */}
      {
        showModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[40px] p-10 max-w-xl w-full shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t('seasons.modal.new_title')}</h2>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">{t('seasons.modal.new_subtitle')}</p>
                </div>
                <button onClick={() => setShowModal(false)} className="size-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-full">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">{t('seasons.table.name')}</label>
                    <input
                      required
                      value={formData.season_name}
                      onChange={e => setFormData({ ...formData, season_name: e.target.value })}
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[#13ec49]/20 outline-none font-bold text-slate-900 transition-all"
                      placeholder={t('seasons.table.name') + "..."}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">{t('seasons.modal.code')}</label>
                    <input
                      required
                      value={formData.season_code}
                      onChange={e => setFormData({ ...formData, season_code: e.target.value })}
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[#13ec49]/20 outline-none font-bold text-slate-900 transition-all uppercase"
                      placeholder={t('seasons.modal.code') + "..."}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">{t('seasons.modal.area')}</label>
                    <CleanSelect
                      placeholder={t('seasons.modal.area') + "..."}
                      value={formData.unit_id}
                      onChange={val => setFormData({ ...formData, unit_id: val })}
                      options={units.map(u => ({ value: u.id, label: u.unit_name }))}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">{t('seasons.modal.start_date')}</label>
                    <input
                      type="date"
                      required
                      value={formData.start_date}
                      onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[#13ec49]/20 outline-none font-bold text-slate-900 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">{t('seasons.modal.revenue')}</label>
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
                    {t('seasons.modal.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] bg-[#13ec49] text-black font-black rounded-2xl hover:bg-[#10d63f] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[#13ec49]/30 uppercase tracking-widest text-xs py-5"
                  >
                    {t('seasons.modal.init_btn')}
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
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t('seasons.modal.edit_title')}</h2>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">{t('seasons.modal.edit_subtitle', { code: selectedSeason.season_code })}</p>
                </div>
                <button onClick={() => setShowEditModal(false)} className="size-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleUpdateSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-full">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">{t('seasons.table.name')}</label>
                    <input
                      required
                      value={editFormData.season_name}
                      onChange={e => setEditFormData({ ...editFormData, season_name: e.target.value })}
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[#13ec49]/20 outline-none font-bold text-slate-900 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">{t('seasons.modal.area')}</label>
                    <CleanSelect
                      value={editFormData.unit_id}
                      onChange={val => setEditFormData({ ...editFormData, unit_id: val })}
                      options={units.map(u => ({ value: u.id, label: u.unit_name }))}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">{t('seasons.payrolls_table.status')}</label>
                    <CleanSelect
                      value={editFormData.status}
                      onChange={val => setEditFormData({ ...editFormData, status: val })}
                      options={[
                        { value: 'ACTIVE', label: t('seasons.status.ongoing') },
                        { value: 'CLOSED', label: t('seasons.status.ended') }
                      ]}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">{t('seasons.modal.start_date')}</label>
                    <input
                      type="date"
                      required
                      value={editFormData.start_date}
                      onChange={e => setEditFormData({ ...editFormData, start_date: e.target.value })}
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[#13ec49]/20 outline-none font-bold text-slate-900 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">{t('seasons.modal.revenue')}</label>
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
                    {t('seasons.modal.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] bg-[#13ec49] text-black font-black rounded-2xl hover:bg-[#10d63f] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[#13ec49]/20 uppercase tracking-widest text-xs py-5"
                  >
                    {t('seasons.modal.save_btn')}
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
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t('seasons.usage_modal.title')}</h2>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">{t('seasons.usage_modal.subtitle')}</p>
                </div>
                <button onClick={() => setShowUsageModal(false)} className="size-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleUsageSubmit} className="space-y-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">{t('seasons.usage_modal.select_label')}</label>
                    <CleanSelect
                      placeholder={t('seasons.usage_modal.select_placeholder')}
                      value={usageData.inventory_id}
                      onChange={val => setUsageData({ ...usageData, inventory_id: val })}
                      options={inventory.map(item => ({
                        value: item.id,
                        label: item.inventory_name,
                        sublabel: `${t('inventory.modal.current_stock')}: ${item.stock_quantity} ${item.unit_of_measure}`
                      }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">{t('seasons.usage_modal.quantity')}</label>
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
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">{t('seasons.usage_modal.date')}</label>
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
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">{t('seasons.usage_modal.purpose')}</label>
                    <textarea
                      value={usageData.purpose}
                      onChange={e => setUsageData({ ...usageData, purpose: e.target.value })}
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[#13ec49]/20 outline-none font-bold text-slate-900 transition-all resize-none h-24"
                      placeholder={t('seasons.usage_modal.purpose_placeholder')}
                    />
                  </div>
                </div>

                <div className="pt-6 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowUsageModal(false)}
                    className="flex-1 py-5 font-black text-slate-400 hover:bg-slate-50 rounded-2xl transition-all uppercase tracking-widest text-xs"
                  >
                    {t('seasons.usage_modal.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] bg-slate-900 text-white font-black rounded-2xl hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-slate-900/30 uppercase tracking-widest text-xs py-5"
                  >
                    {t('seasons.usage_modal.confirm')}
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
