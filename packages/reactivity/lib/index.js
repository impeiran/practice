const reactionStack = [];
const observableReactionMap = new WeakMap();
function trackTargetAndReaction(target, key) {
    var _a;
    if (!reactionStack.length) {
        return;
    }
    const currentReaction = reactionStack[reactionStack.length - 1];
    let targetKeyReactionMap = observableReactionMap.get(target);
    if (!targetKeyReactionMap) {
        targetKeyReactionMap = new Map();
        targetKeyReactionMap.set(key, new Set([]));
        observableReactionMap.set(target, targetKeyReactionMap);
    }
    const reactionSet = targetKeyReactionMap.get(key);
    if (reactionSet) {
        reactionSet.add(currentReaction);
        currentReaction.__deps__ = (_a = currentReaction.__deps__) !== null && _a !== void 0 ? _a : new Set();
        currentReaction.__deps__.add(reactionSet);
    }
}
function notifyReactionByTargetAndKey(target, key, value) {
    var _a;
    const reactionSet = (_a = observableReactionMap.get(target)) === null || _a === void 0 ? void 0 : _a.get(key);
    // use new set to avoid infinite loop
    const reactionToRun = new Set([]);
    const currentReaction = reactionStack[reactionStack.length - 1];
    reactionSet === null || reactionSet === void 0 ? void 0 : reactionSet.forEach(reactionFn => {
        if (reactionFn !== currentReaction) {
            reactionToRun.add(reactionFn);
        }
    });
    reactionToRun.forEach(fn => fn(value));
}
function removeTracker(fn) {
    var _a;
    (_a = fn.__deps__) === null || _a === void 0 ? void 0 : _a.forEach(depSet => {
        if (depSet.has(fn)) {
            depSet.delete(fn);
        }
    });
    fn.__deps__ = new Set();
}
export function observable(value) {
    const proxy = new Proxy(value, {
        get(target, key, receiver) {
            trackTargetAndReaction(target, key);
            return Reflect.get(target, key, receiver);
        },
        set(target, key, newValue, receiver) {
            const result = Reflect.set(target, key, newValue, receiver);
            notifyReactionByTargetAndKey(target, key, newValue);
            return result;
        }
    });
    return proxy;
}
export function effect(fn) {
    const effectFn = () => {
        if (!reactionStack.includes(effectFn)) {
            removeTracker(effectFn);
            reactionStack.push(effectFn);
            fn();
            reactionStack.pop();
        }
    };
    removeTracker(effectFn);
    effectFn();
    return () => removeTracker(effectFn);
}
export function watch(expression, callback, options) {
    let previous = undefined;
    const makeExpressionTrack = (triggerCallback) => {
        reactionStack.push(reactionFn);
        const currentValue = expression();
        reactionStack.pop();
        triggerCallback(currentValue);
        previous = currentValue;
        return currentValue;
    };
    const reactionFn = () => {
        removeTracker(reactionFn);
        makeExpressionTrack((currentValue) => {
            if (currentValue !== previous) {
                callback(currentValue, previous);
            }
        });
    };
    if (options === null || options === void 0 ? void 0 : options.immediate) {
        makeExpressionTrack((currentValue) => {
            callback(currentValue, previous);
        });
    }
    else {
        reactionFn();
    }
    return () => removeTracker(reactionFn);
}
//# sourceMappingURL=index.js.map