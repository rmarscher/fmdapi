#!/usr/bin/env node
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { program } from "commander";
import chalk from "chalk";
import fs from "fs-extra";
import { generateSchemas } from "./utils/index.js";
import path from "path";
import { config } from "dotenv";
import { pathToFileURL, fileURLToPath } from "url";
const defaultConfigPaths = ["./fmschema.config.mjs", "./fmschema.config.js"];
function init({ configLocation }) {
    console.log();
    if (fs.existsSync(configLocation)) {
        console.log(chalk.yellow(`⚠️ ${path.basename(configLocation)} already exists`));
    }
    else {
        const stubFile = fs.readFileSync(path.resolve(
        // @ts-ignore
        typeof __dirname !== 'undefined' ? __dirname :
            fileURLToPath(new URL('.', import.meta.url)), "../stubs/fmschema.config.stub.mjs"), "utf8");
        fs.writeFileSync(configLocation, stubFile, "utf8");
        console.log(`✅ Created config file: ${path.basename(configLocation)}`);
    }
}
function runCodegen({ configLocation }) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!fs.existsSync(configLocation)) {
            console.error(chalk.red(`Could not find ${path.basename(configLocation)} at the root of your project.`));
            console.log();
            console.log("run `codegen --init` to create a new config file");
            return process.exit(1);
        }
        yield fs.access(configLocation, fs.constants.R_OK).catch(() => {
            console.error(chalk.red(`You do not have read access to ${path.basename(configLocation)} at the root of your project.`));
            return process.exit(1);
        });
        let config;
        console.log(`🔍 Reading config from ${configLocation}`);
        if (configLocation.endsWith(".mjs")) {
            const module = yield import(pathToFileURL(configLocation).toString());
            config = module.config;
        }
        else {
            config = require(configLocation);
        }
        if (!config) {
            console.error(chalk.red(`Error reading the config object from ${path.basename(configLocation)}. Are you sure you have a "config" object exported?`));
        }
        yield generateSchemas(config, configLocation).catch((err) => {
            console.error(err);
            return process.exit(1);
        });
        console.log(`✅ Generated schemas\n`);
    });
}
program
    .option("--init", "Add the configuration file to your project")
    .option("--config <filename>", "optional config file name")
    .option("--env-path <path>", "optional path to your .env file", ".env.local")
    .option("--skip-env-check", "Ignore loading environment variables from a file.", false)
    .action((options) => __awaiter(void 0, void 0, void 0, function* () {
    // check if options.config resolves to a file
    const configPath = getConfigPath(options.config);
    const configLocation = path.toNamespacedPath(path.resolve(configPath !== null && configPath !== void 0 ? configPath : defaultConfigPaths[0]));
    if (options.init)
        return init({ configLocation });
    if (!options.skipEnvCheck) {
        const envRes = config({ path: options.envPath });
        if (envRes.error)
            return console.log(chalk.red(`Could not resolve your environment variables.\n${envRes.error.message}\n`));
    }
    // default command
    yield runCodegen({ configLocation });
}));
program.parse();
function getConfigPath(configPath) {
    if (configPath) {
        // If a config path is specified, check if it exists
        try {
            fs.accessSync(configPath, fs.constants.F_OK);
            return configPath;
        }
        catch (e) {
            // If it doesn't exist, continue to default paths
        }
    }
    // Try default paths in order
    for (const path of defaultConfigPaths) {
        try {
            fs.accessSync(path, fs.constants.F_OK);
            return path;
        }
        catch (e) {
            // If path doesn't exist, try the next one
        }
    }
    return null;
}
