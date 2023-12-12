var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Redis } from "@upstash/redis";
export function upstashTokenStore(config, options = {}) {
    const redis = new Redis(config);
    const { prefix = "" } = options;
    return {
        getToken: (key) => __awaiter(this, void 0, void 0, function* () {
            return redis.get(prefix + key);
        }),
        setToken: (key, value) => __awaiter(this, void 0, void 0, function* () {
            yield redis.set(prefix + key, value);
        }),
        clearToken: (key) => __awaiter(this, void 0, void 0, function* () {
            yield redis.del(prefix + key);
        }),
    };
}
export default upstashTokenStore;
