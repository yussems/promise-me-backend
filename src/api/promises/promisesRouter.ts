import express, { type Router } from "express";
import { authenticateToken } from "@/common/middleware/authMiddleware";
import { validateRequest } from "@/common/utils/httpHandlers";
import { promisesController } from "./promisesController";
import { createPromiseSchema } from "./promisesModel";

export const promisesRouter: Router = express.Router();

//promisesRouter.post("/", authenticateToken, validateRequest(createPromiseSchema), promisesController.create);

promisesRouter.post("/", authenticateToken, promisesController.create);
