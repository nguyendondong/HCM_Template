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
  sourceCategory?: string; // ID from documents-refined.json
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
        configData,
        documentsCategories,
        documents
      ] = await Promise.all([
        contentService.getHeroContent(),
        contentService.getIntroductionContent(),
        contentService.getNavigationContent(),
        contentService.getFooterContent(),
        contentService.getSiteConfig(),
        contentService.getDocumentCategories(),
        contentService.getDocuments()
      ]);

      // Load documents section configuration from landing page data

      // Load VR content using dedicated service
      const { vrContentService } = await import('../services/vrContentService');
      const vrContentData = await vrContentService.getVRContent();

      // Convert VRContent to VRTechnologySection format
      const vrTechnologyData: VRTechnologySection | null = vrContentData ? {
        title: vrContentData.title,
        subtitle: vrContentData.subtitle,
        description: vrContentData.description,
        features: vrContentData.features,
        experiences: vrContentData.experiences.map(exp => ({
          id: exp.id,
          title: exp.title,
          description: exp.description,
          image: exp.imageUrl,
          duration: exp.duration || 'N/A', // Default duration
          difficulty: exp.difficulty || 'N/A' // Default difficulty
        })),
        callToAction: {
          text: "Khám phá VR",
          href: "/vr"
        },
        isActive: vrContentData.isActive
      } : null;

      // Load Mini Games content using dedicated service
      const { modernMiniGamesService } = await import('../services/miniGamesService');
      const gamesFromFirestore = await modernMiniGamesService.getAllGames({ isActive: true });

      // Convert Firestore games to legacy format for compatibility
      const convertedGames: MiniGame[] = gamesFromFirestore.map(game => ({
        id: game.id,
        title: game.title,
        description: game.description,
        gameType: game.gameType,
        difficulty: game.difficulty,
        estimatedTime: game.estimatedTime,
        players: game.players,
        maxScore: game.maxScore,
        icon: game.icon,
        color: game.color,
        category: game.category,
        tags: game.tags,
        gameData: {
          ...game.gameData,
          questions: game.gameData.questions?.map((q, index) => ({
            id: parseInt(q.id) || index + 1,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            points: 100, // Default points
            explanation: q.explanation || 'Không có giải thích'
          }))
        },
        rewards: {
          points: Array.isArray(game.rewards.points) ? game.rewards.points : [game.rewards.points],
          badges: game.rewards.badges,
          unlockContent: game.rewards.unlocks || []
        },
        isActive: game.isActive,
        isFeatured: game.isFeatured,
        order: game.order
      }));

      // Create documents section with Firestore data
      const documentsData: DocumentsSection = {
        title: "Tài Liệu Lịch Sử",
        subtitle: "Kho tàng tài liệu quý",
        description: "Khám phá bộ sưu tập tài liệu lịch sử quý giá về Chủ tịch Hồ Chí Minh và lịch sử Việt Nam.",
        callToAction: {
          text: "Xem tất cả tài liệu",
          href: "/documents"
        },
        isActive: true,
        categories: documentsCategories.map((category: any) => ({
          icon: category.icon,
          title: category.name,
          description: category.description,
          sourceCategory: category.id,
          items: documents
            .filter((doc: any) => doc.category === category.id && doc.isActive)
            .slice(0, 4)
            .map((doc: any) => doc.title),
          itemCount: documents
            .filter((doc: any) => doc.category === category.id && doc.isActive).length
        }))
      };

      const miniGamesData: MiniGamesSection = {
        title: "Mini Games giáo dục",
        subtitle: "Học lịch sử qua trò chơi",
        description: "Học lịch sử một cách vui vẻ và hấp dẫn thông qua các trò chơi tương tác, giúp củng cố kiến thức và tạo động lực học tập.",
        games: convertedGames,
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
  getDocuments: () => Promise<any[]>;
  getDocumentsByCategory: (category: string) => Promise<any[]>;
  getFeaturedDocuments: () => Promise<any[]>;
} {
  const { documentsSection, isLoading, refreshContent } = useContent();
  const [dynamicCategories, setDynamicCategories] = useState<DocumentCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Load categories from Firestore
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        const categories = await contentService.getDocumentCategories();

        // Convert Firestore categories to DocumentCategory format
        const formattedCategories = await Promise.all(
          categories.map(async (category) => {
            const documents = await contentService.getDocumentsByCategory(category.id);
            return {
              icon: category.icon,
              title: category.name,
              description: category.description,
              sourceCategory: category.id,
              items: documents.slice(0, 4).map(doc => doc.title), // Show first 4 documents
              itemCount: documents.length
            };
          })
        );

        setDynamicCategories(formattedCategories);
      } catch (error) {
        console.error('Error loading document categories:', error);
        // Fallback to static categories if available
        setDynamicCategories(documentsSection?.categories || []);
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, [documentsSection]);

  const getDocuments = async () => {
    return contentService.getDocuments();
  };

  const getDocumentsByCategory = async (category: string) => {
    return contentService.getDocumentsByCategory(category);
  };

  const getFeaturedDocuments = async () => {
    return contentService.getFeaturedDocuments();
  };

  return {
    content: documentsSection,
    isLoading: isLoading || categoriesLoading,
    refresh: refreshContent,
    categories: dynamicCategories,
    getDocuments,
    getDocumentsByCategory,
    getFeaturedDocuments
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
