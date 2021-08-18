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
        define("@angular/compiler-cli/src/ngtsc/switch/src/switch", ["require", "exports", "tslib", "typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    var IVY_SWITCH_PRE_SUFFIX = '__PRE_R3__';
    var IVY_SWITCH_POST_SUFFIX = '__POST_R3__';
    function ivySwitchTransform(_) {
        return flipIvySwitchInFile;
    }
    exports.ivySwitchTransform = ivySwitchTransform;
    function flipIvySwitchInFile(sf) {
        // To replace the statements array, it must be copied. This only needs to happen if a statement
        // must actually be replaced within the array, so the newStatements array is lazily initialized.
        var newStatements = undefined;
        // Iterate over the statements in the file.
        for (var i = 0; i < sf.statements.length; i++) {
            var statement = sf.statements[i];
            // Skip over everything that isn't a variable statement.
            if (!ts.isVariableStatement(statement) || !hasIvySwitches(statement)) {
                continue;
            }
            // This statement needs to be replaced. Check if the newStatements array needs to be lazily
            // initialized to a copy of the original statements.
            if (newStatements === undefined) {
                newStatements = tslib_1.__spread(sf.statements);
            }
            // Flip any switches in the VariableStatement. If there were any, a new statement will be
            // returned; otherwise the old statement will be.
            newStatements[i] = flipIvySwitchesInVariableStatement(statement, sf.statements);
        }
        // Only update the statements in the SourceFile if any have changed.
        if (newStatements !== undefined) {
            sf = ts.getMutableClone(sf);
            sf.statements = ts.createNodeArray(newStatements);
        }
        return sf;
    }
    /**
     * Look for the ts.Identifier of a ts.Declaration with this name.
     *
     * The real identifier is needed (rather than fabricating one) as TypeScript decides how to
     * reference this identifier based on information stored against its node in the AST, which a
     * synthetic node would not have. In particular, since the post-switch variable is often exported,
     * TypeScript needs to know this so it can write `exports.VAR` instead of just `VAR` when emitting
     * code.
     *
     * Only variable, function, and class declarations are currently searched.
     */
    function findPostSwitchIdentifier(statements, name) {
        var e_1, _a;
        try {
            for (var statements_1 = tslib_1.__values(statements), statements_1_1 = statements_1.next(); !statements_1_1.done; statements_1_1 = statements_1.next()) {
                var stmt = statements_1_1.value;
                if (ts.isVariableStatement(stmt)) {
                    var decl = stmt.declarationList.declarations.find(function (decl) { return ts.isIdentifier(decl.name) && decl.name.text === name; });
                    if (decl !== undefined) {
                        return decl.name;
                    }
                }
                else if (ts.isFunctionDeclaration(stmt) || ts.isClassDeclaration(stmt)) {
                    if (stmt.name !== undefined && ts.isIdentifier(stmt.name) && stmt.name.text === name) {
                        return stmt.name;
                    }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (statements_1_1 && !statements_1_1.done && (_a = statements_1.return)) _a.call(statements_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return null;
    }
    /**
     * Flip any Ivy switches which are discovered in the given ts.VariableStatement.
     */
    function flipIvySwitchesInVariableStatement(stmt, statements) {
        // Build a new list of variable declarations. Specific declarations that are initialized to a
        // pre-switch identifier will be replaced with a declaration initialized to the post-switch
        // identifier.
        var newDeclarations = tslib_1.__spread(stmt.declarationList.declarations);
        for (var i = 0; i < newDeclarations.length; i++) {
            var decl = newDeclarations[i];
            // Skip declarations that aren't initialized to an identifier.
            if (decl.initializer === undefined || !ts.isIdentifier(decl.initializer)) {
                continue;
            }
            // Skip declarations that aren't Ivy switches.
            if (!decl.initializer.text.endsWith(IVY_SWITCH_PRE_SUFFIX)) {
                continue;
            }
            // Determine the name of the post-switch variable.
            var postSwitchName = decl.initializer.text.replace(IVY_SWITCH_PRE_SUFFIX, IVY_SWITCH_POST_SUFFIX);
            // Find the post-switch variable identifier. If one can't be found, it's an error. This is
            // reported as a thrown error and not a diagnostic as transformers cannot output diagnostics.
            var newIdentifier = findPostSwitchIdentifier(statements, postSwitchName);
            if (newIdentifier === null) {
                throw new Error("Unable to find identifier " + postSwitchName + " in " + stmt.getSourceFile().fileName + " for the Ivy switch.");
            }
            // Copy the identifier with updateIdentifier(). This copies the internal information which
            // allows TS to write a correct reference to the identifier.
            newIdentifier = ts.updateIdentifier(newIdentifier);
            newDeclarations[i] = ts.updateVariableDeclaration(
            /* node */ decl, 
            /* name */ decl.name, 
            /* type */ decl.type, 
            /* initializer */ newIdentifier);
        }
        var newDeclList = ts.updateVariableDeclarationList(
        /* declarationList */ stmt.declarationList, 
        /* declarations */ newDeclarations);
        var newStmt = ts.updateVariableStatement(
        /* statement */ stmt, 
        /* modifiers */ stmt.modifiers, 
        /* declarationList */ newDeclList);
        return newStmt;
    }
    /**
     * Check whether the given VariableStatement has any Ivy switch variables.
     */
    function hasIvySwitches(stmt) {
        return stmt.declarationList.declarations.some(function (decl) { return decl.initializer !== undefined && ts.isIdentifier(decl.initializer) &&
            decl.initializer.text.endsWith(IVY_SWITCH_PRE_SUFFIX); });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3dpdGNoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9uZ3RzYy9zd2l0Y2gvc3JjL3N3aXRjaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCwrQkFBaUM7SUFFakMsSUFBTSxxQkFBcUIsR0FBRyxZQUFZLENBQUM7SUFDM0MsSUFBTSxzQkFBc0IsR0FBRyxhQUFhLENBQUM7SUFFN0MsU0FBZ0Isa0JBQWtCLENBQUMsQ0FBMkI7UUFDNUQsT0FBTyxtQkFBbUIsQ0FBQztJQUM3QixDQUFDO0lBRkQsZ0RBRUM7SUFFRCxTQUFTLG1CQUFtQixDQUFDLEVBQWlCO1FBQzVDLCtGQUErRjtRQUMvRixnR0FBZ0c7UUFDaEcsSUFBSSxhQUFhLEdBQTZCLFNBQVMsQ0FBQztRQUV4RCwyQ0FBMkM7UUFDM0MsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzdDLElBQU0sU0FBUyxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFbkMsd0RBQXdEO1lBQ3hELElBQUksQ0FBQyxFQUFFLENBQUMsbUJBQW1CLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLEVBQUU7Z0JBQ3BFLFNBQVM7YUFDVjtZQUVELDJGQUEyRjtZQUMzRixvREFBb0Q7WUFDcEQsSUFBSSxhQUFhLEtBQUssU0FBUyxFQUFFO2dCQUMvQixhQUFhLG9CQUFPLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUNwQztZQUVELHlGQUF5RjtZQUN6RixpREFBaUQ7WUFDakQsYUFBYSxDQUFDLENBQUMsQ0FBQyxHQUFHLGtDQUFrQyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDakY7UUFFRCxvRUFBb0U7UUFDcEUsSUFBSSxhQUFhLEtBQUssU0FBUyxFQUFFO1lBQy9CLEVBQUUsR0FBRyxFQUFFLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzVCLEVBQUUsQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDLGVBQWUsQ0FBQyxhQUFhLENBQUMsQ0FBQztTQUNuRDtRQUNELE9BQU8sRUFBRSxDQUFDO0lBQ1osQ0FBQztJQUVEOzs7Ozs7Ozs7O09BVUc7SUFDSCxTQUFTLHdCQUF3QixDQUM3QixVQUF1QyxFQUFFLElBQVk7OztZQUN2RCxLQUFtQixJQUFBLGVBQUEsaUJBQUEsVUFBVSxDQUFBLHNDQUFBLDhEQUFFO2dCQUExQixJQUFNLElBQUksdUJBQUE7Z0JBQ2IsSUFBSSxFQUFFLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQ2hDLElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDLElBQUksQ0FDL0MsVUFBQSxJQUFJLElBQUksT0FBQSxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxJQUFJLEVBQXJELENBQXFELENBQUMsQ0FBQztvQkFDbkUsSUFBSSxJQUFJLEtBQUssU0FBUyxFQUFFO3dCQUN0QixPQUFPLElBQUksQ0FBQyxJQUFxQixDQUFDO3FCQUNuQztpQkFDRjtxQkFBTSxJQUFJLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQ3hFLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxTQUFTLElBQUksRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssSUFBSSxFQUFFO3dCQUNwRixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7cUJBQ2xCO2lCQUNGO2FBQ0Y7Ozs7Ozs7OztRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVEOztPQUVHO0lBQ0gsU0FBUyxrQ0FBa0MsQ0FDdkMsSUFBMEIsRUFBRSxVQUF1QztRQUNyRSw2RkFBNkY7UUFDN0YsMkZBQTJGO1FBQzNGLGNBQWM7UUFDZCxJQUFNLGVBQWUsb0JBQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMvRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsZUFBZSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUMvQyxJQUFNLElBQUksR0FBRyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFaEMsOERBQThEO1lBQzlELElBQUksSUFBSSxDQUFDLFdBQVcsS0FBSyxTQUFTLElBQUksQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRTtnQkFDeEUsU0FBUzthQUNWO1lBRUQsOENBQThDO1lBQzlDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMscUJBQXFCLENBQUMsRUFBRTtnQkFDMUQsU0FBUzthQUNWO1lBRUQsa0RBQWtEO1lBQ2xELElBQU0sY0FBYyxHQUNoQixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMscUJBQXFCLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztZQUVqRiwwRkFBMEY7WUFDMUYsNkZBQTZGO1lBQzdGLElBQUksYUFBYSxHQUFHLHdCQUF3QixDQUFDLFVBQVUsRUFBRSxjQUFjLENBQUMsQ0FBQztZQUN6RSxJQUFJLGFBQWEsS0FBSyxJQUFJLEVBQUU7Z0JBQzFCLE1BQU0sSUFBSSxLQUFLLENBQ1gsK0JBQTZCLGNBQWMsWUFBTyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsUUFBUSx5QkFBc0IsQ0FBQyxDQUFDO2FBQzVHO1lBRUQsMEZBQTBGO1lBQzFGLDREQUE0RDtZQUM1RCxhQUFhLEdBQUcsRUFBRSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBRW5ELGVBQWUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMseUJBQXlCO1lBQzdDLFVBQVUsQ0FBQyxJQUFJO1lBQ2YsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJO1lBQ3BCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSTtZQUNwQixpQkFBaUIsQ0FBQyxhQUFhLENBQUMsQ0FBQztTQUN0QztRQUVELElBQU0sV0FBVyxHQUFHLEVBQUUsQ0FBQyw2QkFBNkI7UUFDaEQscUJBQXFCLENBQUMsSUFBSSxDQUFDLGVBQWU7UUFDMUMsa0JBQWtCLENBQUMsZUFBZSxDQUFDLENBQUM7UUFFeEMsSUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDLHVCQUF1QjtRQUN0QyxlQUFlLENBQUMsSUFBSTtRQUNwQixlQUFlLENBQUMsSUFBSSxDQUFDLFNBQVM7UUFDOUIscUJBQXFCLENBQUMsV0FBVyxDQUFDLENBQUM7UUFFdkMsT0FBTyxPQUFPLENBQUM7SUFDakIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsU0FBUyxjQUFjLENBQUMsSUFBMEI7UUFDaEQsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQ3pDLFVBQUEsSUFBSSxJQUFJLE9BQUEsSUFBSSxDQUFDLFdBQVcsS0FBSyxTQUFTLElBQUksRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDO1lBQ3ZFLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxFQURqRCxDQUNpRCxDQUFDLENBQUM7SUFDakUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmNvbnN0IElWWV9TV0lUQ0hfUFJFX1NVRkZJWCA9ICdfX1BSRV9SM19fJztcbmNvbnN0IElWWV9TV0lUQ0hfUE9TVF9TVUZGSVggPSAnX19QT1NUX1IzX18nO1xuXG5leHBvcnQgZnVuY3Rpb24gaXZ5U3dpdGNoVHJhbnNmb3JtKF86IHRzLlRyYW5zZm9ybWF0aW9uQ29udGV4dCk6IHRzLlRyYW5zZm9ybWVyPHRzLlNvdXJjZUZpbGU+IHtcbiAgcmV0dXJuIGZsaXBJdnlTd2l0Y2hJbkZpbGU7XG59XG5cbmZ1bmN0aW9uIGZsaXBJdnlTd2l0Y2hJbkZpbGUoc2Y6IHRzLlNvdXJjZUZpbGUpOiB0cy5Tb3VyY2VGaWxlIHtcbiAgLy8gVG8gcmVwbGFjZSB0aGUgc3RhdGVtZW50cyBhcnJheSwgaXQgbXVzdCBiZSBjb3BpZWQuIFRoaXMgb25seSBuZWVkcyB0byBoYXBwZW4gaWYgYSBzdGF0ZW1lbnRcbiAgLy8gbXVzdCBhY3R1YWxseSBiZSByZXBsYWNlZCB3aXRoaW4gdGhlIGFycmF5LCBzbyB0aGUgbmV3U3RhdGVtZW50cyBhcnJheSBpcyBsYXppbHkgaW5pdGlhbGl6ZWQuXG4gIGxldCBuZXdTdGF0ZW1lbnRzOiB0cy5TdGF0ZW1lbnRbXXx1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG5cbiAgLy8gSXRlcmF0ZSBvdmVyIHRoZSBzdGF0ZW1lbnRzIGluIHRoZSBmaWxlLlxuICBmb3IgKGxldCBpID0gMDsgaSA8IHNmLnN0YXRlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBzdGF0ZW1lbnQgPSBzZi5zdGF0ZW1lbnRzW2ldO1xuXG4gICAgLy8gU2tpcCBvdmVyIGV2ZXJ5dGhpbmcgdGhhdCBpc24ndCBhIHZhcmlhYmxlIHN0YXRlbWVudC5cbiAgICBpZiAoIXRzLmlzVmFyaWFibGVTdGF0ZW1lbnQoc3RhdGVtZW50KSB8fCAhaGFzSXZ5U3dpdGNoZXMoc3RhdGVtZW50KSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gVGhpcyBzdGF0ZW1lbnQgbmVlZHMgdG8gYmUgcmVwbGFjZWQuIENoZWNrIGlmIHRoZSBuZXdTdGF0ZW1lbnRzIGFycmF5IG5lZWRzIHRvIGJlIGxhemlseVxuICAgIC8vIGluaXRpYWxpemVkIHRvIGEgY29weSBvZiB0aGUgb3JpZ2luYWwgc3RhdGVtZW50cy5cbiAgICBpZiAobmV3U3RhdGVtZW50cyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBuZXdTdGF0ZW1lbnRzID0gWy4uLnNmLnN0YXRlbWVudHNdO1xuICAgIH1cblxuICAgIC8vIEZsaXAgYW55IHN3aXRjaGVzIGluIHRoZSBWYXJpYWJsZVN0YXRlbWVudC4gSWYgdGhlcmUgd2VyZSBhbnksIGEgbmV3IHN0YXRlbWVudCB3aWxsIGJlXG4gICAgLy8gcmV0dXJuZWQ7IG90aGVyd2lzZSB0aGUgb2xkIHN0YXRlbWVudCB3aWxsIGJlLlxuICAgIG5ld1N0YXRlbWVudHNbaV0gPSBmbGlwSXZ5U3dpdGNoZXNJblZhcmlhYmxlU3RhdGVtZW50KHN0YXRlbWVudCwgc2Yuc3RhdGVtZW50cyk7XG4gIH1cblxuICAvLyBPbmx5IHVwZGF0ZSB0aGUgc3RhdGVtZW50cyBpbiB0aGUgU291cmNlRmlsZSBpZiBhbnkgaGF2ZSBjaGFuZ2VkLlxuICBpZiAobmV3U3RhdGVtZW50cyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgc2YgPSB0cy5nZXRNdXRhYmxlQ2xvbmUoc2YpO1xuICAgIHNmLnN0YXRlbWVudHMgPSB0cy5jcmVhdGVOb2RlQXJyYXkobmV3U3RhdGVtZW50cyk7XG4gIH1cbiAgcmV0dXJuIHNmO1xufVxuXG4vKipcbiAqIExvb2sgZm9yIHRoZSB0cy5JZGVudGlmaWVyIG9mIGEgdHMuRGVjbGFyYXRpb24gd2l0aCB0aGlzIG5hbWUuXG4gKlxuICogVGhlIHJlYWwgaWRlbnRpZmllciBpcyBuZWVkZWQgKHJhdGhlciB0aGFuIGZhYnJpY2F0aW5nIG9uZSkgYXMgVHlwZVNjcmlwdCBkZWNpZGVzIGhvdyB0b1xuICogcmVmZXJlbmNlIHRoaXMgaWRlbnRpZmllciBiYXNlZCBvbiBpbmZvcm1hdGlvbiBzdG9yZWQgYWdhaW5zdCBpdHMgbm9kZSBpbiB0aGUgQVNULCB3aGljaCBhXG4gKiBzeW50aGV0aWMgbm9kZSB3b3VsZCBub3QgaGF2ZS4gSW4gcGFydGljdWxhciwgc2luY2UgdGhlIHBvc3Qtc3dpdGNoIHZhcmlhYmxlIGlzIG9mdGVuIGV4cG9ydGVkLFxuICogVHlwZVNjcmlwdCBuZWVkcyB0byBrbm93IHRoaXMgc28gaXQgY2FuIHdyaXRlIGBleHBvcnRzLlZBUmAgaW5zdGVhZCBvZiBqdXN0IGBWQVJgIHdoZW4gZW1pdHRpbmdcbiAqIGNvZGUuXG4gKlxuICogT25seSB2YXJpYWJsZSwgZnVuY3Rpb24sIGFuZCBjbGFzcyBkZWNsYXJhdGlvbnMgYXJlIGN1cnJlbnRseSBzZWFyY2hlZC5cbiAqL1xuZnVuY3Rpb24gZmluZFBvc3RTd2l0Y2hJZGVudGlmaWVyKFxuICAgIHN0YXRlbWVudHM6IFJlYWRvbmx5QXJyYXk8dHMuU3RhdGVtZW50PiwgbmFtZTogc3RyaW5nKTogdHMuSWRlbnRpZmllcnxudWxsIHtcbiAgZm9yIChjb25zdCBzdG10IG9mIHN0YXRlbWVudHMpIHtcbiAgICBpZiAodHMuaXNWYXJpYWJsZVN0YXRlbWVudChzdG10KSkge1xuICAgICAgY29uc3QgZGVjbCA9IHN0bXQuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9ucy5maW5kKFxuICAgICAgICAgIGRlY2wgPT4gdHMuaXNJZGVudGlmaWVyKGRlY2wubmFtZSkgJiYgZGVjbC5uYW1lLnRleHQgPT09IG5hbWUpO1xuICAgICAgaWYgKGRlY2wgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gZGVjbC5uYW1lIGFzIHRzLklkZW50aWZpZXI7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0cy5pc0Z1bmN0aW9uRGVjbGFyYXRpb24oc3RtdCkgfHwgdHMuaXNDbGFzc0RlY2xhcmF0aW9uKHN0bXQpKSB7XG4gICAgICBpZiAoc3RtdC5uYW1lICE9PSB1bmRlZmluZWQgJiYgdHMuaXNJZGVudGlmaWVyKHN0bXQubmFtZSkgJiYgc3RtdC5uYW1lLnRleHQgPT09IG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHN0bXQubmFtZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8qKlxuICogRmxpcCBhbnkgSXZ5IHN3aXRjaGVzIHdoaWNoIGFyZSBkaXNjb3ZlcmVkIGluIHRoZSBnaXZlbiB0cy5WYXJpYWJsZVN0YXRlbWVudC5cbiAqL1xuZnVuY3Rpb24gZmxpcEl2eVN3aXRjaGVzSW5WYXJpYWJsZVN0YXRlbWVudChcbiAgICBzdG10OiB0cy5WYXJpYWJsZVN0YXRlbWVudCwgc3RhdGVtZW50czogUmVhZG9ubHlBcnJheTx0cy5TdGF0ZW1lbnQ+KTogdHMuVmFyaWFibGVTdGF0ZW1lbnQge1xuICAvLyBCdWlsZCBhIG5ldyBsaXN0IG9mIHZhcmlhYmxlIGRlY2xhcmF0aW9ucy4gU3BlY2lmaWMgZGVjbGFyYXRpb25zIHRoYXQgYXJlIGluaXRpYWxpemVkIHRvIGFcbiAgLy8gcHJlLXN3aXRjaCBpZGVudGlmaWVyIHdpbGwgYmUgcmVwbGFjZWQgd2l0aCBhIGRlY2xhcmF0aW9uIGluaXRpYWxpemVkIHRvIHRoZSBwb3N0LXN3aXRjaFxuICAvLyBpZGVudGlmaWVyLlxuICBjb25zdCBuZXdEZWNsYXJhdGlvbnMgPSBbLi4uc3RtdC5kZWNsYXJhdGlvbkxpc3QuZGVjbGFyYXRpb25zXTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBuZXdEZWNsYXJhdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBkZWNsID0gbmV3RGVjbGFyYXRpb25zW2ldO1xuXG4gICAgLy8gU2tpcCBkZWNsYXJhdGlvbnMgdGhhdCBhcmVuJ3QgaW5pdGlhbGl6ZWQgdG8gYW4gaWRlbnRpZmllci5cbiAgICBpZiAoZGVjbC5pbml0aWFsaXplciA9PT0gdW5kZWZpbmVkIHx8ICF0cy5pc0lkZW50aWZpZXIoZGVjbC5pbml0aWFsaXplcikpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIFNraXAgZGVjbGFyYXRpb25zIHRoYXQgYXJlbid0IEl2eSBzd2l0Y2hlcy5cbiAgICBpZiAoIWRlY2wuaW5pdGlhbGl6ZXIudGV4dC5lbmRzV2l0aChJVllfU1dJVENIX1BSRV9TVUZGSVgpKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBEZXRlcm1pbmUgdGhlIG5hbWUgb2YgdGhlIHBvc3Qtc3dpdGNoIHZhcmlhYmxlLlxuICAgIGNvbnN0IHBvc3RTd2l0Y2hOYW1lID1cbiAgICAgICAgZGVjbC5pbml0aWFsaXplci50ZXh0LnJlcGxhY2UoSVZZX1NXSVRDSF9QUkVfU1VGRklYLCBJVllfU1dJVENIX1BPU1RfU1VGRklYKTtcblxuICAgIC8vIEZpbmQgdGhlIHBvc3Qtc3dpdGNoIHZhcmlhYmxlIGlkZW50aWZpZXIuIElmIG9uZSBjYW4ndCBiZSBmb3VuZCwgaXQncyBhbiBlcnJvci4gVGhpcyBpc1xuICAgIC8vIHJlcG9ydGVkIGFzIGEgdGhyb3duIGVycm9yIGFuZCBub3QgYSBkaWFnbm9zdGljIGFzIHRyYW5zZm9ybWVycyBjYW5ub3Qgb3V0cHV0IGRpYWdub3N0aWNzLlxuICAgIGxldCBuZXdJZGVudGlmaWVyID0gZmluZFBvc3RTd2l0Y2hJZGVudGlmaWVyKHN0YXRlbWVudHMsIHBvc3RTd2l0Y2hOYW1lKTtcbiAgICBpZiAobmV3SWRlbnRpZmllciA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBVbmFibGUgdG8gZmluZCBpZGVudGlmaWVyICR7cG9zdFN3aXRjaE5hbWV9IGluICR7c3RtdC5nZXRTb3VyY2VGaWxlKCkuZmlsZU5hbWV9IGZvciB0aGUgSXZ5IHN3aXRjaC5gKTtcbiAgICB9XG5cbiAgICAvLyBDb3B5IHRoZSBpZGVudGlmaWVyIHdpdGggdXBkYXRlSWRlbnRpZmllcigpLiBUaGlzIGNvcGllcyB0aGUgaW50ZXJuYWwgaW5mb3JtYXRpb24gd2hpY2hcbiAgICAvLyBhbGxvd3MgVFMgdG8gd3JpdGUgYSBjb3JyZWN0IHJlZmVyZW5jZSB0byB0aGUgaWRlbnRpZmllci5cbiAgICBuZXdJZGVudGlmaWVyID0gdHMudXBkYXRlSWRlbnRpZmllcihuZXdJZGVudGlmaWVyKTtcblxuICAgIG5ld0RlY2xhcmF0aW9uc1tpXSA9IHRzLnVwZGF0ZVZhcmlhYmxlRGVjbGFyYXRpb24oXG4gICAgICAgIC8qIG5vZGUgKi8gZGVjbCxcbiAgICAgICAgLyogbmFtZSAqLyBkZWNsLm5hbWUsXG4gICAgICAgIC8qIHR5cGUgKi8gZGVjbC50eXBlLFxuICAgICAgICAvKiBpbml0aWFsaXplciAqLyBuZXdJZGVudGlmaWVyKTtcbiAgfVxuXG4gIGNvbnN0IG5ld0RlY2xMaXN0ID0gdHMudXBkYXRlVmFyaWFibGVEZWNsYXJhdGlvbkxpc3QoXG4gICAgICAvKiBkZWNsYXJhdGlvbkxpc3QgKi8gc3RtdC5kZWNsYXJhdGlvbkxpc3QsXG4gICAgICAvKiBkZWNsYXJhdGlvbnMgKi8gbmV3RGVjbGFyYXRpb25zKTtcblxuICBjb25zdCBuZXdTdG10ID0gdHMudXBkYXRlVmFyaWFibGVTdGF0ZW1lbnQoXG4gICAgICAvKiBzdGF0ZW1lbnQgKi8gc3RtdCxcbiAgICAgIC8qIG1vZGlmaWVycyAqLyBzdG10Lm1vZGlmaWVycyxcbiAgICAgIC8qIGRlY2xhcmF0aW9uTGlzdCAqLyBuZXdEZWNsTGlzdCk7XG5cbiAgcmV0dXJuIG5ld1N0bXQ7XG59XG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciB0aGUgZ2l2ZW4gVmFyaWFibGVTdGF0ZW1lbnQgaGFzIGFueSBJdnkgc3dpdGNoIHZhcmlhYmxlcy5cbiAqL1xuZnVuY3Rpb24gaGFzSXZ5U3dpdGNoZXMoc3RtdDogdHMuVmFyaWFibGVTdGF0ZW1lbnQpIHtcbiAgcmV0dXJuIHN0bXQuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9ucy5zb21lKFxuICAgICAgZGVjbCA9PiBkZWNsLmluaXRpYWxpemVyICE9PSB1bmRlZmluZWQgJiYgdHMuaXNJZGVudGlmaWVyKGRlY2wuaW5pdGlhbGl6ZXIpICYmXG4gICAgICAgICAgZGVjbC5pbml0aWFsaXplci50ZXh0LmVuZHNXaXRoKElWWV9TV0lUQ0hfUFJFX1NVRkZJWCkpO1xufVxuIl19