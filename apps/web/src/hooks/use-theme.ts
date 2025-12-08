import { useTheme as useNextTheme } from "next-themes";
import { useQueryState } from "nuqs";
export const useTheme = () => {
  const { setTheme: setNextTheme, resolvedTheme } = useNextTheme();
  const [theme, setQueryTheme] = useQueryState("theme", {
    defaultValue: resolvedTheme || "light",
  });
  const setTheme = (str: string) => {
    setNextTheme(str);
    setQueryTheme(str);
  };
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  const toggleDark = () => {
    setTheme("dark");
  };
  const toggleLight = () => {
    setTheme("light");
  };

  return {
    setTheme,
    toggleTheme,
    toggleDark,
    toggleLight,
    resolvedTheme,
    theme,
  };
};
