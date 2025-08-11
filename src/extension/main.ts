import type { LanguageClientOptions, ServerOptions} from 'vscode-languageclient/node.js';
import * as path from 'node:path';
import { LanguageClient, TransportKind } from 'vscode-languageclient/node.js';
import * as vscode from 'vscode';
import * as fs from 'fs';
import { SharedDataType, StartupSuccessStatusRequest } from '../shared-data.js';

let language_client: LanguageClient | undefined;

const dsl_file_extensions = '**/*.{aasify}';
export const dsl_file_extension_list = convertGlobToPatterns(dsl_file_extensions);

function convertGlobToPatterns(globPattern: string): string[] {
    // Match the file extensions within curly braces
    const match = globPattern.match(/\*\*\/\*\.\{([^}]+)\}/);
    if (!match) {
        throw new Error('Invalid glob pattern');
    }

    // Split extensions by comma and trim whitespace
    const extensions = match[1].split(',').map(ext => ext.trim());

    // Create individual patterns for each extension
    return extensions.map(ext => `*.${ext}`);
}

// This function is called when the extension is activated.
export async function activate(context: vscode.ExtensionContext): Promise<void> {
    language_client = await startLanguageClient(context);
}

// This function is called when the extension is deactivated.
export async function deactivate(): Promise<Thenable<void> | undefined> {
    if (language_client) {
        if(language_client.isRunning()) {
            try {
                await language_client.stop();
                language_client = undefined;
            }
            catch(err) {
                console.error("Failed to stop language clent:",err);
            }
        }
    }
    return undefined;
}

export function get_workspace_folder(): (string|undefined) {    
    if (vscode.workspace && vscode.workspace.workspaceFolders) {
        const folders = vscode.workspace.workspaceFolders.map(folder => folder.uri.fsPath);
        console.log('Workspace path : ',folders);
        return folders[0];
    }
    else {
        console.log('No workspace folders.');
        return undefined;
    }
}

function getAllFilesFromFolder(folderPath: string|undefined): string[] {
    const files: string[] = [];
    if(folderPath){
        try {
            const items = fs.readdirSync(folderPath);
            for (const item of items) {
                const fullPath = path.join(folderPath, item);
                const stat = fs.statSync(fullPath);
                if (stat.isFile()) {
                    files.push(fullPath);
                } else if (stat.isDirectory()) {
                    files.push(...getAllFilesFromFolder(fullPath)); // Recursive call
                }
            }
        } catch (error) {
            console.error(`Error reading folder: ${error}`);
        }
    }
    return files;
}

function filterFilesByExtensions(files: string[], pattern: string): string[] {
    // Extract the extensions from the pattern
    const extensions = pattern.match(/\*\*\/\*\.\{([^}]+)\}/)?.[1];
    if (!extensions) {
        console.error("Invalid pattern format");
        return [];
    }

    const extensionSet = new Set(extensions.split(',').map(ext => ext.trim()));

    // Filter files by matching extensions
    return files.filter(file => {
        const fileExtension = file.split('.').pop(); // Get file extension
        return fileExtension && extensionSet.has(fileExtension);
    });
}

export async function TransmitSharedData(client:LanguageClient) {
    let workspace_path = get_workspace_folder();
    let file_list = getAllFilesFromFolder(workspace_path);
    let dsl_file_list = filterFilesByExtensions(file_list, dsl_file_extensions);
    let shared_data : SharedDataType = {
        workspace_path: workspace_path,
        dsl_file_extensions: dsl_file_extensions,
        dsl_file_list: dsl_file_list,
        dsl_file_extension_list: dsl_file_extension_list
    }
    
    console.log(`Transmitting configuration to server:`);
    console.log("   workspace_path      : "+shared_data.workspace_path);
    console.log("   dsl_file_extensions : "+shared_data.dsl_file_extensions);
    
    if(client?.isRunning()) {
        await client.sendNotification("custom/SharedData", shared_data).then( 
            () => {
                console.error("Notification sent to client successfully");
            })
            .catch(error => {
                console.error("Error occurred:", error);
        });
    }
}

async function startLanguageClient(context: vscode.ExtensionContext): Promise<LanguageClient> {
    const serverModule = context.asAbsolutePath(path.join('out', 'language', 'main.cjs'));
    // The debug options for the server
    // --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging.
    // By setting `process.env.DEBUG_BREAK` to a truthy value, the language server will wait until a debugger is attached.
    const debugOptions = { execArgv: ['--nolazy', `--inspect${process.env.DEBUG_BREAK ? '-brk' : ''}=${process.env.DEBUG_SOCKET || '6009'}`] };

    // If the extension is launched in debug mode then the debug server options are used
    // Otherwise the run options are used
    const serverOptions: ServerOptions = {
        run: { module: serverModule, transport: TransportKind.ipc },
        debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions }
    };

    const fileSystemWatcher = vscode.workspace.createFileSystemWatcher(dsl_file_extensions);
    context.subscriptions.push(fileSystemWatcher);

    // Options to control the language client
    const clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: '*', language: 'aasify' }],
        synchronize:{
            // Notify the server about file changes to files contained in the workspace
            fileEvents: fileSystemWatcher
        }
    };

    // Create the language client and start the client.
    const client = new LanguageClient(
        'aasify',
        'AASify',
        serverOptions,
        clientOptions
    );

    context.subscriptions.push(client);

    // Global error handler for unhandled promise rejections. This can help catch any rejections that are not handled explicitly:
    process.on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled Rejection at:', promise, '\nreason:', reason);
    });

    // Global error handler for unhandled promise exceptions. This can help catch any exceptions that are not handled explicitly:
    process.on('uncaughtException', (err) => {
        console.error('Uncaught Exception:', err);
      });
    
    if(client?.isRunning()) {
        await client.sendRequest(StartupSuccessStatusRequest, 'Aasify extension started successfully !')
        .then((response) => {
            console.log('Received Message From language server : ', response);
        })
        .catch(err => {
            console.error('Language server request failed:', err);
        });
        await TransmitSharedData(client);
    }
    else {
        console.error("Client is not running, skipping request.");
    }

    let running_state = false;
    // Monitor client's state changes
    client.onDidChangeState((event) => {
        if (event.newState === 2) { // Running = 2
            console.log('Aasify is running !');
        }
        if ((running_state === true) && (event.newState === 1)){ // Stopped = 1
            console.log('Aasify is stopped !');
        }
        if (event.newState === 3) { // Starting = 3
            running_state = true;
            console.log('Aasify is starting !');
        }
    });


    // Start the client. This will also launch the server
    client.start();
    return client;
}
