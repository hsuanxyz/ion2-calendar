/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Parses string representation of a style and converts it into object literal.
 *
 * @param value string representation of style as used in the `style` attribute in HTML.
 *   Example: `color: red; height: auto`.
 * @returns an object literal. `{ color: 'red', height: 'auto'}`.
 */
export function parse(value) {
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
export function stripUnnecessaryQuotes(value) {
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
export function hyphenate(value) {
    return value.replace(/[a-z][A-Z]/g, function (v) {
        return v.charAt(0) + '-' + v.charAt(1);
    }).toLowerCase();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R5bGVfcGFyc2VyLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLyIsInNvdXJjZXMiOlsicGFja2FnZXMvY29tcGlsZXIvc3JjL3JlbmRlcjMvdmlldy9zdHlsZV9wYXJzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBY0g7Ozs7OztHQU1HO0FBQ0gsTUFBTSxVQUFVLEtBQUssQ0FBQyxLQUFhO0lBQ2pDLElBQU0sTUFBTSxHQUF5QixFQUFFLENBQUM7SUFFeEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ1YsSUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDO0lBQ25CLElBQUksS0FBSyxvQkFBdUIsQ0FBQztJQUNqQyxJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUM7SUFDbkIsSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDO0lBQ2xCLElBQUksV0FBVyxHQUFnQixJQUFJLENBQUM7SUFDcEMsSUFBSSxjQUFjLEdBQUcsS0FBSyxDQUFDO0lBQzNCLE9BQU8sQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUU7UUFDdkIsSUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBUyxDQUFDO1FBQzVDLFFBQVEsS0FBSyxFQUFFO1lBQ2I7Z0JBQ0UsVUFBVSxFQUFFLENBQUM7Z0JBQ2IsTUFBTTtZQUNSO2dCQUNFLFVBQVUsRUFBRSxDQUFDO2dCQUNiLE1BQU07WUFDUjtnQkFDRSx1REFBdUQ7Z0JBQ3ZELHFCQUFxQjtnQkFDckIsY0FBYyxHQUFHLGNBQWMsSUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDO2dCQUNsRCxJQUFJLEtBQUssc0JBQW1CLEVBQUU7b0JBQzVCLEtBQUssdUJBQW1CLENBQUM7aUJBQzFCO3FCQUFNLElBQUksS0FBSyx5QkFBcUIsSUFBSSxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsdUJBQW1CLEVBQUU7b0JBQ25GLEtBQUssb0JBQWlCLENBQUM7aUJBQ3hC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QUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3pDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQy9CLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmNvbnN0IGVudW0gQ2hhciB7XG4gIE9wZW5QYXJlbiA9IDQwLFxuICBDbG9zZVBhcmVuID0gNDEsXG4gIENvbG9uID0gNTgsXG4gIFNlbWljb2xvbiA9IDU5LFxuICBCYWNrU2xhc2ggPSA5MixcbiAgUXVvdGVOb25lID0gMCwgIC8vIGluZGljYXRpbmcgd2UgYXJlIG5vdCBpbnNpZGUgYSBxdW90ZVxuICBRdW90ZURvdWJsZSA9IDM0LFxuICBRdW90ZVNpbmdsZSA9IDM5LFxufVxuXG5cbi8qKlxuICogUGFyc2VzIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIHN0eWxlIGFuZCBjb252ZXJ0cyBpdCBpbnRvIG9iamVjdCBsaXRlcmFsLlxuICpcbiAqIEBwYXJhbSB2YWx1ZSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2Ygc3R5bGUgYXMgdXNlZCBpbiB0aGUgYHN0eWxlYCBhdHRyaWJ1dGUgaW4gSFRNTC5cbiAqICAgRXhhbXBsZTogYGNvbG9yOiByZWQ7IGhlaWdodDogYXV0b2AuXG4gKiBAcmV0dXJucyBhbiBvYmplY3QgbGl0ZXJhbC4gYHsgY29sb3I6ICdyZWQnLCBoZWlnaHQ6ICdhdXRvJ31gLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2UodmFsdWU6IHN0cmluZyk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgY29uc3Qgc3R5bGVzOiB7W2tleTogc3RyaW5nXTogYW55fSA9IHt9O1xuXG4gIGxldCBpID0gMDtcbiAgbGV0IHBhcmVuRGVwdGggPSAwO1xuICBsZXQgcXVvdGU6IENoYXIgPSBDaGFyLlF1b3RlTm9uZTtcbiAgbGV0IHZhbHVlU3RhcnQgPSAwO1xuICBsZXQgcHJvcFN0YXJ0ID0gMDtcbiAgbGV0IGN1cnJlbnRQcm9wOiBzdHJpbmd8bnVsbCA9IG51bGw7XG4gIGxldCB2YWx1ZUhhc1F1b3RlcyA9IGZhbHNlO1xuICB3aGlsZSAoaSA8IHZhbHVlLmxlbmd0aCkge1xuICAgIGNvbnN0IHRva2VuID0gdmFsdWUuY2hhckNvZGVBdChpKyspIGFzIENoYXI7XG4gICAgc3dpdGNoICh0b2tlbikge1xuICAgICAgY2FzZSBDaGFyLk9wZW5QYXJlbjpcbiAgICAgICAgcGFyZW5EZXB0aCsrO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQ2hhci5DbG9zZVBhcmVuOlxuICAgICAgICBwYXJlbkRlcHRoLS07XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBDaGFyLlF1b3RlU2luZ2xlOlxuICAgICAgICAvLyB2YWx1ZVN0YXJ0IG5lZWRzIHRvIGJlIHRoZXJlIHNpbmNlIHByb3AgdmFsdWVzIGRvbid0XG4gICAgICAgIC8vIGhhdmUgcXVvdGVzIGluIENTU1xuICAgICAgICB2YWx1ZUhhc1F1b3RlcyA9IHZhbHVlSGFzUXVvdGVzIHx8IHZhbHVlU3RhcnQgPiAwO1xuICAgICAgICBpZiAocXVvdGUgPT09IENoYXIuUXVvdGVOb25lKSB7XG4gICAgICAgICAgcXVvdGUgPSBDaGFyLlF1b3RlU2luZ2xlO1xuICAgICAgICB9IGVsc2UgaWYgKHF1b3RlID09PSBDaGFyLlF1b3RlU2luZ2xlICYmIHZhbHVlLmNoYXJDb2RlQXQoaSAtIDEpICE9PSBDaGFyLkJhY2tTbGFzaCkge1xuICAgICAgICAgIHF1b3RlID0gQ2hhci5RdW90ZU5vbmU7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIENoYXIuUXVvdGVEb3VibGU6XG4gICAgICAgIC8vIHNhbWUgbG9naWMgYXMgYWJvdmVcbiAgICAgICAgdmFsdWVIYXNRdW90ZXMgPSB2YWx1ZUhhc1F1b3RlcyB8fCB2YWx1ZVN0YXJ0ID4gMDtcbiAgICAgICAgaWYgKHF1b3RlID09PSBDaGFyLlF1b3RlTm9uZSkge1xuICAgICAgICAgIHF1b3RlID0gQ2hhci5RdW90ZURvdWJsZTtcbiAgICAgICAgfSBlbHNlIGlmIChxdW90ZSA9PT0gQ2hhci5RdW90ZURvdWJsZSAmJiB2YWx1ZS5jaGFyQ29kZUF0KGkgLSAxKSAhPT0gQ2hhci5CYWNrU2xhc2gpIHtcbiAgICAgICAgICBxdW90ZSA9IENoYXIuUXVvdGVOb25lO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBDaGFyLkNvbG9uOlxuICAgICAgICBpZiAoIWN1cnJlbnRQcm9wICYmIHBhcmVuRGVwdGggPT09IDAgJiYgcXVvdGUgPT09IENoYXIuUXVvdGVOb25lKSB7XG4gICAgICAgICAgY3VycmVudFByb3AgPSBoeXBoZW5hdGUodmFsdWUuc3Vic3RyaW5nKHByb3BTdGFydCwgaSAtIDEpLnRyaW0oKSk7XG4gICAgICAgICAgdmFsdWVTdGFydCA9IGk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIENoYXIuU2VtaWNvbG9uOlxuICAgICAgICBpZiAoY3VycmVudFByb3AgJiYgdmFsdWVTdGFydCA+IDAgJiYgcGFyZW5EZXB0aCA9PT0gMCAmJiBxdW90ZSA9PT0gQ2hhci5RdW90ZU5vbmUpIHtcbiAgICAgICAgICBjb25zdCBzdHlsZVZhbCA9IHZhbHVlLnN1YnN0cmluZyh2YWx1ZVN0YXJ0LCBpIC0gMSkudHJpbSgpO1xuICAgICAgICAgIHN0eWxlc1tjdXJyZW50UHJvcF0gPSB2YWx1ZUhhc1F1b3RlcyA/IHN0cmlwVW5uZWNlc3NhcnlRdW90ZXMoc3R5bGVWYWwpIDogc3R5bGVWYWw7XG4gICAgICAgICAgcHJvcFN0YXJ0ID0gaTtcbiAgICAgICAgICB2YWx1ZVN0YXJ0ID0gMDtcbiAgICAgICAgICBjdXJyZW50UHJvcCA9IG51bGw7XG4gICAgICAgICAgdmFsdWVIYXNRdW90ZXMgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBpZiAoY3VycmVudFByb3AgJiYgdmFsdWVTdGFydCkge1xuICAgIGNvbnN0IHN0eWxlVmFsID0gdmFsdWUuc3Vic3RyKHZhbHVlU3RhcnQpLnRyaW0oKTtcbiAgICBzdHlsZXNbY3VycmVudFByb3BdID0gdmFsdWVIYXNRdW90ZXMgPyBzdHJpcFVubmVjZXNzYXJ5UXVvdGVzKHN0eWxlVmFsKSA6IHN0eWxlVmFsO1xuICB9XG5cbiAgcmV0dXJuIHN0eWxlcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0cmlwVW5uZWNlc3NhcnlRdW90ZXModmFsdWU6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IHFTID0gdmFsdWUuY2hhckNvZGVBdCgwKTtcbiAgY29uc3QgcUUgPSB2YWx1ZS5jaGFyQ29kZUF0KHZhbHVlLmxlbmd0aCAtIDEpO1xuICBpZiAocVMgPT0gcUUgJiYgKHFTID09IENoYXIuUXVvdGVTaW5nbGUgfHwgcVMgPT0gQ2hhci5RdW90ZURvdWJsZSkpIHtcbiAgICBjb25zdCB0ZW1wVmFsdWUgPSB2YWx1ZS5zdWJzdHJpbmcoMSwgdmFsdWUubGVuZ3RoIC0gMSk7XG4gICAgLy8gc3BlY2lhbCBjYXNlIHRvIGF2b2lkIHVzaW5nIGEgbXVsdGktcXVvdGVkIHN0cmluZyB0aGF0IHdhcyBqdXN0IGNob21wZWRcbiAgICAvLyAoZS5nLiBgZm9udC1mYW1pbHk6IFwiVmVyZGFuYVwiLCBcInNhbnMtc2VyaWZcImApXG4gICAgaWYgKHRlbXBWYWx1ZS5pbmRleE9mKCdcXCcnKSA9PSAtMSAmJiB0ZW1wVmFsdWUuaW5kZXhPZignXCInKSA9PSAtMSkge1xuICAgICAgdmFsdWUgPSB0ZW1wVmFsdWU7XG4gICAgfVxuICB9XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGh5cGhlbmF0ZSh2YWx1ZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHZhbHVlLnJlcGxhY2UoL1thLXpdW0EtWl0vZywgdiA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHYuY2hhckF0KDApICsgJy0nICsgdi5jaGFyQXQoMSk7XG4gICAgICAgICAgICAgIH0pLnRvTG93ZXJDYXNlKCk7XG59XG4iXX0=