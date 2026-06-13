import cron from "node-cron";
import { db, leadsTable, notificationsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { searchOverpass } from "./business-search";
import { logger } from "../lib/logger";

export const MAJOR_CITIES = [
  { city: "Austin", country: "US" },
  { city: "Dallas", country: "US" },
  { city: "Houston", country: "US" },
  { city: "Miami", country: "US" },
  { city: "Atlanta", country: "US" },
  { city: "Chicago", country: "US" },
  { city: "Phoenix", country: "US" },
  { city: "Denver", country: "US" },
  { city: "Seattle", country: "US" },
  { city: "Nashville", country: "US" },
  { city: "Portland", country: "US" },
  { city: "Las Vegas", country: "US" },
  { city: "Tampa", country: "US" },
  { city: "Orlando", country: "US" },
  { city: "San Antonio", country: "US" },
  { city: "London", country: "GB" },
  { city: "Manchester", country: "GB" },
  { city: "Birmingham", country: "GB" },
  { city: "Toronto", country: "CA" },
  { city: "Vancouver", country: "CA" },
  { city: "Sydney", country: "AU" },
  { city: "Melbourne", country: "AU" },
  { city: "Dubai", country: "AE" },
  { city: "Lagos", country: "NG" },
  { city: "Nairobi", country: "KE" },
  { city: "Cape Town", country: "ZA" },
  { city: "Johannesburg", country: "ZA" },
  { city: "Accra", country: "GH" },
  { city: "Singapore", country: "SG" },
  { city: "Kuala Lumpur", country: "MY" },
];

export const BUSINESS_CATEGORIES = [
  "restaurant",
  "cafe",
  "bar",
  "hotel",
  "salon",
  "barbershop",
  "gym",
  "clinic",
  "pharmacy",
  "dentist",
  "lawyer",
  "accountant",
  "bakery",
  "pizza",
  "mechanic",
  "plumber",
  "electrician",
  "tailor",
  "florist",
  "photographer",
];

interface SchedulerState {
  isRunning: boolean;
  lastRun: Date | null;
  nextRun: Date | null;
  currentCity: string | null;
  currentCategory: string | null;
  leadsFound: number;
  leadsCreated: number;
  citiesScanned: number;
  errors: string[];
  cityIndex: number;
  categoryIndex: number;
}

const state: SchedulerState = {
  isRunning: false,
  lastRun: null,
  nextRun: null,
  currentCity: null,
  currentCategory: null,
  leadsFound: 0,
  leadsCreated: 0,
  citiesScanned: 0,
  errors: [],
  cityIndex: 0,
  categoryIndex: 0,
};

export function getSchedulerState(): SchedulerState & { totalCities: number; totalCategories: number } {
  return {
    ...state,
    totalCities: MAJOR_CITIES.length,
    totalCategories: BUSINESS_CATEGORIES.length,
  };
}

async function runScanIteration(): Promise<void> {
  if (state.isRunning) return;

  const cityEntry = MAJOR_CITIES[state.cityIndex % MAJOR_CITIES.length]!;
  const category = BUSINESS_CATEGORIES[state.categoryIndex % BUSINESS_CATEGORIES.length]!;

  state.isRunning = true;
  state.currentCity = `${cityEntry.city}, ${cityEntry.country}`;
  state.currentCategory = category;
  state.lastRun = new Date();

  logger.info({ city: cityEntry.city, category }, "AutoScan: starting iteration");

  try {
    const results = await searchOverpass(category, cityEntry.city, cityEntry.country, false, 40);
    state.leadsFound += results.length;

    let created = 0;
    for (const biz of results) {
      if (!biz.businessName || biz.hasWebsite) continue;

      try {
        const existing = await db
          .select({ id: leadsTable.id })
          .from(leadsTable)
          .where(eq(leadsTable.placeId, biz.placeId!))
          .limit(1);

        if (existing.length > 0) continue;

        await db.insert(leadsTable).values({
          businessName: biz.businessName,
          businessType: biz.businessType,
          address: biz.address,
          city: biz.city,
          country: biz.country,
          phone: biz.phone,
          email: biz.email,
          website: biz.website,
          hasWebsite: biz.hasWebsite,
          leadScore: biz.leadScore,
          placeId: biz.placeId,
          googleMapsUrl: biz.googleMapsUrl,
          instagramUrl: biz.instagramUrl,
          facebookUrl: biz.facebookUrl,
          whatsappNumber: biz.whatsappNumber,
          crmStage: "new",
        });
        created++;
      } catch (err) {
        logger.warn({ err, biz: biz.businessName }, "AutoScan: failed to insert lead");
      }
    }

    state.leadsCreated += created;
    state.citiesScanned++;

    if (created > 0) {
      await db.insert(notificationsTable).values({
        type: "success",
        title: `AutoScan: ${created} new lead${created > 1 ? "s" : ""} found`,
        message: `Found ${created} businesses without websites in ${cityEntry.city} (${category}). Check your CRM!`,
        isRead: false,
      });
    }

    logger.info({ city: cityEntry.city, category, found: results.length, created }, "AutoScan: iteration complete");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    state.errors = [msg, ...state.errors].slice(0, 5);
    logger.error({ err, city: cityEntry.city, category }, "AutoScan: iteration failed");
  } finally {
    state.isRunning = false;
    state.currentCity = null;
    state.currentCategory = null;
    state.cityIndex = (state.cityIndex + 1) % MAJOR_CITIES.length;
    state.categoryIndex = (state.categoryIndex + 1) % BUSINESS_CATEGORIES.length;

    const next = new Date();
    next.setHours(next.getHours() + 2);
    state.nextRun = next;
  }
}

export async function triggerScan(city?: string, country?: string, categories?: string[]): Promise<void> {
  if (state.isRunning) return;

  const citiesToScan = city
    ? [{ city, country: country || "" }]
    : MAJOR_CITIES.slice(state.cityIndex, state.cityIndex + 3);

  const catsToScan = categories?.length ? categories : BUSINESS_CATEGORIES.slice(0, 5);

  state.isRunning = true;
  state.lastRun = new Date();

  try {
    for (const cityEntry of citiesToScan) {
      for (const cat of catsToScan) {
        state.currentCity = `${cityEntry.city}, ${cityEntry.country}`;
        state.currentCategory = cat;

        try {
          const results = await searchOverpass(cat, cityEntry.city, cityEntry.country, false, 30);
          state.leadsFound += results.length;

          let created = 0;
          for (const biz of results) {
            if (!biz.businessName || biz.hasWebsite) continue;
            const existing = await db.select({ id: leadsTable.id }).from(leadsTable)
              .where(eq(leadsTable.placeId, biz.placeId!)).limit(1);
            if (existing.length > 0) continue;
            await db.insert(leadsTable).values({
              businessName: biz.businessName,
              businessType: biz.businessType,
              address: biz.address,
              city: biz.city,
              country: biz.country,
              phone: biz.phone,
              email: biz.email,
              website: biz.website,
              hasWebsite: biz.hasWebsite,
              leadScore: biz.leadScore,
              placeId: biz.placeId,
              googleMapsUrl: biz.googleMapsUrl,
              instagramUrl: biz.instagramUrl,
              facebookUrl: biz.facebookUrl,
              whatsappNumber: biz.whatsappNumber,
              crmStage: "new",
            });
            created++;
          }
          state.leadsCreated += created;
          state.citiesScanned++;

          if (created > 0) {
            await db.insert(notificationsTable).values({
              type: "success",
              title: `AutoScan: ${created} new lead${created > 1 ? "s" : ""} found`,
              message: `Found ${created} businesses without websites in ${cityEntry.city} (${cat}).`,
              isRead: false,
            });
          }
        } catch (err) {
          logger.warn({ err, city: cityEntry.city, cat }, "AutoScan trigger: category failed");
        }
      }
    }
  } finally {
    state.isRunning = false;
    state.currentCity = null;
    state.currentCategory = null;
    const next = new Date();
    next.setHours(next.getHours() + 2);
    state.nextRun = next;
  }
}

let schedulerJob: ReturnType<typeof cron.schedule> | null = null;

export function startScheduler(): void {
  if (schedulerJob) return;
  const next = new Date();
  next.setHours(next.getHours() + 2);
  state.nextRun = next;

  schedulerJob = cron.schedule("0 */2 * * *", () => {
    runScanIteration().catch(err => logger.error({ err }, "AutoScan: scheduler error"));
  });

  logger.info("AutoScan scheduler started — runs every 2 hours");
}

export function stopScheduler(): void {
  if (schedulerJob) {
    schedulerJob.stop();
    schedulerJob = null;
    logger.info("AutoScan scheduler stopped");
  }
}
