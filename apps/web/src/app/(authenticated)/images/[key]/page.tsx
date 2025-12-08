"use client";
import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import { Label } from "@/components/ui/label";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Input,
  InputAddon,
  InputGroup,
  inputVariants,
  InputWrapper,
} from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import React from "react";
import {
  PiArrowCounterClockwise,
  PiArrowLeft,
  PiCopy,
  PiFloppyDisk,
  PiLockSimple,
  PiLockSimpleOpen,
  PiPencilSimple,
  PiPlus,
  PiSpinner,
  PiX,
} from "react-icons/pi";
import { Separator } from "@/components/ui/separator";
import z from "zod";
import { useForm, useStore } from "@tanstack/react-form";
import { Skeleton } from "@/components/ui/skeleton";
import { schemas } from "@morpics/api/schemas";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import * as schema from "@morpics/api/schemas";
import { toast } from "sonner";

const transformationSchema = z.object({
  height: z.number().min(10),
  width: z.number().min(10),
  rotate: z.number().min(0),
  blur: z.number().min(0).max(100),
  grayscale: z.number().min(0).max(100),
  format: z.enum(schemas.mimeEnum.enumValues),
  quality: z.number().min(1).max(100),
});

function Page({ params }: { params: Promise<{ key: string }> }) {
  const { key } = React.use(params);
  const [formStatus, setFormStatus] = React.useState(false);
  const { data: bucket } = authClient.useActiveOrganization();
  const { data: image, isPending } = useQuery(
    orpc.protectedRoutes.queries.getImage.queryOptions({
      input: {
        key,
        bucketId: bucket?.id as string,
      },
      enabled: !!bucket?.id,
      queryKey: ["image", key],
    }),
  );

  // const updateMetaMutation = useMutation({mutationFn:async()=>{
  //   const t = await orpc.protectedRoutes.mutations.updateInfo.call({})
  // }})

  const [imgDimensions, setImgDimensions] = React.useState<{
    w: number;
    h: number;
  }>({
    h: 0,
    w: 0,
  });

  React.useEffect(() => {
    if (!image?.url) return;
    const img = new Image();
    img.src = image.url;
    img.onload = () => {
      setImgDimensions({
        w: img.naturalWidth,
        h: img.naturalHeight,
      });
    };
  }, [image?.url]);

  const transformationForm = useForm({
    defaultValues: {
      height: imgDimensions.h,
      width: imgDimensions.w,
      rotate: 0,
      filter: undefined,
      format: image?.metadata.mimeType,
      quality: 100,
      blur: 0,
      grayscale: 0,
    } as z.input<typeof transformationSchema>,
    validators: {
      onChange: transformationSchema,
    },
    onSubmit: async ({ value }) => {
      // Parse to get validated/transformed values
      const validatedData = transformationSchema.safeParse(value);
      console.log(validatedData);
    },
  });

  const transformationStates = useStore(
    transformationForm.store,
    (state) => state.values,
  );

  const metaForm = useForm({
    validators: {
      onChange: schema.updateInfoSchema,
    },
    onSubmit: async ({ value }) => {
      const abortControllerRef = new AbortController();
      if (formStatus) {
        toast.promise(
          orpc.protectedRoutes.mutations.updateInfo.call(value, {
            signal: abortControllerRef.signal,
          }),
          {
            loading: "updating data",
            error: (e) => {
              console.log(e);
              return "unable to update data";
            },
            success: (s) => {
              console.log(s);
              return "data updated successfully";
            },
          },
        );
      }
    },
    defaultValues: {
      imgId: image?.id ?? "",
      key: image?.key ?? "",
      fileName: image?.metadata.fileName ?? undefined,
      altTxt: image?.metadata.altText ?? "alt text for image",
      tags:
        image?.imageTags.map((i) => ({ id: i.tagId, value: i.tag.name })) ?? [],
    } as z.input<typeof schema.updateInfoSchema>,
  });

  const router = useRouter();
  const isMobile = useIsMobile();

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-2">
      {isPending ? (
        <>
          <Skeleton className="aspect-square w-full" />
          <Skeleton className="aspect-square w-full" />
        </>
      ) : (
        <>
          <div className="col-span-full flex items-center justify-between">
            <Button
              size={isMobile ? "xs" : "sm"}
              variant={"dim"}
              onClick={() => {
                router.back();
              }}
            >
              <PiArrowLeft /> Go back
            </Button>
            <Button size={"sm"} onClick={() => setFormStatus((p) => !p)}>
              {!formStatus ? (
                <>
                  <PiLockSimpleOpen /> make content editable
                </>
              ) : (
                <>
                  <PiLockSimple /> Lock edits
                </>
              )}{" "}
            </Button>
          </div>
          <div className="border p-2 flex flex-col justify-start h-full bg-muted gap-2 ">
            <div className="overflow-hidden flex items-center justify-start border max-h-96">
              <img
                src={image?.url}
                className={cn(
                  "object-contain overflow-hidden origin-center h-94 aspect-auto mx-auto",
                )}
                style={{
                  height: `${Math.round((transformationStates.height / imgDimensions.h) * 100)}%`,
                  width: `${Math.round((transformationStates.width / imgDimensions.w) * 100)}%`,
                  rotate: `${transformationStates.rotate}deg`,
                  filter: `blur(${transformationStates.blur / 10}px) grayscale(${transformationStates.grayscale}%)`,
                }}
              />
            </div>
            <div className="relative">
              {!formStatus ? (
                <div className=" absolute inset-0 bg-muted/50 flex items-center justify-center backdrop-brightness-80 top-0 left-0 z-10" />
              ) : null}

              <form
                id="metadata-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  metaForm.handleSubmit();
                }}
                className="border p-2 bg-muted/50 space-y-2 h-fit"
              >
                <InputGroup className="flex-col sm:flex-row ">
                  <InputAddon className="text-muted-foreground sm:w-32 border-b-0 sm:border-b justify-center text-xs">
                    public-url
                  </InputAddon>
                  <InputWrapper className="pe-0">
                    <Input readOnly value={image?.url} />
                    <Button size={"icon"} variant={"secondary"} type="button">
                      <PiCopy />
                    </Button>
                  </InputWrapper>
                </InputGroup>
                <metaForm.Field
                  name="key"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-1">
                        <InputGroup className="flex-col sm:flex-row ">
                          <InputAddon className="text-muted-foreground sm:w-32 border-b-0 sm:border-b justify-center text-xs">
                            public-key
                          </InputAddon>
                          <InputWrapper className="pe-0">
                            <Input
                              readOnly
                              value={field.state.value}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                            />
                            <Button
                              size={"icon"}
                              variant={"secondary"}
                              type="button"
                            >
                              <PiCopy />
                            </Button>
                          </InputWrapper>
                        </InputGroup>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />
                <Separator className={"my-2"} />
                <metaForm.Field
                  name="fileName"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-1">
                        <InputGroup className="flex-col sm:flex-row">
                          <InputAddon className="text-muted-foreground sm:w-32 border-b-0 sm:border-b justify-center text-xs">
                            file name
                          </InputAddon>
                          <InputWrapper className="pe-0">
                            <Input
                              value={field.state.value}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                            />
                            <Button size={"icon"} variant={"secondary"}>
                              <PiPencilSimple />
                            </Button>
                          </InputWrapper>
                        </InputGroup>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />
                <metaForm.Field
                  name="altTxt"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-1">
                        <InputGroup className="flex-col sm:flex-row">
                          <InputAddon className="text-muted-foreground sm:w-32 border-b-0 sm:border-b justify-center text-xs">
                            Alt-text
                          </InputAddon>
                          <InputWrapper className="pe-0">
                            <Input
                              placeholder="alt text for image"
                              value={field.state.value}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                            />
                            <Button size={"icon"} variant={"secondary"}>
                              <PiPencilSimple />
                            </Button>
                          </InputWrapper>
                        </InputGroup>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />
                <metaForm.Field
                  name="tags"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;

                    return (
                      <Field data-invalid={isInvalid} className="gap-1">
                        <div className="flex items- sm:flex-row flex-col">
                          <Label className="shrink-0 h-full bg-muted border border-input min-h-9 px-3 text-muted-foreground sm:w-32 border-b-0 sm:border-b w-full justify-center text-xs font-normal">
                            image tags
                          </Label>
                          <MultiSelectCombobox
                            items={
                              image?.allOrgTags.map((i) => ({
                                id: i.id,
                                value: i.name,
                              })) ?? []
                            }
                            value={field.state.value}
                            onValueChange={(newTags) => {
                              field.handleChange(newTags);
                            }}
                            onCreateTag={async (tagName) => {
                              toast.promise(
                                orpc.protectedRoutes.mutations.createTag.call({
                                  name: tagName,
                                  imgId: image?.id as string,
                                }),
                                {
                                  loading: `creating tag ${tagName}`,
                                  error: "unable to create tag",
                                  success: (d) => {
                                    // After creating, add the new tag ID to the field
                                    if (d?.tag) {
                                      field.handleChange([
                                        ...(Array.isArray(field.state.value)
                                          ? field.state.value
                                          : []),
                                        { id: d.tag.id, value: d.tag.name },
                                      ]);
                                    }
                                    console.log("[tag created]: ", d);
                                    return "tag created";
                                  },
                                },
                              );
                            }}
                          />
                        </div>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <Button
                    type="reset"
                    form="metadata-form"
                    variant={"dim"}
                    onClick={() => {
                      metaForm.reset();
                    }}
                  >
                    reset
                  </Button>{" "}
                  <Button
                    type="submit"
                    form="metadata-form"
                    disabled={metaForm.state.isSubmitting}
                  >
                    {metaForm.state.isSubmitting ? (
                      <PiSpinner className="animate-spin" />
                    ) : (
                      <PiFloppyDisk />
                    )}
                    {metaForm.state.isSubmitting
                      ? "updating..."
                      : "Update Metadata"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
          <div className="relative">
            {!formStatus ? (
              <div className=" absolute inset-0 bg-muted/50 flex items-center justify-center backdrop-brightness-80 top-0 left-0 z-10" />
            ) : null}
            <form
              id="transformation-form"
              className=" relative flex flex-col border h-full w-full p-2 bg-muted"
              onSubmit={(e) => {
                e.preventDefault();
                transformationForm.handleSubmit();
              }}
            >
              <div className=" p-2 my-auto h-full w-full border flex flex-col justify-between">
                  <div className="space-y-4 w-full">
                  
                <transformationForm.Field
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
                              buttonVariants({
                                size: "sm",
                                variant: "secondary",
                              }),
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
                <transformationForm.Field
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
                              buttonVariants({
                                size: "sm",
                                variant: "secondary",
                              }),
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
                <transformationForm.Field
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
                              buttonVariants({
                                size: "sm",
                                variant: "secondary",
                              }),
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
                <Separator className={"my-4"} />
                <transformationForm.Field
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
                              buttonVariants({
                                size: "sm",
                                variant: "secondary",
                              }),
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
                <transformationForm.Field
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
                              buttonVariants({
                                size: "sm",
                                variant: "secondary",
                              }),
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
                <Separator className={"my-4"} />
                <transformationForm.Field
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
                    const formatOptions = schemas.mimeEnum.enumValues.map(
                      (i) => ({
                        value: i,
                        label: renderValue(i),
                      }),
                    );
                    return (
                      <Field data-invalid={isInvalid} className="gap-y-1">
                        <FieldLabel
                          className="text-sm text-muted-foreground"
                          htmlFor={field.name}
                        >
                          format
                        </FieldLabel>
                        <Select items={formatOptions} indicatorPosition="right">
                          <SelectTrigger
                            // disabled={files.length < 1}
                            className={cn(
                              inputVariants({ variant: "lg" }),
                              "justify-between mt-auto",
                            )}
                          >
                            <SelectValue
                              placeholder={renderValue(
                                image?.metadata.mimeType as any,
                              )}
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
                <transformationForm.Field
                  name="quality"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-y-1">
                        <FieldLabel
                          className="text-sm text-muted-foreground"
                          htmlFor={field.name}
                        >
                          quality
                        </FieldLabel>
                        <Input
                          variant={"lg"}
                          type="number"
                          id={field.name}
                          name={field.name}
                          value={field.state.value as number}
                          onBlur={field.handleBlur}
                          onChange={(e) =>
                            field.handleChange(
                              Number.parseInt(e.target.value, 10),
                            )
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
                <Separator className={"my-4"} />
              
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <Button
                    type="reset"
                    form="transformation-form"
                    variant={"dim"}
                    onClick={() => {
                      transformationForm.reset();
                    }}
                  >
                    reset
                  </Button>
                  <Button
                    type="submit"
                    form="transformation-form"
                    disabled={transformationForm.state.isSubmitting}
                  >
                    {transformationForm.state.isSubmitting ? (
                      <PiSpinner className="animate-spin" />
                    ) : (
                      <PiPlus />
                    )}
                    {transformationForm.state.isSubmitting
                      ? "creating..."
                      : "create transformation"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </>
      )}
    </section>
  );
}

export default Page;
