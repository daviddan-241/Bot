import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import dashboardRouter from "./dashboard";
import discoveryRouter from "./discovery";
import leadsRouter from "./leads";
import scannerRouter from "./scanner";
import generatorRouter from "./generator";
import proposalsRouter from "./proposals";
import settingsRouter from "./settings";
import notificationsRouter from "./notifications";
import autoscanRouter from "./autoscan";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(dashboardRouter);
router.use(discoveryRouter);
router.use(autoscanRouter);
router.use(leadsRouter);
router.use(scannerRouter);
router.use(generatorRouter);
router.use(proposalsRouter);
router.use(settingsRouter);
router.use(notificationsRouter);

export default router;
