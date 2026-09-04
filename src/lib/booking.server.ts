import { tool } from "ai";
import { z } from "zod";

export const BOOKING_CATEGORIES = [
  "storage_ram",
  "screens_peripherals",
  "motherboard_power",
  "unsure",
] as const;

type Category = (typeof BOOKING_CATEGORIES)[number];

const CONSULTANTS: Record<Category, { name: string; title: string }> = {
  storage_ram: { name: "John Doe", title: "Hardware Specialist" },
  screens_peripherals: { name: "Sarah Jenkins", title: "Desktop Technician" },
  motherboard_power: { name: "Alex Mercer", title: "Senior Hardware Engineer" },
  unsure: { name: "Alex Mercer", title: "Senior Hardware Engineer" },
};

export type BookingResult =
  | { ok: true; booking: Record<string, string> }
  | { ok: false; error: string };

export const submitBookingTool = tool({
  description:
    "Submit a completed hardware repair booking for an Apex IT Consulting customer. " +
    "Call this ONLY after you have collected all four pieces of information " +
    "(full name, email, phone, hardware component, issue description) AND the customer " +
    "has confirmed the details are correct.",
  inputSchema: z.object({
    full_name: z.string().describe("Customer's full name"),
    email: z.string().describe("Customer's email address"),
    phone: z.string().describe("Customer's phone number"),
    component: z.string().describe("The hardware component that needs repair"),
    issue_description: z.string().describe("What is wrong with the component"),
    category: z
      .enum(BOOKING_CATEGORIES)
      .describe(
        "Issue category: storage_ram for drives/memory, screens_peripherals for screens/keyboards/printers, motherboard_power for motherboard/power/boot issues, unsure when it does not clearly fit",
      ),
  }),
  execute: async (input): Promise<BookingResult> => {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.email.trim());
    const digits = input.phone.replace(/\D/g, "");
    if (!emailOk) {
      return {
        ok: false,
        error:
          "The email address is not valid. Ask the customer for a valid email like name@example.com, then call submit_booking again.",
      };
    }
    if (digits.length < 7) {
      return {
        ok: false,
        error:
          "The phone number is not valid (needs at least 7 digits). Ask the customer to re-confirm their phone number, then call submit_booking again.",
      };
    }

    const consultant = CONSULTANTS[input.category];

    try {
      const { supabaseAdmin } = await import(
        "@/integrations/supabase/client.server"
      );
      const { data, error } = await supabaseAdmin
        .from("bookings")
        .insert({
          full_name: input.full_name.trim(),
          email: input.email.trim(),
          phone: input.phone.trim(),
          component: input.component.trim(),
          issue_description: input.issue_description.trim(),
          category: input.category,
          consultant: consultant.name,
          consultant_title: consultant.title,
          status: "new",
        })
        .select("id, created_at")
        .single();

      if (error || !data) {
        console.error("[booking] insert failed:", error);
        return {
          ok: false,
          error:
            "The booking could not be saved. Apologize to the customer and try submitting again.",
        };
      }

      return {
        ok: true,
        booking: {
          reference: String(data.id).slice(0, 8).toUpperCase(),
          full_name: input.full_name.trim(),
          email: input.email.trim(),
          phone: input.phone.trim(),
          component: input.component.trim(),
          issue_description: input.issue_description.trim(),
          category: input.category,
          consultant: consultant.name,
          consultant_title: consultant.title,
          status: "new",
          created_at: String(data.created_at),
        },
      };
    } catch (e) {
      console.error("[booking] unexpected error:", e);
      return {
        ok: false,
        error:
          "The booking service is temporarily unavailable. Apologize to the customer and try again shortly.",
      };
    }
  },
});
