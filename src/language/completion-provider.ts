import { IndexManager, 
    // AstNode, 
    // Reference, 
    // ReferenceInfo, 
    ScopeProvider } from 'langium';
import { CompletionContext, DefaultCompletionProvider, CompletionAcceptor, NextFeature, LangiumServices } from 'langium/lsp';
import { AasifyScopeProvider } from './scope-provider.js';
// import * as ast from '../generated/ast.js';

export class AasifyCompletionProvider extends  DefaultCompletionProvider{
    index_manager : IndexManager | undefined;
    scope_provider : ScopeProvider | undefined;

    constructor(services: LangiumServices) {
        super(services);
        this.index_manager = services.shared.workspace.IndexManager;
        this.scope_provider = services.references.ScopeProvider;
    }
    
    override async completionFor(context: CompletionContext, next: NextFeature, acceptor: CompletionAcceptor): Promise<void> {
        // Call default completion logic
        try {
            // inject the custom items on top of default
            const node = context.node;
            if(node){
                const scope_elements = (this.scopeProvider as AasifyScopeProvider).getScopeByAST(node);

                for (const element of scope_elements.getAllElements()) {
                    acceptor(context, {
                        label           :   element.name,
                        nodeDescription :   element
                    } );
                }

                // show the default items for code completion
                // TODO: correct problem - [Error - 12:35:24 AM] [object Object]
                if((next) && (next.type)) {
                    // console.log("context = "+context);
                    // console.log("context.node?.$type = "+context.node?.$type);
                    await super.completionFor(context, next, acceptor);
                    // console.log("next = "+next.type);
                }
            }
            else{
                return;
            }
        } catch (error) {
            console.error('Error in completion provider:', error);
            throw error; // Allow server to report the error to the client
        }
    }

}
