import { collection, getDocs, doc, getDoc, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { VRContent, VRFeature, VRExperience } from '../types/content';

export interface OverviewStat {
  icon: string;
  number: string;
  label: string;
}

// Extended VR Experience for internal use (from vr-experiences collection)
export interface ExtendedVRExperience {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: string;
  category: string;
  features?: string[];
  thumbnail?: string;
  videoSrc?: string;
  image?: string;
  vrUrl?: string;
}

/**
 * VR Content Service - Handles all VR related content
 */
export class VRContentService {

  /**
   * Get VR features from vr-features collection or fallback to static data
   */
  async getVRFeatures(): Promise<VRFeature[]> {
    try {
      const featuresRef = collection(db, 'vr-featured');
      const featuresSnapshot = await getDocs(featuresRef);

      if (featuresSnapshot.size > 0) {
        return featuresSnapshot.docs.map(doc => ({
          ...doc.data()
        })) as VRFeature[];
      }

      // Fallback to static features
      return [
        {
          icon: "VrHeadset",
          title: "Thực tế ảo 360°",
          description: "Trải nghiệm không gian lịch sử như thật với góc nhìn 360 độ"
        },
        {
          icon: "Globe",
          title: "Khám phá tương tác",
          description: "Tương tác với các hiện vật và nhân vật lịch sử"
        },
        {
          icon: "Clock",
          title: "Du hành thời gian",
          description: "Quay ngược thời gian để chứng kiến các sự kiện quan trọng"
        },
        {
          icon: "BookOpen",
          title: "Nội dung giáo dục",
          description: "Học hỏi về lịch sử và di sản văn hóa qua trải nghiệm VR"
        }
      ];
    } catch (error) {
      console.error('Error fetching VR features:', error);
      return [];
    }
  }

  /**
   * Get VR experiences from vr-experiences collection
   */
  async getVRExperiences(): Promise<ExtendedVRExperience[]> {
    try {
      const experiencesRef = collection(db, 'vr-experiences');
      const experiencesSnapshot = await getDocs(experiencesRef);

      return experiencesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ExtendedVRExperience[];
    } catch (error) {
      console.error('Error fetching VR experiences:', error);
      return [];
    }
  }

  /**
   * Get specific VR experience by ID
   */
  async getVRExperienceById(id: string): Promise<ExtendedVRExperience | null> {
    try {
      const experienceRef = doc(db, 'vr-experiences', id);
      const experienceSnapshot = await getDoc(experienceRef);

      if (!experienceSnapshot.exists()) {
        return null;
      }

      return { id: experienceSnapshot.id, ...experienceSnapshot.data() } as ExtendedVRExperience;
    } catch (error) {
      console.error('Error fetching VR experience:', error);
      return null;
    }
  }

  /**
   * Get overview statistics
   */
  async getOverviewStats(): Promise<OverviewStat[]> {
    try {
      const statsRef = collection(db, 'overview-stats');
      const statsSnapshot = await getDocs(statsRef);

      if (statsSnapshot.size > 0) {
        return statsSnapshot.docs.map(doc => ({
          ...doc.data()
        })) as OverviewStat[];
      }

      // Fallback to calculated stats
      const experiences = await this.getVRExperiences();
      return [
        { icon: "Headphones", number: `${experiences.length}+`, label: "Trải nghiệm VR" },
        { icon: "Users", number: "10K+", label: "Người dùng" },
        { icon: "Clock", number: "24/7", label: "Truy cập" }
      ];
    } catch (error) {
      console.error('Error fetching overview stats:', error);
      return [];
    }
  }

  /**
   * Get complete VR content for landing page
   */
  async getVRContent(): Promise<VRContent | null> {
    try {
      // Try to get from vrContent collection first
      const vrContentRef = collection(db, 'vrContent');
      const q = query(vrContentRef, where('isActive', '==', true), limit(1));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as VRContent;
      }

      // If no vrContent document, construct from individual components
      const [features, extendedExperiences] = await Promise.all([
        this.getVRFeatures(),
        this.getVRExperiences()
      ]);

      // Convert ExtendedVRExperience to VRExperience format
      const experiences: VRExperience[] = extendedExperiences.map(exp => ({
        id: exp.id,
        title: exp.title,
        description: exp.description,
        imageUrl: exp.image || '/images/default-vr.jpg',
        experienceUrl: exp.vrUrl || `/vr/experiences/${exp.id}`,
        difficulty: exp.difficulty || 'N/A',
        duration: exp.duration || 'N/A'

      }));

      return {
        id: 'constructed',
        title: "Công Nghệ VR Hiện Đại",
        subtitle: "Trải nghiệm lịch sử một cách sống động",
        description: "Khám phá những di tích lịch sử quan trọng thông qua công nghệ thực tế ảo tiên tiến, mang đến trải nghiệm học tập và khám phá hoàn toàn mới.",
        features,
        experiences,
        benefits: {
          title: "Lợi ích của công nghệ VR",
          description: "Trải nghiệm học tập hiệu quả và thú vị",
          stats: [
            { percentage: "95%", label: "Người dùng hài lòng" },
            { percentage: "80%", label: "Tăng khả năng ghi nhớ" },
            { percentage: "90%", label: "Tương tác tích cực" }
          ]
        },
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
    } catch (error) {
      console.error('Error fetching VR content:', error);
      return null;
    }
  }

  /**
   * Get featured VR experiences
   */
  async getFeaturedExperiences(limitCount: number = 6): Promise<ExtendedVRExperience[]> {
    try {
      const q = query(
        collection(db, 'vr-experiences'),
        orderBy('title', 'asc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ExtendedVRExperience[];
    } catch (error) {
      console.error('Error fetching featured VR experiences:', error);
      return [];
    }
  }
  }

// Export service instance
export const vrContentService = new VRContentService();

// Export legacy functions for backward compatibility
export const getVRFeatures = () => vrContentService.getVRFeatures();
export const getVRExperiences = () => vrContentService.getVRExperiences();
export const getVRExperienceById = (id: string) => vrContentService.getVRExperienceById(id);
export const getOverviewStats = () => vrContentService.getOverviewStats();
export const getVRContent = () => vrContentService.getVRContent();
