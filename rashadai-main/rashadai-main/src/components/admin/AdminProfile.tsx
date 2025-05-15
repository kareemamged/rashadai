import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '../../store/languageStore';
import { useAdminAuthStore, AdminUser } from '../../store/adminAuthStore';
import { supabase } from '../../lib/supabase';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Save,
  Upload,
  Loader,
  AlertCircle,
  CheckCircle,
  Users
} from 'lucide-react';

const AdminProfile: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const { adminUser, setAdminUser } = useAdminAuthStore();
  const isRTL = language === 'ar';

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Profile data
  const [name, setName] = useState(adminUser?.name || '');
  const [gender, setGender] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [primaryPhone, setPrimaryPhone] = useState<string>('');
  const [secondaryPhone, setSecondaryPhone] = useState<string>('');
  const [avatar, setAvatar] = useState<string>(adminUser?.avatar || '');

  // File upload
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (adminUser) {
      loadAdminData();
    }
  }, [adminUser]);

  const loadAdminData = async () => {
    if (!adminUser) return;

    setIsLoading(true);
    setError(null);

    try {
      // Use the RPC function to get admin profile data
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_admin_profile', {
        p_admin_id: adminUser.id
      });

      if (rpcError) {
        console.error('Error fetching admin data via RPC:', rpcError);
        setError(t('admin.profile.loadError', 'Error loading profile data'));

        // Fallback to using the store data
        setName(adminUser.name || '');
        setAvatar(adminUser.avatar || '');
        return;
      }

      if (rpcData && rpcData.success) {
        const profileData = rpcData.data;
        setName(profileData.name || '');
        setGender(profileData.gender || '');
        setAge(profileData.age ? profileData.age.toString() : '');
        setPrimaryPhone(profileData.primary_phone || '');
        setSecondaryPhone(profileData.secondary_phone || '');
        setAvatar(profileData.avatar || '');
      } else {
        // Fallback to direct query with admin authentication
        console.log('RPC function failed, trying direct query...');

        try {
          // Fetch admin data from database using a direct SQL query
          const { data: sqlData, error: sqlError } = await supabase.rpc('execute_admin_query', {
            query_text: `SELECT * FROM admin_users WHERE id = '${adminUser.id}'`
          });

          if (sqlError) {
            console.error('Error fetching admin data via SQL:', sqlError);
            // Use data from the store as fallback
            setName(adminUser.name || '');
            setAvatar(adminUser.avatar || '');
          } else if (sqlData && sqlData.length > 0) {
            const data = sqlData[0];
            setName(data.name || '');
            setGender(data.gender || '');
            setAge(data.age ? data.age.toString() : '');
            setPrimaryPhone(data.primary_phone || '');
            setSecondaryPhone(data.secondary_phone || '');
            setAvatar(data.avatar || '');
          }
        } catch (sqlErr) {
          console.error('Exception in SQL query:', sqlErr);
          // Use data from the store as fallback
          setName(adminUser.name || '');
          setAvatar(adminUser.avatar || '');
        }
      }
    } catch (err) {
      console.error('Exception in loadAdminData:', err);
      setError(t('admin.profile.loadError', 'Error loading profile data'));

      // Use data from the store as fallback
      setName(adminUser.name || '');
      setAvatar(adminUser.avatar || '');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!adminUser) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Use the RPC function to update admin profile
      const { data: rpcData, error: rpcError } = await supabase.rpc('update_admin_profile', {
        p_admin_id: adminUser.id,
        p_name: name,
        p_gender: gender,
        p_age: age ? parseInt(age) : null,
        p_primary_phone: primaryPhone,
        p_secondary_phone: secondaryPhone,
        p_avatar: avatar
      });

      if (rpcError) {
        console.error('Error updating admin data via RPC:', rpcError);
        setError(t('admin.profile.saveError', 'Error saving profile data'));
        return;
      }

      if (rpcData && rpcData.success) {
        // Update admin user in store
        const updatedAdmin: AdminUser = {
          ...adminUser,
          name: name,
          avatar: avatar,
          gender: gender,
          age: age ? parseInt(age) : undefined,
          primary_phone: primaryPhone,
          secondary_phone: secondaryPhone
        };

        setAdminUser(updatedAdmin);
        setSuccess(t('admin.profile.saveSuccess', 'Profile updated successfully'));

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        // Fallback to direct query with admin authentication
        console.log('RPC function failed, trying direct query...');

        try {
          // Update admin data using a direct SQL query
          const updateQuery = `
            UPDATE admin_users
            SET
              name = '${name.replace(/'/g, "''")}',
              gender = ${gender ? `'${gender.replace(/'/g, "''")}'` : 'NULL'},
              age = ${age ? parseInt(age) : 'NULL'},
              primary_phone = ${primaryPhone ? `'${primaryPhone.replace(/'/g, "''")}'` : 'NULL'},
              secondary_phone = ${secondaryPhone ? `'${secondaryPhone.replace(/'/g, "''")}'` : 'NULL'},
              avatar = ${avatar ? `'${avatar.replace(/'/g, "''")}'` : 'NULL'},
              updated_at = NOW()
            WHERE id = '${adminUser.id}'
            RETURNING *
          `;

          const { data: sqlData, error: sqlError } = await supabase.rpc('execute_admin_query', {
            query_text: updateQuery
          });

          if (sqlError) {
            console.error('Error updating admin data via SQL:', sqlError);
            setError(t('admin.profile.saveError', 'Error saving profile data'));
            return;
          }

          if (sqlData && sqlData.length > 0) {
            // Update admin user in store
            const updatedAdmin: AdminUser = {
              ...adminUser,
              name: name,
              avatar: avatar,
              gender: gender,
              age: age ? parseInt(age) : undefined,
              primary_phone: primaryPhone,
              secondary_phone: secondaryPhone
            };

            setAdminUser(updatedAdmin);
            setSuccess(t('admin.profile.saveSuccess', 'Profile updated successfully'));

            // Clear success message after 3 seconds
            setTimeout(() => {
              setSuccess(null);
            }, 3000);
          } else {
            setError(t('admin.profile.saveError', 'Error saving profile data'));
          }
        } catch (sqlErr) {
          console.error('Exception in SQL query:', sqlErr);
          setError(t('admin.profile.saveError', 'Error saving profile data'));
        }
      }
    } catch (err) {
      console.error('Exception in handleSave:', err);
      setError(t('admin.profile.saveError', 'Error saving profile data'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !adminUser) return;

    setIsUploading(true);
    setError(null);

    try {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError(t('admin.profile.fileSizeError', 'Image size should be less than 5MB'));
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setError(t('admin.profile.fileTypeError', 'Only image files are allowed'));
        return;
      }

      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${adminUser.id}/${Date.now()}.${fileExt}`;

      // Try multiple methods to upload the image
      let uploadSuccess = false;
      let publicUrl = '';

      // Method 1: Try uploading to Supabase Storage
      try {
        const { data, error } = await supabase.storage
          .from('avatars')
          .upload(`admin/${fileName}`, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (!error) {
          // Get public URL
          const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(`admin/${fileName}`);

          if (urlData && urlData.publicUrl) {
            publicUrl = urlData.publicUrl;
            uploadSuccess = true;
            console.log('Image uploaded successfully to Supabase Storage');
          }
        } else {
          console.warn('Error uploading to Supabase Storage:', error);
        }
      } catch (storageError) {
        console.warn('Exception in Supabase Storage upload:', storageError);
      }

      // Method 2: If Supabase Storage failed, convert to data URL
      if (!uploadSuccess) {
        try {
          console.log('Falling back to data URL method');
          const reader = new FileReader();

          // Create a promise to wait for the FileReader
          const dataUrlPromise = new Promise<string>((resolve, reject) => {
            reader.onload = () => {
              if (typeof reader.result === 'string') {
                resolve(reader.result);
              } else {
                reject(new Error('FileReader result is not a string'));
              }
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
          });

          // Wait for the data URL
          publicUrl = await dataUrlPromise;
          uploadSuccess = true;
          console.log('Image converted to data URL successfully');
        } catch (dataUrlError) {
          console.warn('Error converting to data URL:', dataUrlError);
        }
      }

      // Method 3: If all else fails, use a default avatar URL
      if (!uploadSuccess) {
        console.log('Falling back to default avatar URL');
        publicUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || adminUser.name || adminUser.email)}&background=random`;
        uploadSuccess = true;
      }

      // Update the avatar state
      if (uploadSuccess) {
        setAvatar(publicUrl);
      } else {
        setError(t('admin.profile.uploadError', 'Error uploading image'));
      }
    } catch (err) {
      console.error('Exception in handleFileChange:', err);
      setError(t('admin.profile.uploadError', 'Error uploading image'));
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (!adminUser) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold mb-6">{t('admin.profile.title', 'Admin Profile')}</h1>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Avatar Section */}
        <div className="md:col-span-1">
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              {avatar ? (
                <img
                  src={avatar}
                  alt={name || 'Admin'}
                  className="h-40 w-40 rounded-full object-cover border-4 border-blue-100"
                />
              ) : (
                <div className="h-40 w-40 rounded-full bg-blue-600 flex items-center justify-center text-white text-4xl">
                  {(name || adminUser.email || 'A').charAt(0).toUpperCase()}
                </div>
              )}

              {isUploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <Loader className="h-10 w-10 text-white animate-spin" />
                </div>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            <button
              type="button"
              onClick={triggerFileInput}
              disabled={isUploading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
            >
              <Upload className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t('admin.profile.uploadAvatar', 'Upload Avatar')}
            </button>
          </div>
        </div>

        {/* Profile Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div className="col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.profile.name', 'Name')}
                </label>
                <div className="relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                    placeholder={t('admin.profile.namePlaceholder', 'Enter your name')}
                  />
                </div>
              </div>

              {/* Email (Read-only) */}
              <div className="col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.profile.email', 'Email')}
                </label>
                <div className="relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={adminUser.email}
                    readOnly
                    className="bg-gray-50 focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.profile.gender', 'Gender')}
                </label>
                <div className="relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">{t('admin.profile.selectGender', 'Select gender')}</option>
                    <option value="male">{t('common.male', 'Male')}</option>
                    <option value="female">{t('common.female', 'Female')}</option>
                    <option value="other">{t('common.other', 'Other')}</option>
                  </select>
                </div>
              </div>

              {/* Age */}
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.profile.age', 'Age')}
                </label>
                <div className="relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    id="age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    min="0"
                    max="120"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                    placeholder={t('admin.profile.agePlaceholder', 'Enter your age')}
                  />
                </div>
              </div>

              {/* Primary Phone */}
              <div>
                <label htmlFor="primaryPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.profile.primaryPhone', 'Primary Phone')}
                </label>
                <div className="relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="primaryPhone"
                    value={primaryPhone}
                    onChange={(e) => setPrimaryPhone(e.target.value)}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                    placeholder={t('admin.profile.phonePlaceholder', 'Enter your phone number')}
                  />
                </div>
              </div>

              {/* Secondary Phone */}
              <div>
                <label htmlFor="secondaryPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.profile.secondaryPhone', 'Secondary Phone')}
                </label>
                <div className="relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="secondaryPhone"
                    value={secondaryPhone}
                    onChange={(e) => setSecondaryPhone(e.target.value)}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                    placeholder={t('admin.profile.alternatePhonePlaceholder', 'Enter alternate phone number')}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
              >
                {isSaving ? (
                  <>
                    <Loader className={`animate-spin h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t('common.saving', 'Saving...')}
                  </>
                ) : (
                  <>
                    <Save className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t('common.save', 'Save')}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
