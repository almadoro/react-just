"use client";

import { useMemo } from "react";
import useLocation from "./use-location";

export default function useSearchParams(): URLSearchParams {
  const location = useLocation();

  return useMemo(() => new URL(location.url).searchParams, [location.url]);
}
