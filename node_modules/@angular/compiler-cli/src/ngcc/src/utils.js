(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngcc/src/utils", ["require", "exports", "typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var ts = require("typescript");
    function getOriginalSymbol(checker) {
        return function (symbol) {
            return ts.SymbolFlags.Alias & symbol.flags ? checker.getAliasedSymbol(symbol) : symbol;
        };
    }
    exports.getOriginalSymbol = getOriginalSymbol;
    function isDefined(value) {
        return (value !== undefined) && (value !== null);
    }
    exports.isDefined = isDefined;
    function getNameText(name) {
        return ts.isIdentifier(name) || ts.isLiteralExpression(name) ? name.text : name.getText();
    }
    exports.getNameText = getNameText;
    /**
     * Parse down the AST and capture all the nodes that satisfy the test.
     * @param node The start node.
     * @param test The function that tests whether a node should be included.
     * @returns a collection of nodes that satisfy the test.
     */
    function findAll(node, test) {
        var nodes = [];
        findAllVisitor(node);
        return nodes;
        function findAllVisitor(n) {
            if (test(n)) {
                nodes.push(n);
            }
            else {
                n.forEachChild(function (child) { return findAllVisitor(child); });
            }
        }
    }
    exports.findAll = findAll;
    /**
     * Does the given declaration have a name which is an identifier?
     * @param declaration The declaration to test.
     * @returns true if the declaration has an identifer for a name.
     */
    function hasNameIdentifier(declaration) {
        return ts.isIdentifier(declaration.name);
    }
    exports.hasNameIdentifier = hasNameIdentifier;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25nY2Mvc3JjL3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsK0JBQWlDO0lBRWpDLFNBQWdCLGlCQUFpQixDQUFDLE9BQXVCO1FBQ3ZELE9BQU8sVUFBUyxNQUFpQjtZQUMvQixPQUFPLEVBQUUsQ0FBQyxXQUFXLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO1FBQ3pGLENBQUMsQ0FBQztJQUNKLENBQUM7SUFKRCw4Q0FJQztJQUVELFNBQWdCLFNBQVMsQ0FBSSxLQUEyQjtRQUN0RCxPQUFPLENBQUMsS0FBSyxLQUFLLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQyxDQUFDO0lBQ25ELENBQUM7SUFGRCw4QkFFQztJQUVELFNBQWdCLFdBQVcsQ0FBQyxJQUFzQztRQUNoRSxPQUFPLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDNUYsQ0FBQztJQUZELGtDQUVDO0lBRUQ7Ozs7O09BS0c7SUFDSCxTQUFnQixPQUFPLENBQUksSUFBYSxFQUFFLElBQTRDO1FBQ3BGLElBQU0sS0FBSyxHQUFRLEVBQUUsQ0FBQztRQUN0QixjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckIsT0FBTyxLQUFLLENBQUM7UUFFYixTQUFTLGNBQWMsQ0FBQyxDQUFVO1lBQ2hDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUNYLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDZjtpQkFBTTtnQkFDTCxDQUFDLENBQUMsWUFBWSxDQUFDLFVBQUEsS0FBSyxJQUFJLE9BQUEsY0FBYyxDQUFDLEtBQUssQ0FBQyxFQUFyQixDQUFxQixDQUFDLENBQUM7YUFDaEQ7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQVpELDBCQVlDO0lBRUQ7Ozs7T0FJRztJQUNILFNBQWdCLGlCQUFpQixDQUFDLFdBQTJCO1FBRTNELE9BQU8sRUFBRSxDQUFDLFlBQVksQ0FBRSxXQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3BELENBQUM7SUFIRCw4Q0FHQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0T3JpZ2luYWxTeW1ib2woY2hlY2tlcjogdHMuVHlwZUNoZWNrZXIpOiAoc3ltYm9sOiB0cy5TeW1ib2wpID0+IHRzLlN5bWJvbCB7XG4gIHJldHVybiBmdW5jdGlvbihzeW1ib2w6IHRzLlN5bWJvbCkge1xuICAgIHJldHVybiB0cy5TeW1ib2xGbGFncy5BbGlhcyAmIHN5bWJvbC5mbGFncyA/IGNoZWNrZXIuZ2V0QWxpYXNlZFN5bWJvbChzeW1ib2wpIDogc3ltYm9sO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNEZWZpbmVkPFQ+KHZhbHVlOiBUIHwgdW5kZWZpbmVkIHwgbnVsbCk6IHZhbHVlIGlzIFQge1xuICByZXR1cm4gKHZhbHVlICE9PSB1bmRlZmluZWQpICYmICh2YWx1ZSAhPT0gbnVsbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXROYW1lVGV4dChuYW1lOiB0cy5Qcm9wZXJ0eU5hbWUgfCB0cy5CaW5kaW5nTmFtZSk6IHN0cmluZyB7XG4gIHJldHVybiB0cy5pc0lkZW50aWZpZXIobmFtZSkgfHwgdHMuaXNMaXRlcmFsRXhwcmVzc2lvbihuYW1lKSA/IG5hbWUudGV4dCA6IG5hbWUuZ2V0VGV4dCgpO1xufVxuXG4vKipcbiAqIFBhcnNlIGRvd24gdGhlIEFTVCBhbmQgY2FwdHVyZSBhbGwgdGhlIG5vZGVzIHRoYXQgc2F0aXNmeSB0aGUgdGVzdC5cbiAqIEBwYXJhbSBub2RlIFRoZSBzdGFydCBub2RlLlxuICogQHBhcmFtIHRlc3QgVGhlIGZ1bmN0aW9uIHRoYXQgdGVzdHMgd2hldGhlciBhIG5vZGUgc2hvdWxkIGJlIGluY2x1ZGVkLlxuICogQHJldHVybnMgYSBjb2xsZWN0aW9uIG9mIG5vZGVzIHRoYXQgc2F0aXNmeSB0aGUgdGVzdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpbmRBbGw8VD4obm9kZTogdHMuTm9kZSwgdGVzdDogKG5vZGU6IHRzLk5vZGUpID0+IG5vZGUgaXMgdHMuTm9kZSAmIFQpOiBUW10ge1xuICBjb25zdCBub2RlczogVFtdID0gW107XG4gIGZpbmRBbGxWaXNpdG9yKG5vZGUpO1xuICByZXR1cm4gbm9kZXM7XG5cbiAgZnVuY3Rpb24gZmluZEFsbFZpc2l0b3IobjogdHMuTm9kZSkge1xuICAgIGlmICh0ZXN0KG4pKSB7XG4gICAgICBub2Rlcy5wdXNoKG4pO1xuICAgIH0gZWxzZSB7XG4gICAgICBuLmZvckVhY2hDaGlsZChjaGlsZCA9PiBmaW5kQWxsVmlzaXRvcihjaGlsZCkpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIERvZXMgdGhlIGdpdmVuIGRlY2xhcmF0aW9uIGhhdmUgYSBuYW1lIHdoaWNoIGlzIGFuIGlkZW50aWZpZXI/XG4gKiBAcGFyYW0gZGVjbGFyYXRpb24gVGhlIGRlY2xhcmF0aW9uIHRvIHRlc3QuXG4gKiBAcmV0dXJucyB0cnVlIGlmIHRoZSBkZWNsYXJhdGlvbiBoYXMgYW4gaWRlbnRpZmVyIGZvciBhIG5hbWUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBoYXNOYW1lSWRlbnRpZmllcihkZWNsYXJhdGlvbjogdHMuRGVjbGFyYXRpb24pOiBkZWNsYXJhdGlvbiBpcyB0cy5EZWNsYXJhdGlvbiZcbiAgICB7bmFtZTogdHMuSWRlbnRpZmllcn0ge1xuICByZXR1cm4gdHMuaXNJZGVudGlmaWVyKChkZWNsYXJhdGlvbiBhcyBhbnkpLm5hbWUpO1xufVxuIl19