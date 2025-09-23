import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  DocumentsContent,
  VRContent,
  MiniGameContent
} from '../types/content';
import { contentService } from '../services/contentService';

// ===== PAGE CONTENT CONTEXT INTERFACES =====

interface PageContentContextType {
  // Content state
  documentsContent: DocumentsContent | null;
  vrContent: VRContent | null;
  miniGameContent: MiniGameContent | null;

  // Loading states
  isLoading: boolean;
  isInitialized: boolean;

  // Error handling
  error: string | null;

  // Refresh functions
  refreshContent: () => Promise<void>;
  refreshDocumentsContent: () => Promise<void>;
  refreshVRContent: () => Promise<void>;
  refreshMiniGameContent: () => Promise<void>;
}

// ===== PAGE CONTENT CONTEXT =====

const PageContentContext = createContext<PageContentContextType | undefined>(undefined);

// ===== PAGE CONTENT PROVIDER =====

interface PageContentProviderProps {
  children: ReactNode;
  enableRealTimeUpdates?: boolean;
}

export function PageContentProvider({
  children,
  enableRealTimeUpdates = true
}: PageContentProviderProps): JSX.Element {
  // State management
  const [documentsContent, setDocumentsContent] = useState<DocumentsContent | null>(null);
  const [vrContent, setVRContent] = useState<VRContent | null>(null);
  const [miniGameContent, setMiniGameContent] = useState<MiniGameContent | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ===== INITIAL CONTENT LOADING =====

  const loadInitialContent = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Load all page content in parallel
      const [
        documentsData,
        vrData,
        miniGameData
      ] = await Promise.all([
        contentService.getDocumentsContent(),
        contentService.getVRContent(),
        contentService.getMiniGameContent()
      ]);

      // Update state
      setDocumentsContent(documentsData);
      setVRContent(vrData);
      setMiniGameContent(miniGameData);

      setIsInitialized(true);
    } catch (err) {
      console.error('Error loading initial page content:', err);
      setError('Không thể tải nội dung trang. Vui lòng thử lại.');
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

    // Subscribe to documents content changes
    const unsubscribeDocuments = contentService.subscribeToContent<DocumentsContent>('documentsContent', (content: DocumentsContent | null) => {
      setDocumentsContent(content);
    });
    unsubscribers.push(unsubscribeDocuments);

    // Subscribe to VR content changes
    const unsubscribeVR = contentService.subscribeToContent<VRContent>('vrContent', (content: VRContent | null) => {
      setVRContent(content);
    });
    unsubscribers.push(unsubscribeVR);

    // Subscribe to mini game content changes
    const unsubscribeMiniGame = contentService.subscribeToContent<MiniGameContent>('miniGameContent', (content: MiniGameContent | null) => {
      setMiniGameContent(content);
    });
    unsubscribers.push(unsubscribeMiniGame);

    // Cleanup subscriptions
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [enableRealTimeUpdates]);

  // ===== REFRESH FUNCTIONS =====

  const refreshContent = async (): Promise<void> => {
    await loadInitialContent();
  };

  const refreshDocumentsContent = async (): Promise<void> => {
    try {
      const content = await contentService.getDocumentsContent();
      setDocumentsContent(content);
    } catch (err) {
      console.error('Error refreshing documents content:', err);
    }
  };

  const refreshVRContent = async (): Promise<void> => {
    try {
      const content = await contentService.getVRContent();
      setVRContent(content);
    } catch (err) {
      console.error('Error refreshing VR content:', err);
    }
  };

  const refreshMiniGameContent = async (): Promise<void> => {
    try {
      const content = await contentService.getMiniGameContent();
      setMiniGameContent(content);
    } catch (err) {
      console.error('Error refreshing mini game content:', err);
    }
  };

  // ===== CONTEXT VALUE =====

  const contextValue: PageContentContextType = {
    // Content state
    documentsContent,
    vrContent,
    miniGameContent,

    // Loading states
    isLoading,
    isInitialized,

    // Error handling
    error,

    // Refresh functions
    refreshContent,
    refreshDocumentsContent,
    refreshVRContent,
    refreshMiniGameContent
  };

  return (
    <PageContentContext.Provider value={contextValue}>
      {children}
    </PageContentContext.Provider>
  );
}

// ===== HOOK FOR USING PAGE CONTENT CONTEXT =====

export function usePageContent(): PageContentContextType {
  const context = useContext(PageContentContext);

  if (context === undefined) {
    throw new Error('usePageContent must be used within a PageContentProvider');
  }

  return context;
}

// ===== SPECIALIZED HOOKS =====

// Hook specifically for documents content
export function useDocumentsContent(): {
  content: DocumentsContent | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
  categories: DocumentsContent['categories'] | [];
  featuredDocumentId: DocumentsContent['featuredDocumentId'] | null;
} {
  const { documentsContent, isLoading, refreshDocumentsContent } = usePageContent();

  return {
    content: documentsContent,
    isLoading,
    refresh: refreshDocumentsContent,
    categories: documentsContent?.categories || [],
    featuredDocumentId: documentsContent?.featuredDocumentId || null
  };
}

// Hook for VR content
export function useVRContent(): {
  content: VRContent | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
  features: VRContent['features'] | [];
  experiences: VRContent['experiences'] | [];
  benefits: VRContent['benefits'] | null;
} {
  const { vrContent, isLoading, refreshVRContent } = usePageContent();

  return {
    content: vrContent,
    isLoading,
    refresh: refreshVRContent,
    features: vrContent?.features || [],
    experiences: vrContent?.experiences || [],
    benefits: vrContent?.benefits || null
  };
}

// Hook for mini game content
export function useMiniGameContent(): {
  content: MiniGameContent | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
  games: MiniGameContent['games'] | [];
  achievements: MiniGameContent['achievements'] | [];
  leaderboard: MiniGameContent['leaderboard'] | [];
} {
  const { miniGameContent, isLoading, refreshMiniGameContent } = usePageContent();

  return {
    content: miniGameContent,
    isLoading,
    refresh: refreshMiniGameContent,
    games: miniGameContent?.games || [],
    achievements: miniGameContent?.achievements || [],
    leaderboard: miniGameContent?.leaderboard || []
  };
}

// Hook for page content loading states
export function usePageContentLoadingState(): {
  isAnyLoading: boolean;
  isAllLoaded: boolean;
  loadedPages: string[];
  missingPages: string[];
} {
  const {
    documentsContent,
    vrContent,
    miniGameContent,
    isLoading
  } = usePageContent();

  const pages = {
    documents: documentsContent,
    vr: vrContent,
    miniGame: miniGameContent
  };

  const loadedPages = Object.entries(pages)
    .filter(([, content]) => content !== null)
    .map(([name]) => name);

  const missingPages = Object.entries(pages)
    .filter(([, content]) => content === null)
    .map(([name]) => name);

  return {
    isAnyLoading: isLoading,
    isAllLoaded: missingPages.length === 0 && !isLoading,
    loadedPages,
    missingPages
  };
}
