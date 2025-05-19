import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image as ImageIcon,
  Upload,
  RefreshCw,
  Edit,
  Trash2,
  Check,
  X,
  ExternalLink,
  Save
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { showSuccessNotification, showErrorNotification } from '../../stores/notificationStore';

interface SiteImage {
  id: number;
  key: string;
  title: string;
  description: string;
  section: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}

interface Section {
  id: string;
  name: string;
  images: SiteImage[];
}

const SiteImagesControl: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<Section[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<{ [key: string]: File | null }>({});
  const [previewUrls, setPreviewUrls] = useState<{ [key: string]: string | null }>({});

  // Load images from database
  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    setLoading(true);
    try {
      // Fetch images from the database
      const { data, error } = await supabase
        .from('site_images')
        .select('*')
        .order('section');

      if (error) {
        throw error;
      }

      // Group images by section
      const sectionMap: { [key: string]: SiteImage[] } = {};

      if (data) {
        data.forEach((image: SiteImage) => {
          if (!sectionMap[image.section]) {
            sectionMap[image.section] = [];
          }
          sectionMap[image.section].push(image);
        });
      }

      // Create sections array
      const sectionsArray: Section[] = Object.keys(sectionMap).map(key => ({
        id: key,
        name: getSectionName(key),
        images: sectionMap[key]
      }));

      // Add sections for images from the screenshots
      const requiredSections = ['leadership', 'mission', 'consultation'];
      requiredSections.forEach(section => {
        if (!sectionMap[section]) {
          sectionsArray.push({
            id: section,
            name: getSectionName(section),
            images: []
          });
        }
      });

      // Sort sections
      sectionsArray.sort((a, b) => a.name.localeCompare(b.name));

      setSections(sectionsArray);
    } catch (error) {
      console.error('Error loading images:', error);
      showErrorNotification(
        t('admin.images.loadError'),
        error instanceof Error ? error.message : t('admin.images.loadErrorMessage')
      );
    } finally {
      setLoading(false);
    }
  };

  // Get section name for display
  const getSectionName = (sectionId: string): string => {
    const sectionNames: { [key: string]: string } = {
      'leadership': t('admin.images.sections.leadership'),
      'mission': t('admin.images.sections.mission'),
      'consultation': t('admin.images.sections.consultation'),
      'home': t('admin.images.sections.home'),
      'about': t('admin.images.sections.about'),
      'services': t('admin.images.sections.services'),
      'contact': t('admin.images.sections.contact')
    };

    return sectionNames[sectionId] || sectionId;
  };

  // Handle file selection
  const handleFileChange = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(prev => ({ ...prev, [key]: file }));

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrls(prev => ({ ...prev, [key]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload image
  const uploadImage = async (image: SiteImage) => {
    const file = selectedFile[image.key];
    if (!file) {
      showErrorNotification(
        t('admin.images.uploadError'),
        t('admin.images.selectFile')
      );
      return;
    }

    setUploading(image.key);

    try {
      // Create folder if it doesn't exist
      try {
        // Try to create the folder structure first
        const { data: folderData, error: folderError } = await supabase.storage
          .from('images')
          .upload(`${image.section}/.keep`, new Blob([''], { type: 'text/plain' }), {
            upsert: true
          });

        if (folderError && folderError.message !== 'The resource already exists') {
          console.warn('Error creating folder:', folderError);
        }
      } catch (folderErr) {
        console.warn('Error creating folder structure:', folderErr);
        // Continue anyway, the upload might still work
      }

      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${image.key}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${image.section}/${fileName}`;

      // Upload the file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        throw error;
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      // Update the image URL in the database
      const { error: updateError } = await supabase
        .from('site_images')
        .update({ image_url: urlData.publicUrl })
        .eq('id', image.id);

      if (updateError) {
        throw updateError;
      }

      showSuccessNotification(
        t('admin.images.uploadSuccess'),
        t('admin.images.uploadSuccessMessage')
      );

      // Reset form and reload images
      setSelectedFile(prev => ({ ...prev, [image.key]: null }));
      setPreviewUrls(prev => ({ ...prev, [image.key]: null }));
      loadImages();
    } catch (error) {
      console.error('Error uploading image:', error);
      showErrorNotification(
        t('admin.images.uploadError'),
        error instanceof Error ? error.message : t('admin.images.uploadErrorMessage')
      );
    } finally {
      setUploading(null);
    }
  };

  // Add a new image
  const addNewImage = async (section: string, key: string, title: string, description: string) => {
    try {
      const { data, error } = await supabase
        .from('site_images')
        .insert([
          {
            key,
            title,
            description,
            section,
            image_url: 'https://voiwxfqryobznmxgpamq.supabase.co/storage/v1/object/public/images/defaults/placeholder.jpg'
          }
        ])
        .select();

      if (error) {
        throw error;
      }

      showSuccessNotification(
        t('admin.images.addSuccess'),
        t('admin.images.addSuccessMessage')
      );

      loadImages();
    } catch (error) {
      console.error('Error adding image:', error);
      showErrorNotification(
        t('admin.images.addError'),
        error instanceof Error ? error.message : t('admin.images.addErrorMessage')
      );
    }
  };

  // Delete image
  const deleteImage = async (image: SiteImage) => {
    if (window.confirm(t('admin.images.deleteConfirmation'))) {
      try {
        // Delete from database
        const { error } = await supabase
          .from('site_images')
          .delete()
          .eq('id', image.id);

        if (error) {
          throw error;
        }

        // Try to delete from storage if it's a Supabase URL
        if (image.image_url.includes('supabase.co/storage')) {
          const path = image.image_url.split('public/')[1];
          if (path) {
            await supabase.storage
              .from('images')
              .remove([path]);
          }
        }

        showSuccessNotification(
          t('admin.images.deleteSuccess'),
          t('admin.images.deleteSuccessMessage')
        );

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

      {/* Image Sections */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
          <span className="ml-2 text-lg text-gray-600">{t('admin.images.loading')}</span>
        </div>
      ) : (
        <div className="space-y-8">
          {sections.map(section => (
            <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-800">{section.name}</h3>
              </div>

              <div className="p-4">
                {section.images.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    {t('admin.images.noImagesInSection')}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {section.images.map(image => (
                      <div key={image.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="p-4">
                          <div className="flex flex-col md:flex-row gap-6">
                            {/* Image Info */}
                            <div className="md:w-1/3">
                              <h4 className="font-medium text-lg mb-2">{image.title}</h4>
                              <p className="text-gray-600 text-sm mb-4">{image.description}</p>
                              <div className="text-xs text-gray-500 mb-2">
                                <span className="font-medium">{t('admin.images.key')}:</span> {image.key}
                              </div>
                              <div className="text-xs text-gray-500 mb-4">
                                <span className="font-medium">{t('admin.images.lastUpdated')}:</span> {new Date(image.updated_at).toLocaleString()}
                              </div>

                              <div className="flex space-x-2">
                                <a
                                  href={image.image_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                                >
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  {t('admin.images.view')}
                                </a>

                                <button
                                  onClick={() => deleteImage(image)}
                                  className="text-red-600 hover:text-red-800 text-sm flex items-center"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  {t('admin.images.delete')}
                                </button>
                              </div>
                            </div>

                            {/* Current Image */}
                            <div className="md:w-1/3">
                              <div className="text-sm font-medium mb-2">{t('admin.images.currentImage')}</div>
                              <div className="h-48 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                                {image.image_url ? (
                                  <img
                                    src={image.image_url}
                                    alt={image.title}
                                    className="max-h-full max-w-full object-contain"
                                    onError={(e) => {
                                      console.error(`Error loading image: ${image.image_url}`);
                                      (e.target as HTMLImageElement).src = `https://placehold.co/600x400/blue/white?text=${image.key}`;
                                    }}
                                  />
                                ) : (
                                  <div className="flex flex-col items-center justify-center text-gray-500">
                                    <ImageIcon className="h-12 w-12 mb-2" />
                                    <span>{t('admin.images.noImageAvailable')}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Upload New Image */}
                            <div className="md:w-1/3">
                              <div className="text-sm font-medium mb-2">{t('admin.images.uploadNew')}</div>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(image.key, e)}
                                className="w-full p-2 border border-gray-300 rounded-md mb-3"
                              />

                              {previewUrls[image.key] && (
                                <div className="relative h-32 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden mb-3">
                                  <img
                                    src={previewUrls[image.key] || ''}
                                    alt="Preview"
                                    className="max-h-full max-w-full object-contain"
                                  />
                                  <button
                                    onClick={() => {
                                      setSelectedFile(prev => ({ ...prev, [image.key]: null }));
                                      setPreviewUrls(prev => ({ ...prev, [image.key]: null }));
                                    }}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              )}

                              <button
                                onClick={() => uploadImage(image)}
                                disabled={!selectedFile[image.key] || uploading === image.key}
                                className={`w-full flex items-center justify-center px-4 py-2 rounded-md ${
                                  selectedFile[image.key] && uploading !== image.key
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                              >
                                {uploading === image.key ? (
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
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SiteImagesControl;
