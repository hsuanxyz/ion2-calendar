import * as ts from 'typescript';
export declare const isComponentDecorator: (node: ts.Node) => node is ts.Decorator;
export declare const isPropertyAssignmentFor: (node: ts.Node, name: string) => node is ts.PropertyAssignment;
export declare const isTemplateUrl: (node: ts.Node) => node is ts.PropertyAssignment;
export declare const isStyleUrls: (node: ts.Node) => node is ts.PropertyAssignment;
export declare const isImportFromModule: (node: ts.Node, moduleIdentifier: string) => node is ts.ImportDeclaration;
export declare const resolveImportSymbolsFromModule: (node: ts.Node, moduleIdentifier: string) => {
    [key: string]: string;
    __namespace?: string;
};
