
import React from 'react';
import { useTranslation } from 'react-i18next';

const PersonalFinance: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="p-3 md:p-4 space-y-4 w-full">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[#13ec49] text-xs font-black uppercase tracking-[0.2em]">
            <span className="material-symbols-outlined text-[18px]">home</span>
            {t('personal_finance.family_space')}
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter">{t('personal_finance.title')}</h1>
          <p className="text-slate-500 text-lg max-w-xl">{t('personal_finance.subtitle')}</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white border border-slate-200 px-5 py-3 rounded-2xl flex items-center gap-3 shadow-sm text-sm font-bold text-slate-900">
            <span className="material-symbols-outlined text-slate-400">calendar_month</span>
            Tháng 1, 2026
          </div>
          <button className="bg-[#13ec49] text-black px-8 py-3 rounded-2xl text-sm font-black shadow-xl shadow-[#13ec49]/20 hover:scale-105 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined">add</span>
            {t('personal_finance.record_expense')}
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { l: t('personal_finance.stats.total_expense'), v: '25.400.000đ', t: '+12%', tu: false, i: 'payments', c: 'bg-primary/10' },
          { l: t('personal_finance.stats.remaining_budget'), v: '14.600.000đ', t: t('personal_finance.stats.in_control'), tu: true, i: 'account_balance', c: 'bg-primary/10' },
          { l: t('personal_finance.stats.top_category'), v: 'Ăn uống', t: '32%', tu: true, i: 'shopping_cart', c: 'bg-primary/10' },
        ].map((s, idx) => (
          <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-6">
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest">{s.l}</p>
              <div className={`p-2 rounded-xl text-[#13ec49] ${s.c} group-hover:scale-110 transition-transform`}><span className="material-symbols-outlined">{s.i}</span></div>
            </div>
            <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{s.v}</h3>
            <p className={`text-[10px] font-black uppercase tracking-widest mt-2 flex items-center gap-1.5 ${s.tu ? 'text-[#13ec49]' : 'text-red-500'}`}>
              <span className="material-symbols-outlined text-[14px]">{s.tu ? 'check_circle' : 'trending_up'}</span>
              {s.t} {s.tu ? '' : t('personal_finance.stats.compared_to_last_month')}
            </p>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm space-y-8">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-2xl font-black text-slate-900">{t('personal_finance.budget.title')}</h3>
              <p className="text-slate-400 text-sm font-medium">{t('personal_finance.budget.subtitle')}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-slate-900 tracking-tight">62%</p>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t('personal_finance.budget.used')}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span>{t('personal_finance.budget.spent', { spent: '25,4tr' })}</span>
              <span>{t('personal_finance.budget.total', { total: '40tr' })}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
              <div className="bg-[#13ec49] h-full rounded-full transition-all duration-1000" style={{ width: '62.5%' }}></div>
            </div>
            <div className="bg-[#f6f8f6] p-4 rounded-2xl flex items-center gap-4 text-sm">
              <span className="material-symbols-outlined text-[#13ec49]">info</span>
              <p className="text-slate-600 font-medium">{t('personal_finance.budget.remaining_info').split('{{amount}}')[0] || ''}<span className="font-black text-slate-900">14.600.000đ</span>{t('personal_finance.budget.remaining_info').split('{{amount}}')[1] || ''}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h3 className="text-2xl font-black text-slate-900">{t('personal_finance.categories.title')}</h3>
              <p className="text-slate-400 text-sm font-medium">{t('personal_finance.categories.subtitle')}</p>
            </div>
            <button className="text-[#13ec49] text-xs font-black uppercase tracking-widest hover:underline">{t('personal_finance.categories.view_report')}</button>
          </div>

          <div className="flex-1 flex items-end justify-between gap-4 h-48">
            {[
              { l: 'Ăn uống', h: 45, v: '1,4tr' },
              { l: 'Học tập', h: 75, v: '4tr' },
              { l: 'Giải trí', h: 25, v: '450k' },
              { l: 'Điện nước', h: 35, v: '1,2tr' }
            ].map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                <div
                  className="w-full max-w-[48px] bg-[#13ec49]/20 group-hover:bg-[#13ec49] rounded-xl transition-all relative"
                  style={{ height: `${bar.h}%` }}
                >
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded-lg transition-opacity whitespace-nowrap shadow-xl">
                    {bar.v}
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{bar.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalFinance;
