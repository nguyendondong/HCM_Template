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
    const sanitizedEmail = email.trim().toLowerCase();

    if (!email || !password) {
      throw new Error('Email và mật khẩu không được để trống');
    }

    if (password.length < 6) {
      throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
    }

    const userCredential = await createUserWithEmailAndPassword(auth, sanitizedEmail, password);
    const user = userCredential.user;

    // Cập nhật profile nếu có displayName
    if (displayName) {
      await updateProfile(user, {
        displayName: displayName
      });
    }

    // Tạo user document trong Firestore
    await createUserDocument(user, { displayName });

    return user;
  } catch (error: any) {
    console.error('❌ Signup error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);

    // Handle specific error codes
    switch (error.code) {
      case 'auth/email-already-in-use':
        throw new Error('Email đã được sử dụng bởi tài khoản khác');
      case 'auth/weak-password':
        throw new Error('Mật khẩu quá yếu (tối thiểu 6 ký tự)');
      case 'auth/invalid-email':
        throw new Error('Email không hợp lệ');
      case 'auth/operation-not-allowed':
        throw new Error('Tính năng đăng ký email/password chưa được bật');
      case 'auth/too-many-requests':
        throw new Error('Quá nhiều yêu cầu. Vui lòng thử lại sau');
      default:
        // If it's already a custom error message, use it
        if (error.message && !error.code) {
          throw error;
        }
        throw new Error(`Đăng ký thất bại: ${error.message || 'Vui lòng thử lại'}`);
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

    return user;
  } catch (error: any) {
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

    return user;
  } catch (error: any) {
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
  } catch (error) {
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
  if (!user) {
    throw new Error('User object is required');
  }

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
      }
    }
  } catch (error: any) {
    console.error('❌ Error creating/updating user document:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      userId: user.uid,
      userEmail: user.email
    });

    // Throw with more specific error message
    if (error.code === 'permission-denied') {
      throw new Error('Không có quyền tạo tài khoản người dùng. Vui lòng kiểm tra cấu hình Firebase.');
    } else if (error.code === 'unavailable') {
      throw new Error('Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.');
    } else {
      throw new Error(`Lỗi tạo thông tin người dùng: ${error.message}`);
    }
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
