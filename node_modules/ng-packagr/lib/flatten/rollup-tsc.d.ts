import { SourceDescription } from 'rollup';
/**
 * Downlevels a .js file from ES2015 to ES5. Internally, uses `tsc`.
 *
 */
export declare function downlevelWithTsc(code: string, filePath: string): Promise<SourceDescription>;
