import fs from "fs-extra";
function getDataFromFile(devFileName) {
    const data = {};
    fs.ensureFileSync(devFileName);
    const fileString = fs.readFileSync(devFileName, "utf8");
    try {
        return JSON.parse(fileString);
    }
    catch (_a) {
        return data;
    }
}
const setSharedData = (key, value, devFileName) => {
    const data = getDataFromFile(devFileName);
    data[key] = value;
    fs.ensureFileSync(devFileName);
    fs.writeFileSync(devFileName, JSON.stringify(data, null, 2));
};
const getSharedData = (key, devFileName) => {
    var _a;
    const data = getDataFromFile(devFileName);
    return (_a = data[key]) !== null && _a !== void 0 ? _a : null;
};
export const fileTokenStore = (fileName = "shared.json") => {
    return {
        setToken: (key, value) => setSharedData(key, value, fileName),
        getToken: (key) => getSharedData(key, fileName),
        clearToken: () => fs.removeSync(fileName),
    };
};
export default fileTokenStore;
