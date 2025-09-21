import {
  collection,
  addDoc,
  doc,
  setDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { FirebaseHeritageSpot } from '../types/firebase';

// ===== CREATE OPERATIONS =====

/**
 * Thêm heritage spot mới với auto-generated ID
 */
export const addHeritageSpot = async (spotData: Omit<FirebaseHeritageSpot, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const spotsCollection = collection(db, 'heritageSpots');
    const docRef = await addDoc(spotsCollection, {
      ...spotData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    console.log('Heritage spot added with ID: ', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding heritage spot: ', error);
    throw error;
  }
};

/**
 * Thêm heritage spot với custom ID
 */
export const addHeritageSpotWithId = async (
  id: string,
  spotData: Omit<FirebaseHeritageSpot, 'id' | 'createdAt' | 'updatedAt'>
) => {
  try {
    const spotDoc = doc(db, 'heritageSpots', id);
    await setDoc(spotDoc, {
      id,
      ...spotData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    console.log('Heritage spot added with custom ID: ', id);
    return id;
  } catch (error) {
    console.error('Error adding heritage spot with custom ID: ', error);
    throw error;
  }
};

// ===== READ OPERATIONS =====

/**
 * Lấy tất cả heritage spots
 */
export const getAllHeritageSpots = async (): Promise<FirebaseHeritageSpot[]> => {
  try {
    const spotsCollection = collection(db, 'heritageSpots');
    const spotsSnapshot = await getDocs(spotsCollection);

    const spots = spotsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FirebaseHeritageSpot[];

    return spots;
  } catch (error) {
    console.error('Error getting heritage spots: ', error);
    throw error;
  }
};

/**
 * Lấy heritage spot theo ID
 */
export const getHeritageSpotById = async (id: string): Promise<FirebaseHeritageSpot | null> => {
  try {
    const spotDoc = doc(db, 'heritageSpots', id);
    const spotSnapshot = await getDoc(spotDoc);

    if (spotSnapshot.exists()) {
      return {
        id: spotSnapshot.id,
        ...spotSnapshot.data()
      } as FirebaseHeritageSpot;
    } else {
      console.log('No such heritage spot!');
      return null;
    }
  } catch (error) {
    console.error('Error getting heritage spot: ', error);
    throw error;
  }
};

/**
 * Query heritage spots theo side (left/right)
 */
export const getHeritageSpotsBySide = async (side: 'left' | 'right'): Promise<FirebaseHeritageSpot[]> => {
  try {
    const spotsCollection = collection(db, 'heritageSpots');
    const q = query(
      spotsCollection,
      where('side', '==', side),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const querySnapshot = await getDocs(q);
    const spots = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FirebaseHeritageSpot[];

    return spots;
  } catch (error) {
    console.error('Error querying heritage spots: ', error);
    throw error;
  }
};

/**
 * Search heritage spots theo tên
 */
export const searchHeritageSpots = async (searchTerm: string): Promise<FirebaseHeritageSpot[]> => {
  try {
    const spotsCollection = collection(db, 'heritageSpots');
    const spotsSnapshot = await getDocs(spotsCollection);

    const spots = spotsSnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }) as FirebaseHeritageSpot)
      .filter(spot =>
        spot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spot.description.toLowerCase().includes(searchTerm.toLowerCase())
      );

    return spots;
  } catch (error) {
    console.error('Error searching heritage spots: ', error);
    throw error;
  }
};

// ===== UPDATE OPERATIONS =====

/**
 * Cập nhật heritage spot
 */
export const updateHeritageSpot = async (
  id: string,
  updates: Partial<Omit<FirebaseHeritageSpot, 'id' | 'createdAt' | 'updatedAt'>>
) => {
  try {
    const spotDoc = doc(db, 'heritageSpots', id);
    await updateDoc(spotDoc, {
      ...updates,
      updatedAt: Timestamp.now()
    });

    console.log('Heritage spot updated successfully');
  } catch (error) {
    console.error('Error updating heritage spot: ', error);
    throw error;
  }
};

/**
 * Cập nhật coordinates của heritage spot
 */
export const updateHeritageSpotCoordinates = async (
  id: string,
  coordinates: { x: number; y: number }
) => {
  try {
    await updateHeritageSpot(id, { coordinates });
    console.log('Heritage spot coordinates updated');
  } catch (error) {
    console.error('Error updating heritage spot coordinates: ', error);
    throw error;
  }
};

/**
 * Cập nhật image URL của heritage spot
 */
export const updateHeritageSpotImage = async (id: string, imageUrl: string) => {
  try {
    await updateHeritageSpot(id, { imageUrl });
    console.log('Heritage spot image updated');
  } catch (error) {
    console.error('Error updating heritage spot image: ', error);
    throw error;
  }
};

// ===== DELETE OPERATIONS =====

/**
 * Xóa heritage spot
 */
export const deleteHeritageSpot = async (id: string) => {
  try {
    const spotDoc = doc(db, 'heritageSpots', id);
    await deleteDoc(spotDoc);

    console.log('Heritage spot deleted successfully');
  } catch (error) {
    console.error('Error deleting heritage spot: ', error);
    throw error;
  }
};

// ===== REAL-TIME LISTENERS =====

/**
 * Subscribe to real-time changes của heritage spots
 */
export const subscribeToHeritageSpots = (callback: (spots: FirebaseHeritageSpot[]) => void) => {
  const spotsCollection = collection(db, 'heritageSpots');
  const q = query(spotsCollection, orderBy('createdAt', 'desc'));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const spots = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FirebaseHeritageSpot[];

    callback(spots);
  }, (error) => {
    console.error('Error in heritage spots subscription: ', error);
  });

  return unsubscribe; // Call this function to unsubscribe
};

/**
 * Subscribe to changes của một heritage spot cụ thể
 */
export const subscribeToHeritageSpot = (
  id: string,
  callback: (spot: FirebaseHeritageSpot | null) => void
) => {
  const spotDoc = doc(db, 'heritageSpots', id);

  const unsubscribe = onSnapshot(spotDoc, (doc) => {
    if (doc.exists()) {
      const spot = {
        id: doc.id,
        ...doc.data()
      } as FirebaseHeritageSpot;
      callback(spot);
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Error in heritage spot subscription: ', error);
  });

  return unsubscribe;
};

// ===== BATCH OPERATIONS =====

/**
 * Khởi tạo dữ liệu heritage spots từ local data
 */
export const initializeHeritageSpots = async (localSpots: any[]) => {
  try {
    const batch = [];

    for (const spot of localSpots) {
      const spotData: Omit<FirebaseHeritageSpot, 'id' | 'createdAt' | 'updatedAt'> = {
        name: spot.name,
        description: spot.description,
        coordinates: spot.coordinates,
        side: spot.side
      };

      batch.push(addHeritageSpotWithId(spot.id, spotData));
    }

    await Promise.all(batch);
    console.log('All heritage spots initialized successfully');
  } catch (error) {
    console.error('Error initializing heritage spots: ', error);
    throw error;
  }
};

// ===== UTILITY FUNCTIONS =====

/**
 * Kiểm tra xem heritage spot có tồn tại không
 */
export const heritageSpotExists = async (id: string): Promise<boolean> => {
  try {
    const spot = await getHeritageSpotById(id);
    return spot !== null;
  } catch (error) {
    console.error('Error checking heritage spot existence: ', error);
    return false;
  }
};

/**
 * Đếm tổng số heritage spots
 */
export const countHeritageSpots = async (): Promise<number> => {
  try {
    const spots = await getAllHeritageSpots();
    return spots.length;
  } catch (error) {
    console.error('Error counting heritage spots: ', error);
    return 0;
  }
};
