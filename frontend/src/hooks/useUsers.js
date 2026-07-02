import { useQuery } from "@tanstack/react-query";
import { userApi } from "../api/users";

export const useMyScoreSummary = () =>
  useQuery({
    queryKey: ["myScoreSummary"],
    queryFn: userApi.getMyScoreSummary,
  });

export const useMySolvedProblems = () =>
  useQuery({
    queryKey: ["mySolvedProblems"],
    queryFn: userApi.getMySolvedProblems,
  });

export const useLeaderboard = (limit = 50) =>
  useQuery({
    queryKey: ["leaderboard", limit],
    queryFn: () => userApi.getLeaderboard(limit),
  });
