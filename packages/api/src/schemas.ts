import { imageStatusEnum } from "@morpics/db/schema";
import { updateInfoSchema, imageInfoSchema } from "@morpics/db/zod";
import z from "zod";

export const mutateImageStatusSchema = {
  input: z.object({
    imageKey: z.string().min(1).array(),
    status: z.enum(imageStatusEnum.enumValues),
  }),
};
export const mutateImageStatusSchemaSingle = {
  input: z.object({
    imageKey: z.string().min(1),
    status: z.enum(imageStatusEnum.enumValues),
  }),
};
export const transformationSchema = {
  
};
export { updateInfoSchema, imageInfoSchema };

export * as schemas from "@morpics/db/schema";
