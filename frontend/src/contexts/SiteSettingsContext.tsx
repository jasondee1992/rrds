import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  fallbackFounderImage,
  fallbackSiteSettings,
} from "../data/siteSettingsFallback";
import { API_BASE_URL } from "../services/api";
import { getPublicSiteSettings } from "../services/publicSettingsService";
import type { SiteSettings } from "../types/siteSettings";

type SiteSettingsContextValue = {
  settings: SiteSettings;
  founderImageUrl: string;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
};

const SiteSettingsContext = createContext<SiteSettingsContextValue | null>(null);

export function resolvePublicAssetUrl(value: string | undefined) {
  if (!value) {
    return fallbackFounderImage;
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  if (value.startsWith("/uploads/")) {
    const apiOrigin = new URL(API_BASE_URL).origin;
    return `${apiOrigin}${value}`;
  }

  return value;
}

function mergeSettings(settings: SiteSettings) {
  const aboutSettings = settings.about ?? fallbackSiteSettings.about;
  const servicesSettings = settings.services ?? fallbackSiteSettings.services;

  return {
    company: {
      ...fallbackSiteSettings.company,
      ...settings.company,
    },
    socialLinks: {
      ...settings.socialLinks,
    },
    founder: {
      ...fallbackSiteSettings.founder,
      ...settings.founder,
      expertise:
        settings.founder.expertise.length > 0
          ? settings.founder.expertise
          : fallbackSiteSettings.founder.expertise,
    },
    home: {
      ...fallbackSiteSettings.home,
      ...settings.home,
      stats: settings.home.stats.length > 0 ? settings.home.stats : fallbackSiteSettings.home.stats,
      carouselImages: settings.home.carouselImages,
    },
    services: servicesSettings.length > 0 ? servicesSettings : fallbackSiteSettings.services,
    about: {
      ...fallbackSiteSettings.about,
      ...aboutSettings,
      introParagraphs:
        aboutSettings.introParagraphs.length > 0
          ? aboutSettings.introParagraphs
          : fallbackSiteSettings.about.introParagraphs,
      coreValues:
        aboutSettings.coreValues.length > 0
          ? aboutSettings.coreValues
          : fallbackSiteSettings.about.coreValues,
      whyItems:
        aboutSettings.whyItems.length > 0
          ? aboutSettings.whyItems
          : fallbackSiteSettings.about.whyItems,
    },
  };
}

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(fallbackSiteSettings);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSettings = useCallback(async () => {
    try {
      const result = await getPublicSiteSettings();
      setSettings(mergeSettings(result));
    } catch {
      setSettings((current) => current);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshSettings();
  }, [refreshSettings]);

  useEffect(() => {
    const handleRefresh = () => {
      void refreshSettings();
    };

    window.addEventListener("rrds:site-settings-updated", handleRefresh);
    return () => window.removeEventListener("rrds:site-settings-updated", handleRefresh);
  }, [refreshSettings]);

  const value = useMemo(
    () => ({
      settings,
      founderImageUrl: resolvePublicAssetUrl(settings.founder.imageUrl),
      isLoading,
      refreshSettings,
    }),
    [isLoading, refreshSettings, settings],
  );

  return (
    <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);

  if (!context) {
    throw new Error("useSiteSettings must be used inside SiteSettingsProvider.");
  }

  return context;
}
