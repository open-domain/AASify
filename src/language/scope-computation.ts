import {AstNodeDescription, 
        interruptAndCheck, 
        // DefaultScopeComputation, 
        LangiumDocument, 
        Cancellation,
        AstUtils,
        AstNode,
        MultiMap,        
        PrecomputedScopes,
        DefaultScopeComputation,
        // URI
} from 'langium';

import * as ast from './generated/ast.js';
import {  AasifyNameProvider } from './naming.js';
import { AasifyAsts } from './module.js';

export class AasifyScopeComputation extends DefaultScopeComputation
{
    // constructor(services: LangiumServices) { super(services); }
    
    // Creates descriptions of all AST nodes that shall be exported into the global scope from the given document.
    // These descriptions are gathered by the IndexManager and stored in the global index so they can be referenced from other documents.
    override async computeExports(document: LangiumDocument, 
                cancelToken = Cancellation.CancellationToken.None): Promise< AstNodeDescription[] >
    {
        const exportedDescriptions: AstNodeDescription[] = [];
        for (const modelNode of AstUtils.streamAllContents(document.parseResult.value))
        {
           await interruptAndCheck(cancelToken);
            if(ast.isAasDefinition(modelNode)         ||
               ast.isSubmodelRulesDefinition(modelNode)              ||
               ast.isSubmodelDefinitions(modelNode)) {
                let name = (this.nameProvider as AasifyNameProvider).getSimpleName(modelNode);
                const description = this.descriptions.createDescription(modelNode, name, document);
                exportedDescriptions.push(description);
            }
        }
        return exportedDescriptions;
    }
    
    override async computeLocalScopes(document: LangiumDocument, cancelToken = Cancellation.CancellationToken.None): Promise<PrecomputedScopes> {
        const model = document.parseResult.value;
        const scopes = new MultiMap<AstNode, AstNodeDescription>();
        if(ast.isAasModel(model)){
            await this.processAasModel(model, scopes, document, cancelToken);
        }
        return scopes;
    }

    private async processAasModel(model: ast.AasModel,
                                      scopes: MultiMap<AstNode, AstNodeDescription>,
                                      document: LangiumDocument,
                                      cancelToken: Cancellation.CancellationToken): Promise<void> {
        // Process the AasModel and populate the scopes
        await this.processContainer(model, scopes, document, cancelToken);
    }
    
    protected async processContainer(container: AstNode,
                                     scopes: MultiMap<AstNode, AstNodeDescription>,// PrecomputedScopes, 
                                     document: LangiumDocument,
                                     cancelToken: Cancellation.CancellationToken): Promise<AstNodeDescription[]> {
        const localDescriptions: AstNodeDescription[] = [];
        if(ast.isAasModel(container)) {
            await interruptAndCheck(cancelToken);
            container?.aas_elements?.forEach(node => {
                if(ast.isAasDefinition(node)) {
                    let name = (this.nameProvider as AasifyNameProvider).getQualifiedName(node);
                    const description = this.descriptions.createDescription(node, name, document);
                    const qualified   = this.astQualifiedDescription(node, description, document);
                    localDescriptions.push(qualified);
                }
                else if(ast.isSubmodelRulesDefinition(node)) {
                    let name = (this.nameProvider as AasifyNameProvider).getQualifiedName(node);
                    const description = this.descriptions.createDescription(node, name, document);
                    const qualified   = this.astQualifiedDescription(node, description, document);
                    localDescriptions.push(qualified);
                }
                else if(ast.isSubmodelDefinitions(node)) {
                    let name = (this.nameProvider as AasifyNameProvider).getQualifiedName(node);
                    const description = this.descriptions.createDescription(node, name, document);
                    const qualified   = this.astQualifiedDescription(node, description, document);
                    localDescriptions.push(qualified);
                }
            })
        }
        
        scopes.addAll(container, localDescriptions);
        return localDescriptions;
    }

    protected astQualifiedDescription(node: AasifyAsts , 
                                      description: AstNodeDescription,
                                      document: LangiumDocument): AstNodeDescription {
        const name = (this.nameProvider as AasifyNameProvider).getQualifiedName(node);
        // console.log("        DT-ComputingLocalScopes : "+name);
        return this.descriptions.createDescription(description.node!, name, document);
    }

}

