import type { Request, RequestHandler, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { httpHandler } from "@/common/utils/httpHandlers";
import { friendRequestService } from "./friendRequestService";

class FriendRequestController {
	sendByCode: RequestHandler = async (req: Request, res: Response) => {
		const fromUserId = req.user?.userId; // Auth middleware'den al
		const { friendCode } = req.params;

		if (!fromUserId) {
			return httpHandler(res, ServiceResponse.failure("User not found", null, StatusCodes.UNAUTHORIZED));
		}

		const result = await friendRequestService.sendFriendRequestByCode(fromUserId, friendCode);
		httpHandler(res, result);
	};
}

export const friendRequestController = new FriendRequestController();
