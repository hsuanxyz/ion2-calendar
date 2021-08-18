import { InjectionToken, Provider } from 'injection-js';
import { Transform } from '../brocc/transform';
import { TransformProvider } from '../brocc/transform.di';
export declare const ENTRY_POINT_TRANSFORM_TOKEN: InjectionToken<Transform>;
export declare const ENTRY_POINT_TRANSFORM: TransformProvider;
export declare const ENTRY_POINT_PROVIDERS: Provider[];
