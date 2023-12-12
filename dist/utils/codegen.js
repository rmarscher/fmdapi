var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
import fs, { ensureDir } from "fs-extra";
import { join } from "path";
import ts from "typescript";
const createPrinter = ts.createPrinter;
const createSourceFile = ts.createSourceFile;
const factory = ts.factory;
import { FileMakerError, DataApi } from "../index.js";
import chalk from "chalk";
import { isOttoAuth } from "../client.js";
import { memoryStore } from "../tokenStore/memory.js";
const varname = (name) => name.replace(/[^a-zA-Z_]+|[^a-zA-Z_0-9]+/g, "");
const commentHeader = `/* eslint-disable @typescript-eslint/no-explicit-any */
/**
* Generated by @proofgeist/fmdapi package
* https://github.com/proofgeist/fmdapi
* DO NOT EDIT THIS FILE DIRECTLY. Changes may be overritten
*/

`;
const clientBody = `
import { T{schemaName}, Z{schemaName} } from "../{schemaName}.ts";
import { DataApi } from "@proofgeist/fmdapi";

type TSchema = T{schemaName}
const ZSchema = Z{schemaName}
const layout = "{layoutName}"

let client: ReturnType<typeof DataApi<any, TSchema>>
export function getClient(env: any, tokenStore?: any) {
    if (client) return client;
    if (!env.FM_DATABASE) throw new Error("Missing env var: FM_DATABASE");
    if (!env.FM_SERVER) throw new Error("Missing env var: FM_SERVER");
    if (!env.FM_USERNAME) throw new Error("Missing env var: FM_USERNAME");
    if (!env.FM_PASSWORD) throw new Error("Missing env var: FM_PASSWORD");
    client = DataApi<any, TSchema>({
      auth: { username: env.FM_USERNAME, password: env.FM_PASSWORD },
      db: env.FM_DATABASE,
      server: env.FM_SERVER,
      layout: layout,
      tokenStore,
    }, {
      fieldData: ZSchema
    });
    return client;
}
`;
const importTypeStatement = (schemaName, hasPortals, zod) => factory.createImportDeclaration(undefined, factory.createImportClause(false, undefined, factory.createNamedImports([
    factory.createImportSpecifier(false, undefined, factory.createIdentifier(`T${schemaName}`)),
    ...(hasPortals
        ? [
            factory.createImportSpecifier(false, undefined, factory.createIdentifier(`T${schemaName}Portals`)),
        ]
        : []),
    ...(zod
        ? [
            factory.createImportSpecifier(false, undefined, factory.createIdentifier(`Z${schemaName}`)),
            ...(hasPortals
                ? [
                    factory.createImportSpecifier(false, undefined, factory.createIdentifier(`Z${schemaName}Portals`)),
                ]
                : []),
        ]
        : []),
])), factory.createStringLiteral(`../${schemaName}`), undefined);
const exportIndexClientStatement = (schemaName) => factory.createExportDeclaration(undefined, false, factory.createNamedExports([
    factory.createExportSpecifier(false, factory.createIdentifier(`getClient`), factory.createIdentifier(`get${schemaName}Client`)),
]), factory.createStringLiteral(`./${schemaName}.ts`), undefined);
const importStatement = (wv = false) => factory.createImportDeclaration(undefined, factory.createImportClause(false, undefined, factory.createNamedImports([
    factory.createImportSpecifier(false, undefined, factory.createIdentifier("DataApi")),
])), factory.createStringLiteral(`@proofgeist/fmdapi${wv ? "/dist/wv" : ""}`), undefined);
const undefinedTypeGuardStatement = (name) => factory.createIfStatement(factory.createPrefixUnaryExpression(ts.SyntaxKind.ExclamationToken, factory.createPropertyAccessExpression(factory.createIdentifier("env"), factory.createIdentifier(name))), factory.createThrowStatement(factory.createNewExpression(factory.createIdentifier("Error"), undefined, [factory.createStringLiteral(`Missing env var: ${name}`)])), undefined);
const exportClientStatement = (args) => [
    importStatement(args.webviewerScriptName !== undefined),
    ...(args.webviewerScriptName !== undefined
        ? []
        : [
            undefinedTypeGuardStatement(args.envNames.db),
            undefinedTypeGuardStatement(args.envNames.server),
            ...(isOttoAuth(args.envNames.auth)
                ? [undefinedTypeGuardStatement(args.envNames.auth.apiKey)]
                : [
                    undefinedTypeGuardStatement(args.envNames.auth.username),
                    undefinedTypeGuardStatement(args.envNames.auth.password),
                ]),
        ]),
    factory.createVariableStatement([factory.createModifier(ts.SyntaxKind.ExportKeyword)], factory.createVariableDeclarationList([
        factory.createVariableDeclaration(factory.createIdentifier(`client`), undefined, undefined, factory.createCallExpression(factory.createIdentifier("DataApi"), [
            factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
            factory.createTypeReferenceNode(factory.createIdentifier(args.fieldTypeName), undefined),
            // only add portal type if a portal type was passed
            ...(args.portalTypeName
                ? [
                    factory.createTypeReferenceNode(factory.createIdentifier(args.portalTypeName), undefined),
                ]
                : []),
        ], [
            factory.createObjectLiteralExpression([
                ...(args.webviewerScriptName !== undefined
                    ? []
                    : [
                        factory.createPropertyAssignment(factory.createIdentifier("auth"), factory.createObjectLiteralExpression(isOttoAuth(args.envNames.auth)
                            ? [
                                factory.createPropertyAssignment(factory.createIdentifier("apiKey"), factory.createPropertyAccessExpression(factory.createIdentifier("env"), factory.createIdentifier(args.envNames.auth.apiKey))),
                            ]
                            : [
                                factory.createPropertyAssignment(factory.createIdentifier("username"), factory.createPropertyAccessExpression(factory.createIdentifier("env"), factory.createIdentifier(args.envNames.auth.username))),
                                factory.createPropertyAssignment(factory.createIdentifier("password"), factory.createPropertyAccessExpression(factory.createIdentifier("env"), factory.createIdentifier(args.envNames.auth.password))),
                            ], false)),
                    ]),
                ...(args.webviewerScriptName !== undefined
                    ? []
                    : [
                        factory.createPropertyAssignment(factory.createIdentifier("db"), factory.createPropertyAccessExpression(factory.createIdentifier("env"), factory.createIdentifier(args.envNames.db))),
                    ]),
                ...(args.webviewerScriptName !== undefined
                    ? []
                    : [
                        factory.createPropertyAssignment(factory.createIdentifier("server"), factory.createPropertyAccessExpression(factory.createIdentifier("env"), factory.createIdentifier(args.envNames.server))),
                    ]),
                factory.createPropertyAssignment(factory.createIdentifier("layout"), factory.createStringLiteral(args.layout)),
                ...(args.tokenStore && args.webviewerScriptName === undefined
                    ? [
                        factory.createPropertyAssignment(factory.createIdentifier("tokenStore"), args.tokenStore),
                    ]
                    : []),
                ...(args.webviewerScriptName !== undefined
                    ? [
                        factory.createPropertyAssignment(factory.createIdentifier("scriptName"), factory.createStringLiteral(args.webviewerScriptName)),
                    ]
                    : []),
            ], true),
            ...(args.useZod
                ? [
                    factory.createObjectLiteralExpression([
                        factory.createPropertyAssignment(factory.createIdentifier("fieldData"), factory.createIdentifier(`Z${varname(args.schemaName)}`)),
                        // only add portal type if a portal type was passed
                        ...(args.portalTypeName
                            ? [
                                factory.createPropertyAssignment(factory.createIdentifier("portalData"), factory.createIdentifier(`Z${varname(args.schemaName)}Portals`)),
                            ]
                            : []),
                    ], true),
                ]
                : []),
        ])),
    ], ts.NodeFlags.Const)),
];
const stringProperty = (name) => factory.createPropertySignature(undefined, factory.createStringLiteral(name), undefined, factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword));
const stringPropertyZod = (name) => factory.createPropertyAssignment(factory.createStringLiteral(name), factory.createCallExpression(factory.createPropertyAccessExpression(factory.createIdentifier("z"), factory.createIdentifier("string")), undefined, []));
const stringOrNumberProperty = (name) => factory.createPropertySignature(undefined, factory.createStringLiteral(name), undefined, factory.createUnionTypeNode([
    factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
    factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
]));
const stringOrNumberPropertyZod = (name) => factory.createPropertyAssignment(factory.createStringLiteral(name), factory.createCallExpression(factory.createPropertyAccessExpression(factory.createIdentifier("z"), factory.createIdentifier("union")), undefined, [
    factory.createArrayLiteralExpression([
        factory.createCallExpression(factory.createPropertyAccessExpression(factory.createIdentifier("z"), factory.createIdentifier("string")), undefined, []),
        factory.createCallExpression(factory.createPropertyAccessExpression(factory.createIdentifier("z"), factory.createIdentifier("number")), undefined, []),
    ], false),
]));
const NumberOrNullProperty = (name) => factory.createPropertySignature(undefined, factory.createStringLiteral(name), undefined, factory.createUnionTypeNode([
    factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
    factory.createLiteralTypeNode(factory.createNull()),
]));
const NumberOrNullPropertyZod = (name) => factory.createPropertyAssignment(factory.createStringLiteral(name), factory.createCallExpression(factory.createPropertyAccessExpression(factory.createCallExpression(factory.createPropertyAccessExpression(factory.createCallExpression(factory.createPropertyAccessExpression(factory.createPropertyAccessExpression(factory.createIdentifier("z"), factory.createIdentifier("coerce")), factory.createIdentifier("number")), undefined, []), factory.createIdentifier("nullable")), undefined, []), factory.createIdentifier("catch")), undefined, [factory.createNull()]));
const valueListProperty = (name, vl) => factory.createPropertySignature(undefined, factory.createStringLiteral(name), undefined, factory.createUnionTypeNode(vl.map((v) => factory.createLiteralTypeNode(factory.createStringLiteral(v)))));
const valueListPropertyZod = (name, vl) => factory.createPropertyAssignment(factory.createStringLiteral(name), factory.createCallExpression(factory.createPropertyAccessExpression(factory.createIdentifier("z"), factory.createIdentifier("enum")), undefined, [
    factory.createArrayLiteralExpression(vl.map((v) => factory.createStringLiteral(v)), false),
]));
const buildTypeZod = (schemaName, schema, strictNumbers = false) => [
    factory.createVariableStatement([factory.createModifier(ts.SyntaxKind.ExportKeyword)], factory.createVariableDeclarationList([
        factory.createVariableDeclaration(factory.createIdentifier(`Z${varname(schemaName)}`), undefined, undefined, factory.createCallExpression(factory.createPropertyAccessExpression(factory.createIdentifier("z"), factory.createIdentifier("object")), undefined, [
            factory.createObjectLiteralExpression(
            // for each field, create a z property
            schema.map((item) => item.type === "fmnumber"
                ? strictNumbers
                    ? NumberOrNullPropertyZod(item.name)
                    : stringOrNumberPropertyZod(item.name)
                : item.values
                    ? valueListPropertyZod(item.name, item.values)
                    : stringPropertyZod(item.name)), true),
        ])),
    ], ts.NodeFlags.Const)),
    factory.createTypeAliasDeclaration([factory.createModifier(ts.SyntaxKind.ExportKeyword)], factory.createIdentifier(`T${varname(schemaName)}`), undefined, factory.createTypeReferenceNode(factory.createQualifiedName(factory.createIdentifier("z"), factory.createIdentifier("infer")), [
        factory.createTypeQueryNode(factory.createIdentifier(`Z${varname(schemaName)}`)),
    ])),
];
const buildValueListZod = (name, values) => [
    factory.createVariableStatement([factory.createModifier(ts.SyntaxKind.ExportKeyword)], factory.createVariableDeclarationList([
        factory.createVariableDeclaration(factory.createIdentifier(`ZVL${varname(name)}`), undefined, undefined, factory.createCallExpression(factory.createPropertyAccessExpression(factory.createIdentifier("z"), factory.createIdentifier("enum")), undefined, [
            factory.createArrayLiteralExpression(values.map((v) => factory.createStringLiteral(v)), false),
        ])),
    ], ts.NodeFlags.Const)),
    factory.createTypeAliasDeclaration([factory.createModifier(ts.SyntaxKind.ExportKeyword)], factory.createIdentifier(`TVL${varname(name)}`), undefined, factory.createTypeReferenceNode(factory.createQualifiedName(factory.createIdentifier("z"), factory.createIdentifier("infer")), [
        factory.createTypeQueryNode(factory.createIdentifier(`ZVL${varname(name)}`)),
    ])),
];
const buildValueListTS = (name, values) => factory.createTypeAliasDeclaration(undefined, factory.createIdentifier(`TVL${varname(name)}`), undefined, factory.createUnionTypeNode(values.map((v) => factory.createLiteralTypeNode(factory.createStringLiteral(v)))));
const buildTypeTS = (schemaName, schema, strictNumbers = false) => factory.createTypeAliasDeclaration([factory.createModifier(ts.SyntaxKind.ExportKeyword)], factory.createIdentifier(`T${varname(schemaName)}`), undefined, factory.createTypeLiteralNode(
// for each field, create a property
schema.map((item) => {
    return item.type === "fmnumber"
        ? strictNumbers
            ? NumberOrNullProperty(item.name)
            : stringOrNumberProperty(item.name)
        : item.values
            ? valueListProperty(item.name, item.values)
            : stringProperty(item.name);
})));
const buildClientFile = (args) => {
    const printer = createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const file = buildClient(args);
    return commentHeader + clientBody.replace(/\{schemaName\}/g, args.schemaName).replace(/\{layoutName\}/g, args.layoutName);
};
export const buildSchema = (_a) => {
    var { type } = _a, args = __rest(_a, ["type"]);
    // make sure schema has unique keys, in case a field is on the layout mulitple times
    args.schema.reduce((acc, el) => acc.find((o) => o.name === el.name)
        ? acc
        : [...acc, el], []);
    // TODO same uniqueness validation for portals
    const printer = createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const file = type === "ts" ? buildTSSchema(args) : buildZodSchema(args);
    return commentHeader + printer.printFile(file);
};
const buildClient = (args) => {
    const { schemaName, portalSchema = [], envNames, type } = args;
    return factory.updateSourceFile(createSourceFile(`source.ts`, "", ts.ScriptTarget.Latest), [
        importTypeStatement(schemaName, portalSchema.length > 0, type === "zod"),
        ...reimportConfigStatements(args.configLocation),
        ...exportClientStatement(Object.assign(Object.assign({ envNames, useZod: type === "zod", schemaName: args.schemaName, layout: args.layoutName, tokenStore: getTokenStoreFromConfig(args.configLocation), fieldTypeName: `T${varname(schemaName)}` }, (portalSchema.length > 0
            ? { portalTypeName: `T${varname(schemaName)}Portals` }
            : {})), { webviewerScriptName: args.webviewerScriptName })),
    ]);
};
const buildZodSchema = (args) => {
    const { schema, schemaName, portalSchema = [], valueLists = [], strictNumbers = false, } = args;
    const portals = portalSchema
        .map((p) => buildTypeZod(p.schemaName, p.schema, strictNumbers))
        .flat();
    const vls = valueLists
        .filter((vl) => vl.values.length > 0)
        .map((vl) => buildValueListZod(vl.name, vl.values))
        .flat();
    const portalStatements = [
        factory.createVariableStatement([factory.createModifier(ts.SyntaxKind.ExportKeyword)], factory.createVariableDeclarationList([
            factory.createVariableDeclaration(factory.createIdentifier(`Z${varname(schemaName)}Portals`), undefined, undefined, factory.createCallExpression(factory.createPropertyAccessExpression(factory.createIdentifier("z"), factory.createIdentifier("object")), undefined, [
                factory.createObjectLiteralExpression(portalSchema.map((portal) => factory.createPropertyAssignment(factory.createStringLiteral(portal.schemaName), factory.createIdentifier(`Z${varname(portal.schemaName)}`))), true),
            ])),
        ], ts.NodeFlags.Const)),
        factory.createTypeAliasDeclaration([factory.createModifier(ts.SyntaxKind.ExportKeyword)], factory.createIdentifier(`T${varname(schemaName)}Portals`), undefined, factory.createTypeReferenceNode(factory.createQualifiedName(factory.createIdentifier("z"), factory.createIdentifier("infer")), [
            factory.createTypeQueryNode(factory.createIdentifier(`Z${varname(schemaName)}Portals`)),
        ])),
    ];
    return factory.updateSourceFile(createSourceFile(`source.ts`, "", ts.ScriptTarget.Latest), [
        factory.createImportDeclaration(undefined, factory.createImportClause(false, undefined, factory.createNamedImports([
            factory.createImportSpecifier(false, undefined, factory.createIdentifier("z")),
        ])), factory.createStringLiteral("zod")),
        // for each table, create a ZodSchema variable and inferred type
        ...buildTypeZod(schemaName, schema, strictNumbers),
        // now the same for each portal
        ...portals,
        // if there are portals, export single portal type for the layout
        ...(portalSchema.length > 0 ? portalStatements : []),
        // now add types for any values lists
        ...vls,
    ]);
};
const buildTSSchema = (args) => {
    const { schema, schemaName, portalSchema = [], valueLists = [], strictNumbers = false, } = args;
    const portals = portalSchema.map((p) => buildTypeTS(p.schemaName, p.schema, strictNumbers));
    const vls = valueLists
        .filter((vl) => vl.values.length > 0)
        .map((vl) => buildValueListTS(vl.name, vl.values));
    const portalStatement = factory.createTypeAliasDeclaration([factory.createModifier(ts.SyntaxKind.ExportKeyword)], factory.createIdentifier(`T${varname(schemaName)}Portals`), undefined, factory.createTypeLiteralNode(portalSchema.map((portal) => factory.createPropertySignature(undefined, factory.createIdentifier(portal.schemaName), undefined, factory.createArrayTypeNode(factory.createTypeReferenceNode(factory.createIdentifier(`T${varname(portal.schemaName)}`), undefined))))));
    return factory.updateSourceFile(createSourceFile(`source.ts`, "", ts.ScriptTarget.Latest), [
        buildTypeTS(schemaName, schema, strictNumbers),
        ...portals,
        // if there are portals, export single portal type for the layout
        ...(portalSchema.length > 0 ? [portalStatement] : []),
        ...vls,
    ]);
};
export const getSchema = (args) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const schemaReducer = (schema) => schema.reduce((acc, field) => {
        var _a;
        if (acc.find((o) => o.name === field.name))
            return acc; // skip duplicates
        if (meta &&
            field.valueList &&
            meta.valueLists &&
            valueLists !== "ignore") {
            const list = meta.valueLists.find((o) => o.name === field.valueList);
            const values = (_a = list === null || list === void 0 ? void 0 : list.values.map((o) => o.value)) !== null && _a !== void 0 ? _a : [];
            return [
                ...acc,
                {
                    name: field.name,
                    type: "valueList",
                    values: valueLists === "allowEmpty" ? [...values, ""] : values,
                },
            ];
        }
        return [
            ...acc,
            {
                name: field.name,
                type: field.result === "number" ? "fmnumber" : "string",
            },
        ];
    }, []);
    const { client, layout, valueLists = "ignore" } = args;
    const meta = yield client.metadata({ layout }).catch((err) => {
        if (err instanceof FileMakerError && err.code === "105") {
            console.log(chalk.bold.red("ERROR:"), "Skipping schema generation for layout:", chalk.bold.underline(layout), "(not found)");
            return;
        }
        throw err;
    });
    if (!meta)
        return;
    const schema = schemaReducer(meta.fieldMetaData);
    const portalSchema = Object.keys(meta.portalMetaData).map((schemaName) => {
        const schema = schemaReducer(meta.portalMetaData[schemaName]);
        return { schemaName, schema };
    });
    const valueListValues = (_b = (_a = meta.valueLists) === null || _a === void 0 ? void 0 : _a.map((vl) => ({
        name: vl.name,
        values: vl.values.map((o) => o.value),
    }))) !== null && _b !== void 0 ? _b : [];
    // remove duplicates from valueListValues
    const valueListValuesUnique = valueListValues.reduce((acc, vl) => {
        if (acc.find((o) => o.name === vl.name))
            return acc;
        return [...acc, vl];
    }, []);
    return { schema, portalSchema, valueLists: valueListValuesUnique };
});
function reimportConfigStatements(configLocation) {
    if (!configLocation)
        return [];
    const sourceFileText = fs.readFileSync(configLocation, "utf-8");
    const sourceFile = ts.createSourceFile("x.ts", sourceFileText, ts.ScriptTarget.Latest);
    const imports = [];
    sourceFile.forEachChild((child) => {
        var _a;
        if (!ts.isImportDeclaration(child))
            return;
        const shouldIgnore = (_a = ts
            .getLeadingCommentRanges(sourceFileText, child.getFullStart())) === null || _a === void 0 ? void 0 : _a.map((range) => sourceFileText.slice(range.pos, range.end).replace(" ", "")).some((o) => o.search("codgen-ignore"));
        if (shouldIgnore)
            return;
        imports.push(child);
    });
    return imports;
}
function getTokenStoreFromConfig(configLocation) {
    if (!configLocation)
        return undefined;
    const sourceFileText = fs.readFileSync(configLocation, "utf-8");
    const sourceFile = ts.createSourceFile("x.ts", sourceFileText, ts.ScriptTarget.Latest);
    let result = undefined;
    sourceFile.forEachChild((child) => {
        if (!ts.isVariableStatement(child))
            return;
        const testID = child.declarationList.declarations[0].name;
        if (!ts.isIdentifier(testID) || testID.escapedText !== "config")
            return;
        const init = child.declarationList.declarations[0].initializer;
        if (init && ts.isObjectLiteralExpression(init)) {
            const tokenStore = init.properties.find((o) => {
                if (o.name && ts.isIdentifier(o.name)) {
                    return o.name.escapedText === "tokenStore";
                }
                return false;
            });
            if (!tokenStore)
                return;
            if (ts.isPropertyAssignment(tokenStore)) {
                if (ts.isIdentifier(tokenStore.initializer)) {
                    result = factory.createCallExpression(tokenStore.initializer, undefined, []);
                }
                else if (ts.isArrowFunction(tokenStore.initializer) &&
                    ts.isCallExpression(tokenStore.initializer.body)) {
                    result = tokenStore.initializer.body;
                }
                else {
                    result = tokenStore.initializer;
                }
            }
        }
        return child.declarationList.declarations[0].initializer;
    });
    return result;
}
export const generateSchemas = (options, configLocation) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, e_1, _d, _e;
    var _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y;
    const { envNames, schemas, path = "schema", useZod = true, generateClient = true, webviewerScriptName, } = options;
    const defaultEnvNames = {
        apiKey: "OTTO_API_KEY",
        ottoPort: "OTTO_PORT",
        username: "FM_USERNAME",
        password: "FM_PASSWORD",
        server: "FM_SERVER",
        db: "FM_DATABASE",
    };
    if (webviewerScriptName !== undefined && !!options.tokenStore)
        console.log(`${chalk.yellow("NOTE:")} The webviewer client does not store any tokens. The tokenStore option will be ignored.`);
    // if (configLocation) {
    //   getTokenStoreFromConfig(configLocation);
    //   return;
    // }
    const server = process.env[(_f = envNames === null || envNames === void 0 ? void 0 : envNames.server) !== null && _f !== void 0 ? _f : defaultEnvNames.server];
    const db = process.env[(_g = envNames === null || envNames === void 0 ? void 0 : envNames.db) !== null && _g !== void 0 ? _g : defaultEnvNames.db];
    const apiKey = (_j = ((envNames === null || envNames === void 0 ? void 0 : envNames.auth) && isOttoAuth(envNames.auth)
        ? process.env[(_h = envNames.auth.apiKey) !== null && _h !== void 0 ? _h : defaultEnvNames.apiKey]
        : undefined)) !== null && _j !== void 0 ? _j : process.env[defaultEnvNames.apiKey];
    const ottoPort = (_l = ((envNames === null || envNames === void 0 ? void 0 : envNames.auth) && isOttoAuth(envNames.auth)
        ? process.env[(_k = envNames.auth.ottoPort) !== null && _k !== void 0 ? _k : defaultEnvNames.ottoPort]
        : undefined)) !== null && _l !== void 0 ? _l : "3030";
    const username = (_o = ((envNames === null || envNames === void 0 ? void 0 : envNames.auth) && !isOttoAuth(envNames.auth)
        ? process.env[(_m = envNames.auth.username) !== null && _m !== void 0 ? _m : defaultEnvNames.username]
        : undefined)) !== null && _o !== void 0 ? _o : process.env[defaultEnvNames.username];
    const password = (_q = ((envNames === null || envNames === void 0 ? void 0 : envNames.auth) && !isOttoAuth(envNames.auth)
        ? process.env[(_p = envNames.auth.password) !== null && _p !== void 0 ? _p : defaultEnvNames.password]
        : undefined)) !== null && _q !== void 0 ? _q : process.env[defaultEnvNames.password];
    const auth = apiKey
        ? { apiKey }
        : { username: username !== null && username !== void 0 ? username : "", password: password !== null && password !== void 0 ? password : "" };
    if (!server || !db || (!apiKey && !username)) {
        console.log(chalk.red("ERROR: Could not get all required config values"));
        console.log("Ensure the following environment variables are set:");
        if (!server)
            console.log(`${(_r = envNames === null || envNames === void 0 ? void 0 : envNames.server) !== null && _r !== void 0 ? _r : defaultEnvNames.server}`);
        if (!db)
            console.log(`${(_s = envNames === null || envNames === void 0 ? void 0 : envNames.db) !== null && _s !== void 0 ? _s : defaultEnvNames.db}`);
        if (!apiKey)
            console.log(`${(_t = ((envNames === null || envNames === void 0 ? void 0 : envNames.auth) &&
                isOttoAuth(envNames.auth) &&
                envNames.auth.apiKey)) !== null && _t !== void 0 ? _t : defaultEnvNames.apiKey} (or ${(_u = ((envNames === null || envNames === void 0 ? void 0 : envNames.auth) &&
                !isOttoAuth(envNames.auth) &&
                envNames.auth.username)) !== null && _u !== void 0 ? _u : defaultEnvNames.username} and ${(_v = ((envNames === null || envNames === void 0 ? void 0 : envNames.auth) &&
                !isOttoAuth(envNames.auth) &&
                envNames.auth.password)) !== null && _v !== void 0 ? _v : defaultEnvNames.password})`);
        console.log();
        return;
    }
    const client = DataApi({ auth, server, db, tokenStore: memoryStore() });
    yield fs.ensureDir(path);
    const clientExportsMap = {};
    try {
        for (var _z = true, schemas_1 = __asyncValues(schemas), schemas_1_1; schemas_1_1 = yield schemas_1.next(), _c = schemas_1_1.done, !_c; _z = true) {
            _e = schemas_1_1.value;
            _z = false;
            const item = _e;
            const result = yield getSchema({
                client,
                layout: item.layout,
                valueLists: item.valueLists,
            });
            if (!result)
                continue;
            const { schema, portalSchema, valueLists } = result;
            const args = {
                schemaName: item.schemaName,
                schema,
                layoutName: item.layout,
                portalSchema,
                valueLists,
                type: useZod ? "zod" : "ts",
                strictNumbers: item.strictNumbers,
                configLocation,
                webviewerScriptName: options.webviewerScriptName,
                envNames: {
                    auth: isOttoAuth(auth)
                        ? {
                            apiKey: (envNames === null || envNames === void 0 ? void 0 : envNames.auth) && "apiKey" in envNames.auth
                                ? envNames.auth.apiKey
                                : defaultEnvNames.apiKey,
                        }
                        : {
                            username: (envNames === null || envNames === void 0 ? void 0 : envNames.auth) && "username" in envNames.auth
                                ? envNames.auth.username
                                : defaultEnvNames.username,
                            password: (envNames === null || envNames === void 0 ? void 0 : envNames.auth) && "password" in envNames.auth
                                ? envNames.auth.password
                                : defaultEnvNames.password,
                        },
                    db: (_w = envNames === null || envNames === void 0 ? void 0 : envNames.db) !== null && _w !== void 0 ? _w : defaultEnvNames.db,
                    server: (_x = envNames === null || envNames === void 0 ? void 0 : envNames.server) !== null && _x !== void 0 ? _x : defaultEnvNames.server,
                },
            };
            const code = buildSchema(args);
            fs.writeFile(join(path, `${item.schemaName}.ts`), code);
            if ((_y = item.generateClient) !== null && _y !== void 0 ? _y : generateClient) {
                yield ensureDir(join(path, "client"));
                const clientCode = buildClientFile(args);
                const clientExport = exportIndexClientStatement(item.schemaName);
                clientExportsMap[item.schemaName] = clientExport;
                fs.writeFile(join(path, "client", `${item.schemaName}.ts`), clientCode);
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (!_z && !_c && (_d = schemas_1.return)) yield _d.call(schemas_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    if (Object.keys(clientExportsMap).length !== 0) {
        // add an index file with all clients exported, sorted by name
        const exportNames = Object.keys(clientExportsMap).sort();
        const clientExports = [];
        for (let i = 0; i < exportNames.length; i++) {
            clientExports.push(clientExportsMap[exportNames[i]]);
        }
        const printer = createPrinter({ newLine: ts.NewLineKind.LineFeed });
        const file = factory.updateSourceFile(createSourceFile(`source.ts`, "", ts.ScriptTarget.Latest), clientExports);
        const indexCode = printer.printFile(file);
        fs.writeFile(join(path, "client", `index.ts`), indexCode);
    }
});
