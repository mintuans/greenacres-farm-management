import React, { useState, useEffect, useRef } from 'react';
import { getTransactions, Transaction, createTransaction } from '../api/transaction-solid.api';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { getSeasons, Season } from '../api/season-solid.api';
import { getCategories, Category } from '../api/category.api';
import { getPartners, Partner } from '../api/partner-solid.api';

// --- CustomSelect Component (Premium Style) ---
interface CustomSelectProps {
  label: string;
  value: string;
  options: { id: string; name: string }[];
  onChange: (value: string) => void;
  placeholder: string;
  icon?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ label, value, options, onChange, placeholder, icon = 'stat_0' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(opt => opt.id === value);

  useEffect(() => {
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
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">{label}</label>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-slate-50 rounded-2xl px-6 py-4 flex items-center justify-between cursor-pointer border-2 transition-all ${isOpen ? 'border-[#13ec49] bg-white ring-4 ring-[#13ec49]/10' : 'border-transparent hover:bg-slate-100'}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="material-symbols-outlined text-slate-400 text-[20px] shrink-0">{icon}</span>
          <span className={`font-bold truncate ${selectedOption ? 'text-slate-900' : 'text-slate-400'}`}>
            {selectedOption ? selectedOption.name : placeholder}
          </span>
        </div>
        <span className={`material-symbols-outlined text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-60 overflow-y-auto p-2 custom-scrollbar">
            {options.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-xs font-bold italic">Không có dữ liệu</div>
            ) : (
              options.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between px-5 py-3.5 rounded-2xl cursor-pointer transition-all mb-1 ${value === opt.id ? 'bg-[#13ec49]/10 text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <span className="font-bold text-sm">{opt.name}</span>
                  {value === opt.id && <span className="material-symbols-outlined text-[#13ec49] text-[20px]">check_circle</span>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');

  // Month filtering state
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const monthPickerRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    partner_id: '',
    season_id: '',
    category_id: '',
    amount: 0,
    paid_amount: 0,
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    transaction_date: new Date().toISOString().split('T')[0],
    note: '',
    is_inventory_affected: false
  });

  useEffect(() => {
    fetchData();
    loadMetadata();
  }, [currentMonth, currentYear]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (monthPickerRef.current && !monthPickerRef.current.contains(event.target as Node)) {
        setShowMonthPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getTransactions(currentMonth, currentYear);
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const months = [
    'Tháng 01', 'Tháng 02', 'Tháng 03', 'Tháng 04', 'Tháng 05', 'Tháng 06',
    'Tháng 07', 'Tháng 08', 'Tháng 09', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const loadMetadata = async () => {
    try {
      const [seasonsData, categoriesData, partnersData] = await Promise.all([
        getSeasons(),
        getCategories(),
        getPartners()
      ]);
      setSeasons(seasonsData || []);
      setCategories(categoriesData || []);
      setPartners(partnersData || []);
    } catch (error) {
      console.error('Error loading metadata:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTransaction(formData);
      setShowModal(false);
      fetchData();
      // Reset form
      setFormData({
        partner_id: '',
        season_id: '',
        category_id: '',
        amount: 0,
        paid_amount: 0,
        type: 'EXPENSE',
        transaction_date: new Date().toISOString().split('T')[0],
        note: '',
        is_inventory_affected: false
      });
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
  };

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'ALL') return true;
    return t.type === filter;
  });

  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const profit = totalIncome - totalExpense;

  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Giao dịch');

    // Define columns
    worksheet.columns = [
      { header: 'Ngày giao dịch', key: 'date', width: 20 },
      { header: 'Nội dung / Chi tiết', key: 'note', width: 40 },
      { header: 'Vụ mùa / Đối tác', key: 'context', width: 35 },
      { header: 'Phân loại', key: 'category', width: 20 },
      { header: 'Loại', key: 'type', width: 12 },
      { header: 'Số tiền (VNĐ)', key: 'amount', width: 20 },
      { header: 'Trạng thái', key: 'status', width: 15 },
    ];

    // Add data
    filteredTransactions.forEach(t => {
      const row = worksheet.addRow({
        date: new Date(t.transaction_date).toLocaleDateString('vi-VN'),
        note: t.note || 'Không có tiêu đề',
        context: `${t.season_name ? t.season_name : 'Chi tiêu chung'}${t.partner_name ? ' - ' + t.partner_name : ''}`,
        category: t.category_name || 'Khác',
        type: t.type === 'INCOME' ? 'Thu' : 'Chi',
        amount: Number(t.amount),
        status: 'Hoàn tất'
      });

      // Style amount cell based on type
      const amountCell = row.getCell('amount');
      const typeCell = row.getCell('type');

      if (t.type === 'INCOME') {
        amountCell.font = { color: { argb: 'FF008000' }, bold: true }; // Green
        typeCell.font = { color: { argb: 'FF008000' }, bold: true };
      } else {
        amountCell.font = { color: { argb: 'FFFF0000' }, bold: true }; // Red
        typeCell.font = { color: { argb: 'FFFF0000' }, bold: true };
      }
      amountCell.numFmt = '#,##0"₫"';
    });

    // Style the header
    const headerRow = worksheet.getRow(1);
    headerRow.height = 30;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF13EC49' }
      };
      cell.font = {
        bold: true,
        color: { argb: 'FF000000' },
        size: 12
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Style all data cells
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.height = 25;
        row.eachCell((cell) => {
          cell.alignment = { vertical: 'middle' };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFEEEEEE' } },
            left: { style: 'thin', color: { argb: 'FFEEEEEE' } },
            bottom: { style: 'thin', color: { argb: 'FFEEEEEE' } },
            right: { style: 'thin', color: { argb: 'FFEEEEEE' } }
          };
        });
      }
    });

    // Generate and save file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `Bao_cao_giao_dich_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(file);
      const worksheet = workbook.getWorksheet(1);
      if (!worksheet) return;

      const transactionsToCreate: any[] = [];
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header

        const dateStr = row.getCell(1).text; // Ngày giao dịch
        const note = row.getCell(2).text; // Nội dung
        const context = row.getCell(3).text; // Vụ mùa / Đối tác
        const categoryName = row.getCell(4).text; // Phân loại
        const typeStr = row.getCell(5).text; // Loại
        const amount = Number(row.getCell(6).value); // Số tiền

        // Parse entities
        const [seasonNamePart, partnerNamePart] = context.split(' - ');

        const category = categories.find(c => c.category_name === categoryName);
        const season = seasons.find(s => s.season_name === seasonNamePart);
        // Partner name might be exactly the part after ' - ' or the whole thing if no ' - '
        const partner = partners.find(p => p.partner_name === (partnerNamePart || seasonNamePart));

        // Format date from DD/MM/YYYY to YYYY-MM-DD
        let formattedDate = new Date().toISOString().split('T')[0];
        if (dateStr) {
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          }
        }

        transactionsToCreate.push({
          transaction_date: formattedDate,
          note: note,
          category_id: category?.id || '',
          season_id: season?.id || '',
          partner_id: partner?.id || '',
          type: typeStr === 'Thu' ? 'INCOME' : 'EXPENSE',
          amount: amount,
          paid_amount: amount,
          is_inventory_affected: false
        });
      });

      // Execute creations
      setLoading(true);
      await Promise.all(transactionsToCreate.map(t => createTransaction(t)));
      await fetchData();
      alert(`Đã nhập thành công ${transactionsToCreate.length} giao dịch!`);
    } catch (error) {
      console.error('Error importing excel:', error);
      alert('Có lỗi xảy ra khi nhập file. Vui lòng kiểm tra lại định dạng file.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Sổ nhật ký giao dịch</h1>
          <p className="text-slate-500 font-medium">Quản lý thu nhập và chi phí hàng ngày của trang trại.</p>
        </div>
        <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm shrink-0 relative" ref={monthPickerRef}>
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <div
            onClick={() => setShowMonthPicker(!showMonthPicker)}
            className="px-4 flex items-center gap-3 cursor-pointer hover:bg-slate-50 py-2 rounded-lg transition-all select-none"
          >
            <span className="material-symbols-outlined text-[#13ec49]">calendar_month</span>
            <span className="text-sm font-bold text-slate-900">
              {months[currentMonth - 1]}, {currentYear}
            </span>
          </div>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>

          {/* Premium Date Picker Popup */}
          {showMonthPicker && (
            <div className="absolute top-full mt-4 left-0 md:left-auto md:right-0 z-50 bg-white border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[32px] p-6 w-[320px] animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setCurrentYear(prev => prev - 1)}
                  className="size-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-all"
                >
                  <span className="material-symbols-outlined">keyboard_double_arrow_left</span>
                </button>
                <span className="text-lg font-black text-slate-900">{currentYear}</span>
                <button
                  onClick={() => setCurrentYear(prev => prev + 1)}
                  className="size-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-all"
                >
                  <span className="material-symbols-outlined">keyboard_double_arrow_right</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {months.map((m, idx) => (
                  <button
                    key={m}
                    onClick={() => {
                      setCurrentMonth(idx + 1);
                      setShowMonthPicker(false);
                    }}
                    className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${currentMonth === idx + 1
                      ? 'bg-[#13ec49] text-black shadow-lg shadow-[#13ec49]/20'
                      : 'hover:bg-slate-50 text-slate-500 hover:text-slate-900'
                      }`}
                  >
                    {m.split(' ')[1]}
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-50 flex justify-center">
                <button
                  onClick={() => {
                    const today = new Date();
                    setCurrentMonth(today.getMonth() + 1);
                    setCurrentYear(today.getFullYear());
                    setShowMonthPicker(false);
                  }}
                  className="text-[10px] font-black text-[#13ec49] uppercase tracking-widest hover:underline"
                >
                  Về tháng hiện tại
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { l: 'Tổng thu', v: totalIncome.toLocaleString('vi-VN') + 'đ', t: '+0%', c: 'bg-green-50 text-green-700', i: 'payments' },
          { l: 'Tổng chi', v: totalExpense.toLocaleString('vi-VN') + 'đ', t: '+0%', c: 'bg-red-50 text-red-700', i: 'shopping_cart' },
          { l: 'Lợi nhuận', v: profit.toLocaleString('vi-VN') + 'đ', t: '+0%', c: 'bg-blue-50 text-blue-700', i: 'savings' }
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${s.c}`}><span className="material-symbols-outlined text-[20px]">{s.i}</span></div>
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest">{s.l}</p>
            </div>
            <h3 className="text-3xl font-black text-slate-900">{s.v}</h3>
            <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${s.c.includes('green') ? 'text-green-600' : s.c.includes('red') ? 'text-red-600' : 'text-blue-600'}`}>
              Hệ thống tự động cập nhật
            </p>
          </div>
        ))}
      </div>

      {/* Main Content Table */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden border-t-4 border-t-[#13ec49]">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button className="bg-slate-50 text-slate-700 px-5 py-2.5 rounded-2xl text-[10px] font-black flex items-center gap-2 border border-slate-200 uppercase tracking-widest hover:bg-slate-100 transition-all">
              <span className="material-symbols-outlined text-[18px]">filter_list</span> Lọc
            </button>
            <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
              <button
                onClick={() => setFilter('ALL')}
                className={`${filter === 'ALL' ? 'bg-white text-[#13ec49] shadow-sm' : 'text-slate-400'} text-[10px] font-black px-5 py-2 rounded-xl uppercase tracking-widest transition-all`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setFilter('INCOME')}
                className={`${filter === 'INCOME' ? 'bg-white text-[#13ec49] shadow-sm' : 'text-slate-400'} text-[10px] font-black px-5 py-2 rounded-xl uppercase tracking-widest transition-all`}
              >
                Thu
              </button>
              <button
                onClick={() => setFilter('EXPENSE')}
                className={`${filter === 'EXPENSE' ? 'bg-white text-[#13ec49] shadow-sm' : 'text-slate-400'} text-[10px] font-black px-5 py-2 rounded-xl uppercase tracking-widest transition-all`}
              >
                Chi
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleExport}
              className="flex-1 md:flex-none border border-slate-200 px-6 py-2.5 rounded-2xl text-xs font-black hover:bg-slate-50 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Xuất báo cáo
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 md:flex-none border border-slate-200 px-6 py-2.5 rounded-2xl text-xs font-black hover:bg-slate-50 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">upload_file</span>
              Nhập dữ liệu
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImport}
              className="hidden"
              accept=".xlsx"
            />
            <button
              onClick={() => setShowModal(true)}
              className="flex-1 md:flex-none bg-[#13ec49] text-black px-8 py-2.5 rounded-2xl text-xs font-extrabold shadow-xl shadow-[#13ec49]/20 transition-all uppercase tracking-widest hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              Thêm mới
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                <th className="px-8 py-5 w-12 text-center"><input type="checkbox" className="rounded-lg border-slate-200 text-[#13ec49] focus:ring-[#13ec49]" /></th>
                <th className="px-8 py-5">Ngày giao dịch</th>
                <th className="px-8 py-5">Nội dung / Chi tiết</th>
                <th className="px-8 py-5">Phân loại</th>
                <th className="px-8 py-5 text-right">Số tiền</th>
                <th className="px-8 py-5 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-[#13ec49] border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Đang tải...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-all group cursor-pointer">
                    <td className="px-8 py-5 text-center"><input type="checkbox" className="rounded-lg border-slate-200 text-[#13ec49] focus:ring-[#13ec49]" /></td>
                    <td className="px-8 py-5 font-bold text-slate-400">{new Date(t.transaction_date).toLocaleDateString('vi-VN')}</td>
                    <td className="px-8 py-5">
                      <div className="font-extrabold text-slate-900 group-hover:text-[#13ec49] transition-colors">{t.note || 'Không có tiêu đề'}</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">
                        {t.season_name ? `⚡ ${t.season_name}` : '🏠 Chi tiêu chung'}
                        {t.partner_name ? ` • 👤 ${t.partner_name}` : ''}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${t.type === 'INCOME' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {t.category_name || 'Khác'}
                      </span>
                    </td>
                    <td className={`px-8 py-5 text-right font-black text-base ${t.type === 'EXPENSE' ? 'text-red-500' : 'text-green-600'}`}>
                      {t.type === 'EXPENSE' ? '-' : '+'}{Number(t.amount).toLocaleString('vi-VN')}đ
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">Hoàn tất</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-slate-300 italic font-bold">
                    Chưa có giao dịch nào được ghi lại
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Transaction */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[40px] p-8 md:p-10 max-w-2xl w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Ghi chép giao dịch</h2>
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-1">Cập nhập dòng tiền mới nhất</p>
              </div>
              <button onClick={() => setShowModal(false)} className="size-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 mb-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'INCOME' })}
                  className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${formData.type === 'INCOME' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-400'}`}
                >
                  <span className="material-symbols-outlined text-[18px]">add_circle</span> Thu vào
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'EXPENSE' })}
                  className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${formData.type === 'EXPENSE' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-400'}`}
                >
                  <span className="material-symbols-outlined text-[18px]">do_not_disturb_on</span> Chi ra
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-full">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Mô tả giao dịch</label>
                  <input
                    required
                    value={formData.note}
                    onChange={e => setFormData({ ...formData, note: e.target.value })}
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[#13ec49]/20 outline-none font-bold text-slate-900 transition-all"
                    placeholder="Ví dụ: Bán 10 tấn lúa, Mua thuốc trừ sâu..."
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Số tiền (VNĐ)</label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: Number(e.target.value), paid_amount: Number(e.target.value) })}
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[#13ec49]/20 outline-none font-bold text-slate-900 transition-all font-mono"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Ngày giao dịch</label>
                  <input
                    type="date"
                    required
                    value={formData.transaction_date}
                    onChange={e => setFormData({ ...formData, transaction_date: e.target.value })}
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[#13ec49]/20 outline-none font-bold text-slate-900 transition-all"
                  />
                </div>

                <CustomSelect
                  label="Phân loại"
                  value={formData.category_id}
                  onChange={(val) => setFormData({ ...formData, category_id: val })}
                  placeholder="Chọn danh mục"
                  icon="category"
                  options={categories.map(c => ({ id: c.id, name: c.category_name }))}
                />

                <CustomSelect
                  label="Vụ mùa liên quan"
                  value={formData.season_id}
                  onChange={(val) => setFormData({ ...formData, season_id: val })}
                  placeholder="Chi tiêu chung (Không có vụ)"
                  icon="temp_preferences_custom"
                  options={seasons.map(s => ({ id: s.id, name: s.season_name }))}
                />

                <div className="col-span-full">
                  <CustomSelect
                    label="Đối tác thực hiện"
                    value={formData.partner_id}
                    onChange={(val) => setFormData({ ...formData, partner_id: val })}
                    placeholder="Giao dịch vặt / Không ghi nhận"
                    icon="person"
                    options={partners.map(p => ({ id: p.id, name: `${p.partner_name} (${p.type})` }))}
                  />
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-5 rounded-[24px] font-black uppercase tracking-widest text-sm transition-all shadow-2xl flex items-center justify-center gap-3 ${formData.type === 'INCOME'
                  ? 'bg-green-500 text-white shadow-green-500/20 hover:bg-green-600'
                  : 'bg-red-500 text-white shadow-red-500/20 hover:bg-red-600'
                  }`}
              >
                <span className="material-symbols-outlined">save</span>
                Lưu giao dịch
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
