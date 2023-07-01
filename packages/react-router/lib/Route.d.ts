import React from 'react';
import { To } from "./types";
export type RouteProps = {
    to: To;
    element: React.ReactNode;
};
export declare function Route(props: RouteProps): JSX.Element | null;
