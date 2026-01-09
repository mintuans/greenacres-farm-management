
import React from 'react';

const Transactions: React.FC = () => {
  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Sổ nhật ký giao dịch</h1>
          <p className="text-slate-500 font-medium">Quản lý thu nhập và chi phí hàng ngày của trang trại.</p>
        </div>
        <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm shrink-0">
          <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><span className="material-symbols-outlined">chevron_left</span></button>
          <div className="px-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-[#13ec49]">calendar_month</span>
            <span className="text-sm font-bold text-slate-900">Tháng 10, 2024</span>
          </div>
          <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><span className="material-symbols-outlined">chevron_right</span></button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { l: 'Tổng thu', v: '125.450.000đ', t: '+15%', c: 'bg-green-50 text-green-700', i: 'payments' },
          { l: 'Tổng chi', v: '42.000.000đ', t: '+2%', c: 'bg-red-50 text-red-700', i: 'shopping_cart' },
          { l: 'Lợi nhuận', v: '83.450.000đ', t: '+12%', c: 'bg-blue-50 text-blue-700', i: 'savings' }
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${s.c}`}><span className="material-symbols-outlined text-[20px]">{s.i}</span></div>
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest">{s.l}</p>
            </div>
            <h3 className="text-3xl font-black text-slate-900">{s.v}</h3>
            <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${s.c.includes('green') ? 'text-green-600' : s.c.includes('red') ? 'text-red-600' : 'text-blue-600'}`}>
              {s.t} so với tháng trước
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button className="bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 border border-slate-200 uppercase tracking-widest">
              <span className="material-symbols-outlined text-[18px]">filter_list</span> Lọc dữ liệu
            </button>
            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
              <button className="bg-white text-[#13ec49] text-[10px] font-black px-4 py-2 rounded-lg shadow-sm uppercase tracking-widest">Tất cả</button>
              <button className="text-slate-400 text-[10px] font-black px-4 py-2 uppercase tracking-widest hover:text-slate-600">Thu vào</button>
              <button className="text-slate-400 text-[10px] font-black px-4 py-2 uppercase tracking-widest hover:text-slate-600">Chi ra</button>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all uppercase tracking-widest">Xuất file</button>
            <button className="flex-1 md:flex-none bg-[#13ec49] text-black px-6 py-2 rounded-xl text-xs font-black shadow-lg shadow-[#13ec49]/20 transition-all uppercase tracking-widest">Thêm mới</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                <th className="px-6 py-4 w-12 text-center"><input type="checkbox" className="rounded border-slate-300 text-[#13ec49] focus:ring-[#13ec49]" /></th>
                <th className="px-6 py-4">Ngày</th>
                <th className="px-6 py-4">Mô tả giao dịch</th>
                <th className="px-6 py-4">Phân loại</th>
                <th className="px-6 py-4 text-right">Số tiền</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {[
                { d: '24/10/2024', desc: 'Bán lúa đợt 1', sub: 'Hóa đơn #INV-2024-001', cat: 'Bán nông sản', catC: 'bg-amber-50 text-amber-700', a: '+50.000.000đ', neg: false, s: 'Đã hoàn thành' },
                { d: '22/10/2024', desc: 'Mua phân bón NPK', sub: 'Đại lý vật tư Tám', cat: 'Phân bón', catC: 'bg-purple-50 text-purple-700', a: '-4.500.000đ', neg: true, s: 'Đã hoàn thành' },
                { d: '20/10/2024', desc: 'Tiền nhân công thu hoạch', sub: 'Toán nhân công ngoài', cat: 'Nhân công', catC: 'bg-blue-50 text-blue-700', a: '-12.000.000đ', neg: true, s: 'Đã hoàn thành' },
                { d: '18/10/2024', desc: 'Trợ cấp nông nghiệp Q3', sub: 'Kho bạc nhà nước', cat: 'Hỗ trợ', catC: 'bg-slate-50 text-slate-700', a: '+21.000.000đ', neg: false, s: 'Đã hoàn thành' },
              ].map((t, i) => (
                <tr key={i} className="hover:bg-[#13ec49]/5 transition-colors group cursor-pointer">
                  <td className="px-6 py-5 text-center"><input type="checkbox" className="rounded border-slate-300 text-[#13ec49] focus:ring-[#13ec49]" /></td>
                  <td className="px-6 py-5 text-slate-400 font-bold">{t.d}</td>
                  <td className="px-6 py-5">
                    <div className="font-black text-slate-900">{t.desc}</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-tight">{t.sub}</div>
                  </td>
                  <td className="px-6 py-5"><span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${t.catC}`}>{t.cat}</span></td>
                  <td className={`px-6 py-5 text-right font-black ${t.neg ? 'text-red-500' : 'text-green-600'}`}>{t.a}</td>
                  <td className="px-6 py-5 text-center">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide">Hoàn tất</span>
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

export default Transactions;
