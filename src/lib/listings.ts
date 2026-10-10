import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { properties, type Property, type PropertyType, type Purpose } from "@/data/properties";

export type ListingRow = Database["public"]["Tables"]["listings"]["Row"];

const fallbackImage = (type: string) =>
  properties.find((p) => p.type === type)?.images[0] ?? properties[0]!.images[0]!;

export function rowToProperty(r: ListingRow): Property {
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
    images: [fallbackImage(r.type)],
    postedAt: r.created_at,
    status: r.status as "active" | "sold" | "rented",
    seller: { name: r.seller_name || "Owner", phone: r.seller_phone, verified: false, rating: 0, reviews: 0 },
  };
}

export async function fetchActiveListings(): Promise<Property[]> {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []).map(rowToProperty);
}

export async function fetchListing(id: string): Promise<Property | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data } = await supabase.from("listings").select("*").eq("id", id).maybeSingle();
  return data ? rowToProperty(data) : null;
}
