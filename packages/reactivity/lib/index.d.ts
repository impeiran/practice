export interface ReactionFnContext {
    __deps__?: Set<Set<ReactionFn>>;
}
export interface ReactionFn<T = any> extends ReactionFnContext {
    (currentValue?: T): any;
}
export type KeyReactionMap = Map<string | Symbol, Set<ReactionFn>>;
export declare function observable<T extends Record<string, any>>(value: T): T;
export declare function effect(fn: () => void): () => void;
export type WatchOptions = {
    immediate?: boolean;
};
export declare function watch<T>(expression: () => T, callback: (current: T, previous: T | undefined) => void, options?: WatchOptions): () => void;
