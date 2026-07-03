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
};
