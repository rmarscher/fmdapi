import { FileMakerError } from "./client-types.js";
import { DataApi } from "./client.js";

export { DataApi, FileMakerError };
export * from "./utils/utils.js";

export { FetchAdapter } from "./adapters/fetch.js";
export { OttoAdapter, type OttoAPIKey } from "./adapters/otto.js";

export type { TokenStoreDefinitions } from "./tokenStore/types.js"
export type * from "./client-types.js"
export type { ClientObjectProps } from "./client.js"
export default DataApi;
