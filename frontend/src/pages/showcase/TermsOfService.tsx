import React from 'react';
import ShowcaseHeader from '../../templates/ShowcaseHeader';
import { Link } from 'react-router-dom';
import logoWeb from '../../assets/logo_web.png';
import { useTranslation } from 'react-i18next';

const TermsOfService: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f8f6]">
            {/* Top Navigation Bar */}
            <ShowcaseHeader />

            <div className="layout-container flex h-full grow flex-col text-left">
                <div className="px-4 md:px-10 lg:px-40 flex flex-1 justify-center py-12">
                    <div className="layout-content-container flex flex-col max-w-[950px] flex-1 gap-12">

                        {/* Title Section */}
                        <div className="flex flex-col gap-6 text-center animate-in fade-in slide-in-from-top-4 duration-700">
                            <h1 className="text-[#111813] text-4xl md:text-6xl font-black tracking-tight">{t('showcase_terms.title')}</h1>
                            <div className="h-1.5 w-24 bg-[#13ec49] mx-auto rounded-full"></div>
                        </div>

                        {/* Acceptance Card */}
                        <div className="bg-white rounded-[2.5rem] border border-[#dbe6de] shadow-sm p-8 md:p-12">
                            <h2 className="text-2xl font-black text-[#111813] mb-6 flex items-center gap-3">
                                <span className="material-symbols-outlined text-[#13ec49] text-3xl">task_alt</span>
                                1. {t('showcase_terms.sec1_title')}
                            </h2>
                            <p className="text-[#3c4740] text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: t('showcase_terms.sec1_desc') }}>
                            </p>
                        </div>

                        {/* Detailed Content Grid */}
                        <div className="grid grid-cols-1 gap-10">

                            {/* Registration & Security */}
                            <section className="bg-white rounded-3xl border border-[#dbe6de] p-8 shadow-sm">
                                <h2 className="text-2xl font-black text-[#111813] mb-4 flex items-center gap-3">
                                    <span className="material-symbols-outlined text-[#13ec49] text-3xl">security</span>
                                    2. {t('showcase_terms.sec2_title')}
                                </h2>
                                <div className="space-y-4 text-[#3c4740] leading-relaxed">
                                    <p>{t('showcase_terms.sec2_desc_1')}</p>
                                    <p>{t('showcase_terms.sec2_desc_2')}</p>
                                </div>
                            </section>

                            {/* Prohibited Behaviors */}
                            <section className="bg-white rounded-3xl border border-[#dbe6de] p-8 shadow-sm">
                                <h2 className="text-2xl font-black text-[#111813] mb-4 flex items-center gap-3">
                                    <span className="material-symbols-outlined text-[#13ec49] text-3xl">block</span>
                                    3. {t('showcase_terms.sec3_title')}
                                </h2>
                                <p className="text-[#3c4740] mb-4 leading-relaxed">
                                    {t('showcase_terms.sec3_desc')}
                                </p>
                                <ul className="space-y-3 ml-4">
                                    <li className="flex gap-3 text-[#3c4740]">
                                        <span className="text-[#13ec49] font-bold">•</span>
                                        <span>{t('showcase_terms.sec3_li_1')}</span>
                                    </li>
                                    <li className="flex gap-3 text-[#3c4740]">
                                        <span className="text-[#13ec49] font-bold">•</span>
                                        <span>{t('showcase_terms.sec3_li_2')}</span>
                                    </li>
                                    <li className="flex gap-3 text-[#3c4740]">
                                        <span className="text-[#13ec49] font-bold">•</span>
                                        <span>{t('showcase_terms.sec3_li_3')}</span>
                                    </li>
                                </ul>
                            </section>

                            {/* Intellectual Property */}
                            <section className="bg-white rounded-3xl border border-[#dbe6de] p-8 shadow-sm">
                                <h2 className="text-2xl font-black text-[#111813] mb-4 flex items-center gap-3">
                                    <span className="material-symbols-outlined text-[#13ec49] text-3xl">verified</span>
                                    4. {t('showcase_terms.sec4_title')}
                                </h2>
                                <div className="space-y-4 text-[#3c4740] leading-relaxed">
                                    <p dangerouslySetInnerHTML={{ __html: t('showcase_terms.sec4_desc_1') }}></p>
                                    <p>{t('showcase_terms.sec4_desc_2')}</p>
                                </div>
                            </section>

                            {/* Limitation of Liability */}
                            <section className="bg-white rounded-3xl border border-[#dbe6de] p-8 shadow-sm">
                                <h2 className="text-2xl font-black text-[#111813] mb-4 flex items-center gap-3">
                                    <span className="material-symbols-outlined text-[#13ec49] text-3xl">gavel</span>
                                    5. {t('showcase_terms.sec5_title')}
                                </h2>
                                <p className="text-[#3c4740] leading-relaxed">
                                    {t('showcase_terms.sec5_desc')}
                                </p>
                            </section>

                        </div>

                        <div className="flex justify-center pt-8">
                            <Link
                                to="/showcase"
                                className="flex items-center gap-2 bg-[#111813] text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-transform shadow-xl"
                            >
                                <span className="material-symbols-outlined">arrow_back</span>
                                {t('showcase_policy.back_home')}
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Footer Copy */}
                <footer className="mt-auto border-t border-[#e5e9e6] bg-white py-8 px-10">
                    <div className="max-w-[1200px] mx-auto flex justify-center items-center gap-4 text-[#61896b] text-sm">
                        <div className="flex items-center gap-2">
                            <img src={logoWeb} alt="Logo" className="size-6 object-contain" />
                            <span className="font-bold text-[#111813]">{t('showcase_home.farm_name')}</span>
                            <span className="mx-2">|</span>
                            <span>{t('showcase_contact.copyright', { year: new Date().getFullYear() })}</span>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default TermsOfService;
