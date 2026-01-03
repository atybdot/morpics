/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <explanation> */
"use client";
import * as schema from "@morpics/api/schemas";
import { toSlug } from "@morpics/buckets/utils";
import * as sdk from "@morpics/sdk";
import { useForm, useStore } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { useCopyToClipboard, useLocalStorage } from "@uidotdev/usehooks";
import { useRouter } from "next/navigation";
import { parseAsBoolean, useQueryState } from "nuqs";
import React from "react";
import {
  PiCheck,
  PiCopy,
  PiFloppyDisk,
  PiLock,
  PiLockOpen,
  PiPencilSimple,
  PiPlus,
  PiSpinner,
  PiXSquare,
} from "react-icons/pi";
import { toast } from "sonner";
import z from "zod";
import GoBackBtn from "@/components/elements/go-back-btn";
import { Button, buttonVariants } from "@/components/ui/button";
import { CardAlt, CardContentAlt } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogAction,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Input,
  InputAddon,
  InputGroup,
  InputWrapper,
  inputVariants,
} from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { orpc, queryClient } from "@/utils/orpc";

const transformationFormSchema = sdk.schema.transformationQuerySchema;

function Page({ params }: { params: Promise<{ key: string }> }) {
  const { key } = React.use(params);
  const [allowPublickeyChange, setPublickeyChange] = useQueryState(
    "edit_public-key",
    parseAsBoolean.withDefault(false),
  );
  const { data: bucket } = authClient.useActiveOrganization();
  const { data: image, isPending } = useQuery(
    orpc.images.get.queryOptions({
      input: {
        key: `${bucket?.slug}/${key}`,
        bucketId: bucket?.id as string,
        bucket: bucket?.slug as string,
      },
      enabled: !!bucket?.id,
      queryKey: ["image", key, `${bucket?.slug}/${key}`],
    }),
  );

  const { data: transformations, isPending: transformationsPending } = useQuery(
    orpc.transformation.get.queryOptions({
      input: {
        imgId: image?.id as string,
      },
    }),
  );

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
      h: imgDimensions.h,
      w: imgDimensions.w,
      r: 0,
      format: image?.metadata?.mimeType?.split("/")[1] as any,
      quality: 100,
      blur: 0,
    } as z.input<typeof transformationFormSchema>,
    validators: {
      onChange: transformationFormSchema,
    },
    onSubmit: async ({ value }) => {
      const validatedData = transformationFormSchema.safeParse(value);
      console.log("validatedData", validatedData.data);
      if (!validatedData.success) {
        toast.error("please fix the errors in the form");
        return;
      }

      try {
        const url = sdk
          .generateUrl({ imageKey: key, bucket: bucket?.slug as string })
          .format(validatedData.data);
        console.log(url);
      } catch (error) {
        if (error instanceof Error) console.log(error?.message);
      }
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
      const formKeyVal = value.key ? toSlug(value.key) : "";
      toast.promise(
        orpc.images.updateInfo.call(
          allowPublickeyChange ? { ...value } : { ...value },
          {
            signal: abortControllerRef.signal,
          },
        ),
        {
          loading: "updating data",
          error: (e) => {
            console.log(e);
            return "unable to update data";
          },
          success: (s) => {
            console.log(s);
            if (key !== formKeyVal && s.imgKey) {
              router.replace(`/images/${s.imgKey.split("/")[1]}`);
              queryClient.refetchQueries({
                queryKey: [key, formKeyVal, s.imgKey],
              });
            }
            queryClient.invalidateQueries({ queryKey: [key, s.imgKey] });
            return "data updated successfully";
          },
        },
      );
    },
    defaultValues: {
      imgId: image?.id ?? "",
      key: image?.key.split("/")[1] ?? "",
      fileName: image?.metadata.fileName ?? undefined,
      altTxt: image?.metadata.altText ?? "",
      tags:
        image?.imageTags.map((i) => ({ id: i.tagId, value: i.tag.name })) ?? [],
    } as z.input<typeof schema.updateInfoSchema>,
  });

  const router = useRouter();
  const [_, copyToClipboard] = useCopyToClipboard();
  const [updtD, setUpdtD] = useLocalStorage("show-update-dialog", true);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-2">
      {isPending ? (
        <>
          <Skeleton className="aspect-square w-full" />
          <Skeleton className="aspect-square w-full" />
        </>
      ) : (
        <>
          <GoBackBtn />
          <div className="border p-2 flex flex-col justify-start h-full bg-muted gap-2 ">
            <div className="overflow-hidden flex items-center justify-start border max-h-96">
              <img
                src={image?.url}
                className={cn(
                  "object-contain overflow-hidden origin-center h-94 aspect-auto mx-auto",
                )}
                style={{
                  height: `${Math.round(((transformationStates.h as number) / imgDimensions.h) * 100)}%`,
                  width: `${Math.round(((transformationStates.w as number) / imgDimensions.w) * 100)}%`,
                  rotate: `${transformationStates.r}deg`,
                  filter: `blur(${transformationStates.blur as number}px)`,
                }}
              />
            </div>
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
                  <Button
                    size={"icon"}
                    variant={"secondary"}
                    type="button"
                    onClick={() => {
                      copyToClipboard(image?.url ?? "");
                      toast.info("url is copied", {
                        icon: <PiCheck className="size-4" />,
                      });
                    }}
                  >
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
                    <Field
                      data-invalid={isInvalid}
                      className="gap-1"
                      title="click on the lock icon to edit"
                    >
                      <InputGroup className="flex-col sm:flex-row ">
                        <InputAddon className="text-muted-foreground sm:w-32 border-b-0 sm:border-b justify-center text-xs">
                          public-key
                        </InputAddon>
                        <InputWrapper className="pe-0">
                          <Input
                            readOnly={!allowPublickeyChange}
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                          <Dialog>
                            <DialogTrigger
                              onClick={(e) => {
                                if (allowPublickeyChange) {
                                  e.preventBaseUIHandler();
                                  setPublickeyChange(false);
                                }
                              }}
                              render={
                                <Button
                                  size={"icon"}
                                  variant={"secondary"}
                                  type="button"
                                />
                              }
                            >
                              {!allowPublickeyChange ? (
                                <PiLock />
                              ) : (
                                <PiLockOpen />
                              )}
                            </DialogTrigger>
                            <DialogContent
                              className={"p-4"}
                              showDismissButton={false}
                            >
                              <DialogTitle
                                className={
                                  "text-muted-foreground font-light text-base"
                                }
                              >
                                You are trying to change public-key
                              </DialogTitle>
                              <Separator className={"my-px"} />
                              <DialogDescription>
                                changing of public-key :
                              </DialogDescription>
                              <DialogBody>
                                <div className="flex flex-col items-start gap-2 mb-2">
                                  {[
                                    "will have un-indented consequences",
                                    "image links will break",
                                    "prod might break",
                                  ].map((i) => (
                                    <span className="grid grid-cols-[auto_1fr] gap-1 font-light text-foreground text-sm">
                                      <PiXSquare className="inline mt-1 text-rose-500" />
                                      {i}
                                    </span>
                                  ))}
                                </div>
                              </DialogBody>
                              <DialogFooter>
                                <DialogAction
                                  onClick={() => {
                                    setPublickeyChange(true);
                                  }}
                                  render={
                                    <Button variant={"dim"} size={"sm"} />
                                  }
                                >
                                  Yes, change public-key
                                </DialogAction>
                                <DialogClose render={<Button size={"sm"} />}>
                                  No, don't change public-key
                                </DialogClose>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
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
                            value={field.state.value as any}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                          <div
                            className={cn(
                              buttonVariants({
                                size: "icon",
                                variant: "secondary",
                              }),
                            )}
                          >
                            <PiPencilSimple />
                          </div>
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
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                          <div
                            className={cn(
                              buttonVariants({
                                size: "icon",
                                variant: "secondary",
                              }),
                            )}
                          >
                            <PiPencilSimple />
                          </div>
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
                              orpc.images.createTag.call({
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
                <Dialog>
                  <DialogTrigger
                    disabled={metaForm.state.isSubmitting}
                    onClick={(e) => {
                      if (!updtD) {
                        e.preventBaseUIHandler();
                        metaForm.handleSubmit();
                      }
                    }}
                    render={
                      <Button
                        type="button"
                        disabled={metaForm.state.isSubmitting}
                      />
                    }
                  >
                    {metaForm.state.isSubmitting ? (
                      <PiSpinner className="animate-spin" />
                    ) : (
                      <PiFloppyDisk />
                    )}
                    {metaForm.state.isSubmitting
                      ? "updating..."
                      : "Update Metadata"}
                  </DialogTrigger>
                  <DialogContent className={"p-4"}>
                    <DialogTitle
                      className={"text-muted-foreground font-light text-base"}
                    >
                      Update metadata ?
                    </DialogTitle>
                    <Separator className={"my-px"} />
                    <DialogDescription>
                      Do you really want to update image metadata?
                    </DialogDescription>
                    <DialogBody className="ps-0 mt-0">
                      <div
                        onClick={() => {
                          setUpdtD((p) => !p);
                        }}
                        className={cn(
                          buttonVariants({
                            variant: "dim",
                            size: "xs",
                          }),
                          "flex-row-reverse justify-between ps-0",
                        )}
                      >
                        <Label className="font-light">
                          Don't warn me again
                        </Label>
                        <Checkbox
                          size={"xs"}
                          className={"mr-1 opacity-80"}
                          checked={!updtD}
                          onCheckedChange={(e) => setUpdtD((p) => !p)}
                        />
                      </div>
                    </DialogBody>
                    <DialogFooter>
                      <DialogAction
                        type="submit"
                        form="metadata-form"
                        disabled={metaForm.state.isSubmitting}
                        onClick={async (e) => {
                          setPublickeyChange(true);
                        }}
                        render={<Button variant={"dim"} size={"sm"} />}
                      >
                        {metaForm.state.isSubmitting ? (
                          <PiSpinner className="animate-spin" />
                        ) : null}
                        {metaForm.state.isSubmitting
                          ? "updating..."
                          : "Yes, Update Metadata"}
                      </DialogAction>
                      <DialogClose
                        render={<Button size={"sm"} />}
                        disabled={metaForm.state.isSubmitting}
                      >
                        No, don't update
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </form>
          </div>
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
                  name="h"
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
                  name="w"
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
                  name="r"
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
                {/* <transformationForm.Field
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
                <Separator className={"my-4"} /> */}
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
                    const formatOptions =
                      schema.schemas.mimeEnum.enumValues.map((i) => ({
                        value: i,
                        label: renderValue(i),
                      }));
                    return (
                      <Field data-invalid={isInvalid} className="gap-y-1">
                        <FieldLabel
                          className="text-sm text-muted-foreground"
                          htmlFor={field.name}
                        >
                          format
                        </FieldLabel>
                        <Select
                          items={formatOptions}
                          indicatorPosition="right"
                          onValueChange={(e) =>
                            //@ts-expect-error ""
                            field.handleChange(renderValue(e))
                          }
                        >
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
                {/* <Separator className={"my-4"} /> */}
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

          <div className="col-span-full my-8">
            <h2 className="text-2xl mb-4">Transformations</h2>
            {transformationsPending ? (
              <Skeleton className="col-span-full aspect-square" />
            ) : transformations?.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                no transformations found for this image
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {transformations?.map((t) => {
                  const imgKey = `${t.key}?${t.transformation_query}`;
                  return (
                    <CardAlt>
                      <CardContentAlt>
                        <img
                          src={imgKey}
                          className=" aspect-square contain w-full border-0"
                        />
                      </CardContentAlt>
                    </CardAlt>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default Page;
