import { createFileRoute } from "@tanstack/react-router";
import {
  CircuitBoard,
  Cpu,
  HardDrive,
  MemoryStick,
  MonitorSmartphone,
  PlugZap,
} from "lucide-react";
import { BookingChat } from "@/components/BookingChat";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "Book a Hardware Repair | Apex IT Consulting",
        description:
          "Chat with the Apex IT Consulting booking assistant to log your faulty hardware and get assigned to the right repair specialist in minutes.",
      },
      {
        property: "og:title",
        content: "Book a Hardware Repair | Apex IT Consulting",
      },
      {
        property: "og:description",
        content:
          "Chat with the Apex IT Consulting booking assistant to log your faulty hardware and get assigned to the right repair specialist in minutes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const CONSULTANTS = [
  {
    initials: "ND",
    name: "DODWANA",
    title: "Hardware Specialist",
    scope: "Storage drives & memory",
    icon: HardDrive,
  },
  {
    initials: "ND",
    name: "NOMBEKO",
    title: "Desktop Technician",
    scope: "Screens, displays & peripherals",
    icon: MonitorSmartphone,
  },
  {
    initials: "ND",
    name: "NOMBEKO",
    title: "Senior Hardware Engineer",
    scope: "Motherboards, power & diagnostics",
    icon: CircuitBoard,
  },
];

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(60rem 30rem at 15% -10%, color-mix(in oklch, var(--primary) 8%, transparent), transparent), radial-gradient(50rem 25rem at 110% 110%, color-mix(in oklch, var(--primary) 6%, transparent), transparent)",
        }}
      />
      <div className="relative mx-auto flex max-w-7xl flex-col gap-10 px-6 py-10 lg:h-screen lg:flex-row lg:items-stretch lg:gap-14 lg:py-14">
        <aside className="flex w-full flex-col justify-between gap-10 lg:max-w-md">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Cpu className="h-5 w-5" />
            </span>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
                NOMBEKO-S-LEGACY
                {"\u00a0"}IT CONSULTING
              </p>
              <p className="text-xs text-muted-foreground">
                Hardware repair desk
              </p>
            </div>
          </div>

          <div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground lg:text-5xl">
              Book your hardware repair in{" "}
              <span className="text-primary">minutes.</span>
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Our booking assistant collects your details, triages the fault
              and assigns the right specialist — no forms, no queues.
            </p>
          </div>

          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              Repair team
            </p>
            <ul className="mt-3 space-y-2.5">
              {CONSULTANTS.map((c) => (
                <li
                  key={c.name}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary font-mono text-xs font-semibold text-secondary-foreground">
                    {c.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      {c.name}
                      <span className="ml-2 font-normal text-muted-foreground">
                        {c.title}
                      </span>
                    </p>
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <c.icon className="h-3.5 w-3.5 text-primary" />
                      {c.scope}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Bookings are logged instantly in the repair queue with a unique
            reference. You'll receive your assigned consultant before the chat
            ends.
          </p>
        </aside>

        <main className="min-h-[70vh] flex-1 lg:min-h-0">
          <BookingChat />
        </main>
      </div>
    </div>
  );
}
