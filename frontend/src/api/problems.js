import axiosInstance from "../lib/axios";

export const problemsApi = {
  getProblems: async ({ page = 1, limit = 100, search = "", difficulty = "" } = {}) => {
    const response = await axiosInstance.get("/problems", {
      params: {
        page,
        limit,
        search: search || undefined,
        difficulty: difficulty || undefined,
      },
    });
    return response.data;
  },

  getProblemById: async (id) => {
    const response = await axiosInstance.get(`/problems/${id}`);
    return response.data;
  },
};
