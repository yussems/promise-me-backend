import express, { type Router } from "express";
import { createUserSchema } from "@/api/user/userModel";
import { authenticateToken } from "@/common/middleware/authMiddleware";
import { validateRequest } from "@/common/utils/httpHandlers";
import { userController } from "./userController";

export const userRouter: Router = express.Router();

// Get user by ID
userRouter.get("/:id", authenticateToken, userController.findById);

userRouter.post("/auth/:authId", authenticateToken, validateRequest(createUserSchema), userController.createByAuthId);

userRouter.put("/auth/:authId", authenticateToken, validateRequest(createUserSchema), userController.updateByAuthId);
