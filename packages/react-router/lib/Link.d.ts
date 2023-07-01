import React from 'react';
import { To } from "./types";
export type LinkProps = {
    to: To;
    replace?: boolean;
    children?: React.ReactNode;
};
export declare function Link(props: LinkProps): JSX.Element;
