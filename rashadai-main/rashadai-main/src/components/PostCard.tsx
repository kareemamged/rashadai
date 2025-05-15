import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Post } from '../types';
import { formatDate } from '../utils/dateFormatter';
import { getImageUrl, checkImageUrl } from '../utils/imageUtils';
import { DEFAULT_BLOG_IMAGE } from '../constants/images';
import { FileText, MessageSquare, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language || 'en';
  const [imageUrl, setImageUrl] = useState<string>(post.imageUrl || DEFAULT_BLOG_IMAGE);
  const [imageError, setImageError] = useState<boolean>(false);

  useEffect(() => {
    // استخدام دالة getImageUrl لإصلاح رابط الصورة
    const fixedUrl = getImageUrl(post.imageUrl);
    setImageUrl(fixedUrl);

    // التحقق من صحة الرابط
    const checkImage = async () => {
      if (fixedUrl.startsWith('http')) {
        const isValid = await checkImageUrl(fixedUrl);
        if (!isValid) {
          console.log('Image URL is invalid:', fixedUrl);
          setImageUrl(DEFAULT_BLOG_IMAGE);
        }
      }
    };

    checkImage();
  }, [post.imageUrl]);

  // استخدام ارتفاع ثابت للبطاقة بالكامل (28rem = 448px) مع flex-col لتنظيم العناصر عموديًا
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col h-[28rem]" dir={currentLanguage === 'en' ? 'ltr' : 'rtl'}>
      {/* قسم الصورة بارتفاع ثابت */}
      <div className="h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={post.title[currentLanguage]}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          onError={(e) => {
            // إذا فشل تحميل الصورة، استخدم الصورة الافتراضية
            console.log('Image failed to load, using default image');
            console.log('Failed image URL:', imageUrl);

            if (imageUrl !== DEFAULT_BLOG_IMAGE) {
              // محاولة استخدام الصورة الافتراضية
              setImageUrl(DEFAULT_BLOG_IMAGE);
            } else {
              // إذا كانت الصورة الافتراضية أيضًا غير متوفرة
              console.log('Default image not found either!');
              setImageError(true);
            }
          }}
        />
      </div>
      {/* قسم المحتوى مع flex-grow لملء المساحة المتبقية */}
      <div className="p-6 flex flex-col flex-grow">
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

        {/* استخدام div بدلاً من p لتحديد ارتفاع ثابت للملخص مع تأثير تدرج في النهاية */}
        <div className={`text-gray-600 relative ${currentLanguage === 'ar' ? 'text-right' : 'text-left'}`} style={{ height: '4.5rem' }}>
          <p className="line-clamp-3">{post.summary[currentLanguage]}</p>
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent"></div>
        </div>

        {/* استخدام mt-auto لدفع الزر إلى الأسفل دائمًا بغض النظر عن حجم المحتوى */}
        <div className="flex items-center justify-end mt-auto pt-4">
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