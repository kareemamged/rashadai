// إصلاح عرض الصور في مكون PostCard.tsx

/*
يجب تعديل مكون PostCard.tsx للتأكد من عرض الصور بشكل صحيح.
يمكن نسخ هذا الكود واستبداله في ملف PostCard.tsx.
*/

import React from 'react';
import { Link } from 'react-router-dom';
import { Post } from '../types';
import { formatDate } from '../utils/dateFormatter';
import { FileText, MessageSquare, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language || 'en';
  
  // التحقق من وجود رابط الصورة وإصلاحه إذا كان غير صحيح
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
  
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300" dir={currentLanguage === 'en' ? 'ltr' : 'rtl'}>
      {post.imageUrl && (
        <div className="h-48 overflow-hidden">
          <img
            src={getImageUrl(post.imageUrl)}
            alt={post.title[currentLanguage]}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              // إذا فشل تحميل الصورة، استخدم الصورة الافتراضية
              (e.target as HTMLImageElement).src = '/images/blog/default.webp';
            }}
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center mb-3">
          <span className={`text-xs font-medium ${currentLanguage === 'en' ? 'mr-2' : 'ml-2'} px-2.5 py-0.5 rounded-full ${
            post.category === 'news' ? 'bg-blue-100 text-blue-800' : 'bg-teal-100 text-teal-800'
          }`}>
            {post.category === 'news'
              ? (currentLanguage === 'en' ? 'NEWS' : 'أخبار')
              : (currentLanguage === 'en' ? 'TIP' : 'نصيحة')
            }
          </span>
          <div className="flex items-center text-gray-500 text-sm">
            <Calendar className={`h-4 w-4 ${currentLanguage === 'en' ? 'mr-1' : 'ml-1'}`} />
            <span>{formatDate(post.publishedDate, currentLanguage)}</span>
          </div>
        </div>
        <h3 className={`text-xl font-bold mb-2 text-gray-800 ${currentLanguage === 'ar' ? 'text-right' : 'text-left'}`}>{post.title[currentLanguage]}</h3>
        <p className={`text-gray-600 mb-4 line-clamp-3 ${currentLanguage === 'ar' ? 'text-right' : 'text-left'}`}>{post.summary[currentLanguage]}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {post.author.avatarUrl ? (
              <img
                src={post.author.avatarUrl}
                alt={post.author.name}
                className={`w-8 h-8 rounded-full ${currentLanguage === 'en' ? 'mr-2' : 'ml-2'} object-cover`}
                onError={(e) => {
                  // إذا فشل تحميل الصورة، استخدم الصورة الافتراضية
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name)}&background=random`;
                }}
              />
            ) : (
              <div className={`w-8 h-8 rounded-full bg-gray-200 ${currentLanguage === 'en' ? 'mr-2' : 'ml-2'} flex items-center justify-center`}>
                {post.author.name.charAt(0)}
              </div>
            )}
            <span className={`text-sm text-gray-600 ${currentLanguage === 'ar' ? 'text-right' : ''}`}>{post.author.name}</span>
          </div>
          <Link
            to={`/post/${post.id}`}
            className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {currentLanguage === 'en' ? (
              <>Read more <FileText className="ml-1 h-4 w-4" /></>
            ) : (
              <>قراءة المزيد <FileText className="mr-1 h-4 w-4" /></>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
