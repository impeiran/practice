import { isArray, isPlainObject } from "./utils";
let shouldTrigger = true;
const arrayInstrumentations = {};
['push', 'pop', 'shift', 'unshift', 'splice'].forEach((method) => {
    const originMethod = Array.prototype[method];
    arrayInstrumentations[method] = function (...args) {
        shouldTrigger = false;
        const res = originMethod.apply(this, args);
        shouldTrigger = true;
        return res;
    };
});
export const ITERATE_KEY = Symbol();
export var OperationSetterEnum;
(function (OperationSetterEnum) {
    OperationSetterEnum[OperationSetterEnum["ITERATE"] = 0] = "ITERATE";
    OperationSetterEnum[OperationSetterEnum["ADD"] = 1] = "ADD";
    OperationSetterEnum[OperationSetterEnum["SET"] = 2] = "SET";
})(OperationSetterEnum || (OperationSetterEnum = {}));
const reactionStack = [];
const observableReactionMap = new WeakMap();
const proxyMap = new WeakMap();
function trackTarget(target, key) {
    var _a;
    if (!reactionStack.length || !shouldTrigger) {
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
function notifyReactionByTargetAndKey(target, key, type) {
    var _a;
    debugger;
    const exactKey = type === OperationSetterEnum.ADD
        ? 'length'
        : key;
    const reactionSet = (_a = observableReactionMap.get(target)) === null || _a === void 0 ? void 0 : _a.get(exactKey);
    // use new set to avoid infinite loop
    const reactionToRun = new Set([]);
    const currentReaction = reactionStack[reactionStack.length - 1];
    reactionSet === null || reactionSet === void 0 ? void 0 : reactionSet.forEach(reactionFn => {
        if (reactionFn !== currentReaction) {
            reactionToRun.add(reactionFn);
        }
    });
    reactionToRun.forEach(fn => fn());
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
    if (!isPlainObject(value) && !isArray(value)) {
        return value;
    }
    const existProxy = proxyMap.get(value);
    if (existProxy) {
        return existProxy;
    }
    // TODO: need define delete/has/ownKeys handlers
    const proxy = new Proxy(value, {
        get(target, key, receiver) {
            const currentValue = Array.isArray(target) && arrayInstrumentations.hasOwnProperty(key)
                ? Reflect.get(arrayInstrumentations, key, receiver)
                : Reflect.get(target, key, receiver);
            trackTarget(target, key);
            if (currentValue) {
                return observable(currentValue);
            }
            return currentValue;
        },
        set(target, key, value, receiver) {
            console.log(observableReactionMap);
            debugger;
            const type = Array.isArray(target)
                ? Number(key) < target.length
                    ? OperationSetterEnum.SET
                    : OperationSetterEnum.ADD
                : !Object.prototype.hasOwnProperty.call(target, key)
                    ? OperationSetterEnum.ADD
                    : OperationSetterEnum.SET;
            const newValue = observable(value);
            const oldValue = target[key];
            Reflect.set(target, key, newValue, receiver);
            if (value !== oldValue) {
                notifyReactionByTargetAndKey(target, key, type);
            }
            return true;
        },
        ownKeys(target) {
            const key = Array.isArray(target) ? 'length' : ITERATE_KEY;
            notifyReactionByTargetAndKey(target, key, OperationSetterEnum.ITERATE);
            return Reflect.ownKeys(target);
        },
    });
    proxyMap.set(value, proxy);
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
function traverseDeep(target, recordSet = new Set()) {
    if (typeof target !== 'object' || target === null || recordSet.has(target)) {
        return;
    }
    recordSet.add(target);
    if (Array.isArray(target) && target.length) {
        // do nothing to track length
    }
    for (const key in target) {
        traverseDeep(target[key], recordSet);
    }
}
export function watch(expression, callback, options) {
    let previous = undefined;
    const makeExpressionTrack = (triggerCallback) => {
        reactionStack.push(reactionFn);
        const currentValue = expression();
        traverseDeep(currentValue);
        reactionStack.pop();
        triggerCallback === null || triggerCallback === void 0 ? void 0 : triggerCallback(currentValue);
        previous = currentValue;
    };
    const reactionFn = () => {
        removeTracker(reactionFn);
        makeExpressionTrack((currentValue) => {
            callback(currentValue, previous);
        });
    };
    if (options === null || options === void 0 ? void 0 : options.immediate) {
        makeExpressionTrack((currentValue) => {
            callback(currentValue, previous);
        });
    }
    else {
        makeExpressionTrack();
    }
    return () => removeTracker(reactionFn);
}
//# sourceMappingURL=index.js.map