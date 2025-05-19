import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Post } from '../types';
import PostCard from '../components/PostCard';
import BlogHeader from '../components/BlogHeader';
import Footer from '../components/Footer';
import Pagination from '../components/Pagination';
import BlogSearch from '../components/BlogSearch';
import { FileText, Brain, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { getImageUrl } from '../utils/imageUtils';

const POSTS_PER_PAGE = 6;

const BlogPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language || 'en';

  // Get search param from URL
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';

  const [displayedPosts, setDisplayedPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to convert Supabase blog posts to our Post type
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
      imageUrl: getImageUrl(post.image_url)
    }));
  };



  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Build the query
        let query = supabase
          .from('blog_posts')
          .select('*')
          .eq('published', true) // Only get published posts
          .order('created_at', { ascending: false });

        // Add category filter if needed
        if (category) {
          const categoryType = category === 'news' ? 'news' : 'tips';
          query = query.eq('category', categoryType);
        }

        // Add search filter if needed
        if (searchQuery) {
          const searchTerm = searchQuery.toLowerCase();
          // Search in both English and Arabic titles and content
          query = query.or(`title_en.ilike.%${searchTerm}%,title_ar.ilike.%${searchTerm}%,content_en.ilike.%${searchTerm}%,content_ar.ilike.%${searchTerm}%`);
        }

        console.log('Fetching blog posts with query:', query);
        const { data, error } = await query;
        console.log('Blog posts data:', data);
        console.log('Blog posts error:', error);

        if (error) throw error;

        // Process the data
        const allPosts = data ? convertSupabasePosts(data) : [];

        // Calculate pagination
        const total = Math.ceil(allPosts.length / POSTS_PER_PAGE);
        setTotalPages(total || 1);

        // Adjust current page if needed
        if (currentPage > total && total > 0) {
          setCurrentPage(1);
        }

        // Get posts for current page
        const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
        const endIndex = startIndex + POSTS_PER_PAGE;
        setDisplayedPosts(allPosts.slice(startIndex, endIndex));

      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError('Failed to load blog posts. Please try again later.');
        setDisplayedPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [category, searchQuery, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(location.search);

    if (term) {
      params.set('search', term);
    } else {
      params.delete('search');
    }

    navigate({
      pathname: location.pathname,
      search: params.toString()
    });

    setCurrentPage(1);
  };

  // Generate title based on category and search
  const generateTitle = () => {
    if (searchQuery) {
      return currentLanguage === 'en'
        ? `Search results for "${searchQuery}"`
        : `نتائج البحث عن "${searchQuery}"`;
    }

    if (category === 'news') {
      return currentLanguage === 'en'
        ? 'Latest Medical News'
        : 'أحدث الأخبار الطبية';
    }

    if (category === 'tips') {
      return currentLanguage === 'en'
        ? 'Health & Wellness Tips'
        : 'نصائح الصحة والعافية';
    }

    return currentLanguage === 'en' ? 'Blog' : 'المدونة';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50" dir={currentLanguage === 'en' ? 'ltr' : 'rtl'} lang={currentLanguage}>
      <BlogHeader />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-10 text-center"  >
          <h1 className={`text-3xl sm:text-4xl font-bold text-gray-900 mb-4 ${currentLanguage === 'ar' ? 'text-center' : 'text-center'}`}>{generateTitle()}</h1>

          <p className={`text-lg text-gray-600 max-w-3xl mx-auto ${currentLanguage === 'ar' ? 'text-center' : 'text-center'}`}>
            {category === 'news'
              ? (currentLanguage === 'en'
                ? 'Stay updated with the latest advancements, research, and company announcements in healthcare and AI.'
                : 'ابق على اطلاع بأحدث التطورات والأبحاث وإعلانات الشركة في مجال الرعاية الصحية والذكاء الاصطناعي.')
              : category === 'tips'
              ? (currentLanguage === 'en'
                ? 'Practical advice and guidance to help you maintain optimal health and wellness in your daily life.'
                : 'نصائح وإرشادات عملية لمساعدتك على الحفاظ على صحتك وعافيتك المثلى في حياتك اليومية.')
              : (currentLanguage === 'en'
                ? 'Explore our collection of articles, research updates, and practical health tips.'
                : 'استكشف مجموعتنا من المقالات وتحديثات الأبحاث ونصائح صحية عملية.')}
          </p>
        </div>

        <div  >
          <BlogSearch onSearch={handleSearch} />
        </div>

        {isLoading ? (
          <div className="text-center py-12" >
            <Loader2 className="h-16 w-16 mx-auto text-blue-500 animate-spin mb-4" />
            <p className="text-gray-600">
              {currentLanguage === 'en' ? 'Loading posts...' : 'جاري تحميل المنشورات...'}
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-red-50 rounded-lg p-6" >
            <FileText className="h-16 w-16 mx-auto text-red-400 mb-4" />
            <h2 className={`text-2xl font-semibold text-red-700 mb-2`}>
              {currentLanguage === 'en' ? 'Error Loading Posts' : 'خطأ في تحميل المنشورات'}
            </h2>
            <p className={`text-red-600 mb-6`}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-transform hover:scale-105"

            >
              {currentLanguage === 'en' ? 'Try Again' : 'حاول مرة أخرى'}
            </button>
          </div>
        ) : displayedPosts.length === 0 ? (
          <div className="text-center py-12" >
            <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4"   />
            <h2 className={`text-2xl font-semibold text-gray-700 mb-2 ${currentLanguage === 'ar' ? 'text-right' : ''}`}  >
              {currentLanguage === 'en' ? 'No Posts Found' : 'لم يتم العثور على منشورات'}
            </h2>
            <p className={`text-gray-500 mb-6 ${currentLanguage === 'ar' ? 'text-right' : ''}`}  >
              {searchQuery
                ? (currentLanguage === 'en'
                  ? `We couldn't find any posts matching "${searchQuery}"`
                  : `لم نتمكن من العثور على أي منشورات تطابق "${searchQuery}"`)
                : (currentLanguage === 'en'
                  ? 'There are no posts in this category yet'
                  : 'لا توجد منشورات في هذه الفئة حتى الآن')}
            </p>
            <button
              onClick={() => {
                navigate('/blog');
                handleSearch('');
              }}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-transform hover:scale-105"

            >
              {currentLanguage === 'en' ? 'View All Posts' : 'عرض جميع المنشورات'}
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"  >
              {displayedPosts.map((post, index) => (
                <div key={post.id}>
                  <PostCard post={post} />
                </div>
              ))}
            </div>

            <div   >
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default BlogPage;