import axiosInstance from "../lib/axios";

export const blogApi = {
  getPosts: async (language = "en") => {
    const response = await axiosInstance.get("/blog", {
      params: { lang: language },
    });
    return response.data;
  },

  getPost: async (slug, language = "en") => {
    const response = await axiosInstance.get(`/blog/${slug}`, {
      params: { lang: language },
    });
    return response.data;
  },

  getMyPosts: async () => {
    const response = await axiosInstance.get("/blog/community/me");
    return response.data;
  },

  createCommunityPost: async (payload) => {
    const response = await axiosInstance.post("/blog/community", payload);
    return response.data;
  },

  updateCommunityPost: async ({ id, payload }) => {
    const response = await axiosInstance.put(`/blog/community/${id}`, payload);
    return response.data;
  },

  deleteCommunityPost: async (id) => {
    const response = await axiosInstance.delete(`/blog/community/${id}`);
    return response.data;
  },

  reactToPost: async ({ id, type }) => {
    const response = await axiosInstance.post(`/blog/community/${id}/reactions`, {
      type,
    });
    return response.data;
  },

  addComment: async ({ id, content }) => {
    const response = await axiosInstance.post(`/blog/community/${id}/comments`, {
      content,
    });
    return response.data;
  },

  addCommentReply: async ({ postId, commentId, content }) => {
    const response = await axiosInstance.post(
      `/blog/community/${postId}/comments/${commentId}/replies`,
      { content },
    );
    return response.data;
  },

  reactToComment: async ({ postId, commentId, type }) => {
    const response = await axiosInstance.post(
      `/blog/community/${postId}/comments/${commentId}/reactions`,
      { type },
    );
    return response.data;
  },

  updateComment: async ({ postId, commentId, content }) => {
    const response = await axiosInstance.put(
      `/blog/community/${postId}/comments/${commentId}`,
      { content },
    );
    return response.data;
  },

  deleteComment: async ({ postId, commentId }) => {
    const response = await axiosInstance.delete(
      `/blog/community/${postId}/comments/${commentId}`,
    );
    return response.data;
  },
};
