/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <explanation> */

"use client";
import { schemas } from "@morpics/api/schemas";
import { fileUploadConfig } from "@morpics/buckets/upload-file-config";
import { useForm, useStore } from "@tanstack/react-form";
import { RotateCcwIcon, Trash2, Upload } from "lucide-react";
import { type SVGProps, useEffect, useState } from "react";
import z from "zod";
import { formatBytes, useFileUpload } from "@/hooks/use-file-upload";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "../ui/button";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Input, inputVariants } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Slider } from "../ui/slider";
export const SvgImag = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" {...props}>
      <rect width="256" height="256" fill="none" />
      <rect
        x="32"
        y="48"
        width="192"
        height="160"
        fill="none"
        stroke="currentColor"
        strokeWidth={12}
      />
      <circle
        cx="156"
        cy="100"
        r="16"
        fill="none"
        stroke="currentColor"
        strokeWidth={12}
      />
      <path
        d="M147.31,164,173,138.34a8,8,0,0,1,11.31,0L224,178.06"
        fill="none"
        stroke="currentColor"
        strokeWidth={12}
      />
      <path
        d="M32,168.69l54.34-54.35a8,8,0,0,1,11.32,0L191.31,208"
        fill="none"
        stroke="currentColor"
        strokeWidth={12}
      />
    </svg>
  );
};

const formSchema = z.object({
  height: z.number().min(10),
  width: z.number().min(10),
  rotate: z.number().min(0),
  blur: z.number().min(0).max(100),
  grayscale: z.number().min(0).max(100),
  format: z.enum(schemas.mimeEnum.enumValues),
  quality: z.number().min(1).max(100),
});

export default function TransformationAnonForm() {
  const [
    { files, isDragging },
    {
      removeFile,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      handlePaste,
      openFileDialog,
      getInputProps,
    },
  ] = useFileUpload({
    maxFiles: 1,
    maxSize: fileUploadConfig.max_file_size,
    accept: fileUploadConfig.accept.join(","),
    multiple: false,
  });
  const [imgDimensions, setImgDimensions] = useState<{
    w: number;
    h: number;
    type: typeof schemas.mimeEnum.enumValues | string;
  }>({
    h: 0,
    w: 0,
    type: "",
  });
  useEffect(() => {
    if (files.length > 0 && files[0]?.preview) {
      const img = new Image();
      img.src = files[0].preview;
      img.onload = () => {
        setImgDimensions({
          w: img.naturalWidth,
          h: img.naturalHeight,
          type: files[0].file.type,
        });
      };
    }
  }, [files]);
  const form = useForm({
    defaultValues: {
      height: imgDimensions.h,
      width: imgDimensions.w,
      rotate: 0,
      filter: undefined,
      format: imgDimensions.type,
      quality: 100,
      blur: 0,
      grayscale: 0,
    } as z.input<typeof formSchema>,
    validators: {
      onChange: formSchema,
    },
    onSubmit: async ({ value }) => {
      // Parse to get validated/transformed values
      const validatedData = formSchema.parse(value);
      console.log(validatedData);
    },
  });

  const formstore = useStore(form.store, (state) => state.values);

  return (
    <>
      {files.length > 0 && files[0].preview ? (
        <div className="relative flex flex-col border h-full col-span-2 overflow-hidden ">
          <div className="flex gap-4 items-center justify-start bg-muted">
            <p className="px-2 truncate leading-tight text-sm text-muted-foreground flex-1">
              {`${files[0].file.name.split(".")[0]}`}
            </p>
            <Button
              onClick={() => removeFile(files[0].id)}
              variant={"secondary"}
              size={"icon"}
            >
              <Trash2 />
            </Button>
          </div>
          <div className="w-full aspect-video h-[calc(100svh-8rem)] lg:h-full overflow-hidden content-center">
            <img
              src={files[0]?.preview}
              className={cn(
                "object-contain overflow-hidden origin-center mx-auto",
              )}
              style={{
                height: `${Math.round((formstore.height / imgDimensions.h) * 100)}%`,
                width: `${Math.round((formstore.width / imgDimensions.w) * 100)}%`,
                rotate: `${formstore.rotate}deg`,
                filter: `blur(${formstore.blur / 10}px) grayscale(${formstore.grayscale}%)`,
              }}
            />
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "relative border group border-dashed p-8 text-center cursor-pointer transition-color h-full w-full hover:bg-muted dark:hover:bg-muted/20 backdrop-blur-sm content-center col-span-2 bg-background z-5",
            isDragging
              ? "border-primary bg-primary"
              : "border-muted-foreground/20 hover:border-muted-foreground",
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onPaste={handlePaste}
          onClick={openFileDialog}
          // biome-ignore lint/a11y/noNoninteractiveTabindex: Needed for paste functionality
          tabIndex={0}
        >
          <input {...getInputProps()} className="sr-only" />

          <div className="flex flex-col items-center gap-8 my-auto">
            <SvgImag
              className={cn(
                "size-16 stroke-1 rounded-none",
                isDragging ? "text-primary" : "text-muted-foreground/80",
              )}
            />

            <div className="space-y-1 tracking-tight">
              <h3 className="text-sm font-medium text-muted-foreground">
                Try transforming an image
              </h3>
              <p className="text-xs text-muted-foreground">
                drop an image or paste url
              </p>
              <p className="text-xs text-muted-foreground/50">
                up to {formatBytes(fileUploadConfig.max_file_size)}
              </p>
            </div>

            <Button
              variant={"secondary"}
              onClick={openFileDialog}
              size="lg"
              className={cn(
                "text-muted-foreground hover:text-foreground pointer-events-none",
              )}
            >
              <Upload className="h-4 w-4" />
              Select images
            </Button>
          </div>
        </div>
      )}
      <div className="relative flex flex-col h-full w-full col-span-1 ">
        {!(files.length > 0 && files[0].preview) && (
          <div className="inset-0 bg-muted/70 cursor-not-allowed absolute top-0 left-0 z-10" />
        )}

        <form
          id="image-transformation-demo"
          className=" relative flex flex-col border h-full w-full"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <div className="flex gap-4 items-center justify-start bg-muted">
            <p className="px-2 truncate leading-tight text-sm text-muted-foreground flex-1">
              transformations
            </p>
            <Button
              onClick={() => form.reset()}
              variant={"secondary"}
              size={"icon"}
            >
              <RotateCcwIcon />
            </Button>
          </div>
          <div className="space-y-4 p-6 my-auto h-full w-full">
            <form.Field
              name="height"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid} className="gap-1">
                    <FieldLabel
                      className="text-sm mb-0 text-muted-foreground"
                      htmlFor={field.name}
                    >
                      height
                    </FieldLabel>
                    <div className="flex gap-4 items-center justify-start ps-2">
                      <Slider
                        step={10}
                        max={imgDimensions?.h}
                        showTooltip
                        id={field.name}
                        name={field.name}
                        value={field.state.value as number}
                        onBlur={field.handleBlur}
                        onValueChange={(value) =>
                          field.handleChange(
                            Array.isArray(value) ? value[0] : value,
                          )
                        }
                        aria-invalid={isInvalid}
                      />
                      <div
                        className={cn(
                          buttonVariants({ size: "sm", variant: "secondary" }),
                          "w-1/5",
                        )}
                      >
                        {field.state.value as number}
                      </div>
                    </div>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
            <form.Field
              name="width"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid} className="gap-1">
                    <FieldLabel
                      className="text-sm mb-0 text-muted-foreground"
                      htmlFor={field.name}
                    >
                      width
                    </FieldLabel>
                    <div className="flex gap-4 items-center justify-start ps-2">
                      <Slider
                        step={10}
                        max={imgDimensions?.w}
                        showTooltip
                        id={field.name}
                        name={field.name}
                        value={field.state.value as number}
                        onBlur={field.handleBlur}
                        onValueChange={(value) =>
                          field.handleChange(
                            Array.isArray(value) ? value[0] : value,
                          )
                        }
                        aria-invalid={isInvalid}
                      />
                      <div
                        className={cn(
                          buttonVariants({ size: "sm", variant: "secondary" }),
                          "w-1/5",
                        )}
                      >
                        {field.state.value as number}
                      </div>
                    </div>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
            <form.Field
              name="rotate"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid} className="gap-1">
                    <FieldLabel
                      className="text-sm mb-0 text-muted-foreground"
                      htmlFor={field.name}
                    >
                      rotate
                    </FieldLabel>
                    <div className="flex gap-4 items-center justify-start ps-2">
                      <Slider
                        // min={0}
                        step={1}
                        max={360}
                        showTooltip
                        id={field.name}
                        name={field.name}
                        value={field.state.value as number}
                        onBlur={field.handleBlur}
                        onValueChange={(value) =>
                          field.handleChange(
                            Array.isArray(value) ? value[0] : value,
                          )
                        }
                        aria-invalid={isInvalid}
                      />
                      <div
                        className={cn(
                          buttonVariants({ size: "sm", variant: "secondary" }),
                          "w-1/5",
                        )}
                      >
                        {field.state.value as number}
                      </div>
                    </div>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
            <div className="text-xs text-muted-foreground my-2">filters</div>
            <form.Field
              name="blur"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid} className="gap-1">
                    <FieldLabel
                      className="text-sm mb-0 text-muted-foreground"
                      htmlFor={field.name}
                    >
                      blur
                    </FieldLabel>
                    <div className="flex gap-4 items-center justify-start ps-2">
                      <Slider
                        // min={0}
                        step={1}
                        max={100}
                        showTooltip
                        id={field.name}
                        name={field.name}
                        value={field.state.value as number}
                        onBlur={field.handleBlur}
                        onValueChange={(value) =>
                          field.handleChange(
                            Array.isArray(value) ? value[0] : value,
                          )
                        }
                        aria-invalid={isInvalid}
                      />
                      <div
                        className={cn(
                          buttonVariants({ size: "sm", variant: "secondary" }),
                          "w-1/5",
                        )}
                      >
                        {field.state.value as number}
                      </div>
                    </div>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
            <form.Field
              name="grayscale"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid} className="gap-1">
                    <FieldLabel
                      className="text-sm mb-0 text-muted-foreground"
                      htmlFor={field.name}
                    >
                      grayscale
                    </FieldLabel>
                    <div className="flex gap-4 items-center justify-start ps-2">
                      <Slider
                        // min={0}
                        step={1}
                        max={100}
                        showTooltip
                        id={field.name}
                        name={field.name}
                        value={field.state.value as number}
                        onBlur={field.handleBlur}
                        onValueChange={(value) =>
                          field.handleChange(
                            Array.isArray(value) ? value[0] : value,
                          )
                        }
                        aria-invalid={isInvalid}
                      />
                      <div
                        className={cn(
                          buttonVariants({ size: "sm", variant: "secondary" }),
                          "w-1/5",
                        )}
                      >
                        {field.state.value as number}
                      </div>
                    </div>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
            <form.Field
              name="format"
              children={(field) => {
                const renderValue = (string: string) => {
                  if (typeof string === "string") {
                    return string?.split("/")[1]?.split("+")[0];
                  }
                  return string;
                };
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                const formatOptions = schemas.mimeEnum.enumValues.map((i) => ({
                  value: i,
                  label: renderValue(i),
                }));
                return (
                  <Field data-invalid={isInvalid} className="gap-y-0">
                    <FieldLabel
                      className="text-sm mb-0 text-muted-foreground"
                      htmlFor={field.name}
                    >
                      format
                    </FieldLabel>
                    <Select items={formatOptions} indicatorPosition="right">
                      <SelectTrigger
                        disabled={files.length < 1}
                        className={cn(
                          inputVariants({ variant: "sm" }),
                          "justify-between mt-auto",
                        )}
                      >
                        <SelectValue
                          placeholder={renderValue(files[0]?.file?.type)}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {formatOptions?.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
            <form.Field
              name="quality"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid} className="gap-y-0.5">
                    <FieldLabel
                      className="text-xs text-muted-foreground mb-0"
                      htmlFor={field.name}
                    >
                      quality
                    </FieldLabel>
                    <Input
                      variant={"sm"}
                      type="number"
                      id={field.name}
                      name={field.name}
                      value={field.state.value as number}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(Number.parseInt(e.target.value, 10))
                      }
                      aria-invalid={isInvalid}
                      placeholder="quality"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />

            <Button
              type="submit"
              form="image-transformation-demo"
              className="w-full"
            >
              submit
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
