import React from 'react';
import { useMemo } from "react";
import { useRouter } from "./context";
import { isMatchLocation } from "./utils";
export function Route(props) {
    const { to, element } = props;
    const { location } = useRouter();
    const isMatch = useMemo(() => {
        return isMatchLocation(location, to);
    }, [location, to]);
    if (!isMatch) {
        return null;
    }
    return (React.createElement(React.Fragment, null, element));
}
