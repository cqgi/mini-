export type ThemeMode = "dark" | "light";
export type ThemePreference = ThemeMode | "system";

export const THEME_STORAGE_KEY = "miniblog-theme";
export const DEFAULT_THEME: ThemePreference = "dark";

export function isThemeMode(value: string | null): value is ThemeMode {
  return value === "dark" || value === "light";
}

export function isThemePreference(
  value: string | null
): value is ThemePreference {
  return value === "dark" || value === "light" || value === "system";
}

export function getSystemTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "dark";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function resolveThemePreference(
  themePreference: ThemePreference
): ThemeMode {
  return themePreference === "system" ? getSystemTheme() : themePreference;
}

export function getStoredTheme() {
  if (typeof window === "undefined") {
    return DEFAULT_THEME;
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return isThemePreference(storedTheme) ? storedTheme : DEFAULT_THEME;
}

export function applyTheme(themePreference: ThemePreference) {
  if (typeof document === "undefined") {
    return;
  }

  const resolvedTheme = resolveThemePreference(themePreference);

  document.documentElement.dataset.theme = resolvedTheme;
  document.documentElement.dataset.themePreference = themePreference;
  document.documentElement.style.colorScheme = resolvedTheme;
}

export function persistTheme(themePreference: ThemePreference) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(THEME_STORAGE_KEY, themePreference);
  }

  applyTheme(themePreference);
}

export function getThemeInitScript() {
  return `
    (function () {
      try {
        var key = "${THEME_STORAGE_KEY}";
        var themePreference = window.localStorage.getItem(key);
        if (themePreference !== "dark" && themePreference !== "light" && themePreference !== "system") {
          themePreference = "${DEFAULT_THEME}";
        }
        var resolvedTheme = themePreference === "system"
          ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
          : themePreference;
        document.documentElement.dataset.theme = resolvedTheme;
        document.documentElement.dataset.themePreference = themePreference;
        document.documentElement.style.colorScheme = resolvedTheme;
      } catch (error) {
        document.documentElement.dataset.theme = "dark";
        document.documentElement.dataset.themePreference = "${DEFAULT_THEME}";
        document.documentElement.style.colorScheme = "dark";
      }
    })();
  `;
}
