"use client";
import { useMutation } from "@tanstack/react-query";
import {
  ImageIcon,
  Trash2Icon,
  TriangleAlert,
  Upload,
  XIcon,
  ZoomInIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogPopup,
} from "@/components/animate-ui/components/base/dialog";
import {
  Alert,
  AlertContent,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getUrl } from "@/functions/create-pre-signed-url";
import {
  type FileMetadata,
  type FileWithPreview,
  formatBytes,
  useFileUpload,
} from "@/hooks/use-file-upload";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";

interface GalleryUploadProps {
  maxFiles?: number;
  maxSize?: number;
  accept?: string;
  multiple?: boolean;
  className?: string;
  onFilesChange?: (files: FileWithPreview[]) => void;
}

export default function GalleryUpload({
  maxFiles = 10,
  maxSize = 5 * 1024 * 1024, // 5MB
  accept = "image/*",
  multiple = true,
  className,
  onFilesChange,
}: GalleryUploadProps) {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<FileWithPreview | null>(
    null,
  );

  // Create default images using FileMetadata type
  const defaultImages: FileMetadata[] = [];

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
    initialFiles: defaultImages,
    onFilesChange,
  });

  const isImage = (file: File | FileMetadata) => {
    const type = file instanceof File ? file.type : file.type;
    return type.startsWith("image/");
  };

  const generateUrl = getUrl;

  // Upload mutation using React Query
  const uploadMutation = useMutation({
    mutationFn: async (filesToUpload: FileWithPreview[]) => {
      // Generate presigned URLs
      const { urls } = await generateUrl({
        keys: filesToUpload.map((f) => f.file.name),
      });

      // Upload all files in parallel
      const uploadResults = await Promise.allSettled(
        urls.map(async (url) => {
          const file = filesToUpload.find((fl) => fl.file.name === url.key);

          if (!file) {
            throw new Error(`File not found for key: ${url.key}`);
          }

          const response = await fetch(url.url, {
            method: "PUT",
            body: file.file as File,
          });

          if (!response.ok) {
            throw new Error(`Failed to upload ${file.file.name}`);
          }

          return { key: url.key, success: true };
        }),
      );

      // Check for failures
      const failures = uploadResults.filter((r) => r.status === "rejected");
      if (failures.length > 0) {
        throw new Error(`${failures.length} file(s) failed to upload`);
      }

      return uploadResults;
    },
    onSuccess: () => {
      router.push("/dashboard");
      clearFiles();
    },
    onError: (error) => {
      console.error("Upload error:", error);
    },
  });

  // const [uploadReadyFiles, setUploadReadyFiles] = useState(
  //   makeFileUpload(files),
  // );
  // React.useEffect(() => {
  //   setUploadReadyFiles(makeFileUpload(files));
  //   console.log("re-rendered at", new Date().toTimeString());
  // }, [files]);

  return (
    <section
      className={cn("w-full max-w-xl px-4 py-4 my-auto space-y-4", className)}
    >
      {/* Upload Area */}
      {files.length < 1 && (
        <div
          className={cn(
            "relative rounded-4xl border border-dashed p-8 m-auto text-center transition-colors w-fit",
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
                "flex h-16 w-16 items-center justify-center rounded-2xl",
                isDragging ? "bg-primary/10" : "bg-muted",
              )}
            >
              <ImageIcon
                className={cn(
                  "size-6",
                  isDragging ? "text-primary" : "text-muted-foreground",
                )}
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                Upload images to gallery
              </h3>
              <p className="text-sm text-muted-foreground">
                Drag and drop images here or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, GIF up to {formatBytes(maxSize)} each (max {maxFiles}{" "}
                files)
              </p>
            </div>

            <Button
              onClick={openFileDialog}
              size="lg"
              className="w-full rounded-xl"
            >
              <Upload className="h-4 w-4" />
              Select images
            </Button>
          </div>
        </div>
      )}
      {/* Gallery Stats */}
      {files.length > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h4 className=" font-medium">
              Gallery ({files.length}/{maxFiles})
            </h4>
            <div className="text-sm text-muted-foreground">
              Total:{" "}
              {formatBytes(
                files.reduce((acc, file) => acc + file.file.size, 0),
              )}
            </div>
          </div>
          {/* right side buttons */}
          <div className="inline-flex items-center justify-between gap-2 pointer-events-auto">
            {/* <Button
               onClick={()=>{
                alert("need to be implemented")
               }}
                variant="secondary"
                size="xs"
              >
                <PlusIcon className="block" />
                <span className="hidden md:block">Add more images</span>
              </Button> */}

            <Button
              onClick={clearFiles}
              variant="destructive"
              className=""
              size="xs"
            >
              <Trash2Icon />
              <span className="hidden md:block">Clear all</span>
            </Button>
          </div>
        </div>
      )}
      {/* Image Grid */}
      {files.length > 0 && (
        <ScrollArea
          className={
            "max-h-[calc(100vh-16rem)] overflow-scroll border rounded-2xl"
          }
        >
          <div
            className={cn(
              "my-2 grid grid-flow-row gap-2 mx-2 ",
              files.length < 2 ? "" : "grid-cols-3 sm:grid-cols-4",
            )}
          >
            {files.map((fileItem) => (
              <div
                key={fileItem.id}
                className="group relative h-auto max-w-full"
              >
                {isImage(fileItem.file) && fileItem.preview ? (
                  <img
                    src={fileItem.preview}
                    alt={fileItem.file.name}
                    className=" rounded-lg border object-cover transition-transform aspect-square w-full"
                  />
                ) : (
                  <div className="flex items-center justify-center rounded-lg border bg-muted">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-lg bg-background/50 opacity-0 transition-opacity group-hover:opacity-100">
                  {/* Edit metadata button */}
                  {/* <Alert>hello</Alert> */}
                  {/* <Popover>
                    <PopoverTrigger
                      render={
                        <Button
                          size={"icon"}
                          variant="secondary"
                          className="size-7"
                        >
                          <LucideFileEdit className="opacity-100/80" />
                        </Button>
                      }
                    />
                    <PopoverPanel>
                      <form>
                        <Label htmlFor="change-file-slug">Edit File Slug</Label>
                        <InputGroup>
                          <Input
                            name="change-file-slug"
                            value={fileItem.file.name}
                          />
                          <InputAddon>
                            {fileItem.file.type.split("/")[1]}
                          </InputAddon>
                        </InputGroup>
                      </form>
                    </PopoverPanel>
                  </Popover> */}

                  {/* View Button */}
                  {fileItem.preview && (
                    <Button
                      onClick={() => setSelectedImage(fileItem)}
                      variant="secondary"
                      size="icon"
                      className="size-7"
                    >
                      <ZoomInIcon className="opacity-100/80" />
                    </Button>
                  )}

                  {/* Remove Button */}
                  <Button
                    onClick={() => removeFile(fileItem.id)}
                    variant="secondary"
                    size="icon"
                    className="size-7"
                  >
                    <XIcon className="opacity-100/80" />
                  </Button>
                </div>

                {/* File Info */}
                <div className="absolute bottom-0 left-0 right-0 rounded-b-lg bg-background/70 p-2 text-foreground opacity-0 transition-opacity group-hover:opacity-100">
                  <p className="truncate text-xs font-medium">
                    {fileItem.file.name}
                  </p>
                  <p className="text-xs text-gray-300">
                    {formatBytes(fileItem.file.size)}
                  </p>
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
              loading: "Uploading Files",
              success: "All Files Uploaded Successfully!",
              error: (e) => {
                console.error(e);
                return (
                  <p>
                    Unable to upload files
                    <br />
                    See browser console for more details
                  </p>
                );
              },
            });
          }}
          disabled={uploadMutation.isPending}
        >
          <Upload /> {uploadMutation.isPending ? "Uploading..." : "Upload"}
        </Button>
      )}{" "}
      {/* Error Messages */}
      {errors.length > 0 && (
        <Alert variant="destructive" appearance="light" className="mt-5">
          <AlertIcon>
            <TriangleAlert />
          </AlertIcon>
          <AlertContent>
            <AlertTitle>
              File upload error(s)
              {/* <Button variant={"dim"} size={"icon"}>
                <X />
              </Button> */}
            </AlertTitle>

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
          <DialogPopup showCloseButton className={"w-fit p-4 rounded-4xl"}>
            <img
              src={selectedImage.preview}
              alt="Preview"
              className="aspect-auto rounded-3xl object-cover object-center max-h-[calc(100vh-12rem)]"
              onClick={(e) => e.stopPropagation()}
              role="presentation"
            />
            <Input
              className={cn(buttonVariants({ size: "lg", variant: "primary" }))}
              readOnly
              value={selectedImage.file.name}
            />
          </DialogPopup>{" "}
          <Button>Edit metadat</Button>
        </Dialog>
      )}
    </section>
  );
}
