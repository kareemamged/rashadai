import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '../../store/languageStore';
import { useAdminStore } from '../../store/adminStore';
import { useAdminAuthStore } from '../../store/adminAuthStore';
import {
  Settings as SettingsIcon,
  Globe,
  Mail,
  Phone,
  Clock,
  Calendar,
  Shield,
  AlertTriangle,
  Save,
  Search,
  Share2,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { checkAdminPermissions } from '../../lib/sessionManager';

const WebsiteSettings: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const { systemSettings, updateSystemSettings, fetchSystemSettings } = useAdminStore();
  const { adminUser } = useAdminAuthStore();
  const [isRTL, setIsRTL] = useState(language === 'ar');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Form state
  const [formValues, setFormValues] = useState({
    siteName: systemSettings.siteName,
    siteDescription: systemSettings.siteDescription,
    contactEmail: systemSettings.contactEmail,
    supportPhone: systemSettings.supportPhone,
    timezone: systemSettings.timezone,
    dateFormat: systemSettings.dateFormat,
    timeFormat: systemSettings.timeFormat,
    seo: {
      metaTitle: systemSettings.seo?.metaTitle || '',
      metaDescription: systemSettings.seo?.metaDescription || '',
      metaKeywords: systemSettings.seo?.metaKeywords || '',
      ogTitle: systemSettings.seo?.ogTitle || '',
      ogDescription: systemSettings.seo?.ogDescription || '',
      ogImage: systemSettings.seo?.ogImage || '',
      twitterCard: systemSettings.seo?.twitterCard || '',
      twitterTitle: systemSettings.seo?.twitterTitle || '',
      twitterDescription: systemSettings.seo?.twitterDescription || '',
      twitterImage: systemSettings.seo?.twitterImage || '',
      googleVerification: systemSettings.seo?.googleVerification || '',
      bingVerification: systemSettings.seo?.bingVerification || '',
      analyticsId: systemSettings.seo?.analyticsId || '',
    },
    socialMedia: {
      facebook: systemSettings.socialMedia?.facebook || '',
      twitter: systemSettings.socialMedia?.twitter || '',
      instagram: systemSettings.socialMedia?.instagram || '',
      linkedin: systemSettings.socialMedia?.linkedin || '',
      youtube: systemSettings.socialMedia?.youtube || '',
    },
    contactInfo: {
      email: systemSettings.contactInfo?.email || '',
      phone: systemSettings.contactInfo?.phone || '',
      address: systemSettings.contactInfo?.address || '',
      supportHours: systemSettings.contactInfo?.supportHours || '',
    },
    security: {
      enableTwoFactor: systemSettings.security.enableTwoFactor,
      passwordPolicy: {
        minLength: systemSettings.security.passwordPolicy.minLength,
        requireSpecialChars: systemSettings.security.passwordPolicy.requireSpecialChars,
        requireNumbers: systemSettings.security.passwordPolicy.requireNumbers,
        requireUppercase: systemSettings.security.passwordPolicy.requireUppercase,
      },
      maxLoginAttempts: systemSettings.security.maxLoginAttempts,
    },
    maintenance: {
      enabled: systemSettings.maintenance.enabled,
      message: systemSettings.maintenance.message,
    },
  });

  // Update RTL state when language changes
  useEffect(() => {
    setIsRTL(language === 'ar');
  }, [language]);

  // Fetch settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        await fetchSystemSettings();
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();
  }, []);

  // Update form values when systemSettings changes
  useEffect(() => {
    setFormValues({
      siteName: systemSettings.siteName,
      siteDescription: systemSettings.siteDescription,
      contactEmail: systemSettings.contactEmail,
      supportPhone: systemSettings.supportPhone,
      timezone: systemSettings.timezone,
      dateFormat: systemSettings.dateFormat,
      timeFormat: systemSettings.timeFormat,
      seo: {
        metaTitle: systemSettings.seo?.metaTitle || '',
        metaDescription: systemSettings.seo?.metaDescription || '',
        metaKeywords: systemSettings.seo?.metaKeywords || '',
        ogTitle: systemSettings.seo?.ogTitle || '',
        ogDescription: systemSettings.seo?.ogDescription || '',
        ogImage: systemSettings.seo?.ogImage || '',
        twitterCard: systemSettings.seo?.twitterCard || '',
        twitterTitle: systemSettings.seo?.twitterTitle || '',
        twitterDescription: systemSettings.seo?.twitterDescription || '',
        twitterImage: systemSettings.seo?.twitterImage || '',
        googleVerification: systemSettings.seo?.googleVerification || '',
        bingVerification: systemSettings.seo?.bingVerification || '',
        analyticsId: systemSettings.seo?.analyticsId || '',
      },
      socialMedia: {
        facebook: systemSettings.socialMedia?.facebook || '',
        twitter: systemSettings.socialMedia?.twitter || '',
        instagram: systemSettings.socialMedia?.instagram || '',
        linkedin: systemSettings.socialMedia?.linkedin || '',
        youtube: systemSettings.socialMedia?.youtube || '',
      },
      contactInfo: {
        email: systemSettings.contactInfo?.email || '',
        phone: systemSettings.contactInfo?.phone || '',
        address: systemSettings.contactInfo?.address || '',
        supportHours: systemSettings.contactInfo?.supportHours || '',
      },
      security: {
        enableTwoFactor: systemSettings.security.enableTwoFactor,
        passwordPolicy: {
          minLength: systemSettings.security.passwordPolicy.minLength,
          requireSpecialChars: systemSettings.security.passwordPolicy.requireSpecialChars,
          requireNumbers: systemSettings.security.passwordPolicy.requireNumbers,
          requireUppercase: systemSettings.security.passwordPolicy.requireUppercase,
        },
        maxLoginAttempts: systemSettings.security.maxLoginAttempts,
      },
      maintenance: {
        enabled: systemSettings.maintenance.enabled,
        message: systemSettings.maintenance.message,
      },
    });
  }, [systemSettings]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Handle nested properties
    if (name.includes('.')) {
      const [section, property] = name.split('.');
      setFormValues({
        ...formValues,
        [section]: {
          ...formValues[section as keyof typeof formValues],
          [property]: value,
        },
      });
    } else {
      setFormValues({
        ...formValues,
        [name]: value,
      });
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;

    // Handle nested properties
    if (name.includes('.')) {
      const parts = name.split('.');
      if (parts.length === 2) {
        const [section, property] = parts;
        setFormValues({
          ...formValues,
          [section]: {
            ...formValues[section as keyof typeof formValues],
            [property]: checked,
          },
        });
      } else if (parts.length === 3) {
        const [section, subsection, property] = parts;
        setFormValues({
          ...formValues,
          [section]: {
            ...formValues[section as keyof typeof formValues],
            [subsection]: {
              ...formValues[section as keyof typeof formValues][subsection as any],
              [property]: checked,
            },
          },
        });
      }
    } else {
      setFormValues({
        ...formValues,
        [name]: checked,
      });
    }
  };

  // Handle number input changes
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value, 10);

    // Handle nested properties
    if (name.includes('.')) {
      const parts = name.split('.');
      if (parts.length === 2) {
        const [section, property] = parts;
        setFormValues({
          ...formValues,
          [section]: {
            ...formValues[section as keyof typeof formValues],
            [property]: numValue,
          },
        });
      } else if (parts.length === 3) {
        const [section, subsection, property] = parts;
        setFormValues({
          ...formValues,
          [section]: {
            ...formValues[section as keyof typeof formValues],
            [subsection]: {
              ...formValues[section as keyof typeof formValues][subsection as any],
              [property]: numValue,
            },
          },
        });
      }
    } else {
      setFormValues({
        ...formValues,
        [name]: numValue,
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      // Update settings using the store function
      await updateSystemSettings(formValues);

      // Show success message
      setSuccessMessage(t('admin.settings.settingsSaved'));
      setTimeout(() => setSuccessMessage(''), 3000);

      // Refresh settings from database
      await fetchSystemSettings();
    } catch (error: any) {
      console.error('Error saving settings:', error);
      setErrorMessage(error.message || t('admin.settings.unknownError', 'An unknown error occurred.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t('admin.settings.title', 'Website Settings')}</h1>

      {successMessage && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
          <div>{errorMessage}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* General Settings */}
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <SettingsIcon className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} text-gray-500`} />
            {t('admin.settings.generalSettings')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.settings.siteName')}
              </label>
              <input
                type="text"
                name="siteName"
                value={formValues.siteName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.settings.siteDescription')}
              </label>
              <input
                type="text"
                name="siteDescription"
                value={formValues.siteDescription}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.settings.contactEmail')}
              </label>
              <input
                type="email"
                name="contactEmail"
                value={formValues.contactEmail}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.settings.supportPhone')}
              </label>
              <input
                type="text"
                name="supportPhone"
                value={formValues.supportPhone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* SEO Settings */}
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Search className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} text-gray-500`} />
            {t('admin.settings.seoSettings', 'SEO Settings')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.settings.metaTitle', 'Meta Title')}
              </label>
              <input
                type="text"
                name="seo.metaTitle"
                value={formValues.seo.metaTitle}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <p className="mt-1 text-xs text-gray-500">
                {t('admin.settings.metaTitleHelp', 'The title that appears in search engine results (50-60 characters recommended)')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.settings.metaDescription', 'Meta Description')}
              </label>
              <textarea
                name="seo.metaDescription"
                value={formValues.seo.metaDescription}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
              ></textarea>
              <p className="mt-1 text-xs text-gray-500">
                {t('admin.settings.metaDescriptionHelp', 'The description that appears in search engine results (150-160 characters recommended)')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.settings.metaKeywords', 'Meta Keywords')}
              </label>
              <input
                type="text"
                name="seo.metaKeywords"
                value={formValues.seo.metaKeywords}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <p className="mt-1 text-xs text-gray-500">
                {t('admin.settings.metaKeywordsHelp', 'Comma-separated keywords related to your website')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.settings.analyticsId', 'Google Analytics ID')}
              </label>
              <input
                type="text"
                name="seo.analyticsId"
                value={formValues.seo.analyticsId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="G-XXXXXXXXXX"
              />
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-md font-medium mb-3">
              {t('admin.settings.socialMediaPreview', 'Social Media Preview')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.settings.ogTitle', 'Open Graph Title')}
                </label>
                <input
                  type="text"
                  name="seo.ogTitle"
                  value={formValues.seo.ogTitle}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {t('admin.settings.ogTitleHelp', 'Title that appears when shared on Facebook, LinkedIn, etc.')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.settings.ogDescription', 'Open Graph Description')}
                </label>
                <textarea
                  name="seo.ogDescription"
                  value={formValues.seo.ogDescription}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.settings.ogImage', 'Open Graph Image URL')}
                </label>
                <input
                  type="text"
                  name="seo.ogImage"
                  value={formValues.seo.ogImage}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.settings.twitterCard', 'Twitter Card Type')}
                </label>
                <select
                  name="seo.twitterCard"
                  value={formValues.seo.twitterCard}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="summary">Summary</option>
                  <option value="summary_large_image">Summary with Large Image</option>
                  <option value="app">App</option>
                  <option value="player">Player</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Settings */}
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Share2 className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} text-gray-500`} />
            {t('admin.settings.socialMediaSettings', 'Social Media Settings')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Facebook className="h-4 w-4 mr-1 text-blue-600" />
                {t('admin.settings.facebookUrl', 'Facebook URL')}
              </label>
              <input
                type="text"
                name="socialMedia.facebook"
                value={formValues.socialMedia.facebook}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="https://facebook.com/yourpage"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Twitter className="h-4 w-4 mr-1 text-blue-400" />
                {t('admin.settings.twitterUrl', 'Twitter URL')}
              </label>
              <input
                type="text"
                name="socialMedia.twitter"
                value={formValues.socialMedia.twitter}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="https://twitter.com/yourhandle"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Instagram className="h-4 w-4 mr-1 text-pink-500" />
                {t('admin.settings.instagramUrl', 'Instagram URL')}
              </label>
              <input
                type="text"
                name="socialMedia.instagram"
                value={formValues.socialMedia.instagram}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="https://instagram.com/yourhandle"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Linkedin className="h-4 w-4 mr-1 text-blue-700" />
                {t('admin.settings.linkedinUrl', 'LinkedIn URL')}
              </label>
              <input
                type="text"
                name="socialMedia.linkedin"
                value={formValues.socialMedia.linkedin}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="https://linkedin.com/company/yourcompany"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Youtube className="h-4 w-4 mr-1 text-red-600" />
                {t('admin.settings.youtubeUrl', 'YouTube URL')}
              </label>
              <input
                type="text"
                name="socialMedia.youtube"
                value={formValues.socialMedia.youtube}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="https://youtube.com/c/yourchannel"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Phone className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} text-gray-500`} />
            {t('admin.settings.contactInformation', 'Contact Information')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.settings.contactEmail', 'Contact Email')}
              </label>
              <input
                type="email"
                name="contactInfo.email"
                value={formValues.contactInfo.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <p className="mt-1 text-xs text-gray-500">
                {t('admin.settings.contactEmailHelp', 'Email displayed on the contact page')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.settings.contactPhone', 'Contact Phone')}
              </label>
              <input
                type="text"
                name="contactInfo.phone"
                value={formValues.contactInfo.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <p className="mt-1 text-xs text-gray-500">
                {t('admin.settings.contactPhoneHelp', 'Phone number displayed on the contact page')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.settings.contactAddress', 'Address')}
              </label>
              <textarea
                name="contactInfo.address"
                value={formValues.contactInfo.address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.settings.supportHours', 'Support Hours')}
              </label>
              <input
                type="text"
                name="contactInfo.supportHours"
                value={formValues.contactInfo.supportHours}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="24/7 Chat Support"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="p-6 bg-gray-50 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Save className="h-5 w-5 mr-2" />
            {isLoading ? t('common.loading') : t('common.save')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WebsiteSettings;
