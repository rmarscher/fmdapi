import { ensureFileSync, readFileSync, writeFileSync } from "fs-extra";
const devFileName = "shared.json";
function getDataFromFile() {
    const data = {};
    if (process.env.NODE_ENV === "development") {
        ensureFileSync(devFileName);
        const fileString = readFileSync(devFileName, "utf8");
        try {
            return JSON.parse(fileString);
        }
        catch (_a) {
            return data;
        }
    }
    else {
        return data;
    }
}
const setSharedData = (key, value) => {
    const data = getDataFromFile();
    data[key] = value;
    if (process.env.NODE_ENV === "development") {
        ensureFileSync(devFileName);
        writeFileSync(devFileName, JSON.stringify(data, null, 2));
    }
};
const getSharedData = (key) => {
    const data = getDataFromFile();
    return data[key];
};
export { setSharedData, getSharedData };
