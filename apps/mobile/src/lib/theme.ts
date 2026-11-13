import { useColorScheme } from "react-native";

const light = {
  background: "#fafafa",
  surface: "#ffffff",
  text: "#18181b",
  muted: "#71717a",
  border: "#e4e4e7",
  accent: "#4f46e5",
  danger: "#dc2626",
  onAccent: "#ffffff",
};

const dark: typeof light = {
  background: "#09090b",
  surface: "#18181b",
  text: "#fafafa",
  muted: "#a1a1aa",
  border: "#27272a",
  accent: "#818cf8",
  danger: "#f87171",
  onAccent: "#ffffff",
};

export type Theme = typeof light;

export function useTheme(): Theme {
  return useColorScheme() === "dark" ? dark : light;
}
