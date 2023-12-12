export function memoryStore() {
    const data = {};
    return {
        getToken: (key) => {
            var _a;
            try {
                return (_a = data[key]) !== null && _a !== void 0 ? _a : null;
            }
            catch (_b) {
                return null;
            }
        },
        clearToken: (key) => delete data[key],
        setToken: (key, value) => {
            data[key] = value;
        },
    };
}
export default memoryStore;
