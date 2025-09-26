"use client";

import { Params } from "@/types";
import { useMemo } from "react";
import LocationContext from "../context/location";

interface LocationProviderProps {
  children: React.ReactNode;
  params: Params;
  url: string;
}

export default function LocationProvider({
  children,
  params,
  url,
}: LocationProviderProps) {
  const value = useMemo(() => ({ url, params }), [url, params]);

  return <LocationContext value={value}>{children}</LocationContext>;
}
