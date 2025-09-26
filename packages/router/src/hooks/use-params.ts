"use client";

import { Params } from "@/types";
import useLocation from "./use-location";

export default function useParams(): Params {
  const location = useLocation();

  return location.params;
}
