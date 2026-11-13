import { useColorScheme } from "react-native";

const light = {
  background: "#fafafa",
  surface: "#ffffff",
  text: "#18181b",
  muted: "#71717a",
  border: "#e4e4e7",
  accent: "#059669", // emerald-600, same brand accent as the web app
  danger: "#dc2626",
  onAccent: "#ffffff",
};

const dark: typeof light = {
  background: "#0a0a0a",
  surface: "#171717",
  text: "#fafafa",
  muted: "#a1a1aa",
  border: "#27272a",
  accent: "#10b981", // emerald-500
  danger: "#f87171",
  onAccent: "#022c22", // emerald-950

};

export type Theme = typeof light;

export function useTheme(): Theme {
  return useColorScheme() === "dark" ? dark : light;
}
