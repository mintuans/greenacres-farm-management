
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Inventory: React.FC = () => {
  const navigate = useNavigate();

  const items = [
    { name: 'Phân Urea 46-0-0', sku: 'FRT-001', cat: 'Phân bón', stock: 85, qty: '850 kg', cost: '$0.45', status: 'Còn hàng' },
    { name: 'Thuốc trừ cỏ Roundup', sku: 'PST-024', cat: 'Thuốc BVTV', stock: 12, qty: '15 L', cost: '$22.00', status: 'Sắp hết' },
    { name: 'Thức ăn chăn nuôi Mix A', sku: 'FEED-103', cat: 'Thức ăn', stock: 45, qty: '450 kg', cost: '$0.85', status: 'Cần đặt thêm' },
    { name: 'Hệ thống ống tưới', sku: 'EQ-055', cat: 'Thiết bị', stock: 92, qty: '500 m', cost: '$1.20', status: 'Còn hàng' },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Quản lý kho vật tư</h1>
          <p className="text-slate-500 font-medium">Theo dõi phân bón, thuốc bảo vệ thực vật và thức ăn chăn nuôi.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-50 transition-all">
            <span className="material-symbols-outlined text-[20px]">file_upload</span>
            Nhập Excel
          </button>
          <button
            onClick={() => navigate('/inventory/add')}
            className="bg-[#13ec49] text-black px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-[#13ec49]/20 hover:scale-105 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            Thêm vật tư
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex justify-between items-center shadow-sm">
          <div>
            <p className="text-slate-500 text-sm font-bold">Tổng số mặt hàng</p>
            <h3 className="text-3xl font-black mt-1">142 <span className="text-xs font-black text-green-500 bg-green-50 px-2 py-0.5 rounded-full ml-2">+12%</span></h3>
          </div>
          <span className="material-symbols-outlined text-[#13ec49] text-3xl opacity-40">inventory_2</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex justify-between items-center shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] rotate-12">
            <span className="material-symbols-outlined text-[120px]">warning</span>
          </div>
          <div className="relative z-10">
            <p className="text-slate-500 text-sm font-bold">Cảnh báo hết hàng</p>
            <h3 className="text-3xl font-black mt-1 text-orange-600">3 <span className="text-xs font-black bg-orange-50 px-2 py-0.5 rounded-full ml-2">Cần xử lý</span></h3>
          </div>
          <span className="material-symbols-outlined text-orange-500 text-3xl opacity-40">report_problem</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex justify-between items-center shadow-sm">
          <div>
            <p className="text-slate-500 text-sm font-bold">Tổng giá trị tồn kho</p>
            <h3 className="text-3xl font-black mt-1">312.000.000đ <span className="text-xs font-black text-green-500 bg-green-50 px-2 py-0.5 rounded-full ml-2">+5%</span></h3>
          </div>
          <span className="material-symbols-outlined text-[#13ec49] text-3xl opacity-40">monetization_on</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
            <input type="text" className="w-full bg-slate-50 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#13ec49]/30 transition-all outline-none" placeholder="Tìm tên vật tư, SKU, danh mục..." />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
            <button className="bg-slate-100 text-slate-900 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap">Tất cả</button>
            <button className="text-slate-500 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap hover:bg-slate-50 transition-colors">Phân bón</button>
            <button className="text-slate-500 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap hover:bg-slate-50 transition-colors">Thuốc BVTV</button>
            <button className="text-slate-500 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap hover:bg-slate-50 transition-colors">Thức ăn</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase text-[10px] font-black tracking-widest">
              <tr>
                <th className="px-6 py-4 w-12"><input type="checkbox" className="rounded border-slate-300 text-[#13ec49] focus:ring-[#13ec49]" /></th>
                <th className="px-6 py-4">Tên vật tư</th>
                <th className="px-6 py-4">Danh mục</th>
                <th className="px-6 py-4">Mức tồn kho</th>
                <th className="px-6 py-4 text-right">Số lượng</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4"><input type="checkbox" className="rounded border-slate-300 text-[#13ec49] focus:ring-[#13ec49]" /></td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{item.name}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{item.sku}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-600 text-xs font-bold">{item.cat}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-1000 ${item.stock < 20 ? 'bg-red-500' : item.stock < 50 ? 'bg-orange-400' : 'bg-[#13ec49]'}`} style={{ width: `${item.stock}%` }}></div>
                      </div>
                      <span className="text-[10px] font-black text-slate-500">{item.stock}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-900">{item.qty}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${item.status === 'Còn hàng' ? 'bg-green-50 text-green-700 border-green-100' :
                      item.status === 'Sắp hết' ? 'bg-red-50 text-red-700 border-red-100' :
                        'bg-orange-50 text-orange-700 border-orange-100'
                      }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-slate-900 opacity-0 group-hover:opacity-100 transition-all">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
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

export default Inventory;
