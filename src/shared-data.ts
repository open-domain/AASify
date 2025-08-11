
// Define the request type with a unique name
import { RequestType } from 'vscode-languageserver';

export const StartupSuccessStatusRequest = new RequestType<string, string, void>('custom/startup-success-status-request');

// Data type to share data between language server and extension
export type SharedDataType = { 
    "workspace_path"            : string|undefined, 
    "dsl_file_extensions"       : string|undefined,
    "dsl_file_extension_list"   : string[],
    "dsl_file_list"             : string[]
};

export const defaultSharedData: SharedDataType = {
    workspace_path          : undefined,
    dsl_file_extensions     : undefined,
    dsl_file_extension_list : [],
    dsl_file_list           : []
};

