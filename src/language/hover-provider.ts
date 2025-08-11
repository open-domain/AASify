import { 
            AstNode,
            MaybePromise 
} from "langium";

import {
            AstNodeHoverProvider
} from "langium/lsp"

import { Hover } from "vscode-languageclient";
import * as ast from './generated/ast.js';

export class AasifyHoverProvider extends AstNodeHoverProvider
{
    protected getAstNodeHoverContent(node: AstNode): MaybePromise<Hover | undefined> 
    {
        var hover_text = "";

        if(ast.isAasDefinition(node))
        {
            hover_text = "AAS definition: " + node.name + "\n\n" +
                "AAS definitions are the root elements of an Asset Administration Shell (AAS) model. They define the structure and properties of the AAS, including its submodels and their relationships.";
        }

        return { 
            contents: {
                kind: 'markdown',
                value: hover_text
            }
        }
    }
}