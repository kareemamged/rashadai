import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPostById } from '../data/posts';
import { getCommentsByPostId, addComment } from '../data/comments';
import { Comment } from '../types';
import { formatDate } from '../utils/dateFormatter';
import BlogHeader from '../components/BlogHeader';
import Footer from '../components/Footer';
import CommentItem from '../components/CommentItem';
import CommentForm from '../components/CommentForm';
import { ArrowLeft, Calendar, MessageSquare, ThumbsUp, ThumbsDown, AlertCircle, Globe } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from 'react-i18next';

const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  console.log("ID from URL:", id);
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState<'en' | 'ar'>(i18n.language === 'ar' ? 'ar' : 'en');

  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Update language when i18n.language changes
  useEffect(() => {
    setLanguage(i18n.language === 'ar' ? 'ar' : 'en');
  }, [i18n.language]);

  useEffect(() => {
    if (!id) {
      navigate('/blog');
      return;
    }

    // Simulate data loading
    setIsLoading(true);

    setTimeout(() => {
      const post = getPostById(id);
      if (!post) {
        navigate('/blog');
        return;
      }

      const postComments = getCommentsByPostId(id);
      setComments(postComments);

      // Initialize likes and dislikes (in a real app, this would come from the database)
      // For now, we'll generate random numbers
      const initialLikes = Math.floor(Math.random() * 50) + 5;
      const initialDislikes = Math.floor(Math.random() * 10) + 1;
      setLikes(initialLikes);
      setDislikes(initialDislikes);

      // Check if user has already reacted (in a real app, this would be stored in the database)
      // For now, we'll check localStorage
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

      setIsLoading(false);

      // Scroll to top
      window.scrollTo(0, 0);
    }, 300);
  }, [id, navigate, user]);

  const post = id ? getPostById(id) : null;
  console.log("Found post:", post);

  const handleReaction = (reaction: 'like' | 'dislike') => {
    if (!user) {
      setShowLoginPrompt(true);
      setTimeout(() => setShowLoginPrompt(false), 3000);
      return;
    }

    if (!id) return;

    // Update state based on current reaction
    if (userReaction === reaction) {
      // User is toggling off their reaction
      setUserReaction(null);
      if (reaction === 'like') {
        setLikes(prev => Math.max(0, prev - 1));
      } else {
        setDislikes(prev => Math.max(0, prev - 1));
      }
    } else {
      // User is changing their reaction or adding a new one
      if (userReaction === 'like' && reaction === 'dislike') {
        // Switching from like to dislike
        setLikes(prev => Math.max(0, prev - 1));
        setDislikes(prev => prev + 1);
      } else if (userReaction === 'dislike' && reaction === 'like') {
        // Switching from dislike to like
        setDislikes(prev => Math.max(0, prev - 1));
        setLikes(prev => prev + 1);
      } else {
        // New reaction
        if (reaction === 'like') {
          setLikes(prev => prev + 1);
        } else {
          setDislikes(prev => prev + 1);
        }
      }
      setUserReaction(reaction);
    }

    // Store user reaction in localStorage (in a real app, this would be sent to the server)
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
    } catch (error) {
      console.error('Error storing reaction:', error);
    }
  };

  const handleCommentSubmit = (author: string, content: string) => {
    if (!id) return;

    const newComment = addComment(id, user ? user.name || user.email : author, content);
    setComments(prev => [newComment, ...prev]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Post not found</h2>
          <p className="mb-4">The post you are looking for doesn't exist or has been removed.</p>
          <Link to="/blog" className="text-blue-600 hover:underline">
            Return to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir={language === 'en' ? 'ltr' : 'rtl'} lang={language}>
      <BlogHeader />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`w-full ${language === 'en' ? 'text-left' : 'text-right'}`}>
          <Link to="/blog" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
            <ArrowLeft className={`h-4 w-4 ${language === 'en' ? 'mr-2' : 'ml-2'}`} />
            {language === 'en' ? 'Back to Blog' : 'العودة إلى المدونة'}
          </Link>
        </div>

        <article className="bg-white rounded-xl shadow-md overflow-hidden">
          {post.imageUrl && (
            <div className="h-64 sm:h-80 md:h-96 w-full overflow-hidden">
              <img
                src={post.imageUrl}
                alt={post.title[language as keyof typeof post.title]}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6 sm:p-8">
            <div className={`w-full ${language === 'ar' ? 'text-right' : 'text-left'}`}>
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

            <div className={`w-full ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900">
                {post.title[language as keyof typeof post.title]}
              </h1>
            </div>

            {/* Language switcher */}
            <div className={`w-full flex mb-4 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              <button
                onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                className={`w-full flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium`}
              >
                <Globe className={`h-4 w-4 ${language === 'en' ? 'mr-1' : 'ml-1'}`} />
                {language === 'en' ? 'العربية' : 'English'}
              </button>
            </div>

            <div className={`w-full`}>
              <div className={`w-full flex items-center mb-8 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                {post.author.avatarUrl ? (
                  <img
                    src={post.author.avatarUrl}
                    alt={post.author.name}
                    className={`w-10 h-10 rounded-full ${language === 'en' ? 'mr-3' : 'ml-3'} object-cover`}
                  />
                ) : (
                  <div className={`w-10 h-10 rounded-full bg-gray-200 ${language === 'en' ? 'mr-3' : 'ml-3'} flex items-center justify-center`}>
                    {post.author.name.charAt(0)}
                  </div>
                )}
                <span className="font-medium text-gray-800">{post.author.name}</span>
              </div>
            </div>

            <div
              className={`prose prose-blue max-w-none mb-8 ${language === 'ar' ? 'text-right' : 'text-left'} `}
              dangerouslySetInnerHTML={{ __html: post.content[language as keyof typeof post.content] }}
            />

            {/* Reaction buttons */}
            <div className="border-t border-gray-200 pt-6 mt-8">
              <div className={`flex items-center ${language === 'en' ? 'space-x-6' : 'space-x-reverse space-x-6'}`}>
                <button
                  onClick={() => handleReaction('like')}
                  className={`flex items-center ${language === 'en' ? 'space-x-2' : 'space-x-reverse space-x-2'} px-4 py-2 rounded-md transition-colors ${
                    userReaction === 'like'
                      ? 'bg-blue-100 text-blue-700'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <ThumbsUp className={`h-5 w-5 ${userReaction === 'like' ? 'fill-blue-500 text-blue-500' : ''}`} />
                  <span>{likes}</span>
                </button>

                <button
                  onClick={() => handleReaction('dislike')}
                  className={`flex items-center ${language === 'en' ? 'space-x-2' : 'space-x-reverse space-x-2'} px-4 py-2 rounded-md transition-colors ${
                    userReaction === 'dislike'
                      ? 'bg-red-100 text-red-700'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <ThumbsDown className={`h-5 w-5 ${userReaction === 'dislike' ? 'fill-red-500 text-red-500' : ''}`} />
                  <span>{dislikes}</span>
                </button>
              </div>

              {/* Login prompt */}
              {showLoginPrompt && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-start">
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

        <div className="mt-12">
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
            <CommentForm postId={post.id} onCommentSubmit={handleCommentSubmit} />
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className={`flex items-start ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                <AlertCircle className={`h-5 w-5 text-blue-500 ${language === 'en' ? 'mr-3' : 'ml-3'} flex-shrink-0 mt-0.5`} />
                <div className={`${language === 'ar' ? 'text-right' : ''}`}>
                  <h3 className="text-lg font-semibold mb-2">
                    {language === 'en' ? 'Join the conversation' : 'انضم إلى المحادثة'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {language === 'en' ? (
                      <>
                        Please <Link to="/login" className="text-blue-600 hover:underline font-medium">log in</Link> or{' '}
                        <Link to="/register" className="text-blue-600 hover:underline font-medium">register</Link> to leave a comment.
                      </>
                    ) : (
                      <>
                        الرجاء <Link to="/login" className="text-blue-600 hover:underline font-medium">تسجيل الدخول</Link> أو{' '}
                        <Link to="/register" className="text-blue-600 hover:underline font-medium">التسجيل</Link> لترك تعليق.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {comments.length === 0 ? (
            <div className={`py-12 bg-white rounded-lg shadow-md ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              <div className="flex justify-center">
                <MessageSquare className="h-12 w-12 text-gray-300 mb-4" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2 text-center">
                {language === 'en' ? 'No Comments Yet' : 'لا توجد تعليقات حتى الآن'}
              </h3>
              <p className="text-gray-500 text-center">
                {language === 'en' ? 'Be the first to share your thoughts!' : 'كن أول من يشارك أفكاره!'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {comments.map(comment => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PostDetailPage;