import React, { useState } from 'react';
import { X, UserX, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface BlockUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBlock: (userId: string, blockType: 'permanent' | 'temporary', duration?: number) => Promise<boolean>;
  user: {
    id: string;
    name?: string;
    email: string;
  } | null;
}

const BlockUserModal: React.FC<BlockUserModalProps> = ({
  isOpen,
  onClose,
  onBlock,
  user
}) => {
  const { t, i18n } = useTranslation();
  const language = i18n.language || 'en';
  const isRTL = language === 'ar';

  // استخدام نصوص ثابتة إذا كانت مفاتيح الترجمة غير موجودة
  const blockUserTitle = t('admin.users.blockUser') === 'admin.users.blockUser' ?
    (language === 'ar' ? 'حظر المستخدم' : 'Block User') :
    t('admin.users.blockUser');

  const blockUserConfirmationTitle = t('admin.users.blockUserConfirmation') === 'admin.users.blockUserConfirmation' ?
    (language === 'ar' ? 'هل أنت متأكد من رغبتك في حظر {name}؟' : 'Are you sure you want to block {name}?') :
    t('admin.users.blockUserConfirmation');

  const blockPermanentTitle = t('admin.users.blockPermanent') === 'admin.users.blockPermanent' ?
    (language === 'ar' ? 'حظر دائم' : 'Block Permanently') :
    t('admin.users.blockPermanent');

  const blockTemporaryTitle = t('admin.users.blockTemporary') === 'admin.users.blockTemporary' ?
    (language === 'ar' ? 'حظر مؤقت' : 'Block Temporarily') :
    t('admin.users.blockTemporary');

  const blockDurationTitle = t('admin.users.blockDuration') === 'admin.users.blockDuration' ?
    (language === 'ar' ? 'مدة الحظر' : 'Block Duration') :
    t('admin.users.blockDuration');

  const daysTitle = t('admin.users.days') === 'admin.users.days' ?
    (language === 'ar' ? 'أيام' : 'Days') :
    t('admin.users.days');

  const blockWarningTitle = t('admin.users.blockWarning') === 'admin.users.blockWarning' ?
    (language === 'ar' ? 'تحذير: سيتم منع المستخدم من الوصول إلى النظام' : 'Warning: User will be prevented from accessing the system') :
    t('admin.users.blockWarning');

  const cancelTitle = t('common.cancel') === 'common.cancel' ?
    (language === 'ar' ? 'إلغاء' : 'Cancel') :
    t('common.cancel');

  const loadingTitle = t('common.loading') === 'common.loading' ?
    (language === 'ar' ? 'جاري التحميل...' : 'Loading...') :
    t('common.loading');

  const [blockType, setBlockType] = useState<'permanent' | 'temporary'>('permanent');
  const [duration, setDuration] = useState<number>(7); // Default 7 days
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !user) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onBlock(user.id, blockType, blockType === 'temporary' ? duration : undefined);
      onClose();
    } catch (error) {
      console.error('Error blocking user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

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
              <div className="flex items-center">
                <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <UserX className="h-6 w-6 text-red-600" aria-hidden="true" />
                </div>
                <h3 className={`text-lg leading-6 font-medium text-gray-900 ${isRTL ? 'mr-3' : 'ml-3'}`}>
                  {blockUserTitle}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-3 text-center sm:mt-0 sm:text-left">
              <div className="mt-4">
                <p className="text-sm text-gray-500">
                  {blockUserConfirmationTitle.replace('{name}', user.name || user.email)}
                </p>

                <div className="mt-6">
                  <div className="flex items-center mb-4">
                    <input
                      id="block-permanent"
                      name="block-type"
                      type="radio"
                      checked={blockType === 'permanent'}
                      onChange={() => setBlockType('permanent')}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor="block-permanent" className={`${isRTL ? 'mr-2' : 'ml-2'} block text-sm font-medium text-gray-700`}>
                      {blockPermanentTitle}
                    </label>
                  </div>
                  <div className="flex items-center mb-4">
                    <input
                      id="block-temporary"
                      name="block-type"
                      type="radio"
                      checked={blockType === 'temporary'}
                      onChange={() => setBlockType('temporary')}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor="block-temporary" className={`${isRTL ? 'mr-2' : 'ml-2'} block text-sm font-medium text-gray-700`}>
                      {blockTemporaryTitle}
                    </label>
                  </div>

                  {blockType === 'temporary' && (
                    <div className="mt-4">
                      <label htmlFor="block-duration" className="block text-sm font-medium text-gray-700">
                        {blockDurationTitle}
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <input
                          type="number"
                          name="block-duration"
                          id="block-duration"
                          min="1"
                          max="365"
                          value={duration}
                          onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                          className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
                        />
                        <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                          {daysTitle}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                      </div>
                      <div className={`${isRTL ? 'mr-3' : 'ml-3'}`}>
                        <p className="text-sm text-yellow-700">
                          {blockWarningTitle}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? loadingTitle : blockUserTitle}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {cancelTitle}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BlockUserModal;
