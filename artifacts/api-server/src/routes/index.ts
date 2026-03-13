import { Router, type IRouter } from "express";
import healthRouter from "./health";
import tasksRouter from "./tasks";
import notesRouter from "./notes";
import projectsRouter from "./projects";
import foldersRouter from "./folders";
import tagsRouter from "./tags";
import dailyPlansRouter from "./dailyPlans";
import preferencesRouter from "./preferences";
import memoriesRouter from "./memories";
import templatesRouter from "./templates";
import aiRouter from "./ai";
import stagingRouter from "./staging";

const router: IRouter = Router();

router.use(healthRouter);
router.use(tasksRouter);
router.use(notesRouter);
router.use(projectsRouter);
router.use(foldersRouter);
router.use(tagsRouter);
router.use(dailyPlansRouter);
router.use(preferencesRouter);
router.use(memoriesRouter);
router.use(templatesRouter);
router.use(aiRouter);
router.use(stagingRouter);

export default router;
