export interface Post {
  id: string;
  title: {
    en: string;
    ar: string;
  };
  summary: {
    en: string;
    ar: string;
  };
  content: {
    en: string;
    ar: string;
  };
  category: 'news' | 'tip';
  publishedDate: string;
  imageUrl?: string;
}

export interface Comment {
  id: string;
  postId: string;
  author: string;
  content: string;
  createdAt: string;
}