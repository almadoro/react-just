"use client";

import { useMemo } from "react";
import useLocation from "./use-location";

export default function usePathname(): string {
  const location = useLocation();

  return useMemo(() => new URL(location.url).pathname, [location.url]);
}
