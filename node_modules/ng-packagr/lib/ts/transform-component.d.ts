import * as ts from 'typescript';
/**
 * A transformer that updates the metadata for Angular `@Component({})` decorators.
 */
export declare type ComponentTransformer = {
    /** TypeScript transformer to update the property assignment for `templateUrl: '..'`. */
    templateUrl: ts.Transformer<ts.PropertyAssignment>;
    /** TypeScript transformer to update the property assignment for `styleUrls: []`. */
    styleUrls: ts.Transformer<ts.PropertyAssignment>;
    /** TypeScript transformer to update the source file. */
    file?: ts.Transformer<ts.SourceFile>;
};
export declare const transformComponent: (transformer: ComponentTransformer) => ts.TransformerFactory<ts.SourceFile>;
