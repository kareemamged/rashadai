import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '../../store/languageStore';
import { useAdminStore } from '../../store/adminStore';
import { 
  Palette, 
  Type, 
  Layout as LayoutIcon, 
  Save, 
  RotateCcw, 
  Upload, 
  Download, 
  Eye, 
  Check
} from 'lucide-react';

const DesignControl: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const { designSettings, updateDesignSettings } = useAdminStore();
  const [isRTL, setIsRTL] = useState(language === 'ar');
  const [activeTab, setActiveTab] = useState<'colors' | 'fonts' | 'layout'>('colors');
  const [previewMode, setPreviewMode] = useState(false);
  
  // Local state for form values
  const [formValues, setFormValues] = useState({
    colors: {
      primary: designSettings.colors.primary,
      secondary: designSettings.colors.secondary,
      accent: designSettings.colors.accent,
      background: designSettings.colors.background,
      text: designSettings.colors.text,
    },
    fonts: {
      heading: designSettings.fonts.heading,
      body: designSettings.fonts.body,
      size: designSettings.fonts.size,
    },
    logo: designSettings.logo,
    favicon: designSettings.favicon,
  });
  
  // Update RTL state when language changes
  useEffect(() => {
    setIsRTL(language === 'ar');
  }, [language]);
  
  // Update local state when designSettings changes
  useEffect(() => {
    setFormValues({
      colors: {
        primary: designSettings.colors.primary,
        secondary: designSettings.colors.secondary,
        accent: designSettings.colors.accent,
        background: designSettings.colors.background,
        text: designSettings.colors.text,
      },
      fonts: {
        heading: designSettings.fonts.heading,
        body: designSettings.fonts.body,
        size: designSettings.fonts.size,
      },
      logo: designSettings.logo,
      favicon: designSettings.favicon,
    });
  }, [designSettings]);
  
  // Handle form input changes
  const handleColorChange = (colorName: string, value: string) => {
    setFormValues({
      ...formValues,
      colors: {
        ...formValues.colors,
        [colorName]: value,
      },
    });
  };
  
  const handleFontChange = (fontName: string, value: string) => {
    setFormValues({
      ...formValues,
      fonts: {
        ...formValues.fonts,
        [fontName]: value,
      },
    });
  };
  
  const handleFontSizeChange = (value: 'small' | 'medium' | 'large') => {
    setFormValues({
      ...formValues,
      fonts: {
        ...formValues.fonts,
        size: value,
      },
    });
  };
  
  // Handle file uploads
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormValues({
          ...formValues,
          logo: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormValues({
          ...formValues,
          favicon: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateDesignSettings({
      colors: formValues.colors,
      fonts: formValues.fonts,
      logo: formValues.logo,
      favicon: formValues.favicon,
    });
    // Show success message
    alert(t('admin.design.themeApplied'));
  };
  
  // Handle reset to defaults
  const handleReset = () => {
    if (window.confirm(t('admin.design.resetConfirmation'))) {
      setFormValues({
        colors: {
          primary: '#3b82f6',
          secondary: '#1e40af',
          accent: '#10b981',
          background: '#f9fafb',
          text: '#1f2937',
        },
        fonts: {
          heading: 'Inter, sans-serif',
          body: 'Inter, sans-serif',
          size: 'medium',
        },
        logo: '',
        favicon: '',
      });
    }
  };
  
  // Preview component
  const Preview = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">{t('admin.design.preview')}</h3>
      
      <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: formValues.colors.background }}>
        <h1 
          className="text-2xl font-bold mb-2" 
          style={{ 
            color: formValues.colors.text,
            fontFamily: formValues.fonts.heading,
            fontSize: formValues.fonts.size === 'large' ? '1.5rem' : 
                    formValues.fonts.size === 'small' ? '1.125rem' : '1.25rem'
          }}
        >
          RashadAI
        </h1>
        
        <p 
          className="mb-4" 
          style={{ 
            color: formValues.colors.text,
            fontFamily: formValues.fonts.body,
            fontSize: formValues.fonts.size === 'large' ? '1.125rem' : 
                    formValues.fonts.size === 'small' ? '0.875rem' : '1rem'
          }}
        >
          {t('home.hero.subtitle')}
        </p>
        
        <div className="flex flex-wrap gap-2">
          <button 
            className="px-4 py-2 rounded-lg text-white" 
            style={{ backgroundColor: formValues.colors.primary }}
          >
            {t('home.hero.ctaButton')}
          </button>
          
          <button 
            className="px-4 py-2 rounded-lg border" 
            style={{ 
              borderColor: formValues.colors.secondary,
              color: formValues.colors.secondary
            }}
          >
            {t('home.hero.secondaryButton')}
          </button>
          
          <button 
            className="px-4 py-2 rounded-lg text-white" 
            style={{ backgroundColor: formValues.colors.accent }}
          >
            {t('common.submit')}
          </button>
        </div>
      </div>
      
      {formValues.logo && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-500 mb-2">{t('admin.design.logo')}</p>
          <img src={formValues.logo} alt="Logo" className="h-12 object-contain" />
        </div>
      )}
      
      {formValues.favicon && (
        <div>
          <p className="text-sm font-medium text-gray-500 mb-2">{t('admin.design.favicon')}</p>
          <img src={formValues.favicon} alt="Favicon" className="h-8 w-8 object-contain" />
        </div>
      )}
    </div>
  );
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('admin.design.title')}</h1>
        
        <div className="flex space-x-2">
          <button
            type="button"
            className={`flex items-center px-3 py-2 rounded-lg ${
              previewMode ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
            }`}
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="h-5 w-5 mr-1" />
            {t('admin.design.preview')}
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b">
              <button
                className={`${
                  activeTab === 'colors'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                } flex items-center px-4 py-2 font-medium`}
                onClick={() => setActiveTab('colors')}
              >
                <Palette className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t('admin.design.colors')}
              </button>
              <button
                className={`${
                  activeTab === 'fonts'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                } flex items-center px-4 py-2 font-medium`}
                onClick={() => setActiveTab('fonts')}
              >
                <Type className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t('admin.design.fonts')}
              </button>
              <button
                className={`${
                  activeTab === 'layout'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                } flex items-center px-4 py-2 font-medium`}
                onClick={() => setActiveTab('layout')}
              >
                <LayoutIcon className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t('admin.design.layout')}
              </button>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6">
              {/* Colors Tab */}
              {activeTab === 'colors' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.design.primaryColor')}
                    </label>
                    <div className="flex items-center">
                      <input
                        type="color"
                        value={formValues.colors.primary}
                        onChange={(e) => handleColorChange('primary', e.target.value)}
                        className="h-10 w-10 rounded-md border border-gray-300 mr-2"
                      />
                      <input
                        type="text"
                        value={formValues.colors.primary}
                        onChange={(e) => handleColorChange('primary', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.design.secondaryColor')}
                    </label>
                    <div className="flex items-center">
                      <input
                        type="color"
                        value={formValues.colors.secondary}
                        onChange={(e) => handleColorChange('secondary', e.target.value)}
                        className="h-10 w-10 rounded-md border border-gray-300 mr-2"
                      />
                      <input
                        type="text"
                        value={formValues.colors.secondary}
                        onChange={(e) => handleColorChange('secondary', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.design.accentColor')}
                    </label>
                    <div className="flex items-center">
                      <input
                        type="color"
                        value={formValues.colors.accent}
                        onChange={(e) => handleColorChange('accent', e.target.value)}
                        className="h-10 w-10 rounded-md border border-gray-300 mr-2"
                      />
                      <input
                        type="text"
                        value={formValues.colors.accent}
                        onChange={(e) => handleColorChange('accent', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.design.backgroundColor')}
                    </label>
                    <div className="flex items-center">
                      <input
                        type="color"
                        value={formValues.colors.background}
                        onChange={(e) => handleColorChange('background', e.target.value)}
                        className="h-10 w-10 rounded-md border border-gray-300 mr-2"
                      />
                      <input
                        type="text"
                        value={formValues.colors.background}
                        onChange={(e) => handleColorChange('background', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.design.textColor')}
                    </label>
                    <div className="flex items-center">
                      <input
                        type="color"
                        value={formValues.colors.text}
                        onChange={(e) => handleColorChange('text', e.target.value)}
                        className="h-10 w-10 rounded-md border border-gray-300 mr-2"
                      />
                      <input
                        type="text"
                        value={formValues.colors.text}
                        onChange={(e) => handleColorChange('text', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Fonts Tab */}
              {activeTab === 'fonts' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.design.headingFont')}
                    </label>
                    <select
                      value={formValues.fonts.heading}
                      onChange={(e) => handleFontChange('heading', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="Inter, sans-serif">Inter</option>
                      <option value="Roboto, sans-serif">Roboto</option>
                      <option value="Poppins, sans-serif">Poppins</option>
                      <option value="Montserrat, sans-serif">Montserrat</option>
                      <option value="Open Sans, sans-serif">Open Sans</option>
                      <option value="Lato, sans-serif">Lato</option>
                      <option value="Playfair Display, serif">Playfair Display</option>
                      <option value="Merriweather, serif">Merriweather</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.design.bodyFont')}
                    </label>
                    <select
                      value={formValues.fonts.body}
                      onChange={(e) => handleFontChange('body', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="Inter, sans-serif">Inter</option>
                      <option value="Roboto, sans-serif">Roboto</option>
                      <option value="Poppins, sans-serif">Poppins</option>
                      <option value="Montserrat, sans-serif">Montserrat</option>
                      <option value="Open Sans, sans-serif">Open Sans</option>
                      <option value="Lato, sans-serif">Lato</option>
                      <option value="Source Sans Pro, sans-serif">Source Sans Pro</option>
                      <option value="Nunito, sans-serif">Nunito</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.design.fontSize')}
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="fontSize"
                          checked={formValues.fonts.size === 'small'}
                          onChange={() => handleFontSizeChange('small')}
                          className="mr-2"
                        />
                        {t('settings.appearance.small')}
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="fontSize"
                          checked={formValues.fonts.size === 'medium'}
                          onChange={() => handleFontSizeChange('medium')}
                          className="mr-2"
                        />
                        {t('settings.appearance.medium')}
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="fontSize"
                          checked={formValues.fonts.size === 'large'}
                          onChange={() => handleFontSizeChange('large')}
                          className="mr-2"
                        />
                        {t('settings.appearance.large')}
                      </label>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Layout Tab */}
              {activeTab === 'layout' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.design.logo')}
                    </label>
                    <div className="flex items-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label
                        htmlFor="logo-upload"
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md cursor-pointer hover:bg-gray-200"
                      >
                        <Upload className="h-5 w-5 inline mr-2" />
                        {t('admin.design.uploadLogo')}
                      </label>
                      {formValues.logo && (
                        <div className="ml-4">
                          <img src={formValues.logo} alt="Logo" className="h-10 object-contain" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.design.favicon')}
                    </label>
                    <div className="flex items-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFaviconUpload}
                        className="hidden"
                        id="favicon-upload"
                      />
                      <label
                        htmlFor="favicon-upload"
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md cursor-pointer hover:bg-gray-200"
                      >
                        <Upload className="h-5 w-5 inline mr-2" />
                        {t('admin.design.uploadFavicon')}
                      </label>
                      {formValues.favicon && (
                        <div className="ml-4">
                          <img src={formValues.favicon} alt="Favicon" className="h-8 w-8 object-contain" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-6 flex justify-between">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  <RotateCcw className="h-5 w-5 mr-2" />
                  {t('admin.design.resetToDefault')}
                </button>
                
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    {t('admin.design.applyChanges')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        
        {/* Preview Panel */}
        <div className={`${previewMode ? 'block' : 'hidden lg:block'}`}>
          <Preview />
        </div>
      </div>
    </div>
  );
};

export default DesignControl;
