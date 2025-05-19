// أدوات مساعدة للتعامل مع الصور
import { DEFAULT_BLOG_IMAGE } from '../constants/images';

/**
 * دالة للتحقق من وجود رابط الصورة وإصلاحه إذا كان غير صحيح
 * @param url رابط الصورة
 * @returns رابط الصورة المصحح
 */
export const getImageUrl = (url: string | undefined): string => {
  if (!url || url.trim() === '') {
    console.log('No URL provided, using default image');
    return DEFAULT_BLOG_IMAGE;
  }

  // طباعة الرابط الأصلي للتشخيص
  console.log('Original image URL:', url);

  // إذا كان الرابط يبدأ بـ http أو https، فهو صحيح
  if (url.startsWith('http')) {
    console.log('URL starts with http/https, returning as is');
    return url;
  }

  // إذا كان الرابط يبدأ بـ /، فهو مسار محلي
  if (url.startsWith('/')) {
    console.log('URL starts with /, returning as is');
    return url;
  }

  // إذا كان الرابط يبدأ بـ blog/، فهو مسار في مخزن Supabase
  if (url.startsWith('blog/')) {
    const newUrl = `https://voiwxfqryobznmxgpamq.supabase.co/storage/v1/object/public/images/${url}`;
    console.log('URL starts with blog/, converted to:', newUrl);
    return newUrl;
  }

  // إذا كان الرابط لا يحتوي على مسار، فهو اسم ملف في مجلد blog
  const newUrl = `https://voiwxfqryobznmxgpamq.supabase.co/storage/v1/object/public/images/blog/${url}`;
  console.log('URL has no path, converted to:', newUrl);
  return newUrl;
};

/**
 * دالة للتحقق من صحة رابط الصورة
 * @param url رابط الصورة
 * @returns وعد يحتوي على قيمة منطقية تشير إلى صحة الرابط
 */
export const checkImageUrl = async (url: string): Promise<boolean> => {
  // إذا كان الرابط هو نفسه رابط الصورة البديلة، نفترض أنه صحيح
  if (url === DEFAULT_BLOG_IMAGE) {
    return true;
  }

  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Error checking image URL:', error);
    return false;
  }
};

/**
 * دالة لضغط الصور قبل رفعها
 * @param file ملف الصورة
 * @param maxWidth العرض الأقصى للصورة
 * @param maxHeight الارتفاع الأقصى للصورة
 * @param quality جودة الصورة (0-1)
 * @returns وعد يحتوي على ملف الصورة المضغوط
 */
export const compressImage = async (
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        // حساب الأبعاد الجديدة مع الحفاظ على نسبة العرض إلى الارتفاع
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        // إنشاء canvas لرسم الصورة المضغوطة
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // تحويل الصورة إلى blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            // إنشاء ملف جديد من الـ blob
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          },
          file.type,
          quality
        );
      };
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
  });
};
