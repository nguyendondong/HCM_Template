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
    return this.getActiveContent<DocumentsContent>('documentsContent');
  }

  async updateDocumentsContent(id: string, data: Partial<DocumentsContent>): Promise<void> {
    return this.updateContent<DocumentsContent>('documentsContent', id, data);
  }

  async createDocumentsContent(data: Omit<DocumentsContent, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return this.createContent<DocumentsContent>('documentsContent', data);
  }

  // ===== VR TECHNOLOGY SECTION =====
  async getVRContent(): Promise<VRContent | null> {
    return this.getActiveContent<VRContent>('vrContent');
  }

  async updateVRContent(id: string, data: Partial<VRContent>): Promise<void> {
    return this.updateContent<VRContent>('vrContent', id, data);
  }

  async createVRContent(data: Omit<VRContent, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return this.createContent<VRContent>('vrContent', data);
  }

  // ===== MINI GAME SECTION =====
  async getMiniGameContent(): Promise<MiniGameContent | null> {
    return this.getActiveContent<MiniGameContent>('miniGameContent');
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
        title: "Hành Trình Di Sản",
        subtitle: "Khám Phá Di Sản Văn Hóa Việt Nam",
        description: "Trải nghiệm tương tác với những di sản văn hóa quý giá của Việt Nam thông qua công nghệ VR và AR hiện đại",
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
        siteName: "Heritage Journey - Hành Trình Di Sản",
        siteDescription: "Khám phá di sản văn hóa Việt Nam thông qua công nghệ VR/AR",
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
          metaTitle: "Heritage Journey - Khám Phá Di Sản Văn Hóa Việt Nam",
          metaDescription: "Trải nghiệm tương tác với di sản văn hóa Việt Nam qua công nghệ VR/AR hiện đại",
          keywords: ["di sản văn hóa", "Việt Nam", "VR", "AR", "lịch sử", "du lịch"],
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
      console.log('Default content initialized successfully');
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
}

export const contentService = new ContentService();
