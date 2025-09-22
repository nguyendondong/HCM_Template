import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface VRFeature {
  icon: string;
  title: string;
  description: string;
}

export interface VRExperience {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: string;
  category: string;
  features: string[];
  thumbnail: string;
  videoSrc?: string;
  image?: string;
}

export interface OverviewStat {
  icon: string;
  number: string;
  label: string;
}

/**
 * Get VR features
 */
export const getVRFeatures = async (): Promise<VRFeature[]> => {
  try {
    const featuresRef = collection(db, 'vr-features');
    const featuresSnapshot = await getDocs(featuresRef);

    return featuresSnapshot.docs.map(doc => ({
      ...doc.data()
    })) as VRFeature[];
  } catch (error) {
    console.error('Error fetching VR features:', error);
    return [];
  }
};

/**
 * Get VR experiences
 */
export const getVRExperiences = async (): Promise<VRExperience[]> => {
  try {
    const experiencesRef = collection(db, 'vr-experiences');
    const experiencesSnapshot = await getDocs(experiencesRef);

    return experiencesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as VRExperience[];
  } catch (error) {
    console.error('Error fetching VR experiences:', error);
    return [];
  }
};

/**
 * Get specific VR experience by ID
 */
export const getVRExperienceById = async (id: string): Promise<VRExperience | null> => {
  try {
    const experienceRef = doc(db, 'vr-experiences', id);
    const experienceSnapshot = await getDoc(experienceRef);

    if (!experienceSnapshot.exists()) {
      return null;
    }

    return { id: experienceSnapshot.id, ...experienceSnapshot.data() } as VRExperience;
  } catch (error) {
    console.error('Error fetching VR experience:', error);
    return null;
  }
};

/**
 * Get overview statistics
 */
export const getOverviewStats = async (): Promise<OverviewStat[]> => {
  try {
    const statsRef = collection(db, 'overview-stats');
    const statsSnapshot = await getDocs(statsRef);

    return statsSnapshot.docs.map(doc => ({
      ...doc.data()
    })) as OverviewStat[];
  } catch (error) {
    console.error('Error fetching overview stats:', error);
    return [];
  }
};
