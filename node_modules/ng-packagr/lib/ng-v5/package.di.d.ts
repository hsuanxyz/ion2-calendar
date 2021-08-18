import { InjectionToken, Provider } from 'injection-js';
import { Transform } from '../brocc/transform';
import { TransformProvider } from '../brocc/transform.di';
export declare const PACKAGE_TRANSFORM_TOKEN: InjectionToken<Transform>;
export declare const PACKAGE_TRANSFORM: TransformProvider;
export declare const PACKAGE_PROVIDERS: Provider[];
