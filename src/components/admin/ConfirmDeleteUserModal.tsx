import React from 'react';
import { X, Trash2, AlertTriangle, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../utils/dateUtils';

interface ConfirmDeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (userId: string) => Promise<void>;
  user: {
    id: string;
    name?: string;
    email: string;
    status?: string;
    deletion_scheduled_at?: string;
  } | null;
  isPendingDeletion?: boolean;
}

const ConfirmDeleteUserModal: React.FC<ConfirmDeleteUserModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  user,
  isPendingDeletion = false
}) => {
  const { t, i18n } = useTranslation();
  const language = i18n.language || 'en';
  const isRTL = language === 'ar';

  // استخدام نصوص ثابتة إذا كانت مفاتيح الترجمة غير موجودة
  const deleteUserTitle = t('admin.users.deleteUser') === 'admin.users.deleteUser' ?
    (language === 'ar' ? 'حذف المستخدم' : 'Delete User') :
    t('admin.users.deleteUser');

  const cancelDeletionTitle = t('admin.users.cancelDeletion') === 'admin.users.cancelDeletion' ?
    (language === 'ar' ? 'إلغاء الحذف' : 'Cancel Deletion') :
    t('admin.users.cancelDeletion');

  const deleteUserConfirmationTitle = t('admin.users.deleteUserConfirmation') === 'admin.users.deleteUserConfirmation' ?
    (language === 'ar' ? 'هل أنت متأكد من رغبتك في حذف {name}؟' : 'Are you sure you want to delete {name}?') :
    t('admin.users.deleteUserConfirmation');

  const cancelDeletionConfirmationTitle = t('admin.users.cancelDeletionConfirmation') === 'admin.users.cancelDeletionConfirmation' ?
    (language === 'ar' ? 'هل أنت متأكد من رغبتك في إلغاء حذف {name}؟' : 'Are you sure you want to cancel deletion of {name}?') :
    t('admin.users.cancelDeletionConfirmation');

  const scheduledForDeletionTitle = t('admin.users.scheduledForDeletion') === 'admin.users.scheduledForDeletion' ?
    (language === 'ar' ? 'مجدول للحذف في' : 'Scheduled for deletion on') :
    t('admin.users.scheduledForDeletion');

  const deleteWarningTitle = t('admin.users.deleteWarning') === 'admin.users.deleteWarning' ?
    (language === 'ar' ? 'تحذير: سيتم جدولة حذف المستخدم' : 'Warning: User will be scheduled for deletion') :
    t('admin.users.deleteWarning');

  const restoreUserTitle = t('admin.users.restoreUser') === 'admin.users.restoreUser' ?
    (language === 'ar' ? 'استعادة المستخدم' : 'Restore User') :
    t('admin.users.restoreUser');

  const cancelTitle = t('common.cancel') === 'common.cancel' ?
    (language === 'ar' ? 'إلغاء' : 'Cancel') :
    t('common.cancel');

  const loadingTitle = t('common.loading') === 'common.loading' ?
    (language === 'ar' ? 'جاري التحميل...' : 'Loading...') :
    t('common.loading');

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!isOpen || !user) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(user.id);
      onClose();
    } catch (error) {
      console.error('Error deleting user:', error);
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
                  <Trash2 className="h-6 w-6 text-red-600" aria-hidden="true" />
                </div>
                <h3 className={`text-lg leading-6 font-medium text-gray-900 ${isRTL ? 'mr-3' : 'ml-3'}`}>
                  {isPendingDeletion
                    ? cancelDeletionTitle
                    : deleteUserTitle}
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
                {isPendingDeletion ? (
                  <>
                    <p className="text-sm text-gray-500">
                      {cancelDeletionConfirmationTitle.replace('{name}', user.name || user.email)}
                    </p>

                    {user.deletion_scheduled_at && (
                      <div className="mt-4 flex items-center text-sm text-gray-500">
                        <Calendar className="flex-shrink-0 h-4 w-4 text-gray-400" />
                        <span className={`${isRTL ? 'mr-1.5' : 'ml-1.5'}`}>
                          {scheduledForDeletionTitle}: {formatDate(user.deletion_scheduled_at, language)}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-500">
                      {deleteUserConfirmationTitle.replace('{name}', user.name || user.email)}
                    </p>

                    <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <AlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                        </div>
                        <div className={`${isRTL ? 'mr-3' : 'ml-3'}`}>
                          <p className="text-sm text-yellow-700">
                            {deleteWarningTitle}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${
                isPendingDeletion
                  ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                  : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
              } text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm`}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? loadingTitle
                : (isPendingDeletion
                    ? restoreUserTitle
                    : deleteUserTitle)}
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

export default ConfirmDeleteUserModal;
