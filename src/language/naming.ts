
import { DefaultNameProvider, 
         AstNode,
         NamedAstNode
    } from 'langium';

import * as ast from './generated/ast.js';
import { AasifyAsts } from './module.js';


export function isNamed(node: AstNode): node is NamedAstNode {
    return typeof (node as NamedAstNode).name === 'string';
}

export class AasifyNameProvider extends DefaultNameProvider {
    getSimpleName(node: AstNode): string {
        if (isNamed(node))
        {
            return node.name;
        }
        return "undefined";
    }

    // override getName(node: AstNode): string | undefined {
    //     return this.getQualifiedName(node);
    // }

    /**
     * @param qualifier if the qualifier is a `string`, simple string concatenation is done: `qualifier.name`.
     *      if the qualifier is a `PackageDeclaration` fully qualified name is created: `package1.package2.name`.
     * @param name simple name
     * @returns qualified name separated by `.`
     */
    getQualifiedName(node: AstNode | AasifyAsts ): string
    {
        let qualified_name : string = "";
        // let document_path : string = "";
        if( ast.isAasDefinition(node)){
            qualified_name = "AasDefinition" + "." +node.name;
        }
        else if( ast.isSubmodelRulesDefinition(node)){
            qualified_name = "SubmodelRulesDefinitions" + "." +node.name;
        }
        else if( ast.isSubmodelDefinitions(node)){
            qualified_name = "SubmodelDefinitions" + "." +node.name;
        }
        else {
            console.log("Error: SignalsNameProvider.getQualifiedName: Unknown AST ('"+node.$type+"')");
        }                        
        return qualified_name;        
    }
}
