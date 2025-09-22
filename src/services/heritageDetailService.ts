import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Extended heritage spot interface cho detail page
export interface ExtendedHeritageSpot {
  id: string;
  name: string;
  description: string;
  coordinates: { x: number; y: number };
  side: 'left' | 'right';
  imageUrl?: string;
  url?: string;

  // Extended information from seed data
  location?: {
    address: string;
    province: string;
    region: string;
  };

  visitingInfo?: {
    openingHours: {
      weekdays: string;
      weekends: string;
    };
    ticketPrices: {
      adult: number;
      student: number;
      child: number;
    };
  };

  historicalPeriods?: Array<{
    name: string;
    startYear: number;
    endYear: number;
    description: string;
    keyEvents: string[];
    significance: string;
  }>;

  mediaGallery?: Array<{
    type: string;
    url: string;
    title: string;
    description: string;
    isPrimary?: boolean;
  }>;

  culturalSignificance?: {
    importance: string;
    recognitionDate: string;
    culturalValues: string[];
    currentUse: string;
  };

  hoChiMinhConnection?: {
    timeSpent: string;
    activities: string[];
    personalImpact: string;
    quotes: string[];
  };

  accessibility?: {
    wheelchairAccessible: boolean;
    hasAudioGuide: boolean;
    accessibilityNotes: string;
  };

  nearbyAttractions?: Array<{
    name: string;
    distance: number;
    description: string;
  }>;
}

/**
 * Get extended heritage spot data with all details for detail page
 */
export const getExtendedHeritageSpotById = async (id: string): Promise<ExtendedHeritageSpot | null> => {
  try {
    const spotDoc = doc(db, 'heritage-spots', id);
    const spotSnapshot = await getDoc(spotDoc);

    if (!spotSnapshot.exists()) {
      console.log('No such heritage spot!');
      return null;
    }

    const data = spotSnapshot.data();

    // Convert from full JSON seed data to extended format
    const extendedSpot: ExtendedHeritageSpot = {
      id: spotSnapshot.id,
      name: data.name,
      description: data.description,
      coordinates: data.mapPosition || data.coordinates || { x: 50, y: 50 },
      side: (data.side === 'center' || data.side === 'right') ? 'right' : 'left',
      imageUrl: data.mediaGallery?.[0]?.url || '',
      url: data.url || '',

      // Extended data
      location: data.location ? {
        address: data.location.address || '',
        province: data.location.province || '',
        region: data.location.region || ''
      } : undefined,

      visitingInfo: data.visitingInfo ? {
        openingHours: {
          weekdays: data.visitingInfo.openingHours?.weekdays || '7:00 - 17:00',
          weekends: data.visitingInfo.openingHours?.weekends || '7:00 - 17:00'
        },
        ticketPrices: {
          adult: data.visitingInfo.ticketPrices?.adult || 0,
          student: data.visitingInfo.ticketPrices?.student || 0,
          child: data.visitingInfo.ticketPrices?.child || 0
        }
      } : undefined,

      historicalPeriods: data.historicalPeriods || [],
      mediaGallery: data.mediaGallery || [],
      culturalSignificance: data.culturalSignificance,
      hoChiMinhConnection: data.hoChiMinhConnection,
      accessibility: data.accessibility,
      nearbyAttractions: data.nearbyAttractions
    };

    return extendedSpot;
  } catch (error) {
    console.error('Error getting extended heritage spot: ', error);
    throw error;
  }
};

/**
 * Extract highlights from heritage spot data
 */
export const extractHighlights = (spot: ExtendedHeritageSpot): string[] => {
  const highlights: string[] = [];

  // From historical periods
  if (spot.historicalPeriods && spot.historicalPeriods.length > 0) {
    spot.historicalPeriods.forEach(period => {
      if (period.significance) {
        highlights.push(period.significance);
      }
    });
  }

  // From cultural significance
  if (spot.culturalSignificance?.culturalValues) {
    highlights.push(...spot.culturalSignificance.culturalValues);
  }

  // From Ho Chi Minh connection
  if (spot.hoChiMinhConnection?.activities) {
    highlights.push(...spot.hoChiMinhConnection.activities.slice(0, 3)); // Take first 3
  }

  // Default if no highlights found
  if (highlights.length === 0) {
    highlights.push('Di tích lịch sử quan trọng của Việt Nam');
    highlights.push('Liên quan đến cuộc đời Chủ tịch Hồ Chí Minh');
  }

  return highlights.slice(0, 6); // Limit to 6 highlights
};

/**
 * Extract historical events from heritage spot data
 */
export const extractHistoricalEvents = (spot: ExtendedHeritageSpot): string[] => {
  const events: string[] = [];

  // From historical periods
  if (spot.historicalPeriods && spot.historicalPeriods.length > 0) {
    spot.historicalPeriods.forEach(period => {
      if (period.keyEvents) {
        events.push(...period.keyEvents);
      }
    });
  }

  // Default if no events found
  if (events.length === 0) {
    events.push('Đang cập nhật thông tin chi tiết về các sự kiện lịch sử');
  }

  return events;
};

/**
 * Extract gallery images from heritage spot data
 */
export const extractGallery = (spot: ExtendedHeritageSpot): string[] => {
  const gallery: string[] = [];

  // From media gallery
  if (spot.mediaGallery && spot.mediaGallery.length > 0) {
    spot.mediaGallery.forEach(media => {
      if (media.type === 'image' && media.url) {
        gallery.push(media.url);
      }
    });
  }

  // Default fallback images
  if (gallery.length === 0) {
    gallery.push(
      'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1570197505883-b80dfc0e8d1a?w=600&h=400&fit=crop'
    );
  }

  return gallery;
};

/**
 * Get spot establishment info
 */
export function getEstablishmentInfo(spot: ExtendedHeritageSpot): {
  foundedYear?: string;
  area?: string;
  location?: string;
} {
  const cultural = spot.culturalSignificance;

  return {
    foundedYear: cultural?.recognitionDate || '',
    area: spot.location?.address || '',
    location: `${spot.location?.address || ''}, ${spot.location?.province || ''}`.trim().replace(/^,\s*/, '')
  };
}

export default {
  getExtendedHeritageSpotById,
  extractHighlights,
  extractHistoricalEvents,
  extractGallery,
  getEstablishmentInfo
};
