import React from 'react';
import { Comment } from '../store/blogStore';
import { timeAgo } from '../utils/dateFormatter';
import { useTranslation } from 'react-i18next';

interface CommentItemProps {
  comment: Comment;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
  const { i18n } = useTranslation();
  const authorName = comment.author_name || 'Anonymous';
  const initials = authorName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase();

  return (
    <div className={`flex ${i18n.language === 'en' ? 'space-x-4' : 'space-x-reverse space-x-4'} mb-6 animate-fadeIn`} dir={i18n.language === 'en' ? 'ltr' : 'rtl'}>
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
        {initials}
      </div>
      <div className="flex-1">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h4 className={`font-medium text-gray-800 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>{authorName}</h4>
            <span className="text-xs text-gray-500">{timeAgo(comment.created_at, i18n.language)}</span>
          </div>
          <p className={`text-gray-700 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>{comment.content}</p>
        </div>
      </div>
    </div>
  );
};

export default CommentItem;