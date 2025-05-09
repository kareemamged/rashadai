import { Comment } from '../types';

// Sample comments data
export const comments: Comment[] = [
  {
    id: '1',
    postId: '1',
    author: 'John Doe',
    content: 'This is really fascinating research. Looking forward to seeing how it develops in the coming years.',
    createdAt: '2024-05-16T12:34:56Z'
  },
  {
    id: '2',
    postId: '1',
    author: 'Jane Smith',
    content: 'I wonder how this technology could be applied to rare diseases where data is limited?',
    createdAt: '2024-05-16T14:22:33Z'
  },
  {
    id: '3',
    postId: '2',
    author: 'Robert Johnson',
    content: 'Great advice! I\'ve been implementing similar changes and have seen my blood pressure improve significantly.',
    createdAt: '2024-05-11T09:15:27Z'
  },
  {
    id: '4',
    postId: '3',
    author: 'Alice Williams',
    content: 'Just downloaded the app and it\'s incredibly user-friendly. The medication reminder feature is exactly what I needed!',
    createdAt: '2024-05-06T18:55:12Z'
  }
];

// Function to get comments for a specific post
export const getCommentsByPostId = (postId: string): Comment[] => {
  return comments.filter(comment => comment.postId === postId);
};

// Function to add a comment (in a real app, this would interact with a backend)
export let nextCommentId = comments.length + 1;

export const addComment = (postId: string, author: string, content: string): Comment => {
  const newComment: Comment = {
    id: String(nextCommentId++),
    postId,
    author,
    content,
    createdAt: new Date().toISOString()
  };
  
  comments.push(newComment);
  return newComment;
};