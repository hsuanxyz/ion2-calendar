import * as ts from 'typescript';
export interface DependencyAnalyser {
    (sourceFile: ts.SourceFile, moduleId: string): void;
}
export declare const analyseDependencies: (analyser: DependencyAnalyser) => (context: ts.TransformationContext) => (sourceFile: ts.SourceFile) => ts.SourceFile;
