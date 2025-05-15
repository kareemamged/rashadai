import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image as ImageIcon,
  Upload,
  RefreshCw,
  Search,
  Trash2,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Download,
  ExternalLink
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { showSuccessNotification, showErrorNotification } from '../../stores/notificationStore';

interface ImageItem {
  id: string;
  name: string;
  path: string;
  url: string;
  size: number;
  created_at: string;
  updated_at: string;
  category: string;
}

interface ImageCategory {
  name: string;
  isOpen: boolean;
  items: ImageItem[];
  bucket: string;
  path: string;
}

const ImagesControl: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [imageCategories, setImageCategories] = useState<ImageCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Load images from Supabase Storage
  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    setLoading(true);
    try {
      // Define the categories we want to display
      // Excluding profile pictures and blog post images as requested
      const categories: ImageCategory[] = [
        {
          name: t('admin.images.categories.logos'),
          isOpen: false,
          items: [],
          bucket: 'images',
          path: 'logos'
        },
        {
          name: t('admin.images.categories.icons'),
          isOpen: false,
          items: [],
          bucket: 'images',
          path: 'icons'
        },
        {
          name: t('admin.images.categories.backgrounds'),
          isOpen: false,
          items: [],
          bucket: 'images',
          path: 'backgrounds'
        },
        {
          name: t('admin.images.categories.banners'),
          isOpen: false,
          items: [],
          bucket: 'images',
          path: 'banners'
        },
        {
          name: t('admin.images.categories.defaults'),
          isOpen: false,
          items: [],
          bucket: 'images',
          path: 'defaults'
        },
        {
          name: t('admin.images.categories.other'),
          isOpen: false,
          items: [],
          bucket: 'images',
          path: 'other'
        }
      ];

      // Load images for each category
      for (const category of categories) {
        const { data, error } = await supabase.storage
          .from(category.bucket)
          .list(category.path, {
            sortBy: { column: 'name', order: 'asc' }
          });

        if (error) {
          console.error(`Error loading images for ${category.name}:`, error);
          continue;
        }

        if (data) {
          // Process each image
          const items: ImageItem[] = [];
          for (const item of data) {
            if (item.name && !item.name.startsWith('.')) {
              const { data: urlData } = supabase.storage
                .from(category.bucket)
                .getPublicUrl(`${category.path}/${item.name}`);

              items.push({
                id: item.id || `${category.path}-${item.name}`,
                name: item.name,
                path: `${category.path}/${item.name}`,
                url: urlData.publicUrl,
                size: item.metadata?.size || 0,
                created_at: item.created_at || '',
                updated_at: item.updated_at || '',
                category: category.name
              });
            }
          }
          category.items = items;
        }
      }

      setImageCategories(categories);
    } catch (error) {
      console.error('Error loading images:', error);
      showErrorNotification(
        t('admin.images.loadError'),
        t('admin.images.loadErrorMessage')
      );
    } finally {
      setLoading(false);
    }
  };

  // Toggle category open/closed
  const toggleCategory = (index: number) => {
    const newCategories = [...imageCategories];
    newCategories[index].isOpen = !newCategories[index].isOpen;
    setImageCategories(newCategories);
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle category selection for upload
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  // Upload image
  const uploadImage = async () => {
    if (!selectedFile || !selectedCategory) {
      showErrorNotification(
        t('admin.images.uploadError'),
        t('admin.images.selectFileAndCategory')
      );
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Find the selected category
      const category = imageCategories.find(cat => cat.name === selectedCategory);
      if (!category) {
        throw new Error('Category not found');
      }

      // Create a unique filename
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${category.path}/${fileName}`;

      // Upload the file
      const { data, error } = await supabase.storage
        .from(category.bucket)
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        throw error;
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from(category.bucket)
        .getPublicUrl(filePath);

      showSuccessNotification(
        t('admin.images.uploadSuccess'),
        t('admin.images.uploadSuccessMessage')
      );

      // Reset form and reload images
      setSelectedFile(null);
      setPreviewUrl(null);
      setSelectedCategory(null);
      loadImages();
    } catch (error) {
      console.error('Error uploading image:', error);
      showErrorNotification(
        t('admin.images.uploadError'),
        error instanceof Error ? error.message : t('admin.images.uploadErrorMessage')
      );
    } finally {
      setUploading(false);
      setUploadProgress(100);
    }
  };

  // Delete image
  const deleteImage = async (bucket: string, path: string, name: string) => {
    if (window.confirm(t('admin.images.deleteConfirmation'))) {
      try {
        const { error } = await supabase.storage
          .from(bucket)
          .remove([path]);

        if (error) {
          throw error;
        }

        showSuccessNotification(
          t('admin.images.deleteSuccess'),
          t('admin.images.deleteSuccessMessage')
        );

        // Reload images
        loadImages();
      } catch (error) {
        console.error('Error deleting image:', error);
        showErrorNotification(
          t('admin.images.deleteError'),
          error instanceof Error ? error.message : t('admin.images.deleteErrorMessage')
        );
      }
    }
  };

  // Filter images based on search term
  const filteredCategories = imageCategories.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.path.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">{t('admin.images.title')}</h2>

        <div className="flex items-center space-x-4">
          <button
            onClick={loadImages}
            className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {t('admin.images.refresh')}
          </button>
        </div>
      </div>

      {/* Upload Section */}
      <div className="mb-8 p-4 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-medium mb-4">{t('admin.images.uploadNew')}</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.images.selectCategory')}
            </label>
            <select
              value={selectedCategory || ''}
              onChange={handleCategoryChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">{t('admin.images.chooseCategory')}</option>
              {imageCategories.map(category => (
                <option key={category.name} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.images.selectFile')}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        {previewUrl && (
          <div className="mt-4 flex justify-center">
            <div className="relative">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-48 max-w-full rounded-md"
              />
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button
            onClick={uploadImage}
            disabled={!selectedFile || !selectedCategory || uploading}
            className={`flex items-center px-4 py-2 rounded-md ${
              selectedFile && selectedCategory && !uploading
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {uploading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                {t('admin.images.uploading')}
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                {t('admin.images.upload')}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('admin.images.search')}
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

      {/* Image Categories */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
          <span className="ml-2 text-lg text-gray-600">{t('admin.images.loading')}</span>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {t('admin.images.noResults')}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredCategories.map((category, categoryIndex) => (
            <div key={category.name} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleCategory(categoryIndex)}
                className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="font-medium text-gray-800">{category.name}</span>
                {category.isOpen ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>

              {category.isOpen && (
                <div className="p-4">
                  {category.items.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      {t('admin.images.noImagesInCategory')}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {category.items.map(image => (
                        <div key={image.id} className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                            <img
                              src={image.url}
                              alt={image.name}
                              className="max-h-full max-w-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/images/defaults/image-error.png';
                              }}
                            />
                          </div>

                          <div className="p-3">
                            <div className="text-sm font-medium text-gray-800 truncate" title={image.name}>
                              {image.name}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {formatFileSize(image.size)}
                            </div>

                            <div className="flex justify-between mt-3">
                              <a
                                href={image.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                {t('admin.images.view')}
                              </a>

                              <button
                                onClick={() => deleteImage(category.bucket, image.path, image.name)}
                                className="text-red-600 hover:text-red-800 text-sm flex items-center"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                {t('admin.images.delete')}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImagesControl;
