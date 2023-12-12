import { z } from "zod";
import { FieldData, GenericPortalData, GetResponse, ListParams, Query, GetResponseOne, FMRecord } from "./client-types.js";
declare const ZodOptions: z.ZodObject<{
    scriptName: z.ZodString;
    layout: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    scriptName: string;
    layout?: string | undefined;
}, {
    scriptName: string;
    layout?: string | undefined;
}>;
export type ClientObjectProps = z.infer<typeof ZodOptions>;
declare class FileMakerError extends Error {
    readonly code: string;
    constructor(code: string, message: string);
}
/**
 * A client intended to be used in a webviewer. This client uses the `fm-webviewer-fetch` package to make requests.
 * It requires that you have a script in your FM file that passes the parameter to the `Execute Data API` script step
 * and returns the result back to the webviewer, according to the `fm-webviewer-fetch` spec.
 * @link https://fm-webviewer-fetch.proofgeist.com/
 */
declare function DataApi<Opts extends ClientObjectProps, Td extends FieldData = FieldData, Ud extends GenericPortalData = GenericPortalData>(input: Opts, zodTypes?: {
    fieldData: z.AnyZodObject;
    portalData?: z.AnyZodObject;
}): {
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
    get: <T_3 extends Td = Td, U_3 extends Ud = Ud>(args: Opts["layout"] extends string ? import("./client-types.js").ScriptParams & import("./client-types.js").PortalRangesParams<U_3> & {
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
    } : import("./client-types.js").ScriptParams & import("./client-types.js").PortalRangesParams<U_3> & {
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
    }) => Promise<GetResponse<T_3, U_3>>;
    find: <T_4 extends Td = Td, U_4 extends Ud = Ud>(args: Opts["layout"] extends string ? import("./client-types.js").ScriptParams & import("./client-types.js").PortalRangesParams<U_4> & {
        "layout.response"?: string | undefined;
    } & import("./client-types.js").RangeParams & {
        sort?: import("./client-types.js").Sort<T_4> | import("./client-types.js").Sort<T_4>[] | undefined;
    } & {
        query: Query<T_4> | Query<T_4>[];
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
    } : import("./client-types.js").ScriptParams & import("./client-types.js").PortalRangesParams<U_4> & {
        "layout.response"?: string | undefined;
    } & import("./client-types.js").RangeParams & {
        sort?: import("./client-types.js").Sort<T_4> | import("./client-types.js").Sort<T_4>[] | undefined;
    } & {
        query: Query<T_4> | Query<T_4>[];
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
    }) => Promise<GetResponse<T_4, U_4>>;
    findOne: <T_5 extends Td = Td, U_5 extends Ud = Ud>(args: Opts["layout"] extends string ? import("./client-types.js").ScriptParams & import("./client-types.js").PortalRangesParams<U_5> & {
        "layout.response"?: string | undefined;
    } & import("./client-types.js").RangeParams & {
        sort?: import("./client-types.js").Sort<T_5> | import("./client-types.js").Sort<T_5>[] | undefined;
    } & {
        query: Query<T_5> | Query<T_5>[];
        timeout?: number | undefined;
    } & Partial<{
        /**
         * The layout to use for the request.
         */
        layout: string;
    }> & {
        fetch?: RequestInit | undefined;
    } : import("./client-types.js").ScriptParams & import("./client-types.js").PortalRangesParams<U_5> & {
        "layout.response"?: string | undefined;
    } & import("./client-types.js").RangeParams & {
        sort?: import("./client-types.js").Sort<T_5> | import("./client-types.js").Sort<T_5>[] | undefined;
    } & {
        query: Query<T_5> | Query<T_5>[];
        timeout?: number | undefined;
    } & {
        /**
         * The layout to use for the request.
         */
        layout: string;
    } & {
        fetch?: RequestInit | undefined;
    }) => Promise<GetResponseOne<T_5, U_5>>;
    findFirst: <T_6 extends Td = Td, U_6 extends Ud = Ud>(args: Opts["layout"] extends string ? import("./client-types.js").ScriptParams & import("./client-types.js").PortalRangesParams<U_6> & {
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
    }) => Promise<GetResponseOne<T_6, U_6>>;
    findAll: <T_7 extends Td = Td, U_7 extends Ud = Ud>(args: Opts["layout"] extends string ? import("./client-types.js").ScriptParams & import("./client-types.js").PortalRangesParams<U_7> & {
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
    }) => Promise<FMRecord<T_7, U_7>[]>;
};
export default DataApi;
export { DataApi, FileMakerError };
