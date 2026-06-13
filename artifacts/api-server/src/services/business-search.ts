export interface BusinessData {
  businessName: string;
  businessType: string;
  address: string | null;
  city: string;
  country: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  hasWebsite: boolean;
  leadScore: number;
  placeId: string | null;
  googleMapsUrl: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  whatsappNumber: string | null;
  whatsappUrl: string | null;
  whatsappMessage: string | null;
  lat: number | null;
  lon: number | null;
}

export interface OverpassElement {
  type?: string;
  id?: number;
  tags?: Record<string, string>;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
}

export function formatPhoneForWhatsApp(phone: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7) return null;
  if (digits.startsWith("00")) return digits.slice(2);
  if (digits.startsWith("0") && digits.length <= 11) return "1" + digits.slice(1);
  return digits;
}

export function generateWhatsAppMessage(business: Pick<BusinessData, "businessName" | "businessType" | "hasWebsite">): string {
  const name = business.businessName;
  const type = business.businessType || "business";
  if (!business.hasWebsite) {
    return `Hi! I noticed ${name} doesn't have a website yet. I build professional websites for local businesses that get you more customers — starting at just $499. I'd love to show you a FREE mockup of what your ${type} website could look like. Interested? 🚀🌐`;
  }
  return `Hi! I came across ${name} online and think your ${type} could attract more customers with an upgraded website. I specialize in modern, fast, mobile-friendly sites. Would you be interested in a FREE redesign mockup to see what's possible? 🌐✨`;
}

export function computeLeadScore(hasWebsite: boolean, tags: Record<string, string>): number {
  let score = 50;
  if (!hasWebsite) score += 30;
  if (tags["phone"] || tags["contact:phone"]) score += 10;
  if (tags["email"] || tags["contact:email"]) score -= 5;
  if (tags["addr:city"] || tags["addr:street"]) score += 5;
  if (tags["contact:instagram"] || tags["contact:facebook"]) score += 5;
  return Math.min(100, Math.max(0, score));
}

export async function searchOverpass(
  query: string,
  city: string,
  country: string,
  hasWebsiteFilter: boolean | null | undefined,
  limit = 50
): Promise<BusinessData[]> {
  const safeCity = city.replace(/"/g, "");
  const safeQuery = query.replace(/"/g, "");

  const overpassQuery = `[out:json][timeout:25];
(
  area["name"="${safeCity}"]["boundary"="administrative"];
  area["name"="${safeCity}"]["place"~"city|town|village"];
)->.searchArea;
(
  node["name"~"${safeQuery}",i](area.searchArea);
  node["amenity"="${safeQuery.toLowerCase()}"](area.searchArea);
  node["shop"="${safeQuery.toLowerCase()}"](area.searchArea);
  way["amenity"="${safeQuery.toLowerCase()}"](area.searchArea);
  way["shop"="${safeQuery.toLowerCase()}"](area.searchArea);
);
out center ${limit};`;

  const resp = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(overpassQuery)}`,
    signal: AbortSignal.timeout(28000),
  });

  if (!resp.ok) throw new Error(`Overpass API error: ${resp.status}`);
  const data = await resp.json() as { elements?: OverpassElement[] };
  const elements = (data.elements ?? []) as OverpassElement[];

  const results: BusinessData[] = elements
    .filter(el => el.tags?.name)
    .map(el => {
      const tags = el.tags!;
      const lat = el.lat ?? el.center?.lat ?? null;
      const lon = el.lon ?? el.center?.lon ?? null;
      const website = tags["website"] || tags["contact:website"] || tags["url"] || null;
      const hasWebsite = !!website;
      const phone = tags["phone"] || tags["contact:phone"] || tags["contact:mobile"] || null;
      const email = tags["email"] || tags["contact:email"] || null;
      const addr = [
        tags["addr:housenumber"],
        tags["addr:street"],
      ].filter(Boolean).join(" ") || null;
      const businessType = tags["amenity"] || tags["shop"] || tags["office"] || tags["craft"] || query;
      const waPhone = formatPhoneForWhatsApp(phone);
      const busPartial = { businessName: tags["name"], businessType, hasWebsite };
      const waMsg = generateWhatsAppMessage(busPartial);
      const instagram = tags["contact:instagram"]
        ? (tags["contact:instagram"].startsWith("http") ? tags["contact:instagram"] : `https://instagram.com/${tags["contact:instagram"].replace("@", "")}`)
        : null;
      const facebook = tags["contact:facebook"]
        ? (tags["contact:facebook"].startsWith("http") ? tags["contact:facebook"] : `https://facebook.com/${tags["contact:facebook"]}`)
        : null;

      return {
        businessName: tags["name"],
        businessType,
        address: addr,
        city,
        country: country || null,
        phone,
        email,
        website,
        hasWebsite,
        leadScore: computeLeadScore(hasWebsite, tags),
        placeId: lat && lon ? `${lat},${lon}` : String(el.id ?? Math.random()),
        googleMapsUrl: lat && lon ? `https://maps.google.com/?q=${lat},${lon}` : null,
        instagramUrl: instagram,
        facebookUrl: facebook,
        whatsappNumber: waPhone,
        whatsappUrl: waPhone ? `https://wa.me/${waPhone}?text=${encodeURIComponent(waMsg)}` : null,
        whatsappMessage: waMsg,
        lat,
        lon,
      };
    })
    .filter(b => {
      if (hasWebsiteFilter === true) return b.hasWebsite;
      if (hasWebsiteFilter === false) return !b.hasWebsite;
      return true;
    });

  const seen = new Set<string>();
  return results.filter(b => {
    const key = b.businessName.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
