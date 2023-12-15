import { DataApi, FileMakerError, isOttoAuth } from "./client.js";

export { DataApi, FileMakerError, isOttoAuth };
export * from "./utils/utils.js";

export type { TokenStoreDefinitions } from "./tokenStore/types.js"
export default DataApi;
