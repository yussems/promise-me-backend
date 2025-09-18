import express, { type Router } from "express";
import { authenticateToken } from "@/common/middleware/authMiddleware";
import { friendshipController } from "./friendShipController";

export const friendShipRouter: Router = express.Router();

friendShipRouter.get("/", authenticateToken, friendshipController.getFriends);
