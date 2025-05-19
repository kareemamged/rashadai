import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, RefreshCw, Search, ChevronDown, ChevronUp, X, Check } from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { showSuccessNotification, showErrorNotification } from '../../stores/notificationStore';

interface TextItem {
  key: string;
  value: string;
  path: string;
  isEdited: boolean;
  originalValue: string;
}

interface TextGroup {
  name: string;
  isOpen: boolean;
  items: TextItem[];
}

const TextsControl: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);
  const [searchTerm, setSearchTerm] = useState('');
  const [textGroups, setTextGroups] = useState<TextGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load texts from translation files
  useEffect(() => {
    loadTexts(language);
  }, [language]);

  const loadTexts = async (lang: string) => {
    setLoading(true);
    try {
      // Get the translation file for the selected language
      const translations = i18n.getResourceBundle(lang, 'translation');

      // Process translations into groups
      const groups: TextGroup[] = [];

      // Process common texts
      if (translations.common) {
        groups.push(createGroup('Common', 'common', translations.common));
      }

      // Process header texts
      if (translations.header) {
        groups.push(createGroup('Header', 'header', translations.header));
      }

      // Process footer texts
      if (translations.footer) {
        groups.push(createGroup('Footer', 'footer', translations.footer));
      }

      // Process home page texts
      if (translations.home) {
        groups.push(createGroup('Home Page', 'home', translations.home));
      }

      // Process about page texts
      if (translations.about) {
        groups.push(createGroup('About Page', 'about', translations.about));
      }

      // Process services page texts
      if (translations.services) {
        groups.push(createGroup('Services Page', 'services', translations.services));
      }

      // Process blog page texts
      if (translations.blog) {
        groups.push(createGroup('Blog Page', 'blog', translations.blog));
      }

      // Process legal pages texts
      if (translations.legal) {
        groups.push(createGroup('Legal Pages', 'legal', translations.legal));
      }

      // Process auth texts
      if (translations.auth) {
        groups.push(createGroup('Authentication', 'auth', translations.auth));
      }

      // Process profile texts
      if (translations.profile) {
        groups.push(createGroup('Profile Page', 'profile', translations.profile));
      }

      // Process chat texts
      if (translations.chat) {
        groups.push(createGroup('Chat Page', 'chat', translations.chat));
      }

      // Process admin texts
      if (translations.admin) {
        groups.push(createGroup('Admin Panel', 'admin', translations.admin));
      }

      setTextGroups(groups);
    } catch (error) {
      console.error('Error loading texts:', error);
      showErrorNotification(
        t('admin.texts.loadError'),
        t('admin.texts.loadErrorMessage')
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper function to create a group from a translation object
  const createGroup = (name: string, path: string, obj: any): TextGroup => {
    const items: TextItem[] = [];

    // Recursively process the object to get all text items
    const processObject = (obj: any, currentPath: string) => {
      for (const key in obj) {
        const fullPath = currentPath ? `${currentPath}.${key}` : key;

        if (typeof obj[key] === 'string') {
          items.push({
            key: key,
            value: obj[key],
            path: fullPath,
            isEdited: false,
            originalValue: obj[key]
          });
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          processObject(obj[key], fullPath);
        }
      }
    };

    processObject(obj, path);

    return {
      name,
      isOpen: false,
      items
    };
  };

  // Toggle group open/closed
  const toggleGroup = (index: number) => {
    const newGroups = [...textGroups];
    newGroups[index].isOpen = !newGroups[index].isOpen;
    setTextGroups(newGroups);
  };

  // Handle text change
  const handleTextChange = (groupIndex: number, itemIndex: number, value: string) => {
    const newGroups = [...textGroups];
    newGroups[groupIndex].items[itemIndex].value = value;
    newGroups[groupIndex].items[itemIndex].isEdited =
      value !== newGroups[groupIndex].items[itemIndex].originalValue;
    setTextGroups(newGroups);
    setHasChanges(true);
  };

  // Reset a single text item
  const resetTextItem = (groupIndex: number, itemIndex: number) => {
    const newGroups = [...textGroups];
    const originalValue = newGroups[groupIndex].items[itemIndex].originalValue;
    newGroups[groupIndex].items[itemIndex].value = originalValue;
    newGroups[groupIndex].items[itemIndex].isEdited = false;
    setTextGroups(newGroups);

    // Check if there are still changes
    let stillHasChanges = false;
    for (const group of newGroups) {
      for (const item of group.items) {
        if (item.isEdited) {
          stillHasChanges = true;
          break;
        }
      }
      if (stillHasChanges) break;
    }

    setHasChanges(stillHasChanges);
  };

  // Save changes
  const saveChanges = async () => {
    setSaving(true);
    try {
      // Prepare the data to save
      const updatedTexts: Record<string, any> = {};

      // Get the full translation bundle first
      const fullTranslations = i18n.getResourceBundle(language, 'translation');

      // Create a deep copy of the full translations
      const updatedTranslations = JSON.parse(JSON.stringify(fullTranslations));

      // Collect all edited texts
      textGroups.forEach(group => {
        group.items.forEach(item => {
          if (item.isEdited) {
            // Build the nested structure based on the path
            const pathParts = item.path.split('.');
            let current = updatedTexts;
            let currentInFull = updatedTranslations;

            // Build the nested object structure and update the full translations
            for (let i = 0; i < pathParts.length - 1; i++) {
              const part = pathParts[i];
              if (!current[part]) {
                current[part] = {};
              }
              current = current[part];

              // Also navigate in the full translations object
              if (!currentInFull[part]) {
                currentInFull[part] = {};
              }
              currentInFull = currentInFull[part];
            }

            // Set the value at the final path in both objects
            const finalKey = pathParts[pathParts.length - 1];
            current[finalKey] = item.value;
            currentInFull[finalKey] = item.value;
          }
        });
      });

      console.log('Texts to save:', updatedTexts);

      // Update the translations in i18next
      i18n.addResourceBundle(language, 'translation', updatedTranslations, true, true);

      // Force a reload of the translations
      i18n.reloadResources([language]);

      // Save the updated translations to localStorage for persistence
      try {
        localStorage.setItem(`translations_${language}`, JSON.stringify(updatedTranslations));
        console.log(`Saved translations to localStorage for language: ${language}`);
      } catch (storageError) {
        console.warn('Failed to save translations to localStorage:', storageError);
      }

      // Update the original values to reflect the saved state
      const newGroups = textGroups.map(group => ({
        ...group,
        items: group.items.map(item => ({
          ...item,
          originalValue: item.value,
          isEdited: false
        }))
      }));

      setTextGroups(newGroups);
      setHasChanges(false);

      showSuccessNotification(
        t('admin.texts.saveSuccess'),
        t('admin.texts.saveSuccessMessage')
      );
    } catch (error) {
      console.error('Error saving texts:', error);
      showErrorNotification(
        t('admin.texts.saveError'),
        t('admin.texts.saveErrorMessage')
      );
    } finally {
      setSaving(false);
    }
  };

  // Filter texts based on search term
  const filteredGroups = textGroups.map(group => ({
    ...group,
    items: group.items.filter(item =>
      item.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.path.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(group => group.items.length > 0);

  // Change language
  const handleLanguageChange = (lang: string) => {
    if (hasChanges) {
      if (window.confirm(t('admin.texts.unsavedChanges'))) {
        setLanguage(lang);
      }
    } else {
      setLanguage(lang);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">{t('admin.texts.title')}</h2>

        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <label htmlFor="language-select" className="mr-2 text-gray-700">
              {t('admin.texts.language')}:
            </label>
            <select
              id="language-select"
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
          </div>

          <button
            onClick={saveChanges}
            disabled={!hasChanges || saving}
            className={`flex items-center px-4 py-2 rounded-md ${
              hasChanges && !saving
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                {t('admin.texts.saving')}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {t('admin.texts.save')}
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('admin.texts.search')}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
          <span className="ml-2 text-lg text-gray-600">{t('admin.texts.loading')}</span>
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {t('admin.texts.noResults')}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredGroups.map((group, groupIndex) => (
            <div key={group.name} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleGroup(groupIndex)}
                className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="font-medium text-gray-800">{group.name}</span>
                {group.isOpen ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>

              {group.isOpen && (
                <div className="p-4">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4 text-gray-600 w-1/4">{t('admin.texts.key')}</th>
                        <th className="text-left py-2 px-4 text-gray-600 w-1/2">{t('admin.texts.value')}</th>
                        <th className="text-left py-2 px-4 text-gray-600 w-1/4">{t('admin.texts.actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.items.map((item, itemIndex) => (
                        <tr key={item.path} className="border-b last:border-b-0">
                          <td className="py-3 px-4">
                            <div className="text-sm font-medium text-gray-800">{item.key}</div>
                            <div className="text-xs text-gray-500">{item.path}</div>
                          </td>
                          <td className="py-3 px-4">
                            <textarea
                              value={item.value}
                              onChange={(e) => handleTextChange(groupIndex, itemIndex, e.target.value)}
                              className={`w-full p-2 border rounded-md ${
                                item.isEdited ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
                              }`}
                              rows={Math.min(5, Math.max(2, Math.ceil(item.value.length / 50)))}
                            />
                          </td>
                          <td className="py-3 px-4">
                            {item.isEdited && (
                              <button
                                onClick={() => resetTextItem(groupIndex, itemIndex)}
                                className="flex items-center text-gray-600 hover:text-gray-800"
                                title={t('admin.texts.reset')}
                              >
                                <RefreshCw className="h-4 w-4 mr-1" />
                                {t('admin.texts.reset')}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TextsControl;
