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

// Utility function to convert file to base64
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

// Transform backend response to frontend Update type
const transformPostToUpdate = (post: PostResponse | null | undefined): any => {
  if (!post) return null;

  const postedBy = post.user 
    ? `${post.user.first_name} ${post.user.last_name}`.trim() || post.user.username
    : 'Anonymous';

  return {
    id: post.id,
    title: post.title,
    content: post.content,
    category: post.category,
    type: post.post_type || 'latest-news',
    actionButtonLabel: post.action_button_label || '',
    actionButtonUrl: post.action_button_url || '',
    imageUrl: post.image,
    postedBy: postedBy,
    postedAt: new Date(post.created_at),
    attachments: post.attachments.map(att => ({
      name: att.file.split('/').pop() || 'File',
      url: att.file,
      type: att.file.split('.').pop() || 'file'
    }))
  };
};

// API functions factory - accepts fetchWithAuth function
export const createPostsApi = (fetchWithAuth: any) => ({
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

    const data: PostsListResponse = await fetchWithAuth({
      method: 'GET',
      path: '/posts/',
      queryParams,
    });
    
    return {
      posts: data.results.map(transformPostToUpdate),
      count: data.count
    };
  },

  // Create new post
  async createPost(postData: any): Promise<any> {

    const data: any = await fetchWithAuth({
      method: 'POST',
      path: '/posts/',
      body: postData,
    });

    return data?.data ?? data;
  },

  // Update existing post
  async updatePost(id: string, postData: {
    title?: string;
    content?: string;
    category?: string;
    image?: File | null;
    attachments?: File[];
    removeImage?: boolean;
  }): Promise<any> {
    const requestBody: any = {};
    
    if (postData.title !== undefined) requestBody.title = postData.title;
    if (postData.content !== undefined) requestBody.content = postData.content;
    if ((postData as any).category !== undefined) requestBody.category = (postData as any).category;
    if ((postData as any).post_type !== undefined) requestBody.post_type = (postData as any).post_type;
    if ((postData as any).action_button_label !== undefined) requestBody.action_button_label = (postData as any).action_button_label;
    if ((postData as any).action_button_url !== undefined) requestBody.action_button_url = (postData as any).action_button_url;
    
    // Handle image update
    if (postData.removeImage) {
      requestBody.remove_image = true;
    } else if (postData.image) {
      requestBody.image_base64 = await fileToBase64(postData.image);
      requestBody.image_name = postData.image.name;
    }

    // Handle new attachments
    if (postData.attachments && postData.attachments.length > 0) {
      requestBody.new_attachments = await Promise.all(
        postData.attachments.map(async (file) => ({
          file_base64: await fileToBase64(file),
          file_name: file.name,
        }))
      );
    }

    const data: any = await fetchWithAuth({
      method: 'PATCH',
      path: `/posts/${id}/`,
      body: requestBody,
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
    const data: PostResponse = await fetchWithAuth({
      method: 'GET',
      path: `/posts/${id}/`,
    });

    return transformPostToUpdate(data);
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
    });
  }
});

// For backwards compatibility, you can export a default instance
// but you'll need to pass fetchWithAuth when you use it
export const postsApi = {
  // This will be initialized with your fetchWithAuth function
  init: (fetchWithAuth: any) => createPostsApi(fetchWithAuth)
};
