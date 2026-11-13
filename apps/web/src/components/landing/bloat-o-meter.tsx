"use client";

import { AnimatePresence, motion } from "motion/react";
import { Plus, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Generic jabs only: none of these describe a specific product.
const FEATURES = [
  "AI insights about your AI insights",
  "Mandatory 14-step onboarding",
  "Blockchain-verified lunch breaks",
  "Gantt chart for your Gantt charts",
  "Hourly “how are you feeling?” survey",
  "Leaderboard of who blinked least",
  "Dashboard with 47 widgets",
  "Webcam selfie every 4 minutes",
  "Synergy score",
  "Dedicated customer success manager",
  "Quarterly business review",
  "Dark mode (Enterprise tier only)",
  "SSO tax",
  "Gamified streaks that guilt-trip you",
  "Talk-to-sales button (there is no price)",
  "Integrates with your toaster",
];

/** Click to add features to an imaginary competitor and watch the price climb. */
export function BloatOMeter() {
  const [added, setAdded] = useState<number[]>([]);
  const price = 12 + added.reduce((sum, i) => sum + ((i * 7) % 11) + 3, 0);
  const done = added.length === FEATURES.length;

  function addFeature() {
    const left = FEATURES.map((_, i) => i).filter((i) => !added.includes(i));
    const next = left[Math.floor(Math.random() * left.length)];
    if (next !== undefined) setAdded((a) => [...a, next]);
  }

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-stretch">
      <Card className="gap-4 px-5 py-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold">Typical Time Tracker Pro Max™</p>
            <p className="text-muted-foreground text-sm">per seat, per month, per feeling</p>
          </div>
          <motion.p
            key={price}
            initial={{ scale: 1.25 }}
            animate={{ scale: 1 }}
            className="text-destructive font-mono text-2xl font-semibold tabular-nums"
          >
            ${price}
          </motion.p>
        </div>
        <ul className="flex min-h-24 flex-wrap content-start gap-2" aria-live="polite">
          <li className="bg-muted rounded-full px-3 py-1 text-xs">A timer, somewhere</li>
          <AnimatePresence initial={false}>
            {added.map((i) => (
              <motion.li
                key={i}
                layout
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                className="bg-destructive/10 text-destructive rounded-full px-3 py-1 text-xs"
              >
                {FEATURES[i]}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        <div className="mt-auto flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={addFeature} disabled={done}>
            <Plus /> {done ? "Out of ideas. Call sales." : "Add an enterprise feature"}
          </Button>
          {added.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setAdded([])}>
              <RotateCcw /> Reset
            </Button>
          )}
        </div>
      </Card>

      <div className="text-muted-foreground flex items-center justify-center text-sm font-semibold">
        vs.
      </div>

      <Card className="border-primary/40 gap-4 px-5 py-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold">DirtCheapTimeTracker</p>
            <p className="text-muted-foreground text-sm">per seat, per month, per nothing</p>
          </div>
          <p className="text-brand font-mono text-xl font-semibold whitespace-nowrap sm:text-2xl">dirt cheap</p>
        </div>
        <ul className="flex flex-wrap content-start gap-2">
          {["Start", "Stop", "Projects", "Manual entries", "Teams"].map((f) => (
            <li key={f} className="bg-accent text-accent-foreground rounded-full px-3 py-1 text-xs">
              {f}
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground mt-auto text-sm">
          {added.length === 0
            ? "Go on, bloat the other one. We'll wait."
            : `${added.length} feature${added.length === 1 ? "" : "s"} later, our price hasn't moved. Neither has our feature list. That's the point.`}
        </p>
      </Card>
    </div>
  );
}
