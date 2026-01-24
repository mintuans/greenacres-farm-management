import React, { useState, useEffect } from 'react';
import { getDashboardStats, getCashFlowHistory, getLowStockItems, getTopWorkers, DashboardStats, CashFlowData, LowStockItem, TopWorker } from '../api/dashboard.api';
import { getSeasons, Season } from '../api/season.api';

const StatCard: React.FC<{
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: string;
  colorClass: string;
}> = ({ label, value, trend, trendUp, icon, colorClass }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-transform hover:-translate-y-1">
    <div className="flex justify-between items-start mb-6">
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
        <span className="material-symbols-outlined text-[14px]">{trendUp ? 'trending_up' : 'trending_down'}</span>
        {trend}
      </div>
    </div>
    <p className="text-slate-500 text-sm font-medium">{label}</p>
    <h3 className="text-3xl font-black text-slate-900 mt-1">{value}</h3>
  </div>
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [cashFlow, setCashFlow] = useState<CashFlowData[]>([]);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [topWorkers, setTopWorkers] = useState<TopWorker[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [loadingChart, setLoadingChart] = useState(true);
  const [loadingLowStock, setLoadingLowStock] = useState(true);
  const [loadingTopWorkers, setLoadingTopWorkers] = useState(true);

  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const data = await getSeasons();
        setSeasons(data || []);
      } catch (error) {
        console.error('Error fetching seasons:', error);
      }
    };
    fetchSeasons();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getDashboardStats(undefined, undefined, selectedSeason || undefined);
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [selectedSeason]);

  useEffect(() => {
    const fetchCashFlow = async () => {
      try {
        setLoadingChart(true);
        const data = await getCashFlowHistory(6);
        setCashFlow(data);
      } catch (error) {
        console.error('Error fetching cash flow:', error);
      } finally {
        setLoadingChart(false);
      }
    };
    fetchCashFlow();
  }, []);

  useEffect(() => {
    const fetchLowStock = async () => {
      try {
        setLoadingLowStock(true);
        const data = await getLowStockItems(5);
        setLowStockItems(data);
      } catch (error) {
        console.error('Error fetching low stock items:', error);
      } finally {
        setLoadingLowStock(false);
      }
    };
    fetchLowStock();
  }, []);

  useEffect(() => {
    const fetchTopWorkers = async () => {
      try {
        setLoadingTopWorkers(true);
        const data = await getTopWorkers(3);
        setTopWorkers(data);
      } catch (error) {
        console.error('Error fetching top workers:', error);
      } finally {
        setLoadingTopWorkers(false);
      }
    };
    fetchTopWorkers();
  }, []);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatGrowth = (rate: number): string => {
    return `${Math.abs(rate)}%`;
  };

  // Tính toán tỷ lệ cho biểu đồ
  const getChartHeight = (value: number, maxValue: number): number => {
    if (maxValue === 0) return 0;
    return Math.round((value / maxValue) * 100);
  };

  const maxCashFlowValue = Math.max(
    ...cashFlow.map(d => Math.max(d.total_income, d.total_expense)),
    1
  );

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return { bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-600', badge: 'bg-red-100 text-red-700' };
      case 'WARNING':
        return { bg: 'bg-orange-50', border: 'border-orange-400', text: 'text-orange-600', badge: 'bg-orange-100 text-orange-700' };
      default:
        return { bg: 'bg-yellow-50', border: 'border-yellow-400', text: 'text-yellow-600', badge: 'bg-yellow-100 text-yellow-700' };
    }
  };

  const getUrgencyLabel = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'Hết hàng';
      case 'WARNING':
        return 'Sắp hết';
      default:
        return 'Cảnh báo';
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Tổng quan trang trại</h2>
          <div className="flex items-center gap-2 mt-1 text-slate-500 text-sm">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            <span>Tháng hiện tại</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
            <span className="material-symbols-outlined text-slate-400 text-[20px]">filter_list</span>
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="bg-transparent border-none outline-none font-bold text-sm text-slate-700 cursor-pointer min-w-[150px]"
            >
              <option value="">Tất cả mùa vụ</option>
              {seasons.map(s => (
                <option key={s.id} value={s.id}>{s.season_name}</option>
              ))}
            </select>
          </div>
          <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:bg-slate-50 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">file_download</span>
            Xuất báo cáo
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-pulse">
              <div className="h-12 bg-slate-200 rounded-xl mb-6"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-slate-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Tổng thu nhập"
            value={formatCurrency(stats.total_income)}
            trend={formatGrowth(stats.income_growth_rate)}
            trendUp={stats.income_growth_rate >= 0}
            icon="payments"
            colorClass="bg-green-50 text-green-600"
          />
          <StatCard
            label="Tổng chi phí"
            value={formatCurrency(stats.total_expense)}
            trend={formatGrowth(stats.expense_growth_rate)}
            trendUp={stats.expense_growth_rate < 0}
            icon="shopping_bag"
            colorClass="bg-orange-50 text-orange-600"
          />
          <StatCard
            label="Lợi nhuận ròng"
            value={formatCurrency(stats.net_profit)}
            trend={formatGrowth(stats.income_growth_rate - stats.expense_growth_rate)}
            trendUp={stats.net_profit >= 0}
            icon="account_balance_wallet"
            colorClass="bg-blue-50 text-blue-600"
          />
          <StatCard
            label="Đầu tư mùa vụ"
            value={formatCurrency(stats.total_season_investment)}
            trend={`${stats.active_seasons_count} vụ`}
            trendUp={true}
            icon="spa"
            colorClass="bg-purple-50 text-purple-600"
          />
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500">
          Không thể tải dữ liệu thống kê
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-lg font-black text-slate-900">Lịch sử dòng tiền</h3>
              <p className="text-sm text-slate-500">Thu nhập vs Chi phí (6 tháng qua)</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-[#13ec49]"></span>
                <span className="text-sm font-medium text-slate-600">Thu nhập</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-slate-800"></span>
                <span className="text-sm font-medium text-slate-600">Chi phí</span>
              </div>
            </div>
          </div>

          {loadingChart ? (
            <div className="h-72 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#13ec49]"></div>
            </div>
          ) : cashFlow.length > 0 ? (
            <div className="h-72 flex items-end justify-between gap-4">
              {cashFlow.map((d, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-3 group h-full justify-end">
                  <div className="w-full flex items-end justify-center gap-1.5 h-full relative">
                    <div
                      className="w-full max-w-[24px] bg-[#13ec49] rounded-t-lg transition-all group-hover:opacity-80 group-hover:shadow-[0_-8px_16px_rgba(19,236,73,0.2)]"
                      style={{ height: `${getChartHeight(d.total_income, maxCashFlowValue)}%` }}
                      title={`Thu nhập: ${formatCurrency(d.total_income)}`}
                    ></div>
                    <div
                      className="w-full max-w-[24px] bg-slate-800 rounded-t-lg transition-all group-hover:opacity-80"
                      style={{ height: `${getChartHeight(d.total_expense, maxCashFlowValue)}%` }}
                      title={`Chi phí: ${formatCurrency(d.total_expense)}`}
                    ></div>
                  </div>
                  <span className={`text-xs font-bold ${idx === cashFlow.length - 1 ? 'text-slate-900' : 'text-slate-400'}`}>
                    {d.month_label}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-slate-400">
              Không có dữ liệu
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-500">warning</span>
                Vật tư sắp hết
              </h3>
              {!loadingLowStock && lowStockItems.length > 0 && (
                <span className="bg-orange-100 text-orange-700 text-xs font-black px-2.5 py-1 rounded-full">
                  {lowStockItems.length}
                </span>
              )}
            </div>

            {loadingLowStock ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-xl animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : lowStockItems.length > 0 ? (
              <div className="space-y-3">
                {lowStockItems.map((item) => {
                  const colors = getUrgencyColor(item.urgency_level);
                  return (
                    <div key={item.item_id} className={`p-4 ${colors.bg} border-l-4 ${colors.border} rounded-r-xl`}>
                      <div className="flex justify-between items-start gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-slate-900 truncate">{item.item_name}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            Còn {item.current_quantity} {item.unit_of_measure}
                          </p>
                        </div>
                        <span className={`text-xs font-black px-2.5 py-1 rounded-full ${colors.badge} whitespace-nowrap`}>
                          {getUrgencyLabel(item.urgency_level)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm">
                Tất cả vật tư đều đủ
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex-1">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900">Nhân viên có số dư cao</h3>
            </div>

            {loadingTopWorkers ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2 animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-2 bg-slate-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : topWorkers.length > 0 ? (
              <div className="space-y-4">
                {topWorkers.map((worker) => {
                  const percentage = Number(worker.balance_percentage) || 0;
                  return (
                    <div key={worker.worker_id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-bold text-slate-700 truncate">{worker.worker_name}</span>
                        <span className="font-black text-slate-900 ml-2">{formatCurrency(worker.current_balance)}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full transition-all duration-1000 ${percentage >= 50 ? 'bg-[#13ec49]' :
                            percentage >= 20 ? 'bg-orange-400' :
                              'bg-red-500'
                            }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold text-right uppercase tracking-widest">
                        {percentage.toFixed(0)}% tổng số dư
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm">
                Không có dữ liệu nhân viên
              </div>
            )}
          </div>
        </div >
      </div >
    </div >
  );
};

export default Dashboard;
