import { createInsertSchema } from "drizzle-zod";
import z from "zod";
import { metadata } from "./schema";

const metadataInsertSchema = createInsertSchema(metadata);

export const imageInfoSchema = metadataInsertSchema.omit({
  id: true,
});

export const updateInfoSchema = z.object({
  imgId: z.string().uuid("Invalid image ID"),
  key: z.string().min(1, "Key must not be empty").optional(),
  fileName: metadataInsertSchema.shape.fileName,
  altTxt: z.string().optional(),
  tags: z
    .array(
      z.object({
        id: z.string().uuid("Invalid tag ID"),
        value: z.string(),
      }),
    )
    .optional()
    .default([]),
});
