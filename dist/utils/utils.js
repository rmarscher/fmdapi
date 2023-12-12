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
