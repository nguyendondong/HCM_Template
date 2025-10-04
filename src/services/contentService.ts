import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  writeBatch,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  HeroContent,
  IntroductionContent,
  DocumentsContent,
  VRContent,
  MiniGameContent,
  NavigationContent,
  FooterContent,
  SiteConfig,
  SystemNotification
} from '../types/content';

// ===== CONTENT MANAGEMENT SERVICE =====

class ContentService {
  // Generic CRUD operations for any content type
  private async getActiveContent<T>(collectionName: string): Promise<T | null> {
    try {
      const q = query(
        collection(db, collectionName),
        where('isActive', '==', true),
        limit(1)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as T;
    } catch (error) {
      console.error(`Error fetching active ${collectionName}:`, error);
      throw error;
    }
  }

  private async updateContent<T>(
    collectionName: string,
    id: string,
    data: Partial<T>
  ): Promise<void> {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error(`Error updating ${collectionName}:`, error);
      throw error;
    }
  }

  private async createContent<T>(
    collectionName: string,
    data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error(`Error creating ${collectionName}:`, error);
      throw error;
    }
  }

  // ===== HERO SECTION =====
  async getHeroContent(): Promise<HeroContent | null> {
    return this.getActiveContent<HeroContent>('heroContent');
  }

  async updateHeroContent(id: string, data: Partial<HeroContent>): Promise<void> {
    return this.updateContent<HeroContent>('heroContent', id, data);
  }

  async createHeroContent(data: Omit<HeroContent, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return this.createContent<HeroContent>('heroContent', data);
  }

  // ===== INTRODUCTION SECTION =====
  async getIntroductionContent(): Promise<IntroductionContent | null> {
    return this.getActiveContent<IntroductionContent>('introductionContent');
  }

  async updateIntroductionContent(id: string, data: Partial<IntroductionContent>): Promise<void> {
    return this.updateContent<IntroductionContent>('introductionContent', id, data);
  }

  async createIntroductionContent(data: Omit<IntroductionContent, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return this.createContent<IntroductionContent>('introductionContent', data);
  }

  // ===== DOCUMENTS SECTION =====
  async getDocumentsContent(): Promise<DocumentsContent | null> {
    // Use dedicated documents service instead of generic content lookup
    const { documentsService } = await import('./documentsService');

    try {
      // Try to get from documentsContent collection first
      const documentsContentResult = await this.getActiveContent<DocumentsContent>('documentsContent');
      if (documentsContentResult) {
        return documentsContentResult;
      }

      // If no documentsContent document, construct from document-categories
      const categories = await documentsService.getCategories();
      const categoryIds = categories.map(cat => cat.id);

      return {
        id: 'constructed',
        title: "Tài Liệu Lịch Sử",
        subtitle: "Kho tàng tài liệu quý",
        description: "Khám phá bộ sưu tập tài liệu lịch sử quý giá về Chủ tịch Hồ Chí Minh và lịch sử Việt Nam.",
        categories: categoryIds,
        layout: 'grid',
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      } as DocumentsContent;

    } catch (error) {
      console.error('Error in getDocumentsContent:', error);
      return null;
    }
  }

  async updateDocumentsContent(id: string, data: Partial<DocumentsContent>): Promise<void> {
    return this.updateContent<DocumentsContent>('documentsContent', id, data);
  }

  async createDocumentsContent(data: Omit<DocumentsContent, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return this.createContent<DocumentsContent>('documentsContent', data);
  }

  // ===== DOCUMENT CATEGORIES =====
  async getDocumentCategories(): Promise<any[]> {
    try {
      const q = query(
        collection(db, 'document-categories'),
        where('isActive', '==', true),
        orderBy('order', 'asc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching document categories:', error);
      return [];
    }
  }

  // ===== DOCUMENTS =====
  async getDocuments(): Promise<any[]> {
    try {
      const q = query(
        collection(db, 'documents'),
        where('isActive', '==', true),
        orderBy('order', 'asc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching documents:', error);

      // Fallback: Try without orderBy if index is missing
      try {
        const fallbackQ = query(
          collection(db, 'documents'),
          where('isActive', '==', true)
        );

        const snapshot = await getDocs(fallbackQ);
        const docs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Sort manually
        return docs.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
      } catch (fallbackError) {
        console.error('Fallback query also failed:', fallbackError);
        return [];
      }
    }
  }

  async getDocumentsByCategory(category: string): Promise<any[]> {
    try {
      const q = query(
        collection(db, 'documents'),
        where('category', '==', category),
        where('isActive', '==', true),
        orderBy('order', 'asc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      } catch (indexError) {
        // Fallback for category-specific queries
        try {
          const categoryFallbackQ = query(
            collection(db, 'documents'),
            where('category', '==', category),
            where('isActive', '==', true)
          );

          const snapshot = await getDocs(categoryFallbackQ);
          const docs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

        // Sort manually
        return docs.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
      } catch (fallbackError) {
        console.error('Fallback query for category also failed:', fallbackError);
        return [];
      }
    }
  }

  async getFeaturedDocuments(limitCount: number = 6): Promise<any[]> {
    try {
      const q = query(
        collection(db, 'documents'),
        where('isFeatured', '==', true),
        where('isActive', '==', true),
        orderBy('order', 'asc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching featured documents:', error);
      return [];
    }
  }

  // ===== VR TECHNOLOGY SECTION =====
  async getVRContent(): Promise<VRContent | null> {
    // Use dedicated VR service instead of generic content lookup
    const { vrContentService } = await import('./vrContentService');
    return vrContentService.getVRContent();
  }

  async updateVRContent(id: string, data: Partial<VRContent>): Promise<void> {
    return this.updateContent<VRContent>('vrContent', id, data);
  }

  async createVRContent(data: Omit<VRContent, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return this.createContent<VRContent>('vrContent', data);
  }

  // ===== MINI GAME SECTION =====
  async getMiniGameContent(): Promise<MiniGameContent | null> {
    // Use dedicated mini games service instead of generic content lookup
    const { modernMiniGamesService } = await import('./miniGamesService');

    try {
      // Try to get from miniGameContent collection first
      const miniGameContentResult = await this.getActiveContent<MiniGameContent>('miniGameContent');
      if (miniGameContentResult) {
        return miniGameContentResult;
      }

      // If no miniGameContent document, construct from mini-games collection
      const games = await modernMiniGamesService.getAllGames({ isActive: true });

      // Convert to legacy format for compatibility
      const legacyGames = games.map(game => ({
        id: game.id,
        title: game.title,
        description: game.description,
        difficulty: game.difficulty,
        playerCount: `${game.players} người chơi`,
        icon: game.icon,
        color: game.color,
        gameUrl: `/games/${game.id}`
      }));

      const achievements = [
        { icon: "Trophy", title: "Thành tích đạt được", count: "2,450", description: "Tổng số điểm tích lũy" },
        { icon: "Star", title: "Quiz hoàn thành", count: "156", description: "Số quiz đã hoàn thành" },
        { icon: "Target", title: "Cấp độ hiện tại", count: "12", description: "Level cao nhất đạt được" }
      ];

      const leaderboard = [
        { rank: 1, name: "Nguyễn Văn A", score: "2,450", badge: "🥇" },
        { rank: 2, name: "Trần Thị B", score: "2,380", badge: "🥈" },
        { rank: 3, name: "Lê Văn C", score: "2,290", badge: "🥉" },
        { rank: 4, name: "Phạm Thị D", score: "2,150", badge: "🏅" },
        { rank: 5, name: "Hoàng Văn E", score: "2,100", badge: "🏅" }
      ];

      return {
        id: 'constructed',
        title: "Mini Games Giáo Dục",
        subtitle: "Học lịch sử qua trò chơi",
        description: "Học lịch sử một cách vui vẻ và hấp dẫn thông qua các trò chơi tương tác.",
        games: legacyGames,
        achievements,
        leaderboard,
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      } as MiniGameContent;

    } catch (error) {
      console.error('Error in getMiniGameContent:', error);
      return null;
    }
  }

  async updateMiniGameContent(id: string, data: Partial<MiniGameContent>): Promise<void> {
    return this.updateContent<MiniGameContent>('miniGameContent', id, data);
  }

  async createMiniGameContent(data: Omit<MiniGameContent, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return this.createContent<MiniGameContent>('miniGameContent', data);
  }

  // ===== NAVIGATION =====
  async getNavigationContent(): Promise<NavigationContent | null> {
    return this.getActiveContent<NavigationContent>('navigationContent');
  }

  async updateNavigationContent(id: string, data: Partial<NavigationContent>): Promise<void> {
    return this.updateContent<NavigationContent>('navigationContent', id, data);
  }

  async createNavigationContent(data: Omit<NavigationContent, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return this.createContent<NavigationContent>('navigationContent', data);
  }

  // ===== FOOTER =====
  async getFooterContent(): Promise<FooterContent | null> {
    return this.getActiveContent<FooterContent>('footerContent');
  }

  async updateFooterContent(id: string, data: Partial<FooterContent>): Promise<void> {
    return this.updateContent<FooterContent>('footerContent', id, data);
  }

  async createFooterContent(data: Omit<FooterContent, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return this.createContent<FooterContent>('footerContent', data);
  }

  // ===== SITE CONFIGURATION =====
  async getSiteConfig(): Promise<SiteConfig | null> {
    try {
      const docRef = doc(db, 'siteConfig', 'main');
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) return null;

      return { id: docSnap.id, ...docSnap.data() } as SiteConfig;
    } catch (error) {
      console.error('Error fetching site config:', error);
      throw error;
    }
  }

  async updateSiteConfig(data: Partial<SiteConfig>): Promise<void> {
    try {
      const docRef = doc(db, 'siteConfig', 'main');
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating site config:', error);
      throw error;
    }
  }

  // ===== SYSTEM NOTIFICATIONS =====
  async getActiveNotifications(): Promise<SystemNotification[]> {
    try {
      const now = Timestamp.now();
      const q = query(
        collection(db, 'systemNotifications'),
        where('isActive', '==', true),
        where('displayFrom', '<=', now),
        orderBy('displayFrom', 'desc'),
        orderBy('priority', 'desc')
      );

      const snapshot = await getDocs(q);
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SystemNotification[];

      // Filter out expired notifications
      return notifications.filter(notification =>
        !notification.displayUntil || notification.displayUntil > now
      );
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  async createNotification(data: Omit<SystemNotification, 'id' | 'createdAt'>): Promise<string> {
    return this.createContent<SystemNotification>('systemNotifications', data);
  }

  async deactivateNotification(id: string): Promise<void> {
    return this.updateContent<SystemNotification>('systemNotifications', id, { isActive: false });
  }

  // ===== BATCH OPERATIONS =====
  async initializeDefaultContent(): Promise<void> {
    try {
      const batch = writeBatch(db);

      // Default Hero Content
      const heroRef = doc(collection(db, 'heroContent'));
      batch.set(heroRef, {
        title: "Hành Trình Địa điểm ",
        subtitle: "Khám Phá Địa điểm  Văn Hóa Việt Nam",
        description: "Trải nghiệm tương tác với những Địa điểm  văn hóa quý giá của Việt Nam thông qua công nghệ VR và AR hiện đại",
        stats: [
          { icon: "MapPin", number: "50+", label: "Di tích lịch sử", color: "text-blue-400" },
          { icon: "Users", number: "10K+", label: "Người tham quan", color: "text-green-400" },
          { icon: "Clock", number: "24/7", label: "Truy cập trực tuyến", color: "text-purple-400" },
          { icon: "Star", number: "4.9/5", label: "Đánh giá", color: "text-yellow-400" }
        ],
        actionButton: {
          text: "Bắt đầu khám phá",
          targetSection: "introduction"
        },
        backgroundElements: {
          enableFlags: true,
          enableStars: true,
          enableDecorations: true
        },
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      // Default Navigation Content
      const navRef = doc(collection(db, 'navigationContent'));
      batch.set(navRef, {
        logo: {
          text: "Heritage Journey",
          iconName: "Compass"
        },
        menuItems: [
          { id: "home", label: "Trang chủ", href: "/", order: 1, isActive: true },
          { id: "map", label: "Bản đồ", href: "#map", targetSection: "map", order: 2, isActive: true },
          { id: "documents", label: "Tài liệu", href: "/documents", order: 3, isActive: true },
          { id: "games", label: "Trò chơi", href: "/games", order: 4, isActive: true },
          { id: "vr", label: "VR", href: "/vr", order: 5, isActive: true }
        ],
        mobileMenuEnabled: true,
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      // Default Site Config
      const configRef = doc(db, 'siteConfig', 'main');
      batch.set(configRef, {
        siteName: "Heritage Journey - Hành Trình Địa điểm ",
        siteDescription: "Khám phá Địa điểm  văn hóa Việt Nam thông qua công nghệ VR/AR",
        logoUrl: "/logo.png",
        faviconUrl: "/favicon.ico",
        primaryColor: "#1f2937",
        secondaryColor: "#3b82f6",
        accentColor: "#f59e0b",
        features: {
          vrEnabled: true,
          quizEnabled: true,
          commentsEnabled: true,
          analyticsEnabled: true,
          multiLanguageEnabled: false
        },
        seo: {
          metaTitle: "Heritage Journey - Khám Phá Địa điểm  Văn Hóa Việt Nam",
          metaDescription: "Trải nghiệm tương tác với Địa điểm  văn hóa Việt Nam qua công nghệ VR/AR hiện đại",
          keywords: ["Địa điểm  văn hóa", "Việt Nam", "VR", "AR", "lịch sử", "du lịch"],
          ogImageUrl: "/og-image.jpg"
        },
        socialMedia: {
          facebook: "https://facebook.com/heritagejourney",
          youtube: "https://youtube.com/heritagejourney"
        },
        contact: {
          email: "info@heritagejourney.vn",
          phone: "+84 123 456 789",
          address: "Hà Nội, Việt Nam"
        },
        maintenance: {
          enabled: false,
          message: "Website đang bảo trì, vui lòng quay lại sau."
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      await batch.commit();
    } catch (error) {
      console.error('Error initializing default content:', error);
      throw error;
    }
  }

  // ===== REAL-TIME SUBSCRIPTIONS =====
  subscribeToContent<T>(
    collectionName: string,
    callback: (content: T | null) => void
  ): () => void {
    const q = query(
      collection(db, collectionName),
      where('isActive', '==', true),
      limit(1)
    );

    return onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        callback(null);
        return;
      }

      const doc = snapshot.docs[0];
      const content = { id: doc.id, ...doc.data() } as T;
      callback(content);
    }, (error) => {
      console.error(`Error in ${collectionName} subscription:`, error);
      callback(null);
    });
  }

  subscribeToHeroContent(callback: (content: HeroContent | null) => void): () => void {
    return this.subscribeToContent<HeroContent>('heroContent', callback);
  }

  subscribeToNavigationContent(callback: (content: NavigationContent | null) => void): () => void {
    return this.subscribeToContent<NavigationContent>('navigationContent', callback);
  }

  subscribeToSiteConfig(callback: (config: SiteConfig | null) => void): () => void {
    const docRef = doc(db, 'siteConfig', 'main');
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() } as SiteConfig);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error('Error in site config subscription:', error);
      callback(null);
    });
  }

  // ===== INITIALIZE DEFAULT PAGE CONTENT =====
  async initializeDefaultPageContent(): Promise<void> {
    try {
      const batch = writeBatch(db);

      // Default Documents Content
      const defaultDocumentsContent = {
        title: "Tư liệu về Chủ tịch Hồ Chí Minh",
        subtitle: "Kho tàng tư liệu quý giá",
        description: "Kho tàng tư liệu quý giá về cuộc đời và sự nghiệp của vị lãnh tụ vĩ đại, bao gồm văn bản, hình ảnh và video lịch sử được sưu tập và bảo quản cẩn thận.",
        categories: [
          {
            id: 'declarations',
            icon: 'FileText',
            title: 'Tuyên ngôn và Văn kiện',
            description: 'Các văn bản chính thức quan trọng nhất',
            items: [
              'Tuyên ngôn độc lập 2/9/1945',
              'Di chúc của Chủ tịch Hồ Chí Minh',
              'Lời kêu gọi toàn quốc kháng chiến'
            ]
          },
          {
            id: 'writings',
            icon: 'BookOpen',
            title: 'Tác phẩm và Bài viết',
            description: 'Những bài viết, tác phẩm của Chủ tịch Hồ Chí Minh',
            items: [
              'Đường Kách mệnh',
              'Nhật ký trong tù'
            ]
          },
          {
            id: 'photos',
            icon: 'Image',
            title: 'Hình ảnh lịch sử',
            description: 'Bộ sưu tập ảnh quý hiếm về cuộc đời Bác',
            items: [
              'Ảnh thời trẻ ở Paris',
              'Ảnh trong chiến khu Việt Bắc'
            ]
          },
          {
            id: 'videos',
            icon: 'Video',
            title: 'Video tư liệu',
            description: 'Những thước phim quý giá ghi lại hoạt động của Bác',
            items: [
              'Đọc Tuyên ngôn độc lập',
              'Gặp gỡ đại biểu các dân tộc'
            ]
          }
        ],
        featuredDocument: {
          title: "Tài liệu nổi bật: Tuyên ngôn độc lập 2/9/1945",
          quote: "Tất cả mọi người đều sinh ra có quyền bình đẳng. Tạo hóa cho họ những quyền không ai có thể xâm phạm được; trong những quyền ấy, có quyền được sống, quyền tự do và quyền mưu cầu hạnh phúc.",
          description: "Văn kiện lịch sử quan trọng nhất, được UNESCO công nhận là Địa điểm  tài liệu thế giới"
        },
        isActive: true
      };

      const documentsRef = doc(collection(db, 'documentsContent'));
      batch.set(documentsRef, {
        ...defaultDocumentsContent,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      // Default VR Content
      const defaultVRContent = {
        title: "Trải nghiệm VR",
        subtitle: "Công nghệ thực tế ảo tiên tiến",
        description: "Hãy đắm chìm trong lịch sử thông qua công nghệ thực tế ảo tiên tiến, trải nghiệm những khoảnh khắc lịch sử như đang thực sự có mặt tại đó.",
        features: [
          {
            icon: "Glasses",
            title: "Thực tế ảo 360°",
            description: "Trải nghiệm hoàn toàn immersive với góc nhìn 360 độ"
          },
          {
            icon: "Headphones",
            title: "Âm thanh 3D",
            description: "Âm thanh vòm chất lượng cao tái tạo không gian thực"
          },
          {
            icon: "Hand",
            title: "Tương tác thực tế",
            description: "Tương tác với các đối tượng và nhân vật trong môi trường VR"
          }
        ],
        experiences: [
          {
            id: 'kim-lien-vr',
            title: 'Thăm quan Kim Liên VR',
            description: 'Khám phá quê hương Bác Hồ trong môi trường thực tế ảo hoàn toàn immersive',
            imageUrl: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=600&h=400&fit=crop'
          },
          {
            id: 'ba-dinh-vr',
            title: 'Chứng kiến Tuyên ngôn độc lập',
            description: 'Tham dự lễ đọc Tuyên ngôn độc lập tại Quảng trường Ba Đình ngày 2/9/1945',
            imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop'
          }
        ],
        benefits: {
          title: "Lợi ích của VR",
          description: "Công nghệ VR mang lại trải nghiệm học tập vượt trội",
          stats: [
            { percentage: "95%", label: "Tăng khả năng ghi nhớ" },
            { percentage: "87%", label: "Cải thiện sự tập trung" },
            { percentage: "92%", label: "Nâng cao hứng thú học tập" }
          ]
        },
        isActive: true
      };

      const vrRef = doc(collection(db, 'vrContent'));
      batch.set(vrRef, {
        ...defaultVRContent,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      // Default Mini Game Content
      const defaultMiniGameContent = {
        title: "Mini Games giáo dục",
        subtitle: "Học lịch sử qua trò chơi",
        description: "Học lịch sử một cách vui vẻ và hấp dẫn thông qua các trò chơi tương tác, giúp củng cố kiến thức và tạo động lực học tập.",
        games: [
          {
            id: 'quiz-history',
            title: 'Quiz kiến thức lịch sử',
            description: 'Trả lời các câu hỏi về cuộc đời và sự nghiệp của Chủ tịch Hồ Chí Minh',
            difficulty: 'Trung bình' as const,
            playerCount: '1 người chơi',
            icon: 'Trophy',
            color: 'from-green-500 to-green-600'
          },
          {
            id: 'journey-path',
            title: 'Hành trình tìm đường cứu nước',
            description: 'Khám phá các địa điểm Bác Hồ đã đi qua trong hành trình 30 năm tìm đường cứu nước',
            difficulty: 'Dễ' as const,
            playerCount: '1 người chơi',
            icon: 'Target',
            color: 'from-blue-500 to-blue-600'
          },
          {
            id: 'puzzle-heritage',
            title: 'Ghép hình di tích',
            description: 'Ghép các mảnh hình để tạo thành những di tích lịch sử quan trọng',
            difficulty: 'Khó' as const,
            playerCount: '1 người chơi',
            icon: 'Zap',
            color: 'from-purple-500 to-purple-600'
          }
        ],
        achievements: [
          {
            icon: 'Trophy',
            title: 'Thành tựu đạt được',
            count: '2,450',
            description: 'Tổng số điểm tích lũy'
          },
          {
            icon: 'Star',
            title: 'Quiz hoàn thành',
            count: '156',
            description: 'Số quiz đã hoàn thành'
          },
          {
            icon: 'Target',
            title: 'Cấp độ hiện tại',
            count: '12',
            description: 'Level cao nhất đạt được'
          }
        ],
        leaderboard: [
          { rank: 1, name: 'Nguyễn Văn A', score: '2,450', badge: '🥇' },
          { rank: 2, name: 'Trần Thị B', score: '2,380', badge: '🥈' },
          { rank: 3, name: 'Lê Văn C', score: '2,290', badge: '🥉' },
          { rank: 4, name: 'Phạm Thị D', score: '2,150', badge: '🏅' },
          { rank: 5, name: 'Hoàng Văn E', score: '2,100', badge: '🏅' }
        ],
        isActive: true
      };

      const miniGameRef = doc(collection(db, 'miniGameContent'));
      batch.set(miniGameRef, {
        ...defaultMiniGameContent,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      await batch.commit();
    } catch (error) {
      console.error('Error initializing default page content:', error);
      throw error;
    }
  }
}

export const contentService = new ContentService();
