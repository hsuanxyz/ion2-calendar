/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ConstantPool } from '../../constant_pool';
import { AST } from '../../expression_parser/ast';
import * as o from '../../output/output_ast';
import { ParseSourceSpan } from '../../parse_util';
import * as t from '../r3_ast';
import { ValueConverter } from './template';
/**
 * A styling expression summary that is to be processed by the compiler
 */
export interface StylingInstruction {
    sourceSpan: ParseSourceSpan | null;
    reference: o.ExternalReference;
    buildParams(convertFn: (value: any) => o.Expression): o.Expression[];
}
/**
 * An internal record of the input data for a styling binding
 */
interface BoundStylingEntry {
    name: string;
    unit: string | null;
    sourceSpan: ParseSourceSpan;
    value: AST;
}
/**
 * Produces creation/update instructions for all styling bindings (class and style)
 *
 * The builder class below handles producing instructions for the following cases:
 *
 * - Static style/class attributes (style="..." and class="...")
 * - Dynamic style/class map bindings ([style]="map" and [class]="map|string")
 * - Dynamic style/class property bindings ([style.prop]="exp" and [class.name]="exp")
 *
 * Due to the complex relationship of all of these cases, the instructions generated
 * for these attributes/properties/bindings must be done so in the correct order. The
 * order which these must be generated is as follows:
 *
 * if (createMode) {
 *   elementStyling(...)
 * }
 * if (updateMode) {
 *   elementStylingMap(...)
 *   elementStyleProp(...)
 *   elementClassProp(...)
 *   elementStylingApp(...)
 * }
 *
 * The creation/update methods within the builder class produce these instructions.
 */
export declare class StylingBuilder {
    private _elementIndexExpr;
    private _directiveIndexExpr;
    readonly hasBindingsOrInitialValues = false;
    private _classMapInput;
    private _styleMapInput;
    private _singleStyleInputs;
    private _singleClassInputs;
    private _lastStylingInput;
    private _stylesIndex;
    private _classesIndex;
    private _initialStyleValues;
    private _initialClassValues;
    private _useDefaultSanitizer;
    private _applyFnRequired;
    constructor(_elementIndexExpr: o.Expression, _directiveIndexExpr: o.Expression | null);
    registerBoundInput(input: t.BoundAttribute): boolean;
    registerStyleInput(propertyName: string | null, value: AST, unit: string | null, sourceSpan: ParseSourceSpan): BoundStylingEntry;
    registerClassInput(className: string | null, value: AST, sourceSpan: ParseSourceSpan): BoundStylingEntry;
    registerStyleAttr(value: string): void;
    registerClassAttr(value: string): void;
    private _buildInitExpr;
    buildCreateLevelInstruction(sourceSpan: ParseSourceSpan | null, constantPool: ConstantPool): StylingInstruction | null;
    private _buildStylingMap;
    private _buildSingleInputs;
    private _buildClassInputs;
    private _buildStyleInputs;
    private _buildApplyFn;
    buildUpdateLevelInstructions(valueConverter: ValueConverter): StylingInstruction[];
}
export {};
