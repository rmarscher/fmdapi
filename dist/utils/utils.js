export function removeFMTableNames(obj) {
    const newObj = {};
    for (const key in obj) {
        if (key.includes("::")) {
            const newKey = key.split("::")[1];
            newObj[newKey] = obj[key];
        }
        else {
            newObj[key] = obj[key];
        }
    }
    return newObj;
}
export function isOtto3APIKey(key) {
    return key.startsWith("KEY_");
}
export function isOttoFMSAPIKey(key) {
    return key.startsWith("dk_");
}
export function isOttoAPIKey(key) {
    return isOtto3APIKey(key) || isOttoFMSAPIKey(key);
}
