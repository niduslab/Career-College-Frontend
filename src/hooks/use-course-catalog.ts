import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCourseCatalog,
  getCatalogCourseDetail,
  getCourseCategories,
  getMyCourses,
  getMyCourseDetail,
  enrollInCourse,
  unenrollFromCourse,
  type CatalogFilterParams,
} from "@/lib/course-api";

/** Browse the public course catalog — filters/sort/page drive the query key. */
export function useCourseCatalog(params: CatalogFilterParams) {
  return useQuery({
    queryKey: ["course-catalog", params],
    queryFn: () => getCourseCatalog(params),
    placeholderData: (previousData) => previousData,
  });
}

/** Single published course's public catalog detail. */
export function useCatalogCourseDetail(slug: string | undefined) {
  return useQuery({
    queryKey: ["catalog-course", slug],
    queryFn: () => getCatalogCourseDetail(slug as string),
    enabled: !!slug,
  });
}

/** The caller's own active enrollments — used to mark catalog cards as enrolled. */
export function useMyCourses() {
  return useQuery({
    queryKey: ["my-courses"],
    queryFn: getMyCourses,
  });
}

/** Player-header detail for one course (enrolled learner or the owning instructor). */
export function useMyCourseDetail(courseSlug: string | undefined) {
  return useQuery({
    queryKey: ["my-course-detail", courseSlug],
    queryFn: () => getMyCourseDetail(courseSlug as string),
    enabled: !!courseSlug,
  });
}

/** Nested category tree, used to populate the catalog filter dropdown. */
export function useCourseCategories() {
  return useQuery({
    queryKey: ["course-categories"],
    queryFn: getCourseCategories,
    staleTime: 5 * 60 * 1000,
  });
}

/** Enroll in a free course. Invalidates catalog/my-courses queries on success. */
export function useEnrollInCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (courseSlug: string) => enrollInCourse(courseSlug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-catalog"] });
      queryClient.invalidateQueries({ queryKey: ["my-courses"] });
    },
  });
}

/** Unenroll (deactivate) from a course, preserving progress for re-enrollment. */
export function useUnenrollFromCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (courseSlug: string) => unenrollFromCourse(courseSlug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-catalog"] });
      queryClient.invalidateQueries({ queryKey: ["my-courses"] });
    },
  });
}
