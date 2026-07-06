import { supabase } from './supabase';

export interface SiteSettings {
  whatsapp_number: string;
  site_name: string;
  site_title: string;
  site_tagline: string;
  site_description: string;
  site_keywords: string;
  instagram_url: string;
  tiktok_url: string;
  facebook_url: string;
  discord_url: string;
  email_support: string;
  address_info: string;
}

export function getDefaultSettings(): SiteSettings {
  return {
    whatsapp_number: '628123456789',
    site_name: 'JBRENDYR.COM',
    site_title: 'JBRENDYR.COM | Jual Beli Akun Game Premium Terpercaya',
    site_tagline: 'Marketplace Jual Beli Akun Game Aman dan Terpercaya',
    site_description: 'JBRENDYR.COM adalah marketplace jual beli akun game premium paling aman, murah, dan terpercaya di Indonesia. Dapatkan akun Mobile Legends, Free Fire, Valorant, PUBG, Genshin, & CoC impianmu sekarang!',
    site_keywords: 'jual beli akun game, akun mobile legends murah, akun free fire sultan, akun valorant premium, jbrendyr, marketplace game aman, beli akun mlbb, sewa akun game',
    instagram_url: 'https://instagram.com/jbrendyr',
    tiktok_url: 'https://tiktok.com/@jbrendyr',
    facebook_url: 'https://facebook.com/jbrendyr',
    discord_url: 'https://discord.gg/jbrendyr',
    email_support: 'support@jbrendyr.com',
    address_info: 'Jakarta, Indonesia',
  };
}

/**
 * Fetches all settings keys from Supabase settings table.
 * Returns default values if data is missing or query fails.
 */
export async function getSettings(): Promise<SiteSettings> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('key, value');

    if (error || !data || data.length === 0) {
      // Return defaults if database is not seeded or query fails
      return getDefaultSettings();
    }

    // Convert list of {key, value} to a single object
    const settingsMap = data.reduce((acc: Record<string, string>, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {});

    const defaults = getDefaultSettings();

    return {
      whatsapp_number: settingsMap.whatsapp_number || defaults.whatsapp_number,
      site_name: settingsMap.site_name || defaults.site_name,
      site_title: settingsMap.site_title || defaults.site_title,
      site_tagline: settingsMap.site_tagline || defaults.site_tagline,
      site_description: settingsMap.site_description || defaults.site_description,
      site_keywords: settingsMap.site_keywords || defaults.site_keywords,
      instagram_url: settingsMap.instagram_url !== undefined ? settingsMap.instagram_url : defaults.instagram_url,
      tiktok_url: settingsMap.tiktok_url !== undefined ? settingsMap.tiktok_url : defaults.tiktok_url,
      facebook_url: settingsMap.facebook_url !== undefined ? settingsMap.facebook_url : defaults.facebook_url,
      discord_url: settingsMap.discord_url !== undefined ? settingsMap.discord_url : defaults.discord_url,
      email_support: settingsMap.email_support !== undefined ? settingsMap.email_support : defaults.email_support,
      address_info: settingsMap.address_info !== undefined ? settingsMap.address_info : defaults.address_info,
    };
  } catch (err) {
    console.error('Error fetching settings from database:', err);
    return getDefaultSettings();
  }
}
