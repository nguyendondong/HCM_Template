import { collection, getDocs, query, where, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

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
