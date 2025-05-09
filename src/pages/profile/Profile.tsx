import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Camera, Save, Loader, Calendar, MapPin, Phone, Globe, Clock } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { countries } from '../../data/countries';
import ChatHeader from '../../components/ChatHeader';
import ReportIssue from '../../components/ReportIssue';
import { getDefaultAvatar } from '../../lib/imageUtils';
import { useTranslation } from 'react-i18next';

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateProfile, uploadProfileImage } = useAuthStore();
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState<'en' | 'ar'>(i18n.language === 'ar' ? 'ar' : 'en');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  // Track if form has been initialized
  const [isFormInitialized, setIsFormInitialized] = useState(false);
  // Track if avatar is being updated
  const [isAvatarUpdating, setIsAvatarUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    country_code: '',
    phone: '',
    bio: '',
    language: 'ar',
    website: '',
    gender: '',
    birth_date: '',
    profession: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // تحقق من وجود المستخدم وإعادة التوجيه إذا لم يكن موجودًا
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // تهيئة النموذج في كل مرة يتغير فيها المستخدم
    // هذا يضمن أن النموذج يعكس دائمًا أحدث بيانات المستخدم

    setFormData({
      name: user.name || '',
      email: user.email || '',
      country_code: user.country_code || 'SA',
      phone: user.phone || '',
      bio: user.bio || '',
      language: user.language || 'ar',
      website: user.website || '',
      gender: user.gender || '',
      birth_date: user.birth_date || '',
      profession: user.profession || '',
    });

    setIsFormInitialized(true);
  }, [user, navigate]); // إزالة isFormInitialized من التبعيات لضمان تحديث النموذج في كل مرة يتغير فيها المستخدم

  // Update language when i18n language changes
  useEffect(() => {
    setLanguage(i18n.language === 'ar' ? 'ar' : 'en');
  }, [i18n.language]);

  // تحديث الصورة الشخصية في واجهة المستخدم عند تغييرها
  useEffect(() => {
    // تحديث الصورة فقط إذا كان المستخدم موجودًا وتم تهيئة النموذج بالفعل
    // ولا يتم تحديث الصورة حاليًا (لتجنب التداخل مع عملية التحميل)
    if (user && isFormInitialized && !isAvatarUpdating) {
      // لا نقوم بتحديث كامل النموذج، فقط نعرض الصورة الجديدة في واجهة المستخدم
      // البيانات الأخرى تبقى كما هي في النموذج
    }
  }, [user?.avatar, isFormInitialized, isAvatarUpdating]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage('');

    try {
      // تحديث البيانات في المتجر
      const updatedData = {
        name: formData.name,
        country_code: formData.country_code,
        phone: formData.phone,
        bio: formData.bio,
        language: formData.language,
        website: formData.website,
        gender: formData.gender,
        birth_date: formData.birth_date,
        profession: formData.profession,
        updated_at: new Date().toISOString(),
      };

      // استدعاء وظيفة تحديث الملف الشخصي
      const result = await updateProfile(updatedData);

      // Show success message
      setSuccessMessage('Profile updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);

      // لا نقوم بتحديث formData هنا لأن المستخدم قد يكون لا يزال يقوم بالتعديل
    } catch (error: any) {
      console.error('Error updating profile:', error);
      alert(`Error updating profile: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };



  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image is too large. Image size should be less than 2MB.');
      return;
    }

    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('File type not supported. Please use JPEG, PNG, GIF or WebP format.');
      return;
    }

    setIsLoading(true);
    setIsAvatarUpdating(true); // تعيين علامة تحديث الصورة
    setSuccessMessage('');

    try {
      // تحميل الصورة مباشرة
      const imageUrl = await uploadProfileImage(file);

      if (imageUrl) {
        setSuccessMessage('Profile picture updated successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        alert('Image upload failed. Please try again.');
      }

      // إعادة تعيين حقل الملف
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Error updating avatar:', error);

      // Show friendly error message
      alert('Error uploading image. Current avatar or default will be used.');

      // إعادة تعيين حقل الملف
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setIsLoading(false);
      setIsAvatarUpdating(false); // إعادة تعيين علامة تحديث الصورة
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <ChatHeader />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              {language === 'ar' ? 'الملف الشخصي' : 'Profile'}
            </h1>

            {successMessage && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {language === 'ar' ? 'تم تحديث الملف الشخصي بنجاح' : successMessage}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center mb-8 gap-6">
              <div className="relative">
                <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-gray-200">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name || 'User profile'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-blue-100 flex items-center justify-center">
                      <User className="h-10 w-10 text-blue-600" />
                    </div>
                  )}
                </div>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                    ref={fileInputRef}
                  />
                </label>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-800">{user.name || user.email.split('@')[0]}</h2>
                <p className="text-gray-500">{user.email}</p>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <Calendar className={`h-3.5 w-3.5 ${language === 'ar' ? 'ml-1' : 'mr-1'}`} />
                  {language === 'ar' ? 'تاريخ الانضمام: ' : 'Join Date: '}
                  {new Date(user.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    calendar: 'gregory'
                  })}
                </div>
                {user.updated_at && (
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Clock className={`h-3.5 w-3.5 ${language === 'ar' ? 'ml-1' : 'mr-1'}`} />
                    {language === 'ar' ? 'آخر تحديث: ' : 'Last Update: '}
                    {new Date(user.updated_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      calendar: 'gregory'
                    })}
                  </div>
                )}
                {user.country_code && (
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <MapPin className={`h-3.5 w-3.5 ${language === 'ar' ? 'ml-1' : 'mr-1'}`} />
                    {countries.find(c => c.code === user.country_code)?.name || user.country_code}
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' ? 'الاسم' : 'Name'}
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${language === 'ar' ? 'text-right'  : 'text-left'}`}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {language === 'ar' ? 'لا يمكن تعديل البريد الإلكتروني' : 'Email cannot be modified'}
                  </p>
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' ? 'الدولة' : 'Country'}
                  </label>
                  <select
                    id="country"
                    value={formData.country_code}
                    onChange={(e) => setFormData({ ...formData, country_code: e.target.value })}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${language === 'ar' ? 'text-right' : 'text-left'}`}
                  >
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${language === 'ar' ? 'text-right'  : 'text-left'}`}
                  />
                </div>

                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'ar' ? 'اللغة' : 'Language'}
                  </label>
                  <select
                    id="language"
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${language === 'ar' ? 'text-right' : 'text-left'}`}
                  >
                    <option value="ar">
                    {language === 'ar' ? 'العربية' : 'Arabic'}
                    </option>
                    <option value="en">
                      {language === 'ar' ? 'الإنجليزية' : 'English'}
                    </option>
                  </select>
                </div>

                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' ? 'الموقع الإلكتروني' : 'Website'}
                  </label>
                  <input
                    type="url"
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${language === 'ar' ? 'text-right' : 'text-left'}`}
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' ? 'الجنس' : 'Gender'}
                  </label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${language === 'ar' ? 'text-right' : 'text-left'}`}
                  >
                    <option value="">{language === 'ar' ? 'اختر...' : 'Select...'}</option>
                    <option value="male">{language === 'ar' ? 'ذكر' : 'Male'}</option>
                    <option value="female">{language === 'ar' ? 'أنثى' : 'Female'}</option>
                    <option value="other">{language === 'ar' ? 'آخر' : 'Other'}</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' ? 'تاريخ الميلاد' : 'Birth Date'}
                  </label>
                  <input
                    type="date"
                    id="birth_date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${language === 'ar' ? 'text-right' : 'text-left'}`}
                  />
                </div>

                <div>
                  <label htmlFor="profession" className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' ? 'المهنة' : 'Profession'}
                  </label>
                  <input
                    type="text"
                    id="profession"
                    value={formData.profession}
                    onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${language === 'ar' ? 'text-right' : 'text-left'}`}
                    placeholder="Doctor, Engineer, Teacher, etc."
                  />
                </div>
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'ar' ? 'نبذة شخصية' : 'Bio'}
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${language === 'ar' ? 'text-right' : 'text-left'}`}
                  placeholder={language === 'ar' ? 'اكتب نبذة قصيرة عن نفسك...' : 'Write a short bio about yourself...'}
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center justify-center px-6 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader className={`animate-spin h-4 w-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                      {language === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <Save className={`h-4 w-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                      {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Report Issue Section */}
        <div className="mt-8 max-w-3xl mx-auto">
          <ReportIssue userEmail={user.email} />
        </div>
      </div>
    </div>
  );
};

export default Profile;
