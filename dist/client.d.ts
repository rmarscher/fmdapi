import { z } from "zod";
import { CreateResponse, DeleteResponse, FieldData, GenericPortalData, GetResponse, ListParams, Query, UpdateResponse, MetadataResponse, GetResponseOne, LayoutsResponse, FMRecord, ScriptsMetadataResponse } from "./client-types.js";
import type { TokenStoreDefinitions } from "./tokenStore/types.js";
type OttoAuth = {
    apiKey: string;
    ottoPort?: number;
};
type UserPasswordAuth = {
    username: string;
    password: string;
};
export declare function isOttoAuth(auth: ClientObjectProps["auth"]): auth is OttoAuth;
export type ClientObjectProps = {
    server: string;
    db: string;
    auth: OttoAuth | UserPasswordAuth;
    /**
     * The layout to use by default for all requests. Can be overrridden on each request.
     */
    layout?: string;
    tokenStore?: TokenStoreDefinitions;
};
declare class FileMakerError extends Error {
    readonly code: string;
    constructor(code: string, message: string);
}
declare function DataApi<Opts extends ClientObjectProps, Td extends FieldData = FieldData, Ud extends GenericPortalData = GenericPortalData>(input: Opts, zodTypes?: {
    fieldData: z.AnyZodObject;
    portalData?: z.AnyZodObject;
}): {
    baseUrl: URL;
    list: {
        (): Promise<GetResponse<Td, Ud>>;
        <T extends Record<string, string | number | null> = Td, U extends Ud = Ud>(args: Opts["layout"] extends string ? import("./client-types.js").ScriptParams & import("./client-types.js").PortalRangesParams<U> & {
            "layout.response"?: string | undefined;
        } & import("./client-types.js").RangeParams & {
            sort?: import("./client-types.js").Sort<T> | import("./client-types.js").Sort<T>[] | undefined;
        } & Partial<{
            /**
             * The layout to use for the request.
             */
            layout: string;
        }> & {
            fetch?: RequestInit | undefined;
        } : import("./client-types.js").ScriptParams & import("./client-types.js").PortalRangesParams<U> & {
            "layout.response"?: string | undefined;
        } & import("./client-types.js").RangeParams & {
            sort?: import("./client-types.js").Sort<T> | import("./client-types.js").Sort<T>[] | undefined;
        } & {
            /**
             * The layout to use for the request.
             */
            layout: string;
        } & {
            fetch?: RequestInit | undefined;
        }): Promise<GetResponse<T, U>>;
    };
    listAll: {
        <T_1 extends Record<string, string | number | null> = Td, U_1 extends Ud = Ud>(): Promise<FMRecord<T_1, U_1>[]>;
        <T_2 extends Record<string, string | number | null> = Td, U_2 extends Ud = Ud>(args: Opts["layout"] extends string ? import("./client-types.js").ScriptParams & import("./client-types.js").PortalRangesParams<U_2> & {
            "layout.response"?: string | undefined;
        } & import("./client-types.js").RangeParams & {
            sort?: import("./client-types.js").Sort<T_2> | import("./client-types.js").Sort<T_2>[] | undefined;
        } & Partial<{
            /**
             * The layout to use for the request.
             */
            layout: string;
        }> & {
            fetch?: RequestInit | undefined;
        } : import("./client-types.js").ScriptParams & import("./client-types.js").PortalRangesParams<U_2> & {
            "layout.response"?: string | undefined;
        } & import("./client-types.js").RangeParams & {
            sort?: import("./client-types.js").Sort<T_2> | import("./client-types.js").Sort<T_2>[] | undefined;
        } & {
            /**
             * The layout to use for the request.
             */
            layout: string;
        } & {
            fetch?: RequestInit | undefined;
        }): Promise<FMRecord<T_2, U_2>[]>;
    };
    create: <T_3 extends Td = Td, U_3 extends Ud = Ud>(args: Opts["layout"] extends string ? import("./client-types.js").ScriptParams & {
        portalData?: U_3 | undefined;
    } & {
        fieldData: Partial<T_3>;
    } & Partial<{
        /**
         * The layout to use for the request.
         */
        layout: string;
    }> & {
        fetch?: RequestInit | undefined;
    } : import("./client-types.js").ScriptParams & {
        portalData?: U_3 | undefined;
    } & {
        fieldData: Partial<T_3>;
    } & {
        /**
         * The layout to use for the request.
         */
        layout: string;
    } & {
        fetch?: RequestInit | undefined;
    }) => Promise<CreateResponse>;
    get: <T_4 extends Td = Td, U_4 extends Ud = Ud>(args: Opts["layout"] extends string ? import("./client-types.js").ScriptParams & import("./client-types.js").PortalRangesParams<U_4> & {
        "layout.response"?: string | undefined;
    } & {
        recordId: number | string;
    } & Partial<{
        /**
         * The layout to use for the request.
         */
        layout: string;
    }> & {
        fetch?: RequestInit | undefined;
    } : import("./client-types.js").ScriptParams & import("./client-types.js").PortalRangesParams<U_4> & {
        "layout.response"?: string | undefined;
    } & {
        recordId: number | string;
    } & {
        /**
         * The layout to use for the request.
         */
        layout: string;
    } & {
        fetch?: RequestInit | undefined;
    }) => Promise<GetResponse<T_4, U_4>>;
    update: <T_5 extends Td = Td, U_5 extends Ud = Ud>(args: Opts["layout"] extends string ? import("./client-types.js").ScriptParams & {
        portalData?: U_5 | undefined;
    } & {
        modId?: number | undefined;
    } & {
        fieldData: Partial<T_5>;
        recordId: number | string;
    } & Partial<{
        /**
         * The layout to use for the request.
         */
        layout: string;
    }> & {
        fetch?: RequestInit | undefined;
    } : import("./client-types.js").ScriptParams & {
        portalData?: U_5 | undefined;
    } & {
        modId?: number | undefined;
    } & {
        fieldData: Partial<T_5>;
        recordId: number | string;
    } & {
        /**
         * The layout to use for the request.
         */
        layout: string;
    } & {
        fetch?: RequestInit | undefined;
    }) => Promise<UpdateResponse>;
    delete: (args: Opts["layout"] extends string ? import("./client-types.js").ScriptParams & {
        recordId: number | string;
    } & Partial<{
        /**
         * The layout to use for the request.
         */
        layout: string;
    }> & {
        fetch?: RequestInit | undefined;
    } : import("./client-types.js").ScriptParams & {
        recordId: number | string;
    } & {
        /**
         * The layout to use for the request.
         */
        layout: string;
    } & {
        fetch?: RequestInit | undefined;
    }) => Promise<DeleteResponse>;
    metadata: (args: Opts["layout"] extends string ? {
        timeout?: number | undefined;
    } & Partial<{
        /**
         * The layout to use for the request.
         */
        layout: string;
    }> & {
        fetch?: RequestInit | undefined;
    } : {
        timeout?: number | undefined;
    } & {
        /**
         * The layout to use for the request.
         */
        layout: string;
    } & {
        fetch?: RequestInit | undefined;
    }) => Promise<MetadataResponse>;
    disconnect: () => Opts["auth"] extends OttoAuth ? never : Promise<void>;
    find: <T_6 extends Td = Td, U_6 extends Ud = Ud>(args: Opts["layout"] extends string ? import("./client-types.js").ScriptParams & import("./client-types.js").PortalRangesParams<U_6> & {
        "layout.response"?: string | undefined;
    } & import("./client-types.js").RangeParams & {
        sort?: import("./client-types.js").Sort<T_6> | import("./client-types.js").Sort<T_6>[] | undefined;
    } & {
        query: Query<T_6> | Query<T_6>[];
        timeout?: number | undefined;
    } & {
        /**
         * If true, a find that returns no results will retun an empty array instead of throwing an error.
         * @default false
         */
        ignoreEmptyResult?: boolean | undefined;
    } & Partial<{
        /**
         * The layout to use for the request.
         */
        layout: string;
    }> & {
        fetch?: RequestInit | undefined;
    } : import("./client-types.js").ScriptParams & import("./client-types.js").PortalRangesParams<U_6> & {
        "layout.response"?: string | undefined;
    } & import("./client-types.js").RangeParams & {
        sort?: import("./client-types.js").Sort<T_6> | import("./client-types.js").Sort<T_6>[] | undefined;
    } & {
        query: Query<T_6> | Query<T_6>[];
        timeout?: number | undefined;
    } & {
        /**
         * If true, a find that returns no results will retun an empty array instead of throwing an error.
         * @default false
         */
        ignoreEmptyResult?: boolean | undefined;
    } & {
        /**
         * The layout to use for the request.
         */
        layout: string;
    } & {
        fetch?: RequestInit | undefined;
    }) => Promise<GetResponse<T_6, U_6>>;
    findOne: <T_7 extends Td = Td, U_7 extends Ud = Ud>(args: Opts["layout"] extends string ? import("./client-types.js").ScriptParams & import("./client-types.js").PortalRangesParams<U_7> & {
        "layout.response"?: string | undefined;
    } & import("./client-types.js").RangeParams & {
        sort?: import("./client-types.js").Sort<T_7> | import("./client-types.js").Sort<T_7>[] | undefined;
    } & {
        query: Query<T_7> | Query<T_7>[];
        timeout?: number | undefined;
    } & Partial<{
        /**
         * The layout to use for the request.
         */
        layout: string;
    }> & {
        fetch?: RequestInit | undefined;
    } : import("./client-types.js").ScriptParams & import("./client-types.js").PortalRangesParams<U_7> & {
        "layout.response"?: string | undefined;
    } & import("./client-types.js").RangeParams & {
        sort?: import("./client-types.js").Sort<T_7> | import("./client-types.js").Sort<T_7>[] | undefined;
    } & {
        query: Query<T_7> | Query<T_7>[];
        timeout?: number | undefined;
    } & {
        /**
         * The layout to use for the request.
         */
        layout: string;
    } & {
        fetch?: RequestInit | undefined;
    }) => Promise<GetResponseOne<T_7, U_7>>;
    findFirst: <T_8 extends Td = Td, U_8 extends Ud = Ud>(args: Opts["layout"] extends string ? import("./client-types.js").ScriptParams & import("./client-types.js").PortalRangesParams<U_8> & {
        "layout.response"?: string | undefined;
    } & import("./client-types.js").RangeParams & {
        sort?: import("./client-types.js").Sort<T_8> | import("./client-types.js").Sort<T_8>[] | undefined;
    } & {
        query: Query<T_8> | Query<T_8>[];
        timeout?: number | undefined;
    } & {
        /**
         * If true, a find that returns no results will retun an empty array instead of throwing an error.
         * @default false
         */
        ignoreEmptyResult?: boolean | undefined;
    } & Partial<{
        /**
         * The layout to use for the request.
         */
        layout: string;
    }> & {
        fetch?: RequestInit | undefined;
    } : import("./client-types.js").ScriptParams & import("./client-types.js").PortalRangesParams<U_8> & {
        "layout.response"?: string | undefined;
    } & import("./client-types.js").RangeParams & {
        sort?: import("./client-types.js").Sort<T_8> | import("./client-types.js").Sort<T_8>[] | undefined;
    } & {
        query: Query<T_8> | Query<T_8>[];
        timeout?: number | undefined;
    } & {
        /**
         * If true, a find that returns no results will retun an empty array instead of throwing an error.
         * @default false
         */
        ignoreEmptyResult?: boolean | undefined;
    } & {
        /**
         * The layout to use for the request.
         */
        layout: string;
    } & {
        fetch?: RequestInit | undefined;
    }) => Promise<GetResponseOne<T_8, U_8>>;
    findAll: <T_9 extends Td = Td, U_9 extends Ud = Ud>(args: Opts["layout"] extends string ? import("./client-types.js").ScriptParams & import("./client-types.js").PortalRangesParams<U_9> & {
        "layout.response"?: string | undefined;
    } & import("./client-types.js").RangeParams & {
        sort?: import("./client-types.js").Sort<T_9> | import("./client-types.js").Sort<T_9>[] | undefined;
    } & {
        query: Query<T_9> | Query<T_9>[];
        timeout?: number | undefined;
    } & Partial<{
        /**
         * The layout to use for the request.
         */
        layout: string;
    }> & {
        fetch?: RequestInit | undefined;
    } : import("./client-types.js").ScriptParams & import("./client-types.js").PortalRangesParams<U_9> & {
        "layout.response"?: string | undefined;
    } & import("./client-types.js").RangeParams & {
        sort?: import("./client-types.js").Sort<T_9> | import("./client-types.js").Sort<T_9>[] | undefined;
    } & {
        query: Query<T_9> | Query<T_9>[];
        timeout?: number | undefined;
    } & {
        /**
         * The layout to use for the request.
         */
        layout: string;
    } & {
        fetch?: RequestInit | undefined;
    }) => Promise<FMRecord<T_9, U_9>[]>;
    layouts: () => Promise<LayoutsResponse>;
    scripts: () => Promise<ScriptsMetadataResponse>;
    executeScript: (args: Opts["layout"] extends string ? {
        script: string;
        scriptParam?: string | undefined;
        timeout?: number | undefined;
    } & Partial<{
        /**
         * The layout to use for the request.
         */
        layout: string;
    }> & {
        fetch?: RequestInit | undefined;
    } : {
        script: string;
        scriptParam?: string | undefined;
        timeout?: number | undefined;
    } & {
        /**
         * The layout to use for the request.
         */
        layout: string;
    } & {
        fetch?: RequestInit | undefined;
    }) => Promise<Pick<{
        scriptResult?: string | undefined;
        scriptError?: string | undefined;
        "scriptResult.prerequest"?: string | undefined;
        "scriptError.prerequest"?: string | undefined;
        "scriptResult.presort"?: string | undefined;
        "scriptError.presort"?: string | undefined;
    }, "scriptResult" | "scriptError">>;
};
export default DataApi;
export { DataApi, FileMakerError };
