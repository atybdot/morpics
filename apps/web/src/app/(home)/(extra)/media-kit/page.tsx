"use client";

import { useCopyToClipboard } from "@uidotdev/usehooks";
import { Check, Copy, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { PiCheck, PiCopy, PiDownloadSimple } from "react-icons/pi";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input, InputGroup } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface AssetItem {
  label: string;
  png: string;
  svg: string;
  bg: string;
}
interface AssetPaths {
  transparent: AssetItem;
  invert: AssetItem;
}
export default function MediaKitPage() {
  const [_, copy] = useCopyToClipboard();
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [selectedPrimaryLightFormat, setSelectedPrimaryLightFormat] =
    useState("hex");
  const [selectedPrimaryDarkFormat, setSelectedPrimaryDarkFormat] =
    useState("hex");

  useEffect(() => {
    if (copiedItem) {
      const timeout = setTimeout(() => {
        setCopiedItem(null);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [copiedItem]);

  const handleCopy = (text: string, type: string) => {
    copy(text);
    setCopiedItem(text);
    toast.success(`${type} copied to clipboard`);
  };

  const primaryLightColors = {
    hex: "#3b82f6",
    rgb: "rgb(59, 130, 246)",
    hsl: "hsl(217.2 91.2% 59.8%)",
    tailwind: "bg-blue-500",
  };

  const primaryDarkColors = {
    hex: "#2563eb",
    rgb: "rgb(37, 99, 235)",
    hsl: "hsl(221.2 83.2% 53.3%)",
    tailwind: "bg-blue-600",
  };

  const logos: AssetPaths = {
    transparent: {
      label: "Logo transparent",
      png: "/assets/pngs/logo-transparent.png",
      svg: "/assets/svgs/logo-transparent.svg",
      bg: "bg-white",
    },
    invert: {
      label: "Logo invert",
      png: "/assets/pngs/logo-invert.png",
      svg: "/assets/svgs/logo-invert.svg",
      bg: "bg-primary dark:bg-blue-500",
    },
  };
  const icons: AssetPaths = {
    transparent: {
      label: "Icon transparent",
      png: "/assets/pngs/logo-icon-transparent.png",
      svg: "/assets/svgs/logo-icon-transparent.svg",
      bg: "bg-white",
    },
    invert: {
      label: "Icon invert",
      png: "/assets/pngs/logo-icon-invert.png",
      svg: "/assets/svgs/logo-icon-invert.svg",
      bg: "bg-primary dark:bg-blue-500",
    },
  };

  const LogoCard = ({ item }: { item: AssetItem }) => (
    <div className="space-y-3">
      <span className="text-sm font-medium">{item.label}</span>
      <div
        className={cn(
          "border p-12 flex items-center justify-center aspect-video relative group",
          item.bg,
        )}
      >
        <img src={item.png} alt={item.label} className="max-h-24" />
        <div className="flex items-center justify-end px-2 gap-2 absolute bottom-2 right-2">
          <Button
            variant="secondary"
            size="sm"
            className="h-8 text-[10px] gap-1"
            onClick={() => handleCopy(item.png, "PNG URL")}
          >
            {copiedItem === item.png ? (
              <PiCheck className="size-3.5" />
            ) : (
              <PiCopy className="size-3.5" />
            )}
            PNG
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="h-8 text-[10px] gap-1"
            onClick={() => handleCopy(item.svg, "SVG URL")}
          >
            {copiedItem === item.svg ? (
              <PiCheck className="size-3.5" />
            ) : (
              <PiCopy className="size-3.5" />
            )}
            SVG
          </Button>

          <a
            href={item.png}
            download
            onClick={() => setCopiedItem(item.png + "-download")}
            className={cn(
              buttonVariants({ variant: "secondary", size: "sm" }),
              "h-8 text-xs gap-1",
            )}
          >
            {copiedItem === item.png + "-download" ? (
              <PiCheck className="size-3.5" />
            ) : (
              <PiDownloadSimple className="size-3.5" />
            )}
            PNG
          </a>
          <a
            href={item.svg}
            download
            onClick={() => setCopiedItem(item.svg + "-download")}
            className={cn(
              buttonVariants({ variant: "secondary", size: "sm" }),
              "h-8 text-xs gap-1",
            )}
          >
            {copiedItem === item.svg + "-download" ? (
              <PiCheck className="size-3.5" />
            ) : (
              <PiDownloadSimple className="size-3.5" />
            )}
            SVG
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto py-12 space-y-16 mb-24">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold mb-2">Media Kit</h1>
        <p className="text-muted-foreground">
          Logos, colors, and assets for Morpics.
        </p>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium">Logos </h2>
          <a
            href="/assets/assets.zip"
            download
            className={buttonVariants({ variant: "secondary", size: "sm" })}
          >
            <Download className="mr-2 h-4 w-4" /> Download All Assets
          </a>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <LogoCard item={logos.transparent} />
          <LogoCard item={logos.invert} />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-medium">icons </h2>

        <div className="grid md:grid-cols-2 gap-8">
          <LogoCard item={icons.transparent} />
          <LogoCard item={icons.invert} />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-medium">Colors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              label: "Primary Light",
              colors: primaryLightColors,
              selectedFormat: selectedPrimaryLightFormat,
              setSelectedFormat: setSelectedPrimaryLightFormat,
              bgClass: "bg-blue-500",
            },
            {
              label: "Primary Dark",
              colors: primaryDarkColors,
              selectedFormat: selectedPrimaryDarkFormat,
              setSelectedFormat: setSelectedPrimaryDarkFormat,
              bgClass: "bg-blue-600",
            },
          ].map((item) => (
            <div key={item.label} className="space-y-2">
              <p className="font-medium text-sm">{item.label}</p>
              <div
                className={cn(
                  "rounded-lg w-full aspect-4/3 shadow-sm border relative",
                  item.bgClass,
                )}
              >
                <div className="w-fit space-y-2 absolute bottom-2 right-2">
                  <div className="flex w-full items-center space-x-0">
                    <Select
                      value={item.selectedFormat}
                      onValueChange={(e) => item.setSelectedFormat(e as string)}
                    >
                      <SelectTrigger className={"bg-muted min-w-28"}>
                        <SelectValue placeholder="Format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hex">HEX</SelectItem>
                        <SelectItem value="rgb">RGB</SelectItem>
                        <SelectItem value="hsl">HSL</SelectItem>
                        <SelectItem value="tailwind">tailwind</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      data-slot="button"
                      variant="ghost"
                      className="border-l-0 bg-muted"
                      onClick={() =>
                        handleCopy(
                          item.colors[
                            item.selectedFormat as keyof typeof item.colors
                          ],
                          "Color code",
                        )
                      }
                    >
                      {copiedItem ===
                      item.colors[
                        item.selectedFormat as keyof typeof item.colors
                      ] ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
