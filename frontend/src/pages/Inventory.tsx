import React, { useState, useEffect, useRef } from 'react';
import { getInventory, getInventoryStats, createItem, updateItem, deleteItem, InventoryItem, bulkImportItems } from '../api/inventory.api';
import { getCategoryTree, Category } from '../api/category.api';
import { getMediaFiles, MediaFile } from '../services/media.service';
import { getMediaUrl } from '../services/products.service';

const Inventory: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState({ total_items: 0, low_stock_items: 0, total_value: 0 });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Media Selection State
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaLoading, setMediaLoading] = useState(false);

  // Custom Dropdown State
  const [showCatDropdown, setShowCatDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    inventory_code: '',
    inventory_name: '',
    category_id: '',
    unit_of_measure: '',
    stock_quantity: 0,
    min_stock_level: 0,
    last_import_price: 0,
    import_date: new Date().toISOString().split('T')[0], // Ngày nhập mặc định là hôm nay
    thumbnail_id: '',
    note: ''
  });

  useEffect(() => {
    fetchData();
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCatDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemsData, statsData, catsData] = await Promise.all([
        getInventory(),
        getInventoryStats(),
        getCategoryTree('FARM')
      ]);
      setItems(itemsData);
      setStats(statsData);
      setCategories(catsData);
    } catch (error) {
      console.error('Error fetching inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRandomSKU = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'SKU-';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const loadMedia = async () => {
    try {
      setMediaLoading(true);
      const response = await getMediaFiles({ category: 'product' });
      setMediaFiles(response.data);
    } catch (error) {
      console.error('Error loading media:', error);
    } finally {
      setMediaLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSave = {
        ...formData,
        last_import_price: formData.last_import_price || 0
      };

      if (editingItem) {
        await updateItem(editingItem.id, dataToSave);
      } else {
        await createItem(dataToSave);
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa vật tư này?')) {
      await deleteItem(id);
      fetchData();
    }
  };

  const handleExport = () => {
    const headers = ['SKU', 'Tên vật tư', 'Danh mục', 'Đơn vị tính', 'Số lượng', 'Mức tối thiểu', 'Giá nhập', 'Ngày nhập', 'Ghi chú'];
    const csvData = filteredItems.map(item => [
      item.inventory_code,
      item.inventory_name,
      item.category_name || '',
      item.unit_of_measure || '',
      item.stock_quantity,
      item.min_stock_level,
      item.last_import_price,
      item.import_date ? new Date(item.import_date).toLocaleDateString('vi-VN') : '',
      item.note || ''
    ]);

    const csvContent = [headers, ...csvData].map(row => row.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([`\ufeff${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `inventory_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').map(l => l.trim()).filter(l => l !== '');
        if (lines.length <= 1) return;

        const data = lines.slice(1).map(line => {
          // Simple CSV parser that handles quotes
          const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
          const row = matches ? matches.map(m => m.replace(/^"|"$/g, '')) : line.split(',');

          return {
            inventory_code: row[0] || generateRandomSKU(),
            inventory_name: row[1] || 'Vật tư mới',
            unit_of_measure: row[3] || 'Kg',
            stock_quantity: Number(row[4]) || 0,
            min_stock_level: Number(row[5]) || 0,
            last_import_price: Number(row[6]) || 0,
            import_date: new Date().toISOString(),
            note: row[8] || ''
          };
        });

        await bulkImportItems(data);
        alert(`Đã nhập thành công ${data.length} mặt hàng!`);
        fetchData();
      } catch (error) {
        console.error('Error importing data:', error);
        alert('Lỗi khi nhập dữ liệu. Vui lòng kiểm tra định dạng file CSV.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.stock_quantity <= 0) return { label: 'HẾT HÀNG', color: 'bg-red-100 text-red-700' };
    if (item.stock_quantity <= item.min_stock_level) return { label: 'SẮP HẾT', color: 'bg-orange-100 text-orange-700' };
    return { label: 'CÒN HÀNG', color: 'bg-emerald-100 text-emerald-700' };
  };

  const getProgressColor = (item: InventoryItem) => {
    const ratio = (item.stock_quantity / (Math.max(item.min_stock_level, 1) * 5)) * 100;
    if (ratio < 20) return 'bg-red-500';
    if (ratio < 50) return 'bg-orange-500';
    return 'bg-emerald-500';
  };

  const getSelectedCategoryName = () => {
    if (!formData.category_id) return '-- Không có danh mục --';
    const findInTree = (cats: Category[]): string | null => {
      for (const cat of cats) {
        if (cat.id === formData.category_id) return cat.category_name;
        if (cat.children) {
          const found = findInTree(cat.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findInTree(categories) || '-- Không có danh mục --';
  };

  const renderCategoryOptions = (cats: Category[], level = 0): React.ReactNode[] => {
    let options: React.ReactNode[] = [];
    cats.forEach(cat => {
      options.push(
        <button
          key={cat.id}
          type="button"
          onClick={() => {
            setFormData({ ...formData, category_id: cat.id });
            setShowCatDropdown(false);
          }}
          className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-all flex items-center gap-2 ${formData.category_id === cat.id ? 'bg-[#13ec49]/10 text-black font-bold' : 'text-slate-600'}`}
          style={{ paddingLeft: `${level * 20 + 16}px` }}
        >
          {level > 0 && <span className="text-slate-300">↳</span>}
          {cat.category_name}
        </button>
      );
      if (cat.children && cat.children.length > 0) {
        options = [...options, ...renderCategoryOptions(cat.children, level + 1)];
      }
    });
    return options;
  };

  const filteredItems = items.filter(item =>
    (item.inventory_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.inventory_code.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterCategory === '' || item.category_id === filterCategory)
  );

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1440px] mx-auto bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Quản lý kho vật tư
          </h1>
          <p className="text-slate-500 mt-2">Theo dõi phân bón, thuốc bảo vệ thực vật và thức ăn chăn nuôi.</p>
        </div>
        <div className="flex gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            className="hidden"
          />
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined font-bold">download</span>
            <span>Xuất Excel</span>
          </button>
          <button
            onClick={handleImportClick}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined font-bold">upload</span>
            <span>Nhập liệu</span>
          </button>
          <button
            onClick={() => {
              setEditingItem(null);
              setFormData({
                inventory_code: generateRandomSKU(), // Tự động tạo mã SKU khi nhấn thêm
                inventory_name: '', category_id: '',
                unit_of_measure: '', stock_quantity: 0, min_stock_level: 0,
                last_import_price: 0, import_date: new Date().toISOString().split('T')[0], thumbnail_id: '', note: ''
              });
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#13ec49] text-black font-bold rounded-xl hover:bg-[#10d63f] transition-all shadow-lg shadow-[#13ec49]/20"
          >
            <span className="material-symbols-outlined font-bold">add</span>
            <span>Thêm vật tư</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Tổng số mặt hàng', value: stats.total_items, icon: 'inventory_2', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Cảnh báo hết hàng', value: stats.low_stock_items, icon: 'warning', color: 'text-orange-600', bg: 'bg-orange-50', sub: 'Cần xử lý' },
          { label: 'Tổng giá trị tồn kho', value: formatVND(stats.total_value), icon: 'payments', color: 'text-emerald-600', bg: 'bg-emerald-50' }
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-all">
            <div className={`${s.bg} ${s.color} p-4 rounded-xl`}>
              <span className="material-symbols-outlined text-2xl">{s.icon}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{s.label}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-black text-slate-900">{s.value}</h3>
                {s.sub && <span className="text-xs font-bold text-orange-600">{s.sub}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              type="text"
              placeholder="Tìm tên vật tư, SKU, danh mục..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13ec49]/30 outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Sản phẩm</th>
                <th className="px-6 py-4">Danh mục</th>
                <th className="px-6 py-4">Số lượng</th>
                <th className="px-6 py-4">Giá nhập</th>
                <th className="px-6 py-4">Ngày nhập</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => {
                const status = getStockStatus(item);
                const progress = Math.min((item.stock_quantity / (Math.max(item.min_stock_level, 1) * 5)) * 100, 100);
                return (
                  <tr key={item.id} className="group hover:bg-slate-50/80 transition-all">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center border border-slate-200">
                          {item.thumbnail_id ? (
                            <img
                              src={getMediaUrl(item.thumbnail_id)}
                              alt={item.inventory_name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'https://placehold.co/100x100?text=Vật+Tư';
                              }}
                            />
                          ) : (
                            <span className="material-symbols-outlined text-slate-400">inventory_2</span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{item.inventory_name}</p>
                          <p className="text-xs text-slate-400 font-mono">{item.inventory_code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold uppercase">
                        {item.category_name || 'Khác'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-baseline gap-1">
                          <span className="font-black text-slate-900">{item.stock_quantity}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">{item.unit_of_measure || 'đv'}</span>
                        </div>
                        <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full transition-all ${getProgressColor(item)}`} style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{formatVND(item.last_import_price)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600">
                        {item.import_date ? new Date(item.import_date).toLocaleDateString('vi-VN') : '-'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setFormData({
                              inventory_code: item.inventory_code,
                              inventory_name: item.inventory_name,
                              category_id: item.category_id || '',
                              unit_of_measure: item.unit_of_measure || '',
                              stock_quantity: item.stock_quantity,
                              min_stock_level: item.min_stock_level,
                              last_import_price: item.last_import_price || 0,
                              import_date: item.import_date ? new Date(item.import_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                              thumbnail_id: item.thumbnail_id || '',
                              note: item.note || ''
                            });
                            setShowModal(true);
                          }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl animate-in fade-in zoom-in duration-200 my-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-900">
                {editingItem ? 'Cập nhật vật tư' : 'Thêm vật tư mới'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image Picker */}
              <div className="col-span-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50 hover:border-[#13ec49]/50 transition-all cursor-pointer group"
                onClick={() => {
                  setShowMediaPicker(true);
                  loadMedia();
                }}
              >
                {formData.thumbnail_id ? (
                  <div className="relative group">
                    <img
                      src={getMediaUrl(formData.thumbnail_id)}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-2xl shadow-lg"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                      <span className="text-white text-xs font-bold uppercase tracking-widest">Thay đổi</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-[#13ec49]">
                    <span className="material-symbols-outlined text-4xl">add_photo_alternate</span>
                    <p className="text-sm font-bold uppercase tracking-wider">Chọn hình ảnh</p>
                  </div>
                )}
              </div>

              <div className="col-span-full">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Tên vật tư</label>
                <input
                  required
                  value={formData.inventory_name}
                  onChange={e => setFormData({ ...formData, inventory_name: e.target.value })}
                  className="w-full bg-slate-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#13ec49]/30 outline-none font-bold"
                  placeholder="Ví dụ: Phân bón NPK 20-20-15"
                />
              </div>

              <div className="relative" ref={dropdownRef}>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Danh mục</label>
                <div
                  onClick={() => setShowCatDropdown(!showCatDropdown)}
                  className="w-full bg-slate-50 rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer border-2 border-transparent hover:border-[#13ec49]/30 transition-all"
                >
                  <span className={`text-sm ${formData.category_id ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                    {getSelectedCategoryName()}
                  </span>
                  <span className={`material-symbols-outlined text-slate-400 transition-transform ${showCatDropdown ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </div>
                {showCatDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[60] max-h-60 overflow-y-auto py-2 animate-in slide-in-from-top-2 duration-200">
                    {renderCategoryOptions(categories)}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Mã SKU</label>
                <div className="flex gap-2">
                  <input
                    required
                    value={formData.inventory_code}
                    onChange={e => setFormData({ ...formData, inventory_code: e.target.value })}
                    className="flex-1 bg-slate-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#13ec49]/30 outline-none font-mono"
                    placeholder="SKU-001"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, inventory_code: generateRandomSKU() })}
                    className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200"
                    title="Tạo mã mới"
                  >
                    <span className="material-symbols-outlined">autorenew</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Giá nhập (VNĐ)</label>
                <input
                  type="number"
                  value={formData.last_import_price}
                  onChange={e => setFormData({ ...formData, last_import_price: Number(e.target.value) })}
                  className="w-full bg-slate-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#13ec49]/30 outline-none font-black text-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Đơn vị tính</label>
                <select
                  value={formData.unit_of_measure}
                  onChange={e => setFormData({ ...formData, unit_of_measure: e.target.value })}
                  className="w-full bg-slate-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#13ec49]/30 outline-none appearance-none font-bold"
                >
                  <option value="">-- Chọn đơn vị --</option>
                  {['Kg', 'Bao', 'Chai', 'Lít', 'Gói', 'Tấn', 'Thùng', 'Túi', 'Mét', 'Cuộn', 'Hộp', 'Viên'].map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Tồn kho hiện tại</label>
                <input
                  type="number"
                  value={formData.stock_quantity}
                  onChange={e => setFormData({ ...formData, stock_quantity: Number(e.target.value) })}
                  className="w-full bg-slate-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#13ec49]/30 outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Mức tối thiểu</label>
                <input
                  type="number"
                  value={formData.min_stock_level}
                  onChange={e => setFormData({ ...formData, min_stock_level: Number(e.target.value) })}
                  className="w-full bg-slate-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#13ec49]/30 outline-none font-bold text-orange-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Ngày nhập</label>
                <input
                  type="date"
                  value={formData.import_date}
                  onChange={e => setFormData({ ...formData, import_date: e.target.value })}
                  className="w-full bg-slate-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#13ec49]/30 outline-none font-bold"
                />
              </div>

              <div className="col-span-full flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-slate-900 text-white font-black rounded-xl hover:bg-black active:scale-95 transition-all shadow-lg"
                >
                  {editingItem ? 'Lưu thay đổi' : 'Tạo vật tư'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      {showMediaPicker && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-3xl p-8 max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined">perm_media</span>
                Thư viện hình ảnh
              </h3>
              <button onClick={() => setShowMediaPicker(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {mediaLoading ? (
              <div className="flex-1 flex items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-[#13ec49] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : mediaFiles.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400 italic">
                <span className="material-symbols-outlined text-6xl mb-4">image_not_supported</span>
                <p>Bạn chưa có ảnh nào trong thư viện (phần Product)</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {mediaFiles.map((file) => (
                    <div
                      key={file.id}
                      onClick={() => {
                        setFormData({ ...formData, thumbnail_id: file.id });
                        setShowMediaPicker(false);
                      }}
                      className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-4 transition-all hover:scale-105 ${formData.thumbnail_id === file.id ? 'border-[#13ec49]' : 'border-transparent hover:border-slate-100'}`}
                    >
                      <img
                        src={getMediaUrl(file.id)}
                        alt={file.image_name}
                        className="w-full h-full object-cover"
                      />
                      {formData.thumbnail_id === file.id && (
                        <div className="absolute inset-0 bg-[#13ec49]/20 flex items-center justify-center">
                          <span className="material-symbols-outlined text-white text-4xl drop-shadow-lg">check_circle</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setShowMediaPicker(false)}
                className="px-10 py-3 bg-slate-900 text-white font-black rounded-xl hover:bg-black transition-all"
              >
                Xong
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
