
import { 
    AstNode,
    DefaultScopeProvider,
    EMPTY_SCOPE, 
    ReferenceInfo, 
    Scope, 
    StreamScope,
} from 'langium';
import { LangiumServices } from 'langium/lsp';

/**
 * Special scope provider that matches symbol names regardless of lowercase or uppercase.
 */
export class AasifyScopeProvider extends DefaultScopeProvider
{    
    constructor(services: LangiumServices) {
        super(services);
    }
    
    // Return a scope describing what elements are visible for the given AST node and cross-reference identifier.
    override getScope(context: ReferenceInfo): Scope {
        const reference = this.getReferenceType(context);
        if (reference) { 
            try {
                // Get all elements of the type being referenced
                // const elements = this.getAllElements(reference, currentDocument);
                const elements = this.indexManager.allElements().filter(
                    desc => this.scope_map(reference, desc.type)
                );

                // const global_scope = this.getGlobalScope(reference, context);
                const scope_var = this.createScope(elements, undefined); // Pass `undefined` for outerScope if none exists
            
                // Return a scope containing the elements
                return scope_var;
            }
            catch (error) { 
                console.error('Error in scope resolution:'+JSON.stringify(error));
                throw error;
            }
        }
        else { 
            return EMPTY_SCOPE; // Return an empty scope if reference type is unavailable
        }
    }
    
    getScopeByAST(context: AstNode): Scope {
        const reference = context.$type;
        if (reference) { 
            try {
                // Get all elements of the type being referenced
                // const elements = this.getAllElements(reference, currentDocument);
                const elements = this.indexManager.allElements().filter(
                    desc => this.scope_map(reference, desc.type)
                );

                // const global_scope = this.getGlobalScope(reference, context);
                const scope_var = this.createScope(elements, undefined); // Pass `undefined` for outerScope if none exists
            
                // Return a scope containing the elements
                return scope_var;
            }
            catch (error) { 
                console.error('Error in scope resolution:'+JSON.stringify(error));
                throw error;
            }
        }
        else { 
            return EMPTY_SCOPE; // Return an empty scope if reference type is unavailable
        }
    }

    scope_map(source_reference:string, test_reference:string):boolean {
        let ret : boolean = false;
        switch (source_reference) {
            case "AasDefinition": // In AasDefinition, SubmodelDefinitions is being referenced
                if(test_reference === "SubmodelDefinitions") {
                    ret = true;
                }
            break;
        }
        return ret;
    }

    private getReferenceType(context: ReferenceInfo):string {        
        const referenceType = context.reference.$refNode?.astNode?.$type;
        if (!referenceType) {
            throw new Error(`Unable to determine reference type for context: ${JSON.stringify(context)}`);
        }
        return referenceType;
    }

    protected override getGlobalScope(referenceType: string, context:ReferenceInfo): Scope
    {
        // Access all indexed documents
        console.log("SignalsScopeProvider::getGlobalScope::referenceType: "+referenceType);
        const elements = this.indexManager.allElements();
        return new StreamScope(elements, undefined, { caseInsensitive: false });
    }
}
