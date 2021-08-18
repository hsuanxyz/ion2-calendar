/**
 * Re-maps the source `.map` file for the given `sourceFile`. This keeps source maps intact over
 * a series of transpilations!
 *
 * @param sourceFile Source file
 */
export declare function remapSourceMap(sourceFile: string): Promise<void>;
