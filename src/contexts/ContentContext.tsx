import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  HeroContent,
  IntroductionContent,
  NavigationContent,
  FooterContent,
  SiteConfig
} from '../types/content';
import { contentService } from '../services/contentService';

// ===== CONTENT CONTEXT INTERFACES =====

interface ContentContextType {
  // Content state
  heroContent: HeroContent | null;
  introductionContent: IntroductionContent | null;
  navigationContent: NavigationContent | null;
  footerContent: FooterContent | null;
  siteConfig: SiteConfig | null;

  // Loading states
  isLoading: boolean;
  isInitialized: boolean;

  // Error handling
  error: string | null;

  // Refresh functions
  refreshContent: () => Promise<void>;
  refreshHeroContent: () => Promise<void>;
  refreshNavigationContent: () => Promise<void>;

  // Utility functions
  isMaintenanceMode: () => boolean;
  getFeatureStatus: (feature: keyof SiteConfig['features']) => boolean;
}

// ===== CONTENT CONTEXT =====

const ContentContext = createContext<ContentContextType | undefined>(undefined);

// ===== CONTENT PROVIDER =====

interface ContentProviderProps {
  children: ReactNode;
  enableRealTimeUpdates?: boolean;
}

export function ContentProvider({
  children,
  enableRealTimeUpdates = true
}: ContentProviderProps): JSX.Element {
  // State management
  const [heroContent, setHeroContent] = useState<HeroContent | null>(null);
  const [introductionContent, setIntroductionContent] = useState<IntroductionContent | null>(null);
  const [navigationContent, setNavigationContent] = useState<NavigationContent | null>(null);
  const [footerContent, setFooterContent] = useState<FooterContent | null>(null);
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ===== INITIAL CONTENT LOADING =====

  const loadInitialContent = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Load all content in parallel
      const [
        heroData,
        introData,
        navData,
        footerData,
        configData
      ] = await Promise.all([
        contentService.getHeroContent(),
        contentService.getIntroductionContent(),
        contentService.getNavigationContent(),
        contentService.getFooterContent(),
        contentService.getSiteConfig()
      ]);

      // Update state
      setHeroContent(heroData);
      setIntroductionContent(introData);
      setNavigationContent(navData);
      setFooterContent(footerData);
      setSiteConfig(configData);

      setIsInitialized(true);
    } catch (err) {
      console.error('Error loading initial content:', err);
      setError('Không thể tải nội dung. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // ===== REAL-TIME SUBSCRIPTIONS =====

  useEffect(() => {
    // Load initial content
    loadInitialContent();

    // Setup real-time subscriptions if enabled
    if (!enableRealTimeUpdates) return;

    const unsubscribers: (() => void)[] = [];

    // Subscribe to hero content changes
    const unsubscribeHero = contentService.subscribeToHeroContent((content) => {
      setHeroContent(content);
    });
    unsubscribers.push(unsubscribeHero);

    // Subscribe to navigation content changes
    const unsubscribeNav = contentService.subscribeToNavigationContent((content) => {
      setNavigationContent(content);
    });
    unsubscribers.push(unsubscribeNav);

    // Subscribe to site config changes
    const unsubscribeConfig = contentService.subscribeToSiteConfig((config) => {
      setSiteConfig(config);
    });
    unsubscribers.push(unsubscribeConfig);

    // Cleanup subscriptions
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [enableRealTimeUpdates]);

  // ===== REFRESH FUNCTIONS =====

  const refreshContent = async (): Promise<void> => {
    await loadInitialContent();
  };

  const refreshHeroContent = async (): Promise<void> => {
    try {
      const content = await contentService.getHeroContent();
      setHeroContent(content);
    } catch (err) {
      console.error('Error refreshing hero content:', err);
    }
  };

  const refreshNavigationContent = async (): Promise<void> => {
    try {
      const content = await contentService.getNavigationContent();
      setNavigationContent(content);
    } catch (err) {
      console.error('Error refreshing navigation content:', err);
    }
  };

  // ===== UTILITY FUNCTIONS =====

  const isMaintenanceMode = (): boolean => {
    return siteConfig?.maintenance?.enabled ?? false;
  };

  const getFeatureStatus = (feature: keyof SiteConfig['features']): boolean => {
    return siteConfig?.features?.[feature] ?? false;
  };

  // ===== CONTEXT VALUE =====

  const contextValue: ContentContextType = {
    // Content state
    heroContent,
    introductionContent,
    navigationContent,
    footerContent,
    siteConfig,

    // Loading states
    isLoading,
    isInitialized,

    // Error handling
    error,

    // Refresh functions
    refreshContent,
    refreshHeroContent,
    refreshNavigationContent,

    // Utility functions
    isMaintenanceMode,
    getFeatureStatus
  };

  return (
    <ContentContext.Provider value={contextValue}>
      {children}
    </ContentContext.Provider>
  );
}

// ===== HOOK FOR USING CONTENT CONTEXT =====

export function useContent(): ContentContextType {
  const context = useContext(ContentContext);

  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }

  return context;
}

// ===== SPECIALIZED HOOKS =====

// Hook specifically for hero content with loading state
export function useHeroContent(): {
  content: HeroContent | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
} {
  const { heroContent, isLoading, refreshHeroContent } = useContent();

  return {
    content: heroContent,
    isLoading,
    refresh: refreshHeroContent
  };
}

// Hook for navigation with active menu item tracking
export function useNavigation(): {
  content: NavigationContent | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
  getActiveMenuItems: () => NavigationContent['menuItems'];
} {
  const { navigationContent, isLoading, refreshNavigationContent } = useContent();

  const getActiveMenuItems = () => {
    if (!navigationContent) return [];
    return navigationContent.menuItems
      .filter(item => item.isActive)
      .sort((a, b) => a.order - b.order);
  };

  return {
    content: navigationContent,
    isLoading,
    refresh: refreshNavigationContent,
    getActiveMenuItems
  };
}

// Hook for site configuration with feature checks
export function useSiteConfig(): {
  config: SiteConfig | null;
  isLoading: boolean;
  isMaintenanceMode: boolean;
  isFeatureEnabled: (feature: keyof SiteConfig['features']) => boolean;
  getThemeColors: () => { primary: string; secondary: string; accent: string } | null;
} {
  const { siteConfig, isLoading, isMaintenanceMode, getFeatureStatus } = useContent();

  const isFeatureEnabled = (feature: keyof SiteConfig['features']) => {
    return getFeatureStatus(feature);
  };

  const getThemeColors = () => {
    if (!siteConfig) return null;
    return {
      primary: siteConfig.primaryColor,
      secondary: siteConfig.secondaryColor,
      accent: siteConfig.accentColor
    };
  };

  return {
    config: siteConfig,
    isLoading,
    isMaintenanceMode: isMaintenanceMode(),
    isFeatureEnabled,
    getThemeColors
  };
}

// Hook for content loading states across all sections
export function useContentLoadingState(): {
  isAnyLoading: boolean;
  isAllLoaded: boolean;
  loadedSections: string[];
  missingSections: string[];
} {
  const {
    heroContent,
    introductionContent,
    navigationContent,
    footerContent,
    siteConfig,
    isLoading
  } = useContent();

  const sections = {
    hero: heroContent,
    introduction: introductionContent,
    navigation: navigationContent,
    footer: footerContent,
    config: siteConfig
  };

  const loadedSections = Object.entries(sections)
    .filter(([, content]) => content !== null)
    .map(([name]) => name);

  const missingSections = Object.entries(sections)
    .filter(([, content]) => content === null)
    .map(([name]) => name);

  return {
    isAnyLoading: isLoading,
    isAllLoaded: missingSections.length === 0 && !isLoading,
    loadedSections,
    missingSections
  };
}
