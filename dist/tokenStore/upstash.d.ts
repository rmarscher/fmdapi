import { TokenStoreDefinitions } from "./types.js";
import { RedisConfigNodejs } from "@upstash/redis";
export declare function upstashTokenStore(config: RedisConfigNodejs, options?: {
    prefix?: string;
}): TokenStoreDefinitions;
export default upstashTokenStore;
