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
        define("@angular/compiler-cli/src/ngtsc/annotations/src/metadata", ["require", "exports", "@angular/compiler", "typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var compiler_1 = require("@angular/compiler");
    var ts = require("typescript");
    /**
     * Given a class declaration, generate a call to `setClassMetadata` with the Angular metadata
     * present on the class or its member fields.
     *
     * If no such metadata is present, this function returns `null`. Otherwise, the call is returned
     * as a `Statement` for inclusion along with the class.
     */
    function generateSetClassMetadataCall(clazz, reflection, isCore) {
        if (!reflection.isClass(clazz) || clazz.name === undefined || !ts.isIdentifier(clazz.name)) {
            return null;
        }
        var id = ts.updateIdentifier(clazz.name);
        // Reflect over the class decorators. If none are present, or those that are aren't from
        // Angular, then return null. Otherwise, turn them into metadata.
        var classDecorators = reflection.getDecoratorsOfDeclaration(clazz);
        if (classDecorators === null) {
            return null;
        }
        var ngClassDecorators = classDecorators.filter(function (dec) { return isAngularDecorator(dec, isCore); }).map(decoratorToMetadata);
        if (ngClassDecorators.length === 0) {
            return null;
        }
        var metaDecorators = ts.createArrayLiteral(ngClassDecorators);
        // Convert the constructor parameters to metadata, passing null if none are present.
        var metaCtorParameters = ts.createNull();
        var classCtorParameters = reflection.getConstructorParameters(clazz);
        if (classCtorParameters !== null) {
            var ctorParameters = ts.createArrayLiteral(classCtorParameters.map(function (param) { return ctorParameterToMetadata(param, isCore); }));
            metaCtorParameters = ts.createFunctionExpression(
            /* modifiers */ undefined, 
            /* asteriskToken */ undefined, 
            /* name */ undefined, 
            /* typeParameters */ undefined, 
            /* parameters */ undefined, 
            /* type */ undefined, ts.createBlock([ts.createReturn(ctorParameters)]));
        }
        // Do the same for property decorators.
        var metaPropDecorators = ts.createNull();
        var decoratedMembers = reflection.getMembersOfClass(clazz)
            .filter(function (member) { return !member.isStatic && member.decorators !== null; })
            .map(function (member) { return classMemberToMetadata(member.name, member.decorators, isCore); });
        if (decoratedMembers.length > 0) {
            metaPropDecorators = ts.createObjectLiteral(decoratedMembers);
        }
        // Generate a pure call to setClassMetadata with the class identifier and its metadata.
        var setClassMetadata = new compiler_1.ExternalExpr(compiler_1.Identifiers.setClassMetadata);
        var fnCall = new compiler_1.InvokeFunctionExpr(
        /* fn */ setClassMetadata, 
        /* args */
        [
            new compiler_1.WrappedNodeExpr(id),
            new compiler_1.WrappedNodeExpr(metaDecorators),
            new compiler_1.WrappedNodeExpr(metaCtorParameters),
            new compiler_1.WrappedNodeExpr(metaPropDecorators),
        ], 
        /* type */ undefined, 
        /* sourceSpan */ undefined, 
        /* pure */ true);
        return fnCall.toStmt();
    }
    exports.generateSetClassMetadataCall = generateSetClassMetadataCall;
    /**
     * Convert a reflected constructor parameter to metadata.
     */
    function ctorParameterToMetadata(param, isCore) {
        // Parameters sometimes have a type that can be referenced. If so, then use it, otherwise
        // its type is undefined.
        var type = param.typeExpression !== null ? param.typeExpression : ts.createIdentifier('undefined');
        var properties = [
            ts.createPropertyAssignment('type', type),
        ];
        // If the parameter has decorators, include the ones from Angular.
        if (param.decorators !== null) {
            var ngDecorators = param.decorators.filter(function (dec) { return isAngularDecorator(dec, isCore); }).map(decoratorToMetadata);
            properties.push(ts.createPropertyAssignment('decorators', ts.createArrayLiteral(ngDecorators)));
        }
        return ts.createObjectLiteral(properties, true);
    }
    /**
     * Convert a reflected class member to metadata.
     */
    function classMemberToMetadata(name, decorators, isCore) {
        var ngDecorators = decorators.filter(function (dec) { return isAngularDecorator(dec, isCore); }).map(decoratorToMetadata);
        var decoratorMeta = ts.createArrayLiteral(ngDecorators);
        return ts.createPropertyAssignment(name, decoratorMeta);
    }
    /**
     * Convert a reflected decorator to metadata.
     */
    function decoratorToMetadata(decorator) {
        // Decorators have a type.
        var properties = [
            ts.createPropertyAssignment('type', ts.updateIdentifier(decorator.identifier)),
        ];
        // Sometimes they have arguments.
        if (decorator.args !== null && decorator.args.length > 0) {
            var args = decorator.args.map(function (arg) { return ts.getMutableClone(arg); });
            properties.push(ts.createPropertyAssignment('args', ts.createArrayLiteral(args)));
        }
        return ts.createObjectLiteral(properties, true);
    }
    /**
     * Whether a given decorator should be treated as an Angular decorator.
     *
     * Either it's used in @angular/core, or it's imported from there.
     */
    function isAngularDecorator(decorator, isCore) {
        return isCore || (decorator.import !== null && decorator.import.from === '@angular/core');
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWRhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL2Fubm90YXRpb25zL3NyYy9tZXRhZGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILDhDQUE0RztJQUM1RywrQkFBaUM7SUFJakM7Ozs7OztPQU1HO0lBQ0gsU0FBZ0IsNEJBQTRCLENBQ3hDLEtBQXFCLEVBQUUsVUFBMEIsRUFBRSxNQUFlO1FBQ3BFLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssU0FBUyxJQUFJLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDMUYsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUNELElBQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFM0Msd0ZBQXdGO1FBQ3hGLGlFQUFpRTtRQUNqRSxJQUFNLGVBQWUsR0FBRyxVQUFVLENBQUMsMEJBQTBCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDckUsSUFBSSxlQUFlLEtBQUssSUFBSSxFQUFFO1lBQzVCLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFDRCxJQUFNLGlCQUFpQixHQUNuQixlQUFlLENBQUMsTUFBTSxDQUFDLFVBQUEsR0FBRyxJQUFJLE9BQUEsa0JBQWtCLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxFQUEvQixDQUErQixDQUFDLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDNUYsSUFBSSxpQkFBaUIsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ2xDLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFDRCxJQUFNLGNBQWMsR0FBRyxFQUFFLENBQUMs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Q0FBQyxFQUFFO1lBQ3hELElBQU0sSUFBSSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQUEsR0FBRyxJQUFJLE9BQUEsRUFBRSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsRUFBdkIsQ0FBdUIsQ0FBQyxDQUFDO1lBQ2hFLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLHdCQUF3QixDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ25GO1FBQ0QsT0FBTyxFQUFFLENBQUMsbUJBQW1CLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsU0FBUyxrQkFBa0IsQ0FBQyxTQUFvQixFQUFFLE1BQWU7UUFDL0QsT0FBTyxNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxLQUFLLElBQUksSUFBSSxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxlQUFlLENBQUMsQ0FBQztJQUM1RixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0V4dGVybmFsRXhwciwgSWRlbnRpZmllcnMsIEludm9rZUZ1bmN0aW9uRXhwciwgU3RhdGVtZW50LCBXcmFwcGVkTm9kZUV4cHJ9IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge0N0b3JQYXJhbWV0ZXIsIERlY29yYXRvciwgUmVmbGVjdGlvbkhvc3R9IGZyb20gJy4uLy4uL2hvc3QnO1xuXG4vKipcbiAqIEdpdmVuIGEgY2xhc3MgZGVjbGFyYXRpb24sIGdlbmVyYXRlIGEgY2FsbCB0byBgc2V0Q2xhc3NNZXRhZGF0YWAgd2l0aCB0aGUgQW5ndWxhciBtZXRhZGF0YVxuICogcHJlc2VudCBvbiB0aGUgY2xhc3Mgb3IgaXRzIG1lbWJlciBmaWVsZHMuXG4gKlxuICogSWYgbm8gc3VjaCBtZXRhZGF0YSBpcyBwcmVzZW50LCB0aGlzIGZ1bmN0aW9uIHJldHVybnMgYG51bGxgLiBPdGhlcndpc2UsIHRoZSBjYWxsIGlzIHJldHVybmVkXG4gKiBhcyBhIGBTdGF0ZW1lbnRgIGZvciBpbmNsdXNpb24gYWxvbmcgd2l0aCB0aGUgY2xhc3MuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZVNldENsYXNzTWV0YWRhdGFDYWxsKFxuICAgIGNsYXp6OiB0cy5EZWNsYXJhdGlvbiwgcmVmbGVjdGlvbjogUmVmbGVjdGlvbkhvc3QsIGlzQ29yZTogYm9vbGVhbik6IFN0YXRlbWVudHxudWxsIHtcbiAgaWYgKCFyZWZsZWN0aW9uLmlzQ2xhc3MoY2xhenopIHx8IGNsYXp6Lm5hbWUgPT09IHVuZGVmaW5lZCB8fCAhdHMuaXNJZGVudGlmaWVyKGNsYXp6Lm5hbWUpKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgY29uc3QgaWQgPSB0cy51cGRhdGVJZGVudGlmaWVyKGNsYXp6Lm5hbWUpO1xuXG4gIC8vIFJlZmxlY3Qgb3ZlciB0aGUgY2xhc3MgZGVjb3JhdG9ycy4gSWYgbm9uZSBhcmUgcHJlc2VudCwgb3IgdGhvc2UgdGhhdCBhcmUgYXJlbid0IGZyb21cbiAgLy8gQW5ndWxhciwgdGhlbiByZXR1cm4gbnVsbC4gT3RoZXJ3aXNlLCB0dXJuIHRoZW0gaW50byBtZXRhZGF0YS5cbiAgY29uc3QgY2xhc3NEZWNvcmF0b3JzID0gcmVmbGVjdGlvbi5nZXREZWNvcmF0b3JzT2ZEZWNsYXJhdGlvbihjbGF6eik7XG4gIGlmIChjbGFzc0RlY29yYXRvcnMgPT09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBjb25zdCBuZ0NsYXNzRGVjb3JhdG9ycyA9XG4gICAgICBjbGFzc0RlY29yYXRvcnMuZmlsdGVyKGRlYyA9PiBpc0FuZ3VsYXJEZWNvcmF0b3IoZGVjLCBpc0NvcmUpKS5tYXAoZGVjb3JhdG9yVG9NZXRhZGF0YSk7XG4gIGlmIChuZ0NsYXNzRGVjb3JhdG9ycy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBjb25zdCBtZXRhRGVjb3JhdG9ycyA9IHRzLmNyZWF0ZUFycmF5TGl0ZXJhbChuZ0NsYXNzRGVjb3JhdG9ycyk7XG5cbiAgLy8gQ29udmVydCB0aGUgY29uc3RydWN0b3IgcGFyYW1ldGVycyB0byBtZXRhZGF0YSwgcGFzc2luZyBudWxsIGlmIG5vbmUgYXJlIHByZXNlbnQuXG4gIGxldCBtZXRhQ3RvclBhcmFtZXRlcnM6IHRzLkV4cHJlc3Npb24gPSB0cy5jcmVhdGVOdWxsKCk7XG4gIGNvbnN0IGNsYXNzQ3RvclBhcmFtZXRlcnMgPSByZWZsZWN0aW9uLmdldENvbnN0cnVjdG9yUGFyYW1ldGVycyhjbGF6eik7XG4gIGlmIChjbGFzc0N0b3JQYXJhbWV0ZXJzICE9PSBudWxsKSB7XG4gICAgY29uc3QgY3RvclBhcmFtZXRlcnMgPSB0cy5jcmVhdGVBcnJheUxpdGVyYWwoXG4gICAgICAgIGNsYXNzQ3RvclBhcmFtZXRlcnMubWFwKHBhcmFtID0+IGN0b3JQYXJhbWV0ZXJUb01ldGFkYXRhKHBhcmFtLCBpc0NvcmUpKSk7XG4gICAgbWV0YUN0b3JQYXJhbWV0ZXJzID0gdHMuY3JlYXRlRnVuY3Rpb25FeHByZXNzaW9uKFxuICAgICAgICAvKiBtb2RpZmllcnMgKi8gdW5kZWZpbmVkLFxuICAgICAgICAvKiBhc3Rlcmlza1Rva2VuICovIHVuZGVmaW5lZCxcbiAgICAgICAgLyogbmFtZSAqLyB1bmRlZmluZWQsXG4gICAgICAgIC8qIHR5cGVQYXJhbWV0ZXJzICovIHVuZGVmaW5lZCxcbiAgICAgICAgLyogcGFyYW1ldGVycyAqLyB1bmRlZmluZWQsXG4gICAgICAgIC8qIHR5cGUgKi8gdW5kZWZpbmVkLCB0cy5jcmVhdGVCbG9jayhbdHMuY3JlYXRlUmV0dXJuKGN0b3JQYXJhbWV0ZXJzKV0pKTtcbiAgfVxuXG4gIC8vIERvIHRoZSBzYW1lIGZvciBwcm9wZXJ0eSBkZWNvcmF0b3JzLlxuICBsZXQgbWV0YVByb3BEZWNvcmF0b3JzOiB0cy5FeHByZXNzaW9uID0gdHMuY3JlYXRlTnVsbCgpO1xuICBjb25zdCBkZWNvcmF0ZWRNZW1iZXJzID1cbiAgICAgIHJlZmxlY3Rpb24uZ2V0TWVtYmVyc09mQ2xhc3MoY2xhenopXG4gICAgICAgICAgLmZpbHRlcihtZW1iZXIgPT4gIW1lbWJlci5pc1N0YXRpYyAmJiBtZW1iZXIuZGVjb3JhdG9ycyAhPT0gbnVsbClcbiAgICAgICAgICAubWFwKG1lbWJlciA9PiBjbGFzc01lbWJlclRvTWV0YWRhdGEobWVtYmVyLm5hbWUsIG1lbWJlci5kZWNvcmF0b3JzICEsIGlzQ29yZSkpO1xuICBpZiAoZGVjb3JhdGVkTWVtYmVycy5sZW5ndGggPiAwKSB7XG4gICAgbWV0YVByb3BEZWNvcmF0b3JzID0gdHMuY3JlYXRlT2JqZWN0TGl0ZXJhbChkZWNvcmF0ZWRNZW1iZXJzKTtcbiAgfVxuXG4gIC8vIEdlbmVyYXRlIGEgcHVyZSBjYWxsIHRvIHNldENsYXNzTWV0YWRhdGEgd2l0aCB0aGUgY2xhc3MgaWRlbnRpZmllciBhbmQgaXRzIG1ldGFkYXRhLlxuICBjb25zdCBzZXRDbGFzc01ldGFkYXRhID0gbmV3IEV4dGVybmFsRXhwcihJZGVudGlmaWVycy5zZXRDbGFzc01ldGFkYXRhKTtcbiAgY29uc3QgZm5DYWxsID0gbmV3IEludm9rZUZ1bmN0aW9uRXhwcihcbiAgICAgIC8qIGZuICovIHNldENsYXNzTWV0YWRhdGEsXG4gICAgICAvKiBhcmdzICovXG4gICAgICBbXG4gICAgICAgIG5ldyBXcmFwcGVkTm9kZUV4cHIoaWQpLFxuICAgICAgICBuZXcgV3JhcHBlZE5vZGVFeHByKG1ldGFEZWNvcmF0b3JzKSxcbiAgICAgICAgbmV3IFdyYXBwZWROb2RlRXhwcihtZXRhQ3RvclBhcmFtZXRlcnMpLFxuICAgICAgICBuZXcgV3JhcHBlZE5vZGVFeHByKG1ldGFQcm9wRGVjb3JhdG9ycyksXG4gICAgICBdLFxuICAgICAgLyogdHlwZSAqLyB1bmRlZmluZWQsXG4gICAgICAvKiBzb3VyY2VTcGFuICovIHVuZGVmaW5lZCxcbiAgICAgIC8qIHB1cmUgKi8gdHJ1ZSk7XG4gIHJldHVybiBmbkNhbGwudG9TdG10KCk7XG59XG5cbi8qKlxuICogQ29udmVydCBhIHJlZmxlY3RlZCBjb25zdHJ1Y3RvciBwYXJhbWV0ZXIgdG8gbWV0YWRhdGEuXG4gKi9cbmZ1bmN0aW9uIGN0b3JQYXJhbWV0ZXJUb01ldGFkYXRhKHBhcmFtOiBDdG9yUGFyYW1ldGVyLCBpc0NvcmU6IGJvb2xlYW4pOiB0cy5FeHByZXNzaW9uIHtcbiAgLy8gUGFyYW1ldGVycyBzb21ldGltZXMgaGF2ZSBhIHR5cGUgdGhhdCBjYW4gYmUgcmVmZXJlbmNlZC4gSWYgc28sIHRoZW4gdXNlIGl0LCBvdGhlcndpc2VcbiAgLy8gaXRzIHR5cGUgaXMgdW5kZWZpbmVkLlxuICBjb25zdCB0eXBlID1cbiAgICAgIHBhcmFtLnR5cGVFeHByZXNzaW9uICE9PSBudWxsID8gcGFyYW0udHlwZUV4cHJlc3Npb24gOiB0cy5jcmVhdGVJZGVudGlmaWVyKCd1bmRlZmluZWQnKTtcbiAgY29uc3QgcHJvcGVydGllczogdHMuT2JqZWN0TGl0ZXJhbEVsZW1lbnRMaWtlW10gPSBbXG4gICAgdHMuY3JlYXRlUHJvcGVydHlBc3NpZ25tZW50KCd0eXBlJywgdHlwZSksXG4gIF07XG5cbiAgLy8gSWYgdGhlIHBhcmFtZXRlciBoYXMgZGVjb3JhdG9ycywgaW5jbHVkZSB0aGUgb25lcyBmcm9tIEFuZ3VsYXIuXG4gIGlmIChwYXJhbS5kZWNvcmF0b3JzICE9PSBudWxsKSB7XG4gICAgY29uc3QgbmdEZWNvcmF0b3JzID1cbiAgICAgICAgcGFyYW0uZGVjb3JhdG9ycy5maWx0ZXIoZGVjID0+IGlzQW5ndWxhckRlY29yYXRvcihkZWMsIGlzQ29yZSkpLm1hcChkZWNvcmF0b3JUb01ldGFkYXRhKTtcbiAgICBwcm9wZXJ0aWVzLnB1c2godHMuY3JlYXRlUHJvcGVydHlBc3NpZ25tZW50KCdkZWNvcmF0b3JzJywgdHMuY3JlYXRlQXJyYXlMaXRlcmFsKG5nRGVjb3JhdG9ycykpKTtcbiAgfVxuICByZXR1cm4gdHMuY3JlYXRlT2JqZWN0TGl0ZXJhbChwcm9wZXJ0aWVzLCB0cnVlKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGEgcmVmbGVjdGVkIGNsYXNzIG1lbWJlciB0byBtZXRhZGF0YS5cbiAqL1xuZnVuY3Rpb24gY2xhc3NNZW1iZXJUb01ldGFkYXRhKFxuICAgIG5hbWU6IHN0cmluZywgZGVjb3JhdG9yczogRGVjb3JhdG9yW10sIGlzQ29yZTogYm9vbGVhbik6IHRzLlByb3BlcnR5QXNzaWdubWVudCB7XG4gIGNvbnN0IG5nRGVjb3JhdG9ycyA9XG4gICAgICBkZWNvcmF0b3JzLmZpbHRlcihkZWMgPT4gaXNBbmd1bGFyRGVjb3JhdG9yKGRlYywgaXNDb3JlKSkubWFwKGRlY29yYXRvclRvTWV0YWRhdGEpO1xuICBjb25zdCBkZWNvcmF0b3JNZXRhID0gdHMuY3JlYXRlQXJyYXlMaXRlcmFsKG5nRGVjb3JhdG9ycyk7XG4gIHJldHVybiB0cy5jcmVhdGVQcm9wZXJ0eUFzc2lnbm1lbnQobmFtZSwgZGVjb3JhdG9yTWV0YSk7XG59XG5cbi8qKlxuICogQ29udmVydCBhIHJlZmxlY3RlZCBkZWNvcmF0b3IgdG8gbWV0YWRhdGEuXG4gKi9cbmZ1bmN0aW9uIGRlY29yYXRvclRvTWV0YWRhdGEoZGVjb3JhdG9yOiBEZWNvcmF0b3IpOiB0cy5PYmplY3RMaXRlcmFsRXhwcmVzc2lvbiB7XG4gIC8vIERlY29yYXRvcnMgaGF2ZSBhIHR5cGUuXG4gIGNvbnN0IHByb3BlcnRpZXM6IHRzLk9iamVjdExpdGVyYWxFbGVtZW50TGlrZVtdID0gW1xuICAgIHRzLmNyZWF0ZVByb3BlcnR5QXNzaWdubWVudCgndHlwZScsIHRzLnVwZGF0ZUlkZW50aWZpZXIoZGVjb3JhdG9yLmlkZW50aWZpZXIpKSxcbiAgXTtcbiAgLy8gU29tZXRpbWVzIHRoZXkgaGF2ZSBhcmd1bWVudHMuXG4gIGlmIChkZWNvcmF0b3IuYXJncyAhPT0gbnVsbCAmJiBkZWNvcmF0b3IuYXJncy5sZW5ndGggPiAwKSB7XG4gICAgY29uc3QgYXJncyA9IGRlY29yYXRvci5hcmdzLm1hcChhcmcgPT4gdHMuZ2V0TXV0YWJsZUNsb25lKGFyZykpO1xuICAgIHByb3BlcnRpZXMucHVzaCh0cy5jcmVhdGVQcm9wZXJ0eUFzc2lnbm1lbnQoJ2FyZ3MnLCB0cy5jcmVhdGVBcnJheUxpdGVyYWwoYXJncykpKTtcbiAgfVxuICByZXR1cm4gdHMuY3JlYXRlT2JqZWN0TGl0ZXJhbChwcm9wZXJ0aWVzLCB0cnVlKTtcbn1cblxuLyoqXG4gKiBXaGV0aGVyIGEgZ2l2ZW4gZGVjb3JhdG9yIHNob3VsZCBiZSB0cmVhdGVkIGFzIGFuIEFuZ3VsYXIgZGVjb3JhdG9yLlxuICpcbiAqIEVpdGhlciBpdCdzIHVzZWQgaW4gQGFuZ3VsYXIvY29yZSwgb3IgaXQncyBpbXBvcnRlZCBmcm9tIHRoZXJlLlxuICovXG5mdW5jdGlvbiBpc0FuZ3VsYXJEZWNvcmF0b3IoZGVjb3JhdG9yOiBEZWNvcmF0b3IsIGlzQ29yZTogYm9vbGVhbik6IGJvb2xlYW4ge1xuICByZXR1cm4gaXNDb3JlIHx8IChkZWNvcmF0b3IuaW1wb3J0ICE9PSBudWxsICYmIGRlY29yYXRvci5pbXBvcnQuZnJvbSA9PT0gJ0Bhbmd1bGFyL2NvcmUnKTtcbn1cbiJdfQ==