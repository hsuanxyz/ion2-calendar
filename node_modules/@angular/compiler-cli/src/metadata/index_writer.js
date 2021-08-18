/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/metadata/index_writer", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const INDEX_HEADER = `/**
 * Generated bundle index. Do not edit.
 */
`;
    function privateEntriesToIndex(index, privates) {
        const results = [INDEX_HEADER];
        // Export all of the index symbols.
        results.push(`export * from '${index}';`, '');
        // Simplify the exports
        const exports = new Map();
        for (const entry of privates) {
            let entries = exports.get(entry.module);
            if (!entries) {
                entries = [];
                exports.set(entry.module, entries);
            }
            entries.push(entry);
        }
        const compareEntries = compare((e) => e.name);
        const compareModules = compare((e) => e[0]);
        const orderedExports = Array.from(exports)
            .map(([module, entries]) => [module, entries.sort(compareEntries)])
            .sort(compareModules);
        for (const [module, entries] of orderedExports) {
            let symbols = entries.map(e => `${e.name} as ${e.privateName}`);
            results.push(`export {${symbols}} from '${module}';`);
        }
        return results.join('\n');
    }
    exports.privateEntriesToIndex = privateEntriesToIndex;
    function compare(select) {
        return (a, b) => {
            const ak = select(a);
            const bk = select(b);
            return ak > bk ? 1 : ak < bk ? -1 : 0;
        };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXhfd3JpdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9tZXRhZGF0YS9pbmRleF93cml0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7SUFJSCxNQUFNLFlBQVksR0FBRzs7O0NBR3BCLENBQUM7SUFJRixTQUFnQixxQkFBcUIsQ0FBQyxLQUFhLEVBQUUsUUFBOEI7UUFDakYsTUFBTSxPQUFPLEdBQWEsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUV6QyxtQ0FBbUM7UUFDbkMsT0FBTyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsS0FBSyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFOUMsdUJBQXVCO1FBQ3ZCLE1BQU0sT0FBTyxHQUFHLElBQUksR0FBRyxFQUFnQyxDQUFDO1FBRXhELEtBQUssTUFBTSxLQUFLLElBQUksUUFBUSxFQUFFO1lBQzVCLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3hDLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ1osT0FBTyxHQUFHLEVBQUUsQ0FBQztnQkFDYixPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7YUFDcEM7WUFDRCxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ3JCO1FBR0QsTUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBcUIsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xFLE1BQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdEQsTUFBTSxjQUFjLEdBQ2hCLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO2FBQ2QsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLEVBQUUsRUFBRSxDQUFXLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQzthQUM1RSxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7UUFFOUIsS0FBSyxNQUFNLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxJQUFJLGNBQWMsRUFBRTtZQUM5QyxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxPQUFPLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1lBQ2hFLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxPQUFPLFdBQVcsTUFBTSxJQUFJLENBQUMsQ0FBQztTQUN2RDtRQUVELE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBaENELHNEQWdDQztJQUVELFNBQVMsT0FBTyxDQUFPLE1BQW1CO1FBQ3hDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDZCxNQUFNLEVBQUUsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckIsTUFBTSxFQUFFLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3hDLENBQUMsQ0FBQztJQUNKLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QnVuZGxlUHJpdmF0ZUVudHJ5fSBmcm9tICcuL2J1bmRsZXInO1xuXG5jb25zdCBJTkRFWF9IRUFERVIgPSBgLyoqXG4gKiBHZW5lcmF0ZWQgYnVuZGxlIGluZGV4LiBEbyBub3QgZWRpdC5cbiAqL1xuYDtcblxudHlwZSBNYXBFbnRyeSA9IFtzdHJpbmcsIEJ1bmRsZVByaXZhdGVFbnRyeVtdXTtcblxuZXhwb3J0IGZ1bmN0aW9uIHByaXZhdGVFbnRyaWVzVG9JbmRleChpbmRleDogc3RyaW5nLCBwcml2YXRlczogQnVuZGxlUHJpdmF0ZUVudHJ5W10pOiBzdHJpbmcge1xuICBjb25zdCByZXN1bHRzOiBzdHJpbmdbXSA9IFtJTkRFWF9IRUFERVJdO1xuXG4gIC8vIEV4cG9ydCBhbGwgb2YgdGhlIGluZGV4IHN5bWJvbHMuXG4gIHJlc3VsdHMucHVzaChgZXhwb3J0ICogZnJvbSAnJHtpbmRleH0nO2AsICcnKTtcblxuICAvLyBTaW1wbGlmeSB0aGUgZXhwb3J0c1xuICBjb25zdCBleHBvcnRzID0gbmV3IE1hcDxzdHJpbmcsIEJ1bmRsZVByaXZhdGVFbnRyeVtdPigpO1xuXG4gIGZvciAoY29uc3QgZW50cnkgb2YgcHJpdmF0ZXMpIHtcbiAgICBsZXQgZW50cmllcyA9IGV4cG9ydHMuZ2V0KGVudHJ5Lm1vZHVsZSk7XG4gICAgaWYgKCFlbnRyaWVzKSB7XG4gICAgICBlbnRyaWVzID0gW107XG4gICAgICBleHBvcnRzLnNldChlbnRyeS5tb2R1bGUsIGVudHJpZXMpO1xuICAgIH1cbiAgICBlbnRyaWVzLnB1c2goZW50cnkpO1xuICB9XG5cblxuICBjb25zdCBjb21wYXJlRW50cmllcyA9IGNvbXBhcmUoKGU6IEJ1bmRsZVByaXZhdGVFbnRyeSkgPT4gZS5uYW1lKTtcbiAgY29uc3QgY29tcGFyZU1vZHVsZXMgPSBjb21wYXJlKChlOiBNYXBFbnRyeSkgPT4gZVswXSk7XG4gIGNvbnN0IG9yZGVyZWRFeHBvcnRzID1cbiAgICAgIEFycmF5LmZyb20oZXhwb3J0cylcbiAgICAgICAgICAubWFwKChbbW9kdWxlLCBlbnRyaWVzXSkgPT4gPE1hcEVudHJ5Plttb2R1bGUsIGVudHJpZXMuc29ydChjb21wYXJlRW50cmllcyldKVxuICAgICAgICAgIC5zb3J0KGNvbXBhcmVNb2R1bGVzKTtcblxuICBmb3IgKGNvbnN0IFttb2R1bGUsIGVudHJpZXNdIG9mIG9yZGVyZWRFeHBvcnRzKSB7XG4gICAgbGV0IHN5bWJvbHMgPSBlbnRyaWVzLm1hcChlID0+IGAke2UubmFtZX0gYXMgJHtlLnByaXZhdGVOYW1lfWApO1xuICAgIHJlc3VsdHMucHVzaChgZXhwb3J0IHske3N5bWJvbHN9fSBmcm9tICcke21vZHVsZX0nO2ApO1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdHMuam9pbignXFxuJyk7XG59XG5cbmZ1bmN0aW9uIGNvbXBhcmU8RSwgVD4oc2VsZWN0OiAoZTogRSkgPT4gVCk6IChhOiBFLCBiOiBFKSA9PiBudW1iZXIge1xuICByZXR1cm4gKGEsIGIpID0+IHtcbiAgICBjb25zdCBhayA9IHNlbGVjdChhKTtcbiAgICBjb25zdCBiayA9IHNlbGVjdChiKTtcbiAgICByZXR1cm4gYWsgPiBiayA/IDEgOiBhayA8IGJrID8gLTEgOiAwO1xuICB9O1xufSJdfQ==