import { createServerFn } from "@tanstack/react-start";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText, Output } from "ai";
import { z } from "zod";
import { properties } from "@/data/properties";

const Input = z.object({
  query: z.string().trim().min(3).max(1000),
  lang: z.enum(["bn", "en"]),
});

const Result = z.object({
  matches: z.array(z.object({ id: z.string(), reason: z.string() })),
  summary: z.string(),
});

export const matchProperties = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { ok: false as const, error: "AI is not configured." };

    const catalog = properties.map((p) => ({
      id: p.id,
      title: p.title,
      type: p.type,
      purpose: p.purpose,
      priceBDT: p.price,
      negotiable: p.negotiable,
      location: `${p.area}, ${p.city}, ${p.division}`,
      beds: p.beds,
      baths: p.baths,
      size: `${p.size} ${p.sizeUnit}`,
      furnished: p.furnished,
      parking: p.parking,
      amenities: p.amenities,
    }));

    const lovable = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey: key,
      headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });

    try {
      const result = streamText({
        model: lovable.responses("openai/gpt-6-astra"),
        output: Output.object({ schema: Result }),
        system:
          "You are a Bangladesh real-estate matching assistant. Pick up to 5 listings from the catalog that best fit the buyer's needs, ordered best first. Only use ids from the catalog. Give each a one-sentence reason (max 25 words) and a 1-2 sentence overall summary. If nothing fits well, return the closest options and say so. " +
          (data.lang === "bn" ? "Write all reasons and the summary in Bangla." : "Write all reasons and the summary in English."),
        prompt: `Buyer needs: ${data.query}\n\nCatalog JSON:\n${JSON.stringify(catalog)}`,
        providerOptions: {
          openai: {
            forceReasoning: true,
            reasoningEffort: "low",
            reasoningSummary: "auto",
            store: false,
            include: ["reasoning.encrypted_content"],
          },
        },
      });
      const output = await result.output;
      const valid = new Set(properties.map((p) => p.id));
      return {
        ok: true as const,
        summary: output.summary,
        matches: output.matches.filter((m) => valid.has(m.id)),
      };
    } catch (err) {
      const status = (err as { statusCode?: number }).statusCode;
      if (status === 429) return { ok: false as const, error: "Too many requests — please try again shortly." };
      if (status === 402) return { ok: false as const, error: "AI credits are exhausted. Please add credits to continue." };
      console.error("matchProperties failed", err);
      return { ok: false as const, error: "Could not generate matches right now." };
    }
  });
