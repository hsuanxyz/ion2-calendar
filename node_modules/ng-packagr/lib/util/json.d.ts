/**
 * Modifies a set of JSON files by invoking `modifyFn`
 *
 * @param globPattern A glob pattern matching several files. Example: '**\/*.js.map'
 * @param modifyFn A callback function that takes a JSON-parsed input and should return an output
 *                  that will be JSON-stringified
 */
export declare function modifyJsonFiles(globPattern: string, modifyFn: (jsonObj: any) => any): Promise<void>;
/**
 * Read json and don't throw if json parsing fails.
 *
 * @param filePath Path to the file which is parsed.
 */
export declare function tryReadJson(filePath: string): Promise<any>;
