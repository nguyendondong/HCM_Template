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
  EnhancedHeritageSpot,
  Quiz,
  UserProgress,
  HeritageComment
} from '../types/content';

// ===== ENHANCED HERITAGE SERVICE =====

class EnhancedHeritageService {
  private collectionName = 'heritage-spots';

  // Get all heritage spots
  async getAllHeritageSpots(): Promise<EnhancedHeritageSpot[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('isActive', '==', true),
        // orderBy('order', 'asc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EnhancedHeritageSpot[];
    } catch (error) {
      console.error('Error fetching heritage spots:', error);
      throw error;
    }
  }

  // Get featured heritage spots
  async getFeaturedHeritageSpots(limit_count = 6): Promise<EnhancedHeritageSpot[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('isActive', '==', true),
        where('featured', '==', true),
        orderBy('order', 'asc'),
        limit(limit_count)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EnhancedHeritageSpot[];
    } catch (error) {
      console.error('Error fetching featured heritage spots:', error);
      throw error;
    }
  }

  // Get heritage spot by ID
  async getHeritageSpotById(id: string): Promise<EnhancedHeritageSpot | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) return null;

      return { id: docSnap.id, ...docSnap.data() } as EnhancedHeritageSpot;
    } catch (error) {
      console.error('Error fetching heritage spot:', error);
      throw error;
    }
  }

  // Create heritage spot
  async createHeritageSpot(data: Omit<EnhancedHeritageSpot, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating heritage spot:', error);
      throw error;
    }
  }

  // Update heritage spot
  async updateHeritageSpot(id: string, data: Partial<EnhancedHeritageSpot>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating heritage spot:', error);
      throw error;
    }
  }

  // Search heritage spots
  async searchHeritageSpots(searchTerm: string): Promise<EnhancedHeritageSpot[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('isActive', '==', true),
        orderBy('name')
      );

      const snapshot = await getDocs(q);
      const allSpots = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EnhancedHeritageSpot[];

      // Client-side filtering for now
      const searchLower = searchTerm.toLowerCase();
      return allSpots.filter(spot =>
        spot.name.toLowerCase().includes(searchLower) ||
        spot.description.toLowerCase().includes(searchLower) ||
        spot.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    } catch (error) {
      console.error('Error searching heritage spots:', error);
      throw error;
    }
  }

  // Subscribe to heritage spots changes
  subscribeToHeritageSpots(callback: (spots: EnhancedHeritageSpot[]) => void): () => void {
    const q = query(
      collection(db, this.collectionName),
      where('isActive', '==', true),
      orderBy('order', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const spots = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EnhancedHeritageSpot[];
      callback(spots);
    }, (error) => {
      console.error('Error in heritage spots subscription:', error);
      callback([]);
    });
  }
}

// ===== QUIZ SERVICE =====

class QuizService {
  private collectionName = 'quizzes';

  // Get all quizzes
  async getAllQuizzes(): Promise<Quiz[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Quiz[];
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      throw error;
    }
  }

  // Get quizzes by category
  async getQuizzesByCategory(category: Quiz['category']): Promise<Quiz[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('isActive', '==', true),
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Quiz[];
    } catch (error) {
      console.error('Error fetching quizzes by category:', error);
      throw error;
    }
  }

  // Get quiz by ID
  async getQuizById(id: string): Promise<Quiz | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) return null;

      return { id: docSnap.id, ...docSnap.data() } as Quiz;
    } catch (error) {
      console.error('Error fetching quiz:', error);
      throw error;
    }
  }

  // Create quiz
  async createQuiz(data: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating quiz:', error);
      throw error;
    }
  }
}

// ===== USER PROGRESS SERVICE =====

class UserProgressService {
  private collectionName = 'userProgress';

  // Get user progress
  async getUserProgress(userId: string): Promise<UserProgress | null> {
    try {
      const docRef = doc(db, this.collectionName, userId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // Create initial progress for new user
        const initialProgress: UserProgress = {
          userId,
          heritageSpots: {},
          quizScores: {},
          achievements: [],
          totalPoints: 0,
          level: 1,
          badges: [],
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };

        await this.updateUserProgress(userId, initialProgress);
        return initialProgress;
      }

      return { userId, ...docSnap.data() } as UserProgress;
    } catch (error) {
      console.error('Error fetching user progress:', error);
      throw error;
    }
  }

  // Update user progress
  async updateUserProgress(userId: string, data: Partial<UserProgress>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, userId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating user progress:', error);
      throw error;
    }
  }

  // Record quiz score
  async recordQuizScore(userId: string, quizId: string, score: number): Promise<void> {
    try {
      const progress = await this.getUserProgress(userId);
      if (!progress) return;

      const existingQuizData = progress.quizScores[quizId];
      const attempts = existingQuizData ? existingQuizData.attempts + 1 : 1;
      const bestScore = existingQuizData ? Math.max(existingQuizData.bestScore, score) : score;

      const updatedQuizScores = {
        ...progress.quizScores,
        [quizId]: {
          score,
          attempts,
          lastAttemptDate: Timestamp.now(),
          bestScore
        }
      };

      // Award points based on score
      const pointsEarned = score * 5;

      await this.updateUserProgress(userId, {
        quizScores: updatedQuizScores,
        totalPoints: progress.totalPoints + pointsEarned
      });
    } catch (error) {
      console.error('Error recording quiz score:', error);
      throw error;
    }
  }

  // Get leaderboard
  async getLeaderboard(limit_count = 10): Promise<UserProgress[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        orderBy('totalPoints', 'desc'),
        limit(limit_count)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        userId: doc.id,
        ...doc.data()
      })) as UserProgress[];
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  }
}

// ===== COMMENTS SERVICE =====

class CommentsService {
  private collectionName = 'heritageComments';

  // Get comments for heritage spot
  async getCommentsBySpotId(spotId: string): Promise<HeritageComment[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('spotId', '==', spotId),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HeritageComment[];
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  }

  // Create comment
  async createComment(data: Omit<HeritageComment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...data,
        helpful: 0,
        replies: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }
}

// ===== INITIALIZE DEFAULT DATA =====

export async function initializeDefaultHeritageData(): Promise<void> {
  try {
    const batch = writeBatch(db);

    // Default Enhanced Heritage Spot
    const defaultSpot = {
      name: "Kim Liên - Quê hương Bác Hồ",
      description: "Quê hương của Chủ tịch Hồ Chí Minh, nơi lưu giữ những kỷ niệm tuổi thơ của Bác",
      shortDescription: "Quê hương Chủ tịch Hồ Chí Minh",
      fullDescription: "Kim Liên là làng quê yên bình ở xã Kim Liên, huyện Nam Đàn, tỉnh Nghệ An - nơi sinh ra và nuôi dưỡng Chủ tịch Hồ Chí Minh...",
      historicalSignificance: "Nơi sinh của vị lãnh tụ vĩ đại của dân tộc Việt Nam",
      coordinates: { x: 30, y: 20 },
      side: "left" as const,
      visitingInfo: {
        address: "Xã Kim Liên, Huyện Nam Đàn, Tỉnh Nghệ An",
        openingHours: "7:00 - 17:00 (Hàng ngày)",
        ticketPrice: "Miễn phí",
        contactInfo: "0238.xxx.xxxx"
      },
      images: [
        {
          id: "1",
          url: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=600&h=400&fit=crop",
          caption: "Nhà sinh Chủ tịch Hồ Chí Minh",
          alt: "Nhà sinh Bác Hồ tại Kim Liên",
          type: "main" as const,
          order: 1
        }
      ],
      videos: [],
      audioGuides: [],
      vrExperienceUrl: "/vr/kim-lien",
      timelineEvents: [
        {
          id: "1",
          date: "19/5/1890",
          title: "Nguyễn Sinh Cung sinh ra",
          description: "Nguyễn Sinh Cung (Hồ Chí Minh) được sinh ra tại làng Sen",
          importance: "high" as const
        }
      ],
      quizQuestions: [],
      funFacts: [
        "Bác Hồ thường câu cá tại ao nhà trong tuổi thơ",
        "Ngôi nhà được xây dựng theo lối nhà rường truyền thống"
      ],
      relatedSpots: [],
      tags: ["quê hương", "di tích", "Hồ Chí Minh"],
      difficulty: "Dễ" as const,
      estimatedVisitTime: 120,
      accessibility: {
        wheelchairAccessible: true,
        hasAudioGuide: true,
        hasVisualAids: false,
        hasBrailleInfo: false,
        notes: "Có lối đi dành cho xe lăn"
      },
      isActive: true,
      featured: true,
      order: 1
    };

    const spotRef = doc(collection(db, 'enhancedHeritageSpots'));
    batch.set(spotRef, {
      ...defaultSpot,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    await batch.commit();
    console.log('Default heritage data initialized successfully');
  } catch (error) {
    console.error('Error initializing default heritage data:', error);
    throw error;
  }
}

// Export services
export const enhancedHeritageService = new EnhancedHeritageService();
export const quizService = new QuizService();
export const userProgressService = new UserProgressService();
export const commentsService = new CommentsService();
