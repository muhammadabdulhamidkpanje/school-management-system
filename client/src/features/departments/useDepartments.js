import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "../../lib/apiError";
import { countKeys, departmentKeys, facultyKeys } from "../../lib/queryKeys";
import * as departmentApi from "./departmentApi";

export { departmentKeys };

export function useDepartments(params) {
  return useQuery({
    queryKey: departmentKeys.list(params),
    queryFn: () => departmentApi.listDepartments(params),
    placeholderData: keepPreviousData,
  });
}

// The faculty list shows a department COUNT per faculty, and the dashboard
// cards show totals, so every department change refreshes those too.
function useInvalidate() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: departmentKeys.all });
    queryClient.invalidateQueries({ queryKey: facultyKeys.all });
    queryClient.invalidateQueries({ queryKey: countKeys.all });
  };
}

export function useCreateDepartment() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: departmentApi.createDepartment,
    onSuccess: () => {
      invalidate();
      toast.success("Department created");
    },
  });
}

export function useUpdateDepartment() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, ...payload }) => departmentApi.updateDepartment(id, payload),
    onSuccess: () => {
      invalidate();
      toast.success("Department updated");
    },
  });
}

export function useDeleteDepartment() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: departmentApi.deleteDepartment,
    onSuccess: () => {
      invalidate();
      toast.success("Department deleted");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
