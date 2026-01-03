/** biome-ignore-all lint/a11y/noSvgWithoutTitle: <explanation> */
"use client";
import { toSlug } from "@morpics/buckets/utils";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { CheckIcon, Loader, Plus, RotateCcwIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const orgSchema = z.object({
  name: z
    .string("Name of your Organization")
    .min(4, "Name of your organization should be atleat 4 characters long")
    .refine((s) => s.trim()),
  slug: z
    .string("ID of your Organization")
    .refine((str) => toSlug(str))
    .min(4, "ID of your organization should be atleat 4 characters long"),
});
type OrgSchema = z.infer<typeof orgSchema>;

export default function NewBucketForm() {
  const router = useRouter();
  const { data: user } = authClient.useSession();
  const form = useForm({
    defaultValues: {
      name: `${user?.user.name || ""}'s bucket`,
      slug: toSlug(`${user?.user.name || ""}'s bucket`),
    },
    validators: {
      onSubmit: orgSchema,
    },
    onSubmit: async ({ value }) => {
      // Always regenerate slug from name to prevent tampering
      const cleanSlug = toSlug(value.name);
      await orgMutation.mutateAsync({
        name: value.name.trim(),
        slug: cleanSlug.trim(),
      });
    },
  });

  const orgMutation = useMutation({
    mutationFn: (form: OrgSchema) =>
      authClient.organization.create({
        name: form.name,
        slug: form.slug,
        keepCurrentActiveOrganization: false,
      }),
    onSuccess: async ({ data, error }) => {
      if (!error) {
        toast.success("redirecting to dashboard");
        await authClient.organization.setActive({
          organizationId: data.id,
          organizationSlug: data.slug,
        });
        toast.dismiss();

        router.push("/dashboard");
      } else {
        toast.error(error.message);
        orgMutation.reset();
      }
    },

    onError: (e) => {
      console.error(e);
      toast.error(e.message ?? "something went wrong", {
        action: (
          <Button
            size={"sm"}
            variant={orgMutation.isSuccess ? "success" : "outline"}
            className="mt-auto"
            onClick={() => {
              toast.dismiss();
              form.handleSubmit();
            }}
          >
            <RotateCcwIcon />
            Retry
          </Button>
        ),
        closeButton: true,
        classNames: {
          icon: "mb-auto mt-1 ",
          content: "flex-4 font-semibold w-full",
        },

        description: "see browser console for more information",
      });
    },
  });
  return (
    <form
      id="create-bucket-form"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <div className="w-full space-y-4 ">
        <form.Field
          name="name"
          listeners={{
            onChange: ({ value }) => {
              form.setFieldValue("slug", toSlug(value));
            },
          }}
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field orientation={"vertical"} data-invalid={isInvalid}>
                {
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    className="w-full"
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Name of your Bucket"
                    required
                  />
                }
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />
        <Field>
          <div className="flex flex-col gap-2">
            <Button
              className="w-full"
              size="lg"
              disabled={orgMutation.isSuccess || orgMutation.isPending}
              variant={orgMutation.isSuccess ? "success" : "primary"}
              type="submit"
              form="create-bucket-form"
            >
              {orgMutation.isPending ? (
                <Loader className="animate-spin" />
              ) : orgMutation.isSuccess ? (
                <CheckIcon />
              ) : (
                <Plus />
              )}
              {orgMutation.isPending
                ? "Creating..."
                : orgMutation.isSuccess
                  ? "Bucket created"
                  : "Create new Bucket"}
            </Button>
          </div>

          <Button
            type="button"
            variant="dim"
            size="lg"
            className={cn("w-full ")}
            onClick={(e) => {
              e.preventDefault();
              router.back();
            }}
          >
            Cancel Creating Bucket
          </Button>
        </Field>
      </div>
    </form>
  );
}
