import React, { useState, useEffect, useRef } from 'react';
import { getInventory, getInventoryStats, createItem, updateItem, deleteItem, InventoryItem, bulkImportItems } from '../api/inventory.api';
import { getCategoryTree, Category } from '../api/category.api';
import { getMediaFiles, MediaFile } from '../services/media.service';
import { getMediaUrl } from '../services/products.service';
import { ActionToolbar, ConfirmDeleteModal, ImportDataModal } from '../components';
import { useTranslation } from 'react-i18next';

const Inventory: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState({ total_items: 0, low_stock_items: 0, total_value: 0 });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<InventoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const { t, i18n } = useTranslation();

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
      setIsViewOnly(false);
      fetchData();
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      await deleteItem(id);
      setDeleteTarget(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert(t('inventory.messages.delete_error'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExport = () => {
    const headers = t('inventory.import.columns', { returnObjects: true }) as string[];
    const csvData = filteredItems.map(item => [
      item.inventory_code,
      item.inventory_name,
      item.category_name || '',
      item.unit_of_measure || '',
      item.stock_quantity,
      item.min_stock_level,
      item.last_import_price,
      item.import_date ? new Date(item.import_date).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US') : '',
      item.note || ''
    ]);

    const csvContent = [headers, ...csvData].map(row => row.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([`\ufeff${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `inventory_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const downloadTemplate = () => {
    const csv = [
      (t('inventory.import.columns', { returnObjects: true }) as string[]).join(','),
      'VT-001,Phân bón NPK,Phân bón,Kg,100,20,50000,2024-01-01,Mẫu vật tư',
    ].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = t('inventory.import.entity_name') + '_template.csv';
    link.click();
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setIsViewOnly(false);
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
  };

  const handleViewItem = (item: InventoryItem) => {
    setEditingItem(item);
    setIsViewOnly(true);
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
  };

  const handleImport = async (file: File) => {
    const reader = new FileReader();
    return new Promise<void>((resolve, reject) => {
      reader.onload = async (event) => {
        try {
          const text = event.target?.result as string;
          const lines = text.split('\n').map(l => l.trim()).filter(l => l !== '');
          if (lines.length <= 1) {
            resolve();
            return;
          }

          const data = lines.slice(1).map(line => {
            const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
            const row = matches ? matches.map(m => m.replace(/^"|"$/g, '')) : line.split(',');

            return {
              inventory_code: row[0] || generateRandomSKU(),
              inventory_name: row[1] || t('inventory.messages.new_item'),
              unit_of_measure: row[3] || 'Kg',
              stock_quantity: Number(row[4]) || 0,
              min_stock_level: Number(row[5]) || 0,
              last_import_price: Number(row[6]) || 0,
              import_date: new Date().toISOString(),
              note: row[8] || ''
            };
          });

          await bulkImportItems(data);
          alert(t('inventory.import.success', { count: data.length }));
          fetchData();
          resolve();
        } catch (error) {
          console.error('Error importing data:', error);
          reject(new Error(t('inventory.import.error')));
        }
      };
      reader.onerror = () => reject(new Error(t('inventory.import.read_error')));
      reader.readAsText(file);
    });
  };

  const handleImportClick = () => {
    setShowImportModal(true);
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
            inventory_name: row[1] || t('inventory.messages.new_item'),
            unit_of_measure: row[3] || 'Kg',
            stock_quantity: Number(row[4]) || 0,
            min_stock_level: Number(row[5]) || 0,
            last_import_price: Number(row[6]) || 0,
            import_date: new Date().toISOString(),
            note: row[8] || ''
          };
        });

        await bulkImportItems(data);
        alert(t('inventory.import.success', { count: data.length }));
        fetchData();
      } catch (error) {
        console.error('Error importing data:', error);
        alert(t('inventory.import.error'));
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat(i18n.language === 'vi' ? 'vi-VN' : 'en-US', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.stock_quantity <= 0) return { label: t('inventory.stock_status.out_of_stock'), color: 'bg-red-100 text-red-700' };
    if (item.stock_quantity <= item.min_stock_level) return { label: t('inventory.stock_status.low_stock'), color: 'bg-orange-100 text-orange-700' };
    return { label: t('inventory.stock_status.in_stock'), color: 'bg-emerald-100 text-emerald-700' };
  };

  const getProgressColor = (item: InventoryItem) => {
    const ratio = (item.stock_quantity / (Math.max(item.min_stock_level, 1) * 5)) * 100;
    if (ratio < 20) return 'bg-red-500';
    if (ratio < 50) return 'bg-orange-500';
    return 'bg-emerald-500';
  };

  const getSelectedCategoryName = () => {
    if (!formData.category_id) return '-- ' + t('inventory.table.category') + ' --';
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
    return findInTree(categories) || '-- ' + t('inventory.table.category') + ' --';
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
    <div className="p-3 md:p-4 space-y-4 w-full bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
          {t('inventory.title')}
        </h1>
        <p className="text-slate-500 mt-1 text-sm">{t('inventory.subtitle')}</p>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv"
        className="hidden"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
        {[
          { label: t('inventory.stats.total_items'), value: stats.total_items, icon: 'inventory_2', color: 'text-blue-600', bg: 'bg-blue-50', fullWidth: false },
          { label: t('inventory.stats.low_stock'), value: stats.low_stock_items, icon: 'warning', color: 'text-orange-600', bg: 'bg-orange-50', sub: t('inventory.stats.action_needed'), fullWidth: false },
          { label: t('inventory.stats.total_value'), value: formatVND(stats.total_value), icon: 'payments', color: 'text-emerald-600', bg: 'bg-emerald-50', fullWidth: true }
        ].map((s, i) => (
          <div key={i} className={`bg-white p-3 md:p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 md:gap-4 hover:shadow-md transition-all ${s.fullWidth ? 'col-span-2 md:col-span-1' : ''}`}>
            <div className={`${s.bg} ${s.color} p-2 md:p-3 rounded-xl shrink-0`}>
              <span className="material-symbols-outlined text-lg md:text-xl">{s.icon}</span>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] md:text-xs font-medium text-slate-500 leading-tight">{s.label}</p>
              <div className="flex items-baseline gap-1 md:gap-2 flex-wrap">
                <h3 className="text-base md:text-lg font-black text-slate-900">{s.value}</h3>
                {s.sub && <span className="text-[9px] md:text-[10px] font-bold text-orange-600">{s.sub}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="p-3 md:p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative w-full sm:w-72 md:w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              type="text"
              placeholder={t('inventory.search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13ec49]/30 outline-none transition-all text-sm"
            />
          </div>
          <ActionToolbar
            onAdd={() => {
              setEditingItem(null);
              setIsViewOnly(false);
              setFormData({
                inventory_code: generateRandomSKU(),
                inventory_name: '', category_id: '',
                unit_of_measure: '', stock_quantity: 0, min_stock_level: 0,
                last_import_price: 0, import_date: new Date().toISOString().split('T')[0], thumbnail_id: '', note: ''
              });
              setShowModal(true);
            }}
            addLabel={t('inventory.add_btn')}
            onEdit={() => selectedItem && handleEditItem(selectedItem)}
            editDisabled={!selectedItem}
            onDelete={() => selectedItem && setDeleteTarget(selectedItem)}
            deleteDisabled={!selectedItem}
            onRefresh={fetchData}
            isRefreshing={loading}
            onExport={handleExport}
            onImport={() => setShowImportModal(true)}
            onDownloadTemplate={downloadTemplate}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
              <tr>
                <th className="px-4 py-3">{t('inventory.table.product')}</th>
                <th className="px-4 py-3 min-w-[120px]">{t('inventory.table.category')}</th>
                <th className="px-4 py-3">{t('inventory.table.quantity')}</th>
                <th className="px-4 py-3">{t('inventory.table.price')}</th>
                <th className="px-4 py-3">{t('inventory.table.date')}</th>
                <th className="px-4 py-3">{t('inventory.table.status')}</th>
                <th className="px-4 py-3 text-right">{t('inventory.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => {
                const status = getStockStatus(item);
                const progress = Math.min((item.stock_quantity / (Math.max(item.min_stock_level, 1) * 5)) * 100, 100);
                return (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedItem(prev => prev?.id === item.id ? null : item)}
                    className={`group transition-all cursor-pointer ${selectedItem?.id === item.id ? 'bg-[#13ec49]/5 ring-1 ring-inset ring-[#13ec49]/20' : 'hover:bg-slate-50/80'}`}
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center border border-slate-200">
                          {item.thumbnail_id ? (
                            <img
                              src={getMediaUrl(item.thumbnail_id)}
                              alt={item.inventory_name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.currentTarget;
                                if (target.getAttribute('data-error-handled')) return;
                                target.setAttribute('data-error-handled', 'true');
                                target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22100%22%20height%3D%22100%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%20preserveAspectRatio%3D%22none%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23eee%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20fill%3D%22%23aaa%22%20dy%3D%22.3em%22%20font-family%3D%22Arial%2C%20sans-serif%22%20font-size%3D%2210%22%20text-anchor%3D%22middle%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E';
                              }}
                            />
                          ) : (
                            <span className="material-symbols-outlined text-slate-400 text-[20px]">inventory_2</span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{item.inventory_name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{item.inventory_code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold uppercase border border-blue-100 whitespace-nowrap">
                        {item.category_name || t('inventory.table.category')}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-baseline gap-1">
                          <span className="font-black text-slate-900 text-sm">{item.stock_quantity}</span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase">{item.unit_of_measure || 'đv'}</span>
                        </div>
                        <div className="h-1 w-20 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full transition-all ${getProgressColor(item)}`} style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <p className="font-bold text-slate-900 text-sm">{formatVND(item.last_import_price)}</p>
                    </td>
                    <td className="px-4 py-2.5">
                      <p className="text-[13px] text-slate-600">
                        {item.import_date ? new Date(item.import_date).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US') : '-'}
                      </p>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleViewItem(item); }}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEditItem(item); }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget(item); }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
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

      <ConfirmDeleteModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
        isDeleting={isDeleting}
        itemName={deleteTarget?.inventory_name}
      />

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl animate-in fade-in zoom-in duration-200 my-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-900">
                {isViewOnly ? t('inventory.modal.view_title') : editingItem ? t('inventory.modal.edit_title') : t('inventory.modal.add_title')}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image Picker */}
              <div className={`col-span-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50 hover:border-[#13ec49]/50 transition-all cursor-pointer group ${isViewOnly ? 'opacity-80 pointer-events-none' : ''}`}
                onClick={() => {
                  if (!isViewOnly) {
                    setShowMediaPicker(true);
                    loadMedia();
                  }
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
                      <span className="text-white text-xs font-bold uppercase tracking-widest">{t('inventory.modal.change_image')}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-[#13ec49]">
                    <span className="material-symbols-outlined text-4xl">add_photo_alternate</span>
                    <p className="text-sm font-bold uppercase tracking-wider">{t('inventory.modal.select_image')}</p>
                  </div>
                )}
              </div>

              <div className="col-span-full">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">{t('inventory.modal.item_name')}</label>
                <input
                  required
                  disabled={isViewOnly}
                  value={formData.inventory_name}
                  onChange={e => setFormData({ ...formData, inventory_name: e.target.value })}
                  className="w-full bg-slate-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#13ec49]/30 outline-none font-bold disabled:bg-slate-50 disabled:text-slate-500"
                  placeholder="Ví dụ: Phân bón NPK 20-20-15"
                />
              </div>

              <div className="relative" ref={dropdownRef}>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">{t('inventory.table.category')}</label>
                <div
                  onClick={() => !isViewOnly && setShowCatDropdown(!showCatDropdown)}
                  className={`w-full bg-slate-50 rounded-xl px-4 py-3 flex items-center justify-between transition-all border-2 border-transparent ${isViewOnly ? 'cursor-default' : 'cursor-pointer hover:border-[#13ec49]/30'}`}
                >
                  <span className={`text-sm ${formData.category_id ? 'text-slate-900 font-bold' : 'text-slate-400'} ${isViewOnly ? 'text-slate-500' : ''}`}>
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
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">{t('inventory.modal.sku')}</label>
                <div className="flex gap-2">
                  <input
                    required
                    disabled={isViewOnly}
                    value={formData.inventory_code}
                    onChange={e => setFormData({ ...formData, inventory_code: e.target.value })}
                    className="flex-1 bg-slate-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#13ec49]/30 outline-none font-mono disabled:text-slate-500"
                    placeholder="SKU-001"
                  />
                  {!isViewOnly && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, inventory_code: generateRandomSKU() })}
                      className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200"
                      title={t('inventory.modal.gen_code')}
                    >
                      <span className="material-symbols-outlined">autorenew</span>
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">{t('inventory.modal.import_price')}</label>
                <input
                  type="number"
                  disabled={isViewOnly}
                  value={formData.last_import_price}
                  onChange={e => setFormData({ ...formData, last_import_price: Number(e.target.value) })}
                  className="w-full bg-slate-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#13ec49]/30 outline-none font-black text-emerald-600 disabled:opacity-70"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">{t('inventory.modal.unit')}</label>
                <select
                  disabled={isViewOnly}
                  value={formData.unit_of_measure}
                  onChange={e => setFormData({ ...formData, unit_of_measure: e.target.value })}
                  className="w-full bg-slate-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#13ec49]/30 outline-none appearance-none font-bold disabled:text-slate-500"
                >
                  <option value="">{t('inventory.modal.select_unit')}</option>
                  {['Kg', 'Bao', 'Chai', 'Lít', 'Gói', 'Tấn', 'Thùng', 'Túi', 'Mét', 'Cuộn', 'Hộp', 'Viên'].map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">{t('inventory.modal.current_stock')}</label>
                <input
                  type="number"
                  disabled={isViewOnly}
                  value={formData.stock_quantity}
                  onChange={e => setFormData({ ...formData, stock_quantity: Number(e.target.value) })}
                  className="w-full bg-slate-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#13ec49]/30 outline-none font-bold disabled:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">{t('inventory.modal.min_stock')}</label>
                <input
                  type="number"
                  disabled={isViewOnly}
                  value={formData.min_stock_level}
                  onChange={e => setFormData({ ...formData, min_stock_level: Number(e.target.value) })}
                  className="w-full bg-slate-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#13ec49]/30 outline-none font-bold text-orange-600 disabled:opacity-70"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">{t('inventory.modal.import_date')}</label>
                <input
                  type="date"
                  disabled={isViewOnly}
                  value={formData.import_date}
                  onChange={e => setFormData({ ...formData, import_date: e.target.value })}
                  className="w-full bg-slate-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#13ec49]/30 outline-none font-bold disabled:text-slate-500"
                />
              </div>

              <div className="col-span-full flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={`px-6 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-all ${isViewOnly ? 'w-full bg-slate-900 text-white hover:bg-black font-black' : ''}`}
                >
                  {isViewOnly ? t('inventory.modal.close') : t('inventory.modal.cancel')}
                </button>
                {!isViewOnly && (
                  <button
                    type="submit"
                    className="px-8 py-3 bg-slate-900 text-white font-black rounded-xl hover:bg-black active:scale-95 transition-all shadow-lg"
                  >
                    {editingItem ? t('inventory.modal.save') : t('inventory.modal.create')}
                  </button>
                )}
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
                {t('inventory.media.title')}
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
                <p>{t('inventory.media.empty')}</p>
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
                {t('inventory.media.done')}
              </button>
            </div>
          </div>
        </div>
      )}
      <ImportDataModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
        entityName={t('inventory.import.entity_name')}
        columnGuide={t('inventory.import.columns', { returnObjects: true }) as string[]}
        onDownloadTemplate={downloadTemplate}
      />
    </div>
  );
};

export default Inventory;
