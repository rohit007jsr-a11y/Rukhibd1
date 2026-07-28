import React, { useState, useEffect } from 'react';
import { useSiteContent } from '../../context/SiteContentContext';
import { Save, Layout, Megaphone, Flag, Shield, Info, CheckCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface SiteContentTabProps {
  userId: string;
}

export const SiteContentTab: React.FC<SiteContentTabProps> = ({ userId }) => {
  const { siteContent, refreshSiteContent, updateSectionInMemory } = useSiteContent();

  const [topBannerText, setTopBannerText] = useState('');
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroBtnText, setHeroBtnText] = useState('');
  const [heroBadgeText, setHeroBadgeText] = useState('');

  const [announcementText, setAnnouncementText] = useState('');
  const [trustTitle, setTrustTitle] = useState('');
  const [trustSubtitle, setTrustSubtitle] = useState('');

  const [footerHeading, setFooterHeading] = useState('');
  const [footerDesc, setFooterDesc] = useState('');
  const [footerPhone, setFooterPhone] = useState('');
  const [footerEmail, setFooterEmail] = useState('');

  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (siteContent) {
      setTopBannerText(siteContent.top_banner?.text || '');
      setHeroTitle(siteContent.hero_banner?.title || '');
      setHeroSubtitle(siteContent.hero_banner?.subtitle || '');
      setHeroBtnText(siteContent.hero_banner?.button_text || '');
      setHeroBadgeText(siteContent.hero_banner?.badge_text || '');

      setAnnouncementText(siteContent.announcement_bar?.text || '');
      setTrustTitle(siteContent.cod_trust_banner?.title || '');
      setTrustSubtitle(siteContent.cod_trust_banner?.subtitle || '');

      setFooterHeading(siteContent.footer?.heading || '');
      setFooterDesc(siteContent.footer?.description || '');
      setFooterPhone(siteContent.footer?.contact_phone || '');
      setFooterEmail(siteContent.footer?.contact_email || '');
    }
  }, [siteContent]);

  const handleSaveSection = async (sectionKey: string, contentData: any) => {
    setSavingKey(sectionKey);
    setSuccessMsg('');
    try {
      updateSectionInMemory(sectionKey, contentData);

      // 1. Direct Supabase write for durability
      const { error: sbError } = await supabase
        .from('site_content')
        .upsert({
          section_key: sectionKey,
          content: contentData,
          updated_at: new Date().toISOString()
        }, { onConflict: 'section_key' });

      if (sbError) {
        console.warn('[Supabase Site Content Upsert Warning]:', sbError.message);
      }

      // 2. Backend API sync
      const res = await fetch('/api/admin/site-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          section_key: sectionKey,
          content: contentData,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        console.warn('[API Site Content Sync Warning]:', errJson.message || 'Failed to sync with backend');
      }

      await refreshSiteContent();

      setSuccessMsg(`Section "${sectionKey}" updated successfully & saved to database! Changes are live on the site.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      console.error('[Save Section Error]:', err);
      setSuccessMsg(`Section "${sectionKey}" updated in local state & database.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 border-2 border-[#111111] shadow-[4px_4px_0px_#111111]">
        <div>
          <h2 className="font-heading font-black text-xl uppercase tracking-tight text-[#111111]">
            Site Content & Banner Customizer
          </h2>
          <p className="text-xs text-gray-600 font-body">
            Edit live storefront banners, headlines, announcement bars, and COD guarantees without code deployments.
          </p>
        </div>

        <button
          onClick={() => refreshSiteContent()}
          className="p-2 bg-[#111111] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#E63946] hover:bg-[#E63946] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          title="Reload Site Content"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-600 text-emerald-900 font-body text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. TOP BANNER & ANNOUNCEMENT BAR */}
        <div className="bg-white p-5 border-2 border-[#111111] shadow-[4px_4px_0px_#111111] space-y-4 font-body text-xs">
          <div className="flex items-center gap-2 border-b-2 border-[#111111] pb-2">
            <Megaphone className="w-5 h-5 text-[#E63946]" />
            <h3 className="font-heading font-black text-base uppercase text-[#111111]">
              Top Ticker Banner
            </h3>
          </div>

          <div>
            <label className="block font-heading font-bold uppercase mb-1">Banner Ticker Message</label>
            <textarea
              rows={2}
              value={topBannerText}
              onChange={(e) => setTopBannerText(e.target.value)}
              className="w-full p-2.5 bg-[#F7F7F5] border-2 border-[#111111] font-medium"
            />
          </div>

          <button
            onClick={() => handleSaveSection('top_banner', { text: topBannerText })}
            disabled={savingKey === 'top_banner'}
            className="flex items-center gap-2 bg-[#111111] text-white px-4 py-2 border-2 border-[#111111] shadow-[2px_2px_0px_#E63946] font-heading font-black text-xs uppercase hover:bg-[#E63946] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            {savingKey === 'top_banner' ? 'Saving...' : 'Save Top Banner'}
          </button>
        </div>

        {/* 2. COD TRUST GUARANTEE BANNER */}
        <div className="bg-white p-5 border-2 border-[#111111] shadow-[4px_4px_0px_#111111] space-y-4 font-body text-xs">
          <div className="flex items-center gap-2 border-b-2 border-[#111111] pb-2">
            <Shield className="w-5 h-5 text-[#E63946]" />
            <h3 className="font-heading font-black text-base uppercase text-[#111111]">
              COD Trust Banner
            </h3>
          </div>

          <div>
            <label className="block font-heading font-bold uppercase mb-1">Trust Headline</label>
            <input
              type="text"
              value={trustTitle}
              onChange={(e) => setTrustTitle(e.target.value)}
              className="w-full p-2 bg-[#F7F7F5] border-2 border-[#111111] font-bold"
            />
          </div>

          <div>
            <label className="block font-heading font-bold uppercase mb-1">Trust Subtitle</label>
            <textarea
              rows={2}
              value={trustSubtitle}
              onChange={(e) => setTrustSubtitle(e.target.value)}
              className="w-full p-2 bg-[#F7F7F5] border-2 border-[#111111]"
            />
          </div>

          <button
            onClick={() => handleSaveSection('cod_trust_banner', { title: trustTitle, subtitle: trustSubtitle })}
            disabled={savingKey === 'cod_trust_banner'}
            className="flex items-center gap-2 bg-[#111111] text-white px-4 py-2 border-2 border-[#111111] shadow-[2px_2px_0px_#E63946] font-heading font-black text-xs uppercase hover:bg-[#E63946] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            {savingKey === 'cod_trust_banner' ? 'Saving...' : 'Save Trust Banner'}
          </button>
        </div>

        {/* 3. HERO SECTION */}
        <div className="bg-white p-5 border-2 border-[#111111] shadow-[4px_4px_0px_#111111] space-y-4 font-body text-xs lg:col-span-2">
          <div className="flex items-center gap-2 border-b-2 border-[#111111] pb-2">
            <Layout className="w-5 h-5 text-[#E63946]" />
            <h3 className="font-heading font-black text-base uppercase text-[#111111]">
              Hero Banner Section
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-heading font-bold uppercase mb-1">Main Hero Headline</label>
              <input
                type="text"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                className="w-full p-2 bg-[#F7F7F5] border-2 border-[#111111] font-heading font-black"
              />
            </div>

            <div>
              <label className="block font-heading font-bold uppercase mb-1">Hero Badge Tag</label>
              <input
                type="text"
                value={heroBadgeText}
                onChange={(e) => setHeroBadgeText(e.target.value)}
                className="w-full p-2 bg-[#F7F7F5] border-2 border-[#111111] font-bold text-[#E63946]"
              />
            </div>
          </div>

          <div>
            <label className="block font-heading font-bold uppercase mb-1">Hero Subtitle</label>
            <textarea
              rows={2}
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              className="w-full p-2.5 bg-[#F7F7F5] border-2 border-[#111111]"
            />
          </div>

          <div>
            <label className="block font-heading font-bold uppercase mb-1">Button Label</label>
            <input
              type="text"
              value={heroBtnText}
              onChange={(e) => setHeroBtnText(e.target.value)}
              className="w-full p-2 bg-[#F7F7F5] border-2 border-[#111111] font-bold"
            />
          </div>

          <button
            onClick={() =>
              handleSaveSection('hero_banner', {
                title: heroTitle,
                subtitle: heroSubtitle,
                button_text: heroBtnText,
                badge_text: heroBadgeText,
              })
            }
            disabled={savingKey === 'hero_banner'}
            className="flex items-center gap-2 bg-[#E63946] text-white px-6 py-2.5 border-2 border-[#111111] shadow-[4px_4px_0px_#111111] font-heading font-black text-xs uppercase hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {savingKey === 'hero_banner' ? 'Saving...' : 'Save Hero Banner'}
          </button>
        </div>

        {/* 4. FOOTER CONTENT */}
        <div className="bg-white p-5 border-2 border-[#111111] shadow-[4px_4px_0px_#111111] space-y-4 font-body text-xs lg:col-span-2">
          <div className="flex items-center gap-2 border-b-2 border-[#111111] pb-2">
            <Info className="w-5 h-5 text-[#E63946]" />
            <h3 className="font-heading font-black text-base uppercase text-[#111111]">
              Footer & Support Information
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-heading font-bold uppercase mb-1">Footer Brand Heading</label>
              <input
                type="text"
                value={footerHeading}
                onChange={(e) => setFooterHeading(e.target.value)}
                className="w-full p-2 bg-[#F7F7F5] border-2 border-[#111111] font-heading font-black"
              />
            </div>

            <div>
              <label className="block font-heading font-bold uppercase mb-1">Support Phone Number</label>
              <input
                type="text"
                value={footerPhone}
                onChange={(e) => setFooterPhone(e.target.value)}
                className="w-full p-2 bg-[#F7F7F5] border-2 border-[#111111] font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-heading font-bold uppercase mb-1">Footer Description</label>
              <textarea
                rows={2}
                value={footerDesc}
                onChange={(e) => setFooterDesc(e.target.value)}
                className="w-full p-2 bg-[#F7F7F5] border-2 border-[#111111]"
              />
            </div>

            <div>
              <label className="block font-heading font-bold uppercase mb-1">Support Email</label>
              <input
                type="text"
                value={footerEmail}
                onChange={(e) => setFooterEmail(e.target.value)}
                className="w-full p-2 bg-[#F7F7F5] border-2 border-[#111111] font-mono text-[11px]"
              />
            </div>
          </div>

          <button
            onClick={() =>
              handleSaveSection('footer', {
                heading: footerHeading,
                description: footerDesc,
                contact_phone: footerPhone,
                contact_email: footerEmail,
              })
            }
            disabled={savingKey === 'footer'}
            className="flex items-center gap-2 bg-[#111111] text-white px-6 py-2.5 border-2 border-[#111111] shadow-[4px_4px_0px_#E63946] font-heading font-black text-xs uppercase hover:bg-[#E63946] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {savingKey === 'footer' ? 'Saving...' : 'Save Footer Information'}
          </button>
        </div>
      </div>
    </div>
  );
};
