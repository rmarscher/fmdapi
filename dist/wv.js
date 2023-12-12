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
import { z } from "zod";
import { ZGetResponse, } from "./client-types.js";
function asNumber(input) {
    return typeof input === "string" ? parseInt(input) : input;
}
const ZodOptions = z.object({
    scriptName: z.string(),
    layout: z.string().optional(),
});
class FileMakerError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
    }
}
/**
 * A client intended to be used in a webviewer. This client uses the `fm-webviewer-fetch` package to make requests.
 * It requires that you have a script in your FM file that passes the parameter to the `Execute Data API` script step
 * and returns the result back to the webviewer, according to the `fm-webviewer-fetch` spec.
 * @link https://fm-webviewer-fetch.proofgeist.com/
 */
function DataApi(input, zodTypes) {
    const options = ZodOptions.strict().parse(input); // validate options
    function request(params) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            const { action = "read", layout, body } = params;
            const { fmFetch } = yield import("@proofgeist/fm-webviewer-fetch").catch(() => {
                throw new Error("@proofgeist/fm-webviewer-fetch not found. Make sure you have it installed in your project.");
            });
            const resp = yield fmFetch(options.scriptName, Object.assign(Object.assign({}, body), { layouts: layout, action, version: "vLatest" }));
            if (((_a = resp.messages) === null || _a === void 0 ? void 0 : _a[0].code) !== "0") {
                throw new FileMakerError((_c = (_b = resp === null || resp === void 0 ? void 0 : resp.messages) === null || _b === void 0 ? void 0 : _b[0].code) !== null && _c !== void 0 ? _c : "500", `Filemaker Data API failed with (${(_d = resp.messages) === null || _d === void 0 ? void 0 : _d[0].code}): ${JSON.stringify(resp, null, 2)}`);
            }
            return resp.response;
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
            if ("offset" in params && params.offset !== undefined)
                delete Object.assign(params, { _offset: params.offset })["offset"];
            if ("sort" in params && params.sort !== undefined)
                delete Object.assign(params, {
                    _sort: Array.isArray(params.sort) ? params.sort : [params.sort],
                })["sort"];
            const data = yield request({
                layout,
                body: {},
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
            let offset = (_b = args === null || args === void 0 ? void 0 : args.offset) !== null && _b !== void 0 ? _b : 0;
            const myArgs = args !== null && args !== void 0 ? args : {};
            // eslint-disable-next-line no-constant-condition
            while (true) {
                const data = (yield list(myArgs));
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
     * @deprecated Not supported by Execute Data API script step
     * @throws {Error} Always
     */
    function create(args) {
        return __awaiter(this, void 0, void 0, function* () {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { fieldData, layout = options.layout } = args, params = __rest(args, ["fieldData", "layout"]);
            throw new Error("Not supported by Execute Data API script step");
        });
    }
    /**
     * Get a single record by Internal RecordId
     */
    function get(args) {
        return __awaiter(this, void 0, void 0, function* () {
            args.recordId = asNumber(args.recordId);
            const { recordId, layout = options.layout, fetch } = args, params = __rest(args, ["recordId", "layout", "fetch"]);
            if (!layout)
                throw new Error("Must specify layout");
            const data = yield request({
                layout,
                body: { recordId },
            });
            if (zodTypes)
                return ZGetResponse(zodTypes).parse(data);
            return data;
        });
    }
    /**
     * Update a single record by internal RecordId
     * @deprecated Not supported by Execute Data API script step
     * @throws {Error} Always
     */
    function update(args) {
        return __awaiter(this, void 0, void 0, function* () {
            args.recordId = asNumber(args.recordId);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { recordId, fieldData, layout = options.layout } = args, params = __rest(args, ["recordId", "fieldData", "layout"]);
            throw new Error("Not supported by Execute Data API script step");
        });
    }
    /**
     * Delete a single record by internal RecordId
     * @deprecated Not supported by Execute Data API script step
     * @throws {Error} Always
     */
    function deleteRecord(args) {
        return __awaiter(this, void 0, void 0, function* () {
            args.recordId = asNumber(args.recordId);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { recordId, layout = options.layout, fetch } = args, params = __rest(args, ["recordId", "layout", "fetch"]);
            throw new Error("Not supported by Execute Data API script step");
        });
    }
    /**
     * Get the metadata for a given layout
     */
    function metadata(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const { layout = options.layout } = args;
            if (!layout)
                throw new Error("Must specify layout");
            return (yield request({
                layout,
                action: "metaData",
                body: {},
            }));
        });
    }
    /**
     * Find records in a given layout
     */
    function find(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const { query: queryInput, layout = options.layout, ignoreEmptyResult = false, timeout, fetch } = args, params = __rest(args, ["query", "layout", "ignoreEmptyResult", "timeout", "fetch"]);
            const query = !Array.isArray(queryInput) ? [queryInput] : queryInput;
            if (!layout)
                throw new Error("Must specify layout");
            const data = (yield request({
                layout,
                body: Object.assign({ query }, params),
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
            const offset = (_b = args.offset) !== null && _b !== void 0 ? _b : 0;
            // eslint-disable-next-line no-constant-condition
            while (true) {
                const data = yield find(Object.assign(Object.assign({}, args), { ignoreEmptyResult: true }));
                runningData = [...runningData, ...data.data];
                if (runningData.length === 0 ||
                    runningData.length >= data.dataInfo.foundCount)
                    break;
                args.offset = offset + limit;
            }
            return runningData;
        });
    }
    return {
        list,
        listAll,
        // create,
        get,
        // update,
        // delete: deleteRecord,
        // metadata,
        find,
        findOne,
        findFirst,
        findAll,
    };
}
export default DataApi;
export { DataApi, FileMakerError };
