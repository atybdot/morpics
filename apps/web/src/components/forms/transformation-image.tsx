// "use client";
// import { Button, buttonVariants } from "@/components/ui/button";
// import { Field, FieldError, FieldLabel } from "@/components/ui/field";
// import { Input, inputVariants } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Separator } from "@/components/ui/separator";
// import { Slider } from "@/components/ui/slider";
// import { authClient } from "@/lib/auth-client";
// import { cn } from "@/lib/utils";
// import { orpc } from "@/utils/orpc";
// import { schemas } from "@morpics/api/schemas";
// import { useForm } from "@tanstack/react-form";
// import { useQuery } from "@tanstack/react-query";
// import React from "react";
// import { PiPlus, PiSpinner } from "react-icons/pi";
// import { schema } from "@morpics/sdk";

// export default function ImageTransformationForm({
//   imageKey,
// }: {
//   imageKey: string;
// }) {
//   const key = imageKey;
//   const { data: bucket } = authClient.useActiveOrganization();
//   const { data: image } = useQuery(
//     orpc.images.get.queryOptions({
//       input: {
//         key,
//         bucketId: bucket?.id as string,
//       },
//       enabled: !!bucket?.id,
//       queryKey: ["image", key],
//     }),
//   );

//   const [imgDimensions, setImgDimensions] = React.useState<{
//     w: number;
//     h: number;
//   }>({
//     h: 0,
//     w: 0,
//   });

//   React.useEffect(() => {
//     if (!image?.url) return;
//     const img = new Image();
//     img.src = image.url;
//     img.onload = () => {
//       setImgDimensions({
//         w: img.naturalWidth,
//         h: img.naturalHeight,
//       });
//     };
//   }, [image?.url]);

//   const transformationForm = useForm({
//     defaultValues: {
//       h: imgDimensions.h,
//       w: imgDimensions.w,
//       r: 0,
//       format: (image?.metadata.mimeType.split("/")[1] as schema.TransformationQuerySchema["format"]) ?? "jpeg",
//       quality: 100,
//       blur: 0,
//       fit: "cover",
//       position: "center",
//       grayscale: false,
//       keepMetadata: false,
//     } satisfies schema.TransformationQuerySchema,
//     validators: {
//       onChange: ({ value }) => {
//         const result = schema.transformationQuerySchema.safeParse(value);
//         if (!result.success) {
//           return result.error.issues.map((i) => i.message).join(", ");
//         }
//         return undefined;
//       },
//     },
//     onSubmit: async ({ value }) => {
//       // Parse to get validated/transformed values
//       const validatedData = schema.transformationQuerySchema.safeParse(value);
//       console.log(validatedData);
//     },
//   });

//   // Update form values when image dimensions are loaded
//   React.useEffect(() => {
//     if (imgDimensions.h > 0 && imgDimensions.w > 0) {
//       transformationForm.setFieldValue("h", imgDimensions.h);
//       transformationForm.setFieldValue("w", imgDimensions.w);
//     }
//   }, [imgDimensions, transformationForm]);

//   return (
//     <form
//       id="transformation-form"
//       className=" relative flex flex-col border h-full w-full p-2 bg-muted"
//       onSubmit={(e) => {
//         e.preventDefault();
//         transformationForm.handleSubmit();
//       }}
//     >
//       <div className=" p-2 my-auto h-full w-full border flex flex-col justify-between">
//         <div className="space-y-4 w-full">
//           <transformationForm.Field
//             name="h"
//             children={(field) => {
//               const isInvalid =
//                 field.state.meta.isTouched && !field.state.meta.isValid;
//               return (
//                 <Field data-invalid={isInvalid} className="gap-1">
//                   <FieldLabel
//                     className="text-sm mb-0 text-muted-foreground"
//                     htmlFor={field.name}
//                   >
//                     height
//                   </FieldLabel>
//                   <div className="flex gap-4 items-center justify-start ps-2">
//                     <Slider
//                       step={10}
//                       max={imgDimensions?.h}
//                       showTooltip
//                       id={field.name}
//                       name={field.name}
//                       value={[field.state.value as number]}
//                       onBlur={field.handleBlur}
//                       onValueChange={(value) =>
//                         field.handleChange(
//                           Array.isArray(value) ? value[0] : value,
//                         )
//                       }
//                       aria-invalid={isInvalid}
//                     />
//                     <div
//                       className={cn(
//                         buttonVariants({
//                           size: "sm",
//                           variant: "secondary",
//                         }),
//                         "w-1/5",
//                       )}
//                     >
//                       {field.state.value as number}
//                     </div>
//                   </div>
//                   {isInvalid && <FieldError errors={field.state.meta.errors} />}
//                 </Field>
//               );
//             }}
//           />
//           <transformationForm.Field
//             name="w"
//             children={(field) => {
//               const isInvalid =
//                 field.state.meta.isTouched && !field.state.meta.isValid;
//               return (
//                 <Field data-invalid={isInvalid} className="gap-1">
//                   <FieldLabel
//                     className="text-sm mb-0 text-muted-foreground"
//                     htmlFor={field.name}
//                   >
//                     width
//                   </FieldLabel>
//                   <div className="flex gap-4 items-center justify-start ps-2">
//                     <Slider
//                       step={10}
//                       max={imgDimensions?.w}
//                       showTooltip
//                       id={field.name}
//                       name={field.name}
//                       value={[field.state.value as number]}
//                       onBlur={field.handleBlur}
//                       onValueChange={(value) =>
//                         field.handleChange(
//                           Array.isArray(value) ? value[0] : value,
//                         )
//                       }
//                       aria-invalid={isInvalid}
//                     />
//                     <div
//                       className={cn(
//                         buttonVariants({
//                           size: "sm",
//                           variant: "secondary",
//                         }),
//                         "w-1/5",
//                       )}
//                     >
//                       {field.state.value as number}
//                     </div>
//                   </div>
//                   {isInvalid && <FieldError errors={field.state.meta.errors} />}
//                 </Field>
//               );
//             }}
//           />
//           <transformationForm.Field
//             name="r"
//             children={(field) => {
//               const isInvalid =
//                 field.state.meta.isTouched && !field.state.meta.isValid;
//               return (
//                 <Field data-invalid={isInvalid} className="gap-1">
//                   <FieldLabel
//                     className="text-sm mb-0 text-muted-foreground"
//                     htmlFor={field.name}
//                   >
//                     rotate
//                   </FieldLabel>
//                   <div className="flex gap-4 items-center justify-start ps-2">
//                     <Slider
//                       // min={0}
//                       step={1}
//                       max={360}
//                       showTooltip
//                       id={field.name}
//                       name={field.name}
//                       value={[field.state.value as number]}
//                       onBlur={field.handleBlur}
//                       onValueChange={(value) =>
//                         field.handleChange(
//                           Array.isArray(value) ? value[0] : value,
//                         )
//                       }
//                       aria-invalid={isInvalid}
//                     />
//                     <div
//                       className={cn(
//                         buttonVariants({
//                           size: "sm",
//                           variant: "secondary",
//                         }),
//                         "w-1/5",
//                       )}
//                     >
//                       {field.state.value as number}
//                     </div>
//                   </div>
//                   {isInvalid && <FieldError errors={field.state.meta.errors} />}
//                 </Field>
//               );
//             }}
//           />
//           <Separator className={"my-4"} />
//           <transformationForm.Field
//             name="blur"
//             children={(field) => {
//               const isInvalid =
//                 field.state.meta.isTouched && !field.state.meta.isValid;
//               return (
//                 <Field data-invalid={isInvalid} className="gap-1">
//                   <FieldLabel
//                     className="text-sm mb-0 text-muted-foreground"
//                     htmlFor={field.name}
//                   >
//                     blur
//                   </FieldLabel>
//                   <div className="flex gap-4 items-center justify-start ps-2">
//                     <Slider
//                       // min={0}
//                       step={1}
//                       max={100}
//                       showTooltip
//                       id={field.name}
//                       name={field.name}
//                       value={[field.state.value as number]}
//                       onBlur={field.handleBlur}
//                       onValueChange={(value) =>
//                         field.handleChange(
//                           Array.isArray(value) ? value[0] : value,
//                         )
//                       }
//                       aria-invalid={isInvalid}
//                     />
//                     <div
//                       className={cn(
//                         buttonVariants({
//                           size: "sm",
//                           variant: "secondary",
//                         }),
//                         "w-1/5",
//                       )}
//                     >
//                       {field.state.value as number}
//                     </div>
//                   </div>
//                   {isInvalid && <FieldError errors={field.state.meta.errors} />}
//                 </Field>
//               );
//             }}
//           />
//           {/* <transformationForm.Field
//             name="grayscale"
//             children={(field) => {
//               const isInvalid =
//                 field.state.meta.isTouched && !field.state.meta.isValid;
//               return (
//                 <Field data-invalid={isInvalid} className="gap-1">
//                   <FieldLabel
//                     className="text-sm mb-0 text-muted-foreground"
//                     htmlFor={field.name}
//                   >
//                     grayscale
//                   </FieldLabel>
//                   <div className="flex gap-4 items-center justify-start ps-2">
//                     <Slider
//                       // min={0}
//                       step={1}
//                       max={100}
//                       showTooltip
//                       id={field.name}
//                       name={field.name}
//                       value={[field.state.value as number]}
//                       onBlur={field.handleBlur}
//                       onValueChange={(value) =>
//                         field.handleChange(
//                           Array.isArray(value) ? value[0] : value,
//                         )
//                       }
//                       aria-invalid={isInvalid}
//                     />
//                     <div
//                       className={cn(
//                         buttonVariants({
//                           size: "sm",
//                           variant: "secondary",
//                         }),
//                         "w-1/5",
//                       )}
//                     >
//                       {field.state.value as number}
//                     </div>
//                   </div>
//                   {isInvalid && <FieldError errors={field.state.meta.errors} />}
//                 </Field>
//               );
//             }}
//           /> */}
//           <Separator className={"my-4"} />
//           <transformationForm.Field
//             name="format"
//             children={(field) => {
//               const renderValue = (string: string) => {
//                 if (typeof string === "string") {
//                   return string?.split("/")[1]?.split("+")[0];
//                 }
//                 return string;
//               };
//               const isInvalid =
//                 field.state.meta.isTouched && !field.state.meta.isValid;
//               const formatOptions = schemas.mimeEnum.enumValues.map((i) => ({
//                 value: i,
//                 label: renderValue(i),
//               }));
//               return (
//                 <Field data-invalid={isInvalid} className="gap-y-1">
//                   <FieldLabel
//                     className="text-sm text-muted-foreground"
//                     htmlFor={field.name}
//                   >
//                     format
//                   </FieldLabel>
//                   <Select
//                     items={formatOptions}
//                     indicatorPosition="right"
//                     value={field.state.value as string}
//                     onValueChange={(value) =>
//                       field.handleChange(
//                         value as schema.TransformationQuerySchema["format"],
//                       )
//                     }
//                   >
//                     <SelectTrigger
//                       // disabled={files.length < 1}
//                       className={cn(
//                         inputVariants({ variant: "lg" }),
//                         "justify-between mt-auto",
//                       )}
//                     >
//                       <SelectValue
//                         placeholder={renderValue(
//                           image?.metadata.mimeType as string,
//                         )}
//                       />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {formatOptions?.map((item) => (
//                         <SelectItem key={item.value} value={item.value}>
//                           {item.label}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>

//                   {isInvalid && <FieldError errors={field.state.meta.errors} />}
//                 </Field>
//               );
//             }}
//           />
//           <transformationForm.Field
//             name="quality"
//             children={(field) => {
//               const isInvalid =
//                 field.state.meta.isTouched && !field.state.meta.isValid;
//               return (
//                 <Field data-invalid={isInvalid} className="gap-y-1">
//                   <FieldLabel
//                     className="text-sm text-muted-foreground"
//                     htmlFor={field.name}
//                   >
//                     quality
//                   </FieldLabel>
//                   <Input
//                     variant={"lg"}
//                     type="number"
//                     id={field.name}
//                     name={field.name}
//                     value={field.state.value as number}
//                     onBlur={field.handleBlur}
//                     onChange={(e) =>
//                       field.handleChange(Number.parseInt(e.target.value, 10))
//                     }
//                     aria-invalid={isInvalid}
//                     placeholder="quality"
//                   />
//                   {isInvalid && <FieldError errors={field.state.meta.errors} />}
//                 </Field>
//               );
//             }}
//           />
//           <Separator className={"my-4"} />
//         </div>
//         <div className="flex flex-wrap items-center justify-end gap-2">
//           <Button
//             type="reset"
//             form="transformation-form"
//             variant={"dim"}
//             onClick={() => {
//               transformationForm.reset();
//             }}
//           >
//             reset
//           </Button>
//           <Button
//             type="submit"
//             form="transformation-form"
//             disabled={transformationForm.state.isSubmitting}
//           >
//             {transformationForm.state.isSubmitting ? (
//               <PiSpinner className="animate-spin" />
//             ) : (
//               <PiPlus />
//             )}
//             {transformationForm.state.isSubmitting
//               ? "creating..."
//               : "create transformation"}
//           </Button>
//         </div>
//       </div>
//     </form>
//   );
// }
