import { z } from "zod";
export const ZFieldValue = z.union([z.string(), z.number(), z.null()]);
export const ZFieldData = z.record(z.string(), ZFieldValue);
export const getFMRecordAsZod = ({ fieldData, portalData, }) => {
    const obj = z.object({
        fieldData: fieldData,
        recordId: z.string(),
        modId: z.string(),
    });
    if (portalData) {
        const portalObj = z.object({});
        Object.keys(portalData).forEach((key) => {
            portalObj.extend({ [key]: portalData.shape[key] });
        });
        obj.extend({ portalData: portalObj }).strict();
    }
    return obj;
};
const ZScriptResponse = z.object({
    scriptResult: z.string().optional(),
    scriptError: z.string().optional(),
    "scriptResult.prerequest": z.string().optional(),
    "scriptError.prerequest": z.string().optional(),
    "scriptResult.presort": z.string().optional(),
    "scriptError.presort": z.string().optional(),
});
export const ZDataInfo = z.object({
    database: z.string(),
    layout: z.string(),
    table: z.string(),
    totalRecordCount: z.number(),
    foundCount: z.number(),
    returnedCount: z.number(),
});
export const ZGetResponse = ({ fieldData, portalData, }) => ZScriptResponse.extend({
    data: z.array(getFMRecordAsZod({ fieldData, portalData })),
    dataInfo: ZDataInfo,
});
