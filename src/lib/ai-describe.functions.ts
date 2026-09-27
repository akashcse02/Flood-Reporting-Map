import { createServerFn } from "@tanstack/react-start";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";

const Input = z.object({
  purpose: z.string().max(20),
  type: z.string().max(30),
  title: z.string().max(200).optional().default(""),
  notes: z.string().max(2000).optional().default(""),
  price: z.string().max(30).optional().default(""),
  negotiable: z.boolean().optional().default(false),
  location: z.string().max(200).optional().default(""),
  beds: z.string().max(10).optional().default(""),
  baths: z.string().max(10).optional().default(""),
  size: z.string().max(20).optional().default(""),
  amenities: z.array(z.string().max(60)).max(40).optional().default([]),
});

const Result = z.object({ bn: z.string(), en: z.string() });

export const generateDescription = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { ok: false as const, error: "AI is not configured." };

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
          "You write polished, trustworthy real-estate listing descriptions for a Bangladesh property marketplace. Produce two versions of the same description: 'bn' in natural, fluent Bangla and 'en' in clear English. Each 80-140 words, 2-3 short paragraphs, highlight location, layout, size, amenities and who it suits. Use only the facts given; never invent numbers, addresses or features. No emojis, no markdown headings.",
        prompt: `Property details:\n${JSON.stringify(data)}`,
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
      const out = await result.output;
      return { ok: true as const, bn: out.bn.trim(), en: out.en.trim() };
    } catch (err) {
      if (NoObjectGeneratedError.isInstance(err) && err.text) {
        try {
          const parsed = Result.parse(JSON.parse(err.text));
          return { ok: true as const, bn: parsed.bn, en: parsed.en };
        } catch {}
      }
      const status = (err as { statusCode?: number }).statusCode;
      if (status === 429) return { ok: false as const, error: "Too many requests — please try again shortly." };
      if (status === 402) return { ok: false as const, error: "AI credits are exhausted. Please add credits to continue." };
      if (status === 403) return { ok: false as const, error: "AI access is currently blocked for this workspace." };
      console.error("generateDescription failed", err);
      return { ok: false as const, error: "Could not generate a description right now." };
    }
  });
