import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { studentKeys } from "../../lib/queryKeys";
import * as studentApi from "./studentApi";

export function useStudents(params) {
  return useQuery({
    queryKey: studentKeys.list(params),
    queryFn: () => studentApi.listStudents(params),
    placeholderData: keepPreviousData,
  });
}
