import { Timer } from "lucide-react";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2 font-semibold tracking-tight">
      <span className="bg-primary text-primary-foreground grid size-7 place-items-center rounded-lg shadow-sm transition-transform group-hover:-rotate-6">
        <Timer className="size-4" />
      </span>
      <span className="hidden sm:inline">
        DirtCheap<span className="text-brand">TimeTracker</span>
      </span>
    </Link>
  );
}
