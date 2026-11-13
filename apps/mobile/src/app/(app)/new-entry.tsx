import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { formatDurationShort, parseDurationInput } from "@dct/validators";
import { useTRPC } from "@/lib/api";
import { ProjectPicker } from "@/lib/project-picker";
import { useTheme } from "@/lib/theme";
import { Button, ErrorText, Input } from "@/lib/ui";

const DAYS = [
  { label: "Today", offset: 0 },
  { label: "Yesterday", offset: 1 },
  { label: "2 days ago", offset: 2 },
];

/** "9:30", "930", "9" -> {hours, minutes}; 24-hour clock. */
function parseClock(text: string): { h: number; m: number } | null {
  const match = /^(\d{1,2})(?::?(\d{2}))?$/.exec(text.trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2] ?? 0);
  return h < 24 && m < 60 ? { h, m } : null;
}

export default function NewEntryScreen() {
  const t = useTheme();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [dayOffset, setDayOffset] = useState(0);
  const [startText, setStartText] = useState("9:00");
  const [durationText, setDurationText] = useState("1h");
  const [formError, setFormError] = useState<string | null>(null);

  const create = useMutation(
    trpc.entry.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: trpc.entry.list.queryKey() });
        router.back();
      },
    }),
  );

  const durationMs = parseDurationInput(durationText);

  function save() {
    const clock = parseClock(startText);
    if (!clock) return setFormError("Start time should look like 9:30 (24-hour).");
    if (!durationMs) return setFormError("Duration should look like 1h 30m, 1:30 or 90m.");
    setFormError(null);
    const startedAt = new Date();
    startedAt.setDate(startedAt.getDate() - dayOffset);
    startedAt.setHours(clock.h, clock.m, 0, 0);
    create.mutate({
      description,
      projectId,
      startedAt,
      endedAt: new Date(startedAt.getTime() + durationMs),
    });
  }

  return (
    <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
      <Input value={description} onChangeText={setDescription} placeholder="What did you work on?" />
      <ProjectPicker value={projectId} onChange={setProjectId} />
      <View style={styles.row}>
        {DAYS.map((d) => (
          <Pressable
            key={d.offset}
            onPress={() => setDayOffset(d.offset)}
            style={[
              styles.chip,
              { borderColor: dayOffset === d.offset ? t.accent : t.border, backgroundColor: t.surface },
            ]}
          >
            <Text style={{ color: dayOffset === d.offset ? t.accent : t.text }}>{d.label}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.row}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ color: t.muted }}>Start (24h)</Text>
          <Input value={startText} onChangeText={setStartText} keyboardType="numbers-and-punctuation" />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ color: t.muted }}>
            Duration{durationMs ? ` · ${formatDurationShort(durationMs)}` : ""}
          </Text>
          <Input value={durationText} onChangeText={setDurationText} autoCapitalize="none" />
        </View>
      </View>
      <ErrorText>{formError ?? create.error?.message}</ErrorText>
      <Button title="Add entry" onPress={save} loading={create.isPending} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  form: { padding: 16, gap: 12 },
  row: { flexDirection: "row", gap: 8 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
});
