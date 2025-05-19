import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

// Define types for blog posts
export interface Post {
  id: string;
  title: {
    en: string;
    ar: string;
  };
  content: {
    en: string;
    ar: string;
  };
  summary: {
    en: string;
    ar: string;
  };
  category: string;
  status: 'draft' | 'published' | 'scheduled';
  publish_date: string;
  author_id: string;
  author_name?: string;
  created_at: string;
  updated_at: string;
  featured_image?: string;
  likes: number;
  views: number;
}

// Define types for comments
export interface Comment {
  id: string;
  post_id: string;
  user_id?: string;
  user_name?: string;
  author_id?: string;
  author_name: string;
  author_email?: string;
  content: string;
  approved?: boolean;
  status: 'approved' | 'pending' | 'spam';
  created_at: string;
  updated_at: string;
}

// Define types for testimonials
export interface Testimonial {
  id: string;
  author_name: string;
  author_role: string;
  content: string;
  rating: number;
  status: 'approved' | 'pending';
  created_at: string;
  updated_at: string;
}

// Define the blog store state
interface BlogState {
  // Posts
  posts: Post[];
  currentPost: Post | null;
  isLoadingPosts: boolean;
  postsError: string | null;

  // Comments
  comments: Comment[];
  isLoadingComments: boolean;
  commentsError: string | null;

  // Testimonials
  testimonials: Testimonial[];
  isLoadingTestimonials: boolean;
  testimonialsError: string | null;

  // Actions
  fetchPosts: () => Promise<void>;
  fetchPostById: (id: string) => Promise<void>;
  fetchPostsByCategory: (category: string) => Promise<void>;
  createPost: (post: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'likes' | 'views'>) => Promise<string | null>;
  updatePost: (id: string, post: Partial<Post>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  publishPost: (id: string) => Promise<void>;

  fetchComments: (postId?: string) => Promise<void>;
  createComment: (commentData: {
    post_id: string;
    user_id?: string;
    author_name: string;
    author_email?: string;
    content: string;
    status?: string;
  }) => Promise<string | null>;
  approveComment: (id: string) => Promise<void>;
  rejectComment: (id: string) => Promise<void>;
  deleteComment: (id: string) => Promise<void>;

  fetchTestimonials: () => Promise<void>;
  createTestimonial: (testimonial: Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>) => Promise<string | null>;
  approveTestimonial: (id: string) => Promise<void>;
  rejectTestimonial: (id: string) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;
}

// Create the blog store
export const useBlogStore = create<BlogState>()(
  persist(
    (set, get) => ({
      // Initial state
      posts: [],
      currentPost: null,
      isLoadingPosts: false,
      postsError: null,

      comments: [],
      isLoadingComments: false,
      commentsError: null,

      testimonials: [],
      isLoadingTestimonials: false,
      testimonialsError: null,

      // Posts actions
      fetchPosts: async () => {
        set({ isLoadingPosts: true, postsError: null });
        try {
          // Check if the blog_posts table exists
          const { error: checkError } = await supabase
            .from('blog_posts')
            .select('id')
            .limit(1);

          if (checkError && checkError.message.includes('does not exist')) {
            console.warn('blog_posts table does not exist');
            set({ isLoadingPosts: false });
            return;
          }

          const { data, error } = await supabase
            .from('blog_posts')
            .select('*, profiles(name)')
            .order('created_at', { ascending: false });

          if (error) throw error;

          // Transform data to match our Post interface
          const formattedPosts = data.map((post: any) => ({
            ...post,
            author_name: post.profiles?.name || 'Unknown',
          }));

          set({ posts: formattedPosts || [] });
        } catch (error: any) {
          set({ postsError: error.message });
        } finally {
          set({ isLoadingPosts: false });
        }
      },

      fetchPostById: async (id: string) => {
        set({ isLoadingPosts: true, postsError: null });
        try {
          const { data, error } = await supabase
            .from('blog_posts')
            .select('*, profiles(name)')
            .eq('id', id)
            .single();

          if (error) throw error;

          // Transform data to match our Post interface
          const formattedPost = {
            ...data,
            author_name: data.profiles?.name || 'Unknown',
          };

          set({ currentPost: formattedPost });

          // Increment view count
          await supabase
            .from('blog_posts')
            .update({ views: (data.views || 0) + 1 })
            .eq('id', id);
        } catch (error: any) {
          set({ postsError: error.message });
        } finally {
          set({ isLoadingPosts: false });
        }
      },

      fetchPostsByCategory: async (category: string) => {
        set({ isLoadingPosts: true, postsError: null });
        try {
          const { data, error } = await supabase
            .from('blog_posts')
            .select('*, profiles(name)')
            .eq('category', category)
            .eq('status', 'published')
            .order('created_at', { ascending: false });

          if (error) throw error;

          // Transform data to match our Post interface
          const formattedPosts = data.map((post: any) => ({
            ...post,
            author_name: post.profiles?.name || 'Unknown',
          }));

          set({ posts: formattedPosts || [] });
        } catch (error: any) {
          set({ postsError: error.message });
        } finally {
          set({ isLoadingPosts: false });
        }
      },

      createPost: async (post) => {
        set({ isLoadingPosts: true, postsError: null });
        try {
          const { data, error } = await supabase
            .from('blog_posts')
            .insert({
              ...post,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              likes: 0,
              views: 0,
            })
            .select();

          if (error) throw error;

          // Refresh posts
          await get().fetchPosts();

          return data[0]?.id || null;
        } catch (error: any) {
          set({ postsError: error.message });
          return null;
        } finally {
          set({ isLoadingPosts: false });
        }
      },

      updatePost: async (id, post) => {
        set({ isLoadingPosts: true, postsError: null });
        try {
          const { error } = await supabase
            .from('blog_posts')
            .update({
              ...post,
              updated_at: new Date().toISOString(),
            })
            .eq('id', id);

          if (error) throw error;

          // Refresh posts
          await get().fetchPosts();

          // If current post is being updated, refresh it
          if (get().currentPost?.id === id) {
            await get().fetchPostById(id);
          }
        } catch (error: any) {
          set({ postsError: error.message });
        } finally {
          set({ isLoadingPosts: false });
        }
      },

      deletePost: async (id) => {
        set({ isLoadingPosts: true, postsError: null });
        try {
          const { error } = await supabase
            .from('blog_posts')
            .delete()
            .eq('id', id);

          if (error) throw error;

          // Refresh posts
          await get().fetchPosts();

          // If current post is being deleted, clear it
          if (get().currentPost?.id === id) {
            set({ currentPost: null });
          }
        } catch (error: any) {
          set({ postsError: error.message });
        } finally {
          set({ isLoadingPosts: false });
        }
      },

      publishPost: async (id) => {
        set({ isLoadingPosts: true, postsError: null });
        try {
          const { error } = await supabase
            .from('blog_posts')
            .update({
              status: 'published',
              publish_date: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', id);

          if (error) throw error;

          // Refresh posts
          await get().fetchPosts();

          // If current post is being published, refresh it
          if (get().currentPost?.id === id) {
            await get().fetchPostById(id);
          }
        } catch (error: any) {
          set({ postsError: error.message });
        } finally {
          set({ isLoadingPosts: false });
        }
      },

      // Comments actions
      fetchComments: async (postId) => {
        set({ isLoadingComments: true, commentsError: null });
        try {
          // Check if the blog_comments table exists
          const { error: checkError } = await supabase
            .from('blog_comments')
            .select('id')
            .limit(1);

          if (checkError && checkError.message.includes('does not exist')) {
            console.warn('blog_comments table does not exist');
            set({ isLoadingComments: false });
            return;
          }

          let query = supabase
            .from('blog_comments')
            .select('*')
            .order('created_at', { ascending: false });

          if (postId) {
            query = query.eq('post_id', postId);
          }

          const { data, error } = await query;

          if (error) throw error;

          // تحويل حقل approved إلى status إذا لم يكن موجودًا
          const formattedComments = data?.map(comment => ({
            ...comment,
            status: comment.status || (comment.approved ? 'approved' : 'pending')
          })) || [];

          set({ comments: formattedComments });
        } catch (error: any) {
          set({ commentsError: error.message });
        } finally {
          set({ isLoadingComments: false });
        }
      },

      createComment: async (commentData: {
        post_id: string;
        user_id?: string;
        author_name: string;
        author_email?: string;
        content: string;
        status?: string;
      }) => {
        set({ isLoadingComments: true, commentsError: null });
        try {
          console.log('Creating comment with data:', commentData);

          // تحضير بيانات التعليق للإدخال في قاعدة البيانات - نهج مبسط
          const comment = {
            post_id: commentData.post_id,
            user_id: commentData.user_id || null,
            content: commentData.content,
            approved: false, // التعليقات تكون غير معتمدة افتراضيًا
            status: 'pending', // التعليقات تكون معلقة افتراضيًا
            author_name: commentData.author_name,
            author_email: commentData.author_email || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          const { data, error } = await supabase
            .from('blog_comments')
            .insert([comment])
            .select();

          if (error) throw error;

          // إضافة نشاط التعليق إلى جدول نشاطات المستخدم إذا كان هناك معرف مستخدم
          if (commentData.user_id) {
            try {
              // الحصول على عنوان المنشور
              const { data: postData } = await supabase
                .from('blog_posts')
                .select('title, title_en, title_ar')
                .eq('id', commentData.post_id)
                .single();

              const postTitle = postData?.title_en || postData?.title_ar || postData?.title || 'a blog post';

              // إضافة نشاط التعليق
              await supabase
                .from('user_activities')
                .insert([{
                  user_id: commentData.user_id,
                  type: 'comment',
                  description: `Posted a comment on a blog post`,
                  detail: `"${postTitle}"`,
                  content: commentData.content.length > 50
                    ? commentData.content.substring(0, 50) + '...'
                    : commentData.content,
                  created_at: new Date().toISOString(),
                  related_id: data[0]?.id
                }]);
            } catch (activityError) {
              console.error('Error recording comment activity:', activityError);
              // لا نريد أن نفشل العملية الرئيسية إذا فشل تسجيل النشاط
            }
          }

          // Refresh comments
          await get().fetchComments(commentData.post_id);

          return data[0]?.id || null;
        } catch (error: any) {
          console.error('Error creating comment:', error);
          set({ commentsError: error.message });
          return null;
        } finally {
          set({ isLoadingComments: false });
        }
      },

      approveComment: async (id) => {
        set({ isLoadingComments: true, commentsError: null });
        try {
          const { error } = await supabase
            .from('blog_comments')
            .update({
              status: 'approved',
              approved: true, // للتوافق مع الحقول القديمة
              updated_at: new Date().toISOString(),
            })
            .eq('id', id);

          if (error) throw error;

          // Refresh comments
          await get().fetchComments();
        } catch (error: any) {
          set({ commentsError: error.message });
        } finally {
          set({ isLoadingComments: false });
        }
      },

      rejectComment: async (id) => {
        set({ isLoadingComments: true, commentsError: null });
        try {
          const { error } = await supabase
            .from('blog_comments')
            .update({
              status: 'spam',
              approved: false, // للتوافق مع الحقول القديمة
              updated_at: new Date().toISOString(),
            })
            .eq('id', id);

          if (error) throw error;

          // Refresh comments
          await get().fetchComments();
        } catch (error: any) {
          set({ commentsError: error.message });
        } finally {
          set({ isLoadingComments: false });
        }
      },

      deleteComment: async (id) => {
        set({ isLoadingComments: true, commentsError: null });
        try {
          const { error } = await supabase
            .from('blog_comments')
            .delete()
            .eq('id', id);

          if (error) throw error;

          // Refresh comments
          await get().fetchComments();
        } catch (error: any) {
          set({ commentsError: error.message });
        } finally {
          set({ isLoadingComments: false });
        }
      },

      // Testimonials actions
      fetchTestimonials: async () => {
        set({ isLoadingTestimonials: true, testimonialsError: null });
        try {
          // Check if the testimonials table exists
          const { error: checkError } = await supabase
            .from('testimonials')
            .select('id')
            .limit(1);

          if (checkError && checkError.message.includes('does not exist')) {
            console.warn('testimonials table does not exist');
            set({ isLoadingTestimonials: false });
            return;
          }

          const { data, error } = await supabase
            .from('testimonials')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;

          set({ testimonials: data || [] });
        } catch (error: any) {
          set({ testimonialsError: error.message });
        } finally {
          set({ isLoadingTestimonials: false });
        }
      },

      createTestimonial: async (testimonial) => {
        set({ isLoadingTestimonials: true, testimonialsError: null });
        try {
          const { data, error } = await supabase
            .from('testimonials')
            .insert({
              ...testimonial,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select();

          if (error) throw error;

          // Refresh testimonials
          await get().fetchTestimonials();

          return data[0]?.id || null;
        } catch (error: any) {
          set({ testimonialsError: error.message });
          return null;
        } finally {
          set({ isLoadingTestimonials: false });
        }
      },

      approveTestimonial: async (id) => {
        set({ isLoadingTestimonials: true, testimonialsError: null });
        try {
          const { error } = await supabase
            .from('testimonials')
            .update({
              status: 'approved',
              updated_at: new Date().toISOString(),
            })
            .eq('id', id);

          if (error) throw error;

          // Refresh testimonials
          await get().fetchTestimonials();
        } catch (error: any) {
          set({ testimonialsError: error.message });
        } finally {
          set({ isLoadingTestimonials: false });
        }
      },

      rejectTestimonial: async (id) => {
        set({ isLoadingTestimonials: true, testimonialsError: null });
        try {
          const { error } = await supabase
            .from('testimonials')
            .update({
              status: 'pending',
              updated_at: new Date().toISOString(),
            })
            .eq('id', id);

          if (error) throw error;

          // Refresh testimonials
          await get().fetchTestimonials();
        } catch (error: any) {
          set({ testimonialsError: error.message });
        } finally {
          set({ isLoadingTestimonials: false });
        }
      },

      deleteTestimonial: async (id) => {
        set({ isLoadingTestimonials: true, testimonialsError: null });
        try {
          const { error } = await supabase
            .from('testimonials')
            .delete()
            .eq('id', id);

          if (error) throw error;

          // Refresh testimonials
          await get().fetchTestimonials();
        } catch (error: any) {
          set({ testimonialsError: error.message });
        } finally {
          set({ isLoadingTestimonials: false });
        }
      },
    }),
    {
      name: 'blog-storage',
    }
  )
);
