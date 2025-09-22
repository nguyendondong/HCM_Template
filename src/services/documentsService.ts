import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Document {
  id: string;
  title: string;
  description: string;
  date: string;
  type: string;
  size: string;
  downloadUrl: string;
  previewImage: string;
  category: string;
}

export interface DocumentCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  documents: Document[];
}

/**
 * Get all document categories with their documents
 */
export const getDocumentCategories = async (): Promise<DocumentCategory[]> => {
  try {
    const categoriesRef = collection(db, 'document-categories');
    const categoriesSnapshot = await getDocs(categoriesRef);

    const categories: DocumentCategory[] = [];

    for (const categoryDoc of categoriesSnapshot.docs) {
      const categoryData = categoryDoc.data();

      // Get documents for this category
      const documentsRef = collection(db, 'documents');
      const documentsSnapshot = await getDocs(documentsRef);

      const documents: Document[] = documentsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Document))
        .filter(doc => doc.category === categoryDoc.id);

      categories.push({
        id: categoryDoc.id,
        title: categoryData.title,
        description: categoryData.description,
        icon: categoryData.icon,
        documents
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
    const docRef = doc(db, 'documents', id);
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
