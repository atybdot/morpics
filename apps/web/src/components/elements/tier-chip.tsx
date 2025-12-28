import { cn } from "@/lib/utils";
import type { UserTier } from "@morpics/db/schema/constants";
import { PiCookie, PiCrownSimple, PiShieldStar } from "react-icons/pi";

function TierChip({ slug, className, colorful }: { slug: UserTier; className?: string,colorful?: boolean }) {
  if (slug === "starter") {
    return <PiShieldStar className={cn("size-3.5 -mt-0.5 ", colorful ? "text-emerald-500" : "", className)} />;
  }
  if (slug === "pro") {
    return <PiCrownSimple className={cn("size-3.5 -mt-0.5 ", colorful ? "text-indigo-500" : "", className)} />;
  }
  return <PiCookie className={cn("size-3.5 -mt-0.5 ", colorful ? "text-amber-500" : "", className)} />;
}

export default TierChip;
