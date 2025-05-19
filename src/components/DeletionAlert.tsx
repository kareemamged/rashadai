import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Loader } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

interface DeletionInfo {
  scheduled: boolean;
  days_remaining: number;
  deletion_date: Date;
}

const DeletionAlert: React.FC = () => {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // التحقق من وجود معلومات الحذف
  const deletionInfo = user?.deletion_info as DeletionInfo | undefined;

  if (!deletionInfo || !deletionInfo.scheduled) {
    return null;
  }

  // تنسيق تاريخ الحذف
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = new Date(deletionInfo.deletion_date).toLocaleDateString(
    undefined,
    options as Intl.DateTimeFormatOptions
  );

  // إلغاء حذف الحساب
  const handleCancelDeletion = async () => {
    if (!user) return;

    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      // استدعاء وظيفة إلغاء حذف الحساب
      const { data, error } = await supabase
        .rpc('cancel_account_deletion', { user_id: user.id });

      if (error) {
        throw error;
      }

      if (data) {
        setSuccessMessage(t('account.deletionCancelled'));
        // تحديث بيانات المستخدم
        await refreshUser();
      } else {
        setErrorMessage('No changes were made');
      }
    } catch (error) {
      console.error('Error cancelling account deletion:', error);
      setErrorMessage(t('account.deletionCancelError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-red-500" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            {t('account.deletionScheduled')}
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>
              {t('account.deletionWarning', {
                days: deletionInfo.days_remaining,
                date: formattedDate
              })}
            </p>
          </div>

          {successMessage && (
            <div className="mt-2 text-sm text-green-600">
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="mt-2 text-sm text-red-600">
              {errorMessage}
            </div>
          )}

          <div className="mt-4">
            <div className="-mx-2 -my-1.5 flex">
              <button
                type="button"
                onClick={handleCancelDeletion}
                disabled={isLoading}
                className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50 disabled:opacity-50 mr-2"
              >
                {isLoading ? (
                  <>
                    <Loader className="inline-block h-4 w-4 animate-spin mr-1" />
                    {t('common.loading')}
                  </>
                ) : (
                  t('account.cancelDeletion', 'Cancel Deletion')
                )}
              </button>

              <button
                type="button"
                className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
              >
                {t('account.contactSupport')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeletionAlert;
