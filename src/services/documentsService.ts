import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Document, DocumentCategory } from '../types/content';

const CATEGORIES_COLLECTION = 'document-categories';
const DOCUMENTS_COLLECTION = 'documents';

/**
 * Get all document categories with their documents
 */
export const getDocumentCategories = async (): Promise<DocumentCategory[]> => {
  try {
    const categoriesRef = collection(db, CATEGORIES_COLLECTION);
    const categoriesSnapshot = await getDocs(categoriesRef);

    const categories: DocumentCategory[] = [];

    for (const categoryDoc of categoriesSnapshot.docs) {
      const categoryData = categoryDoc.data();

      // Get documents for this category
      const q = query(
        collection(db, DOCUMENTS_COLLECTION),
        where('category', '==', categoryDoc.id)
      );
      const documentsSnapshot = await getDocs(q);

      const documents: Document[] = documentsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Document));

      categories.push({
        id: categoryDoc.id,
        title: categoryData.title,
        description: categoryData.description,
        icon: categoryData.icon,
        documents,
        isActive: categoryData.isActive,
        isFeatured: categoryData.isFeatured,
        tags: categoryData.tags || [],
        createdAt: categoryData.createdAt,
        updatedAt: categoryData.updatedAt,
      });
    }

    return categories;
  } catch (error) {
    console.error('Error fetching document categories:', error);
    return [];
  }
};

/**
 * Get specific document by ID
 */
export const getDocumentById = async (id: string): Promise<Document | null> => {
  try {
    const docRef = doc(db, DOCUMENTS_COLLECTION, id);
    const docSnapshot = await getDoc(docRef);

    if (!docSnapshot.exists()) {
      return null;
    }

    return { id: docSnapshot.id, ...docSnapshot.data() } as Document;
  } catch (error) {
    console.error('Error fetching document:', error);
    return null;
  }
};

export const documentsService = {
  // Category methods
  async getCategories(): Promise<DocumentCategory[]> {
    try {
      const q = query(collection(db, CATEGORIES_COLLECTION), orderBy('title'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as DocumentCategory));
    } catch (error) {
      console.error('Error getting document categories:', error);
      throw error;
    }
  },

  async getCategory(categoryId: string): Promise<DocumentCategory | null> {
    try {
      const docRef = doc(db, CATEGORIES_COLLECTION, categoryId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as DocumentCategory;
      }

      return null;
    } catch (error) {
      console.error(`Error getting category with ID ${categoryId}:`, error);
      throw error;
    }
  },

  async createCategory(categoryData: Omit<DocumentCategory, 'id'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const dataWithTimestamps = {
        ...categoryData,
        createdAt: now,
        updatedAt: now
      };

      const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), dataWithTimestamps);
      return docRef.id;
    } catch (error) {
      console.error('Error creating document category:', error);
      throw error;
    }
  },

  async updateCategory(categoryId: string, categoryData: Partial<DocumentCategory>): Promise<void> {
    try {
      const docRef = doc(db, CATEGORIES_COLLECTION, categoryId);

      await updateDoc(docRef, {
        ...categoryData,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error(`Error updating category with ID ${categoryId}:`, error);
      throw error;
    }
  },

  async deleteCategory(categoryId: string): Promise<void> {
    try {
      // First delete all documents in this category
      const q = query(collection(db, DOCUMENTS_COLLECTION), where('category', '==', categoryId));
      const querySnapshot = await getDocs(q);

      const deletePromises = querySnapshot.docs.map(document =>
        deleteDoc(doc(db, DOCUMENTS_COLLECTION, document.id))
      );

      await Promise.all(deletePromises);

      // Then delete the category itself
      await deleteDoc(doc(db, CATEGORIES_COLLECTION, categoryId));
    } catch (error) {
      console.error(`Error deleting category with ID ${categoryId}:`, error);
      throw error;
    }
  },

  // Document methods
  async getDocuments(): Promise<Document[]> {
    try {
      const q = query(collection(db, DOCUMENTS_COLLECTION), orderBy('title'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Document));
    } catch (error) {
      console.error('Error getting documents:', error);
      throw error;
    }
  },

  async getDocumentsByCategory(categoryId: string): Promise<Document[]> {
    try {
      const q = query(
        collection(db, DOCUMENTS_COLLECTION),
        where('category', '==', categoryId),
        orderBy('title')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Document));
    } catch (error) {
      console.error(`Error getting documents for category ${categoryId}:`, error);
      throw error;
    }
  },

  async getDocument(documentId: string): Promise<Document | null> {
    try {
      const docRef = doc(db, DOCUMENTS_COLLECTION, documentId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Document;
      }

      return null;
    } catch (error) {
      console.error(`Error getting document with ID ${documentId}:`, error);
      throw error;
    }
  },

  async createDocument(documentData: Omit<Document, 'id'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const dataWithTimestamps = {
        ...documentData,
        createdAt: now,
        updatedAt: now
      };

      const docRef = await addDoc(collection(db, DOCUMENTS_COLLECTION), dataWithTimestamps);
      return docRef.id;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  },

  async updateDocument(documentId: string, documentData: Partial<Document>): Promise<void> {
    try {
      const docRef = doc(db, DOCUMENTS_COLLECTION, documentId);

      await updateDoc(docRef, {
        ...documentData,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error(`Error updating document with ID ${documentId}:`, error);
      throw error;
    }
  },

  async deleteDocument(documentId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, DOCUMENTS_COLLECTION, documentId));
    } catch (error) {
      console.error(`Error deleting document with ID ${documentId}:`, error);
      throw error;
    }
  },

  // Search methods
  async searchDocuments(query: string): Promise<Document[]> {
    try {
      // This is a simple client-side search
      // For production, consider using Firestore's array-contains-any for tags
      // or a dedicated search service like Algolia
      const documents = await this.getDocuments();

      const lowercaseQuery = query.toLowerCase();

      return documents.filter(doc =>
        doc.title.toLowerCase().includes(lowercaseQuery) ||
        (doc.description && doc.description.toLowerCase().includes(lowercaseQuery)) ||
        (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)))
      );
    } catch (error) {
      console.error(`Error searching for documents with query "${query}":`, error);
      throw error;
    }
  }
};

export default documentsService;
