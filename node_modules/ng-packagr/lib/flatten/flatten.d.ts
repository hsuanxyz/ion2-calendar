export interface FlattenOpts {
    entryFile: string;
    outDir: string;
    flatModuleFile: string;
    /** ECMAScript module ID defined by the FESM bundles. */
    esmModuleId: string;
    /** UMD ID defined by the UMD bundle. */
    umdModuleId: string;
    /** AMD ID defined in the UMD bundle. */
    amdId?: string;
    comments: string;
    licensePath: string;
    /** List of module IDs that should be embedded to the bundle (embedded dependencies). */
    embedded?: string[];
    /** Map of external UMD module IDs (dependencies).  */
    umdModuleIds?: {
        [key: string]: string;
    };
}
export declare function writeFlatBundleFiles(opts: FlattenOpts): Promise<void>;
export declare function flattenToFesm15(opts: FlattenOpts): Promise<string>;
export declare function flattenToFesm5(opts: FlattenOpts): Promise<string>;
export declare function flattenToUmd(opts: FlattenOpts): Promise<string>;
export declare function flattenToUmdMin(opts: FlattenOpts): Promise<string>;
