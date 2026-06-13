import { Router, type IRouter } from "express";
import { SearchBusinessesBody, AutoScanAreaBody } from "@workspace/api-zod";
import { searchOverpass } from "../services/business-search";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.post("/discovery/search", async (req, res): Promise<void> => {
  const parsed = SearchBusinessesBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { query, city, country = "", hasWebsite } = parsed.data;
  try {
    const results = await searchOverpass(query, city, country, hasWebsite, 60);
    res.json(results);
  } catch (err) {
    logger.error({ err }, "Business discovery error");
    res.json([]);
  }
});

router.post("/discovery/autoscan", async (req, res): Promise<void> => {
  const parsed = AutoScanAreaBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { city, country = "", categories = ["restaurant", "cafe", "salon", "clinic", "shop"] } = parsed.data;

  const allResults: Awaited<ReturnType<typeof searchOverpass>> = [];
  for (const cat of categories.slice(0, 6)) {
    try {
      const results = await searchOverpass(cat, city, country, null, 30);
      allResults.push(...results);
    } catch (err) {
      logger.warn({ err, cat }, "AutoScan category failed");
    }
  }

  const seen = new Set<string>();
  const unique = allResults.filter(b => {
    const key = b.businessName.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  res.json(unique);
});

export default router;
