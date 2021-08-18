import { InjectionToken, Provider } from 'injection-js';
import { Transform } from '../brocc/transform';
import { TsConfig } from '../ts/tsconfig';
/**
 * The original ng-packagr implemented on top of a rxjs-ified and di-jectable transformation pipeline.
 *
 * See the `docs/transformations.md` for more prose description.
 *
 * @link https://github.com/dherges/ng-packagr/pull/572
 */
export declare class NgPackagr {
    private providers;
    private buildTransform;
    constructor(providers: Provider[]);
    /**
     * Sets the path to the user's "ng-package" file (either `package.json`, `ng-package.json`, or `ng-package.js`)
     *
     * @param project File path
     * @return Self instance for fluent API
     */
    forProject(project: string): NgPackagr;
    /**
     * Adds dependency injection providers.
     *
     * @param providers
     * @return Self instance for fluent API
     * @link https://github.com/mgechev/injection-js
     */
    withProviders(providers: Provider[]): NgPackagr;
    /**
     * Overwrites the default TypeScript configuration.
     *
     * @param defaultValues A tsconfig providing default values to the compilation.
     * @return Self instance for fluent API
     */
    withTsConfig(defaultValues: TsConfig | string): NgPackagr;
    /**
     * Overwrites the 'build' transform.
     *
     * @param transform
     * @return Self intance for fluent API
     */
    withBuildTransform(transform: InjectionToken<Transform>): NgPackagr;
    /**
     * Builds the project by kick-starting the 'build' transform over an (initially) empty `BuildGraph``
     *
     * @return A promisified result of the transformation pipeline.
     */
    build(): Promise<void>;
}
export declare const ngPackagr: () => NgPackagr;
