"use client";
import { useMutation } from "@tanstack/react-query";
import { fileUploadConfig } from "@morpics/buckets/upload-file-config";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  Alert,
  AlertContent,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  type FileMetadata,
  type FileWithPreview,
  formatBytes,
  useFileUpload,
} from "@/hooks/use-file-upload";
import { cn } from "@/lib/utils";
import { orpc, queryClient } from "@/utils/orpc";
import z from "zod";
import {
  PiImageSquare,
  PiMagnifyingGlassPlus,
  PiTrash,
  PiTrashSimple,
  PiTrayArrowUp,
  PiWarning,
} from "react-icons/pi";
import { Dialog, DialogBody, DialogContent } from "../ui/dialog";

interface GalleryUploadProps {
  maxFiles?: number;
  maxSize?: number;
  accept?: string;
  multiple?: boolean;
  className?: string;
  onFilesChange?: (files: FileWithPreview[]) => void;
  reqMetadata: { orgId: string; userId: string };
}

export const uploadFilesSchema = z.object({
  files: z.custom<FileWithPreview>(),
});

export default function GalleryUpload({
  maxFiles = fileUploadConfig.max_files,
  maxSize = fileUploadConfig.max_file_size,
  accept = fileUploadConfig.accept.join(", "),
  multiple = fileUploadConfig.multiple_files,
  className,
  onFilesChange,
  reqMetadata,
}: GalleryUploadProps) {
  const [selectedImage, setSelectedImage] = useState<FileWithPreview | null>(
    null,
  );
  const [
    { files, isDragging, errors },
    {
      removeFile,
      clearFiles,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      getInputProps,
    },
  ] = useFileUpload({
    maxFiles,
    maxSize,
    accept,
    multiple,
    onFilesChange,
  });

  const isImage = (file: File | FileMetadata) => {
    const type = file instanceof File ? file.type : file.type;
    return type.startsWith("image/");
  };
  const router = useRouter();

  const abortControllerRef = useRef<AbortController | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (filesToUpload: FileWithPreview[]) => {
      abortControllerRef.current = new AbortController();
      // Generate presigned URLs
      const urls = await orpc.protectedRoutes.mutations.getPreSignedUrl.call(
        {
          keys: filesToUpload.map((f) => f.file.name),
          orgId: reqMetadata.orgId,
        },
        { signal: abortControllerRef.current?.signal },
      );

      // Upload all files in parallel
      const uploadResults = await Promise.allSettled(
        urls.map(async (url) => {
          const file = filesToUpload.find((fl) => fl.file.name === url.key);

          if (!file) {
            throw new Error(`File not found for key: ${url.key}`);
          }

          await fetch(url.url, {
            method: "PUT",
            body: file.file as File,
            signal: abortControllerRef.current?.signal,
          })
            .catch(async (err) => {
              toast.error(err?.message);
              await orpc.protectedRoutes.mutations.mutateStatusSingle.call(
                {
                  imageKey: url.key,
                  status: "failed",
                },
                { signal: abortControllerRef.current?.signal },
              );
            })
            .then(async (res) => {
              const imgid =
                await orpc.protectedRoutes.mutations.mutateStatusSingle.call({
                  imageKey: url.key,
                  status: "success",
                });
              try {
                const img = new Image();
                img.src = file.preview as string;
                img.onload = async () => {
                  const updateImageInfo =
                    await orpc.protectedRoutes.mutations.ceateImgInfo.call({
                      fileName: file.file.name,
                      fileSize: file.file.size,
                      mimeType: file.file.type as any,
                      height: img.naturalHeight,
                      width: img.naturalWidth,
                      imageId: imgid[0].id,
                    });
                  console.log("[IMAGE INFO ADDED]: ", updateImageInfo);
                };
              } catch (er) {
                console.log(er);
                toast.error("Unable to update image info", {
                  description: "see browser console",
                });
              }
            });
          return { key: url.key, success: true };
        }),
      );

      // Check for failures
      const failures = uploadResults.filter((r) => r.status === "rejected");
      if (failures.length > 0) {
        console.log(failures);
        throw new Error(`${failures.length} file(s) failed to upload`);
      }

      return uploadResults;
    },

    onSuccess: () => {
      router.push("/dashboard");
      queryClient.refetchQueries({ queryKey: ["images"] });

      clearFiles();
    },
    onError: (error) => {
      console.error("Upload error:", error);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
      }}
      className={cn(
        "w-full my-auto max-w-2xl space-y-4 bg-background h-full",
        className,
      )}
    >
      {/* Upload Area */}
      {files.length < 1 && (
        <div
          className={cn(
            "relative border border-dashed p-8 m-auto text-center transition-colors max-w-xl",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50",
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input {...getInputProps()} className="sr-only" />

          <div className="flex flex-col items-center gap-8">
            <div
              className={cn(
                "flex h-16 w-16 items-center justify-center",
                isDragging ? "bg-primary/10" : "bg-muted",
              )}
            >
              <PiImageSquare
                className={cn(
                  "size-6",
                  isDragging ? "text-primary" : "text-muted-foreground",
                )}
              />
            </div>

            <div className="space-y-2 text-pretty">
              <h3 className="text-lg">Upload images to gallery</h3>
              <p className="text-sm text-muted-foreground">
                Drag and drop images here
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, GIF up to {formatBytes(maxSize)} each (max {maxFiles}{" "}
                files)
              </p>
            </div>

            <Button onClick={openFileDialog} size="lg" className="w-full">
              <PiTrayArrowUp className="h-4 w-4" />
              Select images
            </Button>
          </div>
        </div>
      )}
      {/* Gallery Stats */}
      {files.length > 0 && (
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-1 ">
            <h4 className=" font-medium">
              Gallery ({files.length}/{maxFiles})
            </h4>
            <div className="text-muted-foreground">
              Total:{" "}
              {formatBytes(
                files.reduce((acc, file) => acc + file.file.size, 0),
              )}
            </div>
          </div>
          {/* right side buttons */}
          <div className="inline-flex items-center justify-between gap-2 pointer-events-auto">
            <Button
              onClick={clearFiles}
              variant="destructive"
              className=""
              size="sm"
            >
              <PiTrash />
              <span className="hidden md:block">Clear all</span>
            </Button>
          </div>
        </div>
      )}
      {/* Image Grid */}
      {files.length > 0 && (
        <ScrollArea
          className={"max-h-[calc(100vh-12rem)] overflow-scroll bg-secondary"}
        >
          <div
            className={cn(
              "grid grid-flow-row grid-cols-1 sm:grid-cols-2 gap-1 p-1",
            )}
          >
            {files.map((fileItem) => (
              <div
                key={fileItem.id}
                className="group relative h-auto max-w-full "
              >
                {isImage(fileItem.file) && fileItem.preview ? (
                  <img
                    src={fileItem.preview}
                    alt={fileItem.file.name}
                    className="border object-cover transition-transform aspect-square w-full"
                  />
                ) : (
                  <div className="flex items-center justify-center  border bg-muted">
                    <PiImageSquare className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}

                {/* File Info */}
                <div className="bg-muted p-2 text-foreground transition-opacity">
                  <p className="truncate text-xs font-medium">
                    {fileItem.file.name}
                  </p>
                  <p className="text-xs">{formatBytes(fileItem.file.size)}</p>
                  {/* Overlay */}
                  <div className="flex items-center justify-end gap-1">
                    {/* Edit metadata button */}

                    {/* View Button */}
                    {fileItem.preview && (
                      <Button
                        title="zoom image"
                        onClick={() => setSelectedImage(fileItem)}
                        variant="secondary"
                        size="icon"
                        className="size-7"
                      >
                        <PiMagnifyingGlassPlus />
                      </Button>
                    )}

                    {/* Remove Button */}
                    <Button
                      title="remove image"
                      onClick={() => removeFile(fileItem.id)}
                      variant="secondary"
                      size="icon"
                      className="size-7"
                    >
                      <PiTrashSimple />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
      {/* UploadButton */}
      {files.length > 0 && (
        <Button
          className="w-full"
          onClick={() => {
            toast.promise(uploadMutation.mutateAsync(files), {
              loading: (
                <p className="flex flex-wrap w-full items-center justify-between capitalize [&>*]:capitalize">
                  <span className="flex-1">uploading files</span>{" "}
                  <Button
                    size={"sm"}
                    variant={"destructive"}
                    className=" bg-destructive/40 border-destructive/40 border transition-all duration-150 ease-in-out"
                    onClick={() => abortControllerRef.current?.abort()}
                  >
                    cancel uploading
                  </Button>
                </p>
              ),
              classNames: { content: "w-full" },
              success: "All Files Uploaded Successfully!",
              cancel: true,
              closeButton: true,
              error: (e) => {
                console.error(e);
                return (
                  <p>
                    {e?.message || "Unable to upload files"}
                    <br />
                    See browser console for more details
                  </p>
                );
              },
            });
          }}
          disabled={uploadMutation.isPending}
        >
          <PiTrayArrowUp />{" "}
          {uploadMutation.isPending ? "Uploading..." : "Upload"}
        </Button>
      )}{" "}
      {/* Error Messages */}
      {errors.length > 0 && (
        <Alert variant="destructive" appearance="light" className="mt-5">
          <AlertIcon>
            <PiWarning />
          </AlertIcon>
          <AlertContent>
            <AlertTitle>File upload error(s)</AlertTitle>

            <AlertDescription>
              {errors.map((error, index) => {
                console.log(JSON.stringify(errors, null, 2));
                return (
                  <p key={index} className="last:mb-0">
                    {error}
                  </p>
                );
              })}
            </AlertDescription>
          </AlertContent>
        </Alert>
      )}
      {/* Image Preview Modal */}
      {selectedImage && (
        <Dialog
          open={!!selectedImage}
          onOpenChange={() => setSelectedImage(null)}
        >
          <DialogContent showDismissButton>
            <DialogBody>
              <img
                src={selectedImage.preview}
                alt="Preview"
                className="object-cover object-center max-h-[calc(100vh-12rem)] w-full"
                onClick={(e) => e.stopPropagation()}
                role="presentation"
              />
            </DialogBody>
          </DialogContent>{" "}
        </Dialog>
      )}
    </form>
  );
}
