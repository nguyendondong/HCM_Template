import { Timestamp } from 'firebase/firestore';

// ===== CONTENT MANAGEMENT SCHEMAS =====

// Hero Section Data
export interface HeroContent {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  stats: HeroStat[];
  actionButton: {
    text: string;
    targetSection: string;
  };
  backgroundElements: {
    enableFlags: boolean;
    enableStars: boolean;
    enableDecorations: boolean;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
}

export interface HeroStat {
  icon: string; // Icon name (will map to Lucide icons)
  number: string;
  label: string;
  color?: string;
}

// Introduction Section Data
export interface IntroductionContent {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  videoUrl?: string;
  videoPath?: string; // Firebase Storage path
  features: IntroFeature[];
  biography: {
    title: string;
    content: string[];
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
}

export interface IntroFeature {
  icon: string; // Icon name
  title: string;
  description: string;
}

// Documents Section Data
export interface DocumentsContent {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  categories: string[]; // Reference to document categories IDs
  featuredDocumentId?: string; // Reference to a featured document
  layout?: 'grid' | 'list' | 'masonry';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
}

export interface DocumentCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  documents?: Document[];
  tags?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Document {
  id: string;
  title: string;
  description: string;
  type: string; // pdf, image, video...
  language?: string;
  year?: number;
  location?: string;
  digitalUrl: string;
  thumbnailUrl: string;
  significance?: string;
  tags?: string[];
  category: string; // Reference to category ID
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// VR Technology Section Data
export interface VRContent {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  features: VRFeature[];
  experiences: VRExperience[];
  benefits: {
    title: string;
    description: string;
    stats: VRStat[];
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
}

export interface VRFeature {
  icon: string;
  title: string;
  description: string;
}

export interface VRExperience {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  experienceUrl?: string;
}

export interface VRStat {
  percentage: string;
  label: string;
}

// Mini Game Section Data
export interface MiniGameContent {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  games: MiniGame[];
  achievements: Achievement[];
  leaderboard: LeaderboardEntry[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
}

export interface MiniGame {
  id: string;
  title: string;
  description: string;
  difficulty: 'Dễ' | 'Trung bình' | 'Khó';
  playerCount: string;
  icon: string;
  color: string; // Tailwind gradient classes
  gameUrl?: string;
}

export interface Achievement {
  icon: string;
  title: string;
  count: string;
  description?: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: string;
  badge: string;
}

// ===== NAVIGATION & UI SCHEMAS =====

// Navigation Data
export interface NavigationContent {
  id: string;
  logo: {
    text: string;
    iconName: string;
  };
  menuItems: NavMenuItem[];
  mobileMenuEnabled: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
}

export interface NavMenuItem {
  id: string;
  label: string;
  href: string;
  targetSection?: string;
  order: number;
  isActive: boolean;
}

// Footer Data
export interface FooterContent {
  id: string;
  quote: string;
  description: string;
  actionButton: {
    text: string;
    action: string;
  };
  copyright: string;
  socialLinks?: SocialLink[];
  backgroundElements: {
    enableStars: boolean;
    starCount: number;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

// ===== HERITAGE SPOTS ENHANCED SCHEMA =====

// Enhanced Heritage Spot (extending existing)
export interface EnhancedHeritageSpot {
  id: string;
  name: string;
  description: string;
  coordinates: {
    x: number;
    y: number;
  };
  side: 'left' | 'right';

  // Enhanced fields
  shortDescription: string;
  fullDescription: string;
  historicalSignificance: string;
  visitingInfo: {
    address: string;
    openingHours: string;
    ticketPrice: string;
    contactInfo: string;
  };

  // Media
  images: HeritageImage[];
  videos: HeritageVideo[];
  audioGuides: AudioGuide[];

  // Interactive content
  vrExperienceUrl?: string;
  threeDModelUrl?: string;
  timelineEvents: TimelineEvent[];

  // Educational content
  quizQuestions: QuizQuestion[];
  funFacts: string[];
  relatedSpots: string[]; // IDs of related heritage spots

  // Metadata
  tags: string[];
  difficulty: 'Dễ' | 'Trung bình' | 'Khó';
  estimatedVisitTime: number; // minutes
  accessibility: AccessibilityInfo;

  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
  featured: boolean;
  order: number;
}

export interface HeritageImage {
  id: string;
  url: string;
  caption: string;
  alt: string;
  type: 'main' | 'gallery' | 'thumbnail' | 'historical';
  order: number;
}

export interface HeritageVideo {
  id: string;
  url: string;
  title: string;
  description: string;
  duration: number; // seconds
  thumbnail: string;
  type: 'documentary' | 'tour' | 'interview' | 'animation';
}

export interface AudioGuide {
  id: string;
  url: string;
  title: string;
  duration: number; // seconds
  language: string;
  transcript?: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  imageUrl?: string;
  importance: 'high' | 'medium' | 'low';
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // index of correct option
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}

export interface AccessibilityInfo {
  wheelchairAccessible: boolean;
  hasAudioGuide: boolean;
  hasVisualAids: boolean;
  hasBrailleInfo: boolean;
  notes: string;
}

// ===== EDUCATIONAL CONTENT SCHEMAS =====

// Quiz System
export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: 'heritage' | 'biography' | 'history' | 'general';
  difficulty: 'easy' | 'medium' | 'hard';
  questions: QuizQuestion[];
  timeLimit?: number; // seconds
  passingScore: number; // percentage
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
}

// Learning Modules
export interface LearningModule {
  id: string;
  title: string;
  description: string;
  type: 'text' | 'video' | 'interactive' | 'vr';
  content: ModuleContent;
  prerequisites: string[]; // module IDs
  estimatedTime: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
  order: number;
}

export interface ModuleContent {
  introduction: string;
  sections: ContentSection[];
  conclusion: string;
  resources: Resource[];
  assessment?: Quiz;
}

export interface ContentSection {
  id: string;
  title: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio';
  interactiveElements?: InteractiveElement[];
}

export interface InteractiveElement {
  type: 'hotspot' | 'popup' | 'quiz' | 'timeline' | 'map';
  data: any; // Flexible data structure based on type
  position?: { x: number; y: number };
}

export interface Resource {
  title: string;
  url: string;
  type: 'document' | 'video' | 'website' | 'image';
  description?: string;
}

// ===== USER INTERACTION SCHEMAS =====

// User Progress
export interface UserProgress {
  userId: string;
  heritageSpots: {
    [spotId: string]: {
      visited: boolean;
      completedQuizzes: string[];
      completedModules: string[];
      lastVisitDate: Timestamp;
      notes?: string;
    };
  };
  quizScores: {
    [quizId: string]: {
      score: number;
      attempts: number;
      lastAttemptDate: Timestamp;
      bestScore: number;
    };
  };
  achievements: Achievement[];
  totalPoints: number;
  level: number;
  badges: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Comments and Reviews
export interface HeritageComment {
  id: string;
  spotId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  rating: number; // 1-5 stars
  images?: string[]; // URLs to uploaded images
  helpful: number; // helpful votes count
  replies?: CommentReply[];
  isVerified: boolean; // for verified visits
  visitDate?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
}

export interface CommentReply {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: Timestamp;
}

// ===== ANALYTICS & METRICS SCHEMAS =====

// Site Analytics
export interface SiteAnalytics {
  date: string; // YYYY-MM-DD
  pageViews: number;
  uniqueVisitors: number;
  sessionDuration: number; // average in seconds
  bounceRate: number; // percentage
  topPages: PageMetric[];
  topCountries: CountryMetric[];
  deviceTypes: DeviceMetric[];
  createdAt: Timestamp;
}

export interface PageMetric {
  page: string;
  views: number;
  uniqueViews: number;
}

export interface CountryMetric {
  country: string;
  visitors: number;
  percentage: number;
}

export interface DeviceMetric {
  device: 'desktop' | 'mobile' | 'tablet';
  count: number;
  percentage: number;
}

// Heritage Spot Analytics
export interface SpotAnalytics {
  spotId: string;
  date: string;
  views: number;
  uniqueViews: number;
  averageTimeSpent: number; // seconds
  completionRate: number; // percentage who completed the full tour
  quizCompletions: number;
  downloads: number; // documents, images, etc.
  shares: number;
  ratings: {
    average: number;
    count: number;
    distribution: { [rating: number]: number };
  };
  createdAt: Timestamp;
}

// ===== ADMIN & CONFIGURATION SCHEMAS =====

// Site Configuration
export interface SiteConfig {
  id: 'main';
  siteName: string;
  siteDescription: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;

  // Features toggles
  features: {
    vrEnabled: boolean;
    quizEnabled: boolean;
    commentsEnabled: boolean;
    analyticsEnabled: boolean;
    multiLanguageEnabled: boolean;
  };

  // SEO settings
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    ogImageUrl: string;
  };

  // Social media links
  socialMedia: {
    facebook?: string;
    youtube?: string;
    instagram?: string;
    twitter?: string;
  };

  // Contact information
  contact: {
    email: string;
    phone: string;
    address: string;
  };

  // Maintenance mode
  maintenance: {
    enabled: boolean;
    message: string;
    estimatedRestoreTime?: Timestamp;
  };

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Content Management
export interface ContentVersion {
  id: string;
  contentType: string; // 'hero', 'introduction', 'navigation', etc.
  contentId: string;
  version: number;
  data: any; // The actual content data
  changeLog: string;
  authorId: string;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: Timestamp;
  createdAt: Timestamp;
}

export interface ContentSchedule {
  id: string;
  contentType: string;
  contentId: string;
  action: 'publish' | 'unpublish' | 'update';
  scheduledFor: Timestamp;
  data?: any; // Update data if action is 'update'
  status: 'pending' | 'executed' | 'failed';
  executedAt?: Timestamp;
  createdAt: Timestamp;
}

// ===== NOTIFICATION & MESSAGING SCHEMAS =====

// System Notifications
export interface SystemNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  targetAudience: 'all' | 'users' | 'admins';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  persistent: boolean; // Whether it stays until dismissed
  actionButton?: {
    text: string;
    action: string;
    url?: string;
  };
  displayFrom: Timestamp;
  displayUntil?: Timestamp;
  isActive: boolean;
  createdAt: Timestamp;
}

// User Notifications
export interface UserNotification {
  id: string;
  userId: string;
  type: 'achievement' | 'reminder' | 'update' | 'social';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  data?: any; // Additional data based on notification type
  createdAt: Timestamp;
}
