/** biome-ignore-all lint/performance/noImgElement: <explanation> */
import React from "react";
import { ThemeSwitcherMultiButton } from "../elements/theme-switcher-multi-button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "../ui/button";
import { nanoid } from "nanoid";
import { PiGithubLogo, PiGlobe, PiXLogo, PiXLogoLight } from "react-icons/pi";

import { Logo } from "../elements/logo";

interface FooterLinkItem {
  label: string;
  href: string;
  target?: Pick<React.ComponentProps<"a">, "target">["target"];
  className?: Pick<React.ComponentProps<"div">, "className">["className"];
}
interface FooterLink {
  heading: string;
  className?: Pick<React.ComponentProps<"div">, "className">["className"];
  children: FooterLinkItem[];
}
function Footer() {
  const footerLinks: FooterLink[] = [
    {
      heading: "links",
      children: [
        { label: "pricing", href: "/pricing" },
        { label: "dashboard", href: "/dashboard" },
      ],
    },
    {
      heading: "help",
      children: [
        { label: "docs", href: "/docs" },
        { label: "contact support", href: "mailto:support@mor.pics" },
        { label: "report bug", href: "mailto:report@mor.pics" },
      ],
    },
    {
      heading: "company",
      children: [
        { label: "about us", href: "/about-us" },
        { label: "privacy policy", href: "/privacy-policy" },
        { label: "terms & conditions", href: "/terms-and-conditions" },
        { label: "brand assets", href: "/media-kit" },
      ],
    },
  ];
  const links = [
    { icon: PiGlobe, href: "https://atyb.me" },
    { icon: PiGithubLogo, href: "https://github.com/atybdot" },
    { icon: PiXLogo, href: "https://x.com/atybdot" },
  ];
  return (
    <footer className=" relative bg-background">
      <section className="sm:w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] gap-y-4 sm:pt-12 pb-2 sm:px-12 px-4 max-w-6xl mx-auto">
        <div className="flex flex-col items-start justify-start my-8 py-8 md:py-0 md:my-0 cursor-default sm:col-span-2 md:col-span-1 space-y-3">
          <Logo className="mb-2"/>
          <p className="flex items-center text-sm text-muted-foreground font-light">
            URL-powered image manipulations.
          </p>
          <div className="text-xs opacity-60 text-muted-foreground font-normal">
            All rights reserved © {new Date().getFullYear()}
          </div>
        </div>
        {footerLinks.map((item) => {
          return (
            <div
              className={cn("space-y-3 my-4 md:my-0", item.className)}
              key={nanoid()}
            >
              <h1 className="text-sm cursor-default mb-4">{item.heading}</h1>
              {item.children.map((link) => {
                return (
                  <Link
                    key={nanoid()}
                    href={link.href as any}
                    target={link.target}
                    className={cn(
                      buttonVariants({ size: "sm", variant: "dim" }),
                      "justify-start ps-0 h-fit font-light block tracking-wider text-sm",
                      link.className,
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          );
        })}
        <div className="pb-2 self-end col-span-full">
          <ThemeSwitcherMultiButton className="w-full" />
          <div className="text-xs text-muted-foreground text-center flex items-end justify-start gap-2 py-2 group">
            <span>built by</span>
            <Link
              target="_blank"
              prefetch
              href={"https://x.com/atybdot"}
              className=" flex items-center justify-center gap-1.5 text-foreground"
            >
              <img
                src={"https://atyb.me/favicon-16x16.png"}
                className="inline aspect-square -mt-1"
              />
              <span className="">atyb</span>
            </Link>
            <div className="flex-1 flex gap-4 justify-end">
              {links.map((link) => (
                <a
                  className="hover:text-foreground duration-200 ease-in-out transition-all"
                  target="_blank"
                  rel="noopener"
                  href={link.href}
                  key={nanoid()}
                >
                  <link.icon className="size-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </footer>
  );
}

export default Footer;
