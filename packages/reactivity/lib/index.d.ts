export type ObservableType = Record<string | symbol | number, any>;
export interface ReactionFnContext {
    __deps__?: Set<Set<ReactionFn>>;
}
export interface ReactionFn<T = any> extends ReactionFnContext {
    (): any;
}
export type KeyReactionMap = Map<string | Symbol, Set<ReactionFn>>;
export declare const ITERATE_KEY: unique symbol;
export declare enum OperationSetterEnum {
    ITERATE = 0,
    ADD = 1,
    SET = 2
}
export declare function observable<T extends ObservableType>(value: T): T;
export declare function effect(fn: () => void): () => void;
export type WatchOptions = {
    immediate?: boolean;
};
export declare function watch<T>(expression: () => T, callback: (current: T, previous: T | undefined) => void, options?: WatchOptions): () => void;
