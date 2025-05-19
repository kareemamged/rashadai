import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import TextsControl from '../../components/admin/TextsControl';
import { useTranslation } from 'react-i18next';

const TextsPage: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('admin.texts.title')}</h1>
        <p className="text-gray-600 mt-1">{t('admin.texts.description')}</p>
      </div>
      
      <TextsControl />
    </AdminLayout>
  );
};

export default TextsPage;
