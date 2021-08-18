/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Observable, OperatorFunction } from 'rxjs';
import { UrlTree } from '../url_tree';
export declare function prioritizedGuardValue(): OperatorFunction<Observable<boolean | UrlTree>[], boolean | UrlTree>;
