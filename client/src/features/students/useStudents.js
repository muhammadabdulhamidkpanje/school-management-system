import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { countKeys, studentKeys } from "../../lib/queryKeys";
import { getErrorMessage } from "../../lib/apiError";
import * as studentApi from "./studentApi";

export function useStudents(params) {
  return useQuery({
    queryKey: studentKeys.list(params),
    queryFn: () => studentApi.listStudents(params),
    placeholderData: keepPreviousData,
  });
}

export function useStudentMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: studentKeys.all });
    queryClient.invalidateQueries({ queryKey: countKeys.all });
  };
  const create = useMutation({
    mutationFn: studentApi.createStudent,
    onSuccess: () => {
      invalidate();
      toast.success("Student created");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
  const update = useMutation({
    mutationFn: ({ id, ...payload }) => studentApi.updateStudent(id, payload),
    onSuccess: (_result, { id }) => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: studentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: studentKeys.academicProfile(id) });
      toast.success("Student updated");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
  const updateProfile = useMutation({
    mutationFn: ({ id, ...payload }) => studentApi.updateAcademicProfile(id, payload),
    onSuccess: (_result, { id }) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: studentKeys.academicProfile(id) });
      toast.success("Academic profile saved");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
  const importCsv = useMutation({
    mutationFn: studentApi.importStudents,
    onSuccess: (result) => {
      invalidate();
      toast.success(`${result.imported} student record${result.imported === 1 ? "" : "s"} imported`);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  return { create, update, updateProfile, importCsv };
}
