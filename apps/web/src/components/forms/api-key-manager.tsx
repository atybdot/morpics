"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Input,
  InputAddon,
  InputGroup,
  inputVariants,
} from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { cn } from "@/lib/utils";
import {
  PiClock,
  PiCopy,
  PiDownload,
  PiInfinity,
  PiKey,
  PiPlus,
  PiSpinner,
  PiTrash,
} from "react-icons/pi";
import { queryClient } from "@/utils/orpc";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import { CardHeaderAlt } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { nanoid } from "nanoid";
const expirationValues = [
  { value: 1, label: "1 day" },
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
  { value: 365, label: "365 days" },
  { value: 0, label: "never" },
];
const apiKeySchema = z.object({
  name: z.string().trim().min(3, "Name must be at least 3 characters"),
  expiresIn: z.int().transform((e) => e * 60 * 60 * 24),
});

export default function ApiKeyManager() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);

  // Fetch API keys
  const { data: apiKeys, isLoading } = useQuery({
    queryKey: ["api-keys"],
    queryFn: async () => {
      const response = await authClient.apiKey.list();
      return response.data || [];
    },
  });

  // Create API key mutation
  const createMutation = useMutation({
    mutationFn: async (values: { name: string; time: number | undefined }) => {
      const response = await authClient.apiKey.create({
        name: values.name.trim(),
        expiresIn: values.time,
      });

      return response;
    },
    onSuccess: (response) => {
      if (response.data) {
        setNewKeyValue(response.data.key);
        toast.success("API key created successfully");
        queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      } else if (response.error) {
        toast.error(response.error.message || "Failed to create API key");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create API key");
    },
  });

  // Delete API key mutation
  const deleteMutation = useMutation({
    mutationFn: async (keyId: string) => {
      const response = await authClient.apiKey.delete({
        keyId: keyId,
      });
      return response;
    },
    onSuccess: (response) => {
      if (response.data) {
        toast.success("API key deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      } else if (response.error) {
        toast.error(response.error.message || "Failed to delete API key");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete API key");
    },
  });

  // Form for creating API keys
  const form = useForm({
    defaultValues: {
      name: "",
      expiresIn: expirationValues[0].value,
    },
    validators: { onChange: apiKeySchema },
    onSubmit: async ({ value }) => {
      const result = apiKeySchema.safeParse(value);
      if (!result.success) {
        toast.error("Invalid name");
        return;
      }

      await createMutation.mutateAsync({
        name: result.data.name,
        time: result.data.expiresIn > 0 ? result.data.expiresIn : undefined,
      });
      form.reset();
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const handleDownload = (txt: string) => {
    const blob = new Blob([`MORPICS_API=${txt}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "morpics-api";
    a.click();

    URL.revokeObjectURL(url);
  };

  const handleDelete = (keyId: string, keyName: string) => {
    if (confirm(`Are you sure you want to delete the API key "${keyName}"?`)) {
      deleteMutation.mutate(keyId);
    }
  };

  return (
    <div className="space-y-0">
      <CardHeaderAlt className="border border-b-0 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">ALL API KEYS</p>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <PiPlus className="size-4" />
          Create API Key
        </Button>
      </CardHeaderAlt>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setNewKeyValue(null);
            form.reset();
          }
        }}
      >
        <DialogContent showDismissButton={false} className={"border p-2"}>
          <div className="border p-4 h-full w-full">
            {newKeyValue && (
              <>
                <DialogHeader>
                  <DialogTitle>Your API KEY (save this now)</DialogTitle>
                  <DialogDescription>
                    Make sure to copy your API key now. You won't be able to see
                    it again!
                  </DialogDescription>
                </DialogHeader>
                <DialogBody className="flex flex-col gap-y-2">
                  <Input
                    value={newKeyValue}
                    readOnly
                    onClick={(e) => {
                      e.currentTarget.select();
                      copyToClipboard(newKeyValue);
                    }}
                    className="font-mono text-xs overflow-x-scroll"
                  />
                  <div className="flex flex-row-reverse gap-px">
                    <Button
                      variant={"outline"}
                      onClick={() => copyToClipboard(newKeyValue)}
                    >
                      <PiCopy />
                    </Button>
                    <Button
                      variant={"outline"}
                      onClick={() => handleDownload(newKeyValue)}
                    >
                      <PiDownload />
                    </Button>
                    <Button
                      onClick={() => {
                        setDialogOpen(false);
                        setNewKeyValue(null);
                      }}
                      className="w-full"
                    >
                      Done
                    </Button>
                  </div>
                </DialogBody>
              </>
            )}

            {!newKeyValue && (
              <>
                <DialogHeader>
                  <DialogTitle>Create New API Key</DialogTitle>
                  <DialogDescription>
                    Give your API key a descriptive name to help you identify it
                    later.
                  </DialogDescription>
                </DialogHeader>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    form.handleSubmit();
                  }}
                  className="space-y-4 mt-4"
                >
                  <form.Field name="name">
                    {(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid} className="gap-1">
                          <InputGroup className="flex-col sm:flex-row">
                            <InputAddon className="px-6">
                              <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                            </InputAddon>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              aria-invalid={isInvalid}
                              placeholder="e.g., Production API"
                              required
                            />
                          </InputGroup>

                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      );
                    }}
                  </form.Field>
                  <form.Field name="expiresIn">
                    {(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid} className="gap-1">
                          <Select
                            value={field.state.value.toString()}
                            onValueChange={(val) =>
                              field.handleChange(Number(val))
                            }
                            indicatorPosition="right"
                          >
                            <InputGroup className="flex-col sm:flex-row">
                              <InputAddon className="px-6">
                                <FieldLabel htmlFor={field.name}>
                                  expires in
                                </FieldLabel>
                              </InputAddon>
                              <SelectTrigger
                                className={cn(
                                  inputVariants(),
                                  "justify-between mt-auto",
                                )}
                              >
                                <SelectValue placeholder="expiration time in days" />
                              </SelectTrigger>
                            </InputGroup>
                            <SelectContent>
                              {expirationValues?.map((item) => (
                                <SelectItem
                                  key={item.value}
                                  value={item.value.toString()}
                                >
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
                  </form.Field>

                  <div className="flex gap-4 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        createMutation.isPending || !form.state.canSubmit
                      }
                    >
                      {createMutation.isPending ? (
                        <>
                          <PiSpinner className="size-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Key"
                      )}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* API Keys List */}
      <div className="border rounded-lg">
        {isLoading ? (
          Array(2)
            .fill(0)
            .map(() => <Skeleton key={nanoid()} className="w-full h-20" />)
        ) : apiKeys && apiKeys.length > 0 ? (
          <div className="divide-y">
            {apiKeys.map((key) => (
              <div
                key={key.id}
                className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-muted flex items-center justify-center">
                    <PiKey className="size-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium mb-1">{key.name}</p>
                    <p className="text-sm text-muted-foreground font-mono flex items-center gap-1">
                      {key.expiresAt ? (
                        <PiClock className="size-4" />
                      ) : (
                        <PiInfinity className="size-4" />
                      )}
                      <span className="text-xs">
                        {key.expiresAt
                          ? `expires at ${new Intl.DateTimeFormat("en-IN", {
                              month: "numeric",
                              day: "numeric",
                              year: "numeric",
                              hourCycle: "h12",
                              hour: "2-digit",
                              minute: "2-digit",
                            }).format(key.expiresAt)}`
                          : "do not expires"}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={key.enabled ? "success" : "destructive"}>
                    {key.enabled ? "Active" : "Disabled"}
                  </Badge>

                  <Button
                    variant={"secondary"}
                    size={"xs"}
                    onClick={() => handleDelete(key.id, key.name || "Untitled")}
                    disabled={deleteMutation.isPending}
                    className={cn()}
                  >
                    <PiTrash className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <PiKey className="size-12 mx-auto text-muted-foreground" />
            <p className="text-sm font-medium mt-3">No API keys yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Create your first API key to get started
            </p>
            <Button
              size="sm"
              className="mt-4"
              onClick={() => setDialogOpen(true)}
            >
              <PiPlus className="size-4" />
              Create API Key
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
