// إصلاح عرض الصور في صفحة البلوج

/*
يجب تعديل دالة convertSupabasePosts في ملف BlogPage.tsx للتأكد من عرض الصور بشكل صحيح.
يمكن نسخ هذا الكود واستبداله في ملف BlogPage.tsx.
*/

// دالة لتحويل منشورات Supabase إلى نوع Post[]
const convertSupabasePosts = (posts: any[]): Post[] => {
  // دالة للتحقق من وجود رابط الصورة وإصلاحه إذا كان غير صحيح
  const getImageUrl = (url: string | undefined): string => {
    if (!url) return '/images/blog/default.webp';
    
    // إذا كان الرابط يبدأ بـ http أو https، فهو صحيح
    if (url.startsWith('http')) return url;
    
    // إذا كان الرابط يبدأ بـ /، فهو مسار محلي
    if (url.startsWith('/')) return url;
    
    // إذا كان الرابط يبدأ بـ blog/، فهو مسار في مخزن Supabase
    if (url.startsWith('blog/')) {
      return `https://voiwxfqryobznmxgpamq.supabase.co/storage/v1/object/public/images/${url}`;
    }
    
    // إذا كان الرابط لا يحتوي على مسار، فهو اسم ملف في مجلد blog
    return `https://voiwxfqryobznmxgpamq.supabase.co/storage/v1/object/public/images/blog/${url}`;
  };

  return posts.map(post => ({
    id: post.id,
    title: {
      en: post.title_en || post.title || 'Untitled',
      ar: post.title_ar || 'بدون عنوان'
    },
    summary: {
      en: post.summary_en || (post.content_en?.substring(0, 150) + '...') || (post.content?.substring(0, 150) + '...') || '',
      ar: post.summary_ar || (post.content_ar?.substring(0, 150) + '...') || ''
    },
    content: {
      en: post.content_en || post.content || '',
      ar: post.content_ar || ''
    },
    category: post.category || 'tip',
    publishedDate: post.created_at || new Date().toISOString(),
    imageUrl: getImageUrl(post.image_url),
    author: {
      name: post.author_name || post.profiles?.name || 'Admin',
      avatarUrl: '/images/avatars/default.webp'
    }
  }));
};
