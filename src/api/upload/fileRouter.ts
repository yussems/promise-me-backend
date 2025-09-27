import express, { type Router } from "express";
import { authenticateToken } from "@/common/middleware/authMiddleware";
import { validateRequest } from "@/common/utils/httpHandlers";
import { fileController } from "./fileController";
import { createFileSchema } from "./fileModel";

export const fileRouter: Router = express.Router();

// Empty router - no routes defined
fileRouter.get("/:id/download", fileController.downloadFile);
