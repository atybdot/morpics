import z from "zod";

export const transformationQuerySchema = z.object({
  h: z.coerce.number().min(1, "height can not be smaller that 1px").optional(),
  w: z.coerce.number().min(1, "weight can not be smaller that 1px").optional(),
  r: z.coerce.number().optional(),
  quality: z.coerce.number().min(10).max(100).optional(),
  format: z.enum(["png", "webp", "avif", "jpeg", "tiff", "jp2"]).optional(),
  fit: z.enum(["contain", "cover", "fill", "inside", "outside"]).optional(),
  position: z
    .enum([
      "top",
      "right top",
      "right",
      "right bottom",
      "bottom",
      "left bottom",
      "left",
      "left top",
      "center",
    ])
    .optional(),
  blur: z.coerce.number().min(0, "blur intensity cannot be less that 0").optional(),
  grayscale: z.coerce.boolean().optional(),

  keepMetadata: z.coerce.boolean().optional(),
});
export type TransformationQuerySchema = z.infer<typeof transformationQuerySchema>;
// export const TransformationQueryJSONSchema = z.toJSONSchema(
//   transformationQuerySchema,
//   { target: "draft-7" },
// );
