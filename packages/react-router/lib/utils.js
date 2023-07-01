export function createUrl(to) {
    var _a;
    if (typeof to === 'string') {
        return to;
    }
    const search = ((_a = to.search) === null || _a === void 0 ? void 0 : _a.includes('?'))
        ? to.search
        : to.search ? `?${to.search}` : '';
    return `${to.path}${search}${to.hash || ''}`;
}
export function isMatchLocation(currentLocation, to) {
    if (typeof to === 'string') {
        const url = new URL(to, location.origin);
        return url.pathname === currentLocation.path;
    }
    return to.path === currentLocation.path;
}
