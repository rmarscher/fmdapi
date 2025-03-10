<p align="center" style="display:flex;justify-content:center; align-items:center;">
   <img height="64px" src="logo-fm.png" style="margin-right:10px;" />
   <img height="50px" src="logo-ts.png" />   
</p>

# Claris FileMaker Data API Client for TypeScript

This package is designed to make working with the FileMaker Data API much easier. Here's just a few key features:

- [Otto](https://ottofms.com/) Data API proxy support
- TypeScript support for easy auto-completion of your fields
- Automated type generation based on layout metadata
- Supports both node and edge runtimes (v3.0+)

## Installation

This library requires zod as a peer depenency and Node 18 or later

```sh
npm install @proofgeist/fmdapi zod
```

```sh
yarn add @proofgeist/fmdapi zod
```

## Usage

Add the following envnironment variables to your project's `.env` file:

```sh
FM_DATABASE=filename.fmp12
FM_SERVER=https://filemaker.example.com

# if you want to use the Otto Data API Proxy
OTTO_API_KEY=KEY_123456...789
# otherwise
FM_USERNAME=admin
FM_PASSWORD=password
```

Initialize the client with your FileMaker Server credentials:

```typescript
import { DataApi } from "@proofgeist/fmdapi";

const client = DataApi({
  auth: { apiKey: process.env.OTTO_API_KEY },
  db: process.env.FM_DATABASE,
  server: process.env.FM_SERVER,
});
```

Then, use the client to query your FileMaker database. Availble methods:

- `list` return all records from a given layout
- `find` perform a FileMaker find
- `get` return a single record by recordID
- `create` return a new record
- `update` modify a single record by recordID
- `delete` delete a single record by recordID
- `executeScript` execute a FileMaker script direclty
- `layouts` return a list of all layouts in the database
- `scripts` return a list of all scripts in the database
- `metadata` return metadata for a given layout
- `disconnect` forcibly logout of your FileMaker session (available when not using Otto Data API proxy)

This package also includes some helper methods to make working with Data API responses a little easier:

- `findOne` return the first record from a find instead of an array. This method will error unless exactly 1 record is found.
- `findFirst` return the first record from a find instead of an array, but will not error if multiple records are found.
- `findAll` return all found records from a find, automatically handling pagination. Use caution with large datasets!
- `listAll` return all records from a given layout, automatically handling pagination. Use caution with large datasets!

Basic Example:

```typescript
const result = await client.list({ layout: "Contacts" });
```

### Client Setup Options

| Option       | Type         | Description                                                                                                                                                                                                  |
| ------------ | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `auth`       | `object`     | Authentication object. Must contain either `apiKey` or `username` and `password`                                                                                                                             |
| `db`         | `string`     | FileMaker database name                                                                                                                                                                                      |
| `server`     | `string`     | FileMaker server URL (must include `https://`)                                                                                                                                                               |
| `layout`     | `string`     | _(optional)_ If provided, will be the default layout used for all methods (can be overridden on a per-call basis)                                                                                            |
| `tokenStore` | `TokenStore` | _(optional)_ If provided, will use the custom set of functions to store and retrieve the short-lived access token. This only used for the username/password authenication method. See below for more details |

## TypeScript Support

The basic client will return the generic FileMaker response object by default. You can also create a type for your exepcted response and get a fully typed response that includes your own fields.

```typescript
type TContact = {
  name: string;
  email: string;
  phone: string;
};
const result = await client.list<TContact>({ layout: "Contacts" });
```

💡 TIP: For a more ergonomic TypeScript experience, use the [included codegen tool](#automatic-type-generation) to generate these types based on your FileMaker layout metadata.

## WebViewer Client (v3.2+)

A (nearly) identical client designed to be used with the [fm-webviewer-fetch](https://github.com/proofgeist/fm-webviewer-fetch) library when integrating within a FileMaker WebViewer instead of the browser. Using this client requires a bit extra configuration within your FileMaker file, but provides great developer experience, especially when using TypeScript and the codegen features.

Install the [fm-webviewer-fetch](https://github.com/proofgeist/fm-webviewer-fetch) library to your project:

```sh
npm install @proofgeist/fm-webviewer-fetch
# or
yarn add @proofgeist/fm-webviewer-fetch
```

Configure a script in your FileMaker file to execute the Data API

```typescript
import { DataApiWV } from "@proofgeist/fmdapi";

const client = DataApiWV({
  scriptName: "ExecuteDataApi", // you must configure this script!
});
```

| Option       | Type     | Description                                                                                                                                          |
| ------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scriptName` | `string` | FileMaker Script name that passes the parameter to the Execute Data API Script Step and returns the results according to the fm-webviewer-fetch spec |
| `layout`     | `string` | _(optional)_ If provided, will be the default layout used for all methods (can be overridden on a per-call basis)                                    |

## Custom Token Store (v3.0+)

If you are using username/password authentication, this library will manage your access token for you. By default, the token is kept in memory only, but you can provide other getter and setter methods to store the token in a database or other location. Included in this package are helper functions for file storage if you have access to the filesystem, or Upstash if running in a serverless environment.

```typescript
import { DataApi } from "@proofgeist/fmdapi";

// using file storage
import { fileTokenStore } from "@proofgeist/fmdapi/dist/tokenStore/file";
const client = DataApi({
  auth: {
    username: process.env.FM_USERNAME,
    password: process.env.FM_PASSWORD,
  },
  db: process.env.FM_DATABASE,
  server: process.env.FM_SERVER,
  tokenStore: fileTokenStore(),
});

// or with Upstash, requires `@upstash/redis` as peer dependency
import { upstashTokenStore } from "@proofgeist/fmdapi/dist/tokenStore/upstash";
const client = DataApi({
  auth: {
    username: process.env.FM_USERNAME,
    password: process.env.FM_PASSWORD,
  },
  db: process.env.FM_DATABASE,
  server: process.env.FM_SERVER,
  tokenStore: upstashTokenStore({
    token: process.env.UPSTASH_TOKEN,
    url: process.env.UPSTASH_URL,
  }),
});
```

## Edge Runtime Support (v3.0+)

Since version 3.0 uses the native `fetch` API, it is compatible with edge runtimes, but there are some additional considerations to avoid overwhelming your FileMaker server with too many connections. If you are developing for the edge, be sure to implement one of the following strategies:

- ✅ Use a custom token store (see above) with a persistent storage method such as Upstash
- ✅ Use a proxy such as the [Otto Data API Proxy](https://www.ottofms.com/docs/otto/working-with-otto/proxy-api-keys/data-api) which handles management of the access tokens itself.
  - Providing an API key to the client instead of username/password will automatically use the Otto proxy
- ⚠️ Call the `disconnect` method on the client after each request to avoid leaving open sessions on your server
  - this method works, but is not recommended in most scenarios as it reuires a new session to be created for each request

## Automatic Type Generation

This package also includes a helper function that will automatically generate types for each of your layouts. Use this tool regularly during development to easily keep your types updated with any schema changes in FileMaker. 🤯

The generated file also produces a layout-specific client instance that will automatically type all of the methods for that layout **and** validates the response using the [`zod`](https://github.com/colinhacks/zod) library. This validation happens at runtime so you can protect against dangerous field changes even when you haven't ran the code generator recently, or in your production deployment!

### Setup instructions:

1. Add a schema configuation file to the root of your project

```sh
yarn codegen --init
```

2. Edit the configuration file (`fmschema.config.js`) to include your FileMaker layouts (see more configuration options below).
3. Run the `codegen` command to generate your types!

```sh
yarn codegen
```

Assuming you have a layout called `customer_api` containing `name` `phone` and `email` fields for a customer, the generated code will look something like this:

```typescript
// schema/Customer.ts
import { z } from "zod";
export const ZCustomer = z.object({
  name: z.string(),
  phone: z.string(),
  email: z.string(),
});
export type TCustomer = z.infer<typeof ZCustomer>;

// schema/client/Customer.ts
import { DataApi } from "@proofgeist/fmdapi";
export const client = DataApi<any, TCustomer>(
  {
    auth: { apiKey: process.env.OTTO_API_KEY },
    db: process.env.FM_DATABASE,
    server: process.env.FM_SERVER,
    layout: "customer_api",
  },
  { fieldData: ZCustomer }
);
```

You can use the exported types to type your own client, or simply use the generated client to get typed and validated results, like so:

```ts
import { CustomerClient } from "schema/client";
...
const result = await CustomerClient.list(); // result will be fully typed and validated!
```

#### `generateSchemas` options

| Option         | Type       | Default       | Description                                                                                                                                               |
| -------------- | ---------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| envNames       | `object`   | _undefined_   | This object has the same structure as the client config parameters and is used to overrride the environment variable names used for the generated client. |
| schemas        | `Schema[]` | _(required)_  | An array of `Schema` objects to generate types for (see below)                                                                                            |
| path           | `string`   | `"./schema"`  | Path to folder where generated files should be saved.                                                                                                     |
| generateClient | `boolean`  | `true`        | Will generate a layout-specific typed client for you. Set to `false` if you only want to generate the types.                                              |
| useZod         | `boolean`  | `true`        | When enabled, will generate Zod schema in addition to TypeScript types and add validation to the generated client for each layout                         |
| tokenStore     | `function` | `memoryStore` | A [custom token store](#custom-token-store-v30) function to be included in the generated client                                                           |

In order to support whatever token store you may import, all import statements from your config file will be copied into the generated client files by default. To exclude certain imports, add a comment containing `codegen-ignore` in the line above the import statement you wish to exclude. e.g.

```ts
// codegen-ignore
import something from "whatever"; // <-- won't be included in the generated client
import { fileTokenStore } from "@proofgeist/fmdapi/dist/tokenStore/file.js"; // <-- will be included
```

#### `Schema` options

| Option         | Type                           | Default      | Description                                                                                                                                                                                                                                                     |
| -------------- | ------------------------------ | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| layout         | `string`                       | _(required)_ | The FileMaker source layout name                                                                                                                                                                                                                                |
| schemaName     | `string`                       | _(required)_ | The label for your schema (will also be the name of the generated file)                                                                                                                                                                                         |
| valueLists     | `strict` `allowEmpty` `ignore` | `ignore`     | If `strict`, will add enum types based on the value list defined for the field. If `allowEmpty`, will append `""` to the value list. Otherwise, fields are typed as normal.                                                                                     |
| strictNumbers  | `boolean`                      | `false`      | (v2.2.11+) If true, the zod schema will apply a transformer to force all number fields to be either `number` or `null`. <br>**WARNING:** If you are not using Zod or the auto-generated layout specific client, enabling this option may result in false types! |
| generateClient | `boolean`                      | none         | If present, override the `generateClient` option for this schema only.                                                                                                                                                                                          |

## FAQ

### I don't like the way the code is generated. Can I edit the generated files?

They are just files added to your project, so you technically can, but we don't recommend it, as it would undermine the main benefit of being able to re-run the script at a later date when the schema changes—all your edits would be overritten. If you need to extend the types, it's better to do extend them into a new type/zod schema in another file. Or, if you have suggesstions for the underlying engine, Pull Requests are welcome!

### Why are number fields typed as a `string | number`?

FileMaker may return numbers as strings in certain cases (such as very large numbers in scientific notation or blank fields). This ensures you properly account for this in your frontend code. If you wish to force all numbers to be typed as `number | null`, you can enable the `strictNumbers` flag per schema in your definition.

**WARNING:** the `strictNumbers` setting is disabled by default because it may result in false types if you are not using Zod or the auto-generated layout specific client. It works by applying a transformer to the zod schema to force all number fields to be either `number` or `null`.

### How does the code generation handle Value Lists?

Values lists are exported as their own types within the schema file, but they are not enforced within the schema by default because the actual data in the field may not be fully validated.

If you want the type to be enforced to a value from the value list, you can enable the `strictValueLists` flag per schema in your definition. This feature is only reccommended when you're also using the Zod library, as your returned data will fail the validation if the value is not in the value list.

### What about date/time/timestamp fields?

For now, these are all typed as strings. You probably want to transform these values anyway, so we keep it simple at the automated level.

### Can I run the `codegen` command in a CI/CD environment?

Yes, great idea! This could be a great way to catch errors that would arise from any changes to the FileMaker schema.

### Why Zod instead of just TypeScript?

**In short:** Zod is a TypeScript-first schema declaration and validation library. When you use it, you get _runtime_ validation of your data instead of just compile-time validation.

FileMaker is great for being able to change schema very quickly and easily. Yes, you probably have naming conventions in place that help protect against these changes in your web apps, but no system is perfect. Zod lets you start with the assumption that any data coming from an external API might be in a format that you don't expect and then valdiates it so that you can catch errors early. This allows the typed object that it returns to you to be much more trusted throughout your app.

**But wait, does this mean that I might get a fatal error in my production app if the FileMaker schema changes?** Yes, yes it does. This is actually what you'd want to happen. Without validating the data returned from an API, it's possible to get other unexpcted side-effects in your app that don't present as errors, which may lead to bugs that are hard to track down or inconsistencies in your data.
