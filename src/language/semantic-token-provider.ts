import {AstNode} from "langium";
import { AbstractSemanticTokenProvider, SemanticTokenAcceptor } from 'langium/lsp';
// import {SemanticTokenTypes} from "vscode-languageserver";
import * as ast from './generated/ast.js';



/**
 * The SemanticTokenProvider deals with semantic highlighting. While syntax highlighting can
 * be done on token level by TextMate, semantic highlighting allows even more granular and
 * type specific options.
 *
 * For this purpose, a SemanticTokenType is defined for each component of each language
 * element, which is returned to the frontend by the Language Server. Based on these
 * types, the UI determines the color to be displayed.
 *
 * IMPORTANT: It is not possible to assign specific colors at this point. The final design is
 * exclusively determined by the UI.
 */
export class AasifySemanticTokenProvider extends AbstractSemanticTokenProvider {
    protected override highlightElement(node: AstNode, acceptor: SemanticTokenAcceptor): void {
        if (ast.isAasModel(node)) {
            // acceptor({node, property: "name", type: SemanticTokenTypes.class});
        } 
    }
}