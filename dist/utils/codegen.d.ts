import { DataApi } from "../index.js";
import { ClientObjectProps } from "../client.js";
import { TokenStoreDefinitions } from "../tokenStore/types.js";
type TSchema = {
    name: string;
    type: "string" | "fmnumber" | "valueList";
    values?: string[];
};
type BuildSchemaArgs = {
    schemaName: string;
    schema: Array<TSchema>;
    type: "zod" | "ts";
    portalSchema?: {
        schemaName: string;
        schema: Array<TSchema>;
    }[];
    valueLists?: {
        name: string;
        values: string[];
    }[];
    envNames: Omit<ClientObjectProps, "layout" | "tokenStore">;
    layoutName: string;
    strictNumbers?: boolean;
    configLocation?: string;
    webviewerScriptName?: string;
    clientBody?: string;
} & Pick<GenerateSchemaOptions, "tokenStore">;
export declare const buildSchema: ({ type, ...args }: BuildSchemaArgs) => string;
export declare const getSchema: (args: {
    client: ReturnType<typeof DataApi>;
    layout: string;
    valueLists?: ValueListsOptions;
}) => Promise<{
    schema: TSchema[];
    portalSchema: {
        schemaName: string;
        schema: TSchema[];
    }[];
    valueLists: {
        name: string;
        values: string[];
    }[];
} | undefined>;
export type ValueListsOptions = "strict" | "allowEmpty" | "ignore";
export type GenerateSchemaOptions = {
    envNames?: Partial<Omit<ClientObjectProps, "layout">>;
    schemas: Array<{
        layout: string;
        schemaName: string;
        valueLists?: ValueListsOptions;
        /**
         * If `true`, the generated files will include a layout-specific client. Set this to `false` if you only want to use the types. Overrides the top-level generateClient option for this specific schema.
         * @default true
         */
        generateClient?: boolean;
        /** If `true`, number fields will be typed as `number | null` instead of `number | string`. If the data cannot be parsed as a number, it will be set to `null`.
         * @default false
         */
        strictNumbers?: boolean;
    }>;
    /**
     * If `true`, the generated files will include a layout-specific client. Set this to `false` if you only want to use the types
     * @default true
     */
    generateClient?: boolean;
    path?: string;
    useZod?: boolean;
    tokenStore?: () => TokenStoreDefinitions;
    /**
     * If set, the generated files will include the webviewer client instead of the standard REST API client.
     * This script should pass the parameter to the Execute Data API Script step and return the result to the webviewer per the "@proofgeist/fm-webviewer-fetch" documentation.
     * Requires "@proofgeist/fm-webviewer-fetch" installed as a peer dependency.
     * The REST API client (and related credentials) is still needed to generate the types.
     *
     * @link https://fm-webviewer-fetch.proofgeist.com/
     */
    webviewerScriptName?: string;
    /**
     * optional custom template
     */
    clientBody?: string;
};
export declare const generateSchemas: (options: GenerateSchemaOptions, configLocation?: string) => Promise<void>;
export {};
