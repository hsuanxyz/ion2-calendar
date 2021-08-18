import * as ts from 'typescript';
/**
 * An extension to TypeScript source files that allows to replace text spands in the original
 * source text with synthesized source text.
 */
export interface SynthesizedSourceFile extends ts.SourceFile {
    __replacements?: Replacement[];
}
export interface Replacement {
    from: number;
    to: number;
    text: string;
}
export declare function isSynthesizedSourceFile(sourceFile: ts.SourceFile): sourceFile is SynthesizedSourceFile;
/**
 * Adds a {@link Replacement} marker to the TypeScript source file of `node`. The source text of
 * `node` should be replaced by the `replacement` source text in subsequent processing.
 *
 * @param node The source node that should be replaced
 * @param replacement The synthesized source text that will replace the node.
 */
export declare function replaceWithSynthesizedSourceText(node: ts.Node, replacement: string): SynthesizedSourceFile;
/**
 * Writes TypeScript source text to a string, potentially applying replacements.
 *
 * @param sourceFile TypeScript source file, either original or synthesiized sources
 */
export declare function writeSourceText(sourceFile: ts.SourceFile | SynthesizedSourceFile): string;
/**
 * Writes a TypeScript source file, potentially applying replacements, and returns a 'fresh' source
 * file instance that may be used for later processing.
 *
 * @param sourceFile TypeScript source file, either original or synthesized sources
 */
export declare function writeSourceFile(sourceFile: ts.SourceFile | SynthesizedSourceFile): ts.SourceFile;
