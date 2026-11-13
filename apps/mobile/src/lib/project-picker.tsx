import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { PROJECT_COLORS } from "@dct/validators";
import { useTRPC } from "./api";
import { useTheme } from "./theme";

/** Horizontal chip list of the workspace's projects, with a "+" to create one. */
export function ProjectPicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (projectId: string | null) => void;
}) {
  const t = useTheme();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const projects = useQuery(trpc.project.list.queryOptions());
  const create = useMutation(
    trpc.project.create.mutationOptions({
      onSuccess: async (project) => {
        await queryClient.invalidateQueries({ queryKey: trpc.project.list.queryKey() });
        onChange(project.id);
      },
      onError: (e) => Alert.alert("Couldn't create project", e.message),
    }),
  );

  const chip = (key: string, label: string, selected: boolean, onPress: () => void, color?: string) => (
    <Pressable
      key={key}
      onPress={onPress}
      style={[
        styles.chip,
        { borderColor: selected ? t.accent : t.border, backgroundColor: t.surface },
      ]}
    >
      {color && <View style={[styles.dot, { backgroundColor: color }]} />}
      <Text style={{ color: selected ? t.accent : t.text }}>{label}</Text>
    </Pressable>
  );

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {chip("none", "No project", value === null, () => onChange(null))}
      {(projects.data ?? []).map((p) =>
        chip(p.id, p.name, value === p.id, () => onChange(p.id), p.color),
      )}
      {chip("new", "+ New", false, () =>
        Alert.prompt("New project", undefined, (name) => {
          if (!name?.trim()) return;
          const color = PROJECT_COLORS[(projects.data?.length ?? 0) % PROJECT_COLORS.length];
          create.mutate({ name, color });
        }),
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingVertical: 4 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
});
