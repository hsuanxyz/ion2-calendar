"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fromPromise_1 = require("rxjs/observable/fromPromise");
const of_1 = require("rxjs/observable/of");
const operators_1 = require("rxjs/operators");
const pipe_1 = require("rxjs/util/pipe");
exports.transformFromPromise = (transformFn) => pipe_1.pipe(operators_1.switchMap(graph => {
    const transformResult = transformFn(graph);
    if (transformResult instanceof Promise) {
        return fromPromise_1.fromPromise(transformResult).pipe(operators_1.map(result => (result ? result : graph)));
    }
    else {
        return of_1.of(transformResult ? transformResult : graph);
    }
}));
//# sourceMappingURL=transform.js.map