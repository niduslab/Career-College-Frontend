import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getLearningPaths,
  getLearningPathProgress,
  getMyLearningPaths,
  enrollInLearningPath,
  leaveLearningPath,
} from "@/lib/course-api";

/** Public browse list of published learning paths. */
export function useLearningPaths(
  params: { page?: number; page_size?: number } = {},
) {
  return useQuery({
    queryKey: ["learning-paths", params],
    queryFn: () => getLearningPaths(params),
    placeholderData: (previousData) => previousData,
  });
}

/** Learner-facing path detail with derived per-milestone status + overall percent. */
export function useLearningPathProgress(slug: string | undefined) {
  return useQuery({
    queryKey: ["learning-path-progress", slug],
    queryFn: () => getLearningPathProgress(slug as string),
    enabled: !!slug,
  });
}

/** The caller's enrolled paths, each with derived progress. */
export function useMyLearningPaths() {
  return useQuery({
    queryKey: ["my-learning-paths"],
    queryFn: getMyLearningPaths,
  });
}

export function useEnrollInLearningPath() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => enrollInLearningPath(slug),
    onSuccess: (_res, slug) => {
      queryClient.invalidateQueries({ queryKey: ["learning-path-progress", slug] });
      queryClient.invalidateQueries({ queryKey: ["my-learning-paths"] });
    },
  });
}

export function useLeaveLearningPath() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => leaveLearningPath(slug),
    onSuccess: (_res, slug) => {
      queryClient.invalidateQueries({ queryKey: ["learning-path-progress", slug] });
      queryClient.invalidateQueries({ queryKey: ["my-learning-paths"] });
    },
  });
}
