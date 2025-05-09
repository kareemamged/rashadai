import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { posts } from '../data/posts';
import { Post } from '../types';
import PostCard from '../components/PostCard';
import BlogHeader from '../components/BlogHeader';
import Footer from '../components/Footer';
import Pagination from '../components/Pagination';
import BlogSearch from '../components/BlogSearch';
import { FileText, Brain } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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

  useEffect(() => {
    // Filter posts based on category and search query
    let filteredPosts = [...posts];

    if (category) {
      const categoryType = category === 'news' ? 'news' : 'tip';
      filteredPosts = filteredPosts.filter(post => post.category === categoryType);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredPosts = filteredPosts.filter(
        post =>
          post.title[currentLanguage].toLowerCase().includes(query) ||
          post.summary[currentLanguage].toLowerCase().includes(query) ||
          post.content[currentLanguage].toLowerCase().includes(query)
      );
    }

    // Sort posts by date (newest first)
    filteredPosts.sort((a, b) =>
      new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
    );

    // Calculate pagination
    const total = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
    setTotalPages(total);

    // Adjust current page if needed
    if (currentPage > total) {
      setCurrentPage(1);
    }

    // Get posts for current page
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;
    setDisplayedPosts(filteredPosts.slice(startIndex, endIndex));

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
    <div className="min-h-screen bg-gray-50" dir={currentLanguage === 'en' ? 'ltr' : 'rtl'} lang={currentLanguage}>
      <BlogHeader />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-10 text-center">
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

        <BlogSearch onSearch={handleSearch} />

        {displayedPosts.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h2 className={`text-2xl font-semibold text-gray-700 mb-2 ${currentLanguage === 'ar' ? 'text-right' : ''}`}>
              {currentLanguage === 'en' ? 'No Posts Found' : 'لم يتم العثور على منشورات'}
            </h2>
            <p className={`text-gray-500 mb-6 ${currentLanguage === 'ar' ? 'text-right' : ''}`}>
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
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {currentLanguage === 'en' ? 'View All Posts' : 'عرض جميع المنشورات'}
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedPosts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default BlogPage;