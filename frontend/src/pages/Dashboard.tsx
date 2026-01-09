
import React from 'react';

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
  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Tổng quan trang trại</h2>
          <div className="flex items-center gap-2 mt-1 text-slate-500 text-sm">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            <span>01 Tháng 10 - 31 Tháng 10, 2024</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:bg-slate-50 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">file_download</span>
            Xuất báo cáo
          </button>
          <button className="bg-[#13ec49] text-black px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-[#13ec49]/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            Thêm bản ghi
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Tổng thu nhập" value="310.000.000đ" trend="12%" trendUp={true} icon="payments" colorClass="bg-green-50 text-green-600" />
        <StatCard label="Tổng chi phí" value="208.000.000đ" trend="5%" trendUp={false} icon="shopping_bag" colorClass="bg-orange-50 text-orange-600" />
        <StatCard label="Lợi nhuận ròng" value="102.000.000đ" trend="22%" trendUp={true} icon="account_balance_wallet" colorClass="bg-blue-50 text-blue-600" />
        <StatCard label="Đầu tư mùa vụ" value="1.125.000.000đ" trend="0%" trendUp={true} icon="spa" colorClass="bg-purple-50 text-purple-600" />
      </div>

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

          <div className="h-72 flex items-end justify-between gap-4">
            {[
              { m: 'Th5', i: 40, e: 30 },
              { m: 'Th6', i: 55, e: 45 },
              { m: 'Th7', i: 70, e: 35 },
              { m: 'Th8', i: 45, e: 50 },
              { m: 'Th9', i: 85, e: 40 },
              { m: 'Th10', i: 95, e: 60 }
            ].map((d, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-3 group h-full justify-end">
                <div className="w-full flex items-end justify-center gap-1.5 h-full relative">
                  <div
                    className="w-full max-w-[24px] bg-[#13ec49] rounded-t-lg transition-all group-hover:opacity-80 group-hover:shadow-[0_-8px_16px_rgba(19,236,73,0.2)]"
                    style={{ height: `${d.i}%` }}
                  ></div>
                  <div
                    className="w-full max-w-[24px] bg-slate-800 rounded-t-lg transition-all group-hover:opacity-80"
                    style={{ height: `${d.e}%` }}
                  ></div>
                </div>
                <span className={`text-xs font-bold ${idx === 5 ? 'text-slate-900' : 'text-slate-400'}`}>{d.m}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-500">warning</span>
                Việc cần làm ngay
              </h3>
              <span className="bg-orange-100 text-orange-700 text-xs font-black px-2.5 py-1 rounded-full">2 Mới</span>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex justify-between items-center group">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900">Nợ quá hạn thanh toán</p>
                  <p className="text-xs text-slate-500 mt-1 truncate">Tiền trả góp máy cày ($500) đã quá hạn.</p>
                </div>
                <button className="text-xs font-black text-red-600 uppercase tracking-widest hover:underline ml-4">Trả ngay</button>
              </div>
              <div className="p-4 bg-orange-50 border-l-4 border-orange-400 rounded-r-xl flex justify-between items-center">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900">Vật tư sắp hết</p>
                  <p className="text-xs text-slate-500 mt-1 truncate">Phân bón NPK 20-20-20 chỉ còn 5 bao.</p>
                </div>
                <button className="text-xs font-black text-orange-600 uppercase tracking-widest hover:underline ml-4">Đặt mua</button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex-1">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900">Các khoản nợ lớn</h3>
              <button className="text-[#13ec49] font-bold text-sm hover:underline">Xem tất cả</button>
            </div>
            <div className="space-y-6">
              {[
                { name: 'Ngân hàng NN & PTNT', val: '310.000.000đ', p: 65, c: 'bg-[#13ec49]' },
                { name: 'Đại lý phân bón Tám', val: '125.000.000đ', p: 25, c: 'bg-orange-400' },
                { name: 'Cửa hàng hạt giống Hoa', val: '21.000.000đ', p: 5, c: 'bg-red-500' }
              ].map((debt, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-slate-700">{debt.name}</span>
                    <span className="font-black text-slate-900">{debt.val}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div className={`${debt.c} h-2.5 rounded-full transition-all duration-1000`} style={{ width: `${debt.p}%` }}></div>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold text-right uppercase tracking-widest">Đã trả {debt.p}%</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
