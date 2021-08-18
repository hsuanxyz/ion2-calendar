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
        define("@angular/compiler/src/render3/view/style_parser", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Parses string representation of a style and converts it into object literal.
     *
     * @param value string representation of style as used in the `style` attribute in HTML.
     *   Example: `color: red; height: auto`.
     * @returns an object literal. `{ color: 'red', height: 'auto'}`.
     */
    function parse(value) {
        var styles = {};
        var i = 0;
        var parenDepth = 0;
        var quote = 0 /* QuoteNone */;
        var valueStart = 0;
        var propStart = 0;
        var currentProp = null;
        var valueHasQuotes = false;
        while (i < value.length) {
            var token = value.charCodeAt(i++);
            switch (token) {
                case 40 /* OpenParen */:
                    parenDepth++;
                    break;
                case 41 /* CloseParen */:
                    parenDepth--;
                    break;
                case 39 /* QuoteSingle */:
                    // valueStart needs to be there since prop values don't
                    // have quotes in CSS
                    valueHasQuotes = valueHasQuotes || valueStart > 0;
                    if (quote === 0 /* QuoteNone */) {
                        quote = 39 /* QuoteSingle */;
                    }
                    else if (quote === 39 /* QuoteSingle */ && value.charCodeAt(i - 1) !== 92 /* BackSlash */) {
                        quote = 0 /* QuoteNone */;
                    }
                    break;
                case 34 /* QuoteDouble */:
                    // same logic as above
                    valueHasQuotes = valueHasQuotes || valueStart > 0;
                    if (quote === 0 /* QuoteNone */) {
                        quote = 34 /* QuoteDouble */;
                    }
                    else if (quote === 34 /* QuoteDouble */ && value.charCodeAt(i - 1) !== 92 /* BackSlash */) {
                        quote = 0 /* QuoteNone */;
                    }
                    break;
                case 58 /* Colon */:
                    if (!currentProp && parenDepth === 0 && quote === 0 /* QuoteNone */) {
                        currentProp = hyphenate(value.substring(propStart, i - 1).trim());
                        valueStart = i;
                    }
                    break;
                case 59 /* Semicolon */:
                    if (currentProp && valueStart > 0 && parenDepth === 0 && quote === 0 /* QuoteNone */) {
                        var styleVal = value.substring(valueStart, i - 1).trim();
                        styles[currentProp] = valueHasQuotes ? stripUnnecessaryQuotes(styleVal) : styleVal;
                        propStart = i;
                        valueStart = 0;
                        currentProp = null;
                        valueHasQuotes = false;
                    }
                    break;
            }
        }
        if (currentProp && valueStart) {
            var styleVal = value.substr(valueStart).trim();
            styles[currentProp] = valueHasQuotes ? stripUnnecessaryQuotes(styleVal) : styleVal;
        }
        return styles;
    }
    exports.parse = parse;
    function stripUnnecessaryQuotes(value) {
        var qS = value.charCodeAt(0);
        var qE = value.charCodeAt(value.length - 1);
        if (qS == qE && (qS == 39 /* QuoteSingle */ || qS == 34 /* QuoteDouble */)) {
            var tempValue = value.substring(1, value.length - 1);
            // special case to avoid using a multi-quoted string that was just chomped
            // (e.g. `font-family: "Verdana", "sans-serif"`)
            if (tempValue.indexOf('\'') == -1 && tempValue.indexOf('"') == -1) {
                value = tempValue;
            }
        }
        return value;
    }
    exports.stripUnnecessaryQuotes = stripUnnecessaryQuotes;
    function hyphenate(value) {
        return value.replace(/[a-z][A-Z]/g, function (v) {
            return v.charAt(0) + '-' + v.charAt(1);
        }).toLowerCase();
    }
    exports.hyphenate = hyphenate;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R5bGVfcGFyc2VyLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLyIsInNvdXJjZXMiOlsicGFja2FnZXMvY29tcGlsZXIvc3JjL3JlbmRlcjMvdmlldy9zdHlsZV9wYXJzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7SUFjSDs7Ozs7O09BTUc7SUFDSCxTQUFnQixLQUFLLENBQUMsS0FBYTtRQUNqQyxJQUFNLE1BQU0sR0FBeUIsRUFBRSxDQUFDO1FBRXhDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNWLElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQztRQUNuQixJQUFJLEtBQUssb0JBQXVCLENBQUM7UUFDakMsSUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDO1FBQ25CLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQztRQUNsQixJQUFJLFdBQVcsR0FBZ0IsSUFBSSxDQUFDO1FBQ3BDLElBQUksY0FBYyxHQUFHLEtBQUssQ0FBQztRQUMzQixPQUFPLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ3ZCLElBQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQVMsQ0FBQztZQUM1QyxRQUFRLEtBQUssRUFBRTtnQkFDYjtvQkFDRSxVQUFVLEVBQUUsQ0FBQztvQkFDYixNQUFNO2dCQUNSO29CQUNFLFVBQVUsRUFBRSxDQUFDO29CQUNiLE1BQU07Z0JBQ1I7b0JBQ0UsdURBQXVEO29CQUN2RCxxQkFBcUI7b0JBQ3JCLGNBQWMsR0FBRyxjQUFjLElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQztvQkFDbEQsSUFBSSxLQUFLLHNCQUFtQixFQUFFO3dCQUM1QixLQUFLLHVCQUFtQixDQUFDO3FCQUMxQjt5QkFBTSxJQUFJLEtBQUsseUJBQXFCLElBQUksS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLHVCQUFtQixFQUFFO3dCQUNuRixLQUFLLG9CQUFpQixD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QUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQy9CLENBQUM7SUFKRCw4QkFJQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuY29uc3QgZW51bSBDaGFyIHtcbiAgT3BlblBhcmVuID0gNDAsXG4gIENsb3NlUGFyZW4gPSA0MSxcbiAgQ29sb24gPSA1OCxcbiAgU2VtaWNvbG9uID0gNTksXG4gIEJhY2tTbGFzaCA9IDkyLFxuICBRdW90ZU5vbmUgPSAwLCAgLy8gaW5kaWNhdGluZyB3ZSBhcmUgbm90IGluc2lkZSBhIHF1b3RlXG4gIFF1b3RlRG91YmxlID0gMzQsXG4gIFF1b3RlU2luZ2xlID0gMzksXG59XG5cblxuLyoqXG4gKiBQYXJzZXMgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgc3R5bGUgYW5kIGNvbnZlcnRzIGl0IGludG8gb2JqZWN0IGxpdGVyYWwuXG4gKlxuICogQHBhcmFtIHZhbHVlIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBzdHlsZSBhcyB1c2VkIGluIHRoZSBgc3R5bGVgIGF0dHJpYnV0ZSBpbiBIVE1MLlxuICogICBFeGFtcGxlOiBgY29sb3I6IHJlZDsgaGVpZ2h0OiBhdXRvYC5cbiAqIEByZXR1cm5zIGFuIG9iamVjdCBsaXRlcmFsLiBgeyBjb2xvcjogJ3JlZCcsIGhlaWdodDogJ2F1dG8nfWAuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZSh2YWx1ZTogc3RyaW5nKToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICBjb25zdCBzdHlsZXM6IHtba2V5OiBzdHJpbmddOiBhbnl9ID0ge307XG5cbiAgbGV0IGkgPSAwO1xuICBsZXQgcGFyZW5EZXB0aCA9IDA7XG4gIGxldCBxdW90ZTogQ2hhciA9IENoYXIuUXVvdGVOb25lO1xuICBsZXQgdmFsdWVTdGFydCA9IDA7XG4gIGxldCBwcm9wU3RhcnQgPSAwO1xuICBsZXQgY3VycmVudFByb3A6IHN0cmluZ3xudWxsID0gbnVsbDtcbiAgbGV0IHZhbHVlSGFzUXVvdGVzID0gZmFsc2U7XG4gIHdoaWxlIChpIDwgdmFsdWUubGVuZ3RoKSB7XG4gICAgY29uc3QgdG9rZW4gPSB2YWx1ZS5jaGFyQ29kZUF0KGkrKykgYXMgQ2hhcjtcbiAgICBzd2l0Y2ggKHRva2VuKSB7XG4gICAgICBjYXNlIENoYXIuT3BlblBhcmVuOlxuICAgICAgICBwYXJlbkRlcHRoKys7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBDaGFyLkNsb3NlUGFyZW46XG4gICAgICAgIHBhcmVuRGVwdGgtLTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIENoYXIuUXVvdGVTaW5nbGU6XG4gICAgICAgIC8vIHZhbHVlU3RhcnQgbmVlZHMgdG8gYmUgdGhlcmUgc2luY2UgcHJvcCB2YWx1ZXMgZG9uJ3RcbiAgICAgICAgLy8gaGF2ZSBxdW90ZXMgaW4gQ1NTXG4gICAgICAgIHZhbHVlSGFzUXVvdGVzID0gdmFsdWVIYXNRdW90ZXMgfHwgdmFsdWVTdGFydCA+IDA7XG4gICAgICAgIGlmIChxdW90ZSA9PT0gQ2hhci5RdW90ZU5vbmUpIHtcbiAgICAgICAgICBxdW90ZSA9IENoYXIuUXVvdGVTaW5nbGU7XG4gICAgICAgIH0gZWxzZSBpZiAocXVvdGUgPT09IENoYXIuUXVvdGVTaW5nbGUgJiYgdmFsdWUuY2hhckNvZGVBdChpIC0gMSkgIT09IENoYXIuQmFja1NsYXNoKSB7XG4gICAgICAgICAgcXVvdGUgPSBDaGFyLlF1b3RlTm9uZTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQ2hhci5RdW90ZURvdWJsZTpcbiAgICAgICAgLy8gc2FtZSBsb2dpYyBhcyBhYm92ZVxuICAgICAgICB2YWx1ZUhhc1F1b3RlcyA9IHZhbHVlSGFzUXVvdGVzIHx8IHZhbHVlU3RhcnQgPiAwO1xuICAgICAgICBpZiAocXVvdGUgPT09IENoYXIuUXVvdGVOb25lKSB7XG4gICAgICAgICAgcXVvdGUgPSBDaGFyLlF1b3RlRG91YmxlO1xuICAgICAgICB9IGVsc2UgaWYgKHF1b3RlID09PSBDaGFyLlF1b3RlRG91YmxlICYmIHZhbHVlLmNoYXJDb2RlQXQoaSAtIDEpICE9PSBDaGFyLkJhY2tTbGFzaCkge1xuICAgICAgICAgIHF1b3RlID0gQ2hhci5RdW90ZU5vbmU7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIENoYXIuQ29sb246XG4gICAgICAgIGlmICghY3VycmVudFByb3AgJiYgcGFyZW5EZXB0aCA9PT0gMCAmJiBxdW90ZSA9PT0gQ2hhci5RdW90ZU5vbmUpIHtcbiAgICAgICAgICBjdXJyZW50UHJvcCA9IGh5cGhlbmF0ZSh2YWx1ZS5zdWJzdHJpbmcocHJvcFN0YXJ0LCBpIC0gMSkudHJpbSgpKTtcbiAgICAgICAgICB2YWx1ZVN0YXJ0ID0gaTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQ2hhci5TZW1pY29sb246XG4gICAgICAgIGlmIChjdXJyZW50UHJvcCAmJiB2YWx1ZVN0YXJ0ID4gMCAmJiBwYXJlbkRlcHRoID09PSAwICYmIHF1b3RlID09PSBDaGFyLlF1b3RlTm9uZSkge1xuICAgICAgICAgIGNvbnN0IHN0eWxlVmFsID0gdmFsdWUuc3Vic3RyaW5nKHZhbHVlU3RhcnQsIGkgLSAxKS50cmltKCk7XG4gICAgICAgICAgc3R5bGVzW2N1cnJlbnRQcm9wXSA9IHZhbHVlSGFzUXVvdGVzID8gc3RyaXBVbm5lY2Vzc2FyeVF1b3RlcyhzdHlsZVZhbCkgOiBzdHlsZVZhbDtcbiAgICAgICAgICBwcm9wU3RhcnQgPSBpO1xuICAgICAgICAgIHZhbHVlU3RhcnQgPSAwO1xuICAgICAgICAgIGN1cnJlbnRQcm9wID0gbnVsbDtcbiAgICAgICAgICB2YWx1ZUhhc1F1b3RlcyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIGlmIChjdXJyZW50UHJvcCAmJiB2YWx1ZVN0YXJ0KSB7XG4gICAgY29uc3Qgc3R5bGVWYWwgPSB2YWx1ZS5zdWJzdHIodmFsdWVTdGFydCkudHJpbSgpO1xuICAgIHN0eWxlc1tjdXJyZW50UHJvcF0gPSB2YWx1ZUhhc1F1b3RlcyA/IHN0cmlwVW5uZWNlc3NhcnlRdW90ZXMoc3R5bGVWYWwpIDogc3R5bGVWYWw7XG4gIH1cblxuICByZXR1cm4gc3R5bGVzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RyaXBVbm5lY2Vzc2FyeVF1b3Rlcyh2YWx1ZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgcVMgPSB2YWx1ZS5jaGFyQ29kZUF0KDApO1xuICBjb25zdCBxRSA9IHZhbHVlLmNoYXJDb2RlQXQodmFsdWUubGVuZ3RoIC0gMSk7XG4gIGlmIChxUyA9PSBxRSAmJiAocVMgPT0gQ2hhci5RdW90ZVNpbmdsZSB8fCBxUyA9PSBDaGFyLlF1b3RlRG91YmxlKSkge1xuICAgIGNvbnN0IHRlbXBWYWx1ZSA9IHZhbHVlLnN1YnN0cmluZygxLCB2YWx1ZS5sZW5ndGggLSAxKTtcbiAgICAvLyBzcGVjaWFsIGNhc2UgdG8gYXZvaWQgdXNpbmcgYSBtdWx0aS1xdW90ZWQgc3RyaW5nIHRoYXQgd2FzIGp1c3QgY2hvbXBlZFxuICAgIC8vIChlLmcuIGBmb250LWZhbWlseTogXCJWZXJkYW5hXCIsIFwic2Fucy1zZXJpZlwiYClcbiAgICBpZiAodGVtcFZhbHVlLmluZGV4T2YoJ1xcJycpID09IC0xICYmIHRlbXBWYWx1ZS5pbmRleE9mKCdcIicpID09IC0xKSB7XG4gICAgICB2YWx1ZSA9IHRlbXBWYWx1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHZhbHVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaHlwaGVuYXRlKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gdmFsdWUucmVwbGFjZSgvW2Etel1bQS1aXS9nLCB2ID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdi5jaGFyQXQoMCkgKyAnLScgKyB2LmNoYXJBdCgxKTtcbiAgICAgICAgICAgICAgfSkudG9Mb3dlckNhc2UoKTtcbn1cbiJdfQ==