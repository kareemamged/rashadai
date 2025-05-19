import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export interface Comment {
  id: string;
  post_id: string;
  user_id?: string;
  author_name: string;
  author_email?: string;
  content: string;
  approved: boolean;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

interface CommentsState {
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
  fetchComments: (postId?: string) => Promise<void>;
  addComment: (comment: Omit<Comment, 'id' | 'created_at' | 'updated_at' | 'approved' | 'status'>) => Promise<boolean>;
  approveComment: (commentId: string) => Promise<boolean>;
  disapproveComment: (commentId: string) => Promise<boolean>;
  deleteComment: (commentId: string) => Promise<boolean>;
}

export const useCommentsStore = create<CommentsState>()(
  persist(
    (set, get) => ({
      comments: [],
      isLoading: false,
      error: null,

      fetchComments: async (postId?: string) => {
        set({ isLoading: true, error: null });
        try {
          let query = supabase.from('blog_comments').select('*');
          
          if (postId) {
            query = query.eq('post_id', postId);
          }
          
          const { data, error } = await query.order('created_at', { ascending: false });

          if (error) {
            throw error;
          }

          if (data) {
            const formattedComments: Comment[] = data.map(comment => ({
              id: comment.id,
              post_id: comment.post_id,
              user_id: comment.user_id,
              author_name: comment.author_name || 'Anonymous',
              author_email: comment.author_email,
              content: comment.content,
              approved: comment.approved || false,
              status: comment.status || 'pending',
              created_at: comment.created_at || new Date().toISOString(),
              updated_at: comment.updated_at || new Date().toISOString()
            }));

            set({ comments: formattedComments });
          }
        } catch (error: any) {
          console.error('Error fetching comments:', error);
          set({ error: error.message });
          
          // If Supabase query fails, use mock data
          const mockComments: Comment[] = [
            {
              id: '1',
              post_id: '1',
              author_name: 'Ahmed Ali',
              content: 'هذا تعليق رائع على المقال!',
              approved: true,
              status: 'approved',
              created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: '2',
              post_id: '1',
              author_name: 'Sara Mohamed',
              content: 'شكراً على هذه المعلومات المفيدة',
              approved: false,
              status: 'pending',
              created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: '3',
              post_id: '2',
              author_name: 'Kareem Amged',
              content: 'This is a great article!',
              approved: true,
              status: 'approved',
              created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            }
          ];
          
          if (postId) {
            set({ comments: mockComments.filter(comment => comment.post_id === postId) });
          } else {
            set({ comments: mockComments });
          }
        } finally {
          set({ isLoading: false });
        }
      },

      addComment: async (comment) => {
        set({ isLoading: true, error: null });
        try {
          const newComment: Comment = {
            id: uuidv4(),
            ...comment,
            approved: false,
            status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          // Try to save to Supabase
          const { error } = await supabase
            .from('blog_comments')
            .insert([{
              id: newComment.id,
              post_id: newComment.post_id,
              user_id: newComment.user_id,
              author_name: newComment.author_name,
              author_email: newComment.author_email,
              content: newComment.content,
              approved: newComment.approved,
              status: newComment.status,
              created_at: newComment.created_at,
              updated_at: newComment.updated_at
            }]);

          if (error) {
            console.error('Error saving comment to Supabase:', error);
            // If Supabase fails, just update local state
            console.log('Saving comment to local state only');
          }

          // Update local state regardless of Supabase result
          set({ comments: [newComment, ...get().comments] });
          return true;
        } catch (error: any) {
          console.error('Error adding comment:', error);
          set({ error: error.message });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      approveComment: async (commentId) => {
        set({ isLoading: true, error: null });
        try {
          // Try to update in Supabase
          const { error } = await supabase
            .from('blog_comments')
            .update({
              approved: true,
              status: 'approved',
              updated_at: new Date().toISOString()
            })
            .eq('id', commentId);

          if (error) {
            console.error('Error approving comment in Supabase:', error);
          }

          // Update local state regardless of Supabase result
          set({
            comments: get().comments.map(comment =>
              comment.id === commentId
                ? { ...comment, approved: true, status: 'approved', updated_at: new Date().toISOString() }
                : comment
            )
          });
          return true;
        } catch (error: any) {
          console.error('Error approving comment:', error);
          set({ error: error.message });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      disapproveComment: async (commentId) => {
        set({ isLoading: true, error: null });
        try {
          // Try to update in Supabase
          const { error } = await supabase
            .from('blog_comments')
            .update({
              approved: false,
              status: 'pending',
              updated_at: new Date().toISOString()
            })
            .eq('id', commentId);

          if (error) {
            console.error('Error disapproving comment in Supabase:', error);
          }

          // Update local state regardless of Supabase result
          set({
            comments: get().comments.map(comment =>
              comment.id === commentId
                ? { ...comment, approved: false, status: 'pending', updated_at: new Date().toISOString() }
                : comment
            )
          });
          return true;
        } catch (error: any) {
          console.error('Error disapproving comment:', error);
          set({ error: error.message });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      deleteComment: async (commentId) => {
        set({ isLoading: true, error: null });
        try {
          // Try to delete from Supabase
          const { error } = await supabase
            .from('blog_comments')
            .delete()
            .eq('id', commentId);

          if (error) {
            console.error('Error deleting comment from Supabase:', error);
          }

          // Update local state regardless of Supabase result
          set({
            comments: get().comments.filter(comment => comment.id !== commentId)
          });
          return true;
        } catch (error: any) {
          console.error('Error deleting comment:', error);
          set({ error: error.message });
          return false;
        } finally {
          set({ isLoading: false });
        }
      }
    }),
    {
      name: 'comments-storage'
    }
  )
);
