import { Timestamp } from 'firebase/firestore';

// Firebase version của HeritageSpot với timestamps
export interface FirebaseHeritageSpot {
  id: string;
  name: string;
  description: string;
  mapPosition: {
    x: number; // Percentage from left
    y: number; // Percentage from top
  };
  side: 'left' | 'right' | 'center';
  url?: string;

  imageUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// User data stored in Firestore
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Timestamp;
  visitedSpots: string[]; // Array of heritage spot IDs
}

// Comment for heritage spots
export interface Comment {
  id: string;
  spotId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  rating: number; // 1-5 stars
  createdAt: Timestamp;
}

// Admin settings
export interface AdminSettings {
  maintenanceMode: boolean;
  featuredSpotId: string;
  lastUpdated: Timestamp;
}

// File upload progress
export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  state: 'running' | 'paused' | 'success' | 'canceled' | 'error';
}

// Storage file info
export interface StorageFile {
  name: string;
  fullPath: string;
  downloadURL: string;
  size?: number;
  contentType?: string;
}
