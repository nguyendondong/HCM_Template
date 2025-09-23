import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  HeroContent,
  IntroductionContent,
  NavigationContent,
  FooterContent,
  SiteConfig
} from '../types/content';
import { contentService } from '../services/contentService';

// ===== ADDITIONAL LANDING PAGE CONTENT INTERFACES =====

interface DocumentsSection {
  title: string;
  subtitle: string;
  description: string;
  categories: DocumentCategory[];
  callToAction: {
    text: string;
    href: string;
  };
  isActive: boolean;
}

interface DocumentCategory {
  icon: string;
  title: string;
  description: string;
  items: string[];
  itemCount: number;
}

interface VRTechnologySection {
  title: string;
  subtitle: string;
  description: string;
  features: VRFeature[];
  experiences: VRExperience[];
  callToAction: {
    text: string;
    href: string;
  };
  isActive: boolean;
}

interface VRFeature {
  icon: string;
  title: string;
  description: string;
}

interface VRExperience {
  id: string;
  title: string;
  description: string;
  image: string;
  duration: string;
  difficulty: string;
}

// ===== MINI GAMES INTERFACES =====

interface MiniGameQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
  explanation: string;
}

interface MiniGameData {
  questions?: MiniGameQuestion[];
  categories?: Array<{
    name: string;
    questions: number;
    difficulty: string;
  }>;
  totalQuestions?: number;
  timePerQuestion?: number;
  passingScore?: number;
  puzzles?: Array<{
    id: string;
    name: string;
    image: string;
    pieces: number;
    difficulty: string;
  }>;
  quotes?: Array<{
    quote: string;
    context: string;
    meaning: string;
  }>;
  museums?: Array<{
    name: string;
    rooms: number;
    artifacts: number;
    virtualTour: string;
  }>;
  timelines?: Array<{
    name: string;
    events: number;
    timeSpan: string;
  }>;
  locations?: Array<{
    name: string;
    year: number;
    description: string;
    coordinates: [number, number];
  }>;
  matchingPairs?: number;
  timeLimit?: number;
  difficultyLevels?: number;
  hintSystem?: boolean;
  timeBonus?: boolean;
  interactiveElements?: boolean;
  audioGuide?: boolean;
  collectibles?: boolean;
}

interface MiniGameRewards {
  points: number[];
  badges: string[];
  unlockContent: string[];
}

interface MiniGame {
  id: string;
  title: string;
  description: string;
  gameType: string;
  difficulty: string;
  estimatedTime: string;
  players: number;
  maxScore: number;
  icon: string;
  color: string;
  category: string;
  tags: string[];
  gameData: MiniGameData;
  rewards: MiniGameRewards;
  isActive: boolean;
  isFeatured: boolean;
  order: number;
}

interface MiniGamesSection {
  title: string;
  subtitle: string;
  description: string;
  games: MiniGame[];
  achievements: Array<{
    icon: string;
    title: string;
    count: string;
    description: string;
  }>;
  leaderboard: Array<{
    rank: number;
    name: string;
    score: string;
    badge: string;
  }>;
}

// ===== CONTENT CONTEXT INTERFACES =====

interface ContentContextType {
  // Content state
  heroContent: HeroContent | null;
  introductionContent: IntroductionContent | null;
  documentsSection: DocumentsSection | null;
  vrTechnologySection: VRTechnologySection | null;
  miniGamesSection: MiniGamesSection | null;
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
  const [documentsSection, setDocumentsSection] = useState<DocumentsSection | null>(null);
  const [vrTechnologySection, setVrTechnologySection] = useState<VRTechnologySection | null>(null);
  const [miniGamesSection, setMiniGamesSection] = useState<MiniGamesSection | null>(null);
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

      // Load documents section from landing page data (since it's not in Firestore yet)
      const landingPageModule = await import('../../data/seed/landing-page-content.json');
      const documentsData = landingPageModule.default.documentsSection;
      const vrTechnologyData = landingPageModule.default.vrTechnologySection;

      // Load mini games from mini-games-refined.json
      const miniGamesModule = await import('../../data/seed/mini-games-refined.json');
      const miniGamesData: MiniGamesSection = {
        title: "Mini Games giáo dục",
        subtitle: "Học lịch sử qua trò chơi",
        description: "Học lịch sử một cách vui vẻ và hấp dẫn thông qua các trò chơi tương tác, giúp củng cố kiến thức và tạo động lực học tập.",
        games: miniGamesModule.default as MiniGame[],
        achievements: [
          { icon: "Trophy", title: "Thành tích đạt được", count: "2,450", description: "Tổng số điểm tích lũy" },
          { icon: "Star", title: "Quiz hoàn thành", count: "156", description: "Số quiz đã hoàn thành" },
          { icon: "Target", title: "Cấp độ hiện tại", count: "12", description: "Level cao nhất đạt được" }
        ],
        leaderboard: [
          { rank: 1, name: "Nguyễn Văn A", score: "2,450", badge: "🥇" },
          { rank: 2, name: "Trần Thị B", score: "2,380", badge: "🥈" },
          { rank: 3, name: "Lê Văn C", score: "2,290", badge: "🥉" },
          { rank: 4, name: "Phạm Thị D", score: "2,150", badge: "🏅" },
          { rank: 5, name: "Hoàng Văn E", score: "2,100", badge: "🏅" }
        ]
      };

      // Update state
      setHeroContent(heroData);
      setIntroductionContent(introData);
      setDocumentsSection(documentsData);
      setVrTechnologySection(vrTechnologyData);
      setMiniGamesSection(miniGamesData);
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
    documentsSection,
    vrTechnologySection,
    miniGamesSection,
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

// Hook specifically for introduction content with loading state
export function useIntroductionContent(): {
  content: IntroductionContent | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
} {
  const { introductionContent, isLoading, refreshContent } = useContent();

  const refreshIntroductionContent = async () => {
    try {
      await refreshContent();
    } catch (err) {
      console.error('Error refreshing introduction content:', err);
    }
  };

  return {
    content: introductionContent,
    isLoading,
    refresh: refreshIntroductionContent
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

// Hook specifically for documents section
export function useDocumentsSection(): {
  content: DocumentsSection | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
  categories: DocumentCategory[];
} {
  const { documentsSection, isLoading, refreshContent } = useContent();

  return {
    content: documentsSection,
    isLoading,
    refresh: refreshContent,
    categories: documentsSection?.categories || []
  };
}

// Hook specifically for VR technology section
export function useVRTechnologySection(): {
  content: VRTechnologySection | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
  features: VRFeature[];
  experiences: VRExperience[];
} {
  const { vrTechnologySection, isLoading, refreshContent } = useContent();

  return {
    content: vrTechnologySection,
    isLoading,
    refresh: refreshContent,
    features: vrTechnologySection?.features || [],
    experiences: vrTechnologySection?.experiences || []
  };
}

// Hook specifically for mini games section
export function useMiniGamesSection(): {
  content: MiniGamesSection | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
  games: MiniGame[];
  featuredGames: MiniGame[];
  achievements: Array<{
    icon: string;
    title: string;
    count: string;
    description: string;
  }>;
  leaderboard: Array<{
    rank: number;
    name: string;
    score: string;
    badge: string;
  }>;
} {
  const { miniGamesSection, isLoading, refreshContent } = useContent();

  return {
    content: miniGamesSection,
    isLoading,
    refresh: refreshContent,
    games: miniGamesSection?.games || [],
    featuredGames: miniGamesSection?.games.filter(game => game.isFeatured) || [],
    achievements: miniGamesSection?.achievements || [],
    leaderboard: miniGamesSection?.leaderboard || []
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
