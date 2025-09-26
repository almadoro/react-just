import { Navigate } from "@/types";
import { createContext } from "react";

const NavigateContext = createContext<Navigate | null>(null);

export default NavigateContext;
