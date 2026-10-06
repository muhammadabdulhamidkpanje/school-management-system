import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "../../lib/apiError";
import { countKeys, departmentKeys, facultyKeys } from "../../lib/queryKeys";
import * as facultyApi from "./facultyApi";

// Re-exported so existing `import { facultyKeys } from "features/faculties"` keeps working.
export { facultyKeys };

// keepPreviousData: when the page or search changes, keep showing the old rows
// (dimmed via `isFetching`) instead of flashing back to the skeleton.
export function useFaculties(params) {
  return useQuery({
    queryKey: facultyKeys.list(params),
    queryFn: () => facultyApi.listFaculties(params),
    placeholderData: keepPreviousData,
  });
}

// Create/update leave error handling to the form (so server validation can be
// shown under the right field). Delete has no form, so it toasts its own error.

export function useCreateFaculty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: facultyApi.createFaculty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: facultyKeys.all });
      queryClient.invalidateQueries({ queryKey: countKeys.all });
      toast.success("Faculty created");
    },
  });
}

export function useUpdateFaculty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => facultyApi.updateFaculty(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: facultyKeys.all });
      // Department rows show their faculty's name.
      queryClient.invalidateQueries({ queryKey: departmentKeys.all });
      toast.success("Faculty updated");
    },
  });
}

export function useDeleteFaculty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: facultyApi.deleteFaculty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: facultyKeys.all });
      queryClient.invalidateQueries({ queryKey: departmentKeys.all });
      queryClient.invalidateQueries({ queryKey: countKeys.all });
      toast.success("Faculty deleted");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
