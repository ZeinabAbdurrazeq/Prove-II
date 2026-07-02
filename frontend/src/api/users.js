import axiosInstance from "../lib/axios";

export const userApi = {
  getMyScoreSummary: async () => {
    const response = await axiosInstance.get("/users/me/score-summary");
    return response.data;
  },

  getMySolvedProblems: async () => {
    const response = await axiosInstance.get("/users/me/solved-problems");
    return response.data;
  },

  getLeaderboard: async (limit = 50) => {
    const response = await axiosInstance.get("/users/leaderboard", {
      params: { limit },
    });
    return response.data;
  },
};
