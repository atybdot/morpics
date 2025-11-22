import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { FileWithPreview } from "@/hooks/use-file-upload";

/**
 * Merges Tailwind class names, resolving any conflicts.
 *
 * @param inputs - An array of class names to merge.
 * @returns A string of merged and optimized class names.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export const makeFileUpload = (files: FileWithPreview[]) => {
  return files.flatMap((f) => ({ key: f.file.name, file: f.file, id: f.id }));
};

export const toSlug = (str: string) => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric chars with -
    .replace(/^-+|-+$/g, ""); // Trim dashes from start/end
};
