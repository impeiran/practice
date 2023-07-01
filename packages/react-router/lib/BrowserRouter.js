import React, { useEffect, useMemo, useRef, useState } from 'react';
import { HistoryActionEnum } from './types';
import { RouterContext } from './context';
import { createUrl } from './utils';
function createHistory(options) {
    const onChange = options === null || options === void 0 ? void 0 : options.onChange;
    const globalHistory = window.history;
    const history = {
        push(to) {
            const url = createUrl(to);
            globalHistory.pushState(null, '', url);
            onChange === null || onChange === void 0 ? void 0 : onChange(HistoryActionEnum.PUSH);
        },
        replace(to) {
            const url = createUrl(to);
            globalHistory.replaceState(null, '', url);
            onChange === null || onChange === void 0 ? void 0 : onChange(HistoryActionEnum.REPLACE);
        },
        go(delta) {
            return globalHistory.go(delta);
        },
        listen() {
            const pop = () => {
                onChange === null || onChange === void 0 ? void 0 : onChange(HistoryActionEnum.POP);
            };
            window.addEventListener('popstate', pop);
            return () => window.removeEventListener('popstate', pop);
        }
    };
    return history;
}
function getCurrentLocationContext() {
    return {
        path: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
    };
}
export function BrowserRouter(props) {
    const [locationContext, setLocationContext] = useState(getCurrentLocationContext);
    const historyRef = useRef(createHistory({
        onChange() {
            setLocationContext(getCurrentLocationContext);
        },
    }));
    const routerContextValue = useMemo(() => ({
        location: locationContext,
        history: historyRef.current,
    }), [locationContext, historyRef.current]);
    useEffect(() => {
        var _a;
        return (_a = historyRef.current) === null || _a === void 0 ? void 0 : _a.listen();
    }, []);
    return (React.createElement(RouterContext.Provider, { value: routerContextValue }, props.children));
}
