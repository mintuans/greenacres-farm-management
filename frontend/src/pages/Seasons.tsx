
import React from 'react';

const Seasons: React.FC = () => {
  return (
    <div className="p-6 md:p-10 space-y-10 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#13ec49] text-xs font-black uppercase tracking-widest">
            <span className="material-symbols-outlined text-[18px]">home</span>
            Trang chủ / Mùa vụ
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Quản lý mùa vụ</h1>
          <p className="text-slate-500 text-lg max-w-xl">Theo dõi chu kỳ cây trồng, giám sát sức khỏe tài chính và truy cập báo cáo năng suất lịch sử.</p>
        </div>
        <button className="bg-[#13ec49] text-black px-8 py-4 rounded-2xl text-base font-black shadow-xl shadow-[#13ec49]/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
          <span className="material-symbols-outlined text-[24px]">add_circle</span>
          Bắt đầu vụ mới
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden group">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="size-16 rounded-2xl bg-[#13ec49]/10 flex items-center justify-center text-[#13ec49] group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-4xl">grass</span>
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">Lúa Đông Xuân 2024</h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="bg-green-100 text-green-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-green-600 animate-pulse"></span>
                  Đang diễn ra
                </span>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">• Bắt đầu 12/10/2023</span>
              </div>
            </div>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <button className="flex-1 md:flex-none bg-slate-50 text-slate-900 px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all">Ghi chú thu/chi</button>
            <button className="flex-1 md:flex-none bg-slate-900 text-white px-8 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all">Chi tiết</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-50">
          <div className="p-8 hover:bg-slate-50/50 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Dự kiến thu</p>
              <span className="material-symbols-outlined text-green-500 bg-green-50 p-1.5 rounded-full text-[18px]">trending_up</span>
            </div>
            <h3 className="text-3xl font-black text-slate-900">1.250.000.000đ</h3>
            <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mt-2">+12% dự kiến</p>
          </div>
          <div className="p-8 hover:bg-slate-50/50 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Đã chi đầu tư</p>
              <span className="material-symbols-outlined text-red-500 bg-red-50 p-1.5 rounded-full text-[18px]">trending_down</span>
            </div>
            <h3 className="text-3xl font-black text-slate-900">320.000.000đ</h3>
            <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mt-2">+5% so với vụ trước</p>
          </div>
          <div className="p-8 bg-[#13ec49]/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="material-symbols-outlined text-6xl">account_balance_wallet</span>
            </div>
            <div className="relative z-10">
              <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">Lợi nhuận ước tính</p>
              <h3 className="text-4xl font-black text-slate-900">930.000.000đ</h3>
              <div className="w-full bg-slate-200/50 rounded-full h-2 mt-4 overflow-hidden">
                <div className="bg-[#13ec49] h-2 rounded-full" style={{ width: '72%' }}></div>
              </div>
              <p className="text-[10px] font-bold text-slate-400 text-right mt-1.5 uppercase tracking-widest">72% mục tiêu</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-slate-900">Giao dịch gần đây</h3>
            <button className="text-[#13ec49] font-black text-sm uppercase tracking-widest hover:underline">Xem tất cả</button>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <th className="px-6 py-4">Ngày</th>
                  <th className="px-6 py-4">Nội dung</th>
                  <th className="px-6 py-4">Loại</th>
                  <th className="px-6 py-4 text-right">Số tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {[
                  { d: '24/10/2024', desc: 'Mua phân bón đợt 2', c: 'Đầu vào', a: '-32.000.000đ', neg: true },
                  { d: '22/10/2024', desc: 'Bán lúa thương phẩm đợt A', c: 'Doanh thu', a: '+125.000.000đ', neg: false },
                  { d: '18/10/2024', desc: 'Bảo trì máy gặt', c: 'Bảo trì', a: '-8.500.000đ', neg: true },
                ].map((t, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-5 text-slate-500 font-medium">{t.d}</td>
                    <td className="px-6 py-5 font-bold text-slate-900">{t.desc}</td>
                    <td className="px-6 py-5"><span className="bg-slate-100 px-2 py-1 rounded text-[10px] font-black uppercase text-slate-500">{t.c}</span></td>
                    <td className={`px-6 py-5 text-right font-black ${t.neg ? 'text-red-500' : 'text-green-600'}`}>{t.a}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-slate-900">Các vụ trước</h3>
            <button className="text-slate-400 hover:text-slate-900 transition-colors"><span className="material-symbols-outlined">filter_list</span></button>
          </div>
          <div className="space-y-4">
            {[
              { name: 'Ngô Hè Thu 2023', date: 'Th3 - Th9 2023', yield: '140 tấn', p: '+450tr', color: 'bg-yellow-100 text-yellow-700', icon: 'eco' },
              { name: 'Đỗ Xanh 2022', date: 'Th5 - Th11 2022', yield: '85 tấn', p: '+280tr', color: 'bg-green-100 text-green-700', icon: 'spa' },
            ].map((s, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-[#13ec49] transition-all cursor-pointer group">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`size-10 rounded-full flex items-center justify-center ${s.color}`}>
                    <span className="material-symbols-outlined">{s.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900">{s.name}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.date}</p>
                  </div>
                  <span className="material-symbols-outlined text-slate-300 group-hover:text-[#13ec49] transition-colors">download</span>
                </div>
                <div className="flex justify-between items-end border-t border-slate-50 pt-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sản lượng</p>
                    <p className="font-bold text-slate-800">{s.yield}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lợi nhuận</p>
                    <p className="text-lg font-black text-green-600">{s.p}</p>
                  </div>
                </div>
              </div>
            ))}
            <button className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 text-sm font-black uppercase tracking-widest hover:border-[#13ec49] hover:text-[#13ec49] transition-all">Xem tất cả lịch sử</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Seasons;
