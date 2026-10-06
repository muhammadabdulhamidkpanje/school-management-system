import { useQuery } from "@tanstack/react-query";
import { countKeys } from "../../lib/queryKeys";
import { getCount } from "./countApi";

export function useCount(resource, params) {
  return useQuery({
    queryKey: countKeys.one(resource, params),
    queryFn: () => getCount(resource, params),
    staleTime: 60_000,
  });
}
