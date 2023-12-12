import { S, L, U } from "ts-toolbelt";
type TransformedFields<T extends Record<string, any>> = U.Merge<{
    [Field in keyof T]: {
        [Key in Field extends string ? L.Last<S.Split<Field, "::">> : Field]: T[Field];
    };
}[keyof T]>;
export declare function removeFMTableNames<T extends Record<string, any>>(obj: T): TransformedFields<T>;
export {};
