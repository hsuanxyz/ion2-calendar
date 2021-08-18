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
        define("@angular/compiler-cli/src/metadata/symbols", ["require", "exports", "typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const ts = require("typescript");
    class Symbols {
        constructor(sourceFile) {
            this.sourceFile = sourceFile;
            this.references = new Map();
        }
        resolve(name, preferReference) {
            return (preferReference && this.references.get(name)) || this.symbols.get(name);
        }
        define(name, value) { this.symbols.set(name, value); }
        defineReference(name, value) {
            this.references.set(name, value);
        }
        has(name) { return this.symbols.has(name); }
        get symbols() {
            let result = this._symbols;
            if (!result) {
                result = this._symbols = new Map();
                populateBuiltins(result);
                this.buildImports();
            }
            return result;
        }
        buildImports() {
            const symbols = this._symbols;
            // Collect the imported symbols into this.symbols
            const stripQuotes = (s) => s.replace(/^['"]|['"]$/g, '');
            const visit = (node) => {
                switch (node.kind) {
                    case ts.SyntaxKind.ImportEqualsDeclaration:
                        const importEqualsDeclaration = node;
                        if (importEqualsDeclaration.moduleReference.kind ===
                            ts.SyntaxKind.ExternalModuleReference) {
                            const externalReference = importEqualsDeclaration.moduleReference;
                            if (externalReference.expression) {
                                // An `import <identifier> = require(<module-specifier>);
                                if (!externalReference.expression.parent) {
                                    // The `parent` field of a node is set by the TypeScript binder (run as
                                    // part of the type checker). Setting it here allows us to call `getText()`
                                    // even if the `SourceFile` was not type checked (which looks for `SourceFile`
                                    // in the parent chain). This doesn't damage the node as the binder unconditionally
                                    // sets the parent.
                                    externalReference.expression.parent = externalReference;
                                    externalReference.parent = this.sourceFile;
                                }
                                const from = stripQuotes(externalReference.expression.getText());
                                symbols.set(importEqualsDeclaration.name.text, { __symbolic: 'reference', module: from });
                                break;
                            }
                        }
                        symbols.set(importEqualsDeclaration.name.text, { __symbolic: 'error', message: `Unsupported import syntax` });
                        break;
                    case ts.SyntaxKind.ImportDeclaration:
                        const importDecl = node;
                        if (!importDecl.importClause) {
                            // An `import <module-specifier>` clause which does not bring symbols into scope.
                            break;
                        }
                        if (!importDecl.moduleSpecifier.parent) {
                            // See note above in the `ImportEqualDeclaration` case.
                            importDecl.moduleSpecifier.parent = importDecl;
                            importDecl.parent = this.sourceFile;
                        }
                        const from = stripQuotes(importDecl.moduleSpecifier.getText());
                        if (importDecl.importClause.name) {
                            // An `import <identifier> form <module-specifier>` clause. Record the default symbol.
                            symbols.set(importDecl.importClause.name.text, { __symbolic: 'reference', module: from, default: true });
                        }
                        const bindings = importDecl.importClause.namedBindings;
                        if (bindings) {
                            switch (bindings.kind) {
                                case ts.SyntaxKind.NamedImports:
                                    // An `import { [<identifier> [, <identifier>] } from <module-specifier>` clause
                                    for (const binding of bindings.elements) {
                                        symbols.set(binding.name.text, {
                                            __symbolic: 'reference',
                                            module: from,
                                            name: binding.propertyName ? binding.propertyName.text : binding.name.text
                                        });
                                    }
                                    break;
                                case ts.SyntaxKind.NamespaceImport:
                                    // An `input * as <identifier> from <module-specifier>` clause.
                                    symbols.set(bindings.name.text, { __symbolic: 'reference', module: from });
                                    break;
                            }
                        }
                        break;
                }
                ts.forEachChild(node, visit);
            };
            if (this.sourceFile) {
                ts.forEachChild(this.sourceFile, visit);
            }
        }
    }
    exports.Symbols = Symbols;
    function populateBuiltins(symbols) {
        // From lib.core.d.ts (all "define const")
        ['Object', 'Function', 'String', 'Number', 'Array', 'Boolean', 'Map', 'NaN', 'Infinity', 'Math',
            'Date', 'RegExp', 'Error', 'Error', 'EvalError', 'RangeError', 'ReferenceError', 'SyntaxError',
            'TypeError', 'URIError', 'JSON', 'ArrayBuffer', 'DataView', 'Int8Array', 'Uint8Array',
            'Uint8ClampedArray', 'Uint16Array', 'Int16Array', 'Int32Array', 'Uint32Array', 'Float32Array',
            'Float64Array']
            .forEach(name => symbols.set(name, { __symbolic: 'reference', name }));
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3ltYm9scy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbWV0YWRhdGEvc3ltYm9scy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILGlDQUFpQztJQUlqQyxNQUFhLE9BQU87UUFLbEIsWUFBb0IsVUFBeUI7WUFBekIsZUFBVSxHQUFWLFVBQVUsQ0FBZTtZQUZyQyxlQUFVLEdBQUcsSUFBSSxHQUFHLEVBQStDLENBQUM7UUFFNUIsQ0FBQztRQUVqRCxPQUFPLENBQUMsSUFBWSxFQUFFLGVBQXlCO1lBQzdDLE9BQU8sQ0FBQyxlQUFlLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNsRixDQUFDO1FBRUQsTUFBTSxDQUFDLElBQVksRUFBRSxLQUFvQixJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0UsZUFBZSxDQUFDLElBQVksRUFBRSxLQUEwQztZQUN0RSxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDbkMsQ0FBQztRQUVELEdBQUcsQ0FBQyxJQUFZLElBQWEsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFN0QsSUFBWSxPQUFPO1lBQ2pCLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7WUFDM0IsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDWCxNQUFNLEdBQUcsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBeUIsQ0FBQztnQkFDMUQs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RSxNQUFNO1lBQzlGLE1BQU0sRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLGdCQUFnQixFQUFFLGFBQWE7WUFDOUYsV0FBVyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsWUFBWTtZQUNyRixtQkFBbUIsRUFBRSxhQUFhLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxhQUFhLEVBQUUsY0FBYztZQUM3RixjQUFjLENBQUM7YUFDWCxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxFQUFDLFVBQVUsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzNFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge01ldGFkYXRhU3ltYm9saWNSZWZlcmVuY2VFeHByZXNzaW9uLCBNZXRhZGF0YVZhbHVlfSBmcm9tICcuL3NjaGVtYSc7XG5cbmV4cG9ydCBjbGFzcyBTeW1ib2xzIHtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgX3N5bWJvbHMgITogTWFwPHN0cmluZywgTWV0YWRhdGFWYWx1ZT47XG4gIHByaXZhdGUgcmVmZXJlbmNlcyA9IG5ldyBNYXA8c3RyaW5nLCBNZXRhZGF0YVN5bWJvbGljUmVmZXJlbmNlRXhwcmVzc2lvbj4oKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUpIHt9XG5cbiAgcmVzb2x2ZShuYW1lOiBzdHJpbmcsIHByZWZlclJlZmVyZW5jZT86IGJvb2xlYW4pOiBNZXRhZGF0YVZhbHVlfHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIChwcmVmZXJSZWZlcmVuY2UgJiYgdGhpcy5yZWZlcmVuY2VzLmdldChuYW1lKSkgfHwgdGhpcy5zeW1ib2xzLmdldChuYW1lKTtcbiAgfVxuXG4gIGRlZmluZShuYW1lOiBzdHJpbmcsIHZhbHVlOiBNZXRhZGF0YVZhbHVlKSB7IHRoaXMuc3ltYm9scy5zZXQobmFtZSwgdmFsdWUpOyB9XG4gIGRlZmluZVJlZmVyZW5jZShuYW1lOiBzdHJpbmcsIHZhbHVlOiBNZXRhZGF0YVN5bWJvbGljUmVmZXJlbmNlRXhwcmVzc2lvbikge1xuICAgIHRoaXMucmVmZXJlbmNlcy5zZXQobmFtZSwgdmFsdWUpO1xuICB9XG5cbiAgaGFzKG5hbWU6IHN0cmluZyk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5zeW1ib2xzLmhhcyhuYW1lKTsgfVxuXG4gIHByaXZhdGUgZ2V0IHN5bWJvbHMoKTogTWFwPHN0cmluZywgTWV0YWRhdGFWYWx1ZT4ge1xuICAgIGxldCByZXN1bHQgPSB0aGlzLl9zeW1ib2xzO1xuICAgIGlmICghcmVzdWx0KSB7XG4gICAgICByZXN1bHQgPSB0aGlzLl9zeW1ib2xzID0gbmV3IE1hcDxzdHJpbmcsIE1ldGFkYXRhVmFsdWU+KCk7XG4gICAgICBwb3B1bGF0ZUJ1aWx0aW5zKHJlc3VsdCk7XG4gICAgICB0aGlzLmJ1aWxkSW1wb3J0cygpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgcHJpdmF0ZSBidWlsZEltcG9ydHMoKTogdm9pZCB7XG4gICAgY29uc3Qgc3ltYm9scyA9IHRoaXMuX3N5bWJvbHM7XG4gICAgLy8gQ29sbGVjdCB0aGUgaW1wb3J0ZWQgc3ltYm9scyBpbnRvIHRoaXMuc3ltYm9sc1xuICAgIGNvbnN0IHN0cmlwUXVvdGVzID0gKHM6IHN0cmluZykgPT4gcy5yZXBsYWNlKC9eWydcIl18WydcIl0kL2csICcnKTtcbiAgICBjb25zdCB2aXNpdCA9IChub2RlOiB0cy5Ob2RlKSA9PiB7XG4gICAgICBzd2l0Y2ggKG5vZGUua2luZCkge1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuSW1wb3J0RXF1YWxzRGVjbGFyYXRpb246XG4gICAgICAgICAgY29uc3QgaW1wb3J0RXF1YWxzRGVjbGFyYXRpb24gPSA8dHMuSW1wb3J0RXF1YWxzRGVjbGFyYXRpb24+bm9kZTtcbiAgICAgICAgICBpZiAoaW1wb3J0RXF1YWxzRGVjbGFyYXRpb24ubW9kdWxlUmVmZXJlbmNlLmtpbmQgPT09XG4gICAgICAgICAgICAgIHRzLlN5bnRheEtpbmQuRXh0ZXJuYWxNb2R1bGVSZWZlcmVuY2UpIHtcbiAgICAgICAgICAgIGNvbnN0IGV4dGVybmFsUmVmZXJlbmNlID1cbiAgICAgICAgICAgICAgICA8dHMuRXh0ZXJuYWxNb2R1bGVSZWZlcmVuY2U+aW1wb3J0RXF1YWxzRGVjbGFyYXRpb24ubW9kdWxlUmVmZXJlbmNlO1xuICAgICAgICAgICAgaWYgKGV4dGVybmFsUmVmZXJlbmNlLmV4cHJlc3Npb24pIHtcbiAgICAgICAgICAgICAgLy8gQW4gYGltcG9ydCA8aWRlbnRpZmllcj4gPSByZXF1aXJlKDxtb2R1bGUtc3BlY2lmaWVyPik7XG4gICAgICAgICAgICAgIGlmICghZXh0ZXJuYWxSZWZlcmVuY2UuZXhwcmVzc2lvbi5wYXJlbnQpIHtcbiAgICAgICAgICAgICAgICAvLyBUaGUgYHBhcmVudGAgZmllbGQgb2YgYSBub2RlIGlzIHNldCBieSB0aGUgVHlwZVNjcmlwdCBiaW5kZXIgKHJ1biBhc1xuICAgICAgICAgICAgICAgIC8vIHBhcnQgb2YgdGhlIHR5cGUgY2hlY2tlcikuIFNldHRpbmcgaXQgaGVyZSBhbGxvd3MgdXMgdG8gY2FsbCBgZ2V0VGV4dCgpYFxuICAgICAgICAgICAgICAgIC8vIGV2ZW4gaWYgdGhlIGBTb3VyY2VGaWxlYCB3YXMgbm90IHR5cGUgY2hlY2tlZCAod2hpY2ggbG9va3MgZm9yIGBTb3VyY2VGaWxlYFxuICAgICAgICAgICAgICAgIC8vIGluIHRoZSBwYXJlbnQgY2hhaW4pLiBUaGlzIGRvZXNuJ3QgZGFtYWdlIHRoZSBub2RlIGFzIHRoZSBiaW5kZXIgdW5jb25kaXRpb25hbGx5XG4gICAgICAgICAgICAgICAgLy8gc2V0cyB0aGUgcGFyZW50LlxuICAgICAgICAgICAgICAgIGV4dGVybmFsUmVmZXJlbmNlLmV4cHJlc3Npb24ucGFyZW50ID0gZXh0ZXJuYWxSZWZlcmVuY2U7XG4gICAgICAgICAgICAgICAgZXh0ZXJuYWxSZWZlcmVuY2UucGFyZW50ID0gdGhpcy5zb3VyY2VGaWxlIGFzIGFueTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBjb25zdCBmcm9tID0gc3RyaXBRdW90ZXMoZXh0ZXJuYWxSZWZlcmVuY2UuZXhwcmVzc2lvbi5nZXRUZXh0KCkpO1xuICAgICAgICAgICAgICBzeW1ib2xzLnNldChcbiAgICAgICAgICAgICAgICAgIGltcG9ydEVxdWFsc0RlY2xhcmF0aW9uLm5hbWUudGV4dCwge19fc3ltYm9saWM6ICdyZWZlcmVuY2UnLCBtb2R1bGU6IGZyb219KTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHN5bWJvbHMuc2V0KFxuICAgICAgICAgICAgICBpbXBvcnRFcXVhbHNEZWNsYXJhdGlvbi5uYW1lLnRleHQsXG4gICAgICAgICAgICAgIHtfX3N5bWJvbGljOiAnZXJyb3InLCBtZXNzYWdlOiBgVW5zdXBwb3J0ZWQgaW1wb3J0IHN5bnRheGB9KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkltcG9ydERlY2xhcmF0aW9uOlxuICAgICAgICAgIGNvbnN0IGltcG9ydERlY2wgPSA8dHMuSW1wb3J0RGVjbGFyYXRpb24+bm9kZTtcbiAgICAgICAgICBpZiAoIWltcG9ydERlY2wuaW1wb3J0Q2xhdXNlKSB7XG4gICAgICAgICAgICAvLyBBbiBgaW1wb3J0IDxtb2R1bGUtc3BlY2lmaWVyPmAgY2xhdXNlIHdoaWNoIGRvZXMgbm90IGJyaW5nIHN5bWJvbHMgaW50byBzY29wZS5cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIWltcG9ydERlY2wubW9kdWxlU3BlY2lmaWVyLnBhcmVudCkge1xuICAgICAgICAgICAgLy8gU2VlIG5vdGUgYWJvdmUgaW4gdGhlIGBJbXBvcnRFcXVhbERlY2xhcmF0aW9uYCBjYXNlLlxuICAgICAgICAgICAgaW1wb3J0RGVjbC5tb2R1bGVTcGVjaWZpZXIucGFyZW50ID0gaW1wb3J0RGVjbDtcbiAgICAgICAgICAgIGltcG9ydERlY2wucGFyZW50ID0gdGhpcy5zb3VyY2VGaWxlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBmcm9tID0gc3RyaXBRdW90ZXMoaW1wb3J0RGVjbC5tb2R1bGVTcGVjaWZpZXIuZ2V0VGV4dCgpKTtcbiAgICAgICAgICBpZiAoaW1wb3J0RGVjbC5pbXBvcnRDbGF1c2UubmFtZSkge1xuICAgICAgICAgICAgLy8gQW4gYGltcG9ydCA8aWRlbnRpZmllcj4gZm9ybSA8bW9kdWxlLXNwZWNpZmllcj5gIGNsYXVzZS4gUmVjb3JkIHRoZSBkZWZhdWx0IHN5bWJvbC5cbiAgICAgICAgICAgIHN5bWJvbHMuc2V0KFxuICAgICAgICAgICAgICAgIGltcG9ydERlY2wuaW1wb3J0Q2xhdXNlLm5hbWUudGV4dCxcbiAgICAgICAgICAgICAgICB7X19zeW1ib2xpYzogJ3JlZmVyZW5jZScsIG1vZHVsZTogZnJvbSwgZGVmYXVsdDogdHJ1ZX0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBiaW5kaW5ncyA9IGltcG9ydERlY2wuaW1wb3J0Q2xhdXNlLm5hbWVkQmluZGluZ3M7XG4gICAgICAgICAgaWYgKGJpbmRpbmdzKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKGJpbmRpbmdzLmtpbmQpIHtcbiAgICAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLk5hbWVkSW1wb3J0czpcbiAgICAgICAgICAgICAgICAvLyBBbiBgaW1wb3J0IHsgWzxpZGVudGlmaWVyPiBbLCA8aWRlbnRpZmllcj5dIH0gZnJvbSA8bW9kdWxlLXNwZWNpZmllcj5gIGNsYXVzZVxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgYmluZGluZyBvZiAoPHRzLk5hbWVkSW1wb3J0cz5iaW5kaW5ncykuZWxlbWVudHMpIHtcbiAgICAgICAgICAgICAgICAgIHN5bWJvbHMuc2V0KGJpbmRpbmcubmFtZS50ZXh0LCB7XG4gICAgICAgICAgICAgICAgICAgIF9fc3ltYm9saWM6ICdyZWZlcmVuY2UnLFxuICAgICAgICAgICAgICAgICAgICBtb2R1bGU6IGZyb20sXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IGJpbmRpbmcucHJvcGVydHlOYW1lID8gYmluZGluZy5wcm9wZXJ0eU5hbWUudGV4dCA6IGJpbmRpbmcubmFtZS50ZXh0XG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5OYW1lc3BhY2VJbXBvcnQ6XG4gICAgICAgICAgICAgICAgLy8gQW4gYGlucHV0ICogYXMgPGlkZW50aWZpZXI+IGZyb20gPG1vZHVsZS1zcGVjaWZpZXI+YCBjbGF1c2UuXG4gICAgICAgICAgICAgICAgc3ltYm9scy5zZXQoXG4gICAgICAgICAgICAgICAgICAgICg8dHMuTmFtZXNwYWNlSW1wb3J0PmJpbmRpbmdzKS5uYW1lLnRleHQsXG4gICAgICAgICAgICAgICAgICAgIHtfX3N5bWJvbGljOiAncmVmZXJlbmNlJywgbW9kdWxlOiBmcm9tfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgdHMuZm9yRWFjaENoaWxkKG5vZGUsIHZpc2l0KTtcbiAgICB9O1xuICAgIGlmICh0aGlzLnNvdXJjZUZpbGUpIHtcbiAgICAgIHRzLmZvckVhY2hDaGlsZCh0aGlzLnNvdXJjZUZpbGUsIHZpc2l0KTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gcG9wdWxhdGVCdWlsdGlucyhzeW1ib2xzOiBNYXA8c3RyaW5nLCBNZXRhZGF0YVZhbHVlPikge1xuICAvLyBGcm9tIGxpYi5jb3JlLmQudHMgKGFsbCBcImRlZmluZSBjb25zdFwiKVxuICBbJ09iamVjdCcsICdGdW5jdGlvbicsICdTdHJpbmcnLCAnTnVtYmVyJywgJ0FycmF5JywgJ0Jvb2xlYW4nLCAnTWFwJywgJ05hTicsICdJbmZpbml0eScsICdNYXRoJyxcbiAgICdEYXRlJywgJ1JlZ0V4cCcsICdFcnJvcicsICdFcnJvcicsICdFdmFsRXJyb3InLCAnUmFuZ2VFcnJvcicsICdSZWZlcmVuY2VFcnJvcicsICdTeW50YXhFcnJvcicsXG4gICAnVHlwZUVycm9yJywgJ1VSSUVycm9yJywgJ0pTT04nLCAnQXJyYXlCdWZmZXInLCAnRGF0YVZpZXcnLCAnSW50OEFycmF5JywgJ1VpbnQ4QXJyYXknLFxuICAgJ1VpbnQ4Q2xhbXBlZEFycmF5JywgJ1VpbnQxNkFycmF5JywgJ0ludDE2QXJyYXknLCAnSW50MzJBcnJheScsICdVaW50MzJBcnJheScsICdGbG9hdDMyQXJyYXknLFxuICAgJ0Zsb2F0NjRBcnJheSddXG4gICAgICAuZm9yRWFjaChuYW1lID0+IHN5bWJvbHMuc2V0KG5hbWUsIHtfX3N5bWJvbGljOiAncmVmZXJlbmNlJywgbmFtZX0pKTtcbn1cbiJdfQ==