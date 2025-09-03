import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { createPromisesSchema, PromisesSchema } from "./promisesModel";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { z } from "zod";
import { authenticateToken } from "@/common/middleware/authMiddleware";
import { promisesController } from "./promisesController";
import { validateRequest } from "@/common/utils/httpHandlers";

export const promiseRegistery = new OpenAPIRegistry();
export const promisesRouter: Router = express.Router();

promiseRegistery.register("Promises", PromisesSchema);

promiseRegistery.registerPath({
  method: "get",
  path: "/promises",
  responses: createApiResponse(z.array(PromisesSchema), "Success"),
});

promisesRouter.post(
  "/",
  //  authenticateToken,
  validateRequest(createPromisesSchema),
  promisesController.createPromise
);
