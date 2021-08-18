import { providersResolver } from '../di_setup';
/**
 * This feature resolves the providers of a directive (or component),
 * and publish them into the DI system, making it visible to others for injection.
 *
 * For example:
 * class ComponentWithProviders {
 *   constructor(private greeter: GreeterDE) {}
 *
 *   static ngComponentDef = defineComponent({
 *     type: ComponentWithProviders,
 *     selectors: [['component-with-providers']],
 *    factory: () => new ComponentWithProviders(directiveInject(GreeterDE as any)),
 *    consts: 1,
 *    vars: 1,
 *    template: function(fs: RenderFlags, ctx: ComponentWithProviders) {
 *      if (fs & RenderFlags.Create) {
 *        text(0);
 *      }
 *      if (fs & RenderFlags.Update) {
 *        textBinding(0, bind(ctx.greeter.greet()));
 *      }
 *    },
 *    features: [ProvidersFeature([GreeterDE])]
 *  });
 * }
 *
 * @param definition
 */
export function ProvidersFeature(providers, viewProviders) {
    if (viewProviders === void 0) { viewProviders = []; }
    return function (definition) {
        definition.providersResolver = function (def) {
            return providersResolver(def, providers, viewProviders);
        };
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdmlkZXJzX2ZlYXR1cmUuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL2ZlYXR1cmVzL3Byb3ZpZGVyc19mZWF0dXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVFBLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUc5Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBMkJHO0FBQ0gsTUFBTSxVQUFVLGdCQUFnQixDQUFJLFNBQXFCLEVBQUUsYUFBOEI7SUFBOUIsOEJBQUEsRUFBQSxrQkFBOEI7SUFDdkYsT0FBTyxVQUFDLFVBQTJCO1FBQ2pDLFVBQVUsQ0FBQyxpQkFBaUIsR0FBRyxVQUFDLEdBQW9CO1lBQ2hELE9BQUEsaUJBQWlCLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxhQUFhLENBQUM7UUFBaEQsQ0FBZ0QsQ0FBQztJQUN2RCxDQUFDLENBQUM7QUFDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtQcm92aWRlcn0gZnJvbSAnLi4vLi4vZGkvcHJvdmlkZXInO1xuaW1wb3J0IHtwcm92aWRlcnNSZXNvbHZlcn0gZnJvbSAnLi4vZGlfc2V0dXAnO1xuaW1wb3J0IHtEaXJlY3RpdmVEZWZ9IGZyb20gJy4uL2ludGVyZmFjZXMvZGVmaW5pdGlvbic7XG5cbi8qKlxuICogVGhpcyBmZWF0dXJlIHJlc29sdmVzIHRoZSBwcm92aWRlcnMgb2YgYSBkaXJlY3RpdmUgKG9yIGNvbXBvbmVudCksXG4gKiBhbmQgcHVibGlzaCB0aGVtIGludG8gdGhlIERJIHN5c3RlbSwgbWFraW5nIGl0IHZpc2libGUgdG8gb3RoZXJzIGZvciBpbmplY3Rpb24uXG4gKlxuICogRm9yIGV4YW1wbGU6XG4gKiBjbGFzcyBDb21wb25lbnRXaXRoUHJvdmlkZXJzIHtcbiAqICAgY29uc3RydWN0b3IocHJpdmF0ZSBncmVldGVyOiBHcmVldGVyREUpIHt9XG4gKlxuICogICBzdGF0aWMgbmdDb21wb25lbnREZWYgPSBkZWZpbmVDb21wb25lbnQoe1xuICogICAgIHR5cGU6IENvbXBvbmVudFdpdGhQcm92aWRlcnMsXG4gKiAgICAgc2VsZWN0b3JzOiBbWydjb21wb25lbnQtd2l0aC1wcm92aWRlcnMnXV0sXG4gKiAgICBmYWN0b3J5OiAoKSA9PiBuZXcgQ29tcG9uZW50V2l0aFByb3ZpZGVycyhkaXJlY3RpdmVJbmplY3QoR3JlZXRlckRFIGFzIGFueSkpLFxuICogICAgY29uc3RzOiAxLFxuICogICAgdmFyczogMSxcbiAqICAgIHRlbXBsYXRlOiBmdW5jdGlvbihmczogUmVuZGVyRmxhZ3MsIGN0eDogQ29tcG9uZW50V2l0aFByb3ZpZGVycykge1xuICogICAgICBpZiAoZnMgJiBSZW5kZXJGbGFncy5DcmVhdGUpIHtcbiAqICAgICAgICB0ZXh0KDApO1xuICogICAgICB9XG4gKiAgICAgIGlmIChmcyAmIFJlbmRlckZsYWdzLlVwZGF0ZSkge1xuICogICAgICAgIHRleHRCaW5kaW5nKDAsIGJpbmQoY3R4LmdyZWV0ZXIuZ3JlZXQoKSkpO1xuICogICAgICB9XG4gKiAgICB9LFxuICogICAgZmVhdHVyZXM6IFtQcm92aWRlcnNGZWF0dXJlKFtHcmVldGVyREVdKV1cbiAqICB9KTtcbiAqIH1cbiAqXG4gKiBAcGFyYW0gZGVmaW5pdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gUHJvdmlkZXJzRmVhdHVyZTxUPihwcm92aWRlcnM6IFByb3ZpZGVyW10sIHZpZXdQcm92aWRlcnM6IFByb3ZpZGVyW10gPSBbXSkge1xuICByZXR1cm4gKGRlZmluaXRpb246IERpcmVjdGl2ZURlZjxUPikgPT4ge1xuICAgIGRlZmluaXRpb24ucHJvdmlkZXJzUmVzb2x2ZXIgPSAoZGVmOiBEaXJlY3RpdmVEZWY8VD4pID0+XG4gICAgICAgIHByb3ZpZGVyc1Jlc29sdmVyKGRlZiwgcHJvdmlkZXJzLCB2aWV3UHJvdmlkZXJzKTtcbiAgfTtcbn1cbiJdfQ==