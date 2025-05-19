// خدمة التخزين المحلي للصور والبيانات

// مفاتيح التخزين
const KEYS = {
  PROFILE_IMAGE: 'profile_image',
  USER_DATA: 'user_data',
};

/**
 * تخزين صورة الملف الشخصي في التخزين المحلي
 */
export const saveProfileImage = (userId: string, imageDataUrl: string): void => {
  try {
    localStorage.setItem(`${KEYS.PROFILE_IMAGE}_${userId}`, imageDataUrl);
  } catch (error) {
    console.error('Error saving profile image to localStorage:', error);
  }
};

/**
 * استرجاع صورة الملف الشخصي من التخزين المحلي
 */
export const getProfileImage = (userId: string): string | null => {
  try {
    return localStorage.getItem(`${KEYS.PROFILE_IMAGE}_${userId}`);
  } catch (error) {
    console.error('Error getting profile image from localStorage:', error);
    return null;
  }
};

/**
 * تخزين بيانات المستخدم في التخزين المحلي
 */
export const saveUserData = (userId: string, userData: any): void => {
  try {
    localStorage.setItem(`${KEYS.USER_DATA}_${userId}`, JSON.stringify(userData));
  } catch (error) {
    console.error('Error saving user data to localStorage:', error);
  }
};

/**
 * استرجاع بيانات المستخدم من التخزين المحلي
 */
export const getUserData = (userId: string): any | null => {
  try {
    const data = localStorage.getItem(`${KEYS.USER_DATA}_${userId}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting user data from localStorage:', error);
    return null;
  }
};

/**
 * تحديث بيانات المستخدم في التخزين المحلي
 */
export const updateUserData = (userId: string, newData: any): void => {
  try {
    const currentData = getUserData(userId) || {};
    const updatedData = { ...currentData, ...newData, updated_at: new Date().toISOString() };
    saveUserData(userId, updatedData);
  } catch (error) {
    console.error('Error updating user data in localStorage:', error);
  }
};

/**
 * حذف بيانات المستخدم من التخزين المحلي
 */
export const clearUserData = (userId: string): void => {
  try {
    localStorage.removeItem(`${KEYS.PROFILE_IMAGE}_${userId}`);
    localStorage.removeItem(`${KEYS.USER_DATA}_${userId}`);
  } catch (error) {
    console.error('Error clearing user data from localStorage:', error);
  }
};
