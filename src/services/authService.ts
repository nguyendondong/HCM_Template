import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  sendPasswordResetEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User } from '../types/firebase';

// Google Provider setup
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// ===== AUTHENTICATION METHODS =====

/**
 * Đăng ký với email và password
 */
export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName?: string
): Promise<FirebaseUser> => {
  try {
    // Tạo user trong Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Cập nhật profile nếu có displayName
    if (displayName) {
      await updateProfile(user, {
        displayName: displayName
      });
    }

    // Tạo user document trong Firestore
    await createUserDocument(user, { displayName });

    console.log('User signed up successfully:', user.uid);
    return user;
  } catch (error: any) {
    console.error('Error signing up:', error);

    // Handle specific error codes
    switch (error.code) {
      case 'auth/email-already-in-use':
        throw new Error('Email đã được sử dụng bởi tài khoản khác');
      case 'auth/weak-password':
        throw new Error('Mật khẩu quá yếu (tối thiểu 6 ký tự)');
      case 'auth/invalid-email':
        throw new Error('Email không hợp lệ');
      default:
        throw new Error('Đăng ký thất bại. Vui lòng thử lại.');
    }
  }
};

/**
 * Đăng nhập với email và password
 */
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<FirebaseUser> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Ensure user document exists in Firestore
    await createUserDocument(user);

    console.log('User signed in successfully:', user.uid);
    return user;
  } catch (error: any) {
    console.error('Error signing in:', error);

    // Handle specific error codes
    switch (error.code) {
      case 'auth/user-not-found':
        throw new Error('Tài khoản không tồn tại');
      case 'auth/wrong-password':
        throw new Error('Mật khẩu không đúng');
      case 'auth/invalid-email':
        throw new Error('Email không hợp lệ');
      case 'auth/user-disabled':
        throw new Error('Tài khoản đã bị vô hiệu hóa');
      case 'auth/too-many-requests':
        throw new Error('Quá nhiều lần thử. Vui lòng thử lại sau.');
      default:
        throw new Error('Đăng nhập thất bại. Vui lòng thử lại.');
    }
  }
};

/**
 * Đăng nhập với Google
 */
export const signInWithGoogle = async (): Promise<FirebaseUser> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Tạo hoặc cập nhật user document trong Firestore
    await createUserDocument(user);

    console.log('User signed in with Google:', user.uid);
    return user;
  } catch (error: any) {
    console.error('Error signing in with Google:', error);

    // Handle specific error codes
    switch (error.code) {
      case 'auth/popup-closed-by-user':
        throw new Error('Đăng nhập bị hủy bởi người dùng');
      case 'auth/popup-blocked':
        throw new Error('Popup bị chặn. Vui lòng cho phép popup và thử lại.');
      case 'auth/cancelled-popup-request':
        throw new Error('Yêu cầu đăng nhập bị hủy');
      default:
        throw new Error('Đăng nhập Google thất bại. Vui lòng thử lại.');
    }
  }
};

/**
 * Đăng xuất
 */
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
    console.log('User signed out successfully');
  } catch (error) {
    console.error('Error signing out:', error);
    throw new Error('Đăng xuất thất bại');
  }
};

// ===== PASSWORD MANAGEMENT =====

/**
 * Gửi email reset password
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log('Password reset email sent');
  } catch (error: any) {
    console.error('Error sending password reset email:', error);

    switch (error.code) {
      case 'auth/user-not-found':
        throw new Error('Email không tồn tại trong hệ thống');
      case 'auth/invalid-email':
        throw new Error('Email không hợp lệ');
      default:
        throw new Error('Gửi email reset mật khẩu thất bại');
    }
  }
};

/**
 * Đổi mật khẩu (yêu cầu re-authentication)
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error('Không tìm thấy user hiện tại');
    }

    // Re-authenticate user
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // Update password
    await updatePassword(user, newPassword);
    console.log('Password updated successfully');
  } catch (error: any) {
    console.error('Error changing password:', error);

    switch (error.code) {
      case 'auth/wrong-password':
        throw new Error('Mật khẩu hiện tại không đúng');
      case 'auth/weak-password':
        throw new Error('Mật khẩu mới quá yếu (tối thiểu 6 ký tự)');
      default:
        throw new Error('Đổi mật khẩu thất bại');
    }
  }
};

// ===== USER DATA MANAGEMENT =====

/**
 * Tạo hoặc cập nhật user document trong Firestore
 */
const createUserDocument = async (
  user: FirebaseUser,
  additionalData?: any
): Promise<void> => {
  if (!user) return;

  try {
    const userDoc = doc(db, 'users', user.uid);
    const userSnapshot = await getDoc(userDoc);

    if (!userSnapshot.exists()) {
      // Tạo user document mới
      const { uid, email, displayName, photoURL } = user;

      const userData: User = {
        uid,
        email: email || '',
        displayName: displayName || additionalData?.displayName || '',
        photoURL: photoURL || '',
        createdAt: Timestamp.now(),
        visitedSpots: []
      };

      await setDoc(userDoc, userData);
      console.log('User document created in Firestore');
    } else {
      // Cập nhật thông tin nếu có thay đổi
      const existingData = userSnapshot.data() as User;
      const updates: Partial<User> = {};

      if (user.displayName && user.displayName !== existingData.displayName) {
        updates.displayName = user.displayName;
      }

      if (user.photoURL && user.photoURL !== existingData.photoURL) {
        updates.photoURL = user.photoURL;
      }

      if (Object.keys(updates).length > 0) {
        await updateDoc(userDoc, updates);
        console.log('User document updated in Firestore');
      }
    }
  } catch (error) {
    console.error('Error creating/updating user document:', error);
    throw error;
  }
};

/**
 * Lấy thông tin user hiện tại từ Auth
 */
export const getCurrentUser = (): Promise<FirebaseUser | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

/**
 * Lấy thông tin user từ Firestore
 */
export const getUserData = async (uid: string): Promise<User | null> => {
  try {
    const userDoc = doc(db, 'users', uid);
    const userSnapshot = await getDoc(userDoc);

    if (userSnapshot.exists()) {
      return userSnapshot.data() as User;
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
};

/**
 * Cập nhật profile user
 */
export const updateUserProfile = async (
  uid: string,
  updates: Partial<Omit<User, 'uid' | 'email' | 'createdAt'>>
): Promise<void> => {
  try {
    const userDoc = doc(db, 'users', uid);
    await updateDoc(userDoc, updates);

    // Cập nhật trong Auth nếu có displayName hoặc photoURL
    const user = auth.currentUser;
    if (user && (updates.displayName || updates.photoURL)) {
      await updateProfile(user, {
        displayName: updates.displayName || user.displayName,
        photoURL: updates.photoURL || user.photoURL
      });
    }

    console.log('User profile updated successfully');
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Thêm heritage spot vào danh sách đã visit
 */
export const addVisitedSpot = async (uid: string, spotId: string): Promise<void> => {
  try {
    const userData = await getUserData(uid);
    if (!userData) {
      throw new Error('User data not found');
    }

    if (!userData.visitedSpots.includes(spotId)) {
      const updatedVisitedSpots = [...userData.visitedSpots, spotId];
      await updateUserProfile(uid, { visitedSpots: updatedVisitedSpots });
      console.log('Visited spot added:', spotId);
    }
  } catch (error) {
    console.error('Error adding visited spot:', error);
    throw error;
  }
};

/**
 * Xóa heritage spot khỏi danh sách đã visit
 */
export const removeVisitedSpot = async (uid: string, spotId: string): Promise<void> => {
  try {
    const userData = await getUserData(uid);
    if (!userData) {
      throw new Error('User data not found');
    }

    const updatedVisitedSpots = userData.visitedSpots.filter(id => id !== spotId);
    await updateUserProfile(uid, { visitedSpots: updatedVisitedSpots });
    console.log('Visited spot removed:', spotId);
  } catch (error) {
    console.error('Error removing visited spot:', error);
    throw error;
  }
};

// ===== AUTH STATE MANAGEMENT =====

/**
 * Subscribe to auth state changes
 */
export const subscribeToAuthState = (
  callback: (user: FirebaseUser | null) => void
): (() => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Kiểm tra user có đăng nhập không
 */
export const isUserSignedIn = (): boolean => {
  return !!auth.currentUser;
};

/**
 * Lấy user ID hiện tại
 */
export const getCurrentUserId = (): string | null => {
  return auth.currentUser?.uid || null;
};
