import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  type = 'danger'
}) => {
  const { t, i18n } = useTranslation();
  const language = i18n.language || 'en';
  const isRTL = language === 'ar';

  if (!isOpen) return null;

  // تحديد الألوان بناءً على نوع التأكيد
  const getColors = () => {
    switch (type) {
      case 'danger':
        return {
          icon: 'text-red-500',
          button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
          header: 'text-red-700'
        };
      case 'warning':
        return {
          icon: 'text-yellow-500',
          button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
          header: 'text-yellow-700'
        };
      case 'info':
        return {
          icon: 'text-blue-500',
          button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
          header: 'text-blue-700'
        };
      default:
        return {
          icon: 'text-red-500',
          button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
          header: 'text-red-700'
        };
    }
  };

  const colors = getColors();

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
            <div className="sm:flex sm:items-start">
              <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-${type === 'danger' ? 'red' : type === 'warning' ? 'yellow' : 'blue'}-100 sm:mx-0 sm:h-10 sm:w-10`}>
                <AlertTriangle className={`h-6 w-6 ${colors.icon}`} />
              </div>
              <div className={`mt-3 text-center sm:mt-0 sm:${isRTL ? 'mr-4' : 'ml-4'} sm:text-left`}>
                <h3 className={`text-lg leading-6 font-medium ${colors.header}`}>
                  {title || (type === 'danger' ? t('common.confirmation', 'Confirmation') : t('common.attention', 'Attention'))}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {message}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${colors.button} text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm`}
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              {confirmText || t('common.confirm', 'Confirm')}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              {cancelText || t('common.cancel', 'Cancel')}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
