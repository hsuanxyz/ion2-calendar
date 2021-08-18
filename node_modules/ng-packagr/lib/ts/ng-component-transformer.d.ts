import * as ts from 'typescript';
/**
 * Call signature for a transformer applied to `@Component({ templateUrl: '...' })`.
 *
 * A `TemplateTransformer` will update the property assignment for `templateUrl` in the decorator.
 */
export interface TemplateTransformer {
    ({}: {
        node: ts.Node;
        sourceFile: ts.SourceFile;
        sourceFilePath: string;
        templatePath: string;
        templateFilePath: string;
    }): string | undefined | void;
}
/**
 * Call signature for a transformer applied to `@Component({ styleUrls: ['...'] })`.
 *
 * A `StylesheetTransformer` will update the property assignment for `stylesUrl` in the decorator.
 *
 * WATCH OUT! A stylesheet transformer is called for every url in the `stylesUrl` array!
 */
export interface StylesheetTransformer {
    ({}: {
        node: ts.Node;
        sourceFile: ts.SourceFile;
        sourceFilePath: string;
        stylePath: string;
        styleFilePath: string;
    }): string | undefined | void;
}
export interface ComponentSourceFileTransformer {
    ({}: {
        template: TemplateTransformer;
        stylesheet: StylesheetTransformer;
    }): ts.TransformerFactory<ts.SourceFile>;
}
export declare const transformComponentSourceFiles: ComponentSourceFileTransformer;
