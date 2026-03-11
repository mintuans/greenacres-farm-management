import React from 'react';
import ShowcaseHeader from '../../templates/ShowcaseHeader';
import { Link } from 'react-router-dom';
import logoWeb from '../../assets/logo_web.png';
import { useTranslation } from 'react-i18next';

const PrivacyPolicy: React.FC = () => {
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
                            <h1 className="text-[#111813] text-4xl md:text-6xl font-black tracking-tight">{t('showcase_policy.title')}</h1>
                            <div className="h-1.5 w-24 bg-[#13ec49] mx-auto rounded-full"></div>
                        </div>

                        {/* Introduction Card */}
                        <div className="bg-white rounded-[2.5rem] border border-[#dbe6de] shadow-sm p-8 md:p-12">
                            <p className="text-[#3c4740] text-lg leading-relaxed mb-6 italic">
                                {t('showcase_policy.intro_1')}
                            </p>
                            <p className="text-[#3c4740] leading-relaxed">
                                {t('showcase_policy.intro_2')}
                            </p>
                            <p className="text-[#3c4740] mt-4 leading-relaxed font-bold">
                                {t('showcase_policy.intro_3')}
                            </p>
                        </div>

                        {/* Main Policy Content */}
                        <div className="grid grid-cols-1 gap-10">

                            {/* Section 1 */}
                            <section className="bg-white rounded-3xl border border-[#dbe6de] p-8 shadow-sm">
                                <h2 className="text-2xl font-black text-[#111813] mb-4 flex items-center gap-3">
                                    <span className="size-8 bg-[#13ec49]/10 text-[#13ec49] flex items-center justify-center rounded-lg text-lg">1</span>
                                    {t('showcase_policy.sec1_title')}
                                </h2>
                                <p className="text-[#3c4740] leading-relaxed">
                                    {t('showcase_policy.sec1_desc')}
                                </p>
                            </section>

                            {/* Section 2 */}
                            <section className="bg-white rounded-3xl border border-[#dbe6de] p-8 shadow-sm">
                                <h2 className="text-2xl font-black text-[#111813] mb-4 flex items-center gap-3">
                                    <span className="size-8 bg-[#13ec49]/10 text-[#13ec49] flex items-center justify-center rounded-lg text-lg">2</span>
                                    {t('showcase_policy.sec2_title')}
                                </h2>
                                <div className="space-y-4 text-[#3c4740] leading-relaxed">
                                    <p>{t('showcase_policy.sec2_desc_1')}</p>
                                    <p>{t('showcase_policy.sec2_desc_2')}</p>
                                    <p>{t('showcase_policy.sec2_desc_3')}</p>
                                </div>
                            </section>

                            {/* Section 3 */}
                            <section className="bg-white rounded-3xl border border-[#dbe6de] p-8 shadow-sm">
                                <h2 className="text-2xl font-black text-[#111813] mb-4 flex items-center gap-3">
                                    <span className="size-8 bg-[#13ec49]/10 text-[#13ec49] flex items-center justify-center rounded-lg text-lg">3</span>
                                    {t('showcase_policy.sec3_title')}
                                </h2>
                                <p className="text-[#3c4740] leading-relaxed">
                                    {t('showcase_policy.sec3_desc')}
                                </p>
                            </section>

                            {/* Section 4 */}
                            <section className="bg-white rounded-3xl border border-[#dbe6de] p-8 shadow-sm">
                                <h2 className="text-2xl font-black text-[#111813] mb-4 flex items-center gap-3">
                                    <span className="size-8 bg-[#13ec49]/10 text-[#13ec49] flex items-center justify-center rounded-lg text-lg">4</span>
                                    {t('showcase_policy.sec4_title')}
                                </h2>
                                <div className="space-y-4 text-[#3c4740] leading-relaxed">
                                    <p>{t('showcase_policy.sec4_desc_1')}</p>
                                    <p>{t('showcase_policy.sec4_desc_2')}</p>
                                </div>
                            </section>

                            {/* Section 5 */}
                            <section className="bg-white rounded-3xl border border-[#dbe6de] p-8 shadow-sm">
                                <h2 className="text-2xl font-black text-[#111813] mb-4 flex items-center gap-3">
                                    <span className="size-8 bg-[#13ec49]/10 text-[#13ec49] flex items-center justify-center rounded-lg text-lg">5</span>
                                    {t('showcase_policy.sec5_title')}
                                </h2>
                                <div className="space-y-4 text-[#3c4740] leading-relaxed">
                                    <p>{t('showcase_policy.sec5_desc_1')}</p>
                                    <p>{t('showcase_policy.sec5_desc_2')}</p>
                                </div>
                            </section>

                            {/* Section 6 */}
                            <section className="bg-white rounded-3xl border border-[#dbe6de] p-8 shadow-sm">
                                <h2 className="text-2xl font-black text-[#111813] mb-4 flex items-center gap-3">
                                    <span className="size-8 bg-[#13ec49]/10 text-[#13ec49] flex items-center justify-center rounded-lg text-lg">6</span>
                                    {t('showcase_policy.sec6_title')}
                                </h2>
                                <p className="text-[#3c4740] leading-relaxed">
                                    {t('showcase_policy.sec6_desc')}
                                </p>
                            </section>

                            {/* Section 7 */}
                            <section className="bg-white rounded-3xl border border-[#dbe6de] p-8 shadow-sm">
                                <h2 className="text-2xl font-black text-[#111813] mb-4 flex items-center gap-3">
                                    <span className="size-8 bg-[#13ec49]/10 text-[#13ec49] flex items-center justify-center rounded-lg text-lg">7</span>
                                    {t('showcase_policy.sec7_title')}
                                </h2>
                                <p className="text-[#3c4740] leading-relaxed">
                                    {t('showcase_policy.sec7_desc')}
                                </p>
                            </section>

                            {/* Section 8 */}
                            <section className="bg-white rounded-3xl border border-[#dbe6de] p-8 shadow-sm">
                                <h2 className="text-2xl font-black text-[#111813] mb-4 flex items-center gap-3">
                                    <span className="size-8 bg-[#13ec49]/10 text-[#13ec49] flex items-center justify-center rounded-lg text-lg">8</span>
                                    {t('showcase_policy.sec8_title')}
                                </h2>
                                <p className="text-[#3c4740] leading-relaxed">
                                    {t('showcase_policy.sec8_desc')}
                                </p>
                            </section>

                            {/* Section 9 */}
                            <section className="bg-white rounded-3xl border border-[#dbe6de] p-8 shadow-sm">
                                <h2 className="text-2xl font-black text-[#111813] mb-4 flex items-center gap-3">
                                    <span className="size-8 bg-[#13ec49]/10 text-[#13ec49] flex items-center justify-center rounded-lg text-lg">9</span>
                                    {t('showcase_policy.sec9_title')}
                                </h2>
                                <p className="text-[#3c4740] leading-relaxed">
                                    {t('showcase_policy.sec9_desc')}
                                </p>
                            </section>

                            {/* Section 10 */}
                            <section className="bg-white rounded-3xl border border-[#dbe6de] p-8 shadow-sm">
                                <h2 className="text-2xl font-black text-[#111813] mb-4 flex items-center gap-3">
                                    <span className="size-8 bg-[#13ec49]/10 text-[#13ec49] flex items-center justify-center rounded-lg text-lg">10</span>
                                    {t('showcase_policy.sec10_title')}
                                </h2>
                                <p className="text-[#3c4740] leading-relaxed">
                                    {t('showcase_policy.sec10_desc')}
                                </p>
                            </section>

                        </div>

                        {/* Back Button */}
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

export default PrivacyPolicy;
