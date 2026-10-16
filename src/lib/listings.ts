import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { properties, type Property, type PropertyType, type Purpose } from "@/data/properties";

export type ListingRow = Database["public"]["Tables"]["listings"]["Row"];

const fallbackImage = (type: string) =>
  properties.find((p) => p.type === type)?.images[0] ?? properties[0]!.images[0]!;

export function rowToProperty(r: ListingRow, urls: Record<string, string> = {}, verified = new Set<string>()): Property {
  const imgs = r.images.map((k) => urls[k]).filter((u): u is string => !!u);
  return {
    id: r.id,
    title: r.title,
    description: r.description_bn || r.description_en,
    type: r.type as PropertyType,
    purpose: r.purpose as Purpose,
    price: Number(r.price),
    negotiable: r.negotiable,
    division: r.division,
    city: r.city,
    area: r.area,
    address: [r.area, r.city].filter(Boolean).join(", "),
    beds: r.beds,
    baths: r.baths,
    size: r.size,
    sizeUnit: "sqft",
    parking: r.amenities.includes("Parking"),
    furnished: "Unfurnished",
    amenities: r.amenities,
    images: imgs.length ? imgs : [fallbackImage(r.type)],
    postedAt: r.created_at,
    status: r.status as "active" | "sold" | "rented",
    seller: { name: r.seller_name || "Owner", phone: r.seller_phone, verified: verified.has(r.owner_id), rating: 0, reviews: 0 },
  };
}

async function verifiedSet(ids: string[]): Promise<Set<string>> {
  const uniq = [...new Set(ids)];
  if (!uniq.length) return new Set();
  const { data } = await supabase.rpc("verified_sellers", { _ids: uniq });
  return new Set((data ?? []) as string[]);
}

export async function fetchActiveListings(): Promise<Property[]> {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  const rows = data ?? [];
  const [urls, ver] = await Promise.all([signImages(rows.flatMap((r) => r.images)), verifiedSet(rows.map((r) => r.owner_id))]);
  return rows.map((r) => rowToProperty(r, urls, ver));
}

export async function fetchListing(id: string): Promise<Property | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data } = await supabase.from("listings").select("*").eq("id", id).maybeSingle();
  if (!data) return null;
  const [urls, ver] = await Promise.all([signImages(data.images), verifiedSet([data.owner_id])]);
  return rowToProperty(data, urls, ver);
}

export const IMAGE_BUCKET = "listing-images";

export async function signImages(paths: string[]): Promise<Record<string, string>> {
  if (!paths.length) return {};
  const { data } = await supabase.storage.from(IMAGE_BUCKET).createSignedUrls(paths, 60 * 60 * 24 * 7);
  const out: Record<string, string> = {};
  for (const d of data ?? []) if (d.path && d.signedUrl) out[d.path] = d.signedUrl;
  return out;
}
