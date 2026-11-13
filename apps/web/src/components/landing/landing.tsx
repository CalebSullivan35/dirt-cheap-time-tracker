import { Check, Coffee, Hand, Smartphone, Sparkles, Users, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BloatOMeter } from "./bloat-o-meter";
import { DemoTimer } from "./demo-timer";
import { Reveal } from "./reveal";

const THEM = [
  "A 14-step onboarding wizard that asks your company's “north star”",
  "AI-generated insights telling you meetings take time",
  "Pricing page that says “Contact sales”",
  "Six tiers, each named after a gemstone",
  "Features you will never find, let alone use",
];

const US = [
  "Press start. Press stop. Go outside.",
  "Projects, with colors, because we're not animals",
  "Forgot to start the timer? Add the time by hand",
  "Bring your team along when you're ready",
  "A price you can say out loud without wincing",
];

const FEATURES = [
  {
    icon: Hand,
    title: "One big button",
    body: "It starts the timer. Press it again and it stops. We tested this extensively.",
  },
  {
    icon: Coffee,
    title: "Manual entries",
    body: "For when you remember at 6pm that you worked today. We won't tell.",
  },
  {
    icon: Users,
    title: "Teams",
    body: "Invite people and track time together. No synergy score included.",
  },
  {
    icon: Smartphone,
    title: "On your phone",
    body: "An iPhone app is on the way, so you can track time while avoiding eye contact.",
  },
];

const FAQ = [
  {
    q: "How much does it cost?",
    a: "We're still working that out. Right now it's free. Whatever happens later, the name is a promise: dirt cheap. If we ever charge more than a gas station burrito, you're allowed to make fun of us.",
  },
  {
    q: "What's the catch?",
    a: "It runs on free tiers and stubbornness. There's no sales team, no investors asking for a growth curve, and no plan to sell your timesheet to anyone. Who would even buy that?",
  },
  {
    q: "Does it have AI?",
    a: "No. It will not summarize your week, predict your burnout, or write a haiku about your billable hours. It counts seconds. It's really good at counting seconds.",
  },
  {
    q: "Will you add Gantt charts?",
    a: "No.",
  },
  {
    q: "Is it actually any good?",
    a: "It's a timer. It's very hard to mess up a timer. We checked.",
  },
];

export function Landing() {
  return (
    <div className="flex flex-col gap-24 pb-12 sm:gap-28">
      {/* Hero */}
      <section className="grid items-center gap-10 pt-4 md:grid-cols-[1.1fr_1fr] md:pt-10">
        <Reveal immediate>
          <p className="bg-accent text-accent-foreground mb-5 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
            <Sparkles className="size-3.5" /> Now with zero enterprise features
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            Track your time, <span className="text-brand">not your budget.</span>
          </h1>
          <p className="text-muted-foreground mt-5 text-lg text-pretty">
            A time tracker that tracks time. That&apos;s it. That&apos;s the pitch. No onboarding
            wizard, no productivity coach, no “Contact sales.” Just a timer that costs about as much as
            dirt.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/sign-up">Start tracking for cheap</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/sign-in">I already have an account</Link>
            </Button>
          </div>
          <p className="text-muted-foreground mt-3 text-xs">
            No credit card. No demo call. No “quick 15 minutes to learn about your needs.”
          </p>
        </Reveal>
        <Reveal immediate delay={0.1}>
          <DemoTimer />
        </Reveal>
      </section>

      {/* Why */}
      <section className="mx-auto max-w-2xl text-center">
        <Reveal>
          <h2 className="text-3xl font-bold tracking-tight">Why does this exist?</h2>
          <p className="text-muted-foreground mt-4 text-lg text-pretty">
            We just wanted to know how long things took. Every time tracker we tried wanted to know our
            company size, our quarterly goals, our team&apos;s “velocity,” and our credit card, in
            that order. Somewhere along the way, time tracking got a gym membership and a pricing
            page with a slider.
          </p>
          <p className="text-muted-foreground mt-4 text-lg text-pretty">
            So we built the opposite. Start, stop, projects, done. It&apos;s cheap to run, so
            it&apos;s cheap to use.
          </p>
        </Reveal>
      </section>

      {/* Them vs us */}
      <section>
        <Reveal className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Spot the difference</h2>
          <p className="text-muted-foreground mt-2">A scientific comparison, conducted by us, about us.</p>
        </Reveal>
        <div className="grid gap-4 md:grid-cols-2">
          <Reveal>
            <Card className="h-full gap-4 px-6">
              <p className="font-semibold">Overly complicated time trackers</p>
              <ul className="flex flex-col gap-3">
                {THEM.map((item) => (
                  <li key={item} className="text-muted-foreground flex gap-2.5 text-sm">
                    <X className="text-destructive mt-0.5 size-4 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          </Reveal>
          <Reveal delay={0.1}>
            <Card className="border-primary/40 h-full gap-4 px-6">
              <p className="font-semibold">DirtCheapTimeTracker</p>
              <ul className="flex flex-col gap-3">
                {US.map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm">
                    <Check className="text-brand mt-0.5 size-4 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          </Reveal>
        </div>
      </section>

      {/* Bloat-o-meter */}
      <section>
        <Reveal className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight">The Bloat-o-Meter™</h2>
          <p className="text-muted-foreground mt-2 text-pretty">
            Build your own enterprise time tracker. Watch the price do a little dance.
          </p>
        </Reveal>
        <Reveal>
          <BloatOMeter />
        </Reveal>
      </section>

      {/* Features */}
      <section>
        <Reveal className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Everything you need. Suspiciously little else.</h2>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.05}>
              <Card className="h-full gap-3 px-6">
                <span className="bg-accent text-accent-foreground grid size-9 place-items-center rounded-lg">
                  <f.icon className="size-4.5" />
                </span>
                <p className="font-semibold">{f.title}</p>
                <p className="text-muted-foreground text-sm">{f.body}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto w-full max-w-2xl">
        <Reveal className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Questions, probably</h2>
        </Reveal>
        <Reveal>
          <div className="divide-y rounded-xl border">
            {FAQ.map((item) => (
              <details key={item.q} className="group px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                  {item.q}
                  <span className="text-muted-foreground text-xl leading-none transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="text-muted-foreground mt-3 text-sm">{item.a}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Final CTA */}
      <section>
        <Reveal>
          <Card className="bg-primary text-primary-foreground items-center gap-4 border-0 px-6 py-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-balance">
              Your time is valuable. Tracking it shouldn&apos;t be.
            </h2>
            <p className="max-w-md opacity-90 text-pretty">
              Sign up in less time than it takes to find another tracker&apos;s pricing page.
            </p>
            <Button asChild size="lg" variant="secondary" className="mt-2">
              <Link href="/sign-up">Start the clock</Link>
            </Button>
          </Card>
        </Reveal>
      </section>

      <footer className="text-muted-foreground -mt-12 text-center text-xs">
        Made with free tiers and spite. No time trackers were harmed in the making of this page.
      </footer>
    </div>
  );
}
