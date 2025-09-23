import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  limit
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../lib/firebase';

// New comprehensive interface for modern mini games
export interface ModernMiniGame {
  id: string;
  title: string;
  description: string;
  gameType: 'timeline_quiz' | 'multiple_choice_quiz' | 'jigsaw_puzzle' | 'matching_game' | 'exploration_game' | 'sorting_game';
  difficulty: 'Dễ' | 'Trung bình' | 'Khó';
  estimatedTime: string;
  category: 'history' | 'knowledge' | 'puzzle' | 'literature' | 'exploration' | 'timeline';
  players: number;
  maxScore: number;
  icon: string;
  color: string;
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  order: number;
  gameData: {
    questions?: Array<{
      id: string;
      question: string;
      options: string[];
      correctAnswer: number;
      explanation?: string;
      imageUrl?: string;
      year?: number;
    }>;
    puzzlePieces?: Array<{
      id: string;
      imageUrl: string;
      position: { x: number; y: number };
    }>;
    matchingPairs?: Array<{
      id: string;
      item: string;
      match: string;
      imageUrl?: string;
    }>;
    locations?: Array<{
      id: string;
      name: string;
      description: string;
      coordinates: { lat: number; lng: number };
      imageUrl?: string;
    }>;
    timelineEvents?: Array<{
      id: string;
      year: number;
      event: string;
      description: string;
      imageUrl?: string;
    }>;
    sortingItems?: Array<{
      id: string;
      name: string;
      category: string;
      imageUrl?: string;
    }>;
    completedImage?: string;
    gridSize?: { rows: number; cols: number };
  };
  rewards: {
    points: number;
    badges: string[];
    unlocks: string[];
  };
  createdAt?: any;
  updatedAt?: any;
}

// Interface for Mini Game from Firestore (legacy compatibility)
export interface FirestoreMiniGame {
  id: string;
  title: string;
  description: string;
  type: string;
  difficulty: 'easy' | 'medium' | 'hard';
  playerCount: string;
  timeEstimate: string;
  category: string;
  questions: {
    id: string;
    type: 'multiple-choice' | 'true-false' | 'matching' | 'ordering';
    question: string;
    options: {
      [key: string]: string;
    };
    correctAnswer: string | string[];
    explanation: string;
    points: number;
    timeLimit?: number;
  }[];
  achievements?: {
    id: string;
    title: string;
    description: string;
    icon: string;
    requirement: string;
    points: number;
  }[];
  scoring: {
    maxPoints: number;
    passingScore: number;
    timeBonus: boolean;
  };
  media?: {
    images?: string[];
    videos?: string[];
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Interface for MiniGamesPage component (legacy format)
export interface MiniGame {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  timeLimit: string;
  totalQuestions: number;
  icon: any; // Lucide icon component
  color: string;
  questions: {
    id: number;
    question: string;
    options: string[];
    correct: number;
    explanation: string;
  }[];
}

export interface Achievement {
  icon: string;
  title: string;
  count: string;
  description: string;
}

export interface GameSession {
  id: string;
  gameId: string;
  userId: string;
  score: number;
  completedAt: any;
  timeSpent: number;
  answers?: any[];
  achievements: string[];
}

/**
 * Modern Mini Games Service for comprehensive game management
 */
export class ModernMiniGamesService {
  private gamesCollection = collection(db, 'mini-games');
  private sessionsCollection = collection(db, 'game-sessions');

  // Game CRUD operations
  async createGame(gameData: Omit<ModernMiniGame, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(this.gamesCollection, {
      ...gameData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  }

  async updateGame(gameId: string, updates: Partial<ModernMiniGame>): Promise<void> {
    const gameRef = doc(this.gamesCollection, gameId);
    await updateDoc(gameRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  }

  async deleteGame(gameId: string): Promise<void> {
    const gameRef = doc(this.gamesCollection, gameId);
    await deleteDoc(gameRef);
  }

  async getGame(gameId: string): Promise<ModernMiniGame | null> {
    const gameRef = doc(this.gamesCollection, gameId);
    const gameSnap = await getDoc(gameRef);

    if (gameSnap.exists()) {
      return { id: gameSnap.id, ...gameSnap.data() } as ModernMiniGame;
    }
    return null;
  }

  async getAllGames(filters?: {
    category?: string;
    difficulty?: string;
    gameType?: string;
    isActive?: boolean;
    isFeatured?: boolean;
  }): Promise<ModernMiniGame[]> {
    let gameQuery = query(this.gamesCollection, orderBy('order', 'asc'));

    if (filters?.isActive !== undefined) {
      gameQuery = query(gameQuery, where('isActive', '==', filters.isActive));
    }

    if (filters?.isFeatured !== undefined) {
      gameQuery = query(gameQuery, where('isFeatured', '==', filters.isFeatured));
    }

    if (filters?.category) {
      gameQuery = query(gameQuery, where('category', '==', filters.category));
    }

    if (filters?.difficulty) {
      gameQuery = query(gameQuery, where('difficulty', '==', filters.difficulty));
    }

    if (filters?.gameType) {
      gameQuery = query(gameQuery, where('gameType', '==', filters.gameType));
    }

    const querySnapshot = await getDocs(gameQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ModernMiniGame[];
  }

  async getFeaturedGames(limitCount = 6): Promise<ModernMiniGame[]> {
    const gameQuery = query(
      this.gamesCollection,
      where('isActive', '==', true),
      where('isFeatured', '==', true),
      orderBy('order', 'asc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(gameQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ModernMiniGame[];
  }

  async getGamesByCategory(category: string, limitCount = 12): Promise<ModernMiniGame[]> {
    const gameQuery = query(
      this.gamesCollection,
      where('isActive', '==', true),
      where('category', '==', category),
      orderBy('order', 'asc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(gameQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ModernMiniGame[];
  }

  // Image upload for game content
  async uploadGameImage(file: File, gameId: string, folder: string): Promise<string> {
    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `mini-games/${gameId}/${folder}/${fileName}`);

    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  }

  async deleteGameImage(imageUrl: string): Promise<void> {
    try {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }

  async toggleGameStatus(gameId: string): Promise<void> {
    const game = await this.getGame(gameId);
    if (game) {
      await this.updateGame(gameId, { isActive: !game.isActive });
    }
  }

  async toggleFeaturedStatus(gameId: string): Promise<void> {
    const game = await this.getGame(gameId);
    if (game) {
      await this.updateGame(gameId, { isFeatured: !game.isFeatured });
    }
  }
}

export const modernMiniGamesService = new ModernMiniGamesService();

// Interface for Mini Game from Firestore
export interface FirestoreMiniGame {
  id: string;
  title: string;
  description: string;
  type: string;
  difficulty: 'easy' | 'medium' | 'hard';
  playerCount: string;
  timeEstimate: string;
  category: string;
  questions: {
    id: string;
    type: 'multiple-choice' | 'true-false' | 'matching' | 'ordering';
    question: string;
    options: {
      [key: string]: string;
    };
    correctAnswer: string | string[];
    explanation: string;
    points: number;
    timeLimit?: number;
  }[];
  achievements?: {
    id: string;
    title: string;
    description: string;
    icon: string;
    requirement: string;
    points: number;
  }[];
  scoring: {
    maxPoints: number;
    passingScore: number;
    timeBonus: boolean;
  };
  media?: {
    images?: string[];
    videos?: string[];
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Interface for MiniGamesPage component (legacy format)
export interface MiniGame {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  timeLimit: string;
  totalQuestions: number;
  icon: any; // Lucide icon component
  color: string;
  questions: {
    id: number;
    question: string;
    options: string[];
    correct: number;
    explanation: string;
  }[];
}

export interface Achievement {
  icon: string;
  title: string;
  count: string;
  description: string;
}

/**
 * Data adapter to convert Firestore mini game to MiniGamesPage format
 */
export class MiniGameAdapter {
  /**
   * Convert Firestore mini game to legacy MiniGamesPage format
   */
  static adaptToLegacyFormat(firestoreGame: FirestoreMiniGame, iconComponent: any): MiniGame {
    // Convert object-based options to array format
    const adaptedQuestions = firestoreGame.questions.map((question, index) => ({
      id: index + 1,
      question: question.question,
      options: Object.values(question.options),
      correct: this.findCorrectAnswerIndex(question.options, question.correctAnswer),
      explanation: question.explanation
    }));

    // Map difficulty levels
    const difficultyMap = {
      easy: 'Dễ',
      medium: 'Trung bình',
      hard: 'Khó'
    };

    // Determine time limit based on question count and type
    const timeLimit = firestoreGame.questions[0]?.timeLimit
      ? `${firestoreGame.questions[0].timeLimit}s/câu`
      : firestoreGame.timeEstimate || '30s/câu';

    // Generate gradient color based on difficulty
    const colorMap = {
      easy: 'from-green-500 to-green-600',
      medium: 'from-blue-500 to-blue-600',
      hard: 'from-purple-500 to-purple-600'
    };

    return {
      id: firestoreGame.id,
      title: firestoreGame.title,
      description: firestoreGame.description,
      difficulty: difficultyMap[firestoreGame.difficulty],
      timeLimit,
      totalQuestions: firestoreGame.questions.length,
      icon: iconComponent,
      color: colorMap[firestoreGame.difficulty],
      questions: adaptedQuestions
    };
  }

  /**
   * Find the correct answer index from object-based options
   */
  private static findCorrectAnswerIndex(options: { [key: string]: string }, correctAnswer: string | string[]): number {
    const optionValues = Object.values(options);
    const optionKeys = Object.keys(options);

    if (typeof correctAnswer === 'string') {
      // Find by key first, then by value
      const keyIndex = optionKeys.indexOf(correctAnswer);
      if (keyIndex !== -1) return keyIndex;

      const valueIndex = optionValues.indexOf(correctAnswer);
      return valueIndex !== -1 ? valueIndex : 0;
    }

    // For array answers, take the first match
    if (Array.isArray(correctAnswer) && correctAnswer.length > 0) {
      const keyIndex = optionKeys.indexOf(correctAnswer[0]);
      if (keyIndex !== -1) return keyIndex;

      const valueIndex = optionValues.indexOf(correctAnswer[0]);
      return valueIndex !== -1 ? valueIndex : 0;
    }

    return 0; // Default fallback
  }

  /**
   * Adapt achievements from Firestore format
   */
  static adaptAchievements(firestoreGame: FirestoreMiniGame): Achievement[] {
    if (!firestoreGame.achievements) return [];

    return firestoreGame.achievements.map(achievement => ({
      icon: achievement.icon,
      title: achievement.title,
      count: achievement.points.toString(),
      description: achievement.description
    }));
  }
}

/**
 * Get all active mini games from Firestore
 */
export const getMiniGames = async (): Promise<FirestoreMiniGame[]> => {
  try {
    const q = query(
      collection(db, 'mini-games'),
      where('isActive', '==', true),
      orderBy('title', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FirestoreMiniGame));
  } catch (error) {
    console.error('Error fetching mini games:', error);
    throw error;
  }
};

/**
 * Get mini games adapted for MiniGamesPage format
 */
export const getMiniGamesForPage = async (): Promise<MiniGame[]> => {
  try {
    const firestoreGames = await getMiniGames();
    const { Trophy, Target, Zap } = await import('lucide-react');

    // Icon mapping based on game type or difficulty
    const iconMap = {
      easy: Trophy,
      medium: Target,
      hard: Zap
    };

    return firestoreGames.map(game => {
      const iconComponent = iconMap[game.difficulty] || Trophy;
      return MiniGameAdapter.adaptToLegacyFormat(game, iconComponent);
    });
  } catch (error) {
    console.error('Error adapting mini games:', error);
    return [];
  }
};

/**
 * Get specific mini game by ID with questions
 */
export const getMiniGameById = async (id: string): Promise<FirestoreMiniGame | null> => {
  try {
    const gameRef = doc(db, 'mini-games', id);
    const gameSnapshot = await getDoc(gameRef);

    if (!gameSnapshot.exists()) {
      return null;
    }

    return { id: gameSnapshot.id, ...gameSnapshot.data() } as FirestoreMiniGame;
  } catch (error) {
    console.error('Error fetching mini game:', error);
    return null;
  }
};

/**
 * Get achievements data
 */
export const getAchievements = async (): Promise<Achievement[]> => {
  try {
    const games = await getMiniGames();
    const allAchievements: Achievement[] = [];

    games.forEach(game => {
      const achievements = MiniGameAdapter.adaptAchievements(game);
      allAchievements.push(...achievements);
    });

    return allAchievements;
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return [];
  }
};
