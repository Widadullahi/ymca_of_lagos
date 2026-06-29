// api/postsApi.ts

// API response types
interface PostResponse {
  id: string;
  user: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
  } | null;
  title: string;
  content: string;
  category: string;
  created_at: string;
  updated_at: string;
  image: string | null;
  action_button_label?: string | null;
  action_button_url?: string | null;
  post_type?: 'latest-news' | 'upcoming-event';
  attachments: {
    id: string;
    file: string;
    created_at: string;
    updated_at: string;
  }[];
}

interface PostsListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PostResponse[];
}

// Utility function to convert file to base64 (Deprecated - using FormData instead)
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
};

// API functions factory - accepts fetchWithAuth function and BACKEND_URL
export const createPostsApi = (fetchWithAuth: any, BACKEND_URL: string) => {
  const mediaBaseUrl = BACKEND_URL.replace(/\/api\/v1\/?$/, '');
  // Utility function to convert relative URLs to absolute
  const toAbsoluteUrl = (url?: any): string => {
    if (!url) return '';
    if (typeof url !== 'string') return '';
    if (/^https?:\/\//i.test(url)) return url;
    if (url.startsWith('//')) return `${window.location.protocol}${url}`;
    if (url.startsWith('/')) return `${mediaBaseUrl}${url}`;
    return `${mediaBaseUrl}/${url.replace(/^\/+/, '')}`;
  };

  // Transform backend response to frontend Update type
  const transformPostToUpdate = (post: any | null | undefined): any => {
    if (!post) return null;

    const postedBy = post.user 
      ? `${post.user.first_name} ${post.user.last_name}`.trim() || post.user.username
      : 'Anonymous';

    const attachments = Array.isArray(post.attachments) ? post.attachments : 
                        Array.isArray(post.attachments_data) ? post.attachments_data : [];

    // Safely create a Date object, fallback to current date if invalid
    let postedAt: Date;
    try {
      postedAt = new Date(post.created_at);
      if (isNaN(postedAt.getTime())) {
        postedAt = new Date();
      }
    } catch {
      postedAt = new Date();
    }

    return {
      id: post.id,
      title: post.title || '',
      content: post.content || '',
      category: post.category || 'Uncategorized',
      type: post.post_type || post.type || (post.category === 'Events' ? 'upcoming-event' : 'latest-news'),
      actionButtonLabel: post.action_button_label || post.actionButtonLabel || '',
      actionButtonUrl: post.action_button_url || post.actionButtonUrl || '',
      imageUrl: toAbsoluteUrl(post.image || post.image_url || post.imageUrl || post?.image_base64),
      postedBy: postedBy,
      postedAt: postedAt,
      created_at: postedAt.toISOString(), // Add created_at as ISO string for formatDistance
      attachments: attachments.map((att: any) => ({
        name: (att.file || att.url || '').split('/').pop() || 'File',
        url: toAbsoluteUrl(att.file || att.url),
        type: (att.file || att.url || '').split('.').pop() || 'file'
      })),
      images: [toAbsoluteUrl(post.image || post.image_url || post.imageUrl || post?.image_base64), ...attachments.filter((att: any) => 
        ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(((att.file || att.url || '').split('.').pop() || '').toLowerCase())
      ).map((att: any) => toAbsoluteUrl(att.file || att.url))].filter(Boolean)
    };
  };

  return {
  // Fetch units
  async getUnits(): Promise<any[]> {
    try {
      const response = await fetchWithAuth({
        method: 'GET',
        path: '/youth-groups',
      });
      
      // Transform the API response to option format
      return response?.data?.map((unit: any) => ({
        value: unit.id,
        label: unit.name
      })) || [];
    } catch (error) {
      console.error('Error fetching units:', error);
      return [];
    }
  },
  // Fetch all posts
  async getPosts(params?: {
    search?: string;
    category?: string;
    page?: number;
    page_size?: number;
  }): Promise<{ posts: any[]; count: number }> {
    const queryParams: Record<string, any> = {};
    
    if (params?.search) queryParams.search = params.search;
    if (params?.category && params.category !== 'All') queryParams.category = params.category;
    if (params?.page) queryParams.page = params.page;
    if (params?.page_size) queryParams.page_size = params.page_size;

    try {
      const response = await fetchWithAuth({
        method: 'GET',
        path: '/posts/',
        queryParams,
      });
      
      // Handle different response structures!
      let posts: any[] = [];
      let count: number = 0;
      
      if (response) {
        if (Array.isArray(response)) {
          posts = response;
          count = response.length;
        } else if (Array.isArray(response.data)) {
          posts = response.data;
          count = response.data.length;
        } else if (Array.isArray(response.results)) {
          posts = response.results;
          count = response.count || response.results.length;
        }
      }
      
      return {
        posts: posts.filter(Boolean).map(transformPostToUpdate).filter(Boolean),
        count: count
      };
    } catch (error) {
      console.error('Error in getPosts:', error);
      return {
        posts: [],
        count: 0
      };
    }
  },

  // Create new post
  async createPost(postData: any): Promise<any> {

    const data: any = await fetchWithAuth({
      method: 'POST',
      path: '/posts/',
      body: postData,
      isFormData: postData instanceof FormData,
      timeoutMS: 600000, // 10 minutes timeout for large video uploads
    });

    return data?.data ?? data;
  },

  // Update existing post
  async updatePost(id: string, postData: any): Promise<any> {
    const data: any = await fetchWithAuth({
      method: 'PATCH',
      path: `/posts/${id}/`,
      body: postData,
      isFormData: postData instanceof FormData,
      timeoutMS: 600000, // 10 minutes timeout for large video uploads
    });

    return data?.data ?? data;
  },

  // Delete post
  async deletePost(id: string): Promise<void> {
    await fetchWithAuth({
      method: 'DELETE',
      path: `/posts/${id}/`,
    });
  },

  // Get single post
  async getPost(id: string): Promise<any> {
    try {
      const data: PostResponse = await fetchWithAuth({
        method: 'GET',
        path: `/posts/${id}/`,
      });

      return transformPostToUpdate(data);
    } catch (error) {
      console.error('Error in getPost:', error);
      return null;
    }
  },

  // Upload single attachment to existing post
  async uploadAttachment(postId: string, file: File): Promise<void> {
    const requestBody = {
      post: postId,
      file_base64: await fileToBase64(file),
      file_name: file.name,
    };

    await fetchWithAuth({
      method: 'POST',
      path: '/attachments/',
      body: requestBody,
      timeoutMS: 120000,
    });
  },

  // Delete attachment
  async deleteAttachment(attachmentId: string): Promise<void> {
    await fetchWithAuth({
      method: 'DELETE',
      path: `/attachments/${attachmentId}/`,
    });
  },

  // Bulk upload attachments
  async uploadAttachments(postId: string, files: File[]): Promise<void> {
    const attachments = await Promise.all(
      files.map(async (file) => ({
        post: postId,
        file_base64: await fileToBase64(file),
        file_name: file.name,
      }))
    );

    await fetchWithAuth({
      method: 'POST',
      path: '/attachments/bulk/',
      body: { attachments },
      timeoutMS: 120000,
    });
  }
  };
};

// For backwards compatibility, you can export a default instance
// but you'll need to pass fetchWithAuth when you use it
export const postsApi = {
  // This will be initialized with your fetchWithAuth function
  init: (fetchWithAuth: any, BACKEND_URL: string) => createPostsApi(fetchWithAuth, BACKEND_URL)
};
