// modules has side effects
import "../modules";

export { registerModule } from "../modules";
export { createFromFlightFetch, hydrateFromWindowFlight } from "./flight";

export const WINDOW_SHARED = Symbol.for("react-just.window-shared");
