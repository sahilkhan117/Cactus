const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Helper to fetch data with Authorization headers
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('cactus_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

export const api = {
  // Authentication
  auth: {
    register: (email, password, fullName) =>
      request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, fullName }),
      }),
    login: (email, password) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    verify: () => request('/auth/verify'),
  },

  // Users
  users: {
    getMe: () => request('/users/me'),
    updateMe: (bio, avatarUrl) =>
      request('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({ bio, avatarUrl }),
      }),
    getProfile: (id) => request(`/users/${id}`),
  },

  // Posts
  posts: {
    getFeed: (cursor = '', limit = 20) => {
      const query = new URLSearchParams();
      if (cursor) query.append('cursor', cursor);
      if (limit) query.append('limit', limit.toString());
      return request(`/posts?${query.toString()}`);
    },
    getPost: (id) => request(`/posts/${id}`),
    createPost: (content, mediaUrls = [], tags = []) =>
      request('/posts', {
        method: 'POST',
        body: JSON.stringify({ content, mediaUrls, tags }),
      }),
    deletePost: (id) =>
      request(`/posts/${id}`, {
        method: 'DELETE',
      }),
    toggleLike: (id) =>
      request(`/posts/${id}/like`, {
        method: 'POST',
      }),
  },

  // Comments
  comments: {
    getComments: (postId, cursor = '', limit = 20) => {
      const query = new URLSearchParams();
      if (cursor) query.append('cursor', cursor);
      if (limit) query.append('limit', limit.toString());
      return request(`/posts/${postId}/comments?${query.toString()}`);
    },
    createComment: (postId, content) =>
      request(`/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      }),
  },

  // Chat
  chat: {
    getConversations: () => request('/chat/conversations'),
    getMessages: (conversationId, cursor = '', limit = 50) => {
      const query = new URLSearchParams();
      if (cursor) query.append('cursor', cursor);
      if (limit) query.append('limit', limit.toString());
      return request(`/chat/conversations/${conversationId}/messages?${query.toString()}`);
    },
  },

  // Search
  search: {
    posts: (query) => request(`/search/posts?q=${encodeURIComponent(query)}`),
  },

  // Notifications
  notifications: {
    getNotifications: () => request('/notifications'),
    markAsRead: () =>
      request('/notifications/read', {
        method: 'PUT',
      }),
  },

  // Upload Utility
  upload: {
    image: async (file) => {
      const token = localStorage.getItem('cactus_token');
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }
      return data; // { url: '...' }
    },
  },

  // Stories
  stories: {
    create: (mediaUrl) =>
      request('/stories', {
        method: 'POST',
        body: JSON.stringify({ mediaUrl }),
      }),
    getAll: () => request('/stories'),
  },
};

