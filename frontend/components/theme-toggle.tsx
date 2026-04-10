"use client";

import { useEffect, useState } from "react";
import { LaptopMinimal, MoonStar, SunMedium } from "lucide-react";
import {
  applyTheme,
  getStoredTheme,
  getSystemTheme,
  persistTheme,
  resolveThemePreference,
  type ThemeMode,
  type ThemePreference,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  compact?: boolean;
}

const themeOptions: Array<{
  value: ThemePreference;
  label: string;
  icon: typeof SunMedium;
}> = [
  { value: "system", label: "系统", icon: LaptopMinimal },
  { value: "dark", label: "深色", icon: MoonStar },
  { value: "light", label: "浅色", icon: SunMedium },
];

export function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const [themePreference, setThemePreference] =
    useState<ThemePreference>("dark");
  const [systemTheme, setSystemTheme] = useState<ThemeMode>("dark");

  useEffect(() => {
    const nextThemePreference = getStoredTheme();
    const nextSystemTheme = getSystemTheme();

    setThemePreference(nextThemePreference);
    setSystemTheme(nextSystemTheme);
    applyTheme(nextThemePreference);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const nextResolvedTheme = mediaQuery.matches ? "dark" : "light";
      setSystemTheme(nextResolvedTheme);
      if (getStoredTheme() === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  const handleChangeTheme = (nextTheme: ThemePreference) => {
    setThemePreference(nextTheme);
    persistTheme(nextTheme);
  };

  const resolvedTheme = resolveThemePreference(themePreference);
  const helperText =
    themePreference === "system"
      ? `当前跟随系统：${systemTheme === "dark" ? "深色" : "浅色"}`
      : `当前使用${resolvedTheme === "dark" ? "深色" : "浅色"}模式`;

  return (
    <div className={cn("px-4 py-2", compact && "px-0 py-0")}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">主题</p>
          {!compact && (
            <p className="text-xs text-muted-foreground">
              {helperText}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {themeOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleChangeTheme(option.value)}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
              themePreference === option.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <option.icon className="w-4 h-4" />
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
