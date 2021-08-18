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
import { NumberFormatStyle, NumberSymbol, getLocaleNumberFormat, getLocaleNumberSymbol, getNumberOfCurrencyDigits } from './locale_data_api';
/** @type {?} */
export const NUMBER_FORMAT_REGEXP = /^(\d+)?\.((\d+)(-(\d+))?)?$/;
/** @type {?} */
const MAX_DIGITS = 22;
/** @type {?} */
const DECIMAL_SEP = '.';
/** @type {?} */
const ZERO_CHAR = '0';
/** @type {?} */
const PATTERN_SEP = ';';
/** @type {?} */
const GROUP_SEP = ',';
/** @type {?} */
const DIGIT_CHAR = '#';
/** @type {?} */
const CURRENCY_CHAR = '¤';
/** @type {?} */
const PERCENT_CHAR = '%';
/**
 * Transforms a number to a locale string based on a style and a format
 * @param {?} value
 * @param {?} pattern
 * @param {?} locale
 * @param {?} groupSymbol
 * @param {?} decimalSymbol
 * @param {?=} digitsInfo
 * @param {?=} isPercent
 * @return {?}
 */
function formatNumberToLocaleString(value, pattern, locale, groupSymbol, decimalSymbol, digitsInfo, isPercent = false) {
    /** @type {?} */
    let formattedText = '';
    /** @type {?} */
    let isZero = false;
    if (!isFinite(value)) {
        formattedText = getLocaleNumberSymbol(locale, NumberSymbol.Infinity);
    }
    else {
        /** @type {?} */
        let parsedNumber = parseNumber(value);
        if (isPercent) {
            parsedNumber = toPercent(parsedNumber);
        }
        /** @type {?} */
        let minInt = pattern.minInt;
        /** @type {?} */
        let minFraction = pattern.minFrac;
        /** @type {?} */
        let maxFraction = pattern.maxFrac;
        if (digitsInfo) {
            /** @type {?} */
            const parts = digitsInfo.match(NUMBER_FORMAT_REGEXP);
            if (parts === null) {
                throw new Error(`${digitsInfo} is not a valid digit info`);
            }
            /** @type {?} */
            const minIntPart = parts[1];
            /** @type {?} */
            const minFractionPart = parts[3];
            /** @type {?} */
            const maxFractionPart = parts[5];
            if (minIntPart != null) {
                minInt = parseIntAutoRadix(minIntPart);
            }
            if (minFractionPart != null) {
                minFraction = parseIntAutoRadix(minFractionPart);
            }
            if (maxFractionPart != null) {
                maxFraction = parseIntAutoRadix(maxFractionPart);
            }
            else if (minFractionPart != null && minFraction > maxFraction) {
                maxFraction = minFraction;
            }
        }
        roundNumber(parsedNumber, minFraction, maxFraction);
        /** @type {?} */
        let digits = parsedNumber.digits;
        /** @type {?} */
        let integerLen = parsedNumber.integerLen;
        /** @type {?} */
        const exponent = parsedNumber.exponent;
        /** @type {?} */
        let decimals = [];
        isZero = digits.every(d => !d);
        // pad zeros for small numbers
        for (; integerLen < minInt; integerLen++) {
            digits.unshift(0);
        }
        // pad zeros for small numbers
        for (; integerLen < 0; integerLen++) {
            digits.unshift(0);
        }
        // extract decimals digits
        if (integerLen > 0) {
            decimals = digits.splice(integerLen, digits.length);
        }
        else {
            decimals = digits;
            digits = [0];
        }
        // format the integer digits with grouping separators
        /** @type {?} */
        const groups = [];
        if (digits.length >= pattern.lgSize) {
            groups.unshift(digits.splice(-pattern.lgSize, digits.length).join(''));
        }
        while (digits.length > pattern.gSize) {
            groups.unshift(digits.splice(-pattern.gSize, digits.length).join(''));
        }
        if (digits.length) {
            groups.unshift(digits.join(''));
        }
        formattedText = groups.join(getLocaleNumberSymbol(locale, groupSymbol));
        // append the decimal digits
        if (decimals.length) {
            formattedText += getLocaleNumberSymbol(locale, decimalSymbol) + decimals.join('');
        }
        if (exponent) {
            formattedText += getLocaleNumberSymbol(locale, NumberSymbol.Exponential) + '+' + exponent;
        }
    }
    if (value < 0 && !isZero) {
        formattedText = pattern.negPre + formattedText + pattern.negSuf;
    }
    else {
        formattedText = pattern.posPre + formattedText + pattern.posSuf;
    }
    return formattedText;
}
/**
 * \@ngModule CommonModule
 * \@description
 *
 * Formats a number as currency using locale rules.
 *
 * Use `currency` to format a number as currency.
 *
 * Where:
 * - `value` is a number.
 * - `locale` is a `string` defining the locale to use.
 * - `currency` is the string that represents the currency, it can be its symbol or its name.
 * - `currencyCode` is the [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) currency code, such
 *    as `USD` for the US dollar and `EUR` for the euro.
 * - `digitInfo` See {\@link DecimalPipe} for more details.
 *
 * \@publicApi
 * @param {?} value
 * @param {?} locale
 * @param {?} currency
 * @param {?=} currencyCode
 * @param {?=} digitsInfo
 * @return {?}
 */
export function formatCurrency(value, locale, currency, currencyCode, digitsInfo) {
    /** @type {?} */
    const format = getLocaleNumberFormat(locale, NumberFormatStyle.Currency);
    /** @type {?} */
    const pattern = parseNumberFormat(format, getLocaleNumberSymbol(locale, NumberSymbol.MinusSign));
    pattern.minFrac = getNumberOfCurrencyDigits((/** @type {?} */ (currencyCode)));
    pattern.maxFrac = pattern.minFrac;
    /** @type {?} */
    const res = formatNumberToLocaleString(value, pattern, locale, NumberSymbol.CurrencyGroup, NumberSymbol.CurrencyDecimal, digitsInfo);
    return res
        .replace(CURRENCY_CHAR, currency)
        // if we have 2 time the currency character, the second one is ignored
        .replace(CURRENCY_CHAR, '');
}
/**
 * \@ngModule CommonModule
 * \@description
 *
 * Formats a number as a percentage according to locale rules.
 *
 * Where:
 * - `value` is a number.
 * - `locale` is a `string` defining the locale to use.
 * - `digitInfo` See {\@link DecimalPipe} for more details.
 *
 * \@publicApi
 * @param {?} value
 * @param {?} locale
 * @param {?=} digitsInfo
 * @return {?}
 */
export function formatPercent(value, locale, digitsInfo) {
    /** @type {?} */
    const format = getLocaleNumberFormat(locale, NumberFormatStyle.Percent);
    /** @type {?} */
    const pattern = parseNumberFormat(format, getLocaleNumberSymbol(locale, NumberSymbol.MinusSign));
    /** @type {?} */
    const res = formatNumberToLocaleString(value, pattern, locale, NumberSymbol.Group, NumberSymbol.Decimal, digitsInfo, true);
    return res.replace(new RegExp(PERCENT_CHAR, 'g'), getLocaleNumberSymbol(locale, NumberSymbol.PercentSign));
}
/**
 * \@ngModule CommonModule
 * \@description
 *
 * Formats a number as text. Group sizing and separator and other locale-specific
 * configurations are based on the locale.
 *
 * Where:
 * - `value` is a number.
 * - `locale` is a `string` defining the locale to use.
 * - `digitInfo` See {\@link DecimalPipe} for more details.
 *
 * \@publicApi
 * @param {?} value
 * @param {?} locale
 * @param {?=} digitsInfo
 * @return {?}
 */
export function formatNumber(value, locale, digitsInfo) {
    /** @type {?} */
    const format = getLocaleNumberFormat(locale, NumberFormatStyle.Decimal);
    /** @type {?} */
    const pattern = parseNumberFormat(format, getLocaleNumberSymbol(locale, NumberSymbol.MinusSign));
    return formatNumberToLocaleString(value, pattern, locale, NumberSymbol.Group, NumberSymbol.Decimal, digitsInfo);
}
/**
 * @record
 */
function ParsedNumberFormat() { }
if (false) {
    /** @type {?} */
    ParsedNumberFormat.prototype.minInt;
    /** @type {?} */
    ParsedNumberFormat.prototype.minFrac;
    /** @type {?} */
    ParsedNumberFormat.prototype.maxFrac;
    /** @type {?} */
    ParsedNumberFormat.prototype.posPre;
    /** @type {?} */
    ParsedNumberFormat.prototype.posSuf;
    /** @type {?} */
    ParsedNumberFormat.prototype.negPre;
    /** @type {?} */
    ParsedNumberFormat.prototype.negSuf;
    /** @type {?} */
    ParsedNumberFormat.prototype.gSize;
    /** @type {?} */
    ParsedNumberFormat.prototype.lgSize;
}
/**
 * @param {?} format
 * @param {?=} minusSign
 * @return {?}
 */
function parseNumberFormat(format, minusSign = '-') {
    /** @type {?} */
    const p = {
        minInt: 1,
        minFrac: 0,
        maxFrac: 0,
        posPre: '',
        posSuf: '',
        negPre: '',
        negSuf: '',
        gSize: 0,
        lgSize: 0
    };
    /** @type {?} */
    const patternParts = format.split(PATTERN_SEP);
    /** @type {?} */
    const positive = patternParts[0];
    /** @type {?} */
    const negative = patternParts[1];
    /** @type {?} */
    const positiveParts = positive.indexOf(DECIMAL_SEP) !== -1 ?
        positive.split(DECIMAL_SEP) :
        [
            positive.substring(0, positive.lastIndexOf(ZERO_CHAR) + 1),
            positive.substring(positive.lastIndexOf(ZERO_CHAR) + 1)
        ];
    /** @type {?} */
    const integer = positiveParts[0];
    /** @type {?} */
    const fraction = positiveParts[1] || '';
    p.posPre = integer.substr(0, integer.indexOf(DIGIT_CHAR));
    for (let i = 0; i < fraction.length; i++) {
        /** @type {?} */
        const ch = fraction.charAt(i);
        if (ch === ZERO_CHAR) {
            p.minFrac = p.maxFrac = i + 1;
        }
        else if (ch === DIGIT_CHAR) {
            p.maxFrac = i + 1;
        }
        else {
            p.posSuf += ch;
        }
    }
    /** @type {?} */
    const groups = integer.split(GROUP_SEP);
    p.gSize = groups[1] ? groups[1].length : 0;
    p.lgSize = (groups[2] || groups[1]) ? (groups[2] || groups[1]).length : 0;
    if (negative) {
        /** @type {?} */
        const trunkLen = positive.length - p.posPre.length - p.posSuf.length;
        /** @type {?} */
        const pos = negative.indexOf(DIGIT_CHAR);
        p.negPre = negative.substr(0, pos).replace(/'/g, '');
        p.negSuf = negative.substr(pos + trunkLen).replace(/'/g, '');
    }
    else {
        p.negPre = minusSign + p.posPre;
        p.negSuf = p.posSuf;
    }
    return p;
}
/**
 * @record
 */
function ParsedNumber() { }
if (false) {
    /** @type {?} */
    ParsedNumber.prototype.digits;
    /** @type {?} */
    ParsedNumber.prototype.exponent;
    /** @type {?} */
    ParsedNumber.prototype.integerLen;
}
// Transforms a parsed number into a percentage by multiplying it by 100
/**
 * @param {?} parsedNumber
 * @return {?}
 */
function toPercent(parsedNumber) {
    // if the number is 0, don't do anything
    if (parsedNumber.digits[0] === 0) {
        return parsedNumber;
    }
    // Getting the current number of decimals
    /** @type {?} */
    const fractionLen = parsedNumber.digits.length - parsedNumber.integerLen;
    if (parsedNumber.exponent) {
        parsedNumber.exponent += 2;
    }
    else {
        if (fractionLen === 0) {
            parsedNumber.digits.push(0, 0);
        }
        else if (fractionLen === 1) {
            parsedNumber.digits.push(0);
        }
        parsedNumber.integerLen += 2;
    }
    return parsedNumber;
}
/**
 * Parses a number.
 * Significant bits of this parse algorithm came from https://github.com/MikeMcl/big.js/
 * @param {?} num
 * @return {?}
 */
function parseNumber(num) {
    /** @type {?} */
    let numStr = Math.abs(num) + '';
    /** @type {?} */
    let exponent = 0;
    /** @type {?} */
    let digits;
    /** @type {?} */
    let integerLen;
    /** @type {?} */
    let i;
    /** @type {?} */
    let j;
    /** @type {?} */
    let zeros;
    // Decimal point?
    if ((integerLen = numStr.indexOf(DECIMAL_SEP)) > -1) {
        numStr = numStr.replace(DECIMAL_SEP, '');
    }
    // Exponential form?
    if ((i = numStr.search(/e/i)) > 0) {
        // Work out the exponent.
        if (integerLen < 0)
            integerLen = i;
        integerLen += +numStr.slice(i + 1);
        numStr = numStr.substring(0, i);
    }
    else if (integerLen < 0) {
        // There was no decimal point or exponent so it is an integer.
        integerLen = numStr.length;
    }
    // Count the number of leading zeros.
    for (i = 0; numStr.charAt(i) === ZERO_CHAR; i++) { /* empty */
    }
    if (i === (zeros = numStr.length)) {
        // The digits are all zero.
        digits = [0];
        integerLen = 1;
    }
    else {
        // Count the number of trailing zeros
        zeros--;
        while (numStr.charAt(zeros) === ZERO_CHAR)
            zeros--;
        // Trailing zeros are insignificant so ignore them
        integerLen -= i;
        digits = [];
        // Convert string to array of digits without leading/trailing zeros.
        for (j = 0; i <= zeros; i++, j++) {
            digits[j] = Number(numStr.charAt(i));
        }
    }
    // If the number overflows the maximum allowed digits then use an exponent.
    if (integerLen > MAX_DIGITS) {
        digits = digits.splice(0, MAX_DIGITS - 1);
        exponent = integerLen - 1;
        integerLen = 1;
    }
    return { digits, exponent, integerLen };
}
/**
 * Round the parsed number to the specified number of decimal places
 * This function changes the parsedNumber in-place
 * @param {?} parsedNumber
 * @param {?} minFrac
 * @param {?} maxFrac
 * @return {?}
 */
function roundNumber(parsedNumber, minFrac, maxFrac) {
    if (minFrac > maxFrac) {
        throw new Error(`The minimum number of digits after fraction (${minFrac}) is higher than the maximum (${maxFrac}).`);
    }
    /** @type {?} */
    let digits = parsedNumber.digits;
    /** @type {?} */
    let fractionLen = digits.length - parsedNumber.integerLen;
    /** @type {?} */
    const fractionSize = Math.min(Math.max(minFrac, fractionLen), maxFrac);
    // The index of the digit to where rounding is to occur
    /** @type {?} */
    let roundAt = fractionSize + parsedNumber.integerLen;
    /** @type {?} */
    let digit = digits[roundAt];
    if (roundAt > 0) {
        // Drop fractional digits beyond `roundAt`
        digits.splice(Math.max(parsedNumber.integerLen, roundAt));
        // Set non-fractional digits beyond `roundAt` to 0
        for (let j = roundAt; j < digits.length; j++) {
            digits[j] = 0;
        }
    }
    else {
        // We rounded to zero so reset the parsedNumber
        fractionLen = Math.max(0, fractionLen);
        parsedNumber.integerLen = 1;
        digits.length = Math.max(1, roundAt = fractionSize + 1);
        digits[0] = 0;
        for (let i = 1; i < roundAt; i++)
            digits[i] = 0;
    }
    if (digit >= 5) {
        if (roundAt - 1 < 0) {
            for (let k = 0; k > roundAt; k--) {
                digits.unshift(0);
                parsedNumber.integerLen++;
            }
            digits.unshift(1);
            parsedNumber.integerLen++;
        }
        else {
            digits[roundAt - 1]++;
        }
    }
    // Pad out with zeros to get the required fraction length
    for (; fractionLen < Math.max(0, fractionSize); fractionLen++)
        digits.push(0);
    /** @type {?} */
    let dropTrailingZeros = fractionSize !== 0;
    // Minimal length = nb of decimals required + current nb of integers
    // Any number besides that is optional and can be removed if it's a trailing 0
    /** @type {?} */
    const minLen = minFrac + parsedNumber.integerLen;
    // Do any carrying, e.g. a digit was rounded up to 10
    /** @type {?} */
    const carry = digits.reduceRight(function (carry, d, i, digits) {
        d = d + carry;
        digits[i] = d < 10 ? d : d - 10; // d % 10
        if (dropTrailingZeros) {
            // Do not keep meaningless fractional trailing zeros (e.g. 15.52000 --> 15.52)
            if (digits[i] === 0 && i >= minLen) {
                digits.pop();
            }
            else {
                dropTrailingZeros = false;
            }
        }
        return d >= 10 ? 1 : 0; // Math.floor(d / 10);
    }, 0);
    if (carry) {
        digits.unshift(carry);
        parsedNumber.integerLen++;
    }
}
/**
 * @param {?} text
 * @return {?}
 */
export function parseIntAutoRadix(text) {
    /** @type {?} */
    const result = parseInt(text);
    if (isNaN(result)) {
        throw new Error('Invalid integer literal when parsing ' + text);
    }
    return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0X251bWJlci5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2NvbW1vbi9zcmMvaTE4bi9mb3JtYXRfbnVtYmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxFQUFDLGlCQUFpQixFQUFFLFlBQVksRUFBRSxxQkFBcUIsRUFBRSxxQkFBcUIsRUFBRSx5QkFBeUIsRUFBQyxNQUFNLG1CQUFtQixDQUFDOztBQUUzSSxNQUFNLE9BQU8sb0JBQW9CLEdBQUcsNkJBQTZCOztNQUMzRCxVQUFVLEdBQUcsRUFBRTs7TUFDZixXQUFXLEdBQUcsR0FBRzs7TUFDakIsU0FBUyxHQUFHLEdBQUc7O01BQ2YsV0FBVyxHQUFHLEdBQUc7O01BQ2pCLFNBQVMsR0FBRyxHQUFHOztNQUNmLFVBQVUsR0FBRyxHQUFHOztNQUNoQixhQUFhLEdBQUcsR0FBRzs7TUFDbkIsWUFBWSxHQUFHLEdBQUc7Ozs7Ozs7Ozs7OztBQUt4QixTQUFTLDBCQUEwQixDQUMvQixLQUFhLEVBQUUsT0FBMkIsRUFBRSxNQUFjLEVBQUUsV0FBeUIsRUFDckYsYUFBMkIsRUFBRSxVQUFtQixFQUFFLFNBQVMsR0FBRyxLQUFLOztRQUNqRSxhQUFhLEdBQUcsRUFBRTs7UUFDbEIsTUFBTSxHQUFHLEtBQUs7SUFFbEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUNwQixhQUFhLEdBQUcscUJBQXFCLENBQUMsTUFBTSxFQUFFLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUN0RTtTQUFNOztZQUNELFlBQVksR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDO1FBRXJDLElBQUksU0FBUyxFQUFFO1lBQ2IsWUFBWSxHQUFHLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUN4Qzs7WUFFRyxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU07O1lBQ3ZCLFdBQVcsR0FBRyxPQUFPLENBQUMsT0FBTzs7WUFDN0IsV0FB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WUFDOUUsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxNQUFNLEVBQUU7Z0JBQ2xDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQzthQUNkO2lCQUFNO2dCQUNMLGlCQUFpQixHQUFHLEtBQUssQ0FBQzthQUMzQjtTQUNGO1FBQ0QsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFFLHNCQUFzQjtJQUNqRCxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ0wsSUFBSSxLQUFLLEVBQUU7UUFDVCxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3RCLFlBQVksQ0FBQyxVQUFVLEVBQUUsQ0FBQztLQUMzQjtBQUNILENBQUM7Ozs7O0FBRUQsTUFBTSxVQUFVLGlCQUFpQixDQUFDLElBQVk7O1VBQ3RDLE1BQU0sR0FBVyxRQUFRLENBQUMsSUFBSSxDQUFDO0lBQ3JDLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1FBQ2pCLE1BQU0sSUFBSSxLQUFLLENBQUMsdUNBQXVDLEdBQUcsSUFBSSxDQUFDLENBQUM7S0FDakU7SUFDRCxPQUFPLE1BQU0sQ0FBQztBQUNoQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge051bWJlckZvcm1hdFN0eWxlLCBOdW1iZXJTeW1ib2wsIGdldExvY2FsZU51bWJlckZvcm1hdCwgZ2V0TG9jYWxlTnVtYmVyU3ltYm9sLCBnZXROdW1iZXJPZkN1cnJlbmN5RGlnaXRzfSBmcm9tICcuL2xvY2FsZV9kYXRhX2FwaSc7XG5cbmV4cG9ydCBjb25zdCBOVU1CRVJfRk9STUFUX1JFR0VYUCA9IC9eKFxcZCspP1xcLigoXFxkKykoLShcXGQrKSk/KT8kLztcbmNvbnN0IE1BWF9ESUdJVFMgPSAyMjtcbmNvbnN0IERFQ0lNQUxfU0VQID0gJy4nO1xuY29uc3QgWkVST19DSEFSID0gJzAnO1xuY29uc3QgUEFUVEVSTl9TRVAgPSAnOyc7XG5jb25zdCBHUk9VUF9TRVAgPSAnLCc7XG5jb25zdCBESUdJVF9DSEFSID0gJyMnO1xuY29uc3QgQ1VSUkVOQ1lfQ0hBUiA9ICfCpCc7XG5jb25zdCBQRVJDRU5UX0NIQVIgPSAnJSc7XG5cbi8qKlxuICogVHJhbnNmb3JtcyBhIG51bWJlciB0byBhIGxvY2FsZSBzdHJpbmcgYmFzZWQgb24gYSBzdHlsZSBhbmQgYSBmb3JtYXRcbiAqL1xuZnVuY3Rpb24gZm9ybWF0TnVtYmVyVG9Mb2NhbGVTdHJpbmcoXG4gICAgdmFsdWU6IG51bWJlciwgcGF0dGVybjogUGFyc2VkTnVtYmVyRm9ybWF0LCBsb2NhbGU6IHN0cmluZywgZ3JvdXBTeW1ib2w6IE51bWJlclN5bWJvbCxcbiAgICBkZWNpbWFsU3ltYm9sOiBOdW1iZXJTeW1ib2wsIGRpZ2l0c0luZm8/OiBzdHJpbmcsIGlzUGVyY2VudCA9IGZhbHNlKTogc3RyaW5nIHtcbiAgbGV0IGZvcm1hdHRlZFRleHQgPSAnJztcbiAgbGV0IGlzWmVybyA9IGZhbHNlO1xuXG4gIGlmICghaXNGaW5pdGUodmFsdWUpKSB7XG4gICAgZm9ybWF0dGVkVGV4dCA9IGdldExvY2FsZU51bWJlclN5bWJvbChsb2NhbGUsIE51bWJlclN5bWJvbC5JbmZpbml0eSk7XG4gIH0gZWxzZSB7XG4gICAgbGV0IHBhcnNlZE51bWJlciA9IHBhcnNlTnVtYmVyKHZhbHVlKTtcblxuICAgIGlmIChpc1BlcmNlbnQpIHtcbiAgICAgIHBhcnNlZE51bWJlciA9IHRvUGVyY2VudChwYXJzZWROdW1iZXIpO1xuICAgIH1cblxuICAgIGxldCBtaW5JbnQgPSBwYXR0ZXJuLm1pbkludDtcbiAgICBsZXQgbWluRnJhY3Rpb24gPSBwYXR0ZXJuLm1pbkZyYWM7XG4gICAgbGV0IG1heEZyYWN0aW9uID0gcGF0dGVybi5tYXhGcmFjO1xuXG4gICAgaWYgKGRpZ2l0c0luZm8pIHtcbiAgICAgIGNvbnN0IHBhcnRzID0gZGlnaXRzSW5mby5tYXRjaChOVU1CRVJfRk9STUFUX1JFR0VYUCk7XG4gICAgICBpZiAocGFydHMgPT09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAke2RpZ2l0c0luZm99IGlzIG5vdCBhIHZhbGlkIGRpZ2l0IGluZm9gKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IG1pbkludFBhcnQgPSBwYXJ0c1sxXTtcbiAgICAgIGNvbnN0IG1pbkZyYWN0aW9uUGFydCA9IHBhcnRzWzNdO1xuICAgICAgY29uc3QgbWF4RnJhY3Rpb25QYXJ0ID0gcGFydHNbNV07XG4gICAgICBpZiAobWluSW50UGFydCAhPSBudWxsKSB7XG4gICAgICAgIG1pbkludCA9IHBhcnNlSW50QXV0b1JhZGl4KG1pbkludFBhcnQpO1xuICAgICAgfVxuICAgICAgaWYgKG1pbkZyYWN0aW9uUGFydCAhPSBudWxsKSB7XG4gICAgICAgIG1pbkZyYWN0aW9uID0gcGFyc2VJbnRBdXRvUmFkaXgobWluRnJhY3Rpb25QYXJ0KTtcbiAgICAgIH1cbiAgICAgIGlmIChtYXhGcmFjdGlvblBhcnQgIT0gbnVsbCkge1xuICAgICAgICBtYXhGcmFjdGlvbiA9IHBhcnNlSW50QXV0b1JhZGl4KG1heEZyYWN0aW9uUGFydCk7XG4gICAgICB9IGVsc2UgaWYgKG1pbkZyYWN0aW9uUGFydCAhPSBudWxsICYmIG1pbkZyYWN0aW9uID4gbWF4RnJhY3Rpb24pIHtcbiAgICAgICAgbWF4RnJhY3Rpb24gPSBtaW5GcmFjdGlvbjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByb3VuZE51bWJlcihwYXJzZWROdW1iZXIsIG1pbkZyYWN0aW9uLCBtYXhGcmFjdGlvbik7XG5cbiAgICBsZXQgZGlnaXRzID0gcGFyc2VkTnVtYmVyLmRpZ2l0cztcbiAgICBsZXQgaW50ZWdlckxlbiA9IHBhcnNlZE51bWJlci5pbnRlZ2VyTGVuO1xuICAgIGNvbnN0IGV4cG9uZW50ID0gcGFyc2VkTnVtYmVyLmV4cG9uZW50O1xuICAgIGxldCBkZWNpbWFscyA9IFtdO1xuICAgIGlzWmVybyA9IGRpZ2l0cy5ldmVyeShkID0+ICFkKTtcblxuICAgIC8vIHBhZCB6ZXJvcyBmb3Igc21hbGwgbnVtYmVyc1xuICAgIGZvciAoOyBpbnRlZ2VyTGVuIDwgbWluSW50OyBpbnRlZ2VyTGVuKyspIHtcbiAgICAgIGRpZ2l0cy51bnNoaWZ0KDApO1xuICAgIH1cblxuICAgIC8vIHBhZCB6ZXJvcyBmb3Igc21hbGwgbnVtYmVyc1xuICAgIGZvciAoOyBpbnRlZ2VyTGVuIDwgMDsgaW50ZWdlckxlbisrKSB7XG4gICAgICBkaWdpdHMudW5zaGlmdCgwKTtcbiAgICB9XG5cbiAgICAvLyBleHRyYWN0IGRlY2ltYWxzIGRpZ2l0c1xuICAgIGlmIChpbnRlZ2VyTGVuID4gMCkge1xuICAgICAgZGVjaW1hbHMgPSBkaWdpdHMuc3BsaWNlKGludGVnZXJMZW4sIGRpZ2l0cy5sZW5ndGgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWNpbWFscyA9IGRpZ2l0cztcbiAgICAgIGRpZ2l0cyA9IFswXTtcbiAgICB9XG5cbiAgICAvLyBmb3JtYXQgdGhlIGludGVnZXIgZGlnaXRzIHdpdGggZ3JvdXBpbmcgc2VwYXJhdG9yc1xuICAgIGNvbnN0IGdyb3VwcyA9IFtdO1xuICAgIGlmIChkaWdpdHMubGVuZ3RoID49IHBhdHRlcm4ubGdTaXplKSB7XG4gICAgICBncm91cHMudW5zaGlmdChkaWdpdHMuc3BsaWNlKC1wYXR0ZXJuLmxnU2l6ZSwgZGlnaXRzLmxlbmd0aCkuam9pbignJykpO1xuICAgIH1cblxuICAgIHdoaWxlIChkaWdpdHMubGVuZ3RoID4gcGF0dGVybi5nU2l6ZSkge1xuICAgICAgZ3JvdXBzLnVuc2hpZnQoZGlnaXRzLnNwbGljZSgtcGF0dGVybi5nU2l6ZSwgZGlnaXRzLmxlbmd0aCkuam9pbignJykpO1xuICAgIH1cblxuICAgIGlmIChkaWdpdHMubGVuZ3RoKSB7XG4gICAgICBncm91cHMudW5zaGlmdChkaWdpdHMuam9pbignJykpO1xuICAgIH1cblxuICAgIGZvcm1hdHRlZFRleHQgPSBncm91cHMuam9pbihnZXRMb2NhbGVOdW1iZXJTeW1ib2wobG9jYWxlLCBncm91cFN5bWJvbCkpO1xuXG4gICAgLy8gYXBwZW5kIHRoZSBkZWNpbWFsIGRpZ2l0c1xuICAgIGlmIChkZWNpbWFscy5sZW5ndGgpIHtcbiAgICAgIGZvcm1hdHRlZFRleHQgKz0gZ2V0TG9jYWxlTnVtYmVyU3ltYm9sKGxvY2FsZSwgZGVjaW1hbFN5bWJvbCkgKyBkZWNpbWFscy5qb2luKCcnKTtcbiAgICB9XG5cbiAgICBpZiAoZXhwb25lbnQpIHtcbiAgICAgIGZvcm1hdHRlZFRleHQgKz0gZ2V0TG9jYWxlTnVtYmVyU3ltYm9sKGxvY2FsZSwgTnVtYmVyU3ltYm9sLkV4cG9uZW50aWFsKSArICcrJyArIGV4cG9uZW50O1xuICAgIH1cbiAgfVxuXG4gIGlmICh2YWx1ZSA8IDAgJiYgIWlzWmVybykge1xuICAgIGZvcm1hdHRlZFRleHQgPSBwYXR0ZXJuLm5lZ1ByZSArIGZvcm1hdHRlZFRleHQgKyBwYXR0ZXJuLm5lZ1N1ZjtcbiAgfSBlbHNlIHtcbiAgICBmb3JtYXR0ZWRUZXh0ID0gcGF0dGVybi5wb3NQcmUgKyBmb3JtYXR0ZWRUZXh0ICsgcGF0dGVybi5wb3NTdWY7XG4gIH1cblxuICByZXR1cm4gZm9ybWF0dGVkVGV4dDtcbn1cblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBGb3JtYXRzIGEgbnVtYmVyIGFzIGN1cnJlbmN5IHVzaW5nIGxvY2FsZSBydWxlcy5cbiAqXG4gKiBVc2UgYGN1cnJlbmN5YCB0byBmb3JtYXQgYSBudW1iZXIgYXMgY3VycmVuY3kuXG4gKlxuICogV2hlcmU6XG4gKiAtIGB2YWx1ZWAgaXMgYSBudW1iZXIuXG4gKiAtIGBsb2NhbGVgIGlzIGEgYHN0cmluZ2AgZGVmaW5pbmcgdGhlIGxvY2FsZSB0byB1c2UuXG4gKiAtIGBjdXJyZW5jeWAgaXMgdGhlIHN0cmluZyB0aGF0IHJlcHJlc2VudHMgdGhlIGN1cnJlbmN5LCBpdCBjYW4gYmUgaXRzIHN5bWJvbCBvciBpdHMgbmFtZS5cbiAqIC0gYGN1cnJlbmN5Q29kZWAgaXMgdGhlIFtJU08gNDIxN10oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvSVNPXzQyMTcpIGN1cnJlbmN5IGNvZGUsIHN1Y2hcbiAqICAgIGFzIGBVU0RgIGZvciB0aGUgVVMgZG9sbGFyIGFuZCBgRVVSYCBmb3IgdGhlIGV1cm8uXG4gKiAtIGBkaWdpdEluZm9gIFNlZSB7QGxpbmsgRGVjaW1hbFBpcGV9IGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0Q3VycmVuY3koXG4gICAgdmFsdWU6IG51bWJlciwgbG9jYWxlOiBzdHJpbmcsIGN1cnJlbmN5OiBzdHJpbmcsIGN1cnJlbmN5Q29kZT86IHN0cmluZyxcbiAgICBkaWdpdHNJbmZvPzogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgZm9ybWF0ID0gZ2V0TG9jYWxlTnVtYmVyRm9ybWF0KGxvY2FsZSwgTnVtYmVyRm9ybWF0U3R5bGUuQ3VycmVuY3kpO1xuICBjb25zdCBwYXR0ZXJuID0gcGFyc2VOdW1iZXJGb3JtYXQoZm9ybWF0LCBnZXRMb2NhbGVOdW1iZXJTeW1ib2wobG9jYWxlLCBOdW1iZXJTeW1ib2wuTWludXNTaWduKSk7XG5cbiAgcGF0dGVybi5taW5GcmFjID0gZ2V0TnVtYmVyT2ZDdXJyZW5jeURpZ2l0cyhjdXJyZW5jeUNvZGUgISk7XG4gIHBhdHRlcm4ubWF4RnJhYyA9IHBhdHRlcm4ubWluRnJhYztcblxuICBjb25zdCByZXMgPSBmb3JtYXROdW1iZXJUb0xvY2FsZVN0cmluZyhcbiAgICAgIHZhbHVlLCBwYXR0ZXJuLCBsb2NhbGUsIE51bWJlclN5bWJvbC5DdXJyZW5jeUdyb3VwLCBOdW1iZXJTeW1ib2wuQ3VycmVuY3lEZWNpbWFsLCBkaWdpdHNJbmZvKTtcbiAgcmV0dXJuIHJlc1xuICAgICAgLnJlcGxhY2UoQ1VSUkVOQ1lfQ0hBUiwgY3VycmVuY3kpXG4gICAgICAvLyBpZiB3ZSBoYXZlIDIgdGltZSB0aGUgY3VycmVuY3kgY2hhcmFjdGVyLCB0aGUgc2Vjb25kIG9uZSBpcyBpZ25vcmVkXG4gICAgICAucmVwbGFjZShDVVJSRU5DWV9DSEFSLCAnJyk7XG59XG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogRm9ybWF0cyBhIG51bWJlciBhcyBhIHBlcmNlbnRhZ2UgYWNjb3JkaW5nIHRvIGxvY2FsZSBydWxlcy5cbiAqXG4gKiBXaGVyZTpcbiAqIC0gYHZhbHVlYCBpcyBhIG51bWJlci5cbiAqIC0gYGxvY2FsZWAgaXMgYSBgc3RyaW5nYCBkZWZpbmluZyB0aGUgbG9jYWxlIHRvIHVzZS5cbiAqIC0gYGRpZ2l0SW5mb2AgU2VlIHtAbGluayBEZWNpbWFsUGlwZX0gZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRQZXJjZW50KHZhbHVlOiBudW1iZXIsIGxvY2FsZTogc3RyaW5nLCBkaWdpdHNJbmZvPzogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgZm9ybWF0ID0gZ2V0TG9jYWxlTnVtYmVyRm9ybWF0KGxvY2FsZSwgTnVtYmVyRm9ybWF0U3R5bGUuUGVyY2VudCk7XG4gIGNvbnN0IHBhdHRlcm4gPSBwYXJzZU51bWJlckZvcm1hdChmb3JtYXQsIGdldExvY2FsZU51bWJlclN5bWJvbChsb2NhbGUsIE51bWJlclN5bWJvbC5NaW51c1NpZ24pKTtcbiAgY29uc3QgcmVzID0gZm9ybWF0TnVtYmVyVG9Mb2NhbGVTdHJpbmcoXG4gICAgICB2YWx1ZSwgcGF0dGVybiwgbG9jYWxlLCBOdW1iZXJTeW1ib2wuR3JvdXAsIE51bWJlclN5bWJvbC5EZWNpbWFsLCBkaWdpdHNJbmZvLCB0cnVlKTtcbiAgcmV0dXJuIHJlcy5yZXBsYWNlKFxuICAgICAgbmV3IFJlZ0V4cChQRVJDRU5UX0NIQVIsICdnJyksIGdldExvY2FsZU51bWJlclN5bWJvbChsb2NhbGUsIE51bWJlclN5bWJvbC5QZXJjZW50U2lnbikpO1xufVxuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIEZvcm1hdHMgYSBudW1iZXIgYXMgdGV4dC4gR3JvdXAgc2l6aW5nIGFuZCBzZXBhcmF0b3IgYW5kIG90aGVyIGxvY2FsZS1zcGVjaWZpY1xuICogY29uZmlndXJhdGlvbnMgYXJlIGJhc2VkIG9uIHRoZSBsb2NhbGUuXG4gKlxuICogV2hlcmU6XG4gKiAtIGB2YWx1ZWAgaXMgYSBudW1iZXIuXG4gKiAtIGBsb2NhbGVgIGlzIGEgYHN0cmluZ2AgZGVmaW5pbmcgdGhlIGxvY2FsZSB0byB1c2UuXG4gKiAtIGBkaWdpdEluZm9gIFNlZSB7QGxpbmsgRGVjaW1hbFBpcGV9IGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0TnVtYmVyKHZhbHVlOiBudW1iZXIsIGxvY2FsZTogc3RyaW5nLCBkaWdpdHNJbmZvPzogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgZm9ybWF0ID0gZ2V0TG9jYWxlTnVtYmVyRm9ybWF0KGxvY2FsZSwgTnVtYmVyRm9ybWF0U3R5bGUuRGVjaW1hbCk7XG4gIGNvbnN0IHBhdHRlcm4gPSBwYXJzZU51bWJlckZvcm1hdChmb3JtYXQsIGdldExvY2FsZU51bWJlclN5bWJvbChsb2NhbGUsIE51bWJlclN5bWJvbC5NaW51c1NpZ24pKTtcbiAgcmV0dXJuIGZvcm1hdE51bWJlclRvTG9jYWxlU3RyaW5nKFxuICAgICAgdmFsdWUsIHBhdHRlcm4sIGxvY2FsZSwgTnVtYmVyU3ltYm9sLkdyb3VwLCBOdW1iZXJTeW1ib2wuRGVjaW1hbCwgZGlnaXRzSW5mbyk7XG59XG5cbmludGVyZmFjZSBQYXJzZWROdW1iZXJGb3JtYXQge1xuICBtaW5JbnQ6IG51bWJlcjtcbiAgLy8gdGhlIG1pbmltdW0gbnVtYmVyIG9mIGRpZ2l0cyByZXF1aXJlZCBpbiB0aGUgZnJhY3Rpb24gcGFydCBvZiB0aGUgbnVtYmVyXG4gIG1pbkZyYWM6IG51bWJlcjtcbiAgLy8gdGhlIG1heGltdW0gbnVtYmVyIG9mIGRpZ2l0cyByZXF1aXJlZCBpbiB0aGUgZnJhY3Rpb24gcGFydCBvZiB0aGUgbnVtYmVyXG4gIG1heEZyYWM6IG51bWJlcjtcbiAgLy8gdGhlIHByZWZpeCBmb3IgYSBwb3NpdGl2ZSBudW1iZXJcbiAgcG9zUHJlOiBzdHJpbmc7XG4gIC8vIHRoZSBzdWZmaXggZm9yIGEgcG9zaXRpdmUgbnVtYmVyXG4gIHBvc1N1Zjogc3RyaW5nO1xuICAvLyB0aGUgcHJlZml4IGZvciBhIG5lZ2F0aXZlIG51bWJlciAoZS5nLiBgLWAgb3IgYChgKSlcbiAgbmVnUHJlOiBzdHJpbmc7XG4gIC8vIHRoZSBzdWZmaXggZm9yIGEgbmVnYXRpdmUgbnVtYmVyIChlLmcuIGApYClcbiAgbmVnU3VmOiBzdHJpbmc7XG4gIC8vIG51bWJlciBvZiBkaWdpdHMgaW4gZWFjaCBncm91cCBvZiBzZXBhcmF0ZWQgZGlnaXRzXG4gIGdTaXplOiBudW1iZXI7XG4gIC8vIG51bWJlciBvZiBkaWdpdHMgaW4gdGhlIGxhc3QgZ3JvdXAgb2YgZGlnaXRzIGJlZm9yZSB0aGUgZGVjaW1hbCBzZXBhcmF0b3JcbiAgbGdTaXplOiBudW1iZXI7XG59XG5cbmZ1bmN0aW9uIHBhcnNlTnVtYmVyRm9ybWF0KGZvcm1hdDogc3RyaW5nLCBtaW51c1NpZ24gPSAnLScpOiBQYXJzZWROdW1iZXJGb3JtYXQge1xuICBjb25zdCBwID0ge1xuICAgIG1pbkludDogMSxcbiAgICBtaW5GcmFjOiAwLFxuICAgIG1heEZyYWM6IDAsXG4gICAgcG9zUHJlOiAnJyxcbiAgICBwb3NTdWY6ICcnLFxuICAgIG5lZ1ByZTogJycsXG4gICAgbmVnU3VmOiAnJyxcbiAgICBnU2l6ZTogMCxcbiAgICBsZ1NpemU6IDBcbiAgfTtcblxuICBjb25zdCBwYXR0ZXJuUGFydHMgPSBmb3JtYXQuc3BsaXQoUEFUVEVSTl9TRVApO1xuICBjb25zdCBwb3NpdGl2ZSA9IHBhdHRlcm5QYXJ0c1swXTtcbiAgY29uc3QgbmVnYXRpdmUgPSBwYXR0ZXJuUGFydHNbMV07XG5cbiAgY29uc3QgcG9zaXRpdmVQYXJ0cyA9IHBvc2l0aXZlLmluZGV4T2YoREVDSU1BTF9TRVApICE9PSAtMSA/XG4gICAgICBwb3NpdGl2ZS5zcGxpdChERUNJTUFMX1NFUCkgOlxuICAgICAgW1xuICAgICAgICBwb3NpdGl2ZS5zdWJzdHJpbmcoMCwgcG9zaXRpdmUubGFzdEluZGV4T2YoWkVST19DSEFSKSArIDEpLFxuICAgICAgICBwb3NpdGl2ZS5zdWJzdHJpbmcocG9zaXRpdmUubGFzdEluZGV4T2YoWkVST19DSEFSKSArIDEpXG4gICAgICBdLFxuICAgICAgICBpbnRlZ2VyID0gcG9zaXRpdmVQYXJ0c1swXSwgZnJhY3Rpb24gPSBwb3NpdGl2ZVBhcnRzWzFdIHx8ICcnO1xuXG4gIHAucG9zUHJlID0gaW50ZWdlci5zdWJzdHIoMCwgaW50ZWdlci5pbmRleE9mKERJR0lUX0NIQVIpKTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGZyYWN0aW9uLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgY2ggPSBmcmFjdGlvbi5jaGFyQXQoaSk7XG4gICAgaWYgKGNoID09PSBaRVJPX0NIQVIpIHtcbiAgICAgIHAubWluRnJhYyA9IHAubWF4RnJhYyA9IGkgKyAxO1xuICAgIH0gZWxzZSBpZiAoY2ggPT09IERJR0lUX0NIQVIpIHtcbiAgICAgIHAubWF4RnJhYyA9IGkgKyAxO1xuICAgIH0gZWxzZSB7XG4gICAgICBwLnBvc1N1ZiArPSBjaDtcbiAgICB9XG4gIH1cblxuICBjb25zdCBncm91cHMgPSBpbnRlZ2VyLnNwbGl0KEdST1VQX1NFUCk7XG4gIHAuZ1NpemUgPSBncm91cHNbMV0gPyBncm91cHNbMV0ubGVuZ3RoIDogMDtcbiAgcC5sZ1NpemUgPSAoZ3JvdXBzWzJdIHx8IGdyb3Vwc1sxXSkgPyAoZ3JvdXBzWzJdIHx8IGdyb3Vwc1sxXSkubGVuZ3RoIDogMDtcblxuICBpZiAobmVnYXRpdmUpIHtcbiAgICBjb25zdCB0cnVua0xlbiA9IHBvc2l0aXZlLmxlbmd0aCAtIHAucG9zUHJlLmxlbmd0aCAtIHAucG9zU3VmLmxlbmd0aCxcbiAgICAgICAgICBwb3MgPSBuZWdhdGl2ZS5pbmRleE9mKERJR0lUX0NIQVIpO1xuXG4gICAgcC5uZWdQcmUgPSBuZWdhdGl2ZS5zdWJzdHIoMCwgcG9zKS5yZXBsYWNlKC8nL2csICcnKTtcbiAgICBwLm5lZ1N1ZiA9IG5lZ2F0aXZlLnN1YnN0cihwb3MgKyB0cnVua0xlbikucmVwbGFjZSgvJy9nLCAnJyk7XG4gIH0gZWxzZSB7XG4gICAgcC5uZWdQcmUgPSBtaW51c1NpZ24gKyBwLnBvc1ByZTtcbiAgICBwLm5lZ1N1ZiA9IHAucG9zU3VmO1xuICB9XG5cbiAgcmV0dXJuIHA7XG59XG5cbmludGVyZmFjZSBQYXJzZWROdW1iZXIge1xuICAvLyBhbiBhcnJheSBvZiBkaWdpdHMgY29udGFpbmluZyBsZWFkaW5nIHplcm9zIGFzIG5lY2Vzc2FyeVxuICBkaWdpdHM6IG51bWJlcltdO1xuICAvLyB0aGUgZXhwb25lbnQgZm9yIG51bWJlcnMgdGhhdCB3b3VsZCBuZWVkIG1vcmUgdGhhbiBgTUFYX0RJR0lUU2AgZGlnaXRzIGluIGBkYFxuICBleHBvbmVudDogbnVtYmVyO1xuICAvLyB0aGUgbnVtYmVyIG9mIHRoZSBkaWdpdHMgaW4gYGRgIHRoYXQgYXJlIHRvIHRoZSBsZWZ0IG9mIHRoZSBkZWNpbWFsIHBvaW50XG4gIGludGVnZXJMZW46IG51bWJlcjtcbn1cblxuLy8gVHJhbnNmb3JtcyBhIHBhcnNlZCBudW1iZXIgaW50byBhIHBlcmNlbnRhZ2UgYnkgbXVsdGlwbHlpbmcgaXQgYnkgMTAwXG5mdW5jdGlvbiB0b1BlcmNlbnQocGFyc2VkTnVtYmVyOiBQYXJzZWROdW1iZXIpOiBQYXJzZWROdW1iZXIge1xuICAvLyBpZiB0aGUgbnVtYmVyIGlzIDAsIGRvbid0IGRvIGFueXRoaW5nXG4gIGlmIChwYXJzZWROdW1iZXIuZGlnaXRzWzBdID09PSAwKSB7XG4gICAgcmV0dXJuIHBhcnNlZE51bWJlcjtcbiAgfVxuXG4gIC8vIEdldHRpbmcgdGhlIGN1cnJlbnQgbnVtYmVyIG9mIGRlY2ltYWxzXG4gIGNvbnN0IGZyYWN0aW9uTGVuID0gcGFyc2VkTnVtYmVyLmRpZ2l0cy5sZW5ndGggLSBwYXJzZWROdW1iZXIuaW50ZWdlckxlbjtcbiAgaWYgKHBhcnNlZE51bWJlci5leHBvbmVudCkge1xuICAgIHBhcnNlZE51bWJlci5leHBvbmVudCArPSAyO1xuICB9IGVsc2Uge1xuICAgIGlmIChmcmFjdGlvbkxlbiA9PT0gMCkge1xuICAgICAgcGFyc2VkTnVtYmVyLmRpZ2l0cy5wdXNoKDAsIDApO1xuICAgIH0gZWxzZSBpZiAoZnJhY3Rpb25MZW4gPT09IDEpIHtcbiAgICAgIHBhcnNlZE51bWJlci5kaWdpdHMucHVzaCgwKTtcbiAgICB9XG4gICAgcGFyc2VkTnVtYmVyLmludGVnZXJMZW4gKz0gMjtcbiAgfVxuXG4gIHJldHVybiBwYXJzZWROdW1iZXI7XG59XG5cbi8qKlxuICogUGFyc2VzIGEgbnVtYmVyLlxuICogU2lnbmlmaWNhbnQgYml0cyBvZiB0aGlzIHBhcnNlIGFsZ29yaXRobSBjYW1lIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL01pa2VNY2wvYmlnLmpzL1xuICovXG5mdW5jdGlvbiBwYXJzZU51bWJlcihudW06IG51bWJlcik6IFBhcnNlZE51bWJlciB7XG4gIGxldCBudW1TdHIgPSBNYXRoLmFicyhudW0pICsgJyc7XG4gIGxldCBleHBvbmVudCA9IDAsIGRpZ2l0cywgaW50ZWdlckxlbjtcbiAgbGV0IGksIGosIHplcm9zO1xuXG4gIC8vIERlY2ltYWwgcG9pbnQ/XG4gIGlmICgoaW50ZWdlckxlbiA9IG51bVN0ci5pbmRleE9mKERFQ0lNQUxfU0VQKSkgPiAtMSkge1xuICAgIG51bVN0ciA9IG51bVN0ci5yZXBsYWNlKERFQ0lNQUxfU0VQLCAnJyk7XG4gIH1cblxuICAvLyBFeHBvbmVudGlhbCBmb3JtP1xuICBpZiAoKGkgPSBudW1TdHIuc2VhcmNoKC9lL2kpKSA+IDApIHtcbiAgICAvLyBXb3JrIG91dCB0aGUgZXhwb25lbnQuXG4gICAgaWYgKGludGVnZXJMZW4gPCAwKSBpbnRlZ2VyTGVuID0gaTtcbiAgICBpbnRlZ2VyTGVuICs9ICtudW1TdHIuc2xpY2UoaSArIDEpO1xuICAgIG51bVN0ciA9IG51bVN0ci5zdWJzdHJpbmcoMCwgaSk7XG4gIH0gZWxzZSBpZiAoaW50ZWdlckxlbiA8IDApIHtcbiAgICAvLyBUaGVyZSB3YXMgbm8gZGVjaW1hbCBwb2ludCBvciBleHBvbmVudCBzbyBpdCBpcyBhbiBpbnRlZ2VyLlxuICAgIGludGVnZXJMZW4gPSBudW1TdHIubGVuZ3RoO1xuICB9XG5cbiAgLy8gQ291bnQgdGhlIG51bWJlciBvZiBsZWFkaW5nIHplcm9zLlxuICBmb3IgKGkgPSAwOyBudW1TdHIuY2hhckF0KGkpID09PSBaRVJPX0NIQVI7IGkrKykgeyAvKiBlbXB0eSAqL1xuICB9XG5cbiAgaWYgKGkgPT09ICh6ZXJvcyA9IG51bVN0ci5sZW5ndGgpKSB7XG4gICAgLy8gVGhlIGRpZ2l0cyBhcmUgYWxsIHplcm8uXG4gICAgZGlnaXRzID0gWzBdO1xuICAgIGludGVnZXJMZW4gPSAxO1xuICB9IGVsc2Uge1xuICAgIC8vIENvdW50IHRoZSBudW1iZXIgb2YgdHJhaWxpbmcgemVyb3NcbiAgICB6ZXJvcy0tO1xuICAgIHdoaWxlIChudW1TdHIuY2hhckF0KHplcm9zKSA9PT0gWkVST19DSEFSKSB6ZXJvcy0tO1xuXG4gICAgLy8gVHJhaWxpbmcgemVyb3MgYXJlIGluc2lnbmlmaWNhbnQgc28gaWdub3JlIHRoZW1cbiAgICBpbnRlZ2VyTGVuIC09IGk7XG4gICAgZGlnaXRzID0gW107XG4gICAgLy8gQ29udmVydCBzdHJpbmcgdG8gYXJyYXkgb2YgZGlnaXRzIHdpdGhvdXQgbGVhZGluZy90cmFpbGluZyB6ZXJvcy5cbiAgICBmb3IgKGogPSAwOyBpIDw9IHplcm9zOyBpKyssIGorKykge1xuICAgICAgZGlnaXRzW2pdID0gTnVtYmVyKG51bVN0ci5jaGFyQXQoaSkpO1xuICAgIH1cbiAgfVxuXG4gIC8vIElmIHRoZSBudW1iZXIgb3ZlcmZsb3dzIHRoZSBtYXhpbXVtIGFsbG93ZWQgZGlnaXRzIHRoZW4gdXNlIGFuIGV4cG9uZW50LlxuICBpZiAoaW50ZWdlckxlbiA+IE1BWF9ESUdJVFMpIHtcbiAgICBkaWdpdHMgPSBkaWdpdHMuc3BsaWNlKDAsIE1BWF9ESUdJVFMgLSAxKTtcbiAgICBleHBvbmVudCA9IGludGVnZXJMZW4gLSAxO1xuICAgIGludGVnZXJMZW4gPSAxO1xuICB9XG5cbiAgcmV0dXJuIHtkaWdpdHMsIGV4cG9uZW50LCBpbnRlZ2VyTGVufTtcbn1cblxuLyoqXG4gKiBSb3VuZCB0aGUgcGFyc2VkIG51bWJlciB0byB0aGUgc3BlY2lmaWVkIG51bWJlciBvZiBkZWNpbWFsIHBsYWNlc1xuICogVGhpcyBmdW5jdGlvbiBjaGFuZ2VzIHRoZSBwYXJzZWROdW1iZXIgaW4tcGxhY2VcbiAqL1xuZnVuY3Rpb24gcm91bmROdW1iZXIocGFyc2VkTnVtYmVyOiBQYXJzZWROdW1iZXIsIG1pbkZyYWM6IG51bWJlciwgbWF4RnJhYzogbnVtYmVyKSB7XG4gIGlmIChtaW5GcmFjID4gbWF4RnJhYykge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYFRoZSBtaW5pbXVtIG51bWJlciBvZiBkaWdpdHMgYWZ0ZXIgZnJhY3Rpb24gKCR7bWluRnJhY30pIGlzIGhpZ2hlciB0aGFuIHRoZSBtYXhpbXVtICgke21heEZyYWN9KS5gKTtcbiAgfVxuXG4gIGxldCBkaWdpdHMgPSBwYXJzZWROdW1iZXIuZGlnaXRzO1xuICBsZXQgZnJhY3Rpb25MZW4gPSBkaWdpdHMubGVuZ3RoIC0gcGFyc2VkTnVtYmVyLmludGVnZXJMZW47XG4gIGNvbnN0IGZyYWN0aW9uU2l6ZSA9IE1hdGgubWluKE1hdGgubWF4KG1pbkZyYWMsIGZyYWN0aW9uTGVuKSwgbWF4RnJhYyk7XG5cbiAgLy8gVGhlIGluZGV4IG9mIHRoZSBkaWdpdCB0byB3aGVyZSByb3VuZGluZyBpcyB0byBvY2N1clxuICBsZXQgcm91bmRBdCA9IGZyYWN0aW9uU2l6ZSArIHBhcnNlZE51bWJlci5pbnRlZ2VyTGVuO1xuICBsZXQgZGlnaXQgPSBkaWdpdHNbcm91bmRBdF07XG5cbiAgaWYgKHJvdW5kQXQgPiAwKSB7XG4gICAgLy8gRHJvcCBmcmFjdGlvbmFsIGRpZ2l0cyBiZXlvbmQgYHJvdW5kQXRgXG4gICAgZGlnaXRzLnNwbGljZShNYXRoLm1heChwYXJzZWROdW1iZXIuaW50ZWdlckxlbiwgcm91bmRBdCkpO1xuXG4gICAgLy8gU2V0IG5vbi1mcmFjdGlvbmFsIGRpZ2l0cyBiZXlvbmQgYHJvdW5kQXRgIHRvIDBcbiAgICBmb3IgKGxldCBqID0gcm91bmRBdDsgaiA8IGRpZ2l0cy5sZW5ndGg7IGorKykge1xuICAgICAgZGlnaXRzW2pdID0gMDtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gV2Ugcm91bmRlZCB0byB6ZXJvIHNvIHJlc2V0IHRoZSBwYXJzZWROdW1iZXJcbiAgICBmcmFjdGlvbkxlbiA9IE1hdGgubWF4KDAsIGZyYWN0aW9uTGVuKTtcbiAgICBwYXJzZWROdW1iZXIuaW50ZWdlckxlbiA9IDE7XG4gICAgZGlnaXRzLmxlbmd0aCA9IE1hdGgubWF4KDEsIHJvdW5kQXQgPSBmcmFjdGlvblNpemUgKyAxKTtcbiAgICBkaWdpdHNbMF0gPSAwO1xuICAgIGZvciAobGV0IGkgPSAxOyBpIDwgcm91bmRBdDsgaSsrKSBkaWdpdHNbaV0gPSAwO1xuICB9XG5cbiAgaWYgKGRpZ2l0ID49IDUpIHtcbiAgICBpZiAocm91bmRBdCAtIDEgPCAwKSB7XG4gICAgICBmb3IgKGxldCBrID0gMDsgayA+IHJvdW5kQXQ7IGstLSkge1xuICAgICAgICBkaWdpdHMudW5zaGlmdCgwKTtcbiAgICAgICAgcGFyc2VkTnVtYmVyLmludGVnZXJMZW4rKztcbiAgICAgIH1cbiAgICAgIGRpZ2l0cy51bnNoaWZ0KDEpO1xuICAgICAgcGFyc2VkTnVtYmVyLmludGVnZXJMZW4rKztcbiAgICB9IGVsc2Uge1xuICAgICAgZGlnaXRzW3JvdW5kQXQgLSAxXSsrO1xuICAgIH1cbiAgfVxuXG4gIC8vIFBhZCBvdXQgd2l0aCB6ZXJvcyB0byBnZXQgdGhlIHJlcXVpcmVkIGZyYWN0aW9uIGxlbmd0aFxuICBmb3IgKDsgZnJhY3Rpb25MZW4gPCBNYXRoLm1heCgwLCBmcmFjdGlvblNpemUpOyBmcmFjdGlvbkxlbisrKSBkaWdpdHMucHVzaCgwKTtcblxuICBsZXQgZHJvcFRyYWlsaW5nWmVyb3MgPSBmcmFjdGlvblNpemUgIT09IDA7XG4gIC8vIE1pbmltYWwgbGVuZ3RoID0gbmIgb2YgZGVjaW1hbHMgcmVxdWlyZWQgKyBjdXJyZW50IG5iIG9mIGludGVnZXJzXG4gIC8vIEFueSBudW1iZXIgYmVzaWRlcyB0aGF0IGlzIG9wdGlvbmFsIGFuZCBjYW4gYmUgcmVtb3ZlZCBpZiBpdCdzIGEgdHJhaWxpbmcgMFxuICBjb25zdCBtaW5MZW4gPSBtaW5GcmFjICsgcGFyc2VkTnVtYmVyLmludGVnZXJMZW47XG4gIC8vIERvIGFueSBjYXJyeWluZywgZS5nLiBhIGRpZ2l0IHdhcyByb3VuZGVkIHVwIHRvIDEwXG4gIGNvbnN0IGNhcnJ5ID0gZGlnaXRzLnJlZHVjZVJpZ2h0KGZ1bmN0aW9uKGNhcnJ5LCBkLCBpLCBkaWdpdHMpIHtcbiAgICBkID0gZCArIGNhcnJ5O1xuICAgIGRpZ2l0c1tpXSA9IGQgPCAxMCA/IGQgOiBkIC0gMTA7ICAvLyBkICUgMTBcbiAgICBpZiAoZHJvcFRyYWlsaW5nWmVyb3MpIHtcbiAgICAgIC8vIERvIG5vdCBrZWVwIG1lYW5pbmdsZXNzIGZyYWN0aW9uYWwgdHJhaWxpbmcgemVyb3MgKGUuZy4gMTUuNTIwMDAgLS0+IDE1LjUyKVxuICAgICAgaWYgKGRpZ2l0c1tpXSA9PT0gMCAmJiBpID49IG1pbkxlbikge1xuICAgICAgICBkaWdpdHMucG9wKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkcm9wVHJhaWxpbmdaZXJvcyA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZCA+PSAxMCA/IDEgOiAwOyAgLy8gTWF0aC5mbG9vcihkIC8gMTApO1xuICB9LCAwKTtcbiAgaWYgKGNhcnJ5KSB7XG4gICAgZGlnaXRzLnVuc2hpZnQoY2FycnkpO1xuICAgIHBhcnNlZE51bWJlci5pbnRlZ2VyTGVuKys7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlSW50QXV0b1JhZGl4KHRleHQ6IHN0cmluZyk6IG51bWJlciB7XG4gIGNvbnN0IHJlc3VsdDogbnVtYmVyID0gcGFyc2VJbnQodGV4dCk7XG4gIGlmIChpc05hTihyZXN1bHQpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGludGVnZXIgbGl0ZXJhbCB3aGVuIHBhcnNpbmcgJyArIHRleHQpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG4iXX0=