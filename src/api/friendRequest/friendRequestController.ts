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
	findMine: RequestHandler = async (req: Request, res: Response) => {
		const userId = req.user?.userId;
		const status = req.query.status as string; // Query parameter'dan al

		if (!userId) {
			return httpHandler(res, ServiceResponse.failure("User not found", null, StatusCodes.UNAUTHORIZED));
		}

		const result = await friendRequestService.findMineAsync(userId, status);
		httpHandler(res, result);
	};
	accept: RequestHandler = async (req: Request, res: Response) => {
		const userId = req.user?.userId;
		const { friendRequestId } = req.params;

		if (!userId) {
			return httpHandler(res, ServiceResponse.failure("User not found", null, StatusCodes.UNAUTHORIZED));
		}
		const result = await friendRequestService.acceptFriendRequest(friendRequestId);
		httpHandler(res, result);
	};
	reject: RequestHandler = async (req: Request, res: Response) => {
		const userId = req.user?.userId;
		const { friendRequestId } = req.params;

		if (!userId) {
			return httpHandler(res, ServiceResponse.failure("User not found", null, StatusCodes.UNAUTHORIZED));
		}
		const result = await friendRequestService.rejectFriendRequest(friendRequestId);
		httpHandler(res, result);
	};
	sendByPairingCode: RequestHandler = async (req: Request, res: Response) => {
		const userId = req.user?.userId;
		const { pairingCode } = req.params;
		if (!userId) {
			return httpHandler(res, ServiceResponse.failure("User not found", null, StatusCodes.UNAUTHORIZED));
		}
		const result = await friendRequestService.sendFriendRequestByPairingCode(userId, pairingCode);
		httpHandler(res, result);
	};
}

export const friendRequestController = new FriendRequestController();
