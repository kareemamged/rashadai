import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '../../store/languageStore';
import { useAuthStore } from '../../store/authStore';
import { useTestimonialsStore } from '../../store/testimonialsStore';
import { useAdminStore } from '../../store/adminStore';
import {
  FileText,
  MessageSquare,
  Star,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Tag,
  ExternalLink
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import BlogPostForm from './BlogPostForm';
import CommentDetailsModal from './CommentDetailsModal';
import TestimonialDetailsModal from './TestimonialDetailsModal';
import ConfirmationModal from './ConfirmationModal';
import { showSuccessNotification, showErrorNotification } from '../../stores/notificationStore';

// Define types for blog posts
interface Post {
  id: string;
  title_en: string;
  title_ar: string;
  summary_en: string;
  summary_ar: string;
  content_en: string;
  content_ar: string;
  category: string;
  status: 'draft' | 'published' | 'scheduled';
  scheduled_at?: string | null;
  published: boolean;
  author_id: string;
  author_name?: string;
  created_at: string;
  updated_at: string;
  image_url?: string;
  likes_count?: number;
  dislikes_count?: number;
  views?: number;
}

// Define types for comments
interface Comment {
  id: string;
  post_id: string;
  user_id?: string;
  content: string;
  approved: boolean;
  created_at: string;
  updated_at?: string;
  likes_count?: number;
  dislikes_count?: number;
  user_name?: string;
}

// Define types for testimonials
interface Testimonial {
  id: string;
  user_name: string;
  content: string;
  rating: number;
  approved: boolean;
  created_at: string;
  updated_at?: string;
  user_id?: string;
}

const ContentManagement: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<'blog' | 'comments' | 'testimonials'>('blog');
  const [isRTL, setIsRTL] = useState(language === 'ar');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Blog posts state
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

  // Testimonials state
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoadingTestimonials, setIsLoadingTestimonials] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);

  // Confirmation modals state
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    itemId: string;
    itemType: 'post' | 'comment' | 'testimonial';
    message: string;
  }>({
    isOpen: false,
    itemId: '',
    itemType: 'post',
    message: ''
  });

  useEffect(() => {
    setIsRTL(language === 'ar');
  }, [language]);

  // Fetch blog posts
  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoadingPosts(true);
      try {
        // Check if the blog_posts table exists
        const { error: checkError } = await supabase
          .from('blog_posts')
          .select('id')
          .limit(1);

        if (checkError) {
          console.warn('Error checking blog_posts table:', checkError.message);

          if (checkError.message.includes('does not exist')) {
            console.warn('blog_posts table does not exist');

            // Create the blog_posts table
            try {
              // Read the SQL file content
              const response = await fetch('/supabase/blog_posts_table.sql');
              const sqlContent = await response.text();

              // Execute the SQL (this would require admin privileges)
              // In a real app, this would be done through a server endpoint
              console.log('Would execute SQL to create blog_posts table');

              // For now, we'll just create sample posts directly
              await createSamplePosts();
            } catch (createError) {
              console.error('Error creating blog_posts table:', createError);
            }
          } else if (checkError.code === '42501' || checkError.message.includes('permission denied')) {
            console.error('Permission denied error. RLS policy might be blocking access.');
            setErrorMessage(t('admin.content.permissionDenied', 'Permission denied. Please check RLS policies.'));
          } else if (checkError.code === 'PGRST301' || checkError.message.includes('JWT')) {
            console.error('Authentication error. JWT might be invalid or expired.');
            setErrorMessage(t('admin.content.authError', 'Authentication error. Please log in again.'));
          } else {
            console.error('Unknown error checking blog_posts table:', checkError);
            setErrorMessage(t('admin.content.unknownError', 'Unknown error: ') + checkError.message);
          }

          setIsLoadingPosts(false);
          return;
        }

        // Fetch real posts from Supabase
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .order('created_at', { ascending: false });

        // If we need author information, we'll fetch it separately
        if (!error && data && data.length > 0) {
          // Get unique author IDs
          const authorIds = [...new Set(data.map(post => post.author_id))].filter(Boolean);

          if (authorIds.length > 0) {
            // Fetch author profiles
            const { data: authorData } = await supabase
              .from('profiles')
              .select('id, name, email')
              .in('id', authorIds);

            // Create a map of author data
            const authorMap = {};
            if (authorData) {
              authorData.forEach(author => {
                authorMap[author.id] = author;
              });
            }

            // Add author information to posts
            data.forEach(post => {
              if (post.author_id && authorMap[post.author_id]) {
                // Instead of modifying the post object directly, we'll use this map later
                // when formatting the posts
                post.author_name = authorMap[post.author_id].name ||
                                  authorMap[post.author_id].email?.split('@')[0] ||
                                  'Unknown';
              }
            });
          }
        }

        if (error) throw error;

        if (data && data.length > 0) {
          // Transform data to match our Post interface
          const formattedPosts: Post[] = data.map(post => ({
            id: post.id,
            title_en: post.title_en || 'Untitled',
            title_ar: post.title_ar || 'بدون عنوان',
            summary_en: post.summary_en || post.content_en?.substring(0, 150) + '...' || '',
            summary_ar: post.summary_ar || post.content_ar?.substring(0, 150) + '...' || '',
            content_en: post.content_en || '',
            content_ar: post.content_ar || '',
            category: post.category || 'tips',
            status: post.status || (post.published ? 'published' : 'draft'),
            scheduled_at: post.scheduled_at || null,
            published: post.published || false,
            author_id: post.author_id || '',
            author_name: post.author_name || 'Unknown',
            created_at: post.created_at || new Date().toISOString(),
            updated_at: post.updated_at || new Date().toISOString(),
            image_url: post.image_url || '',
            likes_count: post.likes_count || 0,
            dislikes_count: post.dislikes_count || 0,
            views: post.views || 0
          }));

          setPosts(formattedPosts);
        } else {
          // If no posts found, create sample data
          await createSamplePosts();
        }
      } catch (error) {
        console.error('Error fetching posts:', error);

        // More detailed error handling
        if (error.code === '42501' || (error.message && error.message.includes('permission denied'))) {
          console.error('Permission denied error. RLS policy might be blocking access.');
          setErrorMessage(t('admin.content.permissionDenied', 'Permission denied. Please check RLS policies.'));
        } else if (error.code === 'PGRST301' || (error.message && error.message.includes('JWT'))) {
          console.error('Authentication error. JWT might be invalid or expired.');
          setErrorMessage(t('admin.content.authError', 'Authentication error. Please log in again.'));
        } else {
          // Generic error message
          setErrorMessage(t('admin.content.errorFetchingPosts', 'Error fetching posts: ') +
                         (error.message || 'Unknown error'));
        }

        // Use empty array on error
        setPosts([]);
      } finally {
        setIsLoadingPosts(false);
      }
    };

    // Function to create sample posts
    const createSamplePosts = async () => {
      try {
        // Create sample blog posts with a fixed admin author ID instead of using user?.id
        // This avoids the need to access auth.users table which might be restricted
        const adminAuthorId = '00000000-0000-0000-0000-000000000000'; // Use a fixed ID for sample posts

        const samplePosts = [
          {
            title_en: 'Getting Started with AI Medical Consultations',
            title_ar: 'بدء الاستشارات الطبية بالذكاء الاصطناعي',
            summary_en: 'A guide to understanding AI medical consultations and how to get the most out of them.',
            summary_ar: 'دليل لفهم الاستشارات الطبية بالذكاء الاصطناعي وكيفية الاستفادة القصوى منها.',
            content_en: 'AI medical consultations are revolutionizing healthcare by providing accessible medical advice. This guide will help you understand how to get the most out of your AI consultation experience.',
            content_ar: 'تُحدث الاستشارات الطبية بالذكاء الاصطناعي ثورة في الرعاية الصحية من خلال تقديم المشورة الطبية بشكل سهل الوصول. سيساعدك هذا الدليل على فهم كيفية الاستفادة القصوى من تجربة الاستشارة بالذكاء الاصطناعي.',
            category: 'tips',
            status: 'published',
            published: true,
            author_id: adminAuthorId, // Use fixed ID
            image_url: '/images/blog/ai-consultation.jpg'
          },
          {
            title_en: 'Understanding AI Diagnosis Limitations',
            title_ar: 'فهم قيود التشخيص بالذكاء الاصطناعي',
            summary_en: 'Learn about what AI can and cannot diagnose, and when to seek traditional medical care.',
            summary_ar: 'تعرف على ما يمكن للذكاء الاصطناعي تشخيصه وما لا يمكنه، ومتى يجب عليك طلب الرعاية الطبية التقليدية.',
            content_en: 'While AI can provide valuable medical insights, it is important to understand its limitations. This article explains what AI can and cannot diagnose, and when you should seek traditional medical care.',
            content_ar: 'بينما يمكن للذكاء الاصطناعي تقديم رؤى طبية قيمة، من المهم فهم قيوده. يشرح هذا المقال ما يمكن للذكاء الاصطناعي تشخيصه وما لا يمكنه، ومتى يجب عليك طلب الرعاية الطبية التقليدية.',
            category: 'tips',
            status: 'draft',
            published: false,
            author_id: adminAuthorId, // Use fixed ID
            image_url: '/images/blog/ai-limitations.jpg'
          },
          {
            title_en: 'New Features Coming to Our Platform',
            title_ar: 'ميزات جديدة قادمة إلى منصتنا',
            summary_en: 'Exciting new features coming to our platform in the next update.',
            summary_ar: 'ميزات جديدة مثيرة قادمة إلى منصتنا في التحديث القادم.',
            content_en: 'We are excited to announce several new features coming to our platform in the next update. These improvements will enhance your experience and provide more comprehensive healthcare options.',
            content_ar: 'يسعدنا أن نعلن عن العديد من الميزات الجديدة القادمة إلى منصتنا في التحديث القادم. ستعمل هذه التحسينات على تعزيز تجربتك وتوفير خيارات رعاية صحية أكثر شمولاً.',
            category: 'news',
            status: 'published',
            published: true,
            author_id: adminAuthorId, // Use fixed ID
            image_url: '/images/blog/new-features.jpg'
          }
        ];

        // Insert sample posts
        for (const post of samplePosts) {
          console.log('Inserting sample post:', post);
          const { data: insertData, error: insertError } = await supabase.from('blog_posts').insert(post).select();
          console.log('Insert result:', insertData);
          if (insertError) {
            console.error('Error inserting sample post:', insertError);
            if (insertError.code === '42501' || insertError.message.includes('permission denied')) {
              setErrorMessage(t('admin.content.permissionDenied', 'Permission denied when creating sample posts. Please check RLS policies.'));
              break;
            }
          }
        }

        // Fetch the newly created posts
        const { data: newData } = await supabase
          .from('blog_posts')
          .select('*')
          .order('created_at', { ascending: false });

        // If we need author information, we'll fetch it separately
        if (newData && newData.length > 0) {
          // Get unique author IDs
          const authorIds = [...new Set(newData.map(post => post.author_id))].filter(Boolean);

          if (authorIds.length > 0) {
            // Fetch author profiles
            const { data: authorData } = await supabase
              .from('profiles')
              .select('id, name, email')
              .in('id', authorIds);

            // Create a map of author data
            const authorMap = {};
            if (authorData) {
              authorData.forEach(author => {
                authorMap[author.id] = author;
              });
            }

            // Add author information to posts
            newData.forEach(post => {
              if (post.author_id && authorMap[post.author_id]) {
                post.author_name = authorMap[post.author_id].name ||
                                  authorMap[post.author_id].email?.split('@')[0] ||
                                  'Unknown';
              }
            });
          }
        }

        if (newData && newData.length > 0) {
          const formattedPosts: Post[] = newData.map(post => ({
            id: post.id,
            title_en: post.title_en || 'Untitled',
            title_ar: post.title_ar || 'بدون عنوان',
            summary_en: post.summary_en || post.content_en?.substring(0, 150) + '...' || '',
            summary_ar: post.summary_ar || post.content_ar?.substring(0, 150) + '...' || '',
            content_en: post.content_en || '',
            content_ar: post.content_ar || '',
            category: post.category || 'tips',
            status: post.status || (post.published ? 'published' : 'draft'),
            scheduled_at: post.scheduled_at || null,
            published: post.published || false,
            author_id: post.author_id || '',
            author_name: post.author_name || 'Unknown',
            created_at: post.created_at || new Date().toISOString(),
            updated_at: post.updated_at || new Date().toISOString(),
            image_url: post.image_url || '',
            likes_count: post.likes_count || 0,
            dislikes_count: post.dislikes_count || 0,
            views: post.views || 0
          }));

          setPosts(formattedPosts);
        } else {
          // Use hardcoded sample data as last resort
          // Use a fixed admin ID instead of user?.id to avoid auth.users table access
          const adminAuthorId = '00000000-0000-0000-0000-000000000000';

          const samplePosts: Post[] = [
            {
              id: '1',
              title_en: 'Getting Started with AI Medical Consultations',
              title_ar: 'بدء الاستشارات الطبية بالذكاء الاصطناعي',
              summary_en: 'A guide to understanding AI medical consultations and how to get the most out of them.',
              summary_ar: 'دليل لفهم الاستشارات الطبية بالذكاء الاصطناعي وكيفية الاستفادة القصوى منها.',
              content_en: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
              content_ar: 'هناك حقيقة مثبتة منذ زمن طويل وهي أن المحتوى المقروء...',
              category: 'tips',
              status: 'published',
              scheduled_at: null,
              published: true,
              author_id: adminAuthorId,
              author_name: 'Admin',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              image_url: '/images/blog/ai-consultation.jpg',
              likes_count: 5,
              dislikes_count: 0,
              views: 120
            },
            {
              id: '2',
              title_en: 'Understanding AI Diagnosis Limitations',
              title_ar: 'فهم قيود التشخيص بالذكاء الاصطناعي',
              summary_en: 'Learn about what AI can and cannot diagnose, and when to seek traditional medical care.',
              summary_ar: 'تعرف على ما يمكن للذكاء الاصطناعي تشخيصه وما لا يمكنه، ومتى يجب عليك طلب الرعاية الطبية التقليدية.',
              content_en: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
              content_ar: 'هناك حقيقة مثبتة منذ زمن طويل وهي أن المحتوى المقروء...',
              category: 'tips',
              status: 'draft',
              scheduled_at: null,
              published: false,
              author_id: adminAuthorId,
              author_name: 'Admin',
              created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              image_url: '/images/blog/ai-limitations.jpg',
              likes_count: 0,
              dislikes_count: 0,
              views: 0
            }
          ];

          setPosts(samplePosts);
        }
      } catch (error) {
        console.error('Error creating sample posts:', error);
        // Use empty array on error
        setPosts([]);
      }
    };

    if (activeTab === 'blog') {
      fetchPosts();
    }
  }, [activeTab]);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      setIsLoadingComments(true);
      try {
        // Check if the blog_comments table exists
        const { error: checkError } = await supabase
          .from('blog_comments')
          .select('id')
          .limit(1);

        if (checkError && checkError.message.includes('does not exist')) {
          console.warn('blog_comments table does not exist');
          setIsLoadingComments(false);
          return;
        }

        // جلب التعليقات مع ترتيبها من الأحدث للأقدم
        const { data, error } = await supabase
          .from('blog_comments')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // إذا كانت هناك تعليقات، جلب المنشورات المرتبطة بها
        if (data && data.length > 0) {
          // جلب المنشورات إذا لم تكن موجودة بالفعل
          if (posts.length === 0 && activeTab === 'comments') {
            try {
              const { data: postsData, error: postsError } = await supabase
                .from('blog_posts')
                .select('id, title_en, title_ar');

              if (!postsError && postsData) {
                // تحديث حالة المنشورات بشكل مؤقت للاستخدام في عرض التعليقات
                setPosts(postsData.map(post => ({
                  ...post,
                  content_en: '',
                  content_ar: '',
                  summary_en: '',
                  summary_ar: '',
                  category: 'tips',
                  status: 'published',
                  published: true,
                  author_id: '',
                  author_name: '',
                  created_at: '',
                  updated_at: '',
                  image_url: '',
                  likes_count: 0,
                  dislikes_count: 0,
                  views: 0
                })));
              }
            } catch (postsError) {
              console.error('Error fetching posts for comments:', postsError);
            }
          }
        }

        // تحويل حقل approved إلى status إذا لم يكن موجودًا
        const formattedComments = data?.map(comment => ({
          ...comment,
          status: comment.status || (comment.approved ? 'approved' : 'pending')
        })) || [];

        setComments(formattedComments);
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setIsLoadingComments(false);
      }
    };

    if (activeTab === 'comments') {
      fetchComments();
    }
  }, [activeTab, posts.length]);

  // Fetch testimonials
  useEffect(() => {
    const fetchTestimonials = async () => {
      setIsLoadingTestimonials(true);
      try {
        console.log("Admin: Loading testimonials...");

        // استخدام متجر التقييمات لجلب جميع التقييمات بما في ذلك المعلقة
        await useTestimonialsStore.getState().fetchTestimonials(true); // true = include all testimonials

        // الحصول على التقييمات من المتجر
        const allTestimonials = useTestimonialsStore.getState().testimonials;
        console.log("Admin: Current testimonials:", allTestimonials);

        // تحديث الحالة المحلية مباشرة من المتجر
        // نعرض جميع التقييمات في لوحة التحكم، بما في ذلك المعلقة
        setTestimonials(allTestimonials);

        // تحديث عدد التقييمات المعلقة في لوحة التحكم
        try {
          // تحديث عدد التقييمات المعلقة أولاً
          await useAdminStore.getState().updatePendingReviewsCount();

          // ثم تحديث جميع الإحصائيات
          await useAdminStore.getState().fetchStats();
          console.log('Admin: Updated dashboard stats after loading testimonials');
        } catch (statsError) {
          console.error('Error updating dashboard stats:', statsError);
        }

        // إضافة مستمع للتغييرات في متجر التقييمات
        const unsubscribe = useTestimonialsStore.subscribe(
          (state) => state.testimonials,
          (testimonials) => {
            console.log("Admin: Testimonials store updated, refreshing list");
            setTestimonials(testimonials);

            // تحديث عدد التقييمات المعلقة عند تغيير التقييمات
            useAdminStore.getState().updatePendingReviewsCount().then(() => {
              useAdminStore.getState().fetchStats();
            }).catch(error => {
              console.error('Error updating stats after testimonials change:', error);
            });
          }
        );

        // تنظيف المستمع عند إلغاء تحميل المكون
        return () => {
          unsubscribe();
        };
      } catch (error) {
        console.error('Error fetching testimonials:', error);
        // في حالة الخطأ، نستخدم التقييمات الموجودة في المتجر
        const storeTestimonials = useTestimonialsStore.getState().testimonials;
        setTestimonials(storeTestimonials);
      } finally {
        setIsLoadingTestimonials(false);
      }
    };

    if (activeTab === 'testimonials') {
      fetchTestimonials();
    }
  }, [activeTab]);

  // Handle post actions
  const handleAddPost = () => {
    setEditingPostId(null);
    setShowPostForm(true);
  };

  const handleEditPost = (postId: string) => {
    setEditingPostId(postId);
    setShowPostForm(true);
  };

  const handleViewPost = (postId: string) => {
    // Open post in a new tab
    const post = posts.find(p => p.id === postId);
    if (post) {
      window.open(`/blog/${postId}`, '_blank');
    }
  };

  const handleDeletePost = (postId: string) => {
    if (confirmDelete !== postId) {
      setConfirmDelete(postId);
      return;
    }

    // فتح نافذة التأكيد
    setDeleteConfirmation({
      isOpen: true,
      itemId: postId,
      itemType: 'post',
      message: t('admin.content.confirmDeletePost', 'Are you sure you want to delete this post?')
    });
    setConfirmDelete(null);
  };

  const confirmDeletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      setPosts(posts.filter(post => post.id !== postId));
      showSuccessNotification(
        t('admin.content.deleted', 'Deleted'),
        t('admin.content.postDeleted', 'Post deleted successfully')
      );
    } catch (error) {
      console.error('Error deleting post:', error);
      showErrorNotification(
        t('admin.content.error', 'Error'),
        t('admin.content.errorDeletingPost', 'Error deleting post')
      );
    }
  };

  // وظائف التعامل مع التعليقات
  const handleToggleCommentApproval = async (commentId: string, currentStatus: boolean) => {
    try {
      // تحديث في قاعدة البيانات
      const { error } = await supabase
        .from('blog_comments')
        .update({
          approved: !currentStatus,
          status: !currentStatus ? 'approved' : 'pending', // تحديث حالة التعليق
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId);

      if (error) throw error;

      // تحديث الحالة المحلية
      setComments(comments.map(comment =>
        comment.id === commentId ? {
          ...comment,
          approved: !currentStatus,
          status: !currentStatus ? 'approved' : 'pending', // تحديث حالة التعليق
          updated_at: new Date().toISOString()
        } : comment
      ));

      // تحديث إحصائيات لوحة التحكم
      try {
        await useAdminStore.getState().fetchStats();
        console.log('Admin: Updated dashboard stats after comment approval status change');
      } catch (statsError) {
        console.error('Error updating dashboard stats:', statsError);
      }

      // إظهار إشعار نجاح
      showSuccessNotification(
        !currentStatus
          ? t('admin.content.commentApproved', 'Comment Approved')
          : t('admin.content.commentDisapproved', 'Comment Disapproved'),
        !currentStatus
          ? t('admin.content.commentApprovedDesc', 'Comment has been approved successfully')
          : t('admin.content.commentDisapprovedDesc', 'Comment has been disapproved successfully')
      );
    } catch (error) {
      console.error('Error toggling comment approval:', error);
      showErrorNotification(
        t('admin.content.error', 'Error'),
        t('admin.content.errorTogglingCommentApproval', 'Error toggling comment approval')
      );
    }
  };

  const handleViewComment = (commentId: string) => {
    // البحث عن التعليق
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    // البحث عن المنشور المرتبط بالتعليق
    const relatedPost = posts.find(post => post.id === comment.post_id);
    const postTitle = relatedPost
      ? (language === 'ar' ? relatedPost.title_ar : relatedPost.title_en)
      : (isRTL ? "منشور غير معروف" : "Unknown Post");

    // تعيين التعليق المحدد وفتح النافذة المنبثقة
    setSelectedComment(comment);
    setIsCommentModalOpen(true);
  };

  const handleDeleteComment = (commentId: string) => {
    // فتح نافذة التأكيد
    setDeleteConfirmation({
      isOpen: true,
      itemId: commentId,
      itemType: 'comment',
      message: t('admin.content.confirmDeleteComment', 'Are you sure you want to delete this comment?')
    });
  };

  const confirmDeleteComment = async (commentId: string) => {
    try {
      // حذف من قاعدة البيانات
      const { error } = await supabase
        .from('blog_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      // تحديث الحالة المحلية
      setComments(comments.filter(comment => comment.id !== commentId));

      // تحديث إحصائيات لوحة التحكم
      try {
        await useAdminStore.getState().fetchStats();
        console.log('Admin: Updated dashboard stats after comment deletion');
      } catch (statsError) {
        console.error('Error updating dashboard stats:', statsError);
      }

      showSuccessNotification(
        t('admin.content.deleted', 'Deleted'),
        t('admin.content.commentDeleted', 'Comment deleted successfully')
      );
    } catch (error) {
      console.error('Error deleting comment:', error);
      showErrorNotification(
        t('admin.content.error', 'Error'),
        t('admin.content.errorDeletingComment', 'Error deleting comment')
      );
    }
  };

  // وظائف التعامل مع التقييمات
  const handleToggleTestimonialApproval = async (testimonialId: string, currentStatus: boolean) => {
    try {
      console.log('Admin: Toggling testimonial approval:', testimonialId, 'Current status:', currentStatus);

      // استخدام وظائف المتجر مباشرة للتحديث
      if (!currentStatus) {
        // الموافقة على التقييم
        const success = await useTestimonialsStore.getState().approveTestimonial(testimonialId);
        if (success) {
          console.log('Admin: Successfully approved testimonial');

          // تحديث الحالة المحلية بعد التحديث في المتجر
          const updatedTestimonials = useTestimonialsStore.getState().testimonials;
          setTestimonials(updatedTestimonials);

          // تحديث إحصائيات لوحة التحكم
          try {
            // تحديث عدد التقييمات المعلقة أولاً
            await useAdminStore.getState().updatePendingReviewsCount();

            // ثم تحديث جميع الإحصائيات
            await useAdminStore.getState().fetchStats();
            console.log('Admin: Updated dashboard stats after testimonial approval');
          } catch (statsError) {
            console.error('Error updating dashboard stats:', statsError);
          }

          showSuccessNotification(
            t('admin.content.testimonialApproved', 'Testimonial Approved'),
            t('admin.content.testimonialApprovedDesc', 'Testimonial has been approved successfully')
          );
        } else {
          throw new Error('Failed to approve testimonial');
        }
      } else {
        // إلغاء الموافقة على التقييم
        const success = await useTestimonialsStore.getState().disapproveTestimonial(testimonialId);
        if (success) {
          console.log('Admin: Successfully disapproved testimonial');

          // تحديث الحالة المحلية بعد التحديث في المتجر
          const updatedTestimonials = useTestimonialsStore.getState().testimonials;
          setTestimonials(updatedTestimonials);

          // تحديث إحصائيات لوحة التحكم
          try {
            // تحديث عدد التقييمات المعلقة أولاً
            await useAdminStore.getState().updatePendingReviewsCount();

            // ثم تحديث جميع الإحصائيات
            await useAdminStore.getState().fetchStats();
            console.log('Admin: Updated dashboard stats after testimonial disapproval');
          } catch (statsError) {
            console.error('Error updating dashboard stats:', statsError);
          }

          showSuccessNotification(
            t('admin.content.testimonialDisapproved', 'Testimonial Disapproved'),
            t('admin.content.testimonialDisapprovedDesc', 'Testimonial has been disapproved successfully')
          );
        } else {
          throw new Error('Failed to disapprove testimonial');
        }
      }
    } catch (error) {
      console.error('Error toggling testimonial approval:', error);
      showErrorNotification(
        t('admin.content.error', 'Error'),
        t('admin.content.errorTogglingTestimonialApproval', 'Error toggling testimonial approval')
      );
    }
  };

  const handleViewTestimonial = (testimonialId: string) => {
    // البحث عن التقييم
    const testimonial = testimonials.find(t => t.id === testimonialId);
    if (!testimonial) return;

    // تعيين التقييم المحدد وفتح النافذة المنبثقة
    setSelectedTestimonial(testimonial);
    setIsTestimonialModalOpen(true);
  };

  const handleDeleteTestimonial = (testimonialId: string) => {
    // فتح نافذة التأكيد
    setDeleteConfirmation({
      isOpen: true,
      itemId: testimonialId,
      itemType: 'testimonial',
      message: t('admin.content.confirmDeleteTestimonial', 'Are you sure you want to delete this testimonial?')
    });
  };

  const confirmDeleteTestimonial = async (testimonialId: string) => {
    try {
      console.log('Admin: Deleting testimonial:', testimonialId);

      // استخدام وظيفة المتجر مباشرة للحذف
      const success = await useTestimonialsStore.getState().deleteTestimonial(testimonialId);

      if (success) {
        console.log('Admin: Successfully deleted testimonial');

        // تحديث الحالة المحلية بعد الحذف من المتجر
        const updatedTestimonials = useTestimonialsStore.getState().testimonials;
        setTestimonials(updatedTestimonials);

        // تحديث إحصائيات لوحة التحكم
        try {
          // تحديث عدد التقييمات المعلقة أولاً
          await useAdminStore.getState().updatePendingReviewsCount();

          // ثم تحديث جميع الإحصائيات
          await useAdminStore.getState().fetchStats();
          console.log('Admin: Updated dashboard stats after testimonial deletion');
        } catch (statsError) {
          console.error('Error updating dashboard stats:', statsError);
        }

        // إعادة تحميل التقييمات من المتجر للتأكد من تحديث القائمة
        await useTestimonialsStore.getState().fetchTestimonials(true);
        const refreshedTestimonials = useTestimonialsStore.getState().testimonials;
        setTestimonials(refreshedTestimonials);

        showSuccessNotification(
          t('admin.content.deleted', 'Deleted'),
          t('admin.content.testimonialDeleted', 'Testimonial deleted successfully')
        );
      } else {
        throw new Error('Failed to delete testimonial');
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      showErrorNotification(
        t('admin.content.error', 'Error'),
        t('admin.content.errorDeletingTestimonial', 'Error deleting testimonial')
      );
    }
  };

  // وظائف التعامل مع المنشورات
  const handleTogglePublishStatus = async (postId: string, currentStatus: boolean) => {
    try {
      // Get the post to update
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      // Determine new status
      const newPublishedStatus = !currentStatus;
      const newStatus = newPublishedStatus ? 'published' : 'draft';

      // Update in database
      const { error } = await supabase
        .from('blog_posts')
        .update({
          published: newPublishedStatus,
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', postId);

      if (error) throw error;

      // Update local state
      setPosts(posts.map(post =>
        post.id === postId ? {
          ...post,
          published: newPublishedStatus,
          status: newStatus,
          updated_at: new Date().toISOString()
        } : post
      ));

      showSuccessNotification(
        newPublishedStatus
          ? t('admin.content.published', 'Published')
          : t('admin.content.unpublished', 'Unpublished'),
        newPublishedStatus
          ? t('admin.content.postPublished', 'Post published successfully')
          : t('admin.content.postUnpublished', 'Post unpublished successfully')
      );
    } catch (error) {
      console.error('Error updating post status:', error);
      showErrorNotification(
        t('admin.content.error', 'Error'),
        t('admin.content.errorUpdatingPost', 'Error updating post status')
      );
    }
  };

  // Filter posts based on search term, status filter, and category filter
  const filteredPosts = posts.filter(post => {
    const matchesSearch =
      post.title_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.title_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content_ar.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'published' && post.published) ||
      (statusFilter === 'draft' && !post.published);

    const matchesCategory =
      categoryFilter === 'all' ||
      post.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Filter comments based on search term and status filter
  const filteredComments = comments.filter(comment => {
    const authorName = comment.author_name || comment.user_name || '';

    const matchesSearch =
      authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.content.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'approved') return matchesSearch && (comment.approved || comment.status === 'approved');
    if (statusFilter === 'pending') return matchesSearch && (!comment.approved && comment.status !== 'approved');
    return matchesSearch;
  });

  // Filter testimonials based on search term and status filter
  const filteredTestimonials = testimonials.filter(testimonial => {
    const matchesSearch =
      testimonial.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimonial.content.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'approved') return matchesSearch && testimonial.approved;
    if (statusFilter === 'pending') return matchesSearch && !testimonial.approved;
    return matchesSearch;
  });

  // تحقق من وجود مفاتيح الترجمة في وحدة التخزين المحلية
  console.log('Current translation keys:', t('admin.content.title'), t('admin.content.blog'));

  // استخدام نصوص ثابتة إذا كانت مفاتيح الترجمة غير موجودة
  const contentTitle = t('admin.content.title') === 'admin.content.title' ?
    (language === 'ar' ? 'إدارة المحتوى' : 'Content Management') :
    t('admin.content.title');

  const blogTabTitle = t('admin.content.blog') === 'admin.content.blog' ?
    (language === 'ar' ? 'المدونة' : 'Blog Posts') :
    t('admin.content.blog');

  const commentsTabTitle = t('admin.content.comments') === 'admin.content.comments' ?
    (language === 'ar' ? 'التعليقات' : 'Comments') :
    t('admin.content.comments');

  const testimonialsTabTitle = t('admin.content.testimonials') === 'admin.content.testimonials' ?
    (language === 'ar' ? 'آراء العملاء' : 'Testimonials') :
    t('admin.content.testimonials');

  const addPostTitle = t('admin.content.addPost') === 'admin.content.addPost' ?
    (language === 'ar' ? 'إضافة منشور جديد' : 'Add New Post') :
    t('admin.content.addPost');

  const editPostTitle = t('admin.content.editPost') === 'admin.content.editPost' ?
    (language === 'ar' ? 'تعديل المنشور' : 'Edit Post') :
    t('admin.content.editPost');

  const deletePostTitle = t('admin.content.deletePost') === 'admin.content.deletePost' ?
    (language === 'ar' ? 'حذف المنشور' : 'Delete Post') :
    t('admin.content.deletePost');

  const previewPostTitle = t('admin.content.previewPost') === 'admin.content.previewPost' ?
    (language === 'ar' ? 'معاينة المنشور' : 'Preview Post') :
    t('admin.content.previewPost');

  const confirmDeleteTitle = t('admin.content.confirmDelete') === 'admin.content.confirmDelete' ?
    (language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete') :
    t('admin.content.confirmDelete');

  const publishedStatus = t('admin.content.published') === 'admin.content.published' ?
    (language === 'ar' ? 'منشور' : 'Published') :
    t('admin.content.published');

  const draftStatus = t('admin.content.draft') === 'admin.content.draft' ?
    (language === 'ar' ? 'مسودة' : 'Draft') :
    t('admin.content.draft');

  const scheduledStatus = t('admin.content.scheduled') === 'admin.content.scheduled' ?
    (language === 'ar' ? 'مجدول' : 'Scheduled') :
    t('admin.content.scheduled');

  const approvedStatus = t('admin.content.approved') === 'admin.content.approved' ?
    (language === 'ar' ? 'موافق عليه' : 'Approved') :
    t('admin.content.approved');

  const pendingStatus = t('admin.content.pending') === 'admin.content.pending' ?
    (language === 'ar' ? 'معلق' : 'Pending') :
    t('admin.content.pending');

  const categoryTips = t('admin.content.categoryTips') === 'admin.content.categoryTips' ?
    (language === 'ar' ? 'نصائح' : 'Tips') :
    t('admin.content.categoryTips');

  const categoryNews = t('admin.content.categoryNews') === 'admin.content.categoryNews' ?
    (language === 'ar' ? 'أخبار' : 'News') :
    t('admin.content.categoryNews');

  return (
    <>
      {/* نافذة تفاصيل التعليق */}
      <CommentDetailsModal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        comment={selectedComment}
        postTitle={selectedComment ?
          posts.find(post => post.id === selectedComment.post_id)
            ? (language === 'ar'
                ? posts.find(post => post.id === selectedComment.post_id)?.title_ar
                : posts.find(post => post.id === selectedComment.post_id)?.title_en)
            : (isRTL ? "منشور غير معروف" : "Unknown Post")
          : ''
        }
      />

      {/* نافذة تفاصيل التقييم */}
      <TestimonialDetailsModal
        isOpen={isTestimonialModalOpen}
        onClose={() => setIsTestimonialModalOpen(false)}
        testimonial={selectedTestimonial}
      />

      {/* نافذة تأكيد الحذف */}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation(prev => ({ ...prev, isOpen: false }))}
        onConfirm={() => {
          if (deleteConfirmation.itemType === 'post') {
            confirmDeletePost(deleteConfirmation.itemId);
          } else if (deleteConfirmation.itemType === 'comment') {
            confirmDeleteComment(deleteConfirmation.itemId);
          } else if (deleteConfirmation.itemType === 'testimonial') {
            confirmDeleteTestimonial(deleteConfirmation.itemId);
          }
          setDeleteConfirmation(prev => ({ ...prev, isOpen: false }));
        }}
        message={deleteConfirmation.message}
        confirmText={t('common.delete', 'Delete')}
        cancelText={t('common.cancel', 'Cancel')}
        type="danger"
      />

      {showPostForm && (
        <BlogPostForm
          postId={editingPostId || undefined}
          onClose={() => {
            setShowPostForm(false);
            setEditingPostId(null);
          }}
          onSuccess={() => {
            setShowPostForm(false);
            setEditingPostId(null);
            // Refetch posts
            if (activeTab === 'blog') {
              const fetchPosts = async () => {
                setIsLoadingPosts(true);
                try {
                  // Fetch posts first
                  const { data, error } = await supabase
                    .from('blog_posts')
                    .select('*')
                    .order('created_at', { ascending: false });

                  if (error) throw error;

                  if (data && data.length > 0) {
                    // Get unique author IDs
                    const authorIds = [...new Set(data.map(post => post.author_id))].filter(Boolean);

                    // Create a map to store author information
                    const authorMap = {};

                    // If there are author IDs, fetch their profiles
                    if (authorIds.length > 0) {
                      const { data: authorData } = await supabase
                        .from('profiles')
                        .select('id, name, email')
                        .in('id', authorIds);

                      // Create a map of author data
                      if (authorData) {
                        authorData.forEach(author => {
                          authorMap[author.id] = author;
                        });
                      }
                    }

                    const formattedPosts: Post[] = data.map(post => ({
                      id: post.id,
                      title_en: post.title_en || 'Untitled',
                      title_ar: post.title_ar || 'بدون عنوان',
                      summary_en: post.summary_en || post.content_en?.substring(0, 150) + '...' || '',
                      summary_ar: post.summary_ar || post.content_ar?.substring(0, 150) + '...' || '',
                      content_en: post.content_en || '',
                      content_ar: post.content_ar || '',
                      category: post.category || 'tips',
                      status: post.status || (post.published ? 'published' : 'draft'),
                      scheduled_at: post.scheduled_at || null,
                      published: post.published || false,
                      author_id: post.author_id || '',
                      author_name: authorMap[post.author_id]?.name ||
                                  authorMap[post.author_id]?.email?.split('@')[0] ||
                                  'Unknown',
                      created_at: post.created_at || new Date().toISOString(),
                      updated_at: post.updated_at || new Date().toISOString(),
                      image_url: post.image_url || '',
                      likes_count: post.likes_count || 0,
                      dislikes_count: post.dislikes_count || 0,
                      views: post.views || 0
                    }));

                    setPosts(formattedPosts);
                  }
                } catch (error) {
                  console.error('Error fetching posts:', error);
                } finally {
                  setIsLoadingPosts(false);
                }
              };

              fetchPosts();
            }
          }}
        />
      )}

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">{contentTitle}</h1>

        {/* Tabs */}
        <div className="flex border-b mb-6">
          <button
            className={`${
              activeTab === 'blog'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            } flex items-center px-4 py-2 font-medium`}
            onClick={() => setActiveTab('blog')}
          >
            <FileText className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {blogTabTitle}
          </button>
          <button
            className={`${
              activeTab === 'comments'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            } flex items-center px-4 py-2 font-medium`}
            onClick={() => setActiveTab('comments')}
          >
            <MessageSquare className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {commentsTabTitle}
          </button>
          <button
            className={`${
              activeTab === 'testimonials'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            } flex items-center px-4 py-2 font-medium`}
            onClick={() => setActiveTab('testimonials')}
          >
            <Star className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {testimonialsTabTitle}
          </button>
        </div>

        {/* Success and Error Messages */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {errorMessage}
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row justify-between mb-6">
          <div className="relative mb-4 md:mb-0 md:w-1/3">
            <input
              type="text"
              placeholder={t('common.search')}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Status Filter */}
            <div className="relative">
              <select
                className="appearance-none pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">{t('common.all')}</option>
                {activeTab === 'blog' && (
                  <>
                    <option value="draft">{t('admin.content.draft')}</option>
                    <option value="published">{t('admin.content.published')}</option>
                  </>
                )}
                {activeTab === 'comments' && (
                  <>
                    <option value="approved">{t('admin.content.approved')}</option>
                    <option value="pending">{t('admin.content.pending')}</option>
                  </>
                )}
                {activeTab === 'testimonials' && (
                  <>
                    <option value="approved">{t('admin.content.approved')}</option>
                    <option value="pending">{t('admin.content.pending')}</option>
                  </>
                )}
              </select>
              <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            {/* Category Filter (only for blog) */}
            {activeTab === 'blog' && (
              <div className="relative">
                <select
                  className="appearance-none pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">{t('common.allCategories', 'All Categories')}</option>
                  <option value="tips">{t('admin.content.categoryTips', 'Tips')}</option>
                  <option value="news">{t('admin.content.categoryNews', 'News')}</option>
                </select>
                <Tag className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            )}

            {/* Add Button (only for blog) */}
            {activeTab === 'blog' && (
              <button
                onClick={handleAddPost}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {addPostTitle}
              </button>
            )}
          </div>
        </div>

      {/* Content based on active tab */}
      {activeTab === 'blog' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {isLoadingPosts ? (
            <div className="p-6 text-center">
              <p>{t('common.loading')}</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="p-6 text-center">
              <p>{t('common.noResults')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {isRTL ? "العنوان" : "Title"}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {isRTL ? "الكاتب" : "Author"}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {isRTL ? "الحالة" : "Status"}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {isRTL ? "تاريخ النشر" : "Publish Date"}
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {isRTL ? "الإجراءات" : "Actions"}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPosts.map((post) => (
                    <tr key={post.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {language === 'ar' ? post.title_ar : post.title_en}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          <Tag className="h-3 w-3 inline mr-1" />
                          {post.category === 'tips'
                            ? t('admin.content.categoryTips', 'Tips')
                            : t('admin.content.categoryNews', 'News')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{post.author_name || 'Unknown'}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {post.author_id === user?.id
                            ? t('admin.content.you', 'You')
                            : t('admin.content.admin', 'Admin')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          post.status === 'published' ? 'bg-green-100 text-green-800' :
                          post.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {post.status === 'published' ? publishedStatus :
                           post.status === 'scheduled' ? scheduledStatus :
                           draftStatus}
                        </span>
                        {post.status === 'scheduled' && post.scheduled_at && (
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(post.scheduled_at).toLocaleString(
                              language === 'ar' ? 'ar-SA' : 'en-US',
                              { calendar: 'gregory' } // Always use Gregorian calendar even for Arabic
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(post.created_at).toLocaleDateString(
                          language === 'ar' ? 'ar-SA' : 'en-US',
                          { calendar: 'gregory' } // Always use Gregorian calendar even for Arabic
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {/* Toggle Publish Status */}
                        <button
                          onClick={() => handleTogglePublishStatus(post.id, post.published)}
                          className={`mr-3 ${post.published ? 'text-orange-500 hover:text-orange-700' : 'text-green-600 hover:text-green-800'}`}
                          title={post.published ? t('admin.content.unpublish') : t('admin.content.publish')}
                        >
                          {post.published ? (
                            <XCircle className="h-5 w-5" />
                          ) : (
                            <CheckCircle className="h-5 w-5" />
                          )}
                        </button>

                        {/* Edit Post */}
                        <button
                          onClick={() => handleEditPost(post.id)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                          title={editPostTitle}
                        >
                          <Edit className="h-5 w-5" />
                        </button>

                        {/* Preview Post */}
                        <a
                          href={`/post/${post.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-900 mr-3 inline-block"
                          title={previewPostTitle}
                        >
                          <ExternalLink className="h-5 w-5" />
                        </a>

                        {/* Delete Post */}
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className={`${confirmDelete === post.id ? 'text-red-800 bg-red-100 p-1 rounded' : 'text-red-600 hover:text-red-900'}`}
                          title={confirmDelete === post.id ? confirmDeleteTitle : deletePostTitle}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Comments Tab Content */}
      {activeTab === 'comments' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {isLoadingComments ? (
            <div className="p-6 text-center">
              <p>{t('common.loading')}</p>
            </div>
          ) : filteredComments.length === 0 ? (
            <div className="p-6 text-center">
              <p>{t('common.noResults')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {isRTL ? "كاتب التعليق" : "Comment Author"}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {isRTL ? "محتوى التعليق" : "Comment Content"}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {isRTL ? "المنشور" : "Post"}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {isRTL ? "حالة التعليق" : "Comment Status"}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {isRTL ? "تاريخ التعليق" : "Comment Date"}
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {isRTL ? "الإجراءات" : "Actions"}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredComments.map((comment) => (
                    <tr key={comment.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{comment.author_name || comment.user_name || 'Anonymous'}</div>
                        <div className="text-xs text-gray-500">{comment.author_email || comment.user_id || 'Guest'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 line-clamp-2">{comment.content}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(() => {
                          // البحث عن المنشور المرتبط بالتعليق
                          const relatedPost = posts.find(post => post.id === comment.post_id);
                          return (
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {relatedPost
                                  ? (language === 'ar' ? relatedPost.title_ar : relatedPost.title_en)
                                  : (isRTL ? "منشور غير معروف" : "Unknown Post")}
                              </div>
                              <div className="text-xs text-gray-500">
                                {comment.post_id ? `ID: ${comment.post_id.substring(0, 8)}...` : ''}
                              </div>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          (comment.approved || comment.status === 'approved') ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {(comment.approved || comment.status === 'approved') ? approvedStatus : pendingStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(comment.created_at).toLocaleDateString(
                          language === 'ar' ? 'ar-SA' : 'en-US',
                          { calendar: 'gregory' } // Always use Gregorian calendar even for Arabic
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {/* زر الموافقة/الرفض */}
                        <button
                          onClick={() => handleToggleCommentApproval(comment.id, comment.approved || comment.status === 'approved')}
                          className={`mr-3 ${(comment.approved || comment.status === 'approved') ? 'text-orange-500 hover:text-orange-700' : 'text-green-600 hover:text-green-800'}`}
                          title={(comment.approved || comment.status === 'approved') ? (isRTL ? "إلغاء الموافقة" : "Disapprove") : (isRTL ? "موافقة" : "Approve")}
                        >
                          {(comment.approved || comment.status === 'approved') ? (
                            <XCircle className="h-5 w-5" />
                          ) : (
                            <CheckCircle className="h-5 w-5" />
                          )}
                        </button>

                        {/* زر العرض */}
                        <button
                          onClick={() => handleViewComment(comment.id)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          title={isRTL ? "عرض التعليق" : "View Comment"}
                        >
                          <Eye className="h-5 w-5" />
                        </button>

                        {/* زر عرض المنشور */}
                        <a
                          href={`/post/${comment.post_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-900 mr-3 inline-block"
                          title={isRTL ? "عرض المنشور" : "View Post"}
                        >
                          <ExternalLink className="h-5 w-5" />
                        </a>

                        {/* زر الحذف */}
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-red-600 hover:text-red-900"
                          title={isRTL ? "حذف التعليق" : "Delete Comment"}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Testimonials Tab Content */}
      {activeTab === 'testimonials' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {isLoadingTestimonials ? (
            <div className="p-6 text-center">
              <p>{t('common.loading')}</p>
            </div>
          ) : filteredTestimonials.length === 0 ? (
            <div className="p-6 text-center">
              <p>{t('common.noResults')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {isRTL ? "كاتب الرأي" : "Testimonial Author"}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {isRTL ? "محتوى الرأي" : "Testimonial Content"}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {isRTL ? "التقييم" : "Rating"}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {isRTL ? "الحالة" : "Status"}
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {isRTL ? "الإجراءات" : "Actions"}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTestimonials.map((testimonial) => (
                    <tr key={testimonial.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{testimonial.user_name}</div>
                        <div className="text-sm text-gray-500">{testimonial.user_id || 'Guest'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 line-clamp-2">{testimonial.content}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                          <span className={`${isRTL ? 'mr-2' : 'ml-2'} text-sm text-gray-600`}>{testimonial.rating}/5</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          testimonial.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {testimonial.approved ? approvedStatus : pendingStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {/* زر الموافقة/الرفض */}
                        <button
                          onClick={() => handleToggleTestimonialApproval(testimonial.id, testimonial.approved)}
                          className={`mr-3 ${testimonial.approved ? 'text-orange-500 hover:text-orange-700' : 'text-green-600 hover:text-green-800'}`}
                          title={testimonial.approved ? (isRTL ? "إلغاء الموافقة" : "Disapprove") : (isRTL ? "موافقة" : "Approve")}
                        >
                          {testimonial.approved ? (
                            <XCircle className="h-5 w-5" />
                          ) : (
                            <CheckCircle className="h-5 w-5" />
                          )}
                        </button>

                        {/* زر العرض */}
                        <button
                          onClick={() => handleViewTestimonial(testimonial.id)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          title={isRTL ? "عرض الرأي" : "View Testimonial"}
                        >
                          <Eye className="h-5 w-5" />
                        </button>

                        {/* زر الحذف */}
                        <button
                          onClick={() => handleDeleteTestimonial(testimonial.id)}
                          className="text-red-600 hover:text-red-900"
                          title={isRTL ? "حذف الرأي" : "Delete Testimonial"}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
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
    </>
  );
};

export default ContentManagement;
