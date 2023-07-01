import React, { useCallback } from 'react';
import { useMemo } from "react";
import { useRouter } from "./context";
import { createUrl } from "./utils";
export function Link(props) {
    const { to, replace, children } = props;
    const { history } = useRouter();
    const href = useMemo(() => createUrl(to), [to]);
    const handleClick = useCallback((e) => {
        e.preventDefault();
        replace ? history.replace(to) : history.push(to);
    }, [to, replace, history]);
    return (React.createElement("a", { href: href, onClick: handleClick }, children));
}
