import React, { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import SiteImagesControl from '../../components/admin/SiteImagesControl';
import ImagesControl from '../../components/admin/ImagesControl';
import { useTranslation } from 'react-i18next';

const ImagesPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('site-images');

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('admin.images.title')}</h1>
        <p className="text-gray-600 mt-1">{t('admin.images.description')}</p>
      </div>

      <div className="w-full">
        <div className="mb-6 inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500">
          <button
            onClick={() => setActiveTab('site-images')}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 ${
              activeTab === 'site-images'
                ? 'bg-white text-gray-950 shadow-sm'
                : 'hover:bg-gray-50'
            }`}
          >
            {t('admin.images.siteImages')}
          </button>
          <button
            onClick={() => setActiveTab('all-images')}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 ${
              activeTab === 'all-images'
                ? 'bg-white text-gray-950 shadow-sm'
                : 'hover:bg-gray-50'
            }`}
          >
            {t('admin.images.allImages')}
          </button>
        </div>

        <div className="mt-2">
          {activeTab === 'site-images' && <SiteImagesControl />}
          {activeTab === 'all-images' && <ImagesControl />}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ImagesPage;
