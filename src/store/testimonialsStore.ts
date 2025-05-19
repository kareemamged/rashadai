import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export interface Testimonial {
  id: string;
  user_name: string;
  role: string;
  content: string;
  rating: number;
  image_url: string;
  created_at: string;
  updated_at?: string;
  user_id?: string;
  approved?: boolean;
  status?: 'approved' | 'pending';
}

interface TestimonialsState {
  testimonials: Testimonial[];
  isLoading: boolean;
  error: string | null;
  fetchTestimonials: (includeAll?: boolean) => Promise<void>;
  addTestimonial: (testimonial: Omit<Testimonial, 'id' | 'created_at'>) => Promise<boolean>;
  getHighRatedTestimonials: () => Testimonial[];
  approveTestimonial: (id: string) => Promise<boolean>;
  disapproveTestimonial: (id: string) => Promise<boolean>;
  deleteTestimonial: (id: string) => Promise<boolean>;
  updateTestimonial: (id: string, testimonial: Partial<Testimonial>) => Promise<boolean>;
}

// Create the testimonials table if it doesn't exist
const createTestimonialsTable = async (): Promise<boolean> => {
  try {
    // Check if the table exists
    const { error: checkError } = await supabase
      .from('testimonials')
      .select('id')
      .limit(1);

    // If there's an error and it's because the table doesn't exist
    if (checkError && checkError.message.includes('does not exist')) {
      // Since we can't create tables directly through the client API,
      // we'll need to use the Supabase dashboard to create the table.
      // For now, we'll just return false.
      console.error('Testimonials table does not exist. Please create it in the Supabase dashboard.');
      return false;
    } else if (checkError) {
      console.error('Error checking testimonials table:', checkError);
      return false;
    }

    // Table exists, now check if it has all required columns
    try {
      // Try to select a record with minimal columns first to check what exists
      try {
        const { error: minimalColumnsError } = await supabase
          .from('testimonials')
          .select('id, user_name, content, rating, created_at')
          .limit(1);

        if (minimalColumnsError) {
          console.error('Error checking testimonials table minimal columns:', minimalColumnsError);
          if (minimalColumnsError.message && minimalColumnsError.message.includes('does not exist')) {
            console.warn('Testimonials table does not exist. Using local storage only.');
            return false;
          }
          return false;
        }

        // Table exists with minimal columns, now let's check which additional columns exist
        console.log('Testimonials table exists with minimal columns. Checking additional columns...');
        return true;
      } catch (error) {
        console.error('Error checking testimonials table:', error);
        return false;
      }
    } catch (columnsError) {
      console.error('Error checking testimonials table columns:', columnsError);
      return false;
    }

    // Table exists and has all required columns
    return true;
  } catch (error) {
    console.error('Error creating testimonials table:', error);
    return false;
  }
};

// المتغير العام للتقييمات الافتراضية
const defaultTestimonials: Testimonial[] = [
  {
    id: 'default-1',
    user_name: 'Sarah Johnson',
    role: 'Patient',
    content: 'The AI consultation was surprisingly accurate. It identified my condition when I had been misdiagnosed twice before.',
    rating: 5,
    image_url: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg',
    created_at: new Date().toISOString(),
    approved: true,
    status: 'approved'
  },
  {
    id: 'default-2',
    user_name: 'Michael Chen',
    role: 'Healthcare Professional',
    content: 'As a doctor, I was skeptical at first. But this platform has become an invaluable tool in my practice.',
    rating: 5,
    image_url: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
    created_at: new Date().toISOString(),
    approved: false,
    status: 'pending'
  },
  {
    id: 'default-3',
    user_name: 'Emily Rodriguez',
    role: 'Parent',
    content: 'When my daughter developed a rash at midnight, I was able to get immediate guidance without an emergency room visit.',
    rating: 4,
    image_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
    created_at: new Date().toISOString(),
    approved: true,
    status: 'approved'
  },
  {
    id: 'default-4',
    user_name: 'test',
    role: 'Guest',
    content: 'تقييم تجريبي',
    rating: 5,
    image_url: 'https://ui-avatars.com/api/?name=test&background=random',
    created_at: new Date().toISOString(),
    approved: false,
    status: 'pending'
  }
];

// Helper function to load static testimonials
const getStaticTestimonials = (): Testimonial[] => {
  return defaultTestimonials;
};

export const useTestimonialsStore = create<TestimonialsState>()(
  persist(
    (set, get) => ({
  testimonials: defaultTestimonials, // استخدام التقييمات الافتراضية كقيمة أولية
  isLoading: false,
  error: null,

  fetchTestimonials: async (includeAll = false) => {
    set({ isLoading: true, error: null });
    try {
      console.log('Fetching testimonials, includeAll:', includeAll);

      // قائمة لتخزين التقييمات المحذوفة
      const deletedIds = new Set<string>();

      // قائمة لتخزين جميع التقييمات
      let allTestimonials: Testimonial[] = [];

      // محاولة استرجاع قائمة التقييمات المحذوفة من localStorage
      try {
        const deletedKey = 'testimonials-deleted-ids';
        const deletedData = localStorage.getItem(deletedKey);

        if (deletedData) {
          const parsedDeletedIds = JSON.parse(deletedData);
          if (Array.isArray(parsedDeletedIds)) {
            parsedDeletedIds.forEach(id => deletedIds.add(id));
            console.log('Found deleted testimonials IDs:', deletedIds.size);
          }
        }
      } catch (error) {
        console.error('Error reading deleted IDs from localStorage:', error);
      }

      // إضافة التقييمات الافتراضية التي لم يتم حذفها
      defaultTestimonials.forEach(testimonial => {
        if (!deletedIds.has(testimonial.id)) {
          allTestimonials.push(testimonial);
        }
      });

      console.log('Added non-deleted default testimonials:', allTestimonials.length);

      // محاولة استرجاع التقييمات من localStorage
      try {
        // أولاً نتحقق من مفتاح localStorage المخصص
        const localStorageKey = 'testimonials-data';
        let storedData = localStorage.getItem(localStorageKey);

        if (storedData) {
          // تنسيق مباشر
          const parsedData = JSON.parse(storedData);
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            console.log('Found testimonials in direct localStorage:', parsedData.length);

            // إضافة التقييمات المخزنة التي لم يتم حذفها
            parsedData.forEach(testimonial => {
              if (!deletedIds.has(testimonial.id)) {
                // تجنب التكرار
                if (!allTestimonials.some(t => t.id === testimonial.id)) {
                  allTestimonials.push(testimonial);
                }
              }
            });

            console.log('Combined testimonials count after adding from localStorage:', allTestimonials.length);
          }
        } else {
          // محاولة استخدام تنسيق persist كبديل
          const persistKey = 'testimonials-storage';
          storedData = localStorage.getItem(persistKey);

          if (storedData) {
            const parsedData = JSON.parse(storedData);
            if (parsedData && parsedData.state && parsedData.state.testimonials) {
              console.log('Found testimonials in persist localStorage:', parsedData.state.testimonials.length);

              // إضافة التقييمات المخزنة التي لم يتم حذفها
              parsedData.state.testimonials.forEach(testimonial => {
                if (!deletedIds.has(testimonial.id)) {
                  // تجنب التكرار
                  if (!allTestimonials.some(t => t.id === testimonial.id)) {
                    allTestimonials.push(testimonial);
                  }
                }
              });

              console.log('Combined testimonials count after adding from persist storage:', allTestimonials.length);

              // حفظ بتنسيق مباشر للاستخدام المستقبلي
              localStorage.setItem(localStorageKey, JSON.stringify(allTestimonials));
            }
          }
        }
      } catch (localStorageError) {
        console.error('Error reading from localStorage:', localStorageError);
      }

      // Ensure the table exists for Supabase operations
      const tableExists = await createTestimonialsTable();

      if (!tableExists) {
        // If table doesn't exist or has issues, use merged data from localStorage
        console.warn('Supabase table not available, using local data for testimonials');

        // Sort by created_at date (newest first)
        allTestimonials.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        set({ testimonials: allTestimonials, isLoading: false });
        return;
      }

      try {
        // Try to fetch from Supabase as well
        const { data: minimalData, error: minimalError } = await supabase
          .from('testimonials')
          .select('id, user_name, content, rating, created_at')
          .order('created_at', { ascending: false });

        if (minimalError) {
          console.error('Error fetching testimonials from Supabase:', minimalError);
          throw minimalError;
        }

        console.log('Successfully fetched testimonials from Supabase:', minimalData?.length || 0);

        // Process the Supabase data and add default values for missing fields
        const processedData = minimalData?.map(testimonial => ({
          ...testimonial,
          role: testimonial.role || '',  // Default empty role
          image_url: testimonial.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.user_name)}&background=random`,
          approved: true,  // Default to approved for display
          status: 'approved'
        })) || [];

        // Merge Supabase data with local testimonials, avoiding duplicates
        if (processedData.length > 0) {
          const existingIds = new Set(allTestimonials.map(t => t.id));
          processedData.forEach(testimonial => {
            if (!existingIds.has(testimonial.id)) {
              allTestimonials.push(testimonial);
              existingIds.add(testimonial.id);
            }
          });
        }
      } catch (fetchError) {
        console.error('Error fetching testimonials from Supabase:', fetchError);
        // Continue with local data
      }

      // Sort by created_at date (newest first)
      allTestimonials.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      console.log('Final testimonials count:', allTestimonials.length);

      // Save the combined data to localStorage for future use
      const localStorageKey = 'testimonials-data';
      localStorage.setItem(localStorageKey, JSON.stringify(allTestimonials));

      // Update the store
      set({ testimonials: allTestimonials, isLoading: false });
    } catch (error: any) {
      console.error('Error in testimonials fetch process:', error);

      // Use default testimonials as fallback
      console.log('Using default testimonials as ultimate fallback');
      set({
        testimonials: defaultTestimonials,
        error: error.message || 'Failed to fetch testimonials',
        isLoading: false
      });
    }
  },

  addTestimonial: async (testimonial) => {
    set({ isLoading: true, error: null });
    try {
      // Create a new testimonial object with a unique ID
      const newTestimonial: Testimonial = {
        id: uuidv4(),
        ...testimonial,
        created_at: new Date().toISOString(),
        approved: false, // New testimonials start as pending
        status: 'pending'
      };

      console.log('Adding new testimonial:', newTestimonial);

      // Try to add to Supabase first
      let supabaseSuccess = false;

      try {
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();

        // Add user_id to the testimonial if user exists
        const testimonialWithUserId = {
          ...newTestimonial,
          user_id: user?.id
        };

        // Use only the minimal columns that we know exist
        const minimalTestimonial = {
          id: testimonialWithUserId.id,
          user_name: testimonialWithUserId.user_name,
          content: testimonialWithUserId.content,
          rating: testimonialWithUserId.rating,
          created_at: testimonialWithUserId.created_at
        };

        console.log('Trying to insert testimonial to Supabase:', minimalTestimonial);

        const { error: minimalError } = await supabase
          .from('testimonials')
          .insert([minimalTestimonial]);

        if (minimalError) {
          console.error('Error inserting testimonial to Supabase:', minimalError);
          throw minimalError;
        } else {
          console.log('Successfully inserted testimonial to Supabase');
          supabaseSuccess = true;
        }
      } catch (dbError) {
        console.error('Failed to add testimonial to Supabase, will use local storage instead:', dbError);
        // Continue with local storage
      }

      // Get current testimonials
      const currentTestimonials = get().testimonials;

      // Add new testimonial to the beginning of the array
      const updatedTestimonials = [newTestimonial, ...currentTestimonials];

      // Update state
      set({
        testimonials: updatedTestimonials,
        isLoading: false
      });

      // Save to localStorage manually to ensure persistence
      const localStorageKey = 'testimonials-data';
      localStorage.setItem(localStorageKey, JSON.stringify(updatedTestimonials));

      // إزالة معرف التقييم من قائمة التقييمات المحذوفة إذا كان موجوداً
      try {
        const deletedKey = 'testimonials-deleted-ids';
        const deletedData = localStorage.getItem(deletedKey);

        if (deletedData) {
          const parsedIds = JSON.parse(deletedData);
          if (Array.isArray(parsedIds) && parsedIds.includes(newTestimonial.id)) {
            const updatedIds = parsedIds.filter(id => id !== newTestimonial.id);
            localStorage.setItem(deletedKey, JSON.stringify(updatedIds));
            console.log('Removed testimonial ID from deleted list:', newTestimonial.id);
          }
        }
      } catch (error) {
        console.error('Error updating deleted IDs list:', error);
      }

      console.log('Testimonial added to local state and localStorage');
      return true;
    } catch (error: any) {
      console.error('Error in testimonial submission process:', error);
      set({ error: error.message || 'Failed to add testimonial', isLoading: false });
      return false;
    }
  },

  getHighRatedTestimonials: () => {
    // Filter testimonials with rating > 3 (show all regardless of approval status)
    return get().testimonials.filter(testimonial =>
      testimonial.rating > 3
    );
  },

  approveTestimonial: async (id: string) => {
    try {
      console.log('Approving testimonial:', id);

      // Try to update in Supabase first
      try {
        const { error } = await supabase
          .from('testimonials')
          .update({
            approved: true,
            status: 'approved',
            updated_at: new Date().toISOString()
          })
          .eq('id', id);

        if (error) {
          console.error('Error updating testimonial in Supabase:', error);
          throw error;
        } else {
          console.log('Successfully updated testimonial in Supabase');
        }
      } catch (dbError) {
        // Continue with local update even if Supabase update fails
        console.error('Failed to update testimonial in Supabase, updating locally only:', dbError);
      }

      // Always update local state
      const updatedTestimonials = get().testimonials.map(testimonial =>
        testimonial.id === id ? {
          ...testimonial,
          approved: true,
          status: 'approved',
          updated_at: new Date().toISOString()
        } : testimonial
      );

      // Update state
      set({ testimonials: updatedTestimonials });

      // Save to localStorage manually to ensure persistence
      const localStorageKey = 'testimonials-data';
      localStorage.setItem(localStorageKey, JSON.stringify(updatedTestimonials));

      // إزالة معرف التقييم من قائمة التقييمات المحذوفة إذا كان موجوداً
      try {
        const deletedKey = 'testimonials-deleted-ids';
        const deletedData = localStorage.getItem(deletedKey);

        if (deletedData) {
          const parsedIds = JSON.parse(deletedData);
          if (Array.isArray(parsedIds) && parsedIds.includes(id)) {
            const updatedIds = parsedIds.filter(deletedId => deletedId !== id);
            localStorage.setItem(deletedKey, JSON.stringify(updatedIds));
            console.log('Removed testimonial ID from deleted list when approving:', id);
          }
        }
      } catch (error) {
        console.error('Error updating deleted IDs list:', error);
      }

      console.log('Testimonial approved and saved to localStorage');
      return true;
    } catch (error) {
      console.error('Error approving testimonial:', error);
      return false;
    }
  },

  disapproveTestimonial: async (id: string) => {
    try {
      console.log('Disapproving testimonial:', id);

      // Try to update in Supabase first
      try {
        const { error } = await supabase
          .from('testimonials')
          .update({
            approved: false,
            status: 'pending',
            updated_at: new Date().toISOString()
          })
          .eq('id', id);

        if (error) {
          console.error('Error disapproving testimonial in Supabase:', error);
          throw error;
        } else {
          console.log('Successfully disapproved testimonial in Supabase');
        }
      } catch (dbError) {
        // Continue with local update even if Supabase update fails
        console.error('Failed to disapprove testimonial in Supabase, updating locally only:', dbError);
      }

      // Always update local state
      const updatedTestimonials = get().testimonials.map(testimonial =>
        testimonial.id === id ? {
          ...testimonial,
          approved: false,
          status: 'pending',
          updated_at: new Date().toISOString()
        } : testimonial
      );

      // Update state
      set({ testimonials: updatedTestimonials });

      // Save to localStorage manually to ensure persistence
      const localStorageKey = 'testimonials-data';
      localStorage.setItem(localStorageKey, JSON.stringify(updatedTestimonials));

      // إزالة معرف التقييم من قائمة التقييمات المحذوفة إذا كان موجوداً
      try {
        const deletedKey = 'testimonials-deleted-ids';
        const deletedData = localStorage.getItem(deletedKey);

        if (deletedData) {
          const parsedIds = JSON.parse(deletedData);
          if (Array.isArray(parsedIds) && parsedIds.includes(id)) {
            const updatedIds = parsedIds.filter(deletedId => deletedId !== id);
            localStorage.setItem(deletedKey, JSON.stringify(updatedIds));
            console.log('Removed testimonial ID from deleted list when disapproving:', id);
          }
        }
      } catch (error) {
        console.error('Error updating deleted IDs list:', error);
      }

      console.log('Testimonial disapproved and saved to localStorage');
      return true;
    } catch (error) {
      console.error('Error disapproving testimonial:', error);
      return false;
    }
  },

  deleteTestimonial: async (id: string) => {
    try {
      console.log('Deleting testimonial:', id);

      // حذف التقييم من Supabase أولاً
      let supabaseSuccess = false;
      try {
        // تحقق مما إذا كان الجدول موجودًا أولاً
        const { count, error: checkError } = await supabase
          .from('testimonials')
          .select('*', { count: 'exact', head: true });

        if (!checkError) {
          // الجدول موجود، حاول الحذف
          const { error } = await supabase
            .from('testimonials')
            .delete()
            .eq('id', id);

          if (error) {
            console.error('Error deleting testimonial from Supabase:', error);
          } else {
            console.log('Successfully deleted testimonial from Supabase');
            supabaseSuccess = true;
          }
        } else {
          console.warn('Testimonials table may not exist in Supabase:', checkError);
        }
      } catch (dbError) {
        // نستمر في الحذف المحلي حتى لو فشل الحذف من Supabase
        console.error('Failed to delete testimonial from Supabase, deleting locally only:', dbError);
      }

      // تحديث الحالة المحلية
      const updatedTestimonials = get().testimonials.filter(testimonial => testimonial.id !== id);

      // تحديث الحالة
      set({ testimonials: updatedTestimonials });

      // حفظ في localStorage
      const localStorageKey = 'testimonials-data';
      localStorage.setItem(localStorageKey, JSON.stringify(updatedTestimonials));

      // حذف من localStorage الخاص بـ persist أيضاً
      try {
        const persistKey = 'testimonials-storage';
        const storedData = localStorage.getItem(persistKey);

        if (storedData) {
          const parsedData = JSON.parse(storedData);
          if (parsedData && parsedData.state && parsedData.state.testimonials) {
            // حذف التقييم من مصفوفة التقييمات
            parsedData.state.testimonials = parsedData.state.testimonials.filter(
              testimonial => testimonial.id !== id
            );

            // حفظ البيانات المحدثة
            localStorage.setItem(persistKey, JSON.stringify(parsedData));
            console.log('Testimonial also removed from persist storage');
          }
        }

        // إضافة معرف التقييم إلى قائمة التقييمات المحذوفة
        const deletedKey = 'testimonials-deleted-ids';
        let deletedIds: string[] = [];

        // استرجاع القائمة الحالية
        const deletedData = localStorage.getItem(deletedKey);
        if (deletedData) {
          try {
            const parsedIds = JSON.parse(deletedData);
            if (Array.isArray(parsedIds)) {
              deletedIds = parsedIds;
            }
          } catch (error) {
            console.error('Error parsing deleted IDs:', error);
          }
        }

        // إضافة المعرف الجديد إذا لم يكن موجوداً بالفعل
        if (!deletedIds.includes(id)) {
          deletedIds.push(id);
          localStorage.setItem(deletedKey, JSON.stringify(deletedIds));
          console.log('Added testimonial ID to deleted list:', id);
        }
      } catch (localStorageError) {
        console.error('Error updating persist storage:', localStorageError);
      }

      // تحديث إحصائيات لوحة التحكم
      try {
        // استيراد متجر الإدارة
        const adminStore = await import('../store/adminStore');
        if (adminStore && adminStore.useAdminStore) {
          const { updatePendingReviewsCount, fetchStats } = adminStore.useAdminStore.getState();
          if (typeof updatePendingReviewsCount === 'function') {
            await updatePendingReviewsCount();
          }
          if (typeof fetchStats === 'function') {
            await fetchStats();
          }
          console.log('Updated admin dashboard stats after testimonial deletion');
        }
      } catch (statsError) {
        console.error('Error updating admin stats after testimonial deletion:', statsError);
      }

      console.log('Testimonial deleted and localStorage updated');
      return true;
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      return false;
    }
  },

  updateTestimonial: async (id: string, testimonialUpdate: Partial<Testimonial>) => {
    try {
      // Update in Supabase
      const { error } = await supabase
        .from('testimonials')
        .update({
          ...testimonialUpdate,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      set(state => ({
        testimonials: state.testimonials.map(testimonial =>
          testimonial.id === id ? {
            ...testimonial,
            ...testimonialUpdate,
            updated_at: new Date().toISOString()
          } : testimonial
        )
      }));

      return true;
    } catch (error) {
      console.error('Error updating testimonial:', error);
      return false;
    }
  }
}), {
  name: 'testimonials-storage', // unique name for localStorage
  partialize: (state) => ({ testimonials: state.testimonials }), // only store testimonials
})
);
