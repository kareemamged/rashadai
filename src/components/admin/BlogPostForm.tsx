import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '../../store/languageStore';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { X, Upload, Check, AlertCircle } from 'lucide-react';

interface BlogPostFormProps {
  postId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface PostFormData {
  title_en: string;
  title_ar: string;
  summary_en: string;
  summary_ar: string;
  content_en: string;
  content_ar: string;
  category: 'tips' | 'news';
  status: 'draft' | 'published' | 'scheduled';
  scheduled_at: string | null;
  image_url: string;
}

const BlogPostForm: React.FC<BlogPostFormProps> = ({ postId, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const [isRTL, setIsRTL] = useState(language === 'ar');
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState<PostFormData>({
    title_en: '',
    title_ar: '',
    summary_en: '',
    summary_ar: '',
    content_en: '',
    content_ar: '',
    category: 'tips',
    status: 'draft',
    scheduled_at: null,
    image_url: '',
  });

  useEffect(() => {
    setIsRTL(language === 'ar');
  }, [language]);

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const fetchPost = async () => {
    if (!postId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', postId)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          title_en: data.title_en || '',
          title_ar: data.title_ar || '',
          summary_en: data.summary_en || '',
          summary_ar: data.summary_ar || '',
          content_en: data.content_en || '',
          content_ar: data.content_ar || '',
          category: data.category || 'tips',
          status: data.status || (data.published ? 'published' : 'draft'),
          scheduled_at: data.scheduled_at || null,
          image_url: data.image_url || '',
        });

        if (data.image_url) {
          setImagePreview(data.image_url);
        }
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      setError(t('admin.content.errorFetchingPost', 'Error fetching post'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError(t('admin.content.imageTooLarge', 'Image must be less than 2MB'));
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return formData.image_url;

    setIsUploading(true);
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `blog/${fileName}`;

      console.log('Uploading image to path:', filePath);

      // تحميل الصورة مع خيارات إضافية
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw uploadError;
      }

      // الحصول على الرابط العام للصورة
      const { data } = supabase.storage.from('images').getPublicUrl(filePath);
      console.log('Image uploaded successfully, URL:', data.publicUrl);
      return data.publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      setError(t('admin.content.errorUploadingImage', `Error uploading image: ${error.message || 'Unknown error'}`));
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.title_en.trim()) {
      setError(t('admin.content.titleEnRequired', 'English title is required'));
      return false;
    }
    if (!formData.title_ar.trim()) {
      setError(t('admin.content.titleArRequired', 'Arabic title is required'));
      return false;
    }
    if (!formData.summary_en.trim()) {
      setError(t('admin.content.summaryEnRequired', 'English summary is required'));
      return false;
    }
    if (!formData.summary_ar.trim()) {
      setError(t('admin.content.summaryArRequired', 'Arabic summary is required'));
      return false;
    }
    if (!formData.content_en.trim()) {
      setError(t('admin.content.contentEnRequired', 'English content is required'));
      return false;
    }
    if (!formData.content_ar.trim()) {
      setError(t('admin.content.contentArRequired', 'Arabic content is required'));
      return false;
    }
    if (formData.status === 'scheduled' && !formData.scheduled_at) {
      setError(t('admin.content.scheduledDateRequired', 'Scheduled date is required for scheduled posts'));
      return false;
    }
    // التحقق من وجود صورة للمنشور (إجباري)
    // يجب أن يكون هناك إما صورة جديدة تم رفعها (imageFile) أو صورة موجودة مسبقاً (formData.image_url)
    if (!imageFile && !formData.image_url) {
      setError(t('admin.content.imageRequired', 'Featured image is required'));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // رفع الصورة إذا تم اختيارها (الصورة إجبارية، تم التحقق منها في دالة validateForm)
      let imageUrl = formData.image_url;
      if (imageFile) {
        imageUrl = await uploadImage() || '';
      }

      // التأكد من وجود رابط صورة صالح
      if (!imageUrl) {
        throw new Error(t('admin.content.imageUploadFailed', 'Image upload failed. Please try again.'));
      }

      // Prepare post data with proper published flag based on status
      const postData = {
        title: formData.title_en, // For backward compatibility
        title_en: formData.title_en,
        title_ar: formData.title_ar,
        summary_en: formData.summary_en,
        summary_ar: formData.summary_ar,
        content: formData.content_en, // For backward compatibility
        content_en: formData.content_en,
        content_ar: formData.content_ar,
        category: formData.category,
        status: formData.status,
        scheduled_at: formData.scheduled_at,
        image_url: imageUrl,
        author_id: user?.id,
        published: formData.status === 'published',
        updated_at: new Date().toISOString()
      };

      if (postId) {
        // Update existing post
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', postId);

        if (error) throw error;
        setSuccess(t('admin.content.postUpdated', 'Post updated successfully'));
      } else {
        // Create new post
        const { error } = await supabase
          .from('blog_posts')
          .insert(postData);

        if (error) throw error;
        setSuccess(t('admin.content.postCreated', 'Post created successfully'));
      }

      // Reset form after successful submission
      if (!postId) {
        setFormData({
          title_en: '',
          title_ar: '',
          summary_en: '',
          summary_ar: '',
          content_en: '',
          content_ar: '',
          category: 'tips',
          status: 'draft',
          scheduled_at: null,
          image_url: '',
        });
        setImageFile(null);
        setImagePreview(null);
      }

      // Notify parent component
      onSuccess();
    } catch (error) {
      console.error('Error saving post:', error);
      setError(t('admin.content.errorSavingPost', 'Error saving post'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            {postId ? t('admin.content.editPost') : t('admin.content.addPost')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {isLoading ? (
          <div className="p-6 text-center">
            <p>{t('common.loading')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md flex items-center">
                <Check className="h-5 w-5 mr-2" />
                {success}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* English Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isRTL ? "العنوان بالإنجليزية" : "English Title"} *
                </label>
                <input
                  type="text"
                  name="title_en"
                  value={formData.title_en}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Arabic Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isRTL ? "العنوان بالعربية" : "Arabic Title"} *
                </label>
                <input
                  type="text"
                  name="title_ar"
                  value={formData.title_ar}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                  dir="rtl"
                  required
                />
              </div>

              {/* English Summary */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isRTL ? "الملخص بالإنجليزية" : "English Summary"} *
                </label>
                <textarea
                  name="summary_en"
                  value={formData.summary_en}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder={t('admin.content.summaryEnPlaceholder', 'Brief description of the post in English (max 200 characters)')}
                  maxLength={200}
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.summary_en.length}/200
                </p>
              </div>

              {/* Arabic Summary */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isRTL ? "الملخص بالعربية" : "Arabic Summary"} *
                </label>
                <textarea
                  name="summary_ar"
                  value={formData.summary_ar}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                  dir="rtl"
                  required
                  placeholder={t('admin.content.summaryArPlaceholder', 'وصف موجز للمنشور باللغة العربية (بحد أقصى 200 حرف)')}
                  maxLength={200}
                ></textarea>
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {formData.summary_ar.length}/200
                </p>
              </div>

              {/* English Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isRTL ? "المحتوى بالإنجليزية" : "English Content"} *
                </label>
                <textarea
                  name="content_en"
                  value={formData.content_en}
                  onChange={handleInputChange}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                ></textarea>
              </div>

              {/* Arabic Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isRTL ? "المحتوى بالعربية" : "Arabic Content"} *
                </label>
                <textarea
                  name="content_ar"
                  value={formData.content_ar}
                  onChange={handleInputChange}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                  dir="rtl"
                  required
                ></textarea>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isRTL ? "التصنيف" : "Category"} *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="tips">{isRTL ? "نصائح" : "Tips"}</option>
                  <option value="news">{isRTL ? "أخبار" : "News"}</option>
                </select>
              </div>

              {/* Post Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isRTL ? "حالة المنشور" : "Post Status"} *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="draft">{isRTL ? "مسودة" : "Draft"}</option>
                  <option value="published">{isRTL ? "منشور" : "Published"}</option>
                  <option value="scheduled">{isRTL ? "مجدول" : "Scheduled"}</option>
                </select>
              </div>

              {/* Scheduled Date/Time (only shown when status is scheduled) */}
              {formData.status === 'scheduled' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isRTL ? "تاريخ ووقت النشر" : "Scheduled Date/Time"} *
                  </label>
                  <input
                    type="datetime-local"
                    name="scheduled_at"
                    value={formData.scheduled_at || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {isRTL ? "سيتم نشر المنشور تلقائيًا في هذا التاريخ والوقت" : "The post will be automatically published at this date and time"}
                  </p>
                </div>
              )}
            </div>

            {/* Featured Image */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isRTL ? "الصورة المميزة" : "Featured Image"} *
              </label>
              <div className="mt-1 flex items-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Upload className="h-5 w-5 inline mr-2" />
                  {isRTL ? "رفع صورة" : "Upload Image"}
                </label>
                <span className="ml-2 text-xs text-red-500">
                  {isRTL ? "الصورة مطلوبة لجميع المنشورات" : "Image is required for all posts"}
                </span>
                {imagePreview && (
                  <div className="ml-4 relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-16 w-16 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                        setFormData((prev) => ({ ...prev, image_url: '' }));
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      aria-label="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isRTL ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
              >
                {isSubmitting || isUploading ? (
                  <span>{isRTL ? "جاري الحفظ..." : "Saving..."}</span>
                ) : (
                  <span>{isRTL ? "حفظ" : "Save"}</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default BlogPostForm;
