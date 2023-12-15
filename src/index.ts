import { DataApi, FileMakerError } from "./client.js";

export type { TokenStoreDefinitions } from "./tokenStore/types.js"
export type { ClientObjectProps } from "./client.js"
export { FileMakerError, DataApi };
export { removeFMTableNames } from "./utils/utils.js";
export default DataApi;
