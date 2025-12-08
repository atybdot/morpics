import { ThemeSwitcherMultiButton } from "@/components/elements/theme-switcher-multi-button";
import Header from "@/components/header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="min-h-svh grid grid-rows-[auto_1fr_auto] relative mx-auto">
      <Header />
      <section className="mx-auto w-full h-full max-w-6xl bg-transparent px-4">
        {children}
      </section>
      <footer className="mx-auto">
        <ThemeSwitcherMultiButton />
      </footer>
    </section>
  );
}
