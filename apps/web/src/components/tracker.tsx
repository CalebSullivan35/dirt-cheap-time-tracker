"use client";

import { useState } from "react";
import { EntryList } from "./entry-list";
import { ManualEntryForm } from "./manual-entry-form";
import { TimerBar } from "./timer-bar";

export function Tracker() {
  const [manual, setManual] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <TimerBar />
      <div>
        <button className="btn-ghost -ml-3" onClick={() => setManual((m) => !m)}>
          {manual ? "− Hide manual entry" : "+ Add time manually"}
        </button>
        {manual && (
          <div className="mt-2">
            <ManualEntryForm />
          </div>
        )}
      </div>
      <EntryList />
    </div>
  );
}
