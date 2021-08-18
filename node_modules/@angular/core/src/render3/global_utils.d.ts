/**
 * This file introduces series of globally accessible debug tools
 * to allow for the Angular debugging story to function.
 *
 * To see this in action run the following command:
 *
 *   bazel run --define=compile=aot
 *   //packages/core/test/bundling/todo:devserver
 *
 *  Then load `localhost:5432` and start using the console tools.
 */
/**
 * This value reflects the property on the window where the dev
 * tools are patched (window.ng).
 * */
export declare const GLOBAL_PUBLISH_EXPANDO_KEY = "ng";
export declare function publishDefaultGlobalUtils(): void;
export declare type GlobalDevModeContainer = {
    [GLOBAL_PUBLISH_EXPANDO_KEY]: {
        [fnName: string]: Function;
    };
};
/**
 * Publishes the given function to `window.ngDevMode` so that it can be
 * used from the browser console when an application is not in production.
 */
export declare function publishGlobalUtil(name: string, fn: Function): void;
