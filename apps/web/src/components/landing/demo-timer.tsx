"use client";

import { AnimatePresence, motion } from "motion/react";
import { Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const TASKS = [
  "Reading a competitor's pricing page",
  "Finishing the onboarding wizard",
  "Configuring productivity insights",
  "Waiting for the sales call",
  "Actually doing the work",
];

function format(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

/** A pretend timer for the hero. It never talks to the server. */
export function DemoTimer() {
  const [running, setRunning] = useState(true);
  const [seconds, setSeconds] = useState(3 * 3600 + 47 * 60 + 12);
  const [task, setTask] = useState(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    const id = setInterval(() => setTask((t) => (t + 1) % TASKS.length), 3200);
    return () => clearInterval(id);
  }, []);

  return (
    <Card className="gap-4 px-5 py-5 shadow-lg sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Currently tracking
          </p>
          <div className="relative h-6 overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.p
                key={task}
                className="truncate font-medium"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {TASKS[task]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
        <Button
          size="icon"
          className="shrink-0 rounded-full"
          onClick={() => setRunning((r) => !r)}
          aria-label={running ? "Pause the demo timer" : "Start the demo timer"}
        >
          {running ? <Pause /> : <Play />}
        </Button>
      </div>
      <p className="font-mono text-4xl font-semibold tabular-nums sm:text-5xl" aria-live="off">
        {format(seconds)}
      </p>
      <p className="text-muted-foreground text-xs">
        That&apos;s the whole interface. We&apos;re as surprised as you are.
      </p>
    </Card>
  );
}
