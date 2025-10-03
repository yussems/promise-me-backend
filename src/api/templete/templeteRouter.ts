import express, { type Router } from "express";
import { authenticateToken } from "@/common/middleware/authMiddleware";
import { templeteController } from "./templeteController";

export const templeteRouter: Router = express.Router();

// Template routes
templeteRouter.get("/", templeteController.findAll);
