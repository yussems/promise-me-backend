import { Router } from "express";
import { authenticateToken } from "@/common/middleware/authMiddleware";
import { friendRequestController } from "./friendRequestController";

export const friendRequestRouter: Router = Router();

// POST /api/friend-request/send/:friendCode - Friend code ile arkadaşlık isteği gönder
friendRequestRouter.post(
	"/send/:friendCode",
	authenticateToken, // Auth middleware
	friendRequestController.sendByCode,
);
friendRequestRouter.get("/find-mine", authenticateToken, friendRequestController.findMine);
