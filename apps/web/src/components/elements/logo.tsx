import { SquareDashedMousePointerIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href={"/"}
      className={cn(
        "flex items-center justify-center gap-2 text-blue-500 font-normal",
        className,
      )}
    >
      <SquareDashedMousePointerIcon className="size-5" />

      <p className="text-xl ring-0">morpics</p>
    </Link>
  );
}
