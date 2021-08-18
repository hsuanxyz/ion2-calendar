import * as ts from 'typescript';
import { Node } from '../brocc/node';
import { NgEntryPoint } from '../ng-package-format/entry-point';
import { NgPackage } from '../ng-package-format/package';
import { TsConfig } from '../ts/tsconfig';
export declare const TYPE_NG_PACKAGE = "application/ng-package";
export declare const TYPE_NG_ENTRY_POINT = "application/ng-entry-point";
export declare const TYPE_STYLESHEET = "text/css";
export declare const TYPE_TEMPLATE = "text/html";
export declare const TYPE_TS_SOURCES = "application/ts";
/** A node that can be read through the `fs` api. */
export declare const URL_PROTOCOL_FILE = "file://";
/** A node that can be read through the `ts` compiler api. */
export declare const URL_PROTOCOL_TS = "ts://";
/** A node specific to angular. */
export declare const URL_PROTOCOL_NG = "ng://";
export declare function isEntryPoint(node: Node): node is EntryPointNode;
export declare function isPackage(node: Node): node is PackageNode;
export declare function isStylesheet(node: Node): node is StylesheetNode;
export declare function isTemplate(node: Node): node is TemplateNode;
export declare function isTypeScriptSources(node: Node): node is TypeScriptSourceNode;
export declare function byEntryPoint(): {
    (node: Node): boolean;
    and: (criteria: (node: Node) => boolean) => (node: Node) => boolean;
};
export declare function isEntryPointInProgress(): (node: Node) => boolean;
export declare function isFileUrl(value: string): boolean;
export declare function fileUrl(path: string): string;
export declare function fileUrlPath(url: string): string;
export declare function ngUrl(path: string): string;
export declare function isTsUrl(value: string): boolean;
export declare function tsUrl(path: string): string;
export declare class EntryPointNode extends Node {
    readonly type: string;
    data: {
        entryPoint: NgEntryPoint;
        outDir: string;
        stageDir: string;
        tsConfig?: TsConfig;
    };
}
export declare class PackageNode extends Node {
    readonly type: string;
    data: NgPackage;
}
export declare class StylesheetNode extends Node {
    readonly type: string;
    data: {
        content?: string;
    };
}
export declare class TemplateNode extends Node {
    readonly type: string;
    data: {
        content?: string;
    };
}
export declare class TypeScriptSourceNode extends Node {
    readonly type: string;
    data: ts.TransformationResult<ts.SourceFile>;
}
