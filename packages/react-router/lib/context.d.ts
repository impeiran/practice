import { LocationContext, RouterHistory } from "./types";
export type RouterContextType = {
    location: LocationContext;
    history: RouterHistory;
};
export declare const RouterContext: import("react").Context<RouterContextType>;
export declare function useRouter(): RouterContextType;
