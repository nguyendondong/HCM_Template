import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Import the refined documents data as fallback
import documentsRefinedData from '../../data/seed/documents-refined.json';

export interface DocumentCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  isActive: boolean;
}

export interface DocumentMetadata {
  author?: string;
  photographer?: string;
  date: string;
  location: string;
  significance: string;
  language?: string;
  pages?: number;
  fileSize: string;
  duration?: string;
  imageCount?: number;
  resolution?: string;
  quality?: string;
}

export interface Document {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'text' | 'image' | 'video' | 'audio';
  content: string;
  fileUrl: string;
  thumbnailUrl: string;
  metadata: DocumentMetadata;
  tags: string[];
  isPublic: boolean;
  isFeatured: boolean;
  downloadCount: number;
  viewCount: number;
  order: number;
  isActive: boolean;
}

export interface DocumentsData {
  categories: DocumentCategory[];
  documents: Document[];
  metadata: {
    totalDocuments: number;
    totalCategories: number;
    lastUpdated: string;
    version: string;
    maintainer: string;
  };
}

class DocumentsDataService {
  private documentsCache: DocumentsData | null = null;
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get all documents data (categories + documents)
   */
  async getDocumentsData(): Promise<DocumentsData> {
    // Check cache
    if (this.documentsCache && Date.now() - this.lastFetch < this.CACHE_DURATION) {
      return this.documentsCache;
    }

    try {
      // Try to fetch from Firestore first
      const firestoreData = await this.fetchFromFirestore();
      if (firestoreData) {
        this.documentsCache = firestoreData;
        this.lastFetch = Date.now();
        return firestoreData;
      }
    } catch (error) {
      console.warn('Failed to fetch from Firestore, using fallback data:', error);
    }

    // Fallback to local JSON data
    const fallbackData = this.getFallbackData();
    this.documentsCache = fallbackData;
    this.lastFetch = Date.now();
    return fallbackData;
  }

  /**
   * Get documents by category
   */
  async getDocumentsByCategory(category: string): Promise<Document[]> {
    const data = await this.getDocumentsData();
    return data.documents.filter(doc =>
      doc.category === category && doc.isActive
    ).sort((a, b) => a.order - b.order);
  }

  /**
   * Get featured documents
   */
  async getFeaturedDocuments(limit: number = 6): Promise<Document[]> {
    const data = await this.getDocumentsData();
    return data.documents
      .filter(doc => doc.isFeatured && doc.isActive)
      .sort((a, b) => a.order - b.order)
      .slice(0, limit);
  }

  /**
   * Get categories with document counts
   */
  async getCategoriesWithCounts(): Promise<(DocumentCategory & { documentCount: number })[]> {
    const data = await this.getDocumentsData();

    return data.categories
      .filter(cat => cat.isActive)
      .map(category => ({
        ...category,
        documentCount: data.documents.filter(doc =>
          doc.category === category.id && doc.isActive
        ).length
      }))
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Search documents
   */
  async searchDocuments(searchTerm: string): Promise<Document[]> {
    const data = await this.getDocumentsData();
    const term = searchTerm.toLowerCase();

    return data.documents.filter(doc =>
      doc.isActive && (
        doc.title.toLowerCase().includes(term) ||
        doc.description.toLowerCase().includes(term) ||
        doc.tags.some(tag => tag.toLowerCase().includes(term))
      )
    );
  }

  /**
   * Get document by ID
   */
  async getDocumentById(id: string): Promise<Document | null> {
    const data = await this.getDocumentsData();
    return data.documents.find(doc => doc.id === id && doc.isActive) || null;
  }

  /**
   * Get documents statistics
   */
  async getDocumentsStatistics() {
    const data = await this.getDocumentsData();
    const activeDocuments = data.documents.filter(doc => doc.isActive);

    return {
      totalDocuments: activeDocuments.length,
      totalCategories: data.categories.filter(cat => cat.isActive).length,
      totalViews: activeDocuments.reduce((sum, doc) => sum + doc.viewCount, 0),
      totalDownloads: activeDocuments.reduce((sum, doc) => sum + doc.downloadCount, 0),
      featuredCount: activeDocuments.filter(doc => doc.isFeatured).length,
      typeBreakdown: {
        text: activeDocuments.filter(doc => doc.type === 'text').length,
        image: activeDocuments.filter(doc => doc.type === 'image').length,
        video: activeDocuments.filter(doc => doc.type === 'video').length,
        audio: activeDocuments.filter(doc => doc.type === 'audio').length,
      }
    };
  }

  /**
   * Fetch documents from Firestore
   */
  private async fetchFromFirestore(): Promise<DocumentsData | null> {
    try {
      // Fetch categories
      const categoriesQuery = query(
        collection(db, 'document-categories'),
        where('isActive', '==', true),
        orderBy('order', 'asc')
      );
      const categoriesSnapshot = await getDocs(categoriesQuery);
      const categories = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DocumentCategory[];

      // Fetch documents
      const documentsQuery = query(
        collection(db, 'documents'),
        where('isActive', '==', true),
        orderBy('order', 'asc')
      );
      const documentsSnapshot = await getDocs(documentsQuery);
      const documents = documentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Document[];

      return {
        categories,
        documents,
        metadata: {
          totalDocuments: documents.length,
          totalCategories: categories.length,
          lastUpdated: new Date().toISOString(),
          version: '1.0.0',
          maintainer: 'Heritage Journey Team'
        }
      };
    } catch (error) {
      console.error('Error fetching from Firestore:', error);
      return null;
    }
  }

  /**
   * Get fallback data from local JSON
   */
  private getFallbackData(): DocumentsData {
    return documentsRefinedData as DocumentsData;
  }

  /**
   * Clear cache (useful for admin updates)
   */
  clearCache(): void {
    this.documentsCache = null;
    this.lastFetch = 0;
  }

  /**
   * Refresh data from source
   */
  async refreshData(): Promise<DocumentsData> {
    this.clearCache();
    return this.getDocumentsData();
  }
}

// Export singleton instance
export const documentsDataService = new DocumentsDataService();
