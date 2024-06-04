var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { ZGetResponse, } from "./client-types.js";
import { memoryStore } from "./tokenStore/memory.js";
function asNumber(input) {
    return typeof input === "string" ? parseInt(input) : input;
}
export function isOttoAuth(auth) {
    return "apiKey" in auth;
}
const ZodOptions = z.object({
    server: z
        .string()
        .refine((val) => val.startsWith("http"), { message: "must include http" }),
    db: z.string().min(1),
    auth: z.union([
        z.object({
            apiKey: z.string().min(1),
            ottoPort: z.number().optional(),
        }),
        z.object({
            username: z.string().min(1),
            password: z.string().min(1),
        }),
    ]),
    layout: z.string().optional(),
    tokenStore: z
        .object({
        getKey: z.function().args().returns(z.string()).optional(),
        getToken: z
            .function()
            .args(z.string())
            .returns(z.union([z.string().nullable(), z.promise(z.string().nullable())])),
        setToken: z.function().args(z.string(), z.string()).returns(z.any()),
        clearToken: z.function().args(z.string()).returns(z.void()),
    })
        .optional(),
});
class FileMakerError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
    }
}
function DataApi(input, zodTypes) {
    var _a, _b;
    const options = ZodOptions.strict().parse(input); // validate options
    const tokenStore = (_a = options.tokenStore) !== null && _a !== void 0 ? _a : memoryStore();
    const baseUrl = new URL(`${options.server}/fmi/data/vLatest/databases/${options.db}`);
    if ("apiKey" in options.auth) {
        if (options.auth.apiKey.startsWith("KEY_")) {
            // otto v3 uses port 3030
            baseUrl.port = ((_b = options.auth.ottoPort) !== null && _b !== void 0 ? _b : 3030).toString();
        }
        else if (options.auth.apiKey.startsWith("dk_")) {
            // otto v4 uses default port, but with /otto prefix
            baseUrl.pathname = `/otto/fmi/data/vLatest/databases/${options.db}`;
        }
        else {
            throw new Error("Invalid Otto API key format. Must start with 'KEY_' (Otto v3) or 'dk_' (OttoFMS)");
        }
    }
    function getToken(refresh = false, fetchOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            if ("apiKey" in options.auth)
                return options.auth.apiKey;
            if (!tokenStore)
                throw new Error("No token store provided");
            if (!tokenStore.getKey) {
                tokenStore.getKey = () => `${options.server}/${options.db}`;
            }
            if (tokenStore === undefined)
                throw new Error("No token store provided");
            if (!tokenStore.getKey)
                throw new Error("No token store key provided");
            let token = yield tokenStore.getToken(tokenStore.getKey());
            if (refresh)
                token = null; // clear token so are forced to get a new one
            if (!token) {
                const res = yield fetch(`${baseUrl}/sessions`, Object.assign(Object.assign({}, fetchOptions), { method: "POST", headers: Object.assign(Object.assign({}, fetchOptions === null || fetchOptions === void 0 ? void 0 : fetchOptions.headers), { "Content-Type": "application/json", Authorization: `Basic ${Buffer.from(`${options.auth.username}:${options.auth.password}`).toString("base64")}` }) }));
                if (!res.ok) {
                    const data = yield res.json();
                    throw new FileMakerError(data.messages[0].code, data.messages[0].message);
                }
                token = res.headers.get("X-FM-Data-Access-Token");
                if (!token)
                    throw new Error("Could not get token");
            }
            tokenStore.setToken(tokenStore.getKey(), token);
            return token;
        });
    }
    function request(params) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const { query, body, method = "POST", retry = false, fetchOptions = {}, } = params;
            const url = new URL(`${baseUrl}${params.url}`);
            if (query) {
                const searchParams = new URLSearchParams(query);
                if (query.portalRanges && typeof query.portalRanges === "object") {
                    for (const [portalName, value] of Object.entries(query.portalRanges)) {
                        if (value) {
                            value.offset &&
                                value.offset > 0 &&
                                searchParams.set(`_offset.${portalName}`, value.offset.toString());
                            value.limit &&
                                searchParams.set(`_limit.${portalName}`, value.limit.toString());
                        }
                    }
                }
                searchParams.delete("portalRanges");
                url.search = searchParams.toString();
            }
            if (body && "portalRanges" in body) {
                for (const [portalName, value] of Object.entries(body.portalRanges)) {
                    if (value) {
                        value.offset &&
                            value.offset > 0 &&
                            url.searchParams.set(`_offset.${portalName}`, value.offset.toString());
                        value.limit &&
                            url.searchParams.set(`_limit.${portalName}`, value.limit.toString());
                    }
                }
                delete body.portalRanges;
            }
            const controller = new AbortController();
            let timeout = null;
            if (params.timeout)
                timeout = setTimeout(() => controller.abort(), params.timeout);
            const token = yield getToken(retry);
            const res = yield fetch(url.toString(), Object.assign(Object.assign({}, fetchOptions), { method, body: body ? JSON.stringify(body) : undefined, headers: Object.assign(Object.assign({}, fetchOptions === null || fetchOptions === void 0 ? void 0 : fetchOptions.headers), { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }), 
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                signal: controller.signal }));
            if (timeout)
                clearTimeout(timeout);
            let respData;
            try {
                respData = yield res.json();
            }
            catch (_d) {
                respData = {};
            }
            if (!res.ok) {
                if (((_a = respData === null || respData === void 0 ? void 0 : respData.messages) === null || _a === void 0 ? void 0 : _a[0].code) === "952" && !retry) {
                    // token expired, get new token and retry once
                    return request(Object.assign(Object.assign({}, params), { retry: true }));
                }
                else {
                    throw new FileMakerError((_c = (_b = respData === null || respData === void 0 ? void 0 : respData.messages) === null || _b === void 0 ? void 0 : _b[0].code) !== null && _c !== void 0 ? _c : "500", `Filemaker Data API failed with (${res.status}): ${JSON.stringify(respData, null, 2)}`);
                }
            }
            return respData.response;
        });
    }
    function list(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const _a = args !== null && args !== void 0 ? args : {}, { layout = options.layout, fetch } = _a, params = __rest(_a, ["layout", "fetch"]);
            if (layout === undefined)
                throw new Error("Must specify layout");
            // rename and refactor limit, offset, and sort keys for this request
            if ("limit" in params && params.limit !== undefined)
                delete Object.assign(params, { _limit: params.limit })["limit"];
            if ("offset" in params && params.offset !== undefined) {
                if (params.offset <= 1)
                    delete params.offset;
                else
                    delete Object.assign(params, { _offset: params.offset })["offset"];
            }
            if ("sort" in params && params.sort !== undefined)
                delete Object.assign(params, {
                    _sort: Array.isArray(params.sort) ? params.sort : [params.sort],
                })["sort"];
            // if ("dateformats" in params && params.dateformats !== undefined)
            //   delete Object.assign(params, {
            //     dateformats:
            //       params.dateformats === "US"
            //         ? 0
            //         : params.dateformats === "file_locale"
            //         ? 1
            //         : params.dateformats === "ISO8601"
            //         ? 2
            //         : 0,
            //   })["dateformats"];
            const data = yield request({
                url: `/layouts/${layout}/records`,
                method: "GET",
                query: params,
                timeout: args === null || args === void 0 ? void 0 : args.timeout,
                fetchOptions: fetch,
            });
            if (zodTypes) {
                ZGetResponse(zodTypes).parse(data);
            }
            return data;
        });
    }
    function listAll(args) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            let runningData = [];
            const limit = (_a = args === null || args === void 0 ? void 0 : args.limit) !== null && _a !== void 0 ? _a : 100;
            let offset = (_b = args === null || args === void 0 ? void 0 : args.offset) !== null && _b !== void 0 ? _b : 1;
            // eslint-disable-next-line no-constant-condition
            while (true) {
                const data = (yield list(Object.assign(Object.assign({}, args), { offset })));
                runningData = [...runningData, ...data.data];
                if (runningData.length >= data.dataInfo.foundCount)
                    break;
                offset = offset + limit;
            }
            return runningData;
        });
    }
    /**
     * Create a new record in a given layout
     */
    function create(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fieldData, layout = options.layout } = args, params = __rest(args, ["fieldData", "layout"]);
            return (yield request({
                url: `/layouts/${layout}/records`,
                body: Object.assign({ fieldData }, (params !== null && params !== void 0 ? params : {})),
                timeout: args.timeout,
                fetchOptions: args.fetch,
            }));
        });
    }
    /**
     * Get a single record by Internal RecordId
     */
    function get(args) {
        return __awaiter(this, void 0, void 0, function* () {
            args.recordId = asNumber(args.recordId);
            const { recordId, layout = options.layout, fetch } = args, params = __rest(args, ["recordId", "layout", "fetch"]);
            const data = yield request({
                url: `/layouts/${layout}/records/${recordId}`,
                method: "GET",
                query: params,
                timeout: args.timeout,
                fetchOptions: fetch,
            });
            if (zodTypes)
                return ZGetResponse(zodTypes).parse(data);
            return data;
        });
    }
    /**
     * Update a single record by internal RecordId
     */
    function update(args) {
        return __awaiter(this, void 0, void 0, function* () {
            args.recordId = asNumber(args.recordId);
            const { recordId, fieldData, layout = options.layout } = args, params = __rest(args, ["recordId", "fieldData", "layout"]);
            return (yield request({
                url: `/layouts/${layout}/records/${recordId}`,
                body: Object.assign({ fieldData }, (params !== null && params !== void 0 ? params : {})),
                method: "PATCH",
                timeout: args.timeout,
                fetchOptions: args.fetch,
            }));
        });
    }
    /**
     * Delete a single record by internal RecordId
     */
    function deleteRecord(args) {
        return __awaiter(this, void 0, void 0, function* () {
            args.recordId = asNumber(args.recordId);
            const { recordId, layout = options.layout, fetch } = args, params = __rest(args, ["recordId", "layout", "fetch"]);
            return (yield request({
                url: `/layouts/${layout}/records/${recordId}`,
                query: params,
                method: "DELETE",
                timeout: args.timeout,
                fetchOptions: fetch,
            }));
        });
    }
    /**
     * Get the metadata for a given layout
     */
    function metadata(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const { layout = options.layout } = args;
            return (yield request({
                method: "GET",
                url: `/layouts/${layout}`,
                timeout: args.timeout,
                fetchOptions: args.fetch,
            }));
        });
    }
    /**
     * Forcibly logout of the Data API session
     */
    function disconnect() {
        if ("apiKey" in options.auth)
            throw new Error("Cannot disconnect when using Otto API key.");
        const func = () => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const token = yield getToken();
            const url = new URL(`${baseUrl}/sessions/${token}`);
            const res = yield fetch(url.toString(), {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            let respData;
            try {
                respData = yield res.json();
            }
            catch (_c) {
                respData = {};
            }
            if (!res.ok) {
                throw new FileMakerError((_b = (_a = respData === null || respData === void 0 ? void 0 : respData.messages) === null || _a === void 0 ? void 0 : _a[0].code) !== null && _b !== void 0 ? _b : "500", `Filemaker Data API failed with (${res.status}): ${JSON.stringify(respData, null, 2)}`);
            }
            return respData.response;
        });
        return func();
    }
    /**
     * Find records in a given layout
     */
    function find(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const { query: queryInput, layout = options.layout, ignoreEmptyResult = false, timeout, fetch } = args, params = __rest(args, ["query", "layout", "ignoreEmptyResult", "timeout", "fetch"]);
            const query = !Array.isArray(queryInput) ? [queryInput] : queryInput;
            // rename and refactor limit, offset, and sort keys for this request
            if ("offset" in params && params.offset !== undefined) {
                if (params.offset <= 1)
                    delete params.offset;
            }
            if ("dateformats" in params && params.dateformats !== undefined) {
                // reassign dateformats to match FileMaker's expected values
                // @ts-expect-error FM wants a string, so this is fine
                params.dateformats = (params.dateformats === "US"
                    ? 0
                    : params.dateformats === "file_locale"
                        ? 1
                        : params.dateformats === "ISO8601"
                            ? 2
                            : 0).toString();
            }
            const data = (yield request({
                url: `/layouts/${layout}/_find`,
                body: Object.assign({ query }, params),
                method: "POST",
                timeout,
                fetchOptions: fetch,
            }).catch((e) => {
                if (ignoreEmptyResult && e instanceof FileMakerError && e.code === "401")
                    return { data: [] };
                throw e;
            }));
            if (zodTypes && ignoreEmptyResult && data.data.length !== 0) {
                // only parse this if we have data. Ignoring empty result won't match this anyway
                ZGetResponse(zodTypes).parse(data);
            }
            return data;
        });
    }
    /**
     * Helper method for `find`. Will only return the first result or throw error if there is more than 1 result.
     */
    function findOne(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield find(args);
            if (res.data.length !== 1)
                throw new Error(`${res.data.length} records found; expecting exactly 1`);
            if (zodTypes)
                ZGetResponse(zodTypes).parse(res);
            return Object.assign(Object.assign({}, res), { data: res.data[0] });
        });
    }
    /**
     * Helper method for `find`. Will only return the first result instead of an array.
     */
    function findFirst(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield find(args);
            if (zodTypes)
                ZGetResponse(zodTypes).parse(res);
            return Object.assign(Object.assign({}, res), { data: res.data[0] });
        });
    }
    /**
     * Helper method for `find` to page through all found results.
     * ⚠️ WARNING: Use with caution as this can be a slow operation
     */
    function findAll(args) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            let runningData = [];
            const limit = (_a = args.limit) !== null && _a !== void 0 ? _a : 100;
            let offset = (_b = args.offset) !== null && _b !== void 0 ? _b : 1;
            // eslint-disable-next-line no-constant-condition
            while (true) {
                const data = yield find(Object.assign(Object.assign({}, args), { offset, ignoreEmptyResult: true }));
                runningData = [...runningData, ...data.data];
                if (runningData.length === 0 ||
                    runningData.length >= data.dataInfo.foundCount)
                    break;
                offset = offset + limit;
            }
            return runningData;
        });
    }
    function executeScript(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const { script, scriptParam, layout = options.layout } = args;
            return (yield request({
                url: `/layouts/${layout}/script/${script}`,
                query: scriptParam ? { "script.param": scriptParam } : undefined,
                method: "GET",
                timeout: args.timeout,
                fetchOptions: args.fetch,
            }));
        });
    }
    /**
     * Returns a list of available layouts on the database.
     */
    function layouts() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield request({
                url: `/layouts`,
                method: "GET",
            }));
        });
    }
    /**
     * Returns a list of available scripts on the database.
     * @returns
     */
    function scripts() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield request({
                url: `/scripts`,
                method: "GET",
            }));
        });
    }
    /**
     * Set global fields for the current session
     *
     * @returns
     */
    function globals() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield request({
                url: `/globals`,
                method: "PATCH",
            }));
        });
    }
    return {
        baseUrl, // returned only for testing purposes
        list,
        listAll,
        create,
        get,
        update,
        delete: deleteRecord,
        metadata,
        disconnect,
        find,
        findOne,
        findFirst,
        findAll,
        layouts,
        scripts,
        executeScript,
        getToken,
    };
}
export default DataApi;
export { DataApi, FileMakerError };
