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
/** @enum {number} */
const RequestMethod = {
    Get: 0,
    Post: 1,
    Put: 2,
    Delete: 3,
    Options: 4,
    Head: 5,
    Patch: 6,
};
export { RequestMethod };
RequestMethod[RequestMethod.Get] = 'Get';
RequestMethod[RequestMethod.Post] = 'Post';
RequestMethod[RequestMethod.Put] = 'Put';
RequestMethod[RequestMethod.Delete] = 'Delete';
RequestMethod[RequestMethod.Options] = 'Options';
RequestMethod[RequestMethod.Head] = 'Head';
RequestMethod[RequestMethod.Patch] = 'Patch';
/** @enum {number} */
const ReadyState = {
    Unsent: 0,
    Open: 1,
    HeadersReceived: 2,
    Loading: 3,
    Done: 4,
    Cancelled: 5,
};
export { ReadyState };
ReadyState[ReadyState.Unsent] = 'Unsent';
ReadyState[ReadyState.Open] = 'Open';
ReadyState[ReadyState.HeadersReceived] = 'HeadersReceived';
ReadyState[ReadyState.Loading] = 'Loading';
ReadyState[ReadyState.Done] = 'Done';
ReadyState[ReadyState.Cancelled] = 'Cancelled';
/** @enum {number} */
const ResponseType = {
    Basic: 0,
    Cors: 1,
    Default: 2,
    Error: 3,
    Opaque: 4,
};
export { ResponseType };
ResponseType[ResponseType.Basic] = 'Basic';
ResponseType[ResponseType.Cors] = 'Cors';
ResponseType[ResponseType.Default] = 'Default';
ResponseType[ResponseType.Error] = 'Error';
ResponseType[ResponseType.Opaque] = 'Opaque';
/** @enum {number} */
const ContentType = {
    NONE: 0,
    JSON: 1,
    FORM: 2,
    FORM_DATA: 3,
    TEXT: 4,
    BLOB: 5,
    ARRAY_BUFFER: 6,
};
export { ContentType };
ContentType[ContentType.NONE] = 'NONE';
ContentType[ContentType.JSON] = 'JSON';
ContentType[ContentType.FORM] = 'FORM';
ContentType[ContentType.FORM_DATA] = 'FORM_DATA';
ContentType[ContentType.TEXT] = 'TEXT';
ContentType[ContentType.BLOB] = 'BLOB';
ContentType[ContentType.ARRAY_BUFFER] = 'ARRAY_BUFFER';
/** @enum {number} */
const ResponseContentType = {
    Text: 0,
    Json: 1,
    ArrayBuffer: 2,
    Blob: 3,
};
export { ResponseContentType };
ResponseContentType[ResponseContentType.Text] = 'Text';
ResponseContentType[ResponseContentType.Json] = 'Json';
ResponseContentType[ResponseContentType.ArrayBuffer] = 'ArrayBuffer';
ResponseContentType[ResponseContentType.Blob] = 'Blob';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW51bXMuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9odHRwL3NyYy9lbnVtcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0lBY0UsTUFBRztJQUNILE9BQUk7SUFDSixNQUFHO0lBQ0gsU0FBTTtJQUNOLFVBQU87SUFDUCxPQUFJO0lBQ0osUUFBSzs7Ozs7Ozs7Ozs7O0lBV0wsU0FBTTtJQUNOLE9BQUk7SUFDSixrQkFBZTtJQUNmLFVBQU87SUFDUCxPQUFJO0lBQ0osWUFBUzs7Ozs7Ozs7Ozs7SUFVVCxRQUFLO0lBQ0wsT0FBSTtJQUNKLFVBQU87SUFDUCxRQUFLO0lBQ0wsU0FBTTs7Ozs7Ozs7OztJQVFOLE9BQUk7SUFDSixPQUFJO0lBQ0osT0FBSTtJQUNKLFlBQVM7SUFDVCxPQUFJO0lBQ0osT0FBSTtJQUNKLGVBQVk7Ozs7Ozs7Ozs7OztJQVNaLE9BQUk7SUFDSixPQUFJO0lBQ0osY0FBVztJQUNYLE9BQUkiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8qKlxuICogU3VwcG9ydGVkIGh0dHAgbWV0aG9kcy5cbiAqIEBkZXByZWNhdGVkIHNlZSBodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvaHR0cFxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZW51bSBSZXF1ZXN0TWV0aG9kIHtcbiAgR2V0LFxuICBQb3N0LFxuICBQdXQsXG4gIERlbGV0ZSxcbiAgT3B0aW9ucyxcbiAgSGVhZCxcbiAgUGF0Y2hcbn1cblxuLyoqXG4gKiBBbGwgcG9zc2libGUgc3RhdGVzIGluIHdoaWNoIGEgY29ubmVjdGlvbiBjYW4gYmUsIGJhc2VkIG9uXG4gKiBbU3RhdGVzXShodHRwOi8vd3d3LnczLm9yZy9UUi9YTUxIdHRwUmVxdWVzdC8jc3RhdGVzKSBmcm9tIHRoZSBgWE1MSHR0cFJlcXVlc3RgIHNwZWMsIGJ1dCB3aXRoIGFuXG4gKiBhZGRpdGlvbmFsIFwiQ0FOQ0VMTEVEXCIgc3RhdGUuXG4gKiBAZGVwcmVjYXRlZCBzZWUgaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL2h0dHBcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGVudW0gUmVhZHlTdGF0ZSB7XG4gIFVuc2VudCxcbiAgT3BlbixcbiAgSGVhZGVyc1JlY2VpdmVkLFxuICBMb2FkaW5nLFxuICBEb25lLFxuICBDYW5jZWxsZWRcbn1cblxuLyoqXG4gKiBBY2NlcHRhYmxlIHJlc3BvbnNlIHR5cGVzIHRvIGJlIGFzc29jaWF0ZWQgd2l0aCBhIHtAbGluayBSZXNwb25zZX0sIGJhc2VkIG9uXG4gKiBbUmVzcG9uc2VUeXBlXShodHRwczovL2ZldGNoLnNwZWMud2hhdHdnLm9yZy8jcmVzcG9uc2V0eXBlKSBmcm9tIHRoZSBGZXRjaCBzcGVjLlxuICogQGRlcHJlY2F0ZWQgc2VlIGh0dHBzOi8vYW5ndWxhci5pby9ndWlkZS9odHRwXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBlbnVtIFJlc3BvbnNlVHlwZSB7XG4gIEJhc2ljLFxuICBDb3JzLFxuICBEZWZhdWx0LFxuICBFcnJvcixcbiAgT3BhcXVlXG59XG5cbi8qKlxuICogU3VwcG9ydGVkIGNvbnRlbnQgdHlwZSB0byBiZSBhdXRvbWF0aWNhbGx5IGFzc29jaWF0ZWQgd2l0aCBhIHtAbGluayBSZXF1ZXN0fS5cbiAqIEBkZXByZWNhdGVkIHNlZSBodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvaHR0cFxuICovXG5leHBvcnQgZW51bSBDb250ZW50VHlwZSB7XG4gIE5PTkUsXG4gIEpTT04sXG4gIEZPUk0sXG4gIEZPUk1fREFUQSxcbiAgVEVYVCxcbiAgQkxPQixcbiAgQVJSQVlfQlVGRkVSXG59XG5cbi8qKlxuICogRGVmaW5lIHdoaWNoIGJ1ZmZlciB0byB1c2UgdG8gc3RvcmUgdGhlIHJlc3BvbnNlXG4gKiBAZGVwcmVjYXRlZCBzZWUgaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL2h0dHBcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGVudW0gUmVzcG9uc2VDb250ZW50VHlwZSB7XG4gIFRleHQsXG4gIEpzb24sXG4gIEFycmF5QnVmZmVyLFxuICBCbG9iXG59XG4iXX0=