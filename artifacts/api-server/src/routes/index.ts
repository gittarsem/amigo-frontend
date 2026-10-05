import { Router, type IRouter } from "express";
import amigoRouter from "./amigo";
import healthRouter from "./health";

const router: IRouter = Router();

router.use(healthRouter);
router.use(amigoRouter);

export default router;
