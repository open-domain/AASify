import { startLanguageServer, 
         LangiumSharedServices } from 'langium/lsp';
import { NodeFileSystem } from 'langium/node';
import { createConnection,
        TextDocumentSyncKind,
        NotificationType,  
        ProposedFeatures,
        InitializeParams, 
        InitializeResult,  } from 'vscode-languageserver/node.js';
import { createAasifyServices } from './module.js';
import { StartupSuccessStatusRequest, SharedDataType } from '../shared-data.js';
import { AstNode,
            DocumentState, 
            LangiumDocument, 
            URI, 
            // UriUtils 
        } from 'langium';
import chalk from 'chalk';
import path from 'path';
import * as fs from 'fs';


let workspace_path:string|undefined = undefined;
let dsl_file_extensions:string|undefined = undefined;
let dsl_file_list         : string[] = [];

// Define request and notification types
const SharedDataRequest = new NotificationType<SharedDataType>('custom/SharedData');


// Create a connection to the client
const connection = createConnection(ProposedFeatures.all);

// Inject the shared services and language-specific services
const { shared, AasifyLanguage } = createAasifyServices({ connection, ...NodeFileSystem });


connection.onInitialize( (params:InitializeParams):InitializeResult => {
    try {
        const workspaceFolder = params.workspaceFolders?.[0]?.uri;
        if (!workspaceFolder) {
            connection.console.error('No workspace folder provided');
            return { capabilities: {} };
        }

        const workspacePath = URI.parse(workspaceFolder).fsPath;
        // const dslExtensions = ['*.string', '*.design_template', ".assets", '*.menu', '*.proj', '*.dtc']; // Replace with your DSL extensions
        console.log("Initialization : workspacePath : "+workspacePath);

        const initOptions = params.initializationOptions;
        if (initOptions) {
            console.log('Server: Received initialization options:', initOptions);

            const workspaceConfig = initOptions.workspaceConfig;
            const userInfo = initOptions.userInfo;

            console.log('Workspace Config:', workspaceConfig);
            console.log('User Info:', userInfo);
        }
        return {
            capabilities: {
                textDocumentSync: TextDocumentSyncKind.Full,
                documentHighlightProvider: true, // Declare support for document highlighting
            },
        };
    } catch(err) {
        console.error("Error during initialization:", err);
        return { 
            capabilities: {}
        };
    }
});

// Register the request handler
connection.onRequest(StartupSuccessStatusRequest, async (params: string) => {
    console.log(chalk.blue('Received Message From extension : ', params));

    // Process the request
    const response = `Aasify language server started successfully !`;

    // Return the response
    return response;
});

connection.onNotification(SharedDataRequest, (shared_data: SharedDataType) => {
    console.log(`Configuration received from extension:`);
    console.log("   workspace_path      : "+shared_data.workspace_path);
    console.log("   dsl_file_extensions : "+shared_data.dsl_file_extensions);
    workspace_path      = shared_data.workspace_path;
    dsl_file_extensions = shared_data.dsl_file_extensions;
    dsl_file_list       = shared_data.dsl_file_list;
    LoadWorkspace(shared, shared_data);
});

function toFileUri(filePath: string): string {
    let normalized = path.resolve(filePath).replace(/\\/g, '/');
    if (!normalized.startsWith('/')) {
        normalized = '/' + normalized;
    }
    return 'file://' + normalized;
}

export async function LoadWorkspace(services : LangiumSharedServices, _shared_data:SharedDataType) {

    await services.workspace.DocumentBuilder.waitUntil(6);

    const registry = services.ServiceRegistry;

    if (!registry) {
        throw new Error('ServiceRegistry is not initialized.');
    }

    console.log(chalk.yellow(`Loading workspace`));

    if(workspace_path && dsl_file_extensions && dsl_file_list) {
        let dsl_files = dsl_file_list;
       
        for (const uri of dsl_files) {

            // Suppose 'uri' is a path or a URI object
            const fileUriString = toFileUri(uri.toString());
            const langiumUri = URI.parse(fileUriString);
            // const langiumUri = URI.parse(uri.toString());
            const service = registry.getServices(langiumUri);
            if (service) {
                console.log('Indexing "'+uri+'"');
                const indexManager = service.shared.workspace.IndexManager;
                const langium_doc_factory = service.shared.workspace.LangiumDocumentFactory
                
                    console.log("fileUriString =", fileUriString)
                    console.log("langiumUri =", langiumUri)
                    
                if (!langiumUri || !langiumUri.fsPath || !fs.existsSync(langiumUri.fsPath)) {
                    throw new Error(`Invalid or non-existent URI: ${langiumUri}`);
                }

                if (!service.shared.workspace?.LangiumDocumentFactory) {
                    throw new Error('LangiumDocumentFactory is not available in the shared workspace.');
                }

                const document = await langium_doc_factory.fromUri(langiumUri);
                await indexManager.updateContent(document);
            }
        }    
    
        for (const uri of dsl_files) {
            const langiumUri = URI.parse(uri.toString());
            const service = registry.getServices(langiumUri);
            if (service) {
                console.log('Building "'+uri+'"');
                const documentBuilder = service.shared.workspace.DocumentBuilder;
                const langium_doc_factory = service.shared.workspace.LangiumDocumentFactory
                
                if (!langiumUri || !langiumUri.fsPath || !fs.existsSync(langiumUri.fsPath)) {
                    throw new Error(`Invalid or non-existent URI: ${langiumUri}`);
                }

                if (!service.shared.workspace?.LangiumDocumentFactory) {
                    throw new Error('LangiumDocumentFactory is not available in the shared workspace.');
                }

                const document = await langium_doc_factory.fromUri(langiumUri);
                await documentBuilder.build([document], {validation:false} );
            }
        }
        console.log('All DSL files have been loaded and processed.');
    }
}

var CurrentlyHighlightedFile : string | undefined = undefined;

export function get_currently_highlighted_file()
{
    return CurrentlyHighlightedFile;
}

// Send a notification with the serialized AST after every document change
type DocumentChange = { uri: string, content: string };
const documentChangeNotification = new NotificationType<DocumentChange>('browser/DocumentChange');
const aasify_jsonSerializer   = AasifyLanguage.serializer.JsonSerializer;

const buildphase_callback = async (documents: LangiumDocument<AstNode>[]) => {
    for (const document of documents) 
    {
        const display_template_json = aasify_jsonSerializer.serialize(document.parseResult.value);
        await connection.sendNotification(documentChangeNotification, {
            uri: document.uri.toString(),
            content: display_template_json
        });
    }
}

shared.workspace.DocumentBuilder.onBuildPhase(DocumentState.Validated, buildphase_callback);

console.log = connection.console.log.bind(connection.console);
console.error = connection.console.error.bind(connection.console);


connection.onDocumentHighlight((documentHighlightParams) => 
{
    if(documentHighlightParams)
    {
        let document_path = URI.parse(documentHighlightParams.textDocument.uri).fsPath;
        CurrentlyHighlightedFile = document_path;
        console.log("Highlighted : "+document_path);
    }
    else
    {
        CurrentlyHighlightedFile = undefined;
    }
    return [];
});

// Start the language server with the shared services
try {
    startLanguageServer(shared);
} catch (err) {
    console.error('Server crashed during startup:', err);
    process.exit(1);
}
