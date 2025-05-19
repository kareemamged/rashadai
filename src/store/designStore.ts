import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

// Define types for design settings
export interface DesignSettings {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
    size: 'small' | 'medium' | 'large';
  };
  logo: string;
  favicon: string;
}

// Define types for design themes
export interface DesignTheme extends DesignSettings {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

// Define the design store state
interface DesignState {
  // Settings
  settings: DesignSettings;
  themes: DesignTheme[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: Partial<DesignSettings>) => Promise<void>;
  fetchThemes: () => Promise<void>;
  createTheme: (theme: Omit<DesignTheme, 'id' | 'created_at' | 'updated_at'>) => Promise<string | null>;
  updateTheme: (id: string, theme: Partial<DesignTheme>) => Promise<void>;
  deleteTheme: (id: string) => Promise<void>;
  activateTheme: (id: string) => Promise<void>;
  exportTheme: (id: string) => string;
  importTheme: (themeData: string) => Promise<string | null>;
}

// Create the design store
export const useDesignStore = create<DesignState>()(
  persist(
    (set, get) => ({
      // Initial state
      settings: {
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
      },
      themes: [],
      isLoading: false,
      error: null,
      
      // Actions
      fetchSettings: async () => {
        set({ isLoading: true, error: null });
        try {
          // Check if the design_settings table exists
          const { error: checkError } = await supabase
            .from('design_settings')
            .select('id')
            .limit(1);
          
          if (checkError && checkError.message.includes('does not exist')) {
            console.warn('design_settings table does not exist');
            set({ isLoading: false });
            return;
          }
          
          const { data, error } = await supabase
            .from('design_settings')
            .select('*')
            .eq('is_active', true)
            .single();
          
          if (error) {
            if (error.code === 'PGRST116') {
              // No active settings found, use default
              return;
            }
            throw error;
          }
          
          if (data) {
            set({
              settings: {
                colors: data.colors || get().settings.colors,
                fonts: data.fonts || get().settings.fonts,
                logo: data.logo || get().settings.logo,
                favicon: data.favicon || get().settings.favicon,
              }
            });
          }
        } catch (error: any) {
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },
      
      updateSettings: async (settings) => {
        set({ isLoading: true, error: null });
        try {
          // Check if the design_settings table exists
          const { error: checkError } = await supabase
            .from('design_settings')
            .select('id')
            .limit(1);
          
          if (checkError && checkError.message.includes('does not exist')) {
            console.warn('design_settings table does not exist');
            // Just update local state since table doesn't exist
            set({
              settings: {
                ...get().settings,
                ...settings,
                colors: {
                  ...get().settings.colors,
                  ...(settings.colors || {}),
                },
                fonts: {
                  ...get().settings.fonts,
                  ...(settings.fonts || {}),
                },
              },
              isLoading: false
            });
            return;
          }
          
          // First, deactivate all settings
          await supabase
            .from('design_settings')
            .update({ is_active: false })
            .eq('is_active', true);
          
          // Then, create a new active setting
          const { error } = await supabase
            .from('design_settings')
            .insert({
              colors: {
                ...get().settings.colors,
                ...(settings.colors || {}),
              },
              fonts: {
                ...get().settings.fonts,
                ...(settings.fonts || {}),
              },
              logo: settings.logo || get().settings.logo,
              favicon: settings.favicon || get().settings.favicon,
              is_active: true,
              created_at: new Date().toISOString(),
            });
          
          if (error) throw error;
          
          // Update local state
          set({
            settings: {
              ...get().settings,
              ...settings,
              colors: {
                ...get().settings.colors,
                ...(settings.colors || {}),
              },
              fonts: {
                ...get().settings.fonts,
                ...(settings.fonts || {}),
              },
            }
          });
        } catch (error: any) {
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },
      
      fetchThemes: async () => {
        set({ isLoading: true, error: null });
        try {
          // Check if the design_themes table exists
          const { error: checkError } = await supabase
            .from('design_themes')
            .select('id')
            .limit(1);
          
          if (checkError && checkError.message.includes('does not exist')) {
            console.warn('design_themes table does not exist');
            set({ isLoading: false });
            return;
          }
          
          const { data, error } = await supabase
            .from('design_themes')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          
          set({ themes: data || [] });
        } catch (error: any) {
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },
      
      createTheme: async (theme) => {
        set({ isLoading: true, error: null });
        try {
          // Check if the design_themes table exists
          const { error: checkError } = await supabase
            .from('design_themes')
            .select('id')
            .limit(1);
          
          if (checkError && checkError.message.includes('does not exist')) {
            console.warn('design_themes table does not exist');
            set({ isLoading: false });
            return null;
          }
          
          const { data, error } = await supabase
            .from('design_themes')
            .insert({
              ...theme,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select();
          
          if (error) throw error;
          
          // Refresh themes
          await get().fetchThemes();
          
          return data[0]?.id || null;
        } catch (error: any) {
          set({ error: error.message });
          return null;
        } finally {
          set({ isLoading: false });
        }
      },
      
      updateTheme: async (id, theme) => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase
            .from('design_themes')
            .update({
              ...theme,
              updated_at: new Date().toISOString(),
            })
            .eq('id', id);
          
          if (error) throw error;
          
          // Refresh themes
          await get().fetchThemes();
        } catch (error: any) {
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },
      
      deleteTheme: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase
            .from('design_themes')
            .delete()
            .eq('id', id);
          
          if (error) throw error;
          
          // Refresh themes
          await get().fetchThemes();
        } catch (error: any) {
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },
      
      activateTheme: async (id) => {
        set({ isLoading: true, error: null });
        try {
          // Get the theme
          const { data, error } = await supabase
            .from('design_themes')
            .select('*')
            .eq('id', id)
            .single();
          
          if (error) throw error;
          
          // Update settings with theme values
          await get().updateSettings({
            colors: data.colors,
            fonts: data.fonts,
            logo: data.logo,
            favicon: data.favicon,
          });
          
          // Update theme active status
          await supabase
            .from('design_themes')
            .update({ is_active: false })
            .neq('id', id);
          
          await supabase
            .from('design_themes')
            .update({ is_active: true })
            .eq('id', id);
          
          // Refresh themes
          await get().fetchThemes();
        } catch (error: any) {
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },
      
      exportTheme: (id) => {
        const theme = get().themes.find(t => t.id === id);
        if (!theme) return '';
        
        const exportData = {
          name: theme.name,
          description: theme.description,
          colors: theme.colors,
          fonts: theme.fonts,
          logo: theme.logo,
          favicon: theme.favicon,
        };
        
        return JSON.stringify(exportData);
      },
      
      importTheme: async (themeData) => {
        set({ isLoading: true, error: null });
        try {
          const importedTheme = JSON.parse(themeData);
          
          // Validate imported data
          if (!importedTheme.name || !importedTheme.colors || !importedTheme.fonts) {
            throw new Error('Invalid theme data');
          }
          
          // Create new theme
          return await get().createTheme({
            name: importedTheme.name,
            description: importedTheme.description || '',
            colors: importedTheme.colors,
            fonts: importedTheme.fonts,
            logo: importedTheme.logo || '',
            favicon: importedTheme.favicon || '',
            is_active: false,
          });
        } catch (error: any) {
          set({ error: error.message });
          return null;
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'design-storage',
    }
  )
);
