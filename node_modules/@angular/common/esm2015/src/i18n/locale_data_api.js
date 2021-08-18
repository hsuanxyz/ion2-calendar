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
import localeEn from './locale_en';
import { LOCALE_DATA } from './locale_data';
import { CURRENCIES_EN } from './currencies';
/** @enum {number} */
const NumberFormatStyle = {
    Decimal: 0,
    Percent: 1,
    Currency: 2,
    Scientific: 3,
};
export { NumberFormatStyle };
NumberFormatStyle[NumberFormatStyle.Decimal] = 'Decimal';
NumberFormatStyle[NumberFormatStyle.Percent] = 'Percent';
NumberFormatStyle[NumberFormatStyle.Currency] = 'Currency';
NumberFormatStyle[NumberFormatStyle.Scientific] = 'Scientific';
/** @enum {number} */
const Plural = {
    Zero: 0,
    One: 1,
    Two: 2,
    Few: 3,
    Many: 4,
    Other: 5,
};
export { Plural };
Plural[Plural.Zero] = 'Zero';
Plural[Plural.One] = 'One';
Plural[Plural.Two] = 'Two';
Plural[Plural.Few] = 'Few';
Plural[Plural.Many] = 'Many';
Plural[Plural.Other] = 'Other';
/** @enum {number} */
const FormStyle = {
    Format: 0,
    Standalone: 1,
};
export { FormStyle };
FormStyle[FormStyle.Format] = 'Format';
FormStyle[FormStyle.Standalone] = 'Standalone';
/** @enum {number} */
const TranslationWidth = {
    Narrow: 0,
    Abbreviated: 1,
    Wide: 2,
    Short: 3,
};
export { TranslationWidth };
TranslationWidth[TranslationWidth.Narrow] = 'Narrow';
TranslationWidth[TranslationWidth.Abbreviated] = 'Abbreviated';
TranslationWidth[TranslationWidth.Wide] = 'Wide';
TranslationWidth[TranslationWidth.Short] = 'Short';
/** @enum {number} */
const FormatWidth = {
    Short: 0,
    Medium: 1,
    Long: 2,
    Full: 3,
};
export { FormatWidth };
FormatWidth[FormatWidth.Short] = 'Short';
FormatWidth[FormatWidth.Medium] = 'Medium';
FormatWidth[FormatWidth.Long] = 'Long';
FormatWidth[FormatWidth.Full] = 'Full';
/** @enum {number} */
const NumberSymbol = {
    Decimal: 0,
    Group: 1,
    List: 2,
    PercentSign: 3,
    PlusSign: 4,
    MinusSign: 5,
    Exponential: 6,
    SuperscriptingExponent: 7,
    PerMille: 8,
    Infinity: 9,
    NaN: 10,
    TimeSeparator: 11,
    CurrencyDecimal: 12,
    CurrencyGroup: 13,
};
export { NumberSymbol };
NumberSymbol[NumberSymbol.Decimal] = 'Decimal';
NumberSymbol[NumberSymbol.Group] = 'Group';
NumberSymbol[NumberSymbol.List] = 'List';
NumberSymbol[NumberSymbol.PercentSign] = 'PercentSign';
NumberSymbol[NumberSymbol.PlusSign] = 'PlusSign';
NumberSymbol[NumberSymbol.MinusSign] = 'MinusSign';
NumberSymbol[NumberSymbol.Exponential] = 'Exponential';
NumberSymbol[NumberSymbol.SuperscriptingExponent] = 'SuperscriptingExponent';
NumberSymbol[NumberSymbol.PerMille] = 'PerMille';
NumberSymbol[NumberSymbol.Infinity] = 'Infinity';
NumberSymbol[NumberSymbol.NaN] = 'NaN';
NumberSymbol[NumberSymbol.TimeSeparator] = 'TimeSeparator';
NumberSymbol[NumberSymbol.CurrencyDecimal] = 'CurrencyDecimal';
NumberSymbol[NumberSymbol.CurrencyGroup] = 'CurrencyGroup';
/** @enum {number} */
const WeekDay = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
};
export { WeekDay };
WeekDay[WeekDay.Sunday] = 'Sunday';
WeekDay[WeekDay.Monday] = 'Monday';
WeekDay[WeekDay.Tuesday] = 'Tuesday';
WeekDay[WeekDay.Wednesday] = 'Wednesday';
WeekDay[WeekDay.Thursday] = 'Thursday';
WeekDay[WeekDay.Friday] = 'Friday';
WeekDay[WeekDay.Saturday] = 'Saturday';
/**
 * The locale id for the chosen locale (e.g `en-GB`).
 *
 * \@publicApi
 * @param {?} locale
 * @return {?}
 */
export function getLocaleId(locale) {
    return findLocaleData(locale)[0 /* LocaleId */];
}
/**
 * Periods of the day (e.g. `[AM, PM]` for en-US).
 *
 * \@publicApi
 * @param {?} locale
 * @param {?} formStyle
 * @param {?} width
 * @return {?}
 */
export function getLocaleDayPeriods(locale, formStyle, width) {
    /** @type {?} */
    const data = findLocaleData(locale);
    /** @type {?} */
    const amPmData = (/** @type {?} */ ([data[1 /* DayPeriodsFormat */], data[2 /* DayPeriodsStandalone */]]));
    /** @type {?} */
    const amPm = getLastDefinedValue(amPmData, formStyle);
    return getLastDefinedValue(amPm, width);
}
/**
 * Days of the week for the Gregorian calendar (e.g. `[Sunday, Monday, ... Saturday]` for en-US).
 *
 * \@publicApi
 * @param {?} locale
 * @param {?} formStyle
 * @param {?} width
 * @return {?}
 */
export function getLocaleDayNames(locale, formStyle, width) {
    /** @type {?} */
    const data = findLocaleData(locale);
    /** @type {?} */
    const daysData = (/** @type {?} */ ([data[3 /* DaysFormat */], data[4 /* DaysStandalone */]]));
    /** @type {?} */
    const days = getLastDefinedValue(daysData, formStyle);
    return getLastDefinedValue(days, width);
}
/**
 * Months of the year for the Gregorian calendar (e.g. `[January, February, ...]` for en-US).
 *
 * \@publicApi
 * @param {?} locale
 * @param {?} formStyle
 * @param {?} width
 * @return {?}
 */
export function getLocaleMonthNames(locale, formStyle, width) {
    /** @type {?} */
    const data = findLocaleData(locale);
    /** @type {?} */
    const monthsData = (/** @type {?} */ ([data[5 /* MonthsFormat */], data[6 /* MonthsStandalone */]]));
    /** @type {?} */
    const months = getLastDefinedValue(monthsData, formStyle);
    return getLastDefinedValue(months, width);
}
/**
 * Eras for the Gregorian calendar (e.g. AD/BC).
 *
 * \@publicApi
 * @param {?} locale
 * @param {?} width
 * @return {?}
 */
export function getLocaleEraNames(locale, width) {
    /** @type {?} */
    const data = findLocaleData(locale);
    /** @type {?} */
    const erasData = (/** @type {?} */ (data[7 /* Eras */]));
    return getLastDefinedValue(erasData, width);
}
/**
 * First day of the week for this locale, based on english days (Sunday = 0, Monday = 1, ...).
 * For example in french the value would be 1 because the first day of the week is Monday.
 *
 * \@publicApi
 * @param {?} locale
 * @return {?}
 */
export function getLocaleFirstDayOfWeek(locale) {
    /** @type {?} */
    const data = findLocaleData(locale);
    return data[8 /* FirstDayOfWeek */];
}
/**
 * Range of days in the week that represent the week-end for this locale, based on english days
 * (Sunday = 0, Monday = 1, ...).
 * For example in english the value would be [6,0] for Saturday to Sunday.
 *
 * \@publicApi
 * @param {?} locale
 * @return {?}
 */
export function getLocaleWeekEndRange(locale) {
    /** @type {?} */
    const data = findLocaleData(locale);
    return data[9 /* WeekendRange */];
}
/**
 * Date format that depends on the locale.
 *
 * There are four basic date formats:
 * - `full` should contain long-weekday (EEEE), year (y), long-month (MMMM), day (d).
 *
 *  For example, English uses `EEEE, MMMM d, y`, corresponding to a date like
 *  "Tuesday, September 14, 1999".
 *
 * - `long` should contain year, long-month, day.
 *
 *  For example, `MMMM d, y`, corresponding to a date like "September 14, 1999".
 *
 * - `medium` should contain year, abbreviated-month (MMM), day.
 *
 *  For example, `MMM d, y`, corresponding to a date like "Sep 14, 1999".
 *  For languages that do not use abbreviated months, use the numeric month (MM/M). For example,
 *  `y/MM/dd`, corresponding to a date like "1999/09/14".
 *
 * - `short` should contain year, numeric-month (MM/M), and day.
 *
 *  For example, `M/d/yy`, corresponding to a date like "9/14/99".
 *
 * \@publicApi
 * @param {?} locale
 * @param {?} width
 * @return {?}
 */
export function getLocaleDateFormat(locale, width) {
    /** @type {?} */
    const data = findLocaleData(locale);
    return getLastDefinedValue(data[10 /* DateFormat */], width);
}
/**
 * Time format that depends on the locale.
 *
 * The standard formats include four basic time formats:
 * - `full` should contain hour (h/H), minute (mm), second (ss), and zone (zzzz).
 * - `long` should contain hour, minute, second, and zone (z)
 * - `medium` should contain hour, minute, second.
 * - `short` should contain hour, minute.
 *
 * Note: The patterns depend on whether the main country using your language uses 12-hour time or
 * not:
 * - For 12-hour time, use a pattern like `hh:mm a` using h to mean a 12-hour clock cycle running
 * 1 through 12 (midnight plus 1 minute is 12:01), or using K to mean a 12-hour clock cycle
 * running 0 through 11 (midnight plus 1 minute is 0:01).
 * - For 24-hour time, use a pattern like `HH:mm` using H to mean a 24-hour clock cycle running 0
 * through 23 (midnight plus 1 minute is 0:01), or using k to mean a 24-hour clock cycle running
 * 1 through 24 (midnight plus 1 minute is 24:01).
 *
 * \@publicApi
 * @param {?} locale
 * @param {?} width
 * @return {?}
 */
export function getLocaleTimeFormat(locale, width) {
    /** @type {?} */
    const data = findLocaleData(locale);
    return getLastDefinedValue(data[11 /* TimeFormat */], width);
}
/**
 * Date-time format that depends on the locale.
 *
 * The date-time pattern shows how to combine separate patterns for date (represented by {1})
 * and time (represented by {0}) into a single pattern. It usually doesn't need to be changed.
 * What you want to pay attention to are:
 * - possibly removing a space for languages that don't use it, such as many East Asian languages
 * - possibly adding a comma, other punctuation, or a combining word
 *
 * For example:
 * - English uses `{1} 'at' {0}` or `{1}, {0}` (depending on date style), while Japanese uses
 *  `{1}{0}`.
 * - An English formatted date-time using the combining pattern `{1}, {0}` could be
 *  `Dec 10, 2010, 3:59:49 PM`. Notice the comma and space between the date portion and the time
 *  portion.
 *
 * There are four formats (`full`, `long`, `medium`, `short`); the determination of which to use
 * is normally based on the date style. For example, if the date has a full month and weekday
 * name, the full combining pattern will be used to combine that with a time. If the date has
 * numeric month, the short version of the combining pattern will be used to combine that with a
 * time. English uses `{1} 'at' {0}` for full and long styles, and `{1}, {0}` for medium and short
 * styles.
 *
 * \@publicApi
 * @param {?} locale
 * @param {?} width
 * @return {?}
 */
export function getLocaleDateTimeFormat(locale, width) {
    /** @type {?} */
    const data = findLocaleData(locale);
    /** @type {?} */
    const dateTimeFormatData = (/** @type {?} */ (data[12 /* DateTimeFormat */]));
    return getLastDefinedValue(dateTimeFormatData, width);
}
/**
 * Number symbol that can be used to replace placeholders in number formats.
 * See {\@link NumberSymbol} for more information.
 *
 * \@publicApi
 * @param {?} locale
 * @param {?} symbol
 * @return {?}
 */
export function getLocaleNumberSymbol(locale, symbol) {
    /** @type {?} */
    const data = findLocaleData(locale);
    /** @type {?} */
    const res = data[13 /* NumberSymbols */][symbol];
    if (typeof res === 'undefined') {
        if (symbol === NumberSymbol.CurrencyDecimal) {
            return data[13 /* NumberSymbols */][NumberSymbol.Decimal];
        }
        else if (symbol === NumberSymbol.CurrencyGroup) {
            return data[13 /* NumberSymbols */][NumberSymbol.Group];
        }
    }
    return res;
}
/**
 * Number format that depends on the locale.
 *
 * Numbers are formatted using patterns, like `#,###.00`. For example, the pattern `#,###.00`
 * when used to format the number 12345.678 could result in "12'345,67". That would happen if the
 * grouping separator for your language is an apostrophe, and the decimal separator is a comma.
 *
 * <b>Important:</b> The characters `.` `,` `0` `#` (and others below) are special placeholders;
 * they stand for the decimal separator, and so on, and are NOT real characters.
 * You must NOT "translate" the placeholders; for example, don't change `.` to `,` even though in
 * your language the decimal point is written with a comma. The symbols should be replaced by the
 * local equivalents, using the Number Symbols for your language.
 *
 * Here are the special characters used in number patterns:
 *
 * | Symbol | Meaning |
 * |--------|---------|
 * | . | Replaced automatically by the character used for the decimal point. |
 * | , | Replaced by the "grouping" (thousands) separator. |
 * | 0 | Replaced by a digit (or zero if there aren't enough digits). |
 * | # | Replaced by a digit (or nothing if there aren't enough). |
 * | ¤ | This will be replaced by a currency symbol, such as $ or USD. |
 * | % | This marks a percent format. The % symbol may change position, but must be retained. |
 * | E | This marks a scientific format. The E symbol may change position, but must be retained. |
 * | ' | Special characters used as literal characters are quoted with ASCII single quotes. |
 *
 * You can find more information
 * [on the CLDR website](http://cldr.unicode.org/translation/number-patterns)
 *
 * \@publicApi
 * @param {?} locale
 * @param {?} type
 * @return {?}
 */
export function getLocaleNumberFormat(locale, type) {
    /** @type {?} */
    const data = findLocaleData(locale);
    return data[14 /* NumberFormats */][type];
}
/**
 * The symbol used to represent the currency for the main country using this locale (e.g. $ for
 * the locale en-US).
 * The symbol will be `null` if the main country cannot be determined.
 *
 * \@publicApi
 * @param {?} locale
 * @return {?}
 */
export function getLocaleCurrencySymbol(locale) {
    /** @type {?} */
    const data = findLocaleData(locale);
    return data[15 /* CurrencySymbol */] || null;
}
/**
 * The name of the currency for the main country using this locale (e.g. 'US Dollar' for the locale
 * en-US).
 * The name will be `null` if the main country cannot be determined.
 *
 * \@publicApi
 * @param {?} locale
 * @return {?}
 */
export function getLocaleCurrencyName(locale) {
    /** @type {?} */
    const data = findLocaleData(locale);
    return data[16 /* CurrencyName */] || null;
}
/**
 * Returns the currency values for the locale
 * @param {?} locale
 * @return {?}
 */
function getLocaleCurrencies(locale) {
    /** @type {?} */
    const data = findLocaleData(locale);
    return data[17 /* Currencies */];
}
/**
 * The locale plural function used by ICU expressions to determine the plural case to use.
 * See {\@link NgPlural} for more information.
 *
 * \@publicApi
 * @param {?} locale
 * @return {?}
 */
export function getLocalePluralCase(locale) {
    /** @type {?} */
    const data = findLocaleData(locale);
    return data[18 /* PluralCase */];
}
/**
 * @param {?} data
 * @return {?}
 */
function checkFullData(data) {
    if (!data[19 /* ExtraData */]) {
        throw new Error(`Missing extra locale data for the locale "${data[0 /* LocaleId */]}". Use "registerLocaleData" to load new data. See the "I18n guide" on angular.io to know more.`);
    }
}
/**
 * Rules used to determine which day period to use (See `dayPeriods` below).
 * The rules can either be an array or a single value. If it's an array, consider it as "from"
 * and "to". If it's a single value then it means that the period is only valid at this exact
 * value.
 * There is always the same number of rules as the number of day periods, which means that the
 * first rule is applied to the first day period and so on.
 * You should fallback to AM/PM when there are no rules available.
 *
 * Note: this is only available if you load the full locale data.
 * See the ["I18n guide"](guide/i18n#i18n-pipes) to know how to import additional locale
 * data.
 *
 * \@publicApi
 * @param {?} locale
 * @return {?}
 */
export function getLocaleExtraDayPeriodRules(locale) {
    /** @type {?} */
    const data = findLocaleData(locale);
    checkFullData(data);
    /** @type {?} */
    const rules = data[19 /* ExtraData */][2 /* ExtraDayPeriodsRules */] || [];
    return rules.map((rule) => {
        if (typeof rule === 'string') {
            return extractTime(rule);
        }
        return [extractTime(rule[0]), extractTime(rule[1])];
    });
}
/**
 * Day Periods indicate roughly how the day is broken up in different languages (e.g. morning,
 * noon, afternoon, midnight, ...).
 * You should use the function {\@link getLocaleExtraDayPeriodRules} to determine which period to
 * use.
 * You should fallback to AM/PM when there are no day periods available.
 *
 * Note: this is only available if you load the full locale data.
 * See the ["I18n guide"](guide/i18n#i18n-pipes) to know how to import additional locale
 * data.
 *
 * \@publicApi
 * @param {?} locale
 * @param {?} formStyle
 * @param {?} width
 * @return {?}
 */
export function getLocaleExtraDayPeriods(locale, formStyle, width) {
    /** @type {?} */
    const data = findLocaleData(locale);
    checkFullData(data);
    /** @type {?} */
    const dayPeriodsData = (/** @type {?} */ ([
        data[19 /* ExtraData */][0 /* ExtraDayPeriodFormats */],
        data[19 /* ExtraData */][1 /* ExtraDayPeriodStandalone */]
    ]));
    /** @type {?} */
    const dayPeriods = getLastDefinedValue(dayPeriodsData, formStyle) || [];
    return getLastDefinedValue(dayPeriods, width) || [];
}
/**
 * Returns the first value that is defined in an array, going backwards.
 *
 * To avoid repeating the same data (e.g. when "format" and "standalone" are the same) we only
 * add the first one to the locale data arrays, the other ones are only defined when different.
 * We use this function to retrieve the first defined value.
 *
 * \@publicApi
 * @template T
 * @param {?} data
 * @param {?} index
 * @return {?}
 */
function getLastDefinedValue(data, index) {
    for (let i = index; i > -1; i--) {
        if (typeof data[i] !== 'undefined') {
            return data[i];
        }
    }
    throw new Error('Locale data API: locale data undefined');
}
/**
 * Extract the hours and minutes from a string like "15:45"
 * @param {?} time
 * @return {?}
 */
function extractTime(time) {
    const [h, m] = time.split(':');
    return { hours: +h, minutes: +m };
}
/**
 * Finds the locale data for a locale id
 *
 * \@publicApi
 * @param {?} locale
 * @return {?}
 */
export function findLocaleData(locale) {
    /** @type {?} */
    const normalizedLocale = locale.toLowerCase().replace(/_/g, '-');
    /** @type {?} */
    let match = LOCALE_DATA[normalizedLocale];
    if (match) {
        return match;
    }
    // let's try to find a parent locale
    /** @type {?} */
    const parentLocale = normalizedLocale.split('-')[0];
    match = LOCALE_DATA[parentLocale];
    if (match) {
        return match;
    }
    if (parentLocale === 'en') {
        return localeEn;
    }
    throw new Error(`Missing locale data for the locale "${locale}".`);
}
/**
 * Returns the currency symbol for a given currency code, or the code if no symbol available
 * (e.g.: format narrow = $, format wide = US$, code = USD)
 * If no locale is provided, it uses the locale "en" by default
 *
 * \@publicApi
 * @param {?} code
 * @param {?} format
 * @param {?=} locale
 * @return {?}
 */
export function getCurrencySymbol(code, format, locale = 'en') {
    /** @type {?} */
    const currency = getLocaleCurrencies(locale)[code] || CURRENCIES_EN[code] || [];
    /** @type {?} */
    const symbolNarrow = currency[1 /* SymbolNarrow */];
    if (format === 'narrow' && typeof symbolNarrow === 'string') {
        return symbolNarrow;
    }
    return currency[0 /* Symbol */] || code;
}
// Most currencies have cents, that's why the default is 2
/** @type {?} */
const DEFAULT_NB_OF_CURRENCY_DIGITS = 2;
/**
 * Returns the number of decimal digits for the given currency.
 * Its value depends upon the presence of cents in that particular currency.
 *
 * \@publicApi
 * @param {?} code
 * @return {?}
 */
export function getNumberOfCurrencyDigits(code) {
    /** @type {?} */
    let digits;
    /** @type {?} */
    const currency = CURRENCIES_EN[code];
    if (currency) {
        digits = currency[2 /* NbOfDigits */];
    }
    return typeof digits === 'number' ? digits : DEFAULT_NB_OF_CURRENCY_DIGITS;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxlX2RhdGFfYXBpLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLyIsInNvdXJjZXMiOlsicGFja2FnZXMvY29tbW9uL3NyYy9pMThuL2xvY2FsZV9kYXRhX2FwaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVFBLE9BQU8sUUFBUSxNQUFNLGFBQWEsQ0FBQztBQUNuQyxPQUFPLEVBQUMsV0FBVyxFQUF1RCxNQUFNLGVBQWUsQ0FBQztBQUNoRyxPQUFPLEVBQUMsYUFBYSxFQUFvQixNQUFNLGNBQWMsQ0FBQzs7O0lBUzVELFVBQU87SUFDUCxVQUFPO0lBQ1AsV0FBUTtJQUNSLGFBQVU7Ozs7Ozs7OztJQUtWLE9BQVE7SUFDUixNQUFPO0lBQ1AsTUFBTztJQUNQLE1BQU87SUFDUCxPQUFRO0lBQ1IsUUFBUzs7Ozs7Ozs7Ozs7SUFhVCxTQUFNO0lBQ04sYUFBVTs7Ozs7OztJQWdCVixTQUFNO0lBQ04sY0FBVztJQUNYLE9BQUk7SUFDSixRQUFLOzs7Ozs7Ozs7SUFpQkwsUUFBSztJQUNMLFNBQU07SUFDTixPQUFJO0lBQ0osT0FBSTs7Ozs7Ozs7O0lBMEJKLFVBQU87SUFDUCxRQUFLO0lBQ0wsT0FBSTtJQUNKLGNBQVc7SUFDWCxXQUFRO0lBQ1IsWUFBUztJQUNULGNBQVc7SUFDWCx5QkFBc0I7SUFDdEIsV0FBUTtJQUNSLFdBQVE7SUFDUixPQUFHO0lBQ0gsaUJBQWE7SUFDYixtQkFBZTtJQUNmLGlCQUFhOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBU2IsU0FBVTtJQUNWLFNBQU07SUFDTixVQUFPO0lBQ1AsWUFBUztJQUNULFdBQVE7SUFDUixTQUFNO0lBQ04sV0FBUTs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFRVixNQUFNLFVBQVUsV0FBVyxDQUFDLE1BQWM7SUFDeEMsT0FBTyxjQUFjLENBQUMsTUFBTSxDQUFDLGtCQUEwQixDQUFDO0FBQzFELENBQUM7Ozs7Ozs7Ozs7QUFPRCxNQUFNLFVBQVUsbUJBQW1CLENBQy9CLE1BQWMsRUFBRSxTQUFv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T0FBTyxLQUFLLENBQUM7S0FDZDtJQUVELElBQUksWUFBWSxLQUFLLElBQUksRUFBRTtRQUN6QixPQUFPLFFBQVEsQ0FBQztLQUNqQjtJQUVELE1BQU0sSUFBSSxLQUFLLENBQUMsdUNBQXVDLE1BQU0sSUFBSSxDQUFDLENBQUM7QUFDckUsQ0FBQzs7Ozs7Ozs7Ozs7O0FBU0QsTUFBTSxVQUFVLGlCQUFpQixDQUFDLElBQVksRUFBRSxNQUF5QixFQUFFLE1BQU0sR0FBRyxJQUFJOztVQUNoRixRQUFRLEdBQUcsbUJBQW1CLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUU7O1VBQ3pFLFlBQVksR0FBRyxRQUFRLHNCQUE0QjtJQUV6RCxJQUFJLE1BQU0sS0FBSyxRQUFRLElBQUksT0FBTyxZQUFZLEtBQUssUUFBUSxFQUFFO1FBQzNELE9BQU8sWUFBWSxDQUFDO0tBQ3JCO0lBRUQsT0FBTyxRQUFRLGdCQUFzQixJQUFJLElBQUksQ0FBQztBQUNoRCxDQUFDOzs7TUFHSyw2QkFBNkIsR0FBRyxDQUFDOzs7Ozs7Ozs7QUFRdkMsTUFBTSxVQUFVLHlCQUF5QixDQUFDLElBQVk7O1FBQ2hELE1BQU07O1VBQ0osUUFBUSxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUM7SUFDcEMsSUFBSSxRQUFRLEVBQUU7UUFDWixNQUFNLEdBQUcsUUFBUSxvQkFBMEIsQ0FBQztLQUM3QztJQUNELE9BQU8sT0FBTyxNQUFNLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLDZCQUE2QixDQUFDO0FBQzdFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCBsb2NhbGVFbiBmcm9tICcuL2xvY2FsZV9lbic7XG5pbXBvcnQge0xPQ0FMRV9EQVRBLCBMb2NhbGVEYXRhSW5kZXgsIEV4dHJhTG9jYWxlRGF0YUluZGV4LCBDdXJyZW5jeUluZGV4fSBmcm9tICcuL2xvY2FsZV9kYXRhJztcbmltcG9ydCB7Q1VSUkVOQ0lFU19FTiwgQ3VycmVuY2llc1N5bWJvbHN9IGZyb20gJy4vY3VycmVuY2llcyc7XG5cbi8qKlxuICogVGhlIGRpZmZlcmVudCBmb3JtYXQgc3R5bGVzIHRoYXQgY2FuIGJlIHVzZWQgdG8gcmVwcmVzZW50IG51bWJlcnMuXG4gKiBVc2VkIGJ5IHRoZSBmdW5jdGlvbiB7QGxpbmsgZ2V0TG9jYWxlTnVtYmVyRm9ybWF0fS5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBlbnVtIE51bWJlckZvcm1hdFN0eWxlIHtcbiAgRGVjaW1hbCxcbiAgUGVyY2VudCxcbiAgQ3VycmVuY3ksXG4gIFNjaWVudGlmaWNcbn1cblxuLyoqIEBwdWJsaWNBcGkgKi9cbmV4cG9ydCBlbnVtIFBsdXJhbCB7XG4gIFplcm8gPSAwLFxuICBPbmUgPSAxLFxuICBUd28gPSAyLFxuICBGZXcgPSAzLFxuICBNYW55ID0gNCxcbiAgT3RoZXIgPSA1LFxufVxuXG4vKipcbiAqIFNvbWUgbGFuZ3VhZ2VzIHVzZSB0d28gZGlmZmVyZW50IGZvcm1zIG9mIHN0cmluZ3MgKHN0YW5kYWxvbmUgYW5kIGZvcm1hdCkgZGVwZW5kaW5nIG9uIHRoZVxuICogY29udGV4dC5cbiAqIFR5cGljYWxseSB0aGUgc3RhbmRhbG9uZSB2ZXJzaW9uIGlzIHRoZSBub21pbmF0aXZlIGZvcm0gb2YgdGhlIHdvcmQsIGFuZCB0aGUgZm9ybWF0IHZlcnNpb24gaXMgaW5cbiAqIHRoZSBnZW5pdGl2ZS5cbiAqIFNlZSBbdGhlIENMRFIgd2Vic2l0ZV0oaHR0cDovL2NsZHIudW5pY29kZS5vcmcvdHJhbnNsYXRpb24vZGF0ZS10aW1lKSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBlbnVtIEZvcm1TdHlsZSB7XG4gIEZvcm1hdCxcbiAgU3RhbmRhbG9uZVxufVxuXG4vKipcbiAqIE11bHRpcGxlIHdpZHRocyBhcmUgYXZhaWxhYmxlIGZvciB0cmFuc2xhdGlvbnM6IG5hcnJvdyAoMSBjaGFyYWN0ZXIpLCBhYmJyZXZpYXRlZCAoMyBjaGFyYWN0ZXJzKSxcbiAqIHdpZGUgKGZ1bGwgbGVuZ3RoKSwgYW5kIHNob3J0ICgyIGNoYXJhY3RlcnMsIG9ubHkgZm9yIGRheXMpLlxuICpcbiAqIEZvciBleGFtcGxlIHRoZSBkYXkgYFN1bmRheWAgd2lsbCBiZTpcbiAqIC0gTmFycm93OiBgU2BcbiAqIC0gU2hvcnQ6IGBTdWBcbiAqIC0gQWJicmV2aWF0ZWQ6IGBTdW5gXG4gKiAtIFdpZGU6IGBTdW5kYXlgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZW51bSBUcmFuc2xhdGlvbldpZHRoIHtcbiAgTmFycm93LFxuICBBYmJyZXZpYXRlZCxcbiAgV2lkZSxcbiAgU2hvcnRcbn1cblxuLyoqXG4gKiBNdWx0aXBsZSB3aWR0aHMgYXJlIGF2YWlsYWJsZSBmb3IgZm9ybWF0czogc2hvcnQgKG1pbmltYWwgYW1vdW50IG9mIGRhdGEpLCBtZWRpdW0gKHNtYWxsIGFtb3VudFxuICogb2YgZGF0YSksIGxvbmcgKGNvbXBsZXRlIGFtb3VudCBvZiBkYXRhKSwgZnVsbCAoY29tcGxldGUgYW1vdW50IG9mIGRhdGEgYW5kIGV4dHJhIGluZm9ybWF0aW9uKS5cbiAqXG4gKiBGb3IgZXhhbXBsZSB0aGUgZGF0ZS10aW1lIGZvcm1hdHMgZm9yIHRoZSBlbmdsaXNoIGxvY2FsZSB3aWxsIGJlOlxuICogIC0gYCdzaG9ydCdgOiBgJ00vZC95eSwgaDptbSBhJ2AgKGUuZy4gYDYvMTUvMTUsIDk6MDMgQU1gKVxuICogIC0gYCdtZWRpdW0nYDogYCdNTU0gZCwgeSwgaDptbTpzcyBhJ2AgKGUuZy4gYEp1biAxNSwgMjAxNSwgOTowMzowMSBBTWApXG4gKiAgLSBgJ2xvbmcnYDogYCdNTU1NIGQsIHksIGg6bW06c3MgYSB6J2AgKGUuZy4gYEp1bmUgMTUsIDIwMTUgYXQgOTowMzowMSBBTSBHTVQrMWApXG4gKiAgLSBgJ2Z1bGwnYDogYCdFRUVFLCBNTU1NIGQsIHksIGg6bW06c3MgYSB6enp6J2AgKGUuZy4gYE1vbmRheSwgSnVuZSAxNSwgMjAxNSBhdFxuICogOTowMzowMSBBTSBHTVQrMDE6MDBgKVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGVudW0gRm9ybWF0V2lkdGgge1xuICBTaG9ydCxcbiAgTWVkaXVtLFxuICBMb25nLFxuICBGdWxsXG59XG5cbi8qKlxuICogTnVtYmVyIHN5bWJvbCB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlcGxhY2UgcGxhY2Vob2xkZXJzIGluIG51bWJlciBwYXR0ZXJucy5cbiAqIFRoZSBwbGFjZWhvbGRlcnMgYXJlIGJhc2VkIG9uIGVuZ2xpc2ggdmFsdWVzOlxuICpcbiAqIHwgTmFtZSAgICAgICAgICAgICAgICAgICB8IEV4YW1wbGUgZm9yIGVuLVVTIHwgTWVhbmluZyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiB8LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tfC0tLS0tLS0tLS0tLS0tLS0tLS18LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tfFxuICogfCBkZWNpbWFsICAgICAgICAgICAgICAgIHwgMiwzNDVgLmA2NyAgICAgICAgfCBkZWNpbWFsIHNlcGFyYXRvciAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqIHwgZ3JvdXAgICAgICAgICAgICAgICAgICB8IDJgLGAzNDUuNjcgICAgICAgIHwgZ3JvdXBpbmcgc2VwYXJhdG9yLCB0eXBpY2FsbHkgZm9yIHRob3VzYW5kcyB8XG4gKiB8IHBsdXNTaWduICAgICAgICAgICAgICAgfCBgK2AyMyAgICAgICAgICAgICB8IHRoZSBwbHVzIHNpZ24gdXNlZCB3aXRoIG51bWJlcnMgICAgICAgICAgICAgfFxuICogfCBtaW51c1NpZ24gICAgICAgICAgICAgIHwgYC1gMjMgICAgICAgICAgICAgfCB0aGUgbWludXMgc2lnbiB1c2VkIHdpdGggbnVtYmVycyAgICAgICAgICAgIHxcbiAqIHwgcGVyY2VudFNpZ24gICAgICAgICAgICB8IDIzLjRgJWAgICAgICAgICAgIHwgdGhlIHBlcmNlbnQgc2lnbiAob3V0IG9mIDEwMCkgICAgICAgICAgICAgICB8XG4gKiB8IHBlck1pbGxlICAgICAgICAgICAgICAgfCAyMzRg4oCwYCAgICAgICAgICAgIHwgdGhlIHBlcm1pbGxlIHNpZ24gKG91dCBvZiAxMDAwKSAgICAgICAgICAgICB8XG4gKiB8IGV4cG9uZW50aWFsICAgICAgICAgICAgfCAxLjJgRWAzICAgICAgICAgICB8IHVzZWQgaW4gY29tcHV0ZXJzIGZvciAxLjLDlzEwwrMuICAgICAgICAgICAgICB8XG4gKiB8IHN1cGVyc2NyaXB0aW5nRXhwb25lbnQgfCAxLjJgw5dgMTAzICAgICAgICAgfCBodW1hbi1yZWFkYWJsZSBmb3JtYXQgb2YgZXhwb25lbnRpYWwgICAgICAgIHxcbiAqIHwgaW5maW5pdHkgICAgICAgICAgICAgICB8IGDiiJ5gICAgICAgICAgICAgICAgfCB1c2VkIGluICviiJ4gYW5kIC3iiJ4uICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiB8IG5hbiAgICAgICAgICAgICAgICAgICAgfCBgTmFOYCAgICAgICAgICAgICB8IFwibm90IGEgbnVtYmVyXCIuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiB8IHRpbWVTZXBhcmF0b3IgICAgICAgICAgfCAxMGA6YDUyICAgICAgICAgICB8IHN5bWJvbCB1c2VkIGJldHdlZW4gdGltZSB1bml0cyAgICAgICAgICAgICAgfFxuICogfCBjdXJyZW5jeURlY2ltYWwgICAgICAgIHwgJDIsMzQ1YC5gNjcgICAgICAgfCBkZWNpbWFsIHNlcGFyYXRvciwgZmFsbGJhY2sgdG8gXCJkZWNpbWFsXCIgICAgfFxuICogfCBjdXJyZW5jeUdyb3VwICAgICAgICAgIHwgJDJgLGAzNDUuNjcgICAgICAgfCBncm91cGluZyBzZXBhcmF0b3IsIGZhbGxiYWNrIHRvIFwiZ3JvdXBcIiAgICAgfFxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGVudW0gTnVtYmVyU3ltYm9sIHtcbiAgRGVjaW1hbCxcbiAgR3JvdXAsXG4gIExpc3QsXG4gIFBlcmNlbnRTaWduLFxuICBQbHVzU2lnbixcbiAgTWludXNTaWduLFxuICBFeHBvbmVudGlhbCxcbiAgU3VwZXJzY3JpcHRpbmdFeHBvbmVudCxcbiAgUGVyTWlsbGUsXG4gIEluZmluaXR5LFxuICBOYU4sXG4gIFRpbWVTZXBhcmF0b3IsXG4gIEN1cnJlbmN5RGVjaW1hbCxcbiAgQ3VycmVuY3lHcm91cFxufVxuXG4vKipcbiAqIFRoZSB2YWx1ZSBmb3IgZWFjaCBkYXkgb2YgdGhlIHdlZWssIGJhc2VkIG9uIHRoZSBlbi1VUyBsb2NhbGVcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBlbnVtIFdlZWtEYXkge1xuICBTdW5kYXkgPSAwLFxuICBNb25kYXksXG4gIFR1ZXNkYXksXG4gIFdlZG5lc2RheSxcbiAgVGh1cnNkYXksXG4gIEZyaWRheSxcbiAgU2F0dXJkYXlcbn1cblxuLyoqXG4gKiBUaGUgbG9jYWxlIGlkIGZvciB0aGUgY2hvc2VuIGxvY2FsZSAoZS5nIGBlbi1HQmApLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZUlkKGxvY2FsZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGZpbmRMb2NhbGVEYXRhKGxvY2FsZSlbTG9jYWxlRGF0YUluZGV4LkxvY2FsZUlkXTtcbn1cblxuLyoqXG4gKiBQZXJpb2RzIG9mIHRoZSBkYXkgKGUuZy4gYFtBTSwgUE1dYCBmb3IgZW4tVVMpLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZURheVBlcmlvZHMoXG4gICAgbG9jYWxlOiBzdHJpbmcsIGZvcm1TdHlsZTogRm9ybVN0eWxlLCB3aWR0aDogVHJhbnNsYXRpb25XaWR0aCk6IFtzdHJpbmcsIHN0cmluZ10ge1xuICBjb25zdCBkYXRhID0gZmluZExvY2FsZURhdGEobG9jYWxlKTtcbiAgY29uc3QgYW1QbURhdGEgPSA8W1xuICAgIHN0cmluZywgc3RyaW5nXG4gIF1bXVtdPltkYXRhW0xvY2FsZURhdGFJbmRleC5EYXlQZXJpb2RzRm9ybWF0XSwgZGF0YVtMb2NhbGVEYXRhSW5kZXguRGF5UGVyaW9kc1N0YW5kYWxvbmVdXTtcbiAgY29uc3QgYW1QbSA9IGdldExhc3REZWZpbmVkVmFsdWUoYW1QbURhdGEsIGZvcm1TdHlsZSk7XG4gIHJldHVybiBnZXRMYXN0RGVmaW5lZFZhbHVlKGFtUG0sIHdpZHRoKTtcbn1cblxuLyoqXG4gKiBEYXlzIG9mIHRoZSB3ZWVrIGZvciB0aGUgR3JlZ29yaWFuIGNhbGVuZGFyIChlLmcuIGBbU3VuZGF5LCBNb25kYXksIC4uLiBTYXR1cmRheV1gIGZvciBlbi1VUykuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxlRGF5TmFtZXMoXG4gICAgbG9jYWxlOiBzdHJpbmcsIGZvcm1TdHlsZTogRm9ybVN0eWxlLCB3aWR0aDogVHJhbnNsYXRpb25XaWR0aCk6IHN0cmluZ1tdIHtcbiAgY29uc3QgZGF0YSA9IGZpbmRMb2NhbGVEYXRhKGxvY2FsZSk7XG4gIGNvbnN0IGRheXNEYXRhID1cbiAgICAgIDxzdHJpbmdbXVtdW10+W2RhdGFbTG9jYWxlRGF0YUluZGV4LkRheXNGb3JtYXRdLCBkYXRhW0xvY2FsZURhdGFJbmRleC5EYXlzU3RhbmRhbG9uZV1dO1xuICBjb25zdCBkYXlzID0gZ2V0TGFzdERlZmluZWRWYWx1ZShkYXlzRGF0YSwgZm9ybVN0eWxlKTtcbiAgcmV0dXJuIGdldExhc3REZWZpbmVkVmFsdWUoZGF5cywgd2lkdGgpO1xufVxuXG4vKipcbiAqIE1vbnRocyBvZiB0aGUgeWVhciBmb3IgdGhlIEdyZWdvcmlhbiBjYWxlbmRhciAoZS5nLiBgW0phbnVhcnksIEZlYnJ1YXJ5LCAuLi5dYCBmb3IgZW4tVVMpLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZU1vbnRoTmFtZXMoXG4gICAgbG9jYWxlOiBzdHJpbmcsIGZvcm1TdHlsZTogRm9ybVN0eWxlLCB3aWR0aDogVHJhbnNsYXRpb25XaWR0aCk6IHN0cmluZ1tdIHtcbiAgY29uc3QgZGF0YSA9IGZpbmRMb2NhbGVEYXRhKGxvY2FsZSk7XG4gIGNvbnN0IG1vbnRoc0RhdGEgPVxuICAgICAgPHN0cmluZ1tdW11bXT5bZGF0YVtMb2NhbGVEYXRhSW5kZXguTW9udGhzRm9ybWF0XSwgZGF0YVtMb2NhbGVEYXRhSW5kZXguTW9udGhzU3RhbmRhbG9uZV1dO1xuICBjb25zdCBtb250aHMgPSBnZXRMYXN0RGVmaW5lZFZhbHVlKG1vbnRoc0RhdGEsIGZvcm1TdHlsZSk7XG4gIHJldHVybiBnZXRMYXN0RGVmaW5lZFZhbHVlKG1vbnRocywgd2lkdGgpO1xufVxuXG4vKipcbiAqIEVyYXMgZm9yIHRoZSBHcmVnb3JpYW4gY2FsZW5kYXIgKGUuZy4gQUQvQkMpLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZUVyYU5hbWVzKGxvY2FsZTogc3RyaW5nLCB3aWR0aDogVHJhbnNsYXRpb25XaWR0aCk6IFtzdHJpbmcsIHN0cmluZ10ge1xuICBjb25zdCBkYXRhID0gZmluZExvY2FsZURhdGEobG9jYWxlKTtcbiAgY29uc3QgZXJhc0RhdGEgPSA8W3N0cmluZywgc3RyaW5nXVtdPmRhdGFbTG9jYWxlRGF0YUluZGV4LkVyYXNdO1xuICByZXR1cm4gZ2V0TGFzdERlZmluZWRWYWx1ZShlcmFzRGF0YSwgd2lkdGgpO1xufVxuXG4vKipcbiAqIEZpcnN0IGRheSBvZiB0aGUgd2VlayBmb3IgdGhpcyBsb2NhbGUsIGJhc2VkIG9uIGVuZ2xpc2ggZGF5cyAoU3VuZGF5ID0gMCwgTW9uZGF5ID0gMSwgLi4uKS5cbiAqIEZvciBleGFtcGxlIGluIGZyZW5jaCB0aGUgdmFsdWUgd291bGQgYmUgMSBiZWNhdXNlIHRoZSBmaXJzdCBkYXkgb2YgdGhlIHdlZWsgaXMgTW9uZGF5LlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZUZpcnN0RGF5T2ZXZWVrKGxvY2FsZTogc3RyaW5nKTogV2Vla0RheSB7XG4gIGNvbnN0IGRhdGEgPSBmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICByZXR1cm4gZGF0YVtMb2NhbGVEYXRhSW5kZXguRmlyc3REYXlPZldlZWtdO1xufVxuXG4vKipcbiAqIFJhbmdlIG9mIGRheXMgaW4gdGhlIHdlZWsgdGhhdCByZXByZXNlbnQgdGhlIHdlZWstZW5kIGZvciB0aGlzIGxvY2FsZSwgYmFzZWQgb24gZW5nbGlzaCBkYXlzXG4gKiAoU3VuZGF5ID0gMCwgTW9uZGF5ID0gMSwgLi4uKS5cbiAqIEZvciBleGFtcGxlIGluIGVuZ2xpc2ggdGhlIHZhbHVlIHdvdWxkIGJlIFs2LDBdIGZvciBTYXR1cmRheSB0byBTdW5kYXkuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxlV2Vla0VuZFJhbmdlKGxvY2FsZTogc3RyaW5nKTogW1dlZWtEYXksIFdlZWtEYXldIHtcbiAgY29uc3QgZGF0YSA9IGZpbmRMb2NhbGVEYXRhKGxvY2FsZSk7XG4gIHJldHVybiBkYXRhW0xvY2FsZURhdGFJbmRleC5XZWVrZW5kUmFuZ2VdO1xufVxuXG4vKipcbiAqIERhdGUgZm9ybWF0IHRoYXQgZGVwZW5kcyBvbiB0aGUgbG9jYWxlLlxuICpcbiAqIFRoZXJlIGFyZSBmb3VyIGJhc2ljIGRhdGUgZm9ybWF0czpcbiAqIC0gYGZ1bGxgIHNob3VsZCBjb250YWluIGxvbmctd2Vla2RheSAoRUVFRSksIHllYXIgKHkpLCBsb25nLW1vbnRoIChNTU1NKSwgZGF5IChkKS5cbiAqXG4gKiAgRm9yIGV4YW1wbGUsIEVuZ2xpc2ggdXNlcyBgRUVFRSwgTU1NTSBkLCB5YCwgY29ycmVzcG9uZGluZyB0byBhIGRhdGUgbGlrZVxuICogIFwiVHVlc2RheSwgU2VwdGVtYmVyIDE0LCAxOTk5XCIuXG4gKlxuICogLSBgbG9uZ2Agc2hvdWxkIGNvbnRhaW4geWVhciwgbG9uZy1tb250aCwgZGF5LlxuICpcbiAqICBGb3IgZXhhbXBsZSwgYE1NTU0gZCwgeWAsIGNvcnJlc3BvbmRpbmcgdG8gYSBkYXRlIGxpa2UgXCJTZXB0ZW1iZXIgMTQsIDE5OTlcIi5cbiAqXG4gKiAtIGBtZWRpdW1gIHNob3VsZCBjb250YWluIHllYXIsIGFiYnJldmlhdGVkLW1vbnRoIChNTU0pLCBkYXkuXG4gKlxuICogIEZvciBleGFtcGxlLCBgTU1NIGQsIHlgLCBjb3JyZXNwb25kaW5nIHRvIGEgZGF0ZSBsaWtlIFwiU2VwIDE0LCAxOTk5XCIuXG4gKiAgRm9yIGxhbmd1YWdlcyB0aGF0IGRvIG5vdCB1c2UgYWJicmV2aWF0ZWQgbW9udGhzLCB1c2UgdGhlIG51bWVyaWMgbW9udGggKE1NL00pLiBGb3IgZXhhbXBsZSxcbiAqICBgeS9NTS9kZGAsIGNvcnJlc3BvbmRpbmcgdG8gYSBkYXRlIGxpa2UgXCIxOTk5LzA5LzE0XCIuXG4gKlxuICogLSBgc2hvcnRgIHNob3VsZCBjb250YWluIHllYXIsIG51bWVyaWMtbW9udGggKE1NL00pLCBhbmQgZGF5LlxuICpcbiAqICBGb3IgZXhhbXBsZSwgYE0vZC95eWAsIGNvcnJlc3BvbmRpbmcgdG8gYSBkYXRlIGxpa2UgXCI5LzE0Lzk5XCIuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxlRGF0ZUZvcm1hdChsb2NhbGU6IHN0cmluZywgd2lkdGg6IEZvcm1hdFdpZHRoKTogc3RyaW5nIHtcbiAgY29uc3QgZGF0YSA9IGZpbmRMb2NhbGVEYXRhKGxvY2FsZSk7XG4gIHJldHVybiBnZXRMYXN0RGVmaW5lZFZhbHVlKGRhdGFbTG9jYWxlRGF0YUluZGV4LkRhdGVGb3JtYXRdLCB3aWR0aCk7XG59XG5cbi8qKlxuICogVGltZSBmb3JtYXQgdGhhdCBkZXBlbmRzIG9uIHRoZSBsb2NhbGUuXG4gKlxuICogVGhlIHN0YW5kYXJkIGZvcm1hdHMgaW5jbHVkZSBmb3VyIGJhc2ljIHRpbWUgZm9ybWF0czpcbiAqIC0gYGZ1bGxgIHNob3VsZCBjb250YWluIGhvdXIgKGgvSCksIG1pbnV0ZSAobW0pLCBzZWNvbmQgKHNzKSwgYW5kIHpvbmUgKHp6enopLlxuICogLSBgbG9uZ2Agc2hvdWxkIGNvbnRhaW4gaG91ciwgbWludXRlLCBzZWNvbmQsIGFuZCB6b25lICh6KVxuICogLSBgbWVkaXVtYCBzaG91bGQgY29udGFpbiBob3VyLCBtaW51dGUsIHNlY29uZC5cbiAqIC0gYHNob3J0YCBzaG91bGQgY29udGFpbiBob3VyLCBtaW51dGUuXG4gKlxuICogTm90ZTogVGhlIHBhdHRlcm5zIGRlcGVuZCBvbiB3aGV0aGVyIHRoZSBtYWluIGNvdW50cnkgdXNpbmcgeW91ciBsYW5ndWFnZSB1c2VzIDEyLWhvdXIgdGltZSBvclxuICogbm90OlxuICogLSBGb3IgMTItaG91ciB0aW1lLCB1c2UgYSBwYXR0ZXJuIGxpa2UgYGhoOm1tIGFgIHVzaW5nIGggdG8gbWVhbiBhIDEyLWhvdXIgY2xvY2sgY3ljbGUgcnVubmluZ1xuICogMSB0aHJvdWdoIDEyIChtaWRuaWdodCBwbHVzIDEgbWludXRlIGlzIDEyOjAxKSwgb3IgdXNpbmcgSyB0byBtZWFuIGEgMTItaG91ciBjbG9jayBjeWNsZVxuICogcnVubmluZyAwIHRocm91Z2ggMTEgKG1pZG5pZ2h0IHBsdXMgMSBtaW51dGUgaXMgMDowMSkuXG4gKiAtIEZvciAyNC1ob3VyIHRpbWUsIHVzZSBhIHBhdHRlcm4gbGlrZSBgSEg6bW1gIHVzaW5nIEggdG8gbWVhbiBhIDI0LWhvdXIgY2xvY2sgY3ljbGUgcnVubmluZyAwXG4gKiB0aHJvdWdoIDIzIChtaWRuaWdodCBwbHVzIDEgbWludXRlIGlzIDA6MDEpLCBvciB1c2luZyBrIHRvIG1lYW4gYSAyNC1ob3VyIGNsb2NrIGN5Y2xlIHJ1bm5pbmdcbiAqIDEgdGhyb3VnaCAyNCAobWlkbmlnaHQgcGx1cyAxIG1pbnV0ZSBpcyAyNDowMSkuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxlVGltZUZvcm1hdChsb2NhbGU6IHN0cmluZywgd2lkdGg6IEZvcm1hdFdpZHRoKTogc3RyaW5nIHtcbiAgY29uc3QgZGF0YSA9IGZpbmRMb2NhbGVEYXRhKGxvY2FsZSk7XG4gIHJldHVybiBnZXRMYXN0RGVmaW5lZFZhbHVlKGRhdGFbTG9jYWxlRGF0YUluZGV4LlRpbWVGb3JtYXRdLCB3aWR0aCk7XG59XG5cbi8qKlxuICogRGF0ZS10aW1lIGZvcm1hdCB0aGF0IGRlcGVuZHMgb24gdGhlIGxvY2FsZS5cbiAqXG4gKiBUaGUgZGF0ZS10aW1lIHBhdHRlcm4gc2hvd3MgaG93IHRvIGNvbWJpbmUgc2VwYXJhdGUgcGF0dGVybnMgZm9yIGRhdGUgKHJlcHJlc2VudGVkIGJ5IHsxfSlcbiAqIGFuZCB0aW1lIChyZXByZXNlbnRlZCBieSB7MH0pIGludG8gYSBzaW5nbGUgcGF0dGVybi4gSXQgdXN1YWxseSBkb2Vzbid0IG5lZWQgdG8gYmUgY2hhbmdlZC5cbiAqIFdoYXQgeW91IHdhbnQgdG8gcGF5IGF0dGVudGlvbiB0byBhcmU6XG4gKiAtIHBvc3NpYmx5IHJlbW92aW5nIGEgc3BhY2UgZm9yIGxhbmd1YWdlcyB0aGF0IGRvbid0IHVzZSBpdCwgc3VjaCBhcyBtYW55IEVhc3QgQXNpYW4gbGFuZ3VhZ2VzXG4gKiAtIHBvc3NpYmx5IGFkZGluZyBhIGNvbW1hLCBvdGhlciBwdW5jdHVhdGlvbiwgb3IgYSBjb21iaW5pbmcgd29yZFxuICpcbiAqIEZvciBleGFtcGxlOlxuICogLSBFbmdsaXNoIHVzZXMgYHsxfSAnYXQnIHswfWAgb3IgYHsxfSwgezB9YCAoZGVwZW5kaW5nIG9uIGRhdGUgc3R5bGUpLCB3aGlsZSBKYXBhbmVzZSB1c2VzXG4gKiAgYHsxfXswfWAuXG4gKiAtIEFuIEVuZ2xpc2ggZm9ybWF0dGVkIGRhdGUtdGltZSB1c2luZyB0aGUgY29tYmluaW5nIHBhdHRlcm4gYHsxfSwgezB9YCBjb3VsZCBiZVxuICogIGBEZWMgMTAsIDIwMTAsIDM6NTk6NDkgUE1gLiBOb3RpY2UgdGhlIGNvbW1hIGFuZCBzcGFjZSBiZXR3ZWVuIHRoZSBkYXRlIHBvcnRpb24gYW5kIHRoZSB0aW1lXG4gKiAgcG9ydGlvbi5cbiAqXG4gKiBUaGVyZSBhcmUgZm91ciBmb3JtYXRzIChgZnVsbGAsIGBsb25nYCwgYG1lZGl1bWAsIGBzaG9ydGApOyB0aGUgZGV0ZXJtaW5hdGlvbiBvZiB3aGljaCB0byB1c2VcbiAqIGlzIG5vcm1hbGx5IGJhc2VkIG9uIHRoZSBkYXRlIHN0eWxlLiBGb3IgZXhhbXBsZSwgaWYgdGhlIGRhdGUgaGFzIGEgZnVsbCBtb250aCBhbmQgd2Vla2RheVxuICogbmFtZSwgdGhlIGZ1bGwgY29tYmluaW5nIHBhdHRlcm4gd2lsbCBiZSB1c2VkIHRvIGNvbWJpbmUgdGhhdCB3aXRoIGEgdGltZS4gSWYgdGhlIGRhdGUgaGFzXG4gKiBudW1lcmljIG1vbnRoLCB0aGUgc2hvcnQgdmVyc2lvbiBvZiB0aGUgY29tYmluaW5nIHBhdHRlcm4gd2lsbCBiZSB1c2VkIHRvIGNvbWJpbmUgdGhhdCB3aXRoIGFcbiAqIHRpbWUuIEVuZ2xpc2ggdXNlcyBgezF9ICdhdCcgezB9YCBmb3IgZnVsbCBhbmQgbG9uZyBzdHlsZXMsIGFuZCBgezF9LCB7MH1gIGZvciBtZWRpdW0gYW5kIHNob3J0XG4gKiBzdHlsZXMuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxlRGF0ZVRpbWVGb3JtYXQobG9jYWxlOiBzdHJpbmcsIHdpZHRoOiBGb3JtYXRXaWR0aCk6IHN0cmluZyB7XG4gIGNvbnN0IGRhdGEgPSBmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICBjb25zdCBkYXRlVGltZUZvcm1hdERhdGEgPSA8c3RyaW5nW10+ZGF0YVtMb2NhbGVEYXRhSW5kZXguRGF0ZVRpbWVGb3JtYXRdO1xuICByZXR1cm4gZ2V0TGFzdERlZmluZWRWYWx1ZShkYXRlVGltZUZvcm1hdERhdGEsIHdpZHRoKTtcbn1cblxuLyoqXG4gKiBOdW1iZXIgc3ltYm9sIHRoYXQgY2FuIGJlIHVzZWQgdG8gcmVwbGFjZSBwbGFjZWhvbGRlcnMgaW4gbnVtYmVyIGZvcm1hdHMuXG4gKiBTZWUge0BsaW5rIE51bWJlclN5bWJvbH0gZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxlTnVtYmVyU3ltYm9sKGxvY2FsZTogc3RyaW5nLCBzeW1ib2w6IE51bWJlclN5bWJvbCk6IHN0cmluZyB7XG4gIGNvbnN0IGRhdGEgPSBmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICBjb25zdCByZXMgPSBkYXRhW0xvY2FsZURhdGFJbmRleC5OdW1iZXJTeW1ib2xzXVtzeW1ib2xdO1xuICBpZiAodHlwZW9mIHJlcyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBpZiAoc3ltYm9sID09PSBOdW1iZXJTeW1ib2wuQ3VycmVuY3lEZWNpbWFsKSB7XG4gICAgICByZXR1cm4gZGF0YVtMb2NhbGVEYXRhSW5kZXguTnVtYmVyU3ltYm9sc11bTnVtYmVyU3ltYm9sLkRlY2ltYWxdO1xuICAgIH0gZWxzZSBpZiAoc3ltYm9sID09PSBOdW1iZXJTeW1ib2wuQ3VycmVuY3lHcm91cCkge1xuICAgICAgcmV0dXJuIGRhdGFbTG9jYWxlRGF0YUluZGV4Lk51bWJlclN5bWJvbHNdW051bWJlclN5bWJvbC5Hcm91cF07XG4gICAgfVxuICB9XG4gIHJldHVybiByZXM7XG59XG5cbi8qKlxuICogTnVtYmVyIGZvcm1hdCB0aGF0IGRlcGVuZHMgb24gdGhlIGxvY2FsZS5cbiAqXG4gKiBOdW1iZXJzIGFyZSBmb3JtYXR0ZWQgdXNpbmcgcGF0dGVybnMsIGxpa2UgYCMsIyMjLjAwYC4gRm9yIGV4YW1wbGUsIHRoZSBwYXR0ZXJuIGAjLCMjIy4wMGBcbiAqIHdoZW4gdXNlZCB0byBmb3JtYXQgdGhlIG51bWJlciAxMjM0NS42NzggY291bGQgcmVzdWx0IGluIFwiMTInMzQ1LDY3XCIuIFRoYXQgd291bGQgaGFwcGVuIGlmIHRoZVxuICogZ3JvdXBpbmcgc2VwYXJhdG9yIGZvciB5b3VyIGxhbmd1YWdlIGlzIGFuIGFwb3N0cm9waGUsIGFuZCB0aGUgZGVjaW1hbCBzZXBhcmF0b3IgaXMgYSBjb21tYS5cbiAqXG4gKiA8Yj5JbXBvcnRhbnQ6PC9iPiBUaGUgY2hhcmFjdGVycyBgLmAgYCxgIGAwYCBgI2AgKGFuZCBvdGhlcnMgYmVsb3cpIGFyZSBzcGVjaWFsIHBsYWNlaG9sZGVycztcbiAqIHRoZXkgc3RhbmQgZm9yIHRoZSBkZWNpbWFsIHNlcGFyYXRvciwgYW5kIHNvIG9uLCBhbmQgYXJlIE5PVCByZWFsIGNoYXJhY3RlcnMuXG4gKiBZb3UgbXVzdCBOT1QgXCJ0cmFuc2xhdGVcIiB0aGUgcGxhY2Vob2xkZXJzOyBmb3IgZXhhbXBsZSwgZG9uJ3QgY2hhbmdlIGAuYCB0byBgLGAgZXZlbiB0aG91Z2ggaW5cbiAqIHlvdXIgbGFuZ3VhZ2UgdGhlIGRlY2ltYWwgcG9pbnQgaXMgd3JpdHRlbiB3aXRoIGEgY29tbWEuIFRoZSBzeW1ib2xzIHNob3VsZCBiZSByZXBsYWNlZCBieSB0aGVcbiAqIGxvY2FsIGVxdWl2YWxlbnRzLCB1c2luZyB0aGUgTnVtYmVyIFN5bWJvbHMgZm9yIHlvdXIgbGFuZ3VhZ2UuXG4gKlxuICogSGVyZSBhcmUgdGhlIHNwZWNpYWwgY2hhcmFjdGVycyB1c2VkIGluIG51bWJlciBwYXR0ZXJuczpcbiAqXG4gKiB8IFN5bWJvbCB8IE1lYW5pbmcgfFxuICogfC0tLS0tLS0tfC0tLS0tLS0tLXxcbiAqIHwgLiB8IFJlcGxhY2VkIGF1dG9tYXRpY2FsbHkgYnkgdGhlIGNoYXJhY3RlciB1c2VkIGZvciB0aGUgZGVjaW1hbCBwb2ludC4gfFxuICogfCAsIHwgUmVwbGFjZWQgYnkgdGhlIFwiZ3JvdXBpbmdcIiAodGhvdXNhbmRzKSBzZXBhcmF0b3IuIHxcbiAqIHwgMCB8IFJlcGxhY2VkIGJ5IGEgZGlnaXQgKG9yIHplcm8gaWYgdGhlcmUgYXJlbid0IGVub3VnaCBkaWdpdHMpLiB8XG4gKiB8ICMgfCBSZXBsYWNlZCBieSBhIGRpZ2l0IChvciBub3RoaW5nIGlmIHRoZXJlIGFyZW4ndCBlbm91Z2gpLiB8XG4gKiB8IMKkIHwgVGhpcyB3aWxsIGJlIHJlcGxhY2VkIGJ5IGEgY3VycmVuY3kgc3ltYm9sLCBzdWNoIGFzICQgb3IgVVNELiB8XG4gKiB8ICUgfCBUaGlzIG1hcmtzIGEgcGVyY2VudCBmb3JtYXQuIFRoZSAlIHN5bWJvbCBtYXkgY2hhbmdlIHBvc2l0aW9uLCBidXQgbXVzdCBiZSByZXRhaW5lZC4gfFxuICogfCBFIHwgVGhpcyBtYXJrcyBhIHNjaWVudGlmaWMgZm9ybWF0LiBUaGUgRSBzeW1ib2wgbWF5IGNoYW5nZSBwb3NpdGlvbiwgYnV0IG11c3QgYmUgcmV0YWluZWQuIHxcbiAqIHwgJyB8IFNwZWNpYWwgY2hhcmFjdGVycyB1c2VkIGFzIGxpdGVyYWwgY2hhcmFjdGVycyBhcmUgcXVvdGVkIHdpdGggQVNDSUkgc2luZ2xlIHF1b3Rlcy4gfFxuICpcbiAqIFlvdSBjYW4gZmluZCBtb3JlIGluZm9ybWF0aW9uXG4gKiBbb24gdGhlIENMRFIgd2Vic2l0ZV0oaHR0cDovL2NsZHIudW5pY29kZS5vcmcvdHJhbnNsYXRpb24vbnVtYmVyLXBhdHRlcm5zKVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZU51bWJlckZvcm1hdChsb2NhbGU6IHN0cmluZywgdHlwZTogTnVtYmVyRm9ybWF0U3R5bGUpOiBzdHJpbmcge1xuICBjb25zdCBkYXRhID0gZmluZExvY2FsZURhdGEobG9jYWxlKTtcbiAgcmV0dXJuIGRhdGFbTG9jYWxlRGF0YUluZGV4Lk51bWJlckZvcm1hdHNdW3R5cGVdO1xufVxuXG4vKipcbiAqIFRoZSBzeW1ib2wgdXNlZCB0byByZXByZXNlbnQgdGhlIGN1cnJlbmN5IGZvciB0aGUgbWFpbiBjb3VudHJ5IHVzaW5nIHRoaXMgbG9jYWxlIChlLmcuICQgZm9yXG4gKiB0aGUgbG9jYWxlIGVuLVVTKS5cbiAqIFRoZSBzeW1ib2wgd2lsbCBiZSBgbnVsbGAgaWYgdGhlIG1haW4gY291bnRyeSBjYW5ub3QgYmUgZGV0ZXJtaW5lZC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVDdXJyZW5jeVN5bWJvbChsb2NhbGU6IHN0cmluZyk6IHN0cmluZ3xudWxsIHtcbiAgY29uc3QgZGF0YSA9IGZpbmRMb2NhbGVEYXRhKGxvY2FsZSk7XG4gIHJldHVybiBkYXRhW0xvY2FsZURhdGFJbmRleC5DdXJyZW5jeVN5bWJvbF0gfHwgbnVsbDtcbn1cblxuLyoqXG4gKiBUaGUgbmFtZSBvZiB0aGUgY3VycmVuY3kgZm9yIHRoZSBtYWluIGNvdW50cnkgdXNpbmcgdGhpcyBsb2NhbGUgKGUuZy4gJ1VTIERvbGxhcicgZm9yIHRoZSBsb2NhbGVcbiAqIGVuLVVTKS5cbiAqIFRoZSBuYW1lIHdpbGwgYmUgYG51bGxgIGlmIHRoZSBtYWluIGNvdW50cnkgY2Fubm90IGJlIGRldGVybWluZWQuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxlQ3VycmVuY3lOYW1lKGxvY2FsZTogc3RyaW5nKTogc3RyaW5nfG51bGwge1xuICBjb25zdCBkYXRhID0gZmluZExvY2FsZURhdGEobG9jYWxlKTtcbiAgcmV0dXJuIGRhdGFbTG9jYWxlRGF0YUluZGV4LkN1cnJlbmN5TmFtZV0gfHwgbnVsbDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBjdXJyZW5jeSB2YWx1ZXMgZm9yIHRoZSBsb2NhbGVcbiAqL1xuZnVuY3Rpb24gZ2V0TG9jYWxlQ3VycmVuY2llcyhsb2NhbGU6IHN0cmluZyk6IHtbY29kZTogc3RyaW5nXTogQ3VycmVuY2llc1N5bWJvbHN9IHtcbiAgY29uc3QgZGF0YSA9IGZpbmRMb2NhbGVEYXRhKGxvY2FsZSk7XG4gIHJldHVybiBkYXRhW0xvY2FsZURhdGFJbmRleC5DdXJyZW5jaWVzXTtcbn1cblxuLyoqXG4gKiBUaGUgbG9jYWxlIHBsdXJhbCBmdW5jdGlvbiB1c2VkIGJ5IElDVSBleHByZXNzaW9ucyB0byBkZXRlcm1pbmUgdGhlIHBsdXJhbCBjYXNlIHRvIHVzZS5cbiAqIFNlZSB7QGxpbmsgTmdQbHVyYWx9IGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZVBsdXJhbENhc2UobG9jYWxlOiBzdHJpbmcpOiAodmFsdWU6IG51bWJlcikgPT4gUGx1cmFsIHtcbiAgY29uc3QgZGF0YSA9IGZpbmRMb2NhbGVEYXRhKGxvY2FsZSk7XG4gIHJldHVybiBkYXRhW0xvY2FsZURhdGFJbmRleC5QbHVyYWxDYXNlXTtcbn1cblxuZnVuY3Rpb24gY2hlY2tGdWxsRGF0YShkYXRhOiBhbnkpIHtcbiAgaWYgKCFkYXRhW0xvY2FsZURhdGFJbmRleC5FeHRyYURhdGFdKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgTWlzc2luZyBleHRyYSBsb2NhbGUgZGF0YSBmb3IgdGhlIGxvY2FsZSBcIiR7ZGF0YVtMb2NhbGVEYXRhSW5kZXguTG9jYWxlSWRdfVwiLiBVc2UgXCJyZWdpc3RlckxvY2FsZURhdGFcIiB0byBsb2FkIG5ldyBkYXRhLiBTZWUgdGhlIFwiSTE4biBndWlkZVwiIG9uIGFuZ3VsYXIuaW8gdG8ga25vdyBtb3JlLmApO1xuICB9XG59XG5cbi8qKlxuICogUnVsZXMgdXNlZCB0byBkZXRlcm1pbmUgd2hpY2ggZGF5IHBlcmlvZCB0byB1c2UgKFNlZSBgZGF5UGVyaW9kc2AgYmVsb3cpLlxuICogVGhlIHJ1bGVzIGNhbiBlaXRoZXIgYmUgYW4gYXJyYXkgb3IgYSBzaW5nbGUgdmFsdWUuIElmIGl0J3MgYW4gYXJyYXksIGNvbnNpZGVyIGl0IGFzIFwiZnJvbVwiXG4gKiBhbmQgXCJ0b1wiLiBJZiBpdCdzIGEgc2luZ2xlIHZhbHVlIHRoZW4gaXQgbWVhbnMgdGhhdCB0aGUgcGVyaW9kIGlzIG9ubHkgdmFsaWQgYXQgdGhpcyBleGFjdFxuICogdmFsdWUuXG4gKiBUaGVyZSBpcyBhbHdheXMgdGhlIHNhbWUgbnVtYmVyIG9mIHJ1bGVzIGFzIHRoZSBudW1iZXIgb2YgZGF5IHBlcmlvZHMsIHdoaWNoIG1lYW5zIHRoYXQgdGhlXG4gKiBmaXJzdCBydWxlIGlzIGFwcGxpZWQgdG8gdGhlIGZpcnN0IGRheSBwZXJpb2QgYW5kIHNvIG9uLlxuICogWW91IHNob3VsZCBmYWxsYmFjayB0byBBTS9QTSB3aGVuIHRoZXJlIGFyZSBubyBydWxlcyBhdmFpbGFibGUuXG4gKlxuICogTm90ZTogdGhpcyBpcyBvbmx5IGF2YWlsYWJsZSBpZiB5b3UgbG9hZCB0aGUgZnVsbCBsb2NhbGUgZGF0YS5cbiAqIFNlZSB0aGUgW1wiSTE4biBndWlkZVwiXShndWlkZS9pMThuI2kxOG4tcGlwZXMpIHRvIGtub3cgaG93IHRvIGltcG9ydCBhZGRpdGlvbmFsIGxvY2FsZVxuICogZGF0YS5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVFeHRyYURheVBlcmlvZFJ1bGVzKGxvY2FsZTogc3RyaW5nKTogKFRpbWUgfCBbVGltZSwgVGltZV0pW10ge1xuICBjb25zdCBkYXRhID0gZmluZExvY2FsZURhdGEobG9jYWxlKTtcbiAgY2hlY2tGdWxsRGF0YShkYXRhKTtcbiAgY29uc3QgcnVsZXMgPSBkYXRhW0xvY2FsZURhdGFJbmRleC5FeHRyYURhdGFdW0V4dHJhTG9jYWxlRGF0YUluZGV4LkV4dHJhRGF5UGVyaW9kc1J1bGVzXSB8fCBbXTtcbiAgcmV0dXJuIHJ1bGVzLm1hcCgocnVsZTogc3RyaW5nIHwgW3N0cmluZywgc3RyaW5nXSkgPT4ge1xuICAgIGlmICh0eXBlb2YgcnVsZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiBleHRyYWN0VGltZShydWxlKTtcbiAgICB9XG4gICAgcmV0dXJuIFtleHRyYWN0VGltZShydWxlWzBdKSwgZXh0cmFjdFRpbWUocnVsZVsxXSldO1xuICB9KTtcbn1cblxuLyoqXG4gKiBEYXkgUGVyaW9kcyBpbmRpY2F0ZSByb3VnaGx5IGhvdyB0aGUgZGF5IGlzIGJyb2tlbiB1cCBpbiBkaWZmZXJlbnQgbGFuZ3VhZ2VzIChlLmcuIG1vcm5pbmcsXG4gKiBub29uLCBhZnRlcm5vb24sIG1pZG5pZ2h0LCAuLi4pLlxuICogWW91IHNob3VsZCB1c2UgdGhlIGZ1bmN0aW9uIHtAbGluayBnZXRMb2NhbGVFeHRyYURheVBlcmlvZFJ1bGVzfSB0byBkZXRlcm1pbmUgd2hpY2ggcGVyaW9kIHRvXG4gKiB1c2UuXG4gKiBZb3Ugc2hvdWxkIGZhbGxiYWNrIHRvIEFNL1BNIHdoZW4gdGhlcmUgYXJlIG5vIGRheSBwZXJpb2RzIGF2YWlsYWJsZS5cbiAqXG4gKiBOb3RlOiB0aGlzIGlzIG9ubHkgYXZhaWxhYmxlIGlmIHlvdSBsb2FkIHRoZSBmdWxsIGxvY2FsZSBkYXRhLlxuICogU2VlIHRoZSBbXCJJMThuIGd1aWRlXCJdKGd1aWRlL2kxOG4jaTE4bi1waXBlcykgdG8ga25vdyBob3cgdG8gaW1wb3J0IGFkZGl0aW9uYWwgbG9jYWxlXG4gKiBkYXRhLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZUV4dHJhRGF5UGVyaW9kcyhcbiAgICBsb2NhbGU6IHN0cmluZywgZm9ybVN0eWxlOiBGb3JtU3R5bGUsIHdpZHRoOiBUcmFuc2xhdGlvbldpZHRoKTogc3RyaW5nW10ge1xuICBjb25zdCBkYXRhID0gZmluZExvY2FsZURhdGEobG9jYWxlKTtcbiAgY2hlY2tGdWxsRGF0YShkYXRhKTtcbiAgY29uc3QgZGF5UGVyaW9kc0RhdGEgPSA8c3RyaW5nW11bXVtdPltcbiAgICBkYXRhW0xvY2FsZURhdGFJbmRleC5FeHRyYURhdGFdW0V4dHJhTG9jYWxlRGF0YUluZGV4LkV4dHJhRGF5UGVyaW9kRm9ybWF0c10sXG4gICAgZGF0YVtMb2NhbGVEYXRhSW5kZXguRXh0cmFEYXRhXVtFeHRyYUxvY2FsZURhdGFJbmRleC5FeHRyYURheVBlcmlvZFN0YW5kYWxvbmVdXG4gIF07XG4gIGNvbnN0IGRheVBlcmlvZHMgPSBnZXRMYXN0RGVmaW5lZFZhbHVlKGRheVBlcmlvZHNEYXRhLCBmb3JtU3R5bGUpIHx8IFtdO1xuICByZXR1cm4gZ2V0TGFzdERlZmluZWRWYWx1ZShkYXlQZXJpb2RzLCB3aWR0aCkgfHwgW107XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgZmlyc3QgdmFsdWUgdGhhdCBpcyBkZWZpbmVkIGluIGFuIGFycmF5LCBnb2luZyBiYWNrd2FyZHMuXG4gKlxuICogVG8gYXZvaWQgcmVwZWF0aW5nIHRoZSBzYW1lIGRhdGEgKGUuZy4gd2hlbiBcImZvcm1hdFwiIGFuZCBcInN0YW5kYWxvbmVcIiBhcmUgdGhlIHNhbWUpIHdlIG9ubHlcbiAqIGFkZCB0aGUgZmlyc3Qgb25lIHRvIHRoZSBsb2NhbGUgZGF0YSBhcnJheXMsIHRoZSBvdGhlciBvbmVzIGFyZSBvbmx5IGRlZmluZWQgd2hlbiBkaWZmZXJlbnQuXG4gKiBXZSB1c2UgdGhpcyBmdW5jdGlvbiB0byByZXRyaWV2ZSB0aGUgZmlyc3QgZGVmaW5lZCB2YWx1ZS5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmZ1bmN0aW9uIGdldExhc3REZWZpbmVkVmFsdWU8VD4oZGF0YTogVFtdLCBpbmRleDogbnVtYmVyKTogVCB7XG4gIGZvciAobGV0IGkgPSBpbmRleDsgaSA+IC0xOyBpLS0pIHtcbiAgICBpZiAodHlwZW9mIGRhdGFbaV0gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm4gZGF0YVtpXTtcbiAgICB9XG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKCdMb2NhbGUgZGF0YSBBUEk6IGxvY2FsZSBkYXRhIHVuZGVmaW5lZCcpO1xufVxuXG4vKipcbiAqIEEgcmVwcmVzZW50YXRpb24gb2YgdGhlIHRpbWUgd2l0aCBob3VycyBhbmQgbWludXRlc1xuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IHR5cGUgVGltZSA9IHtcbiAgaG91cnM6IG51bWJlcixcbiAgbWludXRlczogbnVtYmVyXG59O1xuXG4vKipcbiAqIEV4dHJhY3QgdGhlIGhvdXJzIGFuZCBtaW51dGVzIGZyb20gYSBzdHJpbmcgbGlrZSBcIjE1OjQ1XCJcbiAqL1xuZnVuY3Rpb24gZXh0cmFjdFRpbWUodGltZTogc3RyaW5nKTogVGltZSB7XG4gIGNvbnN0IFtoLCBtXSA9IHRpbWUuc3BsaXQoJzonKTtcbiAgcmV0dXJuIHtob3VyczogK2gsIG1pbnV0ZXM6ICttfTtcbn1cblxuLyoqXG4gKiBGaW5kcyB0aGUgbG9jYWxlIGRhdGEgZm9yIGEgbG9jYWxlIGlkXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZmluZExvY2FsZURhdGEobG9jYWxlOiBzdHJpbmcpOiBhbnkge1xuICBjb25zdCBub3JtYWxpemVkTG9jYWxlID0gbG9jYWxlLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvXy9nLCAnLScpO1xuXG4gIGxldCBtYXRjaCA9IExPQ0FMRV9EQVRBW25vcm1hbGl6ZWRMb2NhbGVdO1xuICBpZiAobWF0Y2gpIHtcbiAgICByZXR1cm4gbWF0Y2g7XG4gIH1cblxuICAvLyBsZXQncyB0cnkgdG8gZmluZCBhIHBhcmVudCBsb2NhbGVcbiAgY29uc3QgcGFyZW50TG9jYWxlID0gbm9ybWFsaXplZExvY2FsZS5zcGxpdCgnLScpWzBdO1xuICBtYXRjaCA9IExPQ0FMRV9EQVRBW3BhcmVudExvY2FsZV07XG5cbiAgaWYgKG1hdGNoKSB7XG4gICAgcmV0dXJuIG1hdGNoO1xuICB9XG5cbiAgaWYgKHBhcmVudExvY2FsZSA9PT0gJ2VuJykge1xuICAgIHJldHVybiBsb2NhbGVFbjtcbiAgfVxuXG4gIHRocm93IG5ldyBFcnJvcihgTWlzc2luZyBsb2NhbGUgZGF0YSBmb3IgdGhlIGxvY2FsZSBcIiR7bG9jYWxlfVwiLmApO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGN1cnJlbmN5IHN5bWJvbCBmb3IgYSBnaXZlbiBjdXJyZW5jeSBjb2RlLCBvciB0aGUgY29kZSBpZiBubyBzeW1ib2wgYXZhaWxhYmxlXG4gKiAoZS5nLjogZm9ybWF0IG5hcnJvdyA9ICQsIGZvcm1hdCB3aWRlID0gVVMkLCBjb2RlID0gVVNEKVxuICogSWYgbm8gbG9jYWxlIGlzIHByb3ZpZGVkLCBpdCB1c2VzIHRoZSBsb2NhbGUgXCJlblwiIGJ5IGRlZmF1bHRcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDdXJyZW5jeVN5bWJvbChjb2RlOiBzdHJpbmcsIGZvcm1hdDogJ3dpZGUnIHwgJ25hcnJvdycsIGxvY2FsZSA9ICdlbicpOiBzdHJpbmcge1xuICBjb25zdCBjdXJyZW5jeSA9IGdldExvY2FsZUN1cnJlbmNpZXMobG9jYWxlKVtjb2RlXSB8fCBDVVJSRU5DSUVTX0VOW2NvZGVdIHx8IFtdO1xuICBjb25zdCBzeW1ib2xOYXJyb3cgPSBjdXJyZW5jeVtDdXJyZW5jeUluZGV4LlN5bWJvbE5hcnJvd107XG5cbiAgaWYgKGZvcm1hdCA9PT0gJ25hcnJvdycgJiYgdHlwZW9mIHN5bWJvbE5hcnJvdyA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gc3ltYm9sTmFycm93O1xuICB9XG5cbiAgcmV0dXJuIGN1cnJlbmN5W0N1cnJlbmN5SW5kZXguU3ltYm9sXSB8fCBjb2RlO1xufVxuXG4vLyBNb3N0IGN1cnJlbmNpZXMgaGF2ZSBjZW50cywgdGhhdCdzIHdoeSB0aGUgZGVmYXVsdCBpcyAyXG5jb25zdCBERUZBVUxUX05CX09GX0NVUlJFTkNZX0RJR0lUUyA9IDI7XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIGRlY2ltYWwgZGlnaXRzIGZvciB0aGUgZ2l2ZW4gY3VycmVuY3kuXG4gKiBJdHMgdmFsdWUgZGVwZW5kcyB1cG9uIHRoZSBwcmVzZW5jZSBvZiBjZW50cyBpbiB0aGF0IHBhcnRpY3VsYXIgY3VycmVuY3kuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TnVtYmVyT2ZDdXJyZW5jeURpZ2l0cyhjb2RlOiBzdHJpbmcpOiBudW1iZXIge1xuICBsZXQgZGlnaXRzO1xuICBjb25zdCBjdXJyZW5jeSA9IENVUlJFTkNJRVNfRU5bY29kZV07XG4gIGlmIChjdXJyZW5jeSkge1xuICAgIGRpZ2l0cyA9IGN1cnJlbmN5W0N1cnJlbmN5SW5kZXguTmJPZkRpZ2l0c107XG4gIH1cbiAgcmV0dXJuIHR5cGVvZiBkaWdpdHMgPT09ICdudW1iZXInID8gZGlnaXRzIDogREVGQVVMVF9OQl9PRl9DVVJSRU5DWV9ESUdJVFM7XG59XG4iXX0=