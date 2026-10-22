import { Router, type IRouter } from "express";
import healthRouter from "./health";
import ingredientsRouter from "./ingredients";
import recipesRouter from "./recipes";
import soapmakingLibraryRouter from "./soapmaking-library";
import starterGuideRouter from "./starter-guide";
import calculatorIngredientProductsRouter from "./calculator-ingredient-products";

const router: IRouter = Router();

router.use(healthRouter);
router.use(ingredientsRouter);
router.use(recipesRouter);
router.use(soapmakingLibraryRouter);
router.use(starterGuideRouter);
router.use(calculatorIngredientProductsRouter);

export default router;
