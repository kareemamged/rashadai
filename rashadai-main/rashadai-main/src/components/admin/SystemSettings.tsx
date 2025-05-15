import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '../../store/languageStore';
import { useAdminStore } from '../../store/adminStore';
import { 
  Settings as SettingsIcon, 
  Globe, 
  Mail, 
  Phone, 
  Clock, 
  Calendar, 
  Shield, 
  AlertTriangle, 
  Save
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const SystemSettings: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const { systemSettings, updateSystemSettings } = useAdminStore();
  const [isRTL, setIsRTL] = useState(language === 'ar');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Form state
  const [formValues, setFormValues] = useState({
    siteName: systemSettings.siteName,
    siteDescription: systemSettings.siteDescription,
    contactEmail: systemSettings.contactEmail,
    supportPhone: systemSettings.supportPhone,
    timezone: systemSettings.timezone,
    dateFormat: systemSettings.dateFormat,
    timeFormat: systemSettings.timeFormat,
    security: {
      enableTwoFactor: systemSettings.security.enableTwoFactor,
      sessionTimeout: systemSettings.security.sessionTimeout,
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
      security: {
        enableTwoFactor: systemSettings.security.enableTwoFactor,
        sessionTimeout: systemSettings.security.sessionTimeout,
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
    
    try {
      // Check if site_settings table exists
      const { error: checkError } = await supabase
        .from('site_settings')
        .select('id')
        .limit(1);
      
      if (checkError && checkError.message.includes('does not exist')) {
        console.warn('site_settings table does not exist');
        // Just update local state
        await updateSystemSettings(formValues);
        setSuccessMessage(t('admin.settings.settingsSaved'));
        setTimeout(() => setSuccessMessage(''), 3000);
        return;
      }
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('You must be logged in to perform this action.');
        setIsLoading(false);
        return;
      }
      
      // Update settings in database
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          id: 1, // Use a fixed ID for the single settings record
          site_name: formValues.siteName,
          site_description: formValues.siteDescription,
          contact_email: formValues.contactEmail,
          contact_phone: formValues.supportPhone,
          theme_settings: {
            timezone: formValues.timezone,
            dateFormat: formValues.dateFormat,
            timeFormat: formValues.timeFormat,
            security: formValues.security,
            maintenance: formValues.maintenance,
          },
          updated_at: new Date().toISOString(),
          updated_by: user.id,
        });
      
      if (error) {
        console.error('Error saving settings:', error);
        throw error;
      }
      
      // Update local state
      await updateSystemSettings(formValues);
      
      setSuccessMessage(t('admin.settings.settingsSaved'));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t('admin.settings.title')}</h1>
      
      {successMessage && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md">
          {successMessage}
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

export default SystemSettings;
