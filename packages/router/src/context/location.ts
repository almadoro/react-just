import { Params } from "@/types";
import { createContext } from "react";

const LocationContext = createContext<{ params: Params; url: string } | null>(
  null,
);

export default LocationContext;
