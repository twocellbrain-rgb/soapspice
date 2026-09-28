import { Router, type IRouter } from "express";
import healthRouter from "./health";
import ingredientsRouter from "./ingredients";
import recipesRouter from "./recipes";
import starterGuideRouter from "./starter-guide";

const router: IRouter = Router();

router.use(healthRouter);
router.use(ingredientsRouter);
router.use(recipesRouter);
router.use(starterGuideRouter);

export default router;
