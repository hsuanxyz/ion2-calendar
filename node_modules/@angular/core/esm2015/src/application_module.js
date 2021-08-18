/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { APP_INITIALIZER, ApplicationInitStatus } from './application_init';
import { ApplicationRef } from './application_ref';
import { APP_ID_RANDOM_PROVIDER } from './application_tokens';
import { IterableDiffers, KeyValueDiffers, defaultIterableDiffers, defaultKeyValueDiffers } from './change_detection/change_detection';
import { Console } from './console';
import { Injector } from './di';
import { Inject, Optional, SkipSelf } from './di/metadata';
import { ErrorHandler } from './error_handler';
import { LOCALE_ID } from './i18n/tokens';
import { ComponentFactoryResolver } from './linker';
import { Compiler } from './linker/compiler';
import { NgModule } from './metadata';
import { NgZone } from './zone';
/**
 * @return {?}
 */
export function _iterableDiffersFactory() {
    return defaultIterableDiffers;
}
/**
 * @return {?}
 */
export function _keyValueDiffersFactory() {
    return defaultKeyValueDiffers;
}
/**
 * @param {?=} locale
 * @return {?}
 */
export function _localeFactory(locale) {
    return locale || 'en-US';
}
/**
 * A built-in [dependency injection token](guide/glossary#di-token)
 * that is used to configure the root injector for bootstrapping.
 * @type {?}
 */
export const APPLICATION_MODULE_PROVIDERS = [
    {
        provide: ApplicationRef,
        useClass: ApplicationRef,
        deps: [NgZone, Console, Injector, ErrorHandler, ComponentFactoryResolver, ApplicationInitStatus]
    },
    {
        provide: ApplicationInitStatus,
        useClass: ApplicationInitStatus,
        deps: [[new Optional(), APP_INITIALIZER]]
    },
    { provide: Compiler, useClass: Compiler, deps: [] },
    APP_ID_RANDOM_PROVIDER,
    { provide: IterableDiffers, useFactory: _iterableDiffersFactory, deps: [] },
    { provide: KeyValueDiffers, useFactory: _keyValueDiffersFactory, deps: [] },
    {
        provide: LOCALE_ID,
        useFactory: _localeFactory,
        deps: [[new Inject(LOCALE_ID), new Optional(), new SkipSelf()]]
    },
];
/**
 * Configures the root injector for an app with
 * providers of `\@angular/core` dependencies that `ApplicationRef` needs
 * to bootstrap components.
 *
 * Re-exported by `BrowserModule`, which is included automatically in the root
 * `AppModule` when you create a new app with the CLI `new` command.
 *
 * \@publicApi
 */
export class ApplicationModule {
    // Inject ApplicationRef to make it eager...
    /**
     * @param {?} appRef
     */
    constructor(appRef) { }
}
ApplicationModule.decorators = [
    { type: NgModule, args: [{ providers: APPLICATION_MODULE_PROVIDERS },] }
];
/** @nocollapse */
ApplicationModule.ctorParameters = () => [
    { type: ApplicationRef }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbGljYXRpb25fbW9kdWxlLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLyIsInNvdXJjZXMiOlsicGFja2FnZXMvY29yZS9zcmMvYXBwbGljYXRpb25fbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxFQUFDLGVBQWUsRUFBRSxxQkFBcUIsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBQzFFLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMsc0JBQXNCLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUM1RCxPQUFPLEVBQUMsZUFBZSxFQUFFLGVBQWUsRUFBRSxzQkFBc0IsRUFBRSxzQkFBc0IsRUFBQyxNQUFNLHFDQUFxQyxDQUFDO0FBQ3JJLE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFDbEMsT0FBTyxFQUFpQixRQUFRLEVBQWlCLE1BQU0sTUFBTSxDQUFDO0FBQzlELE9BQU8sRUFBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN6RCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDN0MsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN4QyxPQUFPLEVBQUMsd0JBQXdCLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDbEQsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQzNDLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFDcEMsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLFFBQVEsQ0FBQzs7OztBQUU5QixNQUFNLFVBQVUsdUJBQXVCO0lBQ3JDLE9BQU8sc0JBQXNCLENBQUM7QUFDaEMsQ0FBQzs7OztBQUVELE1BQU0sVUFBVSx1QkFBdUI7SUFDckMsT0FBTyxzQkFBc0IsQ0FBQztBQUNoQyxDQUFDOzs7OztBQUVELE1BQU0sVUFBVSxjQUFjLENBQUMsTUFBZTtJQUM1QyxPQUFPLE1BQU0sSUFBSSxPQUFPLENBQUM7QUFDM0IsQ0FBQzs7Ozs7O0FBTUQsTUFBTSxPQUFPLDRCQUE0QixHQUFxQjtJQUM1RDtRQUNFLE9BQU8sRUFBRSxjQUFjO1FBQ3ZCLFFBQVEsRUFBRSxjQUFjO1FBQ3hCLElBQUksRUFDQSxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSx3QkFBd0IsRUFBRSxxQkFBcUIsQ0FBQztLQUMvRjtJQUNEO1FBQ0UsT0FBTyxFQUFFLHFCQUFxQjtRQUM5QixRQUFRLEVBQUUscUJBQXFCO1FBQy9CLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxRQUFRLEVBQUUsRUFBRSxlQUFlLENBQUMsQ0FBQztLQUMxQztJQUNELEVBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUM7SUFDakQsc0JBQXNCO0lBQ3RCLEVBQUMsT0FBTyxFQUFFLGVBQWUsRUFBRSxVQUFVLEVBQUUsdUJBQXVCLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBQztJQUN6RSxFQUFDLE9BQU8sRUFBRSxlQUFlLEVBQUUsVUFBVSxFQUFFLHVCQUF1QixFQUFFLElBQUksRUFBRSxFQUFFLEVBQUM7SUFDekU7UUFDRSxPQUFPLEVBQUUsU0FBUztRQUNsQixVQUFVLEVBQUUsY0FBYztRQUMxQixJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUFFLElBQUksUUFBUSxFQUFFLEVBQUUsSUFBSSxRQUFRLEVBQUUsQ0FBQyxDQUFDO0tBQ2hFO0NBQ0Y7Ozs7Ozs7Ozs7O0FBYUQsTUFBTSxPQUFPLGlCQUFpQjs7Ozs7SUFFNUIsWUFBWSxNQUFzQixJQUFHLENBQUM7OztZQUh2QyxRQUFRLFNBQUMsRUFBQyxTQUFTLEVBQUUsNEJBQTRCLEVBQUM7Ozs7WUE5RDNDLGNBQWMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QVBQX0lOSVRJQUxJWkVSLCBBcHBsaWNhdGlvbkluaXRTdGF0dXN9IGZyb20gJy4vYXBwbGljYXRpb25faW5pdCc7XG5pbXBvcnQge0FwcGxpY2F0aW9uUmVmfSBmcm9tICcuL2FwcGxpY2F0aW9uX3JlZic7XG5pbXBvcnQge0FQUF9JRF9SQU5ET01fUFJPVklERVJ9IGZyb20gJy4vYXBwbGljYXRpb25fdG9rZW5zJztcbmltcG9ydCB7SXRlcmFibGVEaWZmZXJzLCBLZXlWYWx1ZURpZmZlcnMsIGRlZmF1bHRJdGVyYWJsZURpZmZlcnMsIGRlZmF1bHRLZXlWYWx1ZURpZmZlcnN9IGZyb20gJy4vY2hhbmdlX2RldGVjdGlvbi9jaGFuZ2VfZGV0ZWN0aW9uJztcbmltcG9ydCB7Q29uc29sZX0gZnJvbSAnLi9jb25zb2xlJztcbmltcG9ydCB7SW5qZWN0aW9uVG9rZW4sIEluamVjdG9yLCBTdGF0aWNQcm92aWRlcn0gZnJvbSAnLi9kaSc7XG5pbXBvcnQge0luamVjdCwgT3B0aW9uYWwsIFNraXBTZWxmfSBmcm9tICcuL2RpL21ldGFkYXRhJztcbmltcG9ydCB7RXJyb3JIYW5kbGVyfSBmcm9tICcuL2Vycm9yX2hhbmRsZXInO1xuaW1wb3J0IHtMT0NBTEVfSUR9IGZyb20gJy4vaTE4bi90b2tlbnMnO1xuaW1wb3J0IHtDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXJ9IGZyb20gJy4vbGlua2VyJztcbmltcG9ydCB7Q29tcGlsZXJ9IGZyb20gJy4vbGlua2VyL2NvbXBpbGVyJztcbmltcG9ydCB7TmdNb2R1bGV9IGZyb20gJy4vbWV0YWRhdGEnO1xuaW1wb3J0IHtOZ1pvbmV9IGZyb20gJy4vem9uZSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBfaXRlcmFibGVEaWZmZXJzRmFjdG9yeSgpIHtcbiAgcmV0dXJuIGRlZmF1bHRJdGVyYWJsZURpZmZlcnM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBfa2V5VmFsdWVEaWZmZXJzRmFjdG9yeSgpIHtcbiAgcmV0dXJuIGRlZmF1bHRLZXlWYWx1ZURpZmZlcnM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBfbG9jYWxlRmFjdG9yeShsb2NhbGU/OiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gbG9jYWxlIHx8ICdlbi1VUyc7XG59XG5cbi8qKlxuICogQSBidWlsdC1pbiBbZGVwZW5kZW5jeSBpbmplY3Rpb24gdG9rZW5dKGd1aWRlL2dsb3NzYXJ5I2RpLXRva2VuKVxuICogdGhhdCBpcyB1c2VkIHRvIGNvbmZpZ3VyZSB0aGUgcm9vdCBpbmplY3RvciBmb3IgYm9vdHN0cmFwcGluZy5cbiAqL1xuZXhwb3J0IGNvbnN0IEFQUExJQ0FUSU9OX01PRFVMRV9QUk9WSURFUlM6IFN0YXRpY1Byb3ZpZGVyW10gPSBbXG4gIHtcbiAgICBwcm92aWRlOiBBcHBsaWNhdGlvblJlZixcbiAgICB1c2VDbGFzczogQXBwbGljYXRpb25SZWYsXG4gICAgZGVwczpcbiAgICAgICAgW05nWm9uZSwgQ29uc29sZSwgSW5qZWN0b3IsIEVycm9ySGFuZGxlciwgQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyLCBBcHBsaWNhdGlvbkluaXRTdGF0dXNdXG4gIH0sXG4gIHtcbiAgICBwcm92aWRlOiBBcHBsaWNhdGlvbkluaXRTdGF0dXMsXG4gICAgdXNlQ2xhc3M6IEFwcGxpY2F0aW9uSW5pdFN0YXR1cyxcbiAgICBkZXBzOiBbW25ldyBPcHRpb25hbCgpLCBBUFBfSU5JVElBTElaRVJdXVxuICB9LFxuICB7cHJvdmlkZTogQ29tcGlsZXIsIHVzZUNsYXNzOiBDb21waWxlciwgZGVwczogW119LFxuICBBUFBfSURfUkFORE9NX1BST1ZJREVSLFxuICB7cHJvdmlkZTogSXRlcmFibGVEaWZmZXJzLCB1c2VGYWN0b3J5OiBfaXRlcmFibGVEaWZmZXJzRmFjdG9yeSwgZGVwczogW119LFxuICB7cHJvdmlkZTogS2V5VmFsdWVEaWZmZXJzLCB1c2VGYWN0b3J5OiBfa2V5VmFsdWVEaWZmZXJzRmFjdG9yeSwgZGVwczogW119LFxuICB7XG4gICAgcHJvdmlkZTogTE9DQUxFX0lELFxuICAgIHVzZUZhY3Rvcnk6IF9sb2NhbGVGYWN0b3J5LFxuICAgIGRlcHM6IFtbbmV3IEluamVjdChMT0NBTEVfSUQpLCBuZXcgT3B0aW9uYWwoKSwgbmV3IFNraXBTZWxmKCldXVxuICB9LFxuXTtcblxuLyoqXG4gKiBDb25maWd1cmVzIHRoZSByb290IGluamVjdG9yIGZvciBhbiBhcHAgd2l0aFxuICogcHJvdmlkZXJzIG9mIGBAYW5ndWxhci9jb3JlYCBkZXBlbmRlbmNpZXMgdGhhdCBgQXBwbGljYXRpb25SZWZgIG5lZWRzXG4gKiB0byBib290c3RyYXAgY29tcG9uZW50cy5cbiAqXG4gKiBSZS1leHBvcnRlZCBieSBgQnJvd3Nlck1vZHVsZWAsIHdoaWNoIGlzIGluY2x1ZGVkIGF1dG9tYXRpY2FsbHkgaW4gdGhlIHJvb3RcbiAqIGBBcHBNb2R1bGVgIHdoZW4geW91IGNyZWF0ZSBhIG5ldyBhcHAgd2l0aCB0aGUgQ0xJIGBuZXdgIGNvbW1hbmQuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ATmdNb2R1bGUoe3Byb3ZpZGVyczogQVBQTElDQVRJT05fTU9EVUxFX1BST1ZJREVSU30pXG5leHBvcnQgY2xhc3MgQXBwbGljYXRpb25Nb2R1bGUge1xuICAvLyBJbmplY3QgQXBwbGljYXRpb25SZWYgdG8gbWFrZSBpdCBlYWdlci4uLlxuICBjb25zdHJ1Y3RvcihhcHBSZWY6IEFwcGxpY2F0aW9uUmVmKSB7fVxufVxuIl19