import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SiteContentMap } from '../types';
import { supabase } from '../lib/supabase';

const DEFAULT_SITE_CONTENT: SiteContentMap = {
  top_banner: {
    text: '🚚 ALL BANGLADESH CASH ON DELIVERY AVAILABLE | CHECK YOUR PARCEL BEFORE PAYING!',
  },
  hero_banner: {
    title: 'RUKHI BANGLADESH MARKETPLACE',
    subtitle: '100% Cash-on-Delivery across all 64 districts. Inspect your parcel before handing over cash.',
    button_text: 'EXPLORE COLLECTION',
    badge_text: 'TRUSTED COD MARKETPLACE',
  },
  announcement_bar: {
    text: '🔥 Ramadan Special: Free Delivery on orders over ৳3000!',
  },
  cod_trust_banner: {
    title: '100% Cash On Delivery Guarantee',
    subtitle: 'Never pay in advance. Inspect product condition at your doorstep before releasing payment to courier.',
  },
  footer: {
    heading: 'RUKHI BANGLADESH',
    description: "Bangladesh's trusted multi-category Cash-on-Delivery e-commerce marketplace.",
    contact_phone: '+880 1700-000000',
    contact_email: 'support@rukhi.com.bd',
  },
};

interface SiteContentContextType {
  siteContent: SiteContentMap;
  loading: boolean;
  refreshSiteContent: () => Promise<void>;
  updateSectionInMemory: (sectionKey: string, content: any) => void;
}

const SiteContentContext = createContext<SiteContentContextType | undefined>(undefined);

export const SiteContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [siteContent, setSiteContent] = useState<SiteContentMap>(DEFAULT_SITE_CONTENT);
  const [loading, setLoading] = useState(true);

  const fetchContent = async () => {
    try {
      // First attempt API
      const res = await fetch('/api/site-content');
      if (res.ok) {
        const data = await res.json();
        if (data && Object.keys(data).length > 0) {
          setSiteContent((prev) => ({ ...prev, ...data }));
          setLoading(false);
          return;
        }
      }

      // Fallback directly to Supabase client if API not available
      const { data: dbRows } = await supabase.from('site_content').select('section_key, content');
      if (dbRows && dbRows.length > 0) {
        const mapped: Record<string, any> = {};
        dbRows.forEach((r) => {
          mapped[r.section_key] = r.content;
        });
        setSiteContent((prev) => ({ ...prev, ...mapped }));
      }
    } catch (err) {
      console.warn('[Site Content Fetch Warning]:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const updateSectionInMemory = (sectionKey: string, content: any) => {
    setSiteContent((prev) => ({
      ...prev,
      [sectionKey]: content,
    }));
  };

  return (
    <SiteContentContext.Provider
      value={{
        siteContent,
        loading,
        refreshSiteContent: fetchContent,
        updateSectionInMemory,
      }}
    >
      {children}
    </SiteContentContext.Provider>
  );
};

export const useSiteContent = (): SiteContentContextType => {
  const ctx = useContext(SiteContentContext);
  if (!ctx) {
    throw new Error('useSiteContent must be used within a SiteContentProvider');
  }
  return ctx;
};
