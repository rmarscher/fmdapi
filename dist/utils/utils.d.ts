import { S, L, U } from "ts-toolbelt";
type TransformedFields<T extends Record<string, any>> = U.Merge<{
    [Field in keyof T]: {
        [Key in Field extends string ? L.Last<S.Split<Field, "::">> : Field]: T[Field];
    };
}[keyof T]>;
export declare function removeFMTableNames<T extends Record<string, any>>(obj: T): TransformedFields<T>;
export type Otto3APIKey = `KEY_${string}`;
export type OttoFMSAPIKey = `dk_${string}`;
export type OttoAPIKey = Otto3APIKey | OttoFMSAPIKey;
export declare function isOtto3APIKey(key: string): key is Otto3APIKey;
export declare function isOttoFMSAPIKey(key: string): key is OttoFMSAPIKey;
export declare function isOttoAPIKey(key: string): key is OttoAPIKey;
export {};
