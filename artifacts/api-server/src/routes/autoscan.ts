import { Router, type IRouter } from "express";
import {
  getSchedulerState,
  triggerScan,
  MAJOR_CITIES,
  BUSINESS_CATEGORIES,
} from "../services/autoscan-scheduler";

const router: IRouter = Router();

router.get("/autoscan/status", (_req, res): void => {
  res.json(getSchedulerState());
});

router.get("/autoscan/cities", (_req, res): void => {
  res.json(MAJOR_CITIES);
});

router.get("/autoscan/categories", (_req, res): void => {
  res.json(BUSINESS_CATEGORIES);
});

router.post("/autoscan/trigger", async (req, res): Promise<void> => {
  const { city, country, categories } = req.body as {
    city?: string;
    country?: string;
    categories?: string[];
  };
  triggerScan(city, country, categories).catch(() => {});
  res.json({ message: "AutoScan triggered", running: true });
});

export default router;
