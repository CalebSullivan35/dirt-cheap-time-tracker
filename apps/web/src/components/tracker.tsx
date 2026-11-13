"use client";

import { ChevronDown, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EntryList } from "./entry-list";
import { ManualEntryForm } from "./manual-entry-form";
import { TimerBar } from "./timer-bar";

export function Tracker() {
  const [manual, setManual] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <TimerBar />
      <div>
        <Button variant="ghost" size="sm" className="text-muted-foreground -ml-2" onClick={() => setManual((m) => !m)}>
          <Plus className={cn("transition-transform", manual && "rotate-45")} />
          Add time manually
          <ChevronDown className={cn("transition-transform", manual && "rotate-180")} />
        </Button>
        <AnimatePresence initial={false}>
          {manual && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="pt-2">
                <ManualEntryForm onDone={() => setManual(false)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <EntryList />
    </div>
  );
}
