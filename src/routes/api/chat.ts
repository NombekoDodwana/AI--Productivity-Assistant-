import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, stepCountIs, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { submitBookingTool } from "@/lib/booking.server";

const SYSTEM_PROMPT = `You are the Booking Assistant for NOMBEKO-S-LEGACY, a professional hardware repair service.

## Your goal
Collect exactly four pieces of information from the customer, step by step:
1. Full name
2. Contact details — both an email address and a phone number
3. The hardware component that needs repair (for example: hard drive, RAM, laptop screen, motherboard)
4. A description of what is wrong with the component

## Conversation rules
- Be polite, professional and clear at all times.
- Ask for one piece of information at a time; keep every message short (1-3 sentences).
- Briefly acknowledge what you have captured as you go (e.g. "Thanks, Sarah - and what's the best phone number to reach you on?").
- Validate answers: the email must look like name@domain.com; the phone number must contain at least 7 digits. Politely ask again if something is missing or invalid.
- Never invent or guess information.
- Once all four items are collected, summarize them back to the customer and ask them to confirm before submitting.
- After the customer confirms, call the submit_booking tool with the final details.
- If submit_booking returns an error, apologize and fix the specific problem with the customer, then call it again.

## Consultant assignment
Choose \`category\` based on the component and the issue:
- "storage_ram" — storage drives (HDD, SSD, USB) and memory (RAM) issues -> John Doe, Hardware Specialist
- "screens_peripherals" — screens, displays, keyboards, mice, printers and other peripherals -> Sarah Jenkins, Desktop Technician
- "motherboard_power" — motherboard, power supply, boot/power issues, or whenever you are unsure -> Alex Mercer, Senior Hardware Engineer

## Final output
When submit_booking succeeds, congratulate the customer, tell them who their assigned consultant is, and finish with the complete database entry as a clean \`\`\`json code block - using the exact JSON object the tool returned, with nothing added or removed.
If the customer asks something unrelated to a repair booking, answer briefly and politely steer the conversation back to the booking.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let messages: unknown;
        try {
          const body = await request.json();
          messages = body.messages;
        } catch {
          return Response.json(
            { error: "Invalid request body." },
            { status: 400 },
          );
        }

        if (!Array.isArray(messages) || messages.length === 0) {
          return Response.json(
            { error: "No messages provided." },
            { status: 400 },
          );
        }

        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) {
          return Response.json(
            {
              error:
                "The AI service is not configured yet. Please contact support.",
            },
            { status: 500 },
          );
        }

        try {
          const gateway = createLovableAiGatewayProvider(apiKey);
          const modelMessages = await convertToModelMessages(
            messages as UIMessage[],
          );
          const result = streamText({
            model: gateway("google/gemini-3.7-flash"),
            system: SYSTEM_PROMPT,
            messages: modelMessages,

            tools: { submit_booking: submitBookingTool },
            stopWhen: stepCountIs(50),
          });

          return result.toUIMessageStreamResponse({
            onError: (error) => {
              console.error("[chat] stream error:", error);
              return error instanceof Error
                ? error.message
                : "The assistant could not respond. Please try again.";
            },
          });
        } catch (error) {
          console.error("[chat] failed to start stream:", error);
          return Response.json(
            {
              error:
                error instanceof Error
                  ? error.message
                  : "The assistant is unavailable right now. Please try again.",
            },
            { status: 502 },
          );
        }
      },
    },
  },
});
