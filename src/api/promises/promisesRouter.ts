import express, { type Router } from "express";
import { authenticateToken } from "@/common/middleware/authMiddleware";
import { promisesController } from "./promisesController";

export const promisesRouter: Router = express.Router();

//promisesRouter.post("/", authenticateToken, validateRequest(createPromiseSchema), promisesController.create);

promisesRouter.post("/", authenticateToken, promisesController.create);
promisesRouter.get("/", authenticateToken, promisesController.findByUserId);
promisesRouter.get("/:id", authenticateToken, promisesController.findById);
