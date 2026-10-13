import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { countKeys, staffKeys } from "../../lib/queryKeys";
import { getErrorMessage } from "../../lib/apiError";
import * as staffApi from "./staffApi";

export function useStaff(params) {
  return useQuery({
    queryKey: staffKeys.list(params),
    queryFn: () => staffApi.listStaff(params),
    placeholderData: keepPreviousData,
  });
}

export function useStaffMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: staffKeys.all });
    queryClient.invalidateQueries({ queryKey: countKeys.all });
  };

  const update = useMutation({
    mutationFn: ({ id, ...payload }) => staffApi.updateStaff(id, payload),
    onSuccess: () => {
      invalidate();
      toast.success("Staff record updated");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
  const remove = useMutation({
    mutationFn: staffApi.deleteStaff,
    onSuccess: () => {
      invalidate();
      toast.success("Staff member deleted");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
  const importCsv = useMutation({
    mutationFn: staffApi.importStaff,
    onSuccess: (result) => {
      invalidate();
      toast.success(`${result.imported} staff record${result.imported === 1 ? "" : "s"} imported`);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  return { update, remove, importCsv };
}

export { staffApi, staffKeys };
