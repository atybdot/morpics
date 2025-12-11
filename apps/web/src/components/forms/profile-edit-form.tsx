"use client";

import { useForm } from "@tanstack/react-form";
import { Loader, RotateCcwIcon, Upload, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Input,
  InputAddon,
  InputGroup,
  InputWrapper,
} from "@/components/ui/input";
import { useFileUpload } from "@/hooks/use-file-upload";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { PiLock, PiSpinner } from "react-icons/pi";

const profileSchema = z.object({
  name: z
    .string("Name is required")
    .min(2, "Name must be at least 2 characters long")
    .refine((s) => s.trim(), "Name cannot be empty"),
  avatar: z.string().optional(),
});

export default function ProfileEditForm({
  session,
}: {
  session: (typeof authClient.$Infer)["Session"];
}) {
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(
    session.user?.image ?? "",
  );

  const [
    { files, isDragging, errors },
    {
      removeFile,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      getInputProps,
    },
  ] = useFileUpload({
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    accept: "image/*",
    multiple: false,
    onFilesChange: (newFiles) => {
      if (newFiles.length > 0 && newFiles[0].preview) {
        setAvatarPreview(newFiles[0].preview);
        form.setFieldValue("avatar", newFiles[0].preview);
      }
    },
  });

  const { refetch } = authClient.useSession();
  const form = useForm({
    defaultValues: {
      name: session.user.name,
      avatar: session.user.image || "",
    },
    onSubmit: async ({ value }) => {
      // Validate
      const result = profileSchema.safeParse(value);
      if (!result.success) {
        toast.error("Validation failed");
        return;
      }

      // Log the changed values
      console.log("Profile Update Values:", {
        name: result.data.name.trim(),
        avatar: result.data.avatar,
        hasNewAvatar: files.length > 0,
        avatarFile: files.length > 0 ? files[0].file : null,
      });

      await authClient.updateUser({
        name: value.name,
        fetchOptions: {
          onSuccess: () => refetch(),
        },
      });
      // Simulate submission
      toast.success("Profile updated");
    },
  });

  const handleRemoveAvatar = () => {
    if (files.length > 0) {
      removeFile(files[0].id);
    }
    setAvatarPreview(session.user?.image ?? "");
    form.setFieldValue("avatar", session.user?.image ?? "");
  };

  return (
    <form
      id="profile-edit-form"
      className="space-y-6 max-w-xl"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      {/* Avatar Upload Section */}
      <div className="flex flex-col gap-4 items-center">
        <div className="flex items-start gap-2 flex-col">
          {/* Avatar Preview */}
          <Avatar className="size-20">
            {avatarPreview ? (
              <AvatarImage
                src={avatarPreview}
                alt="Profile avatar"
                className={"object-center aspect-square"}
              />
            ) : (
              <AvatarFallback>
                <User className="size-8 text-muted-foreground" />
              </AvatarFallback>
            )}
          </Avatar>

          {/* Upload Controls */}
          <div className="flex flex-col gap-2">
            <input {...getInputProps()} className="sr-only" />

            <Button
              type="button"
              variant="dim"
              size="sm"
              onClick={openFileDialog}
            >
              <Upload className="size-4" />
              Upload
            </Button>

            {avatarPreview !== session.user?.image && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveAvatar}
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        {errors.length > 0 && (
          <div className="text-sm text-destructive">
            {errors.map((error, i) => (
              <p key={i}>{error}</p>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        {/* Name Field */}
        <form.Field name="name">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field className="" data-invalid={isInvalid}>
                <InputGroup className="flex-col sm:flex-row ">
                  <InputAddon className="text-muted-foreground justify-start md:justify-center px-4">
                    name
                  </InputAddon>

                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Enter your name"
                    required
                  />
                </InputGroup>

                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>
        <InputGroup className="flex-col sm:flex-row cursor-default">
          <InputAddon className="text-muted-foreground justify-start md:justify-center px-4">
            e-mail
          </InputAddon>
          <InputWrapper className="pe-1">
            <Input
              value={session.user.email}
              readOnly
              placeholder="email"
              required
            />
            <Button
              size={"xs"}
              type="button"
              variant={"outline"}
              className="h-6 *:*:text-foreground"
            >
              <PiLock />
              change
            </Button>
          </InputWrapper>
        </InputGroup>
      </div>
      {/* Submit Button */}
      <div className="flex gap-2">
        <Button
          type="submit"
          className="mt-0.5"
          disabled={form.state.isSubmitting || !form.state.canSubmit}
        >
          {form.state.isSubmitting ? (
            <>
              <PiSpinner className="size-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={() => {
            form.reset();
            if (files.length > 0) {
              removeFile(files[0].id);
            }
            setAvatarPreview(session.user?.image ?? "");
          }}
        >
          <RotateCcwIcon className="size-4" />
          Reset
        </Button>
      </div>
    </form>
  );
}
