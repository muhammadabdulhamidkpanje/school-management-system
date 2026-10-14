import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  countKeys,
  courseKeys,
  courseOfferingKeys,
  departmentKeys,
  staffKeys,
} from "../../lib/queryKeys";
import { getErrorMessage } from "../../lib/apiError";
import * as courseApi from "./courseApi";
import * as courseOfferingApi from "./courseOfferingApi";

export { courseKeys };

export function useCourses(params) {
  return useQuery({
    queryKey: courseKeys.list(params),
    queryFn: () => courseApi.listCourses(params),
    placeholderData: keepPreviousData,
  });
}

function useInvalidateCourses() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: courseKeys.all });
    queryClient.invalidateQueries({ queryKey: [...courseOfferingKeys.all, "options"] });
    queryClient.invalidateQueries({ queryKey: departmentKeys.all });
    queryClient.invalidateQueries({ queryKey: countKeys.all });
  };
}

export function useSaveCourse() {
  const invalidate = useInvalidateCourses();
  return useMutation({
    mutationFn: ({ id, ...payload }) =>
      id ? courseApi.updateCourse(id, payload) : courseApi.createCourse(payload),
    onSuccess: (_result, { id }) => {
      invalidate();
      if (id) {
        toast.success("Course updated");
      } else {
        toast.success("Course created");
      }
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteCourse() {
  const invalidate = useInvalidateCourses();
  return useMutation({
    mutationFn: courseApi.deleteCourse,
    onSuccess: () => {
      invalidate();
      toast.success("Course deleted");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useCourseOfferings(params) {
  return useQuery({
    queryKey: courseOfferingKeys.list(params),
    queryFn: () => courseOfferingApi.listCourseOfferings(params),
    placeholderData: keepPreviousData,
  });
}

export function useCourseOfferingOptions() {
  return useQuery({
    queryKey: [...courseOfferingKeys.all, "options"],
    queryFn: courseOfferingApi.listOfferingOptions,
    staleTime: 60_000,
  });
}

export function useCreateCourseOffering() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: courseOfferingApi.createCourseOffering,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseOfferingKeys.all });
      toast.success("Course offering created");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useAssignCourseTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ offeringId, teacherId }) =>
      courseOfferingApi.assignTeacher(offeringId, teacherId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseOfferingKeys.all });
      queryClient.invalidateQueries({ queryKey: staffKeys.all });
      toast.success("Course instructor updated");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
