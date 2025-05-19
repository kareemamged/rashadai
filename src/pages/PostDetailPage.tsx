import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Comment, Post } from '../types';
import { formatDate } from '../utils/dateFormatter';
import { getImageUrl, checkImageUrl } from '../utils/imageUtils';
import { DEFAULT_BLOG_IMAGE } from '../constants/images';
import BlogHeader from '../components/BlogHeader';
import Footer from '../components/Footer';
import CommentItem from '../components/CommentItem';
import CommentForm from '../components/CommentForm';
import { ArrowLeft, Calendar, MessageSquare, ThumbsUp, ThumbsDown, AlertCircle, Globe, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useBlogStore } from '../store/blogStore';
import { showSuccessNotification, showErrorNotification } from '../stores/notificationStore';

const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  console.log("ID from URL:", id);
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState<'en' | 'ar'>(i18n.language === 'ar' ? 'ar' : 'en');

  // استخدام مخزن المدونة
  const {
    fetchComments,
    createComment,
    comments,
    isLoadingComments,
    commentsError
  } = useBlogStore();

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>(DEFAULT_BLOG_IMAGE);
  const [imageError, setImageError] = useState<boolean>(false);

  // Update language when i18n.language changes
  useEffect(() => {
    setLanguage(i18n.language === 'ar' ? 'ar' : 'en');
  }, [i18n.language]);



  // Function to convert Supabase blog post to our Post type
  const convertSupabasePost = (post: any): Post => {
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

    return {
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
    };
  };

  useEffect(() => {
    if (!id) {
      navigate('/blog');
      return;
    }

    const fetchPost = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch post from Supabase
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (!data) {
          navigate('/blog');
          return;
        }

        // Set default author name if not available
        data.author_name = 'Admin';

        // Convert to our Post type
        const formattedPost = convertSupabasePost(data);
        setPost(formattedPost);

        // Set image URL with proper formatting
        if (formattedPost.imageUrl) {
          const fixedUrl = getImageUrl(formattedPost.imageUrl);
          setImageUrl(fixedUrl);

          // التحقق من صحة الرابط
          if (fixedUrl.startsWith('http')) {
            try {
              const isValid = await checkImageUrl(fixedUrl);
              if (!isValid) {
                console.log('Image URL is invalid:', fixedUrl);
                setImageUrl(DEFAULT_BLOG_IMAGE);
              }
            } catch (err) {
              console.error('Error checking image URL:', err);
              setImageUrl(DEFAULT_BLOG_IMAGE);
            }
          }
        } else {
          // إذا لم يكن هناك رابط صورة، استخدم الصورة البديلة
          setImageUrl(DEFAULT_BLOG_IMAGE);
        }

        // Set likes and dislikes
        setLikes(data.likes_count || 0);
        setDislikes(data.dislikes_count || 0);

        // Fetch comments from database
        if (id) {
          fetchComments(id);
        }

        // Check if user has already reacted
        if (user) {
          const storedReactions = localStorage.getItem('postReactions');
          if (storedReactions) {
            try {
              const reactions = JSON.parse(storedReactions);
              if (reactions[id]) {
                setUserReaction(reactions[id]);
              }
            } catch (error) {
              console.error('Error parsing stored reactions:', error);
            }
          }
        }

        // Increment view count
        await supabase
          .from('blog_posts')
          .update({ views: (data.views || 0) + 1 })
          .eq('id', id);

      } catch (err: any) {
        console.error('Error fetching post:', err);
        setError(err.message || 'Failed to load post');
      } finally {
        setIsLoading(false);
        // Scroll to top
        window.scrollTo(0, 0);
      }
    };

    fetchPost();
  }, [id, navigate, user]);

  const handleReaction = async (reaction: 'like' | 'dislike') => {
    if (!user) {
      setShowLoginPrompt(true);
      setTimeout(() => setShowLoginPrompt(false), 3000);
      return;
    }

    if (!id || !post) return;

    // Calculate new likes and dislikes counts
    let newLikes = likes;
    let newDislikes = dislikes;

    // Update state based on current reaction
    if (userReaction === reaction) {
      // User is toggling off their reaction
      setUserReaction(null);
      if (reaction === 'like') {
        newLikes = Math.max(0, likes - 1);
        setLikes(newLikes);
      } else {
        newDislikes = Math.max(0, dislikes - 1);
        setDislikes(newDislikes);
      }
    } else {
      // User is changing their reaction or adding a new one
      if (userReaction === 'like' && reaction === 'dislike') {
        // Switching from like to dislike
        newLikes = Math.max(0, likes - 1);
        newDislikes = dislikes + 1;
        setLikes(newLikes);
        setDislikes(newDislikes);
      } else if (userReaction === 'dislike' && reaction === 'like') {
        // Switching from dislike to like
        newDislikes = Math.max(0, dislikes - 1);
        newLikes = likes + 1;
        setDislikes(newDislikes);
        setLikes(newLikes);
      } else {
        // New reaction
        if (reaction === 'like') {
          newLikes = likes + 1;
          setLikes(newLikes);
        } else {
          newDislikes = dislikes + 1;
          setDislikes(newDislikes);
        }
      }
      setUserReaction(reaction);
    }

    // Store user reaction in localStorage
    try {
      const storedReactions = localStorage.getItem('postReactions') || '{}';
      const reactions = JSON.parse(storedReactions);

      if (userReaction === reaction) {
        // Remove reaction if toggling off
        delete reactions[id];
      } else {
        // Set new reaction
        reactions[id] = reaction;
      }

      localStorage.setItem('postReactions', JSON.stringify(reactions));

      // Update reaction in database
      try {
        const { error } = await supabase
          .from('blog_posts')
          .update({
            likes_count: newLikes,
            dislikes_count: newDislikes
          })
          .eq('id', id);

        if (error) {
          console.error('Error updating post reactions:', error);
        }
      } catch (err) {
        console.error('Error updating post reactions:', err);
      }
    } catch (error) {
      console.error('Error storing reaction:', error);
    }
  };

  const handleCommentSubmit = async (author: string, content: string) => {
    if (!id) {
      console.error('No post ID available');
      return;
    }

    try {
      console.log('Submitting comment for post ID:', id);
      console.log('Comment content:', content);
      console.log('User info:', user);

      // إنشاء كائن التعليق
      const commentData = {
        post_id: id,
        user_id: user?.id || '',
        author_name: user ? user.name || user.email : author,
        author_email: user?.email || '',
        content: content,
        status: 'pending' // التعليقات تكون معلقة حتى يوافق عليها المشرف
      };

      console.log('Comment data being sent:', commentData);

      // إضافة التعليق إلى قاعدة البيانات
      const commentId = await createComment(commentData);
      console.log('Comment created with ID:', commentId);

      if (commentId) {
        // إعادة جلب التعليقات لتحديث القائمة
        await fetchComments(id);
        console.log('Comments refreshed');

        // إظهار إشعار نجاح للمستخدم
        showSuccessNotification(
          language === 'en' ? 'Comment Submitted' : 'تم إرسال التعليق',
          language === 'en'
            ? 'Your comment has been submitted and is awaiting approval.'
            : 'تم إرسال تعليقك وهو في انتظار الموافقة.'
        );
      } else {
        console.error('Failed to create comment - no ID returned');
        showErrorNotification(
          language === 'en' ? 'Submission Failed' : 'فشل الإرسال',
          language === 'en'
            ? 'There was a problem submitting your comment. Please try again.'
            : 'حدثت مشكلة أثناء إرسال تعليقك. يرجى المحاولة مرة أخرى.'
        );
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      showErrorNotification(
        language === 'en' ? 'Error' : 'خطأ',
        language === 'en'
          ? 'There was a problem submitting your comment. Please try again.'
          : 'حدثت مشكلة أثناء إرسال تعليقك. يرجى المحاولة مرة أخرى.'
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 flex items-center justify-center">
        <div >
          <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md" >
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4"   />
          <h2 className="text-2xl font-bold text-red-700 mb-2"  >Error Loading Post</h2>
          <p className="text-gray-600 mb-4"  >{error}</p>
          <div className="flex justify-center space-x-4"  >
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-transform hover:scale-105"
            >
              Try Again
            </button>
            <Link
              to="/blog"
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-transform hover:scale-105"
            >
              Return to Blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 flex items-center justify-center">
        <div className="text-center" >
          <h2 className="text-2xl font-bold mb-2"  >Post not found</h2>
          <p className="mb-4"  >The post you are looking for doesn't exist or has been removed.</p>
          <Link to="/blog" className="text-blue-600 hover:underline transition-transform hover:scale-105 inline-block"  >
            Return to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50" dir={language === 'en' ? 'ltr' : 'rtl'} lang={language}>
      <BlogHeader />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`w-full ${language === 'en' ? 'text-left' : 'text-right'}`}  >
          <Link to="/blog" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-transform hover:translate-x-1">
            <ArrowLeft className={`h-4 w-4 ${language === 'en' ? 'mr-2' : 'ml-2'}`} />
            {language === 'en' ? 'Back to Blog' : 'العودة إلى المدونة'}
          </Link>
        </div>

        <article className="bg-white rounded-xl shadow-md overflow-hidden"  >
          {!imageError && (
            <div className="h-64 sm:h-80 md:h-96 w-full overflow-hidden"  >
              <img
                src={imageUrl}
                alt={post.title[language as keyof typeof post.title]}
                className="w-full h-full object-cover"
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
          )}

          <div className="p-6 sm:p-8">
            <div className={`w-full ${language === 'ar' ? 'text-right' : 'text-left'}`}  >
              <div className={`flex flex-wrap items-center gap-4 mb-4`}>
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                  post.category === 'news' ? 'bg-blue-100 text-blue-800' : 'bg-teal-100 text-teal-800'
                }`}>
                  {post.category === 'news'
                    ? (language === 'en' ? 'NEWS' : 'أخبار')
                    : (language === 'en' ? 'TIP' : 'نصيحة')
                  }
                </span>

                <div className="flex items-center text-gray-500 text-sm">
                  <Calendar className={`h-4 w-4 ${language === 'en' ? 'mr-1' : 'ml-1'}`} />
                  <span>{formatDate(post.publishedDate, language)}</span>
                </div>

                <div className="flex items-center text-gray-500 text-sm">
                  <MessageSquare className={`h-4 w-4 ${language === 'en' ? 'mr-1' : 'ml-1'}`} />
                  <span>
                    {language === 'en'
                      ? `${comments.length} comment${comments.length !== 1 ? 's' : ''}`
                      : `${comments.length} ${comments.length !== 1 ? 'تعليقات' : 'تعليق'}`
                    }
                  </span>
                </div>
              </div>
            </div>

            <div className={`w-full ${language === 'ar' ? 'text-right' : 'text-left'}`}  >
              <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900">
                {post.title[language as keyof typeof post.title]}
              </h1>
            </div>

            {/* Language switcher */}
            <div className={`w-full flex mb-4 ${language === 'ar' ? 'text-right' : 'text-left'}`}  >
              <button
                onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                className={`w-full flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium transition-transform hover:scale-105`}
              >
                <Globe className={`h-4 w-4 ${language === 'en' ? 'mr-1' : 'ml-1'}`} />
                {language === 'en' ? 'العربية' : 'English'}
              </button>
            </div>

            <div
              className={`prose prose-blue max-w-none mb-8 ${language === 'ar' ? 'text-right' : 'text-left'} `}
              dangerouslySetInnerHTML={{ __html: post.content[language as keyof typeof post.content] }}

            />

            {/* Reaction buttons */}
            <div className="border-t border-gray-200 pt-6 mt-8"  >
              <div className={`flex items-center ${language === 'en' ? 'space-x-6' : 'space-x-reverse space-x-6'}`}>
                <button
                  onClick={() => handleReaction('like')}
                  className={`flex items-center ${language === 'en' ? 'space-x-2' : 'space-x-reverse space-x-2'} px-4 py-2 rounded-md transition-all duration-300 ${
                    userReaction === 'like'
                      ? 'bg-blue-100 text-blue-700'
                      : 'hover:bg-gray-100 text-gray-700 hover:scale-105'
                  }`}

                >
                  <ThumbsUp className={`h-5 w-5 ${userReaction === 'like' ? 'fill-blue-500 text-blue-500' : ''}`} />
                  <span>{likes}</span>
                </button>

                <button
                  onClick={() => handleReaction('dislike')}
                  className={`flex items-center ${language === 'en' ? 'space-x-2' : 'space-x-reverse space-x-2'} px-4 py-2 rounded-md transition-all duration-300 ${
                    userReaction === 'dislike'
                      ? 'bg-red-100 text-red-700'
                      : 'hover:bg-gray-100 text-gray-700 hover:scale-105'
                  }`}

                >
                  <ThumbsDown className={`h-5 w-5 ${userReaction === 'dislike' ? 'fill-red-500 text-red-500' : ''}`} />
                  <span>{dislikes}</span>
                </button>
              </div>

              {/* Login prompt */}
              {showLoginPrompt && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-start"  >
                  <div className={`flex items-start w-full ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                    <AlertCircle className={`h-5 w-5 text-yellow-500 ${language === 'en' ? 'mr-2' : 'ml-2'} flex-shrink-0 mt-0.5`} />
                    <div className={`${language === 'ar' ? 'text-right' : ''}`}>
                      <p className="text-sm text-yellow-700">
                        {language === 'en' ? (
                          <>Please <Link to="/login" className="font-medium underline">log in</Link> to like or dislike this post.</>
                        ) : (
                          <>الرجاء <Link to="/login" className="font-medium underline">تسجيل الدخول</Link> لإبداء إعجابك أو عدم إعجابك بهذا المنشور.</>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </article>

        <div className="mt-12"  >
          <div className={`w-full ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <MessageSquare className={`h-5 w-5 ${language === 'en' ? 'mr-2' : 'ml-2'}`} />
              {language === 'en'
                ? `Comments (${comments.length})`
                : `التعليقات (${comments.length})`
              }
            </h2>
          </div>

          {user ? (
            <div  >
              <CommentForm postId={post.id} onCommentSubmit={handleCommentSubmit} />
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8"  >
              <div className={`flex items-start ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                <AlertCircle className={`h-5 w-5 text-blue-500 ${language === 'en' ? 'mr-3' : 'ml-3'} flex-shrink-0 mt-0.5`} />
                <div className={`${language === 'ar' ? 'text-right' : ''}`}>
                  <h3 className="text-lg font-semibold mb-2">
                    {language === 'en' ? 'Join the conversation' : 'انضم إلى المحادثة'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {language === 'en' ? (
                      <>
                        Please <Link to="/login" className="text-blue-600 hover:underline font-medium transition-colors">log in</Link> or{' '}
                        <Link to="/register" className="text-blue-600 hover:underline font-medium transition-colors">register</Link> to leave a comment.
                      </>
                    ) : (
                      <>
                        الرجاء <Link to="/login" className="text-blue-600 hover:underline font-medium transition-colors">تسجيل الدخول</Link> أو{' '}
                        <Link to="/register" className="text-blue-600 hover:underline font-medium transition-colors">التسجيل</Link> لترك تعليق.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {isLoadingComments ? (
            <div className="py-12 bg-white rounded-lg shadow-md text-center"  >
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-500">
                {language === 'en' ? 'Loading comments...' : 'جاري تحميل التعليقات...'}
              </p>
            </div>
          ) : commentsError ? (
            <div className="py-12 bg-white rounded-lg shadow-md text-center"  >
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4"   />
              <p className="text-red-500">
                {language === 'en' ? 'Error loading comments' : 'خطأ في تحميل التعليقات'}
              </p>
            </div>
          ) : comments.length === 0 || comments.filter(comment => comment.status === 'approved' || comment.approved).length === 0 ? (
            <div className={`py-12 bg-white rounded-lg shadow-md ${language === 'ar' ? 'text-right' : 'text-left'}`}  >
              <div className="flex justify-center"  >
                <MessageSquare className="h-12 w-12 text-gray-300 mb-4" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2 text-center"  >
                {language === 'en' ? 'No Comments Yet' : 'لا توجد تعليقات حتى الآن'}
              </h3>
              <p className="text-gray-500 text-center"  >
                {language === 'en' ? 'Be the first to share your thoughts!' : 'كن أول من يشارك أفكاره!'}
              </p>
            </div>
          ) : (
            <div className="space-y-6"  >
              {/* عرض التعليقات المعتمدة فقط */}
              {comments
                .filter(comment => comment.status === 'approved' || comment.approved)
                .map((comment, index) => (
                  <div key={comment.id}>
                    <CommentItem comment={comment} />
                  </div>
                ))
              }
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PostDetailPage;