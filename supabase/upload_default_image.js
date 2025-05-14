// رفع صورة افتراضية إلى مخزن Supabase

// يمكن تنفيذ هذا الكود في وحدة تحكم المتصفح أو في ملف JavaScript منفصل

// 1. قم بتعريف متغيرات Supabase
const SUPABASE_URL = 'https://voiwxfqryobznmxgpamq.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // استبدل بمفتاح Supabase الخاص بك

// 2. إنشاء عميل Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 3. رفع صورة افتراضية
async function uploadDefaultImage() {
  try {
    // إنشاء صورة فارغة بلون رمادي
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    
    // تعيين لون خلفية رمادي
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // إضافة نص
    ctx.fillStyle = '#666666';
    ctx.font = 'bold 30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Default Image', canvas.width / 2, canvas.height / 2);
    
    // تحويل الصورة إلى blob
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
    
    // إنشاء ملف من الـ blob
    const file = new File([blob], 'default.webp', { type: 'image/jpeg' });
    
    // رفع الملف إلى Supabase
    const { data, error } = await supabase.storage
      .from('images')
      .upload('blog/default.webp', file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      throw error;
    }
    
    // الحصول على الرابط العام للصورة
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl('blog/default.webp');
    
    console.log('Default image uploaded successfully!');
    console.log('Public URL:', urlData.publicUrl);
    
    // تحديث روابط الصور في قاعدة البيانات
    const { error: updateError } = await supabase
      .from('blog_posts')
      .update({ image_url: urlData.publicUrl })
      .eq('image_url', '/images/blog/default.webp');
    
    if (updateError) {
      console.error('Error updating image URLs in database:', updateError);
    } else {
      console.log('Image URLs updated in database');
    }
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading default image:', error);
    throw error;
  }
}

// 4. تنفيذ الدالة
uploadDefaultImage()
  .then(url => {
    console.log('Process completed. Default image URL:', url);
  })
  .catch(err => {
    console.error('Process failed:', err);
  });
