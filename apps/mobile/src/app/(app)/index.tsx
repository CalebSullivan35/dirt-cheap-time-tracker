import { useAuth } from "@clerk/expo";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Stack } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, RefreshControl, SectionList, StyleSheet, Text, View } from "react-native";
import {
  entryDurationMs,
  formatDuration,
  formatDurationShort,
  groupEntriesByDay,
} from "@dct/validators";
import { useTRPC } from "@/lib/api";
import { ProjectPicker } from "@/lib/project-picker";
import { useTheme } from "@/lib/theme";
import { Button, ErrorText, Input } from "@/lib/ui";
import { useNow } from "@/lib/use-now";

const clock = (d: Date) => d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

function dayTitle(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y!, m! - 1, d!);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - date.getTime()) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}

function TimerCard() {
  const t = useTheme();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const current = useQuery(trpc.timer.current.queryOptions());
  const running = current.data ?? null;
  const now = useNow(!!running);
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState<string | null>(null);

  const invalidate = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: trpc.timer.current.queryKey() }),
      queryClient.invalidateQueries({ queryKey: trpc.entry.list.queryKey() }),
    ]);
  const start = useMutation(
    trpc.timer.start.mutationOptions({
      onSuccess: async () => {
        setDescription("");
        setProjectId(null);
        await invalidate();
      },
    }),
  );
  const stop = useMutation(trpc.timer.stop.mutationOptions({ onSuccess: invalidate }));
  const update = useMutation(trpc.timer.update.mutationOptions({ onSuccess: invalidate }));
  const error = current.error ?? start.error ?? stop.error ?? update.error;

  return (
    <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
      {running ? (
        <>
          <Input
            key={running.id}
            defaultValue={running.description}
            placeholder="What are you working on?"
            onEndEditing={(e) => {
              const text = e.nativeEvent.text;
              if (text !== running.description) update.mutate({ description: text });
            }}
          />
          <ProjectPicker
            value={running.projectId}
            onChange={(id) => update.mutate({ projectId: id })}
          />
          <View style={styles.timerRow}>
            <Text style={[styles.elapsed, { color: t.text }]}>
              {formatDuration(entryDurationMs(running, now))}
            </Text>
            <Button title="Stop" variant="danger" onPress={() => stop.mutate()} loading={stop.isPending} />
          </View>
        </>
      ) : (
        <>
          <Input
            value={description}
            onChangeText={setDescription}
            placeholder="What are you working on?"
          />
          <ProjectPicker value={projectId} onChange={setProjectId} />
          <View style={styles.timerRow}>
            <Text style={[styles.elapsed, { color: t.muted }]}>0:00:00</Text>
            <Button
              title="Start"
              onPress={() => start.mutate({ description, projectId })}
              loading={start.isPending}
              disabled={current.isLoading}
            />
          </View>
        </>
      )}
      <ErrorText>{error?.message}</ErrorText>
    </View>
  );
}

export default function TimerScreen() {
  const t = useTheme();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { signOut } = useAuth();
  const entries = useQuery(trpc.entry.list.queryOptions());
  const projects = useQuery(trpc.project.list.queryOptions({ includeArchived: true }));
  const projectById = new Map((projects.data ?? []).map((p) => [p.id, p]));
  const remove = useMutation(
    trpc.entry.delete.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: trpc.entry.list.queryKey() }),
    }),
  );

  const sections = groupEntriesByDay(entries.data ?? []).map((g) => ({
    title: dayTitle(g.day),
    total: g.totalMs,
    data: g.entries,
  }));

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable onPress={() => signOut()} hitSlop={8}>
              <Text style={{ color: t.accent }}>Sign out</Text>
            </Pressable>
          ),
        }}
      />
      <SectionList
        contentContainerStyle={{ padding: 16, gap: 4 }}
        sections={sections}
        keyExtractor={(e) => e.id}
        refreshControl={
          <RefreshControl
            refreshing={entries.isRefetching}
            onRefresh={() => queryClient.invalidateQueries()}
          />
        }
        ListHeaderComponent={
          <View style={{ gap: 8, marginBottom: 12 }}>
            <TimerCard />
            <Link href="/new-entry" style={{ color: t.accent, paddingVertical: 8 }}>
              + Add time manually
            </Link>
          </View>
        }
        ListEmptyComponent={
          entries.isLoading ? undefined : (
            <Text style={{ color: t.muted, textAlign: "center", padding: 24 }}>
              {entries.error ? entries.error.message : "No time tracked yet."}
            </Text>
          )
        }
        renderSectionHeader={({ section }) => (
          <View style={[styles.sectionHeader, { backgroundColor: t.background }]}>
            <Text style={{ color: t.muted, fontWeight: "600" }}>{section.title}</Text>
            <Text style={{ color: t.muted }}>{formatDurationShort(section.total)}</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const project = item.projectId ? projectById.get(item.projectId) : undefined;
          return (
            <Pressable
              onLongPress={() =>
                Alert.alert("Delete entry?", item.description || undefined, [
                  { text: "Cancel", style: "cancel" },
                  { text: "Delete", style: "destructive", onPress: () => remove.mutate({ id: item.id }) },
                ])
              }
              style={[styles.entry, { backgroundColor: t.surface, borderColor: t.border }]}
            >
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ color: item.description ? t.text : t.muted }} numberOfLines={1}>
                  {item.description || "(no description)"}
                </Text>
                <Text style={{ color: t.muted, fontSize: 13 }}>
                  {project ? `${project.name} · ` : ""}
                  {clock(item.startedAt)} – {clock(item.endedAt!)}
                </Text>
              </View>
              {project && <View style={[styles.dot, { backgroundColor: project.color }]} />}
              <Text style={{ color: t.text, fontWeight: "600" }}>
                {formatDurationShort(entryDurationMs(item))}
              </Text>
            </Pressable>
          );
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 12, padding: 12, gap: 10 },
  timerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  elapsed: { fontSize: 32, fontVariant: ["tabular-nums"], fontWeight: "300" },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    paddingBottom: 6,
  },
  entry: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 6,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
});
