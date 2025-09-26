"use client";

import { use } from "react";
import LocationContext from "../context/location";

export default function useLocation() {
  const location = use(LocationContext);

  if (!location) throw new Error("useLocation must be used within a Router");

  return location;
}
