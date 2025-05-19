import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface CommentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  comment: {
    id: string;
    content: string;
    author_name?: string;
    user_name?: string;
    post_id?: string;
    created_at: string;
    approved?: boolean;
    status?: string;
  } | null;
  postTitle?: string;
}

const CommentDetailsModal: React.FC<CommentDetailsModalProps> = ({
  isOpen,
  onClose,
  comment,
  postTitle
}) => {
  const { t, i18n } = useTranslation();
  const language = i18n.language || 'en';
  const isRTL = language === 'ar';

  if (!isOpen || !comment) return null;

  // تحديد اسم المؤلف
  const authorName = comment.author_name || comment.user_name || 'Anonymous';

  // تحديد حالة التعليق
  const commentStatus = (comment.approved || comment.status === 'approved')
    ? (isRTL ? 'موافق عليه' : 'Approved')
    : (isRTL ? 'معلق' : 'Pending');

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-start">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                {isRTL ? 'تفاصيل التعليق' : 'Comment Details'}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-2 space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">
                  {isRTL ? 'محتوى التعليق' : 'Comment Content'}
                </h4>
                <p className="mt-1 text-sm text-gray-900 p-3 bg-gray-50 rounded-md">
                  {comment.content}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    {isRTL ? 'كاتب التعليق' : 'Comment Author'}
                  </h4>
                  <p className="mt-1 text-sm text-gray-900">{authorName}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    {isRTL ? 'الحالة' : 'Status'}
                  </h4>
                  <p className="mt-1">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      (comment.approved || comment.status === 'approved') ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {commentStatus}
                    </span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    {isRTL ? 'المنشور' : 'Post'}
                  </h4>
                  <p className="mt-1 text-sm text-gray-900">{postTitle || (isRTL ? 'منشور غير معروف' : 'Unknown Post')}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    {isRTL ? 'تاريخ التعليق' : 'Comment Date'}
                  </h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(comment.created_at).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US', {
                      calendar: 'gregory' // Always use Gregorian calendar even for Arabic
                    })}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">
                  {isRTL ? 'معرف التعليق' : 'Comment ID'}
                </h4>
                <p className="mt-1 text-sm text-gray-500 font-mono">{comment.id}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              {isRTL ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CommentDetailsModal;
