import React, { useState } from 'react';
import { Send, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from 'react-i18next';

interface CommentFormProps {
  postId: string;
  onCommentSubmit: (author: string, content: string) => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ postId, onCommentSubmit }) => {
  const { user } = useAuthStore();
  const { t, i18n } = useTranslation();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const language = i18n.language || 'en';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;

    setIsSubmitting(true);

    try {
      // Get user name or email for the comment
      const authorName = user?.name || user?.email || 'Anonymous';

      // Call the callback directly
      await onCommentSubmit(authorName, content);
      setContent('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8" dir={language === 'en' ? 'ltr' : 'rtl'}>
      <h3 className={`text-xl font-semibold mb-4 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
        {language === 'en' ? 'Leave a Comment' : 'اترك تعليقًا'}
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className={`block text-sm font-medium text-gray-700 mb-1 ${language === 'ar' ? 'text-right' : ''}`}>
            {language === 'en' ? 'Commenting as' : 'التعليق باسم'}
          </label>
          <div className="flex items-center p-3 bg-gray-50 rounded-md">
            <div className={`h-8 w-8 rounded-full overflow-hidden border-2 border-gray-200 ${language === 'en' ? 'mr-3' : 'ml-3'}`}>
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name || 'User profile'}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-blue-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
              )}
            </div>
            <span className={`font-medium text-gray-800 ${language === 'ar' ? 'text-right' : ''}`}>
              {user?.name || user?.email?.split('@')[0] || (language === 'en' ? 'Anonymous' : 'مجهول')}
            </span>
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="content" className={`block text-sm font-medium text-gray-700 mb-1 ${language === 'ar' ? 'text-right' : ''}`}>
            {language === 'en' ? 'Your Comment' : 'تعليقك'}
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${language === 'ar' ? 'text-right' : ''}`}
            rows={4}
            required
            disabled={isSubmitting}
            placeholder={language === 'en' ? 'Write your comment here...' : 'اكتب تعليقك هنا...'}
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <svg className={`animate-spin ${language === 'en' ? '-ml-1 mr-2' : '-mr-1 ml-2'} h-4 w-4 text-white`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {language === 'en' ? 'Submitting...' : 'جاري الإرسال...'}
            </>
          ) : (
            <>
              {language === 'en' ? 'Submit' : 'إرسال'} <Send className={`${language === 'en' ? 'ml-2' : 'mr-2'} h-4 w-4`} />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default CommentForm;