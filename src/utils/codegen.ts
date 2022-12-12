import fs, { ensureDir } from "fs-extra";
import { join } from "path";
import ts, {
  factory,
  createSourceFile,
  createPrinter,
  Statement,
} from "typescript";
import { FileMakerError, DataApi } from "..";
import { FieldMetaData } from "../client-types";
import { F } from "ts-toolbelt";
import chalk from "chalk";
import { ClientObjectProps, isOttoAuth } from "../client";
import { env } from "process";

type TSchema = {
  name: string;
  type: "string" | "fmnumber" | "valueList";
  values?: string[];
};

const varname = (name: string) =>
  name.replace(/[^a-zA-Z_]+|[^a-zA-Z_0-9]+/g, "");

const commentHeader = `/* eslint-disable @typescript-eslint/no-explicit-any */
/**
* Generated by @proofgeist/fmdapi package
* https://github.com/proofgeist/fmdapi
* DO NOT EDIT THIS FILE DIRECTLY. Changes may be overritten
*/

`;

const importTypeStatement = (schemaName: string, zod: boolean) =>
  factory.createImportDeclaration(
    undefined,
    undefined,
    factory.createImportClause(
      false,
      undefined,
      factory.createNamedImports([
        factory.createImportSpecifier(
          false,
          undefined,
          factory.createIdentifier(`T${schemaName}`)
        ),
        ...(zod
          ? [
              factory.createImportSpecifier(
                false,
                undefined,
                factory.createIdentifier(`Z${schemaName}`)
              ),
            ]
          : []),
      ])
    ),
    factory.createStringLiteral(`../${schemaName}`),
    undefined
  );

const exportIndexClientStatement = (schemaName: string) =>
  factory.createExportDeclaration(
    undefined,
    undefined,
    false,
    factory.createNamedExports([
      factory.createExportSpecifier(
        false,
        factory.createIdentifier(`client`),
        factory.createIdentifier(`${schemaName}Client`)
      ),
    ]),
    factory.createStringLiteral(`./${schemaName}`),
    undefined
  );

const importStatement = factory.createImportDeclaration(
  undefined,
  undefined,
  factory.createImportClause(
    false,
    undefined,
    factory.createNamedImports([
      factory.createImportSpecifier(
        false,
        undefined,
        factory.createIdentifier("DataApi")
      ),
    ])
  ),
  factory.createStringLiteral("@proofgeist/fmdapi"),
  undefined
);
const undefinedTypeGuardStatement = (name: string) =>
  factory.createIfStatement(
    factory.createPrefixUnaryExpression(
      ts.SyntaxKind.ExclamationToken,
      factory.createPropertyAccessExpression(
        factory.createPropertyAccessExpression(
          factory.createIdentifier("process"),
          factory.createIdentifier("env")
        ),
        factory.createIdentifier(name)
      )
    ),
    factory.createThrowStatement(
      factory.createNewExpression(
        factory.createIdentifier("Error"),
        undefined,
        [factory.createStringLiteral(`Missing env var: ${name}`)]
      )
    ),
    undefined
  );
const exportClientStatement = (args: {
  fieldTypeName: string;
  portalTypeName?: string;
  schemaName: string;
  layout: string;
  useZod: boolean;
  envNames: Omit<ClientObjectProps, "layout">;
}) => [
  importStatement,
  undefinedTypeGuardStatement(args.envNames.db),
  undefinedTypeGuardStatement(args.envNames.server),
  ...(isOttoAuth(args.envNames.auth)
    ? [undefinedTypeGuardStatement(args.envNames.auth.apiKey)]
    : [
        undefinedTypeGuardStatement(args.envNames.auth.username),
        undefinedTypeGuardStatement(args.envNames.auth.password),
      ]),
  factory.createVariableStatement(
    [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    factory.createVariableDeclarationList(
      [
        factory.createVariableDeclaration(
          factory.createIdentifier(`client`),
          undefined,
          undefined,
          factory.createCallExpression(
            factory.createIdentifier("DataApi"),
            [
              factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
              factory.createTypeReferenceNode(
                factory.createIdentifier(args.fieldTypeName),
                undefined
              ),
              // only add portal type if a portal type was passed
              ...(args.portalTypeName
                ? [
                    factory.createTypeReferenceNode(
                      factory.createIdentifier(args.portalTypeName),
                      undefined
                    ),
                  ]
                : []),
            ],
            [
              factory.createObjectLiteralExpression(
                [
                  factory.createPropertyAssignment(
                    factory.createIdentifier("auth"),
                    factory.createObjectLiteralExpression(
                      isOttoAuth(args.envNames.auth)
                        ? [
                            factory.createPropertyAssignment(
                              factory.createIdentifier("apiKey"),
                              factory.createPropertyAccessExpression(
                                factory.createPropertyAccessExpression(
                                  factory.createIdentifier("process"),
                                  factory.createIdentifier("env")
                                ),
                                factory.createIdentifier(
                                  args.envNames.auth.apiKey
                                )
                              )
                            ),
                          ]
                        : [
                            factory.createPropertyAssignment(
                              factory.createIdentifier("username"),
                              factory.createPropertyAccessExpression(
                                factory.createPropertyAccessExpression(
                                  factory.createIdentifier("process"),
                                  factory.createIdentifier("env")
                                ),
                                factory.createIdentifier(
                                  args.envNames.auth.username
                                )
                              )
                            ),
                            factory.createPropertyAssignment(
                              factory.createIdentifier("password"),
                              factory.createPropertyAccessExpression(
                                factory.createPropertyAccessExpression(
                                  factory.createIdentifier("process"),
                                  factory.createIdentifier("env")
                                ),
                                factory.createIdentifier(
                                  args.envNames.auth.password
                                )
                              )
                            ),
                          ],
                      false
                    )
                  ),
                  factory.createPropertyAssignment(
                    factory.createIdentifier("db"),
                    factory.createPropertyAccessExpression(
                      factory.createPropertyAccessExpression(
                        factory.createIdentifier("process"),
                        factory.createIdentifier("env")
                      ),
                      factory.createIdentifier(args.envNames.db)
                    )
                  ),
                  factory.createPropertyAssignment(
                    factory.createIdentifier("server"),
                    factory.createPropertyAccessExpression(
                      factory.createPropertyAccessExpression(
                        factory.createIdentifier("process"),
                        factory.createIdentifier("env")
                      ),
                      factory.createIdentifier(args.envNames.server)
                    )
                  ),
                  factory.createPropertyAssignment(
                    factory.createIdentifier("layout"),
                    factory.createStringLiteral(args.layout)
                  ),
                ],
                true
              ),
              ...(args.useZod
                ? [
                    factory.createObjectLiteralExpression(
                      [
                        factory.createPropertyAssignment(
                          factory.createIdentifier("fieldData"),
                          factory.createIdentifier(
                            `Z${varname(args.schemaName)}`
                          )
                        ),
                        // only add portal type if a portal type was passed
                        ...(args.portalTypeName
                          ? [
                              factory.createPropertyAssignment(
                                factory.createIdentifier("portalData"),
                                factory.createIdentifier(
                                  `Z${varname(args.schemaName)}Portals`
                                )
                              ),
                            ]
                          : []),
                      ],
                      true
                    ),
                  ]
                : []),
            ]
          )
        ),
      ],
      ts.NodeFlags.Const
    )
  ),
];

const stringProperty = (name: string) =>
  factory.createPropertySignature(
    undefined,
    factory.createStringLiteral(name),
    undefined,
    factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
  );
const stringPropertyZod = (name: string) =>
  factory.createPropertyAssignment(
    factory.createStringLiteral(name),
    factory.createCallExpression(
      factory.createPropertyAccessExpression(
        factory.createIdentifier("z"),
        factory.createIdentifier("string")
      ),
      undefined,
      []
    )
  );
const stringOrNumberProperty = (name: string) =>
  factory.createPropertySignature(
    undefined,
    factory.createStringLiteral(name),
    undefined,
    factory.createUnionTypeNode([
      factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
      factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
    ])
  );
const stringOrNumberPropertyZod = (name: string) =>
  factory.createPropertyAssignment(
    factory.createStringLiteral(name),
    factory.createCallExpression(
      factory.createPropertyAccessExpression(
        factory.createIdentifier("z"),
        factory.createIdentifier("union")
      ),
      undefined,
      [
        factory.createArrayLiteralExpression(
          [
            factory.createCallExpression(
              factory.createPropertyAccessExpression(
                factory.createIdentifier("z"),
                factory.createIdentifier("string")
              ),
              undefined,
              []
            ),
            factory.createCallExpression(
              factory.createPropertyAccessExpression(
                factory.createIdentifier("z"),
                factory.createIdentifier("number")
              ),
              undefined,
              []
            ),
          ],
          false
        ),
      ]
    )
  );
const valueListProperty = (name: string, vl: string[]) =>
  factory.createPropertySignature(
    undefined,
    factory.createStringLiteral(name),
    undefined,
    factory.createUnionTypeNode(
      vl.map((v) =>
        factory.createLiteralTypeNode(factory.createStringLiteral(v))
      )
    )
  );
const valueListPropertyZod = (name: string, vl: string[]) =>
  factory.createPropertyAssignment(
    factory.createStringLiteral(name),
    factory.createCallExpression(
      factory.createPropertyAccessExpression(
        factory.createIdentifier("z"),
        factory.createIdentifier("enum")
      ),
      undefined,
      [
        factory.createArrayLiteralExpression(
          vl.map((v) => factory.createStringLiteral(v)),
          false
        ),
      ]
    )
  );

const buildTypeZod = (
  schemaName: string,
  schema: Array<TSchema>
): Statement[] => [
  factory.createVariableStatement(
    [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    factory.createVariableDeclarationList(
      [
        factory.createVariableDeclaration(
          factory.createIdentifier(`Z${varname(schemaName)}`),
          undefined,
          undefined,
          factory.createCallExpression(
            factory.createPropertyAccessExpression(
              factory.createIdentifier("z"),
              factory.createIdentifier("object")
            ),
            undefined,
            [
              factory.createObjectLiteralExpression(
                // for each field, create a z property
                schema.map((item) =>
                  item.type === "fmnumber"
                    ? stringOrNumberPropertyZod(item.name)
                    : item.values
                    ? valueListPropertyZod(item.name, item.values)
                    : stringPropertyZod(item.name)
                ),
                true
              ),
            ]
          )
        ),
      ],
      ts.NodeFlags.Const
    )
  ),
  factory.createTypeAliasDeclaration(
    undefined,
    [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    factory.createIdentifier(`T${varname(schemaName)}`),
    undefined,
    factory.createTypeReferenceNode(
      factory.createQualifiedName(
        factory.createIdentifier("z"),
        factory.createIdentifier("infer")
      ),
      [
        factory.createTypeQueryNode(
          factory.createIdentifier(`Z${varname(schemaName)}`)
        ),
      ]
    )
  ),
];
const buildValueListZod = (name: string, values: string[]): Statement[] => [
  factory.createVariableStatement(
    [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    factory.createVariableDeclarationList(
      [
        factory.createVariableDeclaration(
          factory.createIdentifier(`ZVL${varname(name)}`),
          undefined,
          undefined,
          factory.createCallExpression(
            factory.createPropertyAccessExpression(
              factory.createIdentifier("z"),
              factory.createIdentifier("enum")
            ),
            undefined,
            [
              factory.createArrayLiteralExpression(
                values.map((v) => factory.createStringLiteral(v)),
                false
              ),
            ]
          )
        ),
      ],
      ts.NodeFlags.Const
    )
  ),
  factory.createTypeAliasDeclaration(
    undefined,
    [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    factory.createIdentifier(`TVL${varname(name)}`),
    undefined,
    factory.createTypeReferenceNode(
      factory.createQualifiedName(
        factory.createIdentifier("z"),
        factory.createIdentifier("infer")
      ),
      [
        factory.createTypeQueryNode(
          factory.createIdentifier(`ZVL${varname(name)}`)
        ),
      ]
    )
  ),
];
const buildValueListTS = (name: string, values: string[]): Statement =>
  factory.createTypeAliasDeclaration(
    undefined,
    undefined,
    factory.createIdentifier(`TVL${varname(name)}`),
    undefined,
    factory.createUnionTypeNode(
      values.map((v) =>
        factory.createLiteralTypeNode(factory.createStringLiteral(v))
      )
    )
  );

const buildTypeTS = (schemaName: string, schema: Array<TSchema>): Statement =>
  factory.createTypeAliasDeclaration(
    undefined,
    [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    factory.createIdentifier(`T${varname(schemaName)}`),
    undefined,
    factory.createTypeLiteralNode(
      // for each field, create a property
      schema.map((item) => {
        return item.type === "fmnumber"
          ? stringOrNumberProperty(item.name)
          : item.values
          ? valueListProperty(item.name, item.values)
          : stringProperty(item.name);
      })
    )
  );

type BuildSchemaArgs = {
  schemaName: string;
  schema: Array<TSchema>;
  type: "zod" | "ts";
  portalSchema?: { schemaName: string; schema: Array<TSchema> }[];
  valueLists?: { name: string; values: string[] }[];
  envNames: Omit<ClientObjectProps, "layout">;
  layoutName: string;
};
const buildClientFile = (args: BuildSchemaArgs) => {
  const printer = createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const file = buildClient(args);
  return commentHeader + printer.printFile(file);
};
export const buildSchema = ({ type, ...args }: BuildSchemaArgs) => {
  // make sure schema has unique keys, in case a field is on the layout mulitple times
  const schema = args.schema.reduce(
    (acc: TSchema[], el) =>
      acc.find((o) => o.name === el.name)
        ? acc
        : ([...acc, el] as Array<TSchema>),
    []
  );
  // TODO same uniqueness validation for portals
  const printer = createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const file = type === "ts" ? buildTSSchema(args) : buildZodSchema(args);
  return commentHeader + printer.printFile(file);
};
const buildClient = (args: BuildSchemaArgs) => {
  const { schemaName, portalSchema = [], envNames, type } = args;
  return factory.updateSourceFile(
    createSourceFile(`source.ts`, "", ts.ScriptTarget.Latest),
    [
      importTypeStatement(schemaName, type === "zod"),
      ...exportClientStatement({
        envNames,
        useZod: type === "zod",
        schemaName: args.schemaName,
        layout: args.layoutName,
        fieldTypeName: `T${varname(schemaName)}`,
        ...(portalSchema.length > 0
          ? { portalTypeName: `T${varname(schemaName)}Portals` }
          : {}),
      }),
    ]
  );
};
const buildZodSchema = (args: Omit<BuildSchemaArgs, "type">) => {
  const { schema, schemaName, portalSchema = [], valueLists = [] } = args;
  const portals = portalSchema
    .map((p) => buildTypeZod(p.schemaName, p.schema))
    .flat();
  const vls = valueLists
    .map((vl) => buildValueListZod(vl.name, vl.values))
    .flat();

  const portalStatements = [
    factory.createVariableStatement(
      [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      factory.createVariableDeclarationList(
        [
          factory.createVariableDeclaration(
            factory.createIdentifier(`Z${varname(schemaName)}Portals`),
            undefined,
            undefined,
            factory.createCallExpression(
              factory.createPropertyAccessExpression(
                factory.createIdentifier("z"),
                factory.createIdentifier("object")
              ),
              undefined,
              [
                factory.createObjectLiteralExpression(
                  portalSchema.map((portal) =>
                    factory.createPropertyAssignment(
                      factory.createStringLiteral(portal.schemaName),
                      factory.createIdentifier(`Z${varname(portal.schemaName)}`)
                    )
                  ),
                  true
                ),
              ]
            )
          ),
        ],
        ts.NodeFlags.Const
      )
    ),
    factory.createTypeAliasDeclaration(
      undefined,
      [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      factory.createIdentifier(`T${varname(schemaName)}Portals`),
      undefined,
      factory.createTypeReferenceNode(
        factory.createQualifiedName(
          factory.createIdentifier("z"),
          factory.createIdentifier("infer")
        ),
        [
          factory.createTypeQueryNode(
            factory.createIdentifier(`Z${varname(schemaName)}Portals`)
          ),
        ]
      )
    ),
  ];

  return factory.updateSourceFile(
    createSourceFile(`source.ts`, "", ts.ScriptTarget.Latest),
    [
      factory.createImportDeclaration(
        undefined,
        undefined,
        factory.createImportClause(
          false,
          undefined,
          factory.createNamedImports([
            factory.createImportSpecifier(
              false,
              undefined,
              factory.createIdentifier("z")
            ),
          ])
        ),
        factory.createStringLiteral("zod")
      ),
      // for each table, create a ZodSchema variable and inferred type
      ...buildTypeZod(schemaName, schema),

      // now the same for each portal
      ...portals,

      // if there are portals, export single portal type for the layout
      ...(portalSchema.length > 0 ? portalStatements : []),

      // now add types for any values lists
      ...vls,
    ]
  );
};

const buildTSSchema = (args: Omit<BuildSchemaArgs, "type">) => {
  const { schema, schemaName, portalSchema = [], valueLists = [] } = args;
  const portals = portalSchema.map((p) => buildTypeTS(p.schemaName, p.schema));
  const vls = valueLists.map((vl) => buildValueListTS(vl.name, vl.values));
  const portalStatement = factory.createTypeAliasDeclaration(
    undefined,
    [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    factory.createIdentifier(`T${varname(schemaName)}Portals`),
    undefined,
    factory.createTypeLiteralNode(
      portalSchema.map((portal) =>
        factory.createPropertySignature(
          undefined,
          factory.createIdentifier(portal.schemaName),
          undefined,
          factory.createArrayTypeNode(
            factory.createTypeReferenceNode(
              factory.createIdentifier(`T${varname(portal.schemaName)}`),
              undefined
            )
          )
        )
      )
    )
  );

  return factory.updateSourceFile(
    createSourceFile(`source.ts`, "", ts.ScriptTarget.Latest),
    [
      buildTypeTS(schemaName, schema),
      ...portals,
      // if there are portals, export single portal type for the layout
      ...(portalSchema.length > 0 ? [portalStatement] : []),
      ...vls,
    ]
  );
};

export const getSchema = async (args: {
  client: ReturnType<typeof DataApi>;
  layout: string;
  valueLists?: ValueListsOptions;
}) => {
  const schemaMap: F.Function<[FieldMetaData[]], TSchema[]> = (schema) =>
    schema.map((field) => {
      if (
        meta &&
        field.valueList &&
        meta.valueLists &&
        valueLists !== "ignore"
      ) {
        const list = meta.valueLists.find((o) => o.name === field.valueList);
        const values = list?.values.map((o) => o.value) ?? [];
        return {
          name: field.name,
          type: "valueList",
          values: valueLists === "allowEmpty" ? [...values, ""] : values,
        };
      }
      return {
        name: field.name,
        type: field.result === "number" ? "fmnumber" : "string",
      };
    });
  const { client, layout, valueLists = "ignore" } = args;
  const meta = await client.metadata({ layout }).catch((err) => {
    if (err instanceof FileMakerError && err.code === "105") {
      console.log(
        chalk.bold.red("ERROR:"),
        "Skipping schema generation for layout:",
        chalk.bold.underline(layout),
        "(not found)"
      );
      return;
    }
    throw err;
  });
  if (!meta) return;
  // console.log(meta);
  const schema = schemaMap(meta.fieldMetaData);
  const portalSchema = Object.keys(meta.portalMetaData).map((schemaName) => {
    const schema = schemaMap(meta.portalMetaData[schemaName]);
    return { schemaName, schema };
  });
  const valueListValues =
    meta.valueLists?.map((vl) => ({
      name: vl.name,
      values: vl.values.map((o) => o.value),
    })) ?? [];
  return { schema, portalSchema, valueLists: valueListValues };
};

export type ValueListsOptions = "strict" | "allowEmpty" | "ignore";
export type GenerateSchemaOptions = {
  envNames?: Partial<Omit<ClientObjectProps, "layout">>;
  schemas: Array<{
    layout: string;
    schemaName: string;
    valueLists?: ValueListsOptions;
    /**
     * If `true`, the generated files will include a layout-specific client. Set this to `false` if you only want to use the types. Overrides the top-level generateClient option for this specific schema.
     * @default true
     */
    generateClient?: boolean;
  }>;
  /**
   * If `true`, the generated files will include a layout-specific client. Set this to `false` if you only want to use the types
   * @default true
   */
  generateClient?: boolean;
  path?: string;
  useZod?: boolean;
};
export const generateSchemas = async (options: GenerateSchemaOptions) => {
  const {
    envNames,
    schemas,
    path = "schema",
    useZod = true,
    generateClient = true,
  } = options;

  const defaultEnvNames = {
    apiKey: "OTTO_API_KEY",
    ottoPort: "OTTO_PORT",
    username: "FM_USERNAME",
    password: "FM_PASSWORD",
    server: "FM_SERVER",
    db: "FM_DATABASE",
  };

  const server = process.env[envNames?.server ?? defaultEnvNames.server];
  const db = process.env[envNames?.db ?? defaultEnvNames.db];
  const apiKey =
    (envNames?.auth && isOttoAuth(envNames.auth)
      ? process.env[envNames.auth.apiKey ?? defaultEnvNames.apiKey]
      : undefined) ?? process.env[defaultEnvNames.apiKey];
  const ottoPort =
    (envNames?.auth && isOttoAuth(envNames.auth)
      ? process.env[envNames.auth.ottoPort ?? defaultEnvNames.ottoPort]
      : undefined) ?? "3030";
  const username =
    (envNames?.auth && !isOttoAuth(envNames.auth)
      ? process.env[envNames.auth.username ?? defaultEnvNames.username]
      : undefined) ?? process.env[defaultEnvNames.username];
  const password =
    (envNames?.auth && !isOttoAuth(envNames.auth)
      ? process.env[envNames.auth.password ?? defaultEnvNames.password]
      : undefined) ?? process.env[defaultEnvNames.password];

  const auth: ClientObjectProps["auth"] = apiKey
    ? { apiKey }
    : { username: username ?? "", password: password ?? "" };

  if (!server || !db || (!apiKey && !username)) {
    console.log(chalk.red("ERROR: Could not get all required config values"));
    console.log("Ensure the following environment variables are set:");
    if (!server) console.log(`${envNames?.server ?? defaultEnvNames.server}`);
    if (!db) console.log(`${envNames?.db ?? defaultEnvNames.db}`);
    if (!apiKey)
      console.log(
        `${
          (envNames?.auth &&
            isOttoAuth(envNames.auth) &&
            envNames.auth.apiKey) ??
          defaultEnvNames.apiKey
        } (or ${
          (envNames?.auth &&
            !isOttoAuth(envNames.auth) &&
            envNames.auth.username) ??
          defaultEnvNames.username
        } and ${
          (envNames?.auth &&
            !isOttoAuth(envNames.auth) &&
            envNames.auth.password) ??
          defaultEnvNames.password
        })`
      );

    console.log();
    return;
  }

  const client = DataApi({ auth, server, db });
  await fs.ensureDir(path);
  const clientExportsMap: { [key: string]: ts.ExportDeclaration } = {};

  await Promise.all(
    schemas.map(async (item) => {
      const result = await getSchema({
        client,
        layout: item.layout,
        valueLists: item.valueLists,
      });
      if (result) {
        const { schema, portalSchema, valueLists } = result;
        const args: BuildSchemaArgs = {
          schemaName: item.schemaName,
          schema,
          layoutName: item.layout,
          portalSchema,
          valueLists,
          type: useZod ? "zod" : "ts",
          envNames: {
            auth: isOttoAuth(auth)
              ? {
                  apiKey:
                    envNames?.auth && "apiKey" in envNames.auth
                      ? envNames.auth.apiKey
                      : defaultEnvNames.apiKey,
                }
              : {
                  username:
                    envNames?.auth && "username" in envNames.auth
                      ? envNames.auth.username
                      : defaultEnvNames.username,
                  password:
                    envNames?.auth && "password" in envNames.auth
                      ? envNames.auth.password
                      : defaultEnvNames.password,
                },
            db: envNames?.db ?? defaultEnvNames.db,
            server: envNames?.server ?? defaultEnvNames.server,
          },
        };
        const code = buildSchema(args);
        fs.writeFile(join(path, `${item.schemaName}.ts`), code, () => {});

        if (item.generateClient ?? generateClient) {
          await ensureDir(join(path, "client"));
          const clientCode = buildClientFile(args);
          let clientExport = exportIndexClientStatement(item.schemaName);
          clientExportsMap[item.schemaName] = clientExport;
          fs.writeFile(
            join(path, "client", `${item.schemaName}.ts`),
            clientCode,
            () => {}
          );
        }
      }
    })
  );

  if (Object.keys(clientExportsMap).length !== 0) {
    // add an index file with all clients exported, sorted by name
    const exportNames = Object.keys(clientExportsMap).sort();
    const clientExports: ts.ExportDeclaration[] = [];
    for (let i = 0; i < exportNames.length; i++) {
      clientExports.push(clientExportsMap[exportNames[i]]);
    }

    const printer = createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const file = factory.updateSourceFile(
      createSourceFile(`source.ts`, "", ts.ScriptTarget.Latest),
      clientExports
    );
    const indexCode = printer.printFile(file);
    fs.writeFile(join(path, "client", `index.ts`), indexCode, () => {});
  }
};
