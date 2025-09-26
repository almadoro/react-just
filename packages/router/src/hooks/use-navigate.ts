"use client";

import { Navigate } from "@/types";
import { use } from "react";
import NavigateContext from "../context/navigate";

export default function useNavigate(): Navigate {
  const navigate = use(NavigateContext);

  if (!navigate) throw new Error("useNavigate must be used within a Router");

  return navigate;
}
