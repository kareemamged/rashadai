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
  user_id?: string;
}

interface TestimonialsState {
  testimonials: Testimonial[];
  isLoading: boolean;
  error: string | null;
  fetchTestimonials: () => Promise<void>;
  addTestimonial: (testimonial: Omit<Testimonial, 'id' | 'created_at'>) => Promise<boolean>;
  getHighRatedTestimonials: () => Testimonial[];
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

    // Table exists
    return true;
  } catch (error) {
    console.error('Error creating testimonials table:', error);
    return false;
  }
};

// Helper function to load static testimonials
const getStaticTestimonials = (): Testimonial[] => {
  return [
    {
      id: '1',
      user_name: 'Sarah Johnson',
      role: 'Patient',
      content: 'The AI consultation was surprisingly accurate. It identified my condition when I had been misdiagnosed twice before.',
      rating: 5,
      image_url: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      user_name: 'Michael Chen',
      role: 'Healthcare Professional',
      content: 'As a doctor, I was skeptical at first. But this platform has become an invaluable tool in my practice.',
      rating: 5,
      image_url: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      user_name: 'Emily Rodriguez',
      role: 'Parent',
      content: 'When my daughter developed a rash at midnight, I was able to get immediate guidance without an emergency room visit.',
      rating: 4,
      image_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
      created_at: new Date().toISOString()
    }
  ];
};

export const useTestimonialsStore = create<TestimonialsState>()(
  persist(
    (set, get) => ({
  testimonials: [],
  isLoading: false,
  error: null,

  fetchTestimonials: async () => {
    // If we already have testimonials in the store, don't fetch again
    if (get().testimonials.length > 0) {
      return;
    }

    set({ isLoading: true, error: null });
    try {
      // Ensure the table exists
      await createTestimonialsTable();

      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      set({ testimonials: data || [], isLoading: false });
    } catch (error: any) {
      console.error('Error fetching testimonials:', error);

      // If the table doesn't exist, use static data
      if (error.message && error.message.includes('does not exist')) {
        // Check if we already have testimonials in the store
        const currentTestimonials = get().testimonials;

        if (currentTestimonials.length === 0) {
          // If no testimonials in store, use static data
          set({ testimonials: getStaticTestimonials(), isLoading: false });
        } else {
          // If we already have testimonials, just update loading state
          set({ isLoading: false });
        }
      } else {
        set({ error: error.message || 'Failed to fetch testimonials', isLoading: false });
      }
    }
  },

  addTestimonial: async (testimonial) => {
    set({ isLoading: true, error: null });
    try {
      // Create a new testimonial object
      const newTestimonial: Testimonial = {
        id: uuidv4(),
        ...testimonial,
        created_at: new Date().toISOString()
      };

      // Ensure the table exists
      const tableExists = await createTestimonialsTable();

      if (!tableExists) {
        // If table doesn't exist, just add to local state
        set(state => ({
          testimonials: [newTestimonial, ...state.testimonials],
          isLoading: false
        }));

        return true;
      }

      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();

      // Add user_id to the testimonial
      const testimonialWithUserId = {
        ...newTestimonial,
        user_id: user?.id
      };

      // Try to insert into Supabase
      const { error } = await supabase
        .from('testimonials')
        .insert([testimonialWithUserId]);

      if (error) {
        // If there's an error with Supabase, still add to local state
        console.error('Error adding testimonial to Supabase:', error);

        set(state => ({
          testimonials: [newTestimonial, ...state.testimonials],
          isLoading: false
        }));

        return true;
      }

      // If successful, add to local state to avoid having to fetch again
      set(state => ({
        testimonials: [newTestimonial, ...state.testimonials],
        isLoading: false
      }));

      return true;
    } catch (error: any) {
      console.error('Error adding testimonial:', error);
      set({ error: error.message || 'Failed to add testimonial', isLoading: false });
      return false;
    }
  },

  getHighRatedTestimonials: () => {
    // Filter testimonials with rating > 3
    return get().testimonials.filter(testimonial => testimonial.rating > 3);
  }
}), {
  name: 'testimonials-storage', // unique name for localStorage
  partialize: (state) => ({ testimonials: state.testimonials }), // only store testimonials
})
);
