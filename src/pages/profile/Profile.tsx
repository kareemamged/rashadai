import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Camera, Save, Loader, Calendar, MapPin, Phone, Globe, Clock, Bug, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { countries } from '../../data/countries';
import ChatHeader from '../../components/ChatHeader';
import ReportIssue from '../../components/ReportIssue';
import DeletionAlert from '../../components/DeletionAlert';
import { getDefaultAvatar } from '../../lib/imageUtils';
import { getDebugLogs, supabase } from '../../lib/supabase';
import { useTranslation } from 'react-i18next';

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateProfile, uploadProfileImage, reloadUserProfile } = useAuthStore();
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState<'en' | 'ar'>(i18n.language === 'ar' ? 'ar' : 'en');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  // Track if form has been initialized
  const [isFormInitialized, setIsFormInitialized] = useState(false);
  // Track if avatar is being updated
  const [isAvatarUpdating, setIsAvatarUpdating] = useState(false);
  // Debug logs
  const [debugLogs, setDebugLogs] = useState<any[]>([]);
  const [showDebugLogs, setShowDebugLogs] = useState(false);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
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

    // تهيئة النموذج فقط عند تحميل الصفحة أو تغيير المستخدم
    // لا نقوم بإعادة تحميل البيانات هنا لتجنب الطلبات المتكررة
    console.log('Initializing form with user data:', {
      name: user.name,
      email: user.email,
      country_code: user.country_code,
      phone: user.phone,
      bio: user.bio,
      language: user.language,
      website: user.website,
      gender: user.gender,
      birth_date: user.birth_date,
      profession: user.profession,
    });

    setFormData({
      name: user.name || '',
      email: user.email || '',
      country_code: user.country_code || 'EG',
      phone: user.phone || '',
      bio: user.bio || '',
      language: user.language || 'ar',
      website: user.website || '',
      gender: user.gender || '',
      birth_date: user.birth_date || '',
      profession: user.profession || '',
    });

    // طباعة بيانات المستخدم للتشخيص
    console.log('User data loaded in Profile component:', {
      name: user.name,
      email: user.email,
      country_code: user.country_code,
      phone: user.phone,
      bio: user.bio,
      language: user.language,
      website: user.website,
      gender: user.gender,
      birth_date: user.birth_date,
      profession: user.profession,
    });



    setIsFormInitialized(true);

    // طباعة بيانات النموذج بعد التهيئة
    setTimeout(() => {
      console.log('Form data after initialization:', formData);
    }, 100);
  }, [user, navigate]);

  // Update language when i18n language changes
  useEffect(() => {
    setLanguage(i18n.language === 'ar' ? 'ar' : 'en');
  }, [i18n.language]);

  // تحديث البيانات فقط عند تغيير الصورة الشخصية
  useEffect(() => {
    // نتحقق فقط من تغيير الصورة الشخصية لتجنب التحديثات المتكررة
    if (user && isFormInitialized && !isAvatarUpdating && user.avatar) {
      // لا نقوم بأي عمليات إضافية هنا، فقط نعتمد على إعادة العرض التلقائية للصورة
    }
  }, [user?.avatar, isFormInitialized, isAvatarUpdating]);

  // وظيفة لجلب سجلات التشخيص
  const fetchDebugLogs = async () => {
    if (!user) return;

    setIsLoadingLogs(true);
    try {
      const logs = await getDebugLogs(user.id, 20);
      if (logs) {
        setDebugLogs(logs);
        setShowDebugLogs(true);
      } else {
        setErrorMessage(language === 'ar' ? 'فشل في جلب سجلات التشخيص' : 'Failed to fetch debug logs');
        setTimeout(() => setErrorMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error fetching debug logs:', error);
      setErrorMessage(language === 'ar' ? 'خطأ في جلب سجلات التشخيص' : 'Error fetching debug logs');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setIsLoadingLogs(false);
    }
  };









  // تحميل البيانات عند تحميل الصفحة
  useEffect(() => {
    if (user) {
      // تنظيف أي بيانات قديمة
      localStorage.removeItem('profile_sync_message');
      localStorage.removeItem('profile_sync_timestamp');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage('');

    // طباعة بيانات النموذج عند الإرسال
    console.log('Form data on submit:', formData);



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

      // تحديث البروفايل باستخدام وظيفة updateProfile
      if (user) {
        console.log('Updating profile using authStore updateProfile function');
      }

      // إذا فشلت الطريقة المباشرة، نستخدم الطريقة العادية
      try {
        // استدعاء وظيفة تحديث الملف الشخصي
        const result = await updateProfile(updatedData);

        // تحديث النموذج بالبيانات المحدثة إذا كانت النتيجة متوفرة
        if (result) {
          setFormData(prevData => ({
            ...prevData,
            name: result.name || prevData.name,
            country_code: result.country_code || prevData.country_code,
            phone: result.phone || prevData.phone,
            bio: result.bio || prevData.bio,
            language: result.language || prevData.language,
            website: result.website || prevData.website,
            gender: result.gender || prevData.gender,
            birth_date: result.birth_date || prevData.birth_date,
            profession: result.profession || prevData.profession
          }));
        }

        // عرض رسالة نجاح
        setSuccessMessage(language === 'ar' ? 'تم تحديث الملف الشخصي بنجاح' : 'Profile updated successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (updateError: any) {
        console.error('Error from updateProfile:', updateError);

        // إذا كان الخطأ هو "Auth session missing"، فسنقوم بمحاولة تحديث البيانات بطريقة أخرى
        if (updateError.message?.includes('Auth session missing')) {
          console.log('Auth session missing, trying alternative update method');

          // تحديث الحالة المحلية أولاً
          if (user) {
            const updatedUser = {
              ...user,
              ...updatedData
            };

            // تخزين البيانات في localStorage
            try {
              localStorage.setItem(`profile_${user.id}`, JSON.stringify(updatedUser));
              console.log('Profile data stored in localStorage');
            } catch (storageError) {
              console.warn('Could not store profile in localStorage:', storageError);
            }

            // Intentamos actualizar el perfil usando la función updateProfile del authStore
            try {
              console.log('Trying to update profile using authStore updateProfile function');

              // Intentamos actualizar el perfil en la base de datos
              const result = await updateProfile(updatedData);

              if (result) {
                console.log('Profile updated successfully via authStore:', result);
                setSuccessMessage(language === 'ar' ? 'تم تحديث الملف الشخصي بنجاح' : 'Profile updated successfully');
              } else {
                console.warn('authStore update returned no result');
                setSuccessMessage(language === 'ar' ? 'تم تحديث الملف الشخصي محليًا' : 'Profile updated locally');
              }
            } catch (updateError) {
              console.warn('Error using authStore updateProfile:', updateError);
              setSuccessMessage(language === 'ar' ? 'تم تحديث الملف الشخصي محليًا' : 'Profile updated locally');
            }

            setTimeout(() => setSuccessMessage(''), 3000);
          }
        } else {
          // إذا كان هناك خطأ آخر، نعرض رسالة الخطأ
          throw updateError;
        }
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);

      // عرض رسالة خطأ أكثر ودية
      setErrorMessage(language === 'ar' ? 'حدث خطأ أثناء تحديث الملف الشخصي' : 'Error updating profile');
      setTimeout(() => setErrorMessage(''), 3000);

      // محاولة تخزين البيانات في localStorage على الأقل
      if (user) {
        try {
          const localUpdatedUser = {
            ...user,
            ...formData,
            updated_at: new Date().toISOString()
          };

          localStorage.setItem(`profile_${user.id}`, JSON.stringify(localUpdatedUser));

          // عرض رسالة نجاح
          setSuccessMessage(language === 'ar' ? 'تم تحديث الملف الشخصي محليًا فقط' : 'Profile updated locally only');
          setTimeout(() => setSuccessMessage(''), 3000);
        } catch (storageError) {
          console.warn('Could not store profile in localStorage:', storageError);
        }
      }
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

    // إنشاء نسخة احتياطية تلقائية قبل تحديث الصورة الشخصية
    if (user) {
      try {
        const storedProfile = localStorage.getItem(`profile_${user.id}`);
        if (storedProfile) {
          const backupDate = new Date().toISOString().replace(/:/g, '-');
          localStorage.setItem(`profile_backup_${user.id}_${backupDate}`, storedProfile);
          console.log('Created automatic backup before avatar update');


        }
      } catch (backupError) {
        console.warn('Failed to create automatic backup before avatar update:', backupError);
      }
    }

    try {
      // تحميل الصورة مباشرة
      const imageUrl = await uploadProfileImage(file);

      if (imageUrl) {
        setSuccessMessage(language === 'ar' ? 'تم تحديث الصورة الشخصية بنجاح' : 'Profile picture updated successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        alert(language === 'ar' ? 'فشل تحميل الصورة. يرجى المحاولة مرة أخرى.' : 'Image upload failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Error updating avatar:', error);
      alert(language === 'ar' ? 'خطأ في تحميل الصورة. سيتم استخدام الصورة الحالية أو الافتراضية.' : 'Error uploading image. Current avatar or default will be used.');
    } finally {
      // إعادة تعيين حقل الملف
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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

            {errorMessage && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {errorMessage}
              </div>
            )}

            {/* إضافة تنبيه حذف الحساب */}
            <DeletionAlert />



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
                {(() => {
                  console.log('User country_code in render:', user.country_code);
                  return user.country_code ? (
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <MapPin className={`h-3.5 w-3.5 ${language === 'ar' ? 'ml-1' : 'mr-1'}`} />
                      {(() => {
                        const country = countries.find(c => c.code === user.country_code);
                        console.log('Displaying country for code:', user.country_code);
                        console.log('Found country:', country);
                        const countryName = country?.name || user.country_code;
                        console.log('Displaying country name:', countryName);
                        return countryName;
                      })()}
                    </div>
                  ) : null;
                })()}
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
                    onChange={(e) => {
                      const newCountryCode = e.target.value;
                      console.log('Country changed to:', newCountryCode);

                      // تحديث النموذج
                      setFormData(prevData => {
                        const updatedData = { ...prevData, country_code: newCountryCode };
                        console.log('Updated form data:', updatedData);
                        return updatedData;
                      });

                      // تحديث البيانات في localStorage مباشرة
                      if (user && user.id && typeof window !== 'undefined') {
                        const storedProfileStr = localStorage.getItem(`profile_${user.id}`);
                        if (storedProfileStr) {
                          try {
                            const storedProfile = JSON.parse(storedProfileStr);
                            storedProfile.country_code = newCountryCode;
                            localStorage.setItem(`profile_${user.id}`, JSON.stringify(storedProfile));
                            console.log('Updated country_code in localStorage to:', newCountryCode);
                          } catch (error) {
                            console.error('Error updating localStorage:', error);
                          }
                        }
                      }
                    }}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${language === 'ar' ? 'text-right' : 'text-left'}`}
                  >
                    {(() => {
                      console.log('Rendering country dropdown with selected value:', formData.country_code);
                      return countries.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.flag} {country.name}
                        </option>
                      ));
                    })()}
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

                {/* <div>
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
                </div> */}

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

              <div className="flex flex-col space-y-4">
                <div className="flex justify-between">


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


              </div>
            </form>
          </div>
        </div>

        {/* Report Issue Section */}
        <div className="mt-8 max-w-3xl mx-auto">
          <ReportIssue userEmail={user.email} />
        </div>

        {/* Debug Logs Section */}
        {/* <div className="mt-8 max-w-3xl mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {language === 'ar' ? 'سجلات التشخيص' : 'Debug Logs'}
              </h2>
              <button
                onClick={showDebugLogs ? () => setShowDebugLogs(false) : fetchDebugLogs}
                disabled={isLoadingLogs}
                className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingLogs ? (
                  <>
                    <Loader className={`animate-spin h-4 w-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                    {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                  </>
                ) : showDebugLogs ? (
                  <>
                    <AlertCircle className={`h-4 w-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                    {language === 'ar' ? 'إخفاء السجلات' : 'Hide Logs'}
                  </>
                ) : (
                  <>
                    <Bug className={`h-4 w-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                    {language === 'ar' ? 'عرض السجلات' : 'Show Logs'}
                  </>
                )}
              </button>
            </div>

            {errorMessage && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {errorMessage}
              </div>
            )}

            {showDebugLogs && (
              <div className="mt-4">
                {debugLogs.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    {language === 'ar' ? 'لا توجد سجلات متاحة' : 'No logs available'}
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {language === 'ar' ? 'العملية' : 'Operation'}
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {language === 'ar' ? 'الملاحظات' : 'Notes'}
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {language === 'ar' ? 'التاريخ' : 'Date'}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {debugLogs.map((log) => (
                          <tr key={log.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {log.operation}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {log.notes}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(log.created_at).toLocaleString(language === 'ar' ? 'ar-SA' : 'en', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                calendar: 'gregory'
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Profile;
